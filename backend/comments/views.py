"""
Comment views — threaded, moderated, paginated.

All legacy URL patterns (``/create``, ``/getPostComments/<id>``, etc.) are
preserved for backward compatibility.  New ``/v1/`` routes use cleaner
REST conventions.
"""

from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from courses.models import Lesson
from posts.models import Post

from .lesson_models import LessonComment
from .models import Comment
from .serializers import (
    CommentCreateSerializer,
    CommentSerializer,
    LessonCommentSerializer,
)


# ---------------------------------------------------------------------------
# Permissions
# ---------------------------------------------------------------------------
class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow object-level actions only to the author or staff."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.is_staff:
            return True
        return obj.user == request.user


# ---------------------------------------------------------------------------
# Throttling — spam protection
# ---------------------------------------------------------------------------
class CommentCreateThrottle(UserRateThrottle):
    """Limit comment creation to 10 per minute per user."""
    rate = "10/min"
    scope = "comment_create"


# ---------------------------------------------------------------------------
# Pagination
# ---------------------------------------------------------------------------
class CommentPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _approved_replies_prefetch():
    """Prefetch approved child replies with their users + likes."""
    return Prefetch(
        "replies",
        queryset=(
            Comment.objects
            .filter(status=Comment.Status.APPROVED)
            .select_related("user")
            .prefetch_related("likes")
            .order_by("created_at")  # oldest reply first
        ),
    )


# ============================================================================
# Blog Comments
# ============================================================================
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "id"

    # ---- helpers ----------------------------------------------------------

    def _base_qs(self):
        """Queryset with joins and prefetches — avoids N+1."""
        return (
            Comment.objects
            .select_related("user")
            .prefetch_related("likes", _approved_replies_prefetch())
        )

    # ---- Create -----------------------------------------------------------

    def get_throttles(self):
        if self.action == "create":
            return [CommentCreateThrottle()]
        return super().get_throttles()

    def create(self, request, *args, **kwargs):
        ser = CommentCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        post = get_object_or_404(Post, id=ser.validated_data["postId"])

        parent = None
        parent_id = ser.validated_data.get("parentId")
        if parent_id:
            parent = get_object_or_404(
                Comment, id=parent_id, post=post,
            )
            # Only allow one level of nesting: if parent already is a reply,
            # attach to the root parent instead.
            if parent.parent_id:
                parent = parent.parent

        comment = Comment.objects.create(
            content=ser.validated_data["content"],
            post=post,
            user=request.user,
            parent=parent,
        )

        # Re-fetch with joins for the response
        comment = (
            self._base_qs()
            .get(pk=comment.pk)
        )
        return Response(
            CommentSerializer(comment).data,
            status=status.HTTP_201_CREATED,
        )

    # ---- List comments for a post (legacy) --------------------------------

    @action(detail=False, methods=["get"])
    def get_post_comments(self, request, postId=None):
        """
        GET /api/comments/getPostComments/<postId>

        Returns top-level approved comments for a post, each with nested
        ``replies`` array.  Backward-compatible: the old frontend calls this
        and receives a flat array — replies are simply an extra field it can
        ignore until the UI adds threading support.
        """
        if not postId:
            postId = request.query_params.get("postId")

        comments = (
            self._base_qs()
            .filter(
                post_id=postId,
                parent__isnull=True,            # top-level only
                status=Comment.Status.APPROVED,
            )
            .order_by("-created_at")
        )

        # Optional pagination via ?page= query param
        page = request.query_params.get("page")
        if page:
            paginator = CommentPagination()
            page_qs = paginator.paginate_queryset(comments, request)
            return paginator.get_paginated_response(
                CommentSerializer(page_qs, many=True).data
            )

        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    # ---- Admin: list all comments -----------------------------------------

    @action(detail=False, methods=["get"])
    def getComments(self, request):
        """
        GET /api/comments/getComments?startIndex=0&limit=9&sort=desc&status=...

        Admin endpoint — returns all comments with pagination and stats.
        """
        if not request.user.is_superuser and not request.user.is_staff:
            return Response(
                {"message": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN,
            )

        start_index = int(request.query_params.get("startIndex", 0))
        limit = int(request.query_params.get("limit", 9))
        sort_dir = request.query_params.get("sort", "desc")
        order_field = "-created_at" if sort_dir == "desc" else "created_at"

        # Optional status filter for moderation
        status_filter = request.query_params.get("status")

        qs = self._base_qs().order_by(order_field)
        if status_filter:
            qs = qs.filter(status=status_filter)

        total_comments = qs.count()
        comments = qs[start_index : start_index + limit]

        now = timezone.now()
        last_month_comments = qs.filter(
            created_at__month=now.month, created_at__year=now.year,
        ).count()

        # Moderation counts
        pending_count = Comment.objects.filter(
            status=Comment.Status.PENDING
        ).count()
        spam_count = Comment.objects.filter(
            status=Comment.Status.SPAM
        ).count()

        return Response({
            "comments": CommentSerializer(comments, many=True).data,
            "totalComments": total_comments,
            "lastMonthComments": last_month_comments,
            "pendingCount": pending_count,
            "spamCount": spam_count,
        })

    # ---- Like / unlike ----------------------------------------------------

    @action(
        detail=True, methods=["put"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def likeComment(self, request, id=None):
        comment = self.get_object()
        user = request.user

        if comment.likes.filter(id=user.id).exists():
            comment.likes.remove(user)
        else:
            comment.likes.add(user)

        # Re-fetch with joins for consistent response shape
        comment = self._base_qs().get(pk=comment.pk)
        return Response(CommentSerializer(comment).data)

    # ---- Edit -------------------------------------------------------------

    @action(
        detail=True, methods=["put"],
        permission_classes=[IsOwnerOrAdmin],
    )
    def editComment(self, request, id=None):
        comment = self.get_object()
        new_content = request.data.get("content", "").strip()
        if not new_content:
            return Response(
                {"message": "Content is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        comment.content = new_content
        comment.is_edited = True
        comment.save()

        comment = self._base_qs().get(pk=comment.pk)
        return Response(CommentSerializer(comment).data)

    # ---- Delete -----------------------------------------------------------

    @action(
        detail=True, methods=["delete"],
        permission_classes=[IsOwnerOrAdmin],
    )
    def deleteComment(self, request, id=None):
        comment = self.get_object()
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ---- Moderation (admin-only) ------------------------------------------

    @action(
        detail=True, methods=["patch"],
        permission_classes=[permissions.IsAdminUser],
        url_path="moderate",
    )
    def moderate(self, request, id=None):
        """
        PATCH /api/comments/comments/<id>/moderate/
        Body: { "status": "approved" | "rejected" | "spam" }
        """
        comment = self.get_object()
        new_status = request.data.get("status")
        valid = {c[0] for c in Comment.Status.choices}
        if new_status not in valid:
            return Response(
                {"message": f"Invalid status. Choose from: {valid}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        comment.status = new_status
        comment.save(update_fields=["status", "updated_at"])
        comment = self._base_qs().get(pk=comment.pk)
        return Response(CommentSerializer(comment).data)

    @action(
        detail=False, methods=["post"],
        permission_classes=[permissions.IsAdminUser],
        url_path="moderate-bulk",
    )
    def moderate_bulk(self, request):
        """
        POST /api/comments/comments/moderate-bulk/
        Body: { "ids": [1, 2, 3], "status": "approved" }
        """
        ids = request.data.get("ids", [])
        new_status = request.data.get("status")
        valid = {c[0] for c in Comment.Status.choices}
        if new_status not in valid:
            return Response(
                {"message": f"Invalid status. Choose from: {valid}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        updated = Comment.objects.filter(id__in=ids).update(status=new_status)
        return Response({"updated": updated})


# ============================================================================
# Lesson Comments (unchanged — kept for course system)
# ============================================================================
class LessonCommentViewSet(viewsets.ModelViewSet):
    queryset = LessonComment.objects.all()
    serializer_class = LessonCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "id"

    def create(self, request, *args, **kwargs):
        lesson_id = request.data.get("lessonId")
        if not lesson_id:
            return Response(
                {"message": "Lesson ID required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        lesson = get_object_or_404(Lesson, id=lesson_id)

        comment = LessonComment.objects.create(
            content=request.data.get("content"),
            lesson=lesson,
            user=request.user,
        )

        return Response(
            self.get_serializer(comment).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"])
    def get_lesson_comments(self, request, lessonId=None):
        if not lessonId:
            lessonId = request.query_params.get("lessonId")

        if not lessonId:
            return Response(
                {"message": "Lesson ID required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        comments = self.queryset.filter(lesson__id=lessonId).order_by("-created_at")
        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)

    @action(
        detail=True, methods=["put"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def likeComment(self, request, id=None):
        comment = self.get_object()
        user = request.user

        if comment.likes.filter(id=user.id).exists():
            comment.likes.remove(user)
        else:
            comment.likes.add(user)

        return Response(self.get_serializer(comment).data)

    @action(detail=True, methods=['put'], permission_classes=[IsOwnerOrAdmin])
    def editComment(self, request, id=None):
        comment = self.get_object()
        comment.content = request.data.get('content', comment.content)
        comment.save()
        return Response(self.get_serializer(comment).data)

    @action(detail=True, methods=['delete'], permission_classes=[IsOwnerOrAdmin])
    def deleteComment(self, request, id=None):
        return self.destroy(request)

