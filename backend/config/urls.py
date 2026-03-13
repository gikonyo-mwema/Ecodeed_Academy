"""
═══════════════════════════════════════════════════════════════════════════════
ECODEED ACADEMY BACKEND - ROOT URL CONFIGURATION

Main URL router for the Django application. Organizes all endpoints into 
logical groups and manages URL versioning (v1).

═══════════════════════════════════════════════════════════════════════════════
URL STRUCTURE & API ORGANIZATION
═══════════════════════════════════════════════════════════════════════════════

The API follows RESTful principles with semantic versioning:

┌─ ADMIN INTERFACE
│  /admin/                          - Django admin panel
│
├─ API DOCUMENTATION
│  /swagger/                        - Swagger UI (OpenAPI 3.0)
│  /redoc/                          - ReDoc API documentation
│
├─ API VERSION 1 (/api/v1/)
│  │
│  ├─ Authentication & Users
│  │  /auth/                        - User auth endpoints
│  │  /auth/users/                  - User management
│  │  /auth/profile/                - User profile
│  │  /auth/social/                 - Social authentication
│  │  /auth/jwt/                    - JWT token management
│  │  /auth/registration/           - User registration
│  │
│  ├─ Content Management
│  │  /posts/                       - Blog posts CRUD
│  │  /posts/{id}/stats/            - Post statistics
│  │  /comments/                    - Comments (posts & lessons)
│  │
│  ├─ Course Management
│  │  /courses/                     - Course list/create
│  │  /courses/{id}/                - Course detail
│  │  /courses/{id}/weeks/          - Course weeks structure
│  │  /courses/{id}/modules/        - Course modules
│  │  /enrollments/                 - Student enrollments
│  │  /enrollments/my-courses/      - My enrolled courses
│  │
│  ├─ Services & Features
│  │  /services/                    - Services list
│  │
│  ├─ Payments
│  │  /payments/history/            - Payment history
│  │  /payments/verify-payment/     - Verify Paystack payment
│  │  /payments/webhook/            - Paystack webhook
│  │
│  └─ Communications
│     /messages/contact/            - Contact form
│     /messages/newsletter/         - Newsletter signup
│     /messages/broadcast/          - Broadcast messages (admin)
│
├─ SEO & FEEDS
│  /feed/rss/                      - RSS feed
│  /feed/atom/                     - Atom feed
│  /feed/rss/category/{slug}/      - Category RSS
│  /sitemap.xml                    - XML sitemap
│  /robots.txt                     - Robots.txt
│
└─ STATIC & MEDIA (Dev Only)
   /media/                          - User uploads (development)
   /static/                         - Static files (development)

═══════════════════════════════════════════════════════════════════════════════
API VERSIONING STRATEGY
═══════════════════════════════════════════════════════════════════════════════

All API endpoints are prefixed with /api/v1/ to enable future versioning:

Current: /api/v1/
Future:  /api/v2/ (if major breaking changes occur)

This allows:
- Backward compatibility while maintaining old API versions
- Gradual migration of clients to new API versions
- Multiple versions running in parallel

═════════════════════════════════════════════════════════════════════════════
AUTHENTICATION & PERMISSIONS
═════════════════════════════════════════════════════════════════════════════

JWT Token Flow:
1. POST /auth/login/ → Returns {access, refresh} tokens
2. Use 'access' token in Authorization: Bearer header
3. Access token expires in 15 mins
4. Use 'refresh' token to get new access token
5. Refresh token expires in 7 days

Social Authentication:
- POST /auth/social/google/ - Google OAuth
- POST /auth/social/facebook/ - Facebook OAuth

Permission Levels:
- Anonymous: Read public posts, courses
- Authenticated: Read/write own profile, enroll in courses
- Instructor: Create/manage courses
- Admin: Manage users, content, payments

═════════════════════════════════════════════════════════════════════════════
DOCUMENTATION GENERATION
═════════════════════════════════════════════════════════════════════════════

The API documentation is auto-generated from:
- View docstrings
- Serializer field definitions
- Permission classes

Endpoints:
- /swagger/ - Interactive Swagger UI (try-it-out)
- /redoc/   - Readable ReDoc documentation
- /schema.json - OpenAPI 3.0 schema (programmatic access)

In production, documentation is restricted to admins.
In development (DEBUG=True), documentation is public.

═════════════════════════════════════════════════════════════════════════════
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

# ════════════════════════════════════════════════════════════════════════════════
# SWAGGER/OPENAPI DOCUMENTATION CONFIGURATION
# ════════════════════════════════════════════════════════════════════════════════
# 
# In development: Documentation is public and accessible to all
# In production: Documentation restricted to staff/admin users
# 
# The schema view provides:
# - Swagger UI: Interactive API explorer with try-it-out feature
# - ReDoc: Developer-friendly documentation
# - OpenAPI 3.0 schema: Machine-readable API specification

_docs_permission = (permissions.AllowAny,) if settings.DEBUG else (permissions.IsAdminUser,)

schema_view = get_schema_view(
    openapi.Info(
        title="Ecodeed API",
        default_version='v1',
        description="API for Ecodeed Platform",
        terms_of_service="https://www.ecodeedconsulting.com/terms/",
        contact=openapi.Contact(email="info@ecodeed.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=settings.DEBUG,
    permission_classes=_docs_permission,
)

def robots_txt(request):
    """
    ROBOTS.TXT ENDPOINT
    
    Serves the robots.txt file for search engine crawlers.
    This file controls which parts of the site can be indexed:
    
    - Allows: Public pages (posts, courses)
    - Disallows: API, admin, documentation (unless needed for SEO)
    - References: Sitemap for efficient crawling
    
    Returns:
      HTTP Response with text/plain content type containing robots rules
    """
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


# ════════════════════════════════════════════════════════════════════════════════
# ROOT URL PATTERNS
# ════════════════════════════════════════════════════════════════════════════════

urlpatterns = [
    # ──────────────────────────────────────────────────────────────────────────
    # SEO: FEEDS, SITEMAP, ROBOTS
    # ──────────────────────────────────────────────────────────────────────────
    # Provides RSS/Atom feeds and sitemaps for SEO
    
    path('feed/rss/', LatestPostsFeed(), name='rss-feed'),
    path('feed/atom/', LatestPostsAtomFeed(), name='atom-feed'),
    path('feed/rss/category/<slug:slug>/', CategoryPostsFeed(), name='rss-feed-category'),
    path('sitemap.xml', sitemap, {'sitemaps': SITEMAPS}, name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', robots_txt, name='robots-txt'),

    # ──────────────────────────────────────────────────────────────────────────
    # ADMIN INTERFACE
    # ──────────────────────────────────────────────────────────────────────────
    
    path('admin/', admin.site.urls),

    # ──────────────────────────────────────────────────────────────────────────
    # API DOCUMENTATION
    # ──────────────────────────────────────────────────────────────────────────
    # Interactive and readable API documentation
    
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # ──────────────────────────────────────────────────────────────────────────
    # API V1 ENDPOINTS (Versioned)
    # ──────────────────────────────────────────────────────────────────────────
    # All API endpoints are grouped under /api/v1/ for consistent versioning
    
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/', include('posts.urls')),
    path('api/v1/comments/', include('comments.urls')),
    path('api/v1/', include('courses.urls')),
    path('api/v1/', include('services.urls')),
    path('api/v1/payments/', include('payments.urls')),
    path('api/v1/messages/', include('messages_app.urls')),

    # JWT Token Management (from dj-rest-auth)
    # Handles token refresh and verification
    path('api/v1/auth/jwt/', include('dj_rest_auth.urls')),
    path('api/v1/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/v1/auth/social/', include('allauth.socialaccount.urls')),
]

# Serve media and static files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
