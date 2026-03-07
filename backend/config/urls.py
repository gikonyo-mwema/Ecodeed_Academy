"""
URL Configuration for Ecodeed Academy Backend.

This module defines the root URL patterns for the Django application.
It includes routes for the admin interface, API documentation (Swagger/ReDoc),
authentication endpoints, and serves media/static files in development.

URL Structure:
    - /admin/: Django admin interface
    - /swagger/: Swagger API documentation UI
    - /redoc/: ReDoc API documentation UI
    - /api/v1/auth/: User authentication and registration endpoints
    - /api/v1/auth/social/: Social authentication endpoints
    - /api/v1/posts/: Blog posts CRUD
    - /api/v1/comments/: Blog & lesson comments
    - /api/v1/courses/: Courses & enrollments
    - /api/v1/services/: Services
    - /api/v1/payments/: Payment verification & webhooks
    - /api/v1/messages/: Contact, newsletter & broadcast

Note:
    Media and static files are only served by Django in DEBUG mode.
    In production, these should be served by a web server like Nginx.
"""

from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.http import HttpResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from posts.feeds import LatestPostsFeed, LatestPostsAtomFeed, CategoryPostsFeed
from posts.sitemaps import SITEMAPS

# Configure Swagger/OpenAPI documentation schema
schema_view = get_schema_view(
    openapi.Info(
        title="Ecodeed API",
        default_version='v1',
        description="API for Ecodeed Platform",
        terms_of_service="https://www.ecodeedconsulting.com/terms/",
        contact=openapi.Contact(email="info@ecodeed.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

def robots_txt(request):
    """Serve robots.txt with sitemap reference."""
    lines = [
        "User-agent: *",
        "Allow: /",
        "",
        "# Disallow API and admin",
        "Disallow: /api/",
        "Disallow: /admin/",
        "Disallow: /swagger/",
        "Disallow: /redoc/",
        "",
        f"Sitemap: {request.scheme}://{request.get_host()}/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")


urlpatterns = [
    # SEO: feeds, sitemap, robots
    path('feed/rss/', LatestPostsFeed(), name='rss-feed'),
    path('feed/atom/', LatestPostsAtomFeed(), name='atom-feed'),
    path('feed/rss/category/<slug:slug>/', CategoryPostsFeed(), name='rss-feed-category'),
    path('sitemap.xml', sitemap, {'sitemaps': SITEMAPS}, name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', robots_txt, name='robots-txt'),

    # Admin interface
    path('admin/', admin.site.urls),

    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # ── Versioned API (v1) ──────────────────────────────────────
    # All endpoints live under /api/v1/ for consistent versioning.
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/', include('posts.urls')),
    path('api/v1/comments/', include('comments.urls')),
    path('api/v1/', include('courses.urls')),
    path('api/v1/', include('services.urls')),
    path('api/v1/payments/', include('payments.urls')),
    path('api/v1/messages/', include('messages_app.urls')),

    # dj_rest_auth: token refresh/verify, password reset
    path('api/v1/auth/jwt/', include('dj_rest_auth.urls')),
    path('api/v1/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/v1/auth/social/', include('allauth.socialaccount.urls')),
]

# Serve media and static files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
