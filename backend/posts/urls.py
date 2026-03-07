"""
Posts URL configuration.

All endpoints live under /api/v1/ (mounted in config/urls.py):
  - /api/v1/posts/            — paginated list + CRUD (DRF router)
  - /api/v1/posts/<pk>/       — retrieve / update / delete
  - /api/v1/posts/stats/      — admin dashboard stats
  - /api/v1/posts/trending/   — top posts by views
  - /api/v1/posts/recommended/<id>/  — same-category recommendations
  - /api/v1/posts/<pk>/like/  — toggle like
  - /api/v1/categories/       — CRUD (admin) / list (public)
  - /api/v1/tags/             — read-only listing
  - /api/v1/upload/upload     — image upload
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
