"""
═══════════════════════════════════════════════════════════════════════════════
MESSAGE URLS — Newsletter and contact endpoints.

URL routing for newsletter subscriptions, contact forms, broadcasts, and site
announcements. Mounted at /api/v1/messages/ in config/urls.py.

═══════════════════════════════════════════════════════════════════════════════
ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

Newsletter:
  POST   /newsletter/subscribe       - Subscribe to newsletter
  POST   /newsletter/confirm         - Confirm subscription (via email token)
  POST   /newsletter/unsubscribe     - Unsubscribe from newsletter
  GET    /newsletter/stats           - Newsletter statistics (admin)

Contact Form:
  POST   /contact                    - Submit contact form

Broadcast (Admin):
  POST   /broadcast/                 - Send email broadcast to course students

Announcements:
  GET    /announcements/active       - Get currently active announcement
  GET    /announcements/             - List all announcements (admin)
  POST   /announcements/             - Create announcement (admin)
  GET    /announcements/{id}/        - Get announcement details
  PUT    /announcements/{id}/        - Update announcement (admin)
  DELETE /announcements/{id}/        - Delete announcement (admin)

═══════════════════════════════════════════════════════════════════════════════
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
