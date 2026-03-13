"""
═══════════════════════════════════════════════════════════════════════════════
POST URLS — Blog post management endpoints.

URL configuration for blog content including posts, comments, categories, tags,
and image uploads. All endpoints mounted under /api/v1/ in config/urls.py.

═══════════════════════════════════════════════════════════════════════════════
ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

Posts:
  GET    /posts/                    - List published posts (paginated)
  POST   /posts/                    - Create post (admin)
  GET    /posts/{id}/               - Get post details
  PUT    /posts/{id}/               - Update post (admin/author)
  DELETE /posts/{id}/               - Delete post (admin/author)
  GET    /posts/stats/              - Admin dashboard stats
  GET    /posts/trending/           - Top posts by views
  GET    /posts/{id}/recommended/   - Get recommended posts (same category)
  POST   /posts/{id}/like/          - Like/unlike post

Categories:
  GET    /categories/               - List all categories (public)
  POST   /categories/               - Create category (admin)
  GET    /categories/{id}/          - Get category details
  PUT    /categories/{id}/          - Update category (admin)
  DELETE /categories/{id}/          - Delete category (admin)

Tags:
  GET    /tags/                     - List all tags (read-only)
  GET    /tags/{id}/                - Get tag details

Images:
  POST   /upload/upload             - Upload post image

═══════════════════════════════════════════════════════════════════════════════
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, PostViewSet, TagViewSet, UploadImageView

# ── Versioned router (v1) ──────────────────────────────────────────
router_v1 = DefaultRouter()
router_v1.register(r"posts", PostViewSet, basename="posts")
router_v1.register(r"categories", CategoryViewSet, basename="categories")
router_v1.register(r"tags", TagViewSet, basename="tags")

# ── URL patterns ───────────────────────────────────────────────────
urlpatterns = [
    # ── Versioned API (v1) ─────────────────────────────────────────
    path("", include(router_v1.urls)),
    path("upload/upload", UploadImageView.as_view(), name="v1-image-upload"),
]
