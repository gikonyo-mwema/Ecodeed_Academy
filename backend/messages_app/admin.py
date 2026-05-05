"""
═══════════════════════════════════════════════════════════════════════════════
MESSAGE ADMIN — Django admin configuration for messaging features.

Provides admin interface for managing newsletter subscriptions, contact form
submissions, email campaigns, and site announcements.

═══════════════════════════════════════════════════════════════════════════════
ADMIN CLASSES
═══════════════════════════════════════════════════════════════════════════════

NewsletterSubscriberAdmin:
  - List Display: Email, status (subscribed/unsubscribed),
    source, subscription date, confirmation date
  - Filters: Status, source (website/email/form)
  - Search: By email address
  - Read-only: Unsubscribe token, dates

ContactMessageAdmin:
  - List Display: Name, email, subject, read status, date
  - Filters: Read status, submission date
  - Search: Name, email, subject
  - Actions: Mark as read (bulk)
  - Read-only: Submission date

EmailCampaignAdmin:
  - List Display: Subject, audience type (students/instructors/all),
    status, recipient count, sender, send date
  - Filters: Status, audience type
  - Search: By subject
  - Read-only: Send date, creation date, recipient count

AnnouncementAdmin:
  - List Display: Text, active status, link URL, timestamps
  - Filters: Active status
  - Inline Editing: Toggle active status from list view
  - Search: By announcement text

═══════════════════════════════════════════════════════════════════════════════
BULK ACTIONS
═══════════════════════════════════════════════════════════════════════════════

Contact Messages:
  - Mark as read: Set is_read=true for bulk message processing

═══════════════════════════════════════════════════════════════════════════════
"""

from django.contrib import admin
from .models import NewsletterSubscriber, ContactMessage, EmailCampaign, EmailDeliveryLog, Announcement


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    """
    NewsletterSubscriberAdmin — Admin interface for newsletter subscribers.
    
    Manages newsletter subscription list including subscription status
    and confirmation tracking.
    
    List Display:
      - email: Subscriber email
      - status: Subscription status (subscribed/unsubscribed)
      - source: How they subscribed (website, email, form)
      - subscribed_at: Subscription date
      - confirmed_at: Email confirmation date
    
    Features:
      - Filters: By status and source
      - Search: By email address
      - Read-only: Unsubscribe token, dates
    
    @admin NewsletterSubscriberAdmin
    """
    list_display = ('email', 'status', 'source', 'subscribed_at', 'confirmed_at')
    list_filter = ('status', 'source')
    search_fields = ('email',)
    readonly_fields = ('token', 'subscribed_at', 'confirmed_at', 'unsubscribed_at')


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    """
    ContactMessageAdmin — Admin interface for contact form submissions.
    
    Manages incoming contact form messages from website visitors.
    Includes read status tracking and bulk marking.
    
    List Display:
      - name: Sender name
      - email: Sender email
      - subject: Message subject
      - is_read: Read status flag
      - created_at: Submission date
    
    Features:
      - Filters: By read status and submission date
      - Search: Name, email, subject
      - Bulk Action: Mark as read
      - Read-only: Submission date
    
    Actions:
      - mark_as_read(): Set is_read=true for selected messages
    
    @admin ContactMessageAdmin
    """
    list_display = ('name', 'email', 'subject', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'subject')
    readonly_fields = ('created_at',)
    actions = ['mark_as_read']

    @admin.action(description='Mark selected messages as read')
    def mark_as_read(self, request, queryset):
        """
        Bulk action: Mark selected contact messages as read.
        
        Sets is_read=true for all selected messages,
        indicating they have been reviewed by admin.
        """
        queryset.update(is_read=True)


@admin.register(EmailCampaign)
class EmailCampaignAdmin(admin.ModelAdmin):
    """
    EmailCampaignAdmin — Admin interface for broadcast email campaigns.
    
    Manages email broadcasts sent to course students or all subscribers.
    Tracks campaign status, recipient count, and send dates.
    
    List Display:
      - subject: Campaign subject line
      - audience_type: Target audience (students/instructors/all)
      - status: Campaign status (draft/sent/failed)
      - recipient_count: Total recipients
      - sent_by: Campaign creator
      - sent_at: Send date/time
    
    Features:
      - Filters: By status and audience type
      - Search: By subject line
      - Read-only: Send date, creation date, recipient count
    
    @admin EmailCampaignAdmin
    """
    list_display = ('subject', 'audience_type', 'status', 'recipient_count', 'sent_by', 'sent_at')
    list_filter = ('status', 'audience_type')
    search_fields = ('subject',)
    readonly_fields = ('sent_at', 'created_at', 'recipient_count')


class EmailDeliveryLogInline(admin.TabularInline):
    model = EmailDeliveryLog
    extra = 0
    readonly_fields = ('recipient_email', 'recipient_name', 'status', 'error_message', 'sent_at', 'created_at')
    can_delete = False
    show_change_link = False
    fields = ('recipient_email', 'recipient_name', 'status', 'error_message', 'sent_at')


EmailCampaignAdmin.inlines = [EmailDeliveryLogInline]


@admin.register(EmailDeliveryLog)
class EmailDeliveryLogAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'recipient_email', 'status', 'sent_at', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('recipient_email', 'campaign__subject')
    readonly_fields = ('campaign', 'recipient_email', 'recipient_name', 'status', 'error_message', 'sent_at', 'created_at')
    ordering = ('-created_at',)


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    """
    AnnouncementAdmin — Admin interface for site announcements.
    
    Manages site-wide announcement banner displayed to all users.
    Allows toggling active status and managing announcement content.
    
    List Display:
      - text: Announcement text
      - is_active: Active status (displayed to users)
      - link_url: Optional link URL
      - created_at: Creation date
      - updated_at: Last modification date
    
    Features:
      - Filters: By active status
      - Inline Editing: Toggle active status from list
      - Search: By announcement text
    
    @admin AnnouncementAdmin
    """
    list_display = ('text', 'is_active', 'link_url', 'created_at', 'updated_at')
    list_filter = ('is_active',)
    list_editable = ('is_active',)
    search_fields = ('text',)
