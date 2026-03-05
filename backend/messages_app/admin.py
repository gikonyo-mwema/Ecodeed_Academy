from django.contrib import admin
from .models import NewsletterSubscriber, ContactMessage, EmailCampaign


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'status', 'source', 'subscribed_at', 'confirmed_at')
    list_filter = ('status', 'source')
    search_fields = ('email',)
    readonly_fields = ('token', 'subscribed_at', 'confirmed_at', 'unsubscribed_at')


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'subject')
    readonly_fields = ('created_at',)
    actions = ['mark_as_read']

    @admin.action(description='Mark selected messages as read')
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)


@admin.register(EmailCampaign)
class EmailCampaignAdmin(admin.ModelAdmin):
    list_display = ('subject', 'audience_type', 'status', 'recipient_count', 'sent_by', 'sent_at')
    list_filter = ('status', 'audience_type')
    search_fields = ('subject',)
    readonly_fields = ('sent_at', 'created_at', 'recipient_count')
