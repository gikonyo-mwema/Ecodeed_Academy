"""
URL Configuration for Ecodeed Academy Backend.

This module defines the root URL patterns for the Django application.
It includes routes for the admin interface, API documentation (Swagger/ReDoc),
authentication endpoints, and serves media/static files in development.

URL Structure:
    - /admin/: Django admin interface
    - /swagger/: Swagger API documentation UI
    - /redoc/: ReDoc API documentation UI
    - /api/auth/: User authentication and registration endpoints
    - /api/auth/social/: Social authentication endpoints

Note:
    Media and static files are only served by Django in DEBUG mode.
    In production, these should be served by a web server like Nginx.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

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

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),

    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # Authentication endpoints
    path('api/auth/', include('users.urls')),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/social/', include('allauth.socialaccount.urls')),
]

# Serve media and static files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
