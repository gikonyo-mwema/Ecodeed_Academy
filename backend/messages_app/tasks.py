"""
═══════════════════════════════════════════════════════════════════════════════
CELERY TASKS — Asynchronous Email Processing

This module defines all background tasks for email sending. These run in Celery
workers instead of blocking the API, ensuring instant responses to users.

WHAT HAPPENS HERE:
──────────────────
1. Views detect that an email needs to be sent
2. Instead of sending immediately, they queue a Celery task
3. Task is added to Redis queue instantly (<100ms)
4. User gets "success" response while task waits in queue
5. Celery worker picks up task and processes it in the background
6. If task fails, it's automatically retried a few times
7. Results (sent/failed count) are stored in Redis

RETRY STRATEGY:
───────────────
- Transactional emails (1-to-1): 3 retries, exponential backoff
- Bulk emails (1-to-many): 2 retries, exponential backoff
- Contact form emails: 3 retries

MONITORING:
───────────
Use Flower (web dashboard) to see task status:
  docker-compose exec celery celery -A config flower
  Then visit http://localhost:5555

═══════════════════════════════════════════════════════════════════════════════
"""

import logging
from celery import shared_task
from django.conf import settings
from django.utils import timezone
from django.template.loader import render_to_string
from typing import Dict, List, Optional

# ✅ Import email utilities from messages_app
from messages_app.email_utils import (
    send_transactional_email,
    send_bulk_email,
    send_bulk_email_tracked,
    add_contact_to_brevo_list,
    remove_contact_from_brevo_list,
)

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# NEWSLETTER CONFIRMATION EMAIL TASK
# ═══════════════════════════════════════════════════════════════════════════════

@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,  # Wait 60 seconds before first retry
    time_limit=30,  # Hard limit: 30 seconds
)
def send_newsletter_confirmation_email(
    self,
    email: str,
    confirm_url: str,
    site_url: str,
):
    """
    Send newsletter confirmation email asynchronously.

    This task is queued when a user clicks "Subscribe" on the website.
    Since sending email can be slow (5+ seconds), we do it in the background.

    Args:
        email: Recipient email address
        confirm_url: URL with confirmation token (user clicks this link)
        site_url: Base URL of the website

    Returns:
        dict: {'success': bool, 'email': str, 'message': str}

    RETRY LOGIC:
    ───────────
    - If Brevo API fails: retry after 1 min, then 2 min, then 4 min
    - After 3 retries, task is marked as failed (logged as error)
    - Admin dashboard will show this failure
    """
    try:
        logger.info(f'[CELERY] Sending newsletter confirmation to {email}')

        # Render email template
        try:
            html_content = render_to_string('emails/newsletter_confirm.html', {
                'email': email,
                'confirm_url': confirm_url,
                'site_url': site_url,
            })
        except Exception as template_err:
            logger.warning(f'Newsletter template rendering failed: {template_err}')
            # Fallback to plain HTML
            html_content = (
                f'<h2>Confirm your subscription</h2>'
                f'<p>Please click the link below to confirm your Ecodeed '
                f'newsletter subscription:</p>'
                f'<p><a href="{confirm_url}">Confirm Subscription</a></p>'
                f'<p>If you did not request this, you can safely ignore this email.</p>'
            )

        # Send email via Brevo
        success = send_transactional_email(
            to_email=email,
            to_name=email.split('@')[0],
            subject='Confirm your Ecodeed newsletter subscription',
            html_content=html_content,
        )

        if success:
            logger.info(f'[CELERY] ✅ Newsletter confirmation sent to {email}')
            return {'success': True, 'email': email, 'message': 'Confirmation sent'}
        else:
            logger.warning(f'[CELERY] ⚠️  Newsletter confirmation failed for {email}')
            # Retry: exponential backoff (60s, 120s, 240s)
            raise self.retry(exc=Exception('Brevo API failed'), countdown=60 * (2 ** self.request.retries))

    except self.MaxRetriesExceededError:
        logger.error(f'[CELERY] ❌ Max retries exceeded for newsletter confirmation to {email}')
        return {'success': False, 'email': email, 'message': 'Failed after 3 retries'}
    except Exception as exc:
        logger.error(f'[CELERY] Error sending newsletter confirmation to {email}: {exc}')
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


# ═══════════════════════════════════════════════════════════════════════════════
# NEWSLETTER WELCOME EMAIL TASK (After Confirmation)
# ═══════════════════════════════════════════════════════════════════════════════

@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    time_limit=30,
)
def send_newsletter_welcome_email(
    self,
    email: str,
    unsubscribe_url: str,
    site_url: str,
):
    """
    Send welcome email after newsletter subscription is confirmed.

    This task runs after user clicks the confirmation link in their email.
    We also sync their email to Brevo's marketing list at this point.

    Args:
        email: Subscriber email address
        unsubscribe_url: URL to unsubscribe (includes unique token)
        site_url: Base URL

    Returns:
        dict: {'success': bool, 'email': str, 'synced_to_brevo': bool}
    """
    try:
        logger.info(f'[CELERY] Sending welcome email to {email}')

        # Render welcome email template
        try:
            html_content = render_to_string('emails/newsletter_welcome.html', {
                'email': email,
                'unsubscribe_url': unsubscribe_url,
                'site_url': site_url,
            })
        except Exception as template_err:
            logger.warning(f'Welcome email template failed: {template_err}')
            html_content = (
                f'<h2>Welcome to Ecodeed!</h2>'
                f'<p>Thank you for confirming your newsletter subscription.</p>'
                f'<p>You\'ll receive updates on new courses, environmental insights, and more.</p>'
                f'<p><a href="{unsubscribe_url}">Unsubscribe</a></p>'
            )

        # Send welcome email
        send_success = send_transactional_email(
            to_email=email,
            to_name=email.split('@')[0],
            subject='Welcome to the Ecodeed Newsletter!',
            html_content=html_content,
        )

        # Sync to Brevo for marketing campaigns
        brevo_success = add_contact_to_brevo_list(email)

        if send_success and brevo_success:
            logger.info(f'[CELERY] ✅ Welcome email and Brevo sync complete for {email}')
            return {'success': True, 'email': email, 'synced_to_brevo': True}
        elif send_success:
            # Email sent but Brevo sync failed — retry next time
            logger.warning(f'[CELERY] ⚠️  Email sent but Brevo sync failed for {email}')
            raise self.retry(exc=Exception('Brevo sync failed'), countdown=60)
        else:
            # Email send failed
            logger.warning(f'[CELERY] ⚠️  Welcome email failed for {email}')
            raise self.retry(exc=Exception('Brevo API failed'), countdown=60 * (2 ** self.request.retries))

    except self.MaxRetriesExceededError:
        logger.error(f'[CELERY] ❌ Max retries exceeded for welcome email to {email}')
        return {'success': False, 'email': email, 'synced_to_brevo': False}
    except Exception as exc:
        logger.error(f'[CELERY] Error in welcome email task for {email}: {exc}')
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


# ═══════════════════════════════════════════════════════════════════════════════
# CONTACT FORM EMAIL TASKS
# ═══════════════════════════════════════════════════════════════════════════════

@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    time_limit=30,
)
def send_contact_admin_notification(
    self,
    admin_email: str,
    admin_name: str,
    from_name: str,
    from_email: str,
    subject: str,
    message: str,
):
    """
    Send notification email to admin about new contact form submission.

    Args:
        admin_email: Admin's email address
        admin_name: Admin's display name
        from_name: Name of the person who submitted the form
        from_email: Email of the person who submitted the form
        subject: Subject from the form
        message: Message body from the form

    Returns:
        dict: {'success': bool, 'admin_email': str}
    """
    try:
        logger.info(f'[CELERY] Sending admin notification for new contact from {from_email}')

        admin_html = (
            f'<h3>New Contact Message</h3>'
            f'<p><strong>From:</strong> {from_name} ({from_email})</p>'
            f'<p><strong>Subject:</strong> {subject}</p>'
            f'<p>{message}</p>'
            f'<hr>'
            f'<p><small>Dashboard: <a href="{settings.SITE_URL.rstrip("/")}/admin">View all messages</a></small></p>'
        )

        success = send_transactional_email(
            to_email=admin_email,
            to_name=admin_name,
            subject=f'[Contact Form] {subject}',
            html_content=admin_html,
            reply_to_email=from_email,
        )

        if success:
            logger.info(f'[CELERY] ✅ Admin notification sent')
            return {'success': True, 'admin_email': admin_email}
        else:
            logger.warning(f'[CELERY] ⚠️  Admin notification failed')
            raise self.retry(exc=Exception('Brevo API failed'), countdown=60 * (2 ** self.request.retries))

    except self.MaxRetriesExceededError:
        logger.error(f'[CELERY] ❌ Max retries for admin notification')
        return {'success': False, 'admin_email': admin_email}
    except Exception as exc:
        logger.error(f'[CELERY] Error sending admin notification: {exc}')
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    time_limit=30,
)
def send_contact_confirmation(
    self,
    visitor_email: str,
    visitor_name: str,
    site_url: str,
):
    """
    Send auto-reply confirmation email to the person who submitted the form.

    Args:
        visitor_email: Email of the person who submitted the form
        visitor_name: Their name
        site_url: Base URL of the website

    Returns:
        dict: {'success': bool, 'visitor_email': str}
    """
    try:
        logger.info(f'[CELERY] Sending contact confirmation to {visitor_email}')

        try:
            html_content = render_to_string('emails/contact_confirmation.html', {
                'name': visitor_name,
                'site_url': site_url,
            })
        except Exception as template_err:
            logger.warning(f'Contact confirmation template failed: {template_err}')
            html_content = (
                f'<p>Hi {visitor_name},</p>'
                f'<p>Thank you for reaching out! We received your message and will '
                f'get back to you soon.</p>'
                f'<p>— The Ecodeed Team</p>'
            )

        success = send_transactional_email(
            to_email=visitor_email,
            to_name=visitor_name,
            subject='We received your message — Ecodeed',
            html_content=html_content,
        )

        if success:
            logger.info(f'[CELERY] ✅ Contact confirmation sent to {visitor_email}')
            return {'success': True, 'visitor_email': visitor_email}
        else:
            logger.warning(f'[CELERY] ⚠️  Contact confirmation failed')
            raise self.retry(exc=Exception('Brevo API failed'), countdown=60 * (2 ** self.request.retries))

    except self.MaxRetriesExceededError:
        logger.error(f'[CELERY] ❌ Max retries for contact confirmation')
        return {'success': False, 'visitor_email': visitor_email}
    except Exception as exc:
        logger.error(f'[CELERY] Error sending contact confirmation: {exc}')
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


# ═══════════════════════════════════════════════════════════════════════════════
# BULK EMAIL BROADCAST TASKS
# ═══════════════════════════════════════════════════════════════════════════════

@shared_task(
    bind=True,
    max_retries=2,  # Fewer retries for bulk sends (to avoid spending too long)
    default_retry_delay=120,  # 2-minute delay before retry
    time_limit=600,  # Hard limit: 10 minutes (large bulk sends can take time)
)
def send_bulk_broadcast(
    self,
    campaign_id: int,
    recipients: List[Dict],
    subject: str,
    html_content: str,
):
    """
    Send bulk email broadcast to multiple recipients.

    This is the main task that processes email campaigns. Since it can involve
    hundreds or thousands of recipients, it's perfect for Celery.

    Args:
        campaign_id: ID of the EmailCampaign record (for tracking)
        recipients: List of {'email': '...', 'name': '...'} dicts
        subject: Email subject line
        html_content: HTML body of the email

    Returns:
        dict: {'sent': int, 'failed': int, 'campaign_id': int}

    PERFORMANCE:
    ────────────
    - Sends in batches of 50 recipients per API call
    - Typical speed: 10-20 recipients per second
    - 100 recipients: ~5 seconds
    - 1000 recipients: ~50 seconds
    - All processing happens in background; user sees instant response

    NOTE:
    ─────
    Results stored in Redis for admin dashboard to check later.
    Per-recipient delivery status written to EmailDeliveryLog rows.
    """
    from messages_app.models import EmailCampaign, EmailDeliveryLog

    try:
        logger.info(f'[CELERY] Starting bulk broadcast campaign {campaign_id} to {len(recipients)} recipients')

        # Pre-create PENDING delivery rows for every recipient
        EmailDeliveryLog.objects.bulk_create(
            [
                EmailDeliveryLog(
                    campaign_id=campaign_id,
                    recipient_email=r['email'],
                    recipient_name=r.get('name', ''),
                    status=EmailDeliveryLog.DeliveryStatus.PENDING,
                )
                for r in recipients
            ],
            ignore_conflicts=True,  # safe to re-queue after a retry
        )

        # Send emails and get per-batch results
        result = send_bulk_email_tracked(
            recipients=recipients,
            subject=subject,
            html_content=html_content,
        )

        # Update delivery logs per batch
        now = timezone.now()
        for batch in result.get('batches', []):
            if batch['success']:
                EmailDeliveryLog.objects.filter(
                    campaign_id=campaign_id,
                    recipient_email__in=batch['emails'],
                ).update(status=EmailDeliveryLog.DeliveryStatus.SENT, sent_at=now)
            else:
                EmailDeliveryLog.objects.filter(
                    campaign_id=campaign_id,
                    recipient_email__in=batch['emails'],
                ).update(
                    status=EmailDeliveryLog.DeliveryStatus.FAILED,
                    error_message=batch['error'],
                )

        # Update campaign status in database
        try:
            campaign = EmailCampaign.objects.get(id=campaign_id)
            campaign.recipient_count = result['sent']
            campaign.status = (
                EmailCampaign.Status.SENT if result['failed'] == 0
                else EmailCampaign.Status.FAILED
            )
            campaign.sent_at = now
            campaign.save(update_fields=['recipient_count', 'status', 'sent_at'])
            logger.info(f'[CELERY] ✅ Campaign {campaign_id} complete: {result["sent"]} sent, {result["failed"]} failed')
        except EmailCampaign.DoesNotExist:
            logger.error(f'[CELERY] Campaign {campaign_id} not found in database')

        return {
            'sent': result['sent'],
            'failed': result['failed'],
            'campaign_id': campaign_id,
        }

    except Exception as exc:
        logger.error(f'[CELERY] Error in bulk broadcast for campaign {campaign_id}: {exc}')
        # Retry once after 2 minutes
        raise self.retry(exc=exc, countdown=120 * (2 ** self.request.retries))


# ═══════════════════════════════════════════════════════════════════════════════
# COURSE NOTIFICATION TASKS
# ═══════════════════════════════════════════════════════════════════════════════

@shared_task(
    bind=True,
    max_retries=2,
    default_retry_delay=120,
    time_limit=600,
)
def send_course_notification(
    self,
    course_id: int,
    instructor_name: str,
    recipients: List[Dict],
    subject: str,
    body: str,
):
    """
    Send course notification email to all enrolled students.

    Instructors use this to notify their class about deadlines, updates, etc.

    Args:
        course_id: ID of the course
        instructor_name: Name of the instructor (for logging)
        recipients: List of {'email': '...', 'name': '...'} student dicts
        subject: Email subject
        body: HTML email body

    Returns:
        dict: {'sent': int, 'failed': int, 'course_id': int}
    """
    try:
        logger.info(f'[CELERY] Sending course notification for course {course_id} from {instructor_name} to {len(recipients)} students')

        result = send_bulk_email(
            recipients=recipients,
            subject=subject,
            html_content=body,
        )

        logger.info(f'[CELERY] ✅ Course notification complete: {result["sent"]} sent, {result["failed"]} failed')

        return {
            'sent': result['sent'],
            'failed': result['failed'],
            'course_id': course_id,
        }

    except Exception as exc:
        logger.error(f'[CELERY] Error in course notification for course {course_id}: {exc}')
        raise self.retry(exc=exc, countdown=120 * (2 ** self.request.retries))


# ═══════════════════════════════════════════════════════════════════════════════
# BREVO LIST SYNC TASKS
# ═══════════════════════════════════════════════════════════════════════════════

@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=120,
    time_limit=30,
)
def sync_unsubscribe_to_brevo(self, email: str):
    """
    Remove a contact from Brevo's newsletter list asynchronously.

    Called after a subscriber unsubscribes. Failures are retried so the
    Brevo list stays in sync even when the API is temporarily unavailable.

    Args:
        email: Subscriber's email address

    Returns:
        dict: {'success': bool, 'email': str}
    """
    try:
        logger.info(f'[CELERY] Syncing unsubscribe to Brevo for {email}')
        success = remove_contact_from_brevo_list(email)
        if success:
            logger.info(f'[CELERY] ✅ Brevo unsubscribe sync complete for {email}')
            return {'success': True, 'email': email}
        else:
            logger.warning(f'[CELERY] ⚠️  Brevo unsubscribe sync failed for {email}')
            raise self.retry(
                exc=Exception('remove_contact_from_brevo_list returned False'),
                countdown=120 * (2 ** self.request.retries),
            )
    except self.MaxRetriesExceededError:
        logger.error(f'[CELERY] ❌ Max retries exceeded for Brevo unsubscribe sync for {email}')
        return {'success': False, 'email': email}
    except Exception as exc:
        logger.error(f'[CELERY] Error in Brevo unsubscribe sync for {email}: {exc}')
        raise self.retry(exc=exc, countdown=120 * (2 ** self.request.retries))


# ═══════════════════════════════════════════════════════════════════════════════
# HOUSEKEEPING TASKS (Optional, can be triggered via Celery Beat)
# ═══════════════════════════════════════════════════════════════════════════════

@shared_task
def cleanup_old_task_results():
    """
    Periodically clean up old Celery task results from Redis.

    This can be scheduled to run daily to prevent Redis from growing unbounded.
    Set up with Celery Beat (advanced, optional).

    REDIS MEMORY:
    ─────────────
    Results expire automatically after CELERY_RESULT_EXPIRES (default: 1 hour).
    This task is just a safety valve if Redis cleanup fails for some reason.
    """
    logger.info('[CELERY] Running housekeeping: cleanup_old_task_results')
    # This is a placeholder; actual cleanup is handled by Redis TTL
    return {'status': 'cleanup_scheduled'}
