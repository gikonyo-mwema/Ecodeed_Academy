"""
URL configuration for the Messages & Newsletter app.

These URLs are mounted at /api/v1/messages/ in config/urls.py
"""

from django.urls import path
from . import views

app_name = 'messages_app'

urlpatterns = [
    # Newsletter
    path('newsletter/subscribe', views.newsletter_subscribe, name='newsletter-subscribe'),
    path('newsletter/confirm', views.newsletter_confirm, name='newsletter-confirm'),
    path('newsletter/unsubscribe', views.newsletter_unsubscribe, name='newsletter-unsubscribe'),
    path('newsletter/stats', views.newsletter_stats, name='newsletter-stats'),

    # Contact form
    path('contact', views.contact_create, name='contact-create'),

    # Broadcast (admin)
    path('broadcast/', views.broadcast, name='broadcast'),

    # Announcements
    path('announcements/active', views.announcement_active, name='announcement-active'),
    path('announcements/', views.announcement_list_create, name='announcement-list-create'),
    path('announcements/<int:pk>/', views.announcement_detail, name='announcement-detail'),
]
