"""
Models for the Messages & Newsletter app.

Models:
    - NewsletterSubscriber: Tracks email newsletter subscriptions with 
      double opt-in support, source tracking, and unique unsubscribe tokens.
    - ContactMessage: Stores contact form submissions from the website.
    - EmailCampaign: Tracks broadcast emails sent by admins/instructors.
"""

import uuid
from django.db import models
from django.conf import settings


class NewsletterSubscriber(models.Model):
    """
    Stores newsletter subscriber information.

    Supports double opt-in: subscribers start as 'pending' and become
    'active' after confirming via email link. Each subscriber gets a
    unique token used for confirmation and unsubscribe links.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Confirmation'
        ACTIVE = 'active', 'Active'
        UNSUBSCRIBED = 'unsubscribed', 'Unsubscribed'

    email = models.EmailField(unique=True, db_index=True)
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    source = models.CharField(
        max_length=50,
        blank=True,
        default='website',
        help_text='Where the subscriber signed up (e.g. homepage, blog, footer)',
    )
    # Optional FK — links to a registered user if they subscribe while logged in
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='newsletter_subscriptions',
    )
    subscribed_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-subscribed_at']
        verbose_name = 'Newsletter Subscriber'
        verbose_name_plural = 'Newsletter Subscribers'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['-subscribed_at']),
        ]

    def __str__(self):
        return f"{self.email} ({self.status})"


class ContactMessage(models.Model):
    """
    Stores contact-form submissions from the website.
    """

    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['is_read']),
        ]

    def __str__(self):
        return f"{self.name} — {self.subject}"


class EmailCampaign(models.Model):
    """
    Tracks bulk / broadcast emails sent by admins or instructors.
    """

    class AudienceType(models.TextChoices):
        ALL_USERS = 'all_users', 'All Users'
        ALL_STUDENTS = 'all_students', 'All Students'
        ALL_MENTORS = 'all_mentors', 'All Mentors'
        NEWSLETTER_SUBSCRIBERS = 'newsletter', 'Newsletter Subscribers'
        COURSE_STUDENTS = 'course_students', 'Students in a Course'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SENDING = 'sending', 'Sending'
        SENT = 'sent', 'Sent'
        FAILED = 'failed', 'Failed'

    subject = models.CharField(max_length=255)
    body = models.TextField(help_text='HTML email body')
    audience_type = models.CharField(max_length=25, choices=AudienceType.choices)
    # If audience_type is COURSE_STUDENTS, store the course id
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='email_campaigns',
    )
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_campaigns',
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    recipient_count = models.PositiveIntegerField(default=0)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Email Campaign'
        verbose_name_plural = 'Email Campaigns'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.subject} ({self.status})"
