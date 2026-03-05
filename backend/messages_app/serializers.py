"""
Serializers for the Messages & Newsletter app.
"""

from rest_framework import serializers
from .models import NewsletterSubscriber, ContactMessage, EmailCampaign


class NewsletterSubscribeSerializer(serializers.Serializer):
    """Validates the email submitted from the subscribe form."""
    email = serializers.EmailField()
    source = serializers.CharField(max_length=50, required=False, default='website')


class NewsletterUnsubscribeSerializer(serializers.Serializer):
    """Validates the token used for unsubscription."""
    token = serializers.UUIDField()


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    """Full representation of a subscriber (admin use)."""

    class Meta:
        model = NewsletterSubscriber
        fields = [
            'id', 'email', 'status', 'source',
            'subscribed_at', 'confirmed_at', 'unsubscribed_at',
        ]
        read_only_fields = fields


class ContactMessageSerializer(serializers.ModelSerializer):
    """Validates and creates a contact form submission."""

    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']


class ContactMessageListSerializer(serializers.ModelSerializer):
    """Read-only list representation for admin (includes is_read)."""

    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'email', 'subject', 'message',
            'is_read', 'created_at',
        ]
        read_only_fields = fields


class EmailCampaignCreateSerializer(serializers.ModelSerializer):
    """Used when an admin/instructor creates a new broadcast."""

    class Meta:
        model = EmailCampaign
        fields = [
            'id', 'subject', 'body', 'audience_type', 'course',
            'status', 'recipient_count', 'sent_at', 'created_at',
        ]
        read_only_fields = ['id', 'status', 'recipient_count', 'sent_at', 'created_at']


class EmailCampaignListSerializer(serializers.ModelSerializer):
    """Read-only representation of past campaigns."""
    sent_by_email = serializers.EmailField(source='sent_by.email', read_only=True)

    class Meta:
        model = EmailCampaign
        fields = [
            'id', 'subject', 'audience_type', 'status',
            'recipient_count', 'sent_by_email', 'sent_at', 'created_at',
        ]
        read_only_fields = fields
