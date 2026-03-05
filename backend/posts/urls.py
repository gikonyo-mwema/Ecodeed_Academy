"""
Posts URL configuration.

Provides both versioned (v1) and legacy (backward-compatible) URL patterns.

New endpoints:
  - /api/v1/posts/            — paginated list + CRUD
  - /api/v1/posts/stats/      — admin dashboard stats
  - /api/v1/posts/trending/   — top posts by views
  - /api/v1/posts/recommended/<id>/  — same-category recommendations
  - /api/v1/posts/<pk>/like/  — toggle like
  - /api/v1/categories/       — CRUD (admin) / list (public)
  - /api/v1/tags/             — read-only listing
  - /api/v1/upload/upload     — image upload

Legacy endpoints (kept for existing frontend):
  - /api/post                 — GET list
  - /api/posts/getPosts       — GET list
  - /api/post/create          — POST create
  - /api/posts/update/<pk>/<userId>/  — PUT
  - /api/posts/delete/<pk>/<userId>/  — DELETE
  - /api/posts/trending       — GET trending
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
    path("v1/", include((router_v1.urls, "v1"))),
    path("v1/upload/upload", UploadImageView.as_view(), name="v1-image-upload"),

    # ── Legacy / frontend-compatible routes ────────────────────────
    # These map to the same viewset actions so both old and new
    # frontend code works during migration.
    path("post", PostViewSet.as_view({"get": "list"}), name="post-list-singular"),
    path("posts/getPosts", PostViewSet.as_view({"get": "list"}), name="post-list-legacy"),
    path("post/create", PostViewSet.as_view({"post": "create"}), name="post-create-legacy"),
    path(
        "posts/create/",
        PostViewSet.as_view({"post": "create"}),
        name="post-create-admin",
    ),
    path(
        "posts/update/<int:pk>/<str:userId>/",
        PostViewSet.as_view({"put": "update"}),
        name="post-update-legacy",
    ),
    path(
        "posts/delete/<int:pk>/<str:userId>/",
        PostViewSet.as_view({"delete": "destroy"}),
        name="post-delete-legacy",
    ),

    # Trending & stats
    path("posts/trending", PostViewSet.as_view({"get": "trending"}), name="post-trending"),
    path("posts/stats/", PostViewSet.as_view({"get": "stats"}), name="post-stats"),

    # Standard REST (non-versioned — kept for router auto-generated paths)
    path("", include(router_v1.urls)),

    # Image upload (legacy path)
    path("upload/upload", UploadImageView.as_view(), name="image-upload"),
]
