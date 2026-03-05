"""
Posts API views — industry-standard patterns.

Improvements over original:
  - Proper DRF pagination (PageNumberPagination) with backward-compatible
    response envelope ({ posts, totalPosts, pagination })
  - Separate /stats/ endpoint for admin dashboard (no longer computed on every list)
  - Per-view throttling (image upload, view counting, post writes)
  - Caching on read-heavy endpoints via @cache_page
  - select_related / prefetch_related to eliminate N+1 queries
  - Atomic view-count increment with per-IP throttle
  - Recommended posts endpoint (same-category first)
  - API versioning ready (urls mount under /api/v1/)
  - Image upload to Cloudinary with MIME-type validation
"""

import io
import os
import uuid
from datetime import datetime

import cloudinary.uploader
from django.conf import settings
from django.db.models import Count, F, Q
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Post, Tag
from .pagination import PostPageNumberPagination, SmallResultsPagination
from .permissions import IsOwnerOrAdmin
from .serializers import CategorySerializer, PostSerializer, TagSerializer
from .throttles import ImageUploadThrottle, PostWriteThrottle, ViewCountThrottle

# Max image upload size (5 MB)
MAX_IMAGE_SIZE = getattr(settings, "MAX_POST_IMAGE_SIZE", 5 * 1024 * 1024)
ALLOWED_IMAGE_TYPES = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif",
}
# MIME magic-byte signatures that imghdr can detect
ALLOWED_MIME_TYPES = {
    "jpeg", "png", "gif", "webp",
}


# ===================================================================
# Post ViewSet
# ===================================================================
class PostViewSet(viewsets.ModelViewSet):
    """
    CRUD + list / retrieve for blog posts.

    Public users see only published posts.
    Admins with ?showAll=1 see all statuses (draft, scheduled, archived).
    """

    serializer_class = PostSerializer
    pagination_class = PostPageNumberPagination
    lookup_field = "pk"
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "published_at", "views", "title"]
    ordering = ["-created_at"]

    # ---------- permissions ----------
    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    # ---------- throttling ----------
    def get_throttles(self):
        if self.action in ("create", "update", "partial_update"):
            return [PostWriteThrottle()]
        if self.action == "retrieve":
            return [ViewCountThrottle()]
        return []

    # ---------- queryset ----------
    def get_queryset(self):
        qs = (
            Post.objects
            .select_related("user", "category_fk")
            .prefetch_related("tags", "likes")
        )

        user = self.request.user
        show_all = self.request.query_params.get("showAll")

        # Visibility: non-admins only see published posts
        if user.is_authenticated and user.is_staff and show_all:
            pass  # admins with ?showAll=1 see everything
        else:
            qs = qs.filter(status=Post.Status.PUBLISHED)

        # ---------- filters ----------
        params = self.request.query_params

        category = params.get("category")
        if category and category != "uncategorized":
            qs = qs.filter(
                Q(category=category) | Q(category_fk__slug=category)
            )

        slug = params.get("slug")
        if slug:
            qs = qs.filter(slug=slug)

        post_id = params.get("postId")
        if post_id:
            qs = qs.filter(id=post_id)

        user_id = params.get("userId")
        if user_id:
            qs = qs.filter(user__id=user_id)

        tag = params.get("tag")
        if tag:
            qs = qs.filter(tags__slug=tag).distinct()

        featured = params.get("featured")
        if featured is not None:
            qs = qs.filter(featured=featured.lower() in ("1", "true"))

        status_filter = params.get("status")
        if status_filter and user.is_authenticated and user.is_staff:
            qs = qs.filter(status=status_filter)

        exclude = params.get("exclude")
        if exclude:
            qs = qs.exclude(id=exclude)

        search_term = params.get("searchTerm")
        if search_term:
            # MySQL FULLTEXT is not available via Django ORM natively.
            # Use a weighted icontains search: title matches rank highest,
            # then excerpt, then content.  We use annotation + ordering so
            # the most relevant results appear first.
            from django.db.models import Case, IntegerField, Value, When

            qs = qs.filter(
                Q(title__icontains=search_term)
                | Q(excerpt__icontains=search_term)
                | Q(content__icontains=search_term)
                | Q(tags__name__icontains=search_term)
            ).distinct().annotate(
                _relevance=Case(
                    When(title__icontains=search_term, then=Value(4)),
                    When(excerpt__icontains=search_term, then=Value(3)),
                    When(tags__name__icontains=search_term, then=Value(2)),
                    When(content__icontains=search_term, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                ),
            )
            # If no explicit ordering was requested, sort by relevance
            if "sort" not in params and "order" not in params:
                qs = qs.order_by("-_relevance", "-created_at")

        # ---------- date range filter ----------
        date_from = params.get("dateFrom")
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)

        date_to = params.get("dateTo")
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        # ---------- ordering ----------
        order = params.get("order", "desc")
        sort_by = params.get("sort", "created_at")

        # Whitelist sortable fields
        allowed_sorts = {"created_at", "published_at", "views", "title", "updated_at"}
        if sort_by not in allowed_sorts:
            sort_by = "created_at"

        prefix = "" if order == "asc" else "-"
        qs = qs.order_by(f"{prefix}{sort_by}")

        return qs

    # ---------- list (paginated) ----------
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Use proper DRF pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            # Compute lastMonthPosts only when admin explicitly requests stats
            extra = {}
            if request.query_params.get("includeStats"):
                now = timezone.now()
                extra["lastMonthPosts"] = queryset.filter(
                    created_at__year=now.year,
                    created_at__month=now.month,
                ).count()
            return self.paginator.get_paginated_response(serializer.data, **extra)

        # Fallback (no pagination — shouldn't happen with pagination_class set)
        serializer = self.get_serializer(queryset, many=True)
        return Response({"posts": serializer.data, "totalPosts": queryset.count()})

    # ---------- retrieve (with view-count increment) ----------
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Atomic view-count increment (throttled per-IP to prevent spam)
        Post.objects.filter(pk=instance.pk).update(views=F("views") + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    # ---------- create ----------
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # ---------- custom actions ----------

    @action(detail=False, methods=["get"], url_path="search-suggestions")
    def search_suggestions(self, request):
        """
        Lightweight autocomplete endpoint.
        GET /api/v1/posts/search-suggestions/?q=clim
        Returns up to 5 post titles matching the query prefix.
        """
        q = request.query_params.get("q", "").strip()
        if len(q) < 2:
            return Response({"suggestions": []})
        titles = list(
            Post.objects
            .filter(status=Post.Status.PUBLISHED, title__icontains=q)
            .values_list("title", flat=True)
            .order_by("-published_at")[:5]
        )
        return Response({"suggestions": titles})

    @action(detail=False, methods=["get"])
    @method_decorator(cache_page(60 * 5))  # cache 5 min
    def trending(self, request):
        """Top 5 published posts by views."""
        limit = min(int(request.query_params.get("limit", 5)), 20)
        qs = (
            Post.objects
            .filter(status=Post.Status.PUBLISHED)
            .select_related("user", "category_fk")
            .order_by("-views")[:limit]
        )
        serializer = self.get_serializer(qs, many=True)
        return Response({"posts": serializer.data})

    @action(detail=False, methods=["get"], url_path=r"recommended/(?P<post_id>[0-9]+)")
    def recommended(self, request, post_id=None):
        """
        Up to N recommended posts: same category first, then recent.
        GET /api/v1/posts/recommended/42/?limit=3
        """
        limit = min(int(request.query_params.get("limit", 3)), 10)
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return Response({"posts": []})

        base_qs = (
            Post.objects
            .filter(status=Post.Status.PUBLISHED)
            .exclude(pk=post.pk)
            .select_related("user", "category_fk")
        )

        # Prefer same category
        same_cat = list(
            base_qs.filter(
                Q(category=post.category) | Q(category_fk=post.category_fk)
            ).order_by("-published_at")[:limit]
        )

        if len(same_cat) < limit:
            exclude_ids = [p.pk for p in same_cat] + [post.pk]
            filler = list(
                base_qs.exclude(pk__in=exclude_ids)
                .order_by("-published_at")[: limit - len(same_cat)]
            )
            same_cat.extend(filler)

        serializer = self.get_serializer(same_cat, many=True)
        return Response({"posts": serializer.data})

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def stats(self, request):
        """
        Dedicated admin stats endpoint.
        GET /api/v1/posts/stats/

        Returns post counts for dashboard widgets without polluting every
        list response.
        """
        now = timezone.now()
        all_posts = Post.objects.all()

        total = all_posts.count()
        published = all_posts.filter(status=Post.Status.PUBLISHED).count()
        drafts = all_posts.filter(status=Post.Status.DRAFT).count()
        this_month = all_posts.filter(
            created_at__year=now.year,
            created_at__month=now.month,
        ).count()

        # Posts by category (top 10)
        by_category = list(
            all_posts
            .values("category")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        # Posts by status
        by_status = list(
            all_posts
            .values("status")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        return Response({
            "totalPosts": total,
            "publishedPosts": published,
            "draftPosts": drafts,
            "lastMonthPosts": this_month,
            "byCategory": by_category,
            "byStatus": by_status,
        })

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        """Toggle like on a post."""
        post = self.get_object()
        user = request.user
        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            liked = False
        else:
            post.likes.add(user)
            liked = True
        return Response({
            "liked": liked,
            "numberOfLikes": post.likes.count(),
        })


# ===================================================================
# Category ViewSet
# ===================================================================
class CategoryViewSet(viewsets.ModelViewSet):
    """
    Public read, admin CRUD for blog categories.
    Lookup by slug for cleaner URLs: /api/v1/categories/climate-change/
    """

    queryset = Category.objects.annotate(post_count=Count("posts"))
    serializer_class = CategorySerializer
    pagination_class = SmallResultsPagination
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    @method_decorator(cache_page(60 * 15))  # cache 15 min
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


# ===================================================================
# Tag ViewSet
# ===================================================================
class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only tag listing. Lookup by slug."""

    queryset = Tag.objects.annotate(post_count=Count("posts"))
    serializer_class = TagSerializer
    pagination_class = SmallResultsPagination
    lookup_field = "slug"

    @method_decorator(cache_page(60 * 15))  # cache 15 min
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


# ===================================================================
# Image Upload (Cloudinary)
# ===================================================================
def _validate_image_file(file_obj, max_size=MAX_IMAGE_SIZE):
    """
    Validate an uploaded image file by size, extension, AND actual content.

    Returns (is_valid: bool, error_message: str | None).
    """
    # 1. Size check
    if file_obj.size > max_size:
        return False, f"File too large. Maximum size is {max_size // (1024 * 1024)} MB."

    # 2. Extension check
    file_ext = os.path.splitext(file_obj.name)[1].lower()
    if file_ext not in ALLOWED_IMAGE_TYPES:
        return False, (
            f"Unsupported image type '{file_ext}'. "
            f"Allowed: {', '.join(sorted(ALLOWED_IMAGE_TYPES))}"
        )

    # 3. Content-based MIME check using Pillow — verify real image type.
    #    This prevents "rename malware.exe → malware.jpg" attacks.
    try:
        from PIL import Image as PILImage
        file_obj.seek(0)
        img = PILImage.open(file_obj)
        img.verify()  # raises if not a valid image
        detected_format = (img.format or "").lower()  # e.g. 'jpeg', 'png', 'gif', 'webp'
        file_obj.seek(0)  # rewind for the actual upload
    except Exception:
        return False, (
            "File content is not a valid image. "
            "Allowed: JPEG, PNG, GIF, WebP, AVIF."
        )

    if detected_format not in ALLOWED_MIME_TYPES:
        return False, (
            f"File content does not match a supported image format "
            f"(detected: {detected_format or 'unknown'}). "
            f"Allowed: JPEG, PNG, GIF, WebP, AVIF."
        )

    return True, None


class UploadImageView(APIView):
    """
    Upload an image for use in blog posts (featured image or inline).

    Validates file size, extension, and MIME content type.
    Uploads to Cloudinary and returns { secureUrl, public_id }.
    """

    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ImageUploadThrottle]

    def post(self, request, *args, **kwargs):
        if "image" not in request.FILES:
            return Response(
                {"error": "No image provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_obj = request.FILES["image"]

        # --- Validate ---
        is_valid, error_msg = _validate_image_file(file_obj)
        if not is_valid:
            return Response(
                {"error": error_msg},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --- Upload to Cloudinary ---
        try:
            result = cloudinary.uploader.upload(
                file_obj,
                folder="ecodeed/posts",
                resource_type="image",
                # Auto-optimize: serve best format (WebP/AVIF) at good quality
                transformation=[
                    {"quality": "auto:good", "fetch_format": "auto"},
                ],
                # Give each upload a unique public_id
                public_id=f"post_{uuid.uuid4().hex[:12]}",
                overwrite=False,
            )
        except Exception as exc:
            return Response(
                {"error": f"Cloudinary upload failed: {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "secureUrl": result["secure_url"],
                "public_id": result["public_id"],
                "width": result.get("width"),
                "height": result.get("height"),
                "format": result.get("format"),
                "bytes": result.get("bytes"),
            },
            status=status.HTTP_201_CREATED,
        )
