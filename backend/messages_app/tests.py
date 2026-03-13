"""
Tests for the Messages & Newsletter app.
"""

from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from .models import NewsletterSubscriber, ContactMessage


class NewsletterSubscribeTests(TestCase):
    """Tests for the newsletter subscribe endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/messages/newsletter/subscribe'

    def test_subscribe_new_email(self):
        resp = self.client.post(self.url, {'email': 'test@example.com'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            NewsletterSubscriber.objects.filter(email='test@example.com').exists()
        )

    def test_subscribe_duplicate_email(self):
        self.client.post(self.url, {'email': 'dup@example.com'}, format='json')
        resp = self.client.post(self.url, {'email': 'dup@example.com'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_subscribe_invalid_email(self):
        resp = self.client.post(self.url, {'email': 'not-an-email'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resubscribe_after_unsubscribe(self):
        self.client.post(self.url, {'email': 'resub@example.com'}, format='json')
        sub = NewsletterSubscriber.objects.get(email='resub@example.com')
        sub.status = NewsletterSubscriber.Status.UNSUBSCRIBED
        sub.save()
        resp = self.client.post(self.url, {'email': 'resub@example.com'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        sub.refresh_from_db()
        self.assertEqual(sub.status, NewsletterSubscriber.Status.ACTIVE)


class NewsletterUnsubscribeTests(TestCase):
    """Tests for the newsletter unsubscribe endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.subscriber = NewsletterSubscriber.objects.create(
            email='unsub@example.com',
            status=NewsletterSubscriber.Status.ACTIVE,
        )
        self.url = '/api/messages/newsletter/unsubscribe'

    def test_unsubscribe_with_valid_token(self):
        resp = self.client.get(self.url, {'token': str(self.subscriber.token)})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.subscriber.refresh_from_db()
        self.assertEqual(self.subscriber.status, NewsletterSubscriber.Status.UNSUBSCRIBED)

    def test_unsubscribe_with_invalid_token(self):
        resp = self.client.get(self.url, {'token': '00000000-0000-0000-0000-000000000000'})
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_unsubscribe_missing_token(self):
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class ContactMessageTests(TestCase):
    """Tests for the contact form endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/messages/contact'

    def test_create_contact_message(self):
        data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'subject': 'Inquiry',
            'message': 'I have a question about your courses.',
        }
        resp = self.client.post(self.url, data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ContactMessage.objects.filter(email='john@example.com').exists())

    def test_create_contact_message_missing_fields(self):
        resp = self.client.post(self.url, {'email': 'john@example.com'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
