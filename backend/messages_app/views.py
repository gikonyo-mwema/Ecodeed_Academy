"""
Views for the Messages & Newsletter app.

Endpoints (matching the frontend API contracts):
    POST   /api/messages/newsletter/subscribe   — subscribe an email
    GET    /api/messages/newsletter/unsubscribe  — unsubscribe via token
    GET    /api/messages/newsletter/stats        — admin-only subscriber stats
    POST   /api/messages/contact                 — submit a contact form
    POST   /api/messages/broadcast/              — admin sends a broadcast email
    GET    /api/messages/broadcast/              — admin lists past campaigns
    POST   /api/courses/<id>/notify/             — instructor notifies enrolled students
                                                   (defined in courses app or routed here)
"""

import logging
from django.conf import settings
from django.utils import timezone
from django.template.loader import render_to_string
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .throttles import ContactFormThrottle, NewsletterSubscribeThrottle

from .models import NewsletterSubscriber, EmailCampaign, Announcement
from .serializers import (
    NewsletterSubscribeSerializer,
    ContactMessageSerializer,
    EmailCampaignCreateSerializer,
    EmailCampaignListSerializer,
    AnnouncementSerializer,
)
from .email_utils import (
    send_transactional_email,
    send_bulk_email,
    add_contact_to_brevo_list,
    remove_contact_from_brevo_list,
)

# ═══════════════════════════════════════════════════════════════════════════════
# CELERY ASYNC EMAIL TASKS
# ═══════════════════════════════════════════════════════════════════════════════
# Import Celery tasks for async email processing.
# Instead of waiting for emails to send (5-20 seconds), we queue the tasks
# in Redis and return instantly. Celery workers process emails in background.
# See messages_app/tasks.py for task implementations and documentation.

from .tasks import (
    send_newsletter_confirmation_email,
    send_newsletter_welcome_email,
    send_contact_admin_notification,
    send_contact_confirmation,
    send_bulk_broadcast,
    send_course_notification,
    sync_unsubscribe_to_brevo,
)

logger = logging.getLogger(__name__)


# ────────────────────────────────────────────────────────────────────
# Newsletter Subscribe
# ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([NewsletterSubscribeThrottle])
def newsletter_subscribe(request):
    """
    Start the double opt-in flow.

    1. Create subscriber as PENDING (or re-use existing pending row).
    2. Send a confirmation email with a unique token link.
    3. Subscriber becomes ACTIVE only after clicking that link.

    Expected payload:  { "email": "...", "source": "homepage" }
    Frontend calls:    POST /api/messages/newsletter/subscribe
    """
    serializer = NewsletterSubscribeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email'].lower()
    source = serializer.validated_data.get('source', 'website')

    subscriber, created = NewsletterSubscriber.objects.get_or_create(
        email=email,
        defaults={
            'source': source,
            'status': NewsletterSubscriber.Status.PENDING,
            'user': request.user if request.user.is_authenticated else None,
        },
    )

    if not created:
        if subscriber.status == NewsletterSubscriber.Status.ACTIVE:
            return Response(
                {'message': 'You are already subscribed!'},
                status=status.HTTP_200_OK,
            )
        # PENDING or UNSUBSCRIBED → reset to PENDING and re-send confirmation
        subscriber.status = NewsletterSubscriber.Status.PENDING
        subscriber.unsubscribed_at = None
        subscriber.confirmed_at = None
        subscriber.save(update_fields=['status', 'unsubscribed_at', 'confirmed_at'])

    # Build confirmation link
    site_url = settings.SITE_URL.rstrip('/')
    confirm_url = f"{site_url}/newsletter/confirm?token={subscriber.token}"

    try:
        html_content = render_to_string('emails/newsletter_confirm.html', {
            'email': email,
            'confirm_url': confirm_url,
            'site_url': site_url,
        })
    except Exception:
        html_content = (
            f'<h2>Confirm your subscription</h2>'
            f'<p>Please click the link below to confirm your Ecodeed '
            f'newsletter subscription:</p>'
            f'<p><a href="{confirm_url}">Confirm Subscription</a></p>'
            f'<p>If you did not request this, you can safely ignore this email.</p>'
        )

    # ─────────────────────────────────────────────────────────────────────────────
    # ASYNC: Queue email task instead of sending synchronously
    # ─────────────────────────────────────────────────────────────────────────────
    # This call returns instantly (adds task to Redis queue).
    # Celery worker will process the email in the background.
    # Even if Brevo is slow or network issues occur, user still gets instant response.
    
    send_newsletter_confirmation_email.delay(
        email=email,
        confirm_url=confirm_url,
        site_url=site_url,
    )

    # ✅ Return success immediately (task is queued, not yet sent)
    # User doesn't wait for email delivery
    return Response(
        {'message': 'Please check your email to confirm your subscription.'},
        status=status.HTTP_201_CREATED,
    )


# ────────────────────────────────────────────────────────────────────
# Newsletter Unsubscribe
# ────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def newsletter_unsubscribe(request):
    """
    Unsubscribe via unique token.

    Frontend calls:  GET /api/messages/newsletter/unsubscribe?token=<uuid>
    """
    token = request.query_params.get('token')
    if not token:
        return Response(
            {'message': 'Missing unsubscribe token.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        subscriber = NewsletterSubscriber.objects.get(token=token)
    except (NewsletterSubscriber.DoesNotExist, ValueError):
        return Response(
            {'message': 'Invalid or expired unsubscribe link.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if subscriber.status == NewsletterSubscriber.Status.UNSUBSCRIBED:
        return Response(
            {'message': 'You have already been unsubscribed.'},
            status=status.HTTP_200_OK,
        )

    subscriber.status = NewsletterSubscriber.Status.UNSUBSCRIBED
    subscriber.unsubscribed_at = timezone.now()
    subscriber.save(update_fields=['status', 'unsubscribed_at'])

    # Remove from Brevo list asynchronously (retried on failure)
    sync_unsubscribe_to_brevo.delay(subscriber.email)

    return Response(
        {'message': 'You have been successfully unsubscribed.'},
        status=status.HTTP_200_OK,
    )


# ────────────────────────────────────────────────────────────────────
# Newsletter Confirm (Double Opt-In)
# ────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def newsletter_confirm(request):
    """
    Complete the double opt-in flow.

    The subscriber clicks a link in their confirmation email which hits:
        GET /api/messages/newsletter/confirm?token=<uuid>

    On success the subscriber status flips to ACTIVE, a welcome email
    is sent, and the contact is synced to Brevo.
    """
    token = request.query_params.get('token')
    if not token:
        return Response(
            {'message': 'Missing confirmation token.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        subscriber = NewsletterSubscriber.objects.get(token=token)
    except (NewsletterSubscriber.DoesNotExist, ValueError):
        return Response(
            {'message': 'Invalid or expired confirmation link.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if subscriber.status == NewsletterSubscriber.Status.ACTIVE:
        return Response(
            {'message': 'Your subscription is already confirmed!'},
            status=status.HTTP_200_OK,
        )

    # Activate
    subscriber.status = NewsletterSubscriber.Status.ACTIVE
    subscriber.confirmed_at = timezone.now()
    subscriber.save(update_fields=['status', 'confirmed_at'])

    # Build unsubscribe URL
    site_url = settings.SITE_URL.rstrip('/')
    unsubscribe_url = f"{site_url}/unsubscribe?token={subscriber.token}"

    # ─────────────────────────────────────────────────────────────────────────────
    # ASYNC: Queue welcome email task + Brevo sync (all in one Celery task)
    # ─────────────────────────────────────────────────────────────────────────────
    # The task handles:
    #   1. Render welcome email template
    #   2. Send via Brevo API
    #   3. Add contact to Brevo list (for future marketing campaigns)
    #   4. Automatic retry if temporary failures occur
    # All happens in background after this endpoint returns.
    
    send_newsletter_welcome_email.delay(
        email=subscriber.email,
        unsubscribe_url=unsubscribe_url,
        site_url=site_url,
    )

    return Response(
        {'message': 'Your subscription has been confirmed! Welcome aboard 🌿'},
        status=status.HTTP_200_OK,
    )


# ────────────────────────────────────────────────────────────────────
# Newsletter Stats (Admin)
# ────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def newsletter_stats(request):
    """
    Return subscriber statistics for the admin dashboard.

    Frontend calls:  GET /api/messages/newsletter/stats
    Expected response shape (matching DashNewsletter.jsx):
    {
      "data": {
        "totalSubscribers": <int>,
        "totalUnsubscribed": <int>,
        "recentSubscribers": [ { "_id": ..., "email": ..., "subscribedAt": ..., "source": ... } ]
      }
    }
    """
    total_active = NewsletterSubscriber.objects.filter(
        status=NewsletterSubscriber.Status.ACTIVE,
    ).count()
    total_unsubscribed = NewsletterSubscriber.objects.filter(
        status=NewsletterSubscriber.Status.UNSUBSCRIBED,
    ).count()

    recent = NewsletterSubscriber.objects.filter(
        status=NewsletterSubscriber.Status.ACTIVE,
    ).order_by('-subscribed_at')[:20]

    recent_data = [
        {
            '_id': str(sub.id),
            'email': sub.email,
            'subscribedAt': sub.subscribed_at.isoformat(),
            'source': sub.source,
        }
        for sub in recent
    ]

    return Response({
        'data': {
            'totalSubscribers': total_active,
            'totalUnsubscribed': total_unsubscribed,
            'recentSubscribers': recent_data,
        }
    })


# ────────────────────────────────────────────────────────────────────
# Contact Form
# ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([ContactFormThrottle])
def contact_create(request):
    """
    Save a contact form submission and send notification emails asynchronously.

    Frontend calls:  POST /api/messages/contact
    Payload: { "name": ..., "email": ..., "subject": ..., "message": ... }
    
    ASYNC PROCESSING:
    ────────────────
    Two emails are sent in parallel via Celery tasks:
      1. Admin notification (with reply-to set to visitor's email)
      2. Confirmation email to the visitor
    User gets instant response without waiting for email delivery.
    """
    serializer = ContactMessageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    contact = serializer.save()

    # ─────────────────────────────────────────────────────────────────────────────
    # ASYNC: Queue admin notification email
    # ─────────────────────────────────────────────────────────────────────────────
    send_contact_admin_notification.delay(
        admin_email=settings.ADMIN_CONTACT_EMAIL,
        admin_name=settings.ADMIN_CONTACT_NAME,
        from_name=contact.name,
        from_email=contact.email,
        subject=contact.subject,
        message=contact.message,
    )

    # ─────────────────────────────────────────────────────────────────────────────
    # ASYNC: Queue visitor confirmation email
    # ─────────────────────────────────────────────────────────────────────────────
    send_contact_confirmation.delay(
        visitor_email=contact.email,
        visitor_name=contact.name,
        site_url=settings.SITE_URL,
    )

    # ✅ Return success immediately (both tasks queued, emails sent in background)
    return Response(
        {'message': 'Your message has been sent successfully!'},
        status=status.HTTP_201_CREATED,
    )


# ────────────────────────────────────────────────────────────────────
# Email Broadcast (Admin)
# ────────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def broadcast(request):
    """
    GET  — list past email campaigns.
    POST — create and send a new broadcast.

    POST payload:
    {
        "subject": "...",
        "body": "<html>...</html>",
        "audience_type": "all_students" | "all_users" | "newsletter" | "course_students",
        "course": <course_id>   (required only when audience_type == "course_students")
    }
    
    ASYNC PROCESSING:
    ────────────────
    Instead of waiting for all emails to send (can take minutes), we:
      1. Create the campaign record with status='SENDING'
      2. Queue the send_bulk_broadcast Celery task
      3. Return instantly to admin
      4. Celery worker processes emails in background
      5. Campaign status updated to 'SENT' or 'FAILED' when complete
    Admin can check campaign status in dashboard without waiting.
    """
    if request.method == 'GET':
        campaigns = EmailCampaign.objects.select_related('sent_by').all()
        serializer = EmailCampaignListSerializer(campaigns, many=True)
        return Response(serializer.data)

    # POST — create & queue async send
    serializer = EmailCampaignCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    scheduled_at = serializer.validated_data.get('scheduled_at')
    initial_status = EmailCampaign.Status.SCHEDULED if scheduled_at else EmailCampaign.Status.SENDING
    campaign = serializer.save(sent_by=request.user, status=initial_status)

    recipients = _resolve_audience(campaign)

    if not recipients:
        campaign.status = EmailCampaign.Status.FAILED
        campaign.save(update_fields=['status'])
        return Response(
            {'message': 'No recipients found for the selected audience.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ─────────────────────────────────────────────────────────────────────────────
    # ASYNC: Queue bulk broadcast task to Celery
    # ─────────────────────────────────────────────────────────────────────────────
    # The task will:
    #   1. Send emails in batches of 50 to Brevo API
    #   2. Track sent/failed counts per recipient in EmailDeliveryLog
    #   3. Update campaign status in database when complete
    #   4. Retry if temporary failures occur
    # If scheduled_at is set, Celery will delay execution until that time (eta).
    
    task_kwargs = dict(
        campaign_id=campaign.id,
        recipients=recipients,
        subject=campaign.subject,
        html_content=campaign.body,
    )
    if scheduled_at:
        send_bulk_broadcast.apply_async(kwargs=task_kwargs, eta=scheduled_at)
    else:
        send_bulk_broadcast.delay(**task_kwargs)

    # ✅ Return success immediately (campaign queued, not yet sent)
    # Admin can see campaign with status='SENDING'/'SCHEDULED' and check back later
    if scheduled_at:
        msg = f"Broadcast scheduled for {scheduled_at.strftime('%Y-%m-%d %H:%M UTC')} — {len(recipients)} recipients."
        resp_status = 'SCHEDULED'
    else:
        msg = f"Broadcast queued for {len(recipients)} recipients. Check campaign status in dashboard."
        resp_status = 'SENDING'

    return Response(
        {
            'message': msg,
            'campaign_id': campaign.id,
            'recipients_count': len(recipients),
            'status': resp_status,
        },
        status=status.HTTP_201_CREATED,
    )


def _resolve_audience(campaign):
    """
    Resolve the recipient list based on the campaign's audience_type.
    Returns a list of dicts: [{'email': '...', 'name': '...'}]
    """
    from django.contrib.auth import get_user_model
    from courses.models import Enrollment

    User = get_user_model()

    audience = campaign.audience_type

    if audience == EmailCampaign.AudienceType.ALL_USERS:
        users = User.objects.filter(is_active=True)
    elif audience == EmailCampaign.AudienceType.ALL_STUDENTS:
        users = User.objects.filter(is_active=True, user_type='STUDENT')
    elif audience == EmailCampaign.AudienceType.ALL_MENTORS:
        users = User.objects.filter(is_active=True, user_type='MENTOR')
    elif audience == EmailCampaign.AudienceType.COURSE_STUDENTS:
        if not campaign.course_id:
            return []
        enrolled_user_ids = (
            Enrollment.objects
            .filter(course_id=campaign.course_id, status='active')
            .values_list('user_id', flat=True)
        )
        users = User.objects.filter(id__in=enrolled_user_ids, is_active=True)
    elif audience == EmailCampaign.AudienceType.NEWSLETTER_SUBSCRIBERS:
        subscribers = (
            NewsletterSubscriber.objects
            .filter(status=NewsletterSubscriber.Status.ACTIVE)
            .values_list('email', flat=True)
        )
        return [{'email': email, 'name': ''} for email in subscribers]
    else:
        return []

    return [
        {'email': u.email, 'name': u.get_full_name()}
        for u in users
    ]


# ────────────────────────────────────────────────────────────────────
# Course Notification (Instructor)
# ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
def course_notify_students(request, course_id):
    """
    Instructor sends a notification email to all enrolled students of a course.

    URL:     POST /api/courses/<course_id>/notify/
    Payload: { "subject": "...", "body": "<html>...</html>" }

    Only the course instructor or an admin can use this endpoint.
    """
    from courses.models import Course, Enrollment

    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response(
            {'message': 'Course not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Permission: only course instructor or admin/staff
    user = request.user
    if not (user.is_staff or user.is_superuser or course.instructor_id == user.id):
        return Response(
            {'message': 'You do not have permission to send notifications for this course.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    subject = request.data.get('subject', '').strip()
    body = request.data.get('body', '').strip()

    if not subject or not body:
        return Response(
            {'message': 'Subject and body are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Get enrolled students
    enrolled_user_ids = (
        Enrollment.objects
        .filter(course_id=course_id, status='active')
        .values_list('user_id', flat=True)
    )
    from django.contrib.auth import get_user_model
    User = get_user_model()
    students = User.objects.filter(id__in=enrolled_user_ids, is_active=True)

    if not students.exists():
        return Response(
            {'message': 'No active students enrolled in this course.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    recipients = [
        {'email': s.email, 'name': s.get_full_name()}
        for s in students
    ]

    # Record as a campaign
    campaign = EmailCampaign.objects.create(
        subject=subject,
        body=body,
        audience_type=EmailCampaign.AudienceType.COURSE_STUDENTS,
        course=course,
        sent_by=user,
        status=EmailCampaign.Status.SENDING,
    )

    result = send_bulk_email(
        recipients=recipients,
        subject=subject,
        html_content=body,
    )

    campaign.recipient_count = result['sent']
    campaign.status = (
        EmailCampaign.Status.SENT if result['failed'] == 0
        else EmailCampaign.Status.FAILED
    )
    campaign.sent_at = timezone.now()
    campaign.save(update_fields=['recipient_count', 'status', 'sent_at'])

    return Response(
        {
            'message': f"Notification sent to {result['sent']} students.",
            'sent': result['sent'],
            'failed': result['failed'],
        },
        status=status.HTTP_201_CREATED,
    )


# ────────────────────────────────────────────────────────────────────
# Announcements
# ────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def announcement_active(request):
    """
    Return the latest active announcement (public).
    Called by the Header component on every page load.
    """
    ann = Announcement.objects.filter(is_active=True).first()
    if not ann:
        return Response(None, status=status.HTTP_204_NO_CONTENT)
    return Response(AnnouncementSerializer(ann).data)


@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def announcement_list_create(request):
    """
    GET  — list all announcements (admin).
    POST — create a new announcement (admin).
    """
    if request.method == 'GET':
        qs = Announcement.objects.all()
        return Response(AnnouncementSerializer(qs, many=True).data)

    serializer = AnnouncementSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def announcement_detail(request, pk):
    """
    PUT/PATCH — update an announcement (admin).
    DELETE   — remove an announcement (admin).
    """
    try:
        ann = Announcement.objects.get(pk=pk)
    except Announcement.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        ann.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = AnnouncementSerializer(ann, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
