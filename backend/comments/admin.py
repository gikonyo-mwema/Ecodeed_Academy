"""
═══════════════════════════════════════════════════════════════════════════════
COMMENT ADMIN — Django admin configuration for comments.

Provides admin interface for managing blog post comments and lesson comments
with moderation capabilities, bulk actions, and threading support.

═══════════════════════════════════════════════════════════════════════════════
ADMIN CLASSES & ACTIONS
═══════════════════════════════════════════════════════════════════════════════

CommentAdmin:
  - List Display: ID, truncated content, author, post, status badge,
    parent link, likes count, edited flag, creation date
  - Filters: Status (pending/approved/rejected/spam), edited flag, date
  - Search: Content, author email/username, post title
  - Actions: Approve, reject, mark as spam (bulk moderation)
  - Date Hierarchy: Navigate by creation date
  - Read-only: Timestamps, likes count

LessonCommentAdmin:
  - Basic registration for lesson comments
  - Similar structure to CommentAdmin

Bulk Actions:
  - Approve: Set status to APPROVED
  - Reject: Set status to REJECTED
  - Mark Spam: Set status to SPAM

═══════════════════════════════════════════════════════════════════════════════
MODERATION FEATURES
═══════════════════════════════════════════════════════════════════════════════

Status Tracking:
  - Pending: Awaiting moderation
  - Approved: Visible to public
  - Rejected: Hidden from public (kept in DB)
  - Spam: Flagged as spam/abuse

Edit Tracking:
  - is_edited: Flag showing if comment was modified after creation

Threading:
  - Parent comments and nested replies
  - Parent link display in list view

Engagement Metrics:
  - Likes count display
  - Thread depth indication

═══════════════════════════════════════════════════════════════════════════════
"""

from django.contrib import admin
from django.utils.html import format_html, strip_tags

from .lesson_models import LessonComment
from .models import Comment


def _truncate(text, length=80):
    """Truncate text to length characters, stripping HTML tags."""
    plain = strip_tags(text)
    return plain[:length] + "…" if len(plain) > length else plain


# ---------------------------------------------------------------------------
# Bulk moderation actions
# ---------------------------------------------------------------------------
@admin.action(description="✅ Approve selected comments")
def approve_comments(modeladmin, request, queryset):
    """
    Bulk action: Approve selected comments.
    
    Sets status to APPROVED for all selected comments,
    making them visible to public users.
    
    @action Approve Comments
    """
    queryset.update(status=Comment.Status.APPROVED)


@admin.action(description="🚫 Reject selected comments")
def reject_comments(modeladmin, request, queryset):
    """
    Bulk action: Reject selected comments.
    
    Sets status to REJECTED for all selected comments,
    hiding them from public view while keeping in database.
    
    @action Reject Comments
    """
    queryset.update(status=Comment.Status.REJECTED)


@admin.action(description="🗑 Mark selected as spam")
def mark_spam(modeladmin, request, queryset):
    """
    Bulk action: Mark comments as spam.
    
    Sets status to SPAM for flagged comments,
    allowing bulk management of abuse reports.
    
    @action Mark as Spam
    """
    queryset.update(status=Comment.Status.SPAM)


# ---------------------------------------------------------------------------
# Blog Comment Admin
# ---------------------------------------------------------------------------
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """
    CommentAdmin — Comprehensive admin interface for blog comments.
    
    Manages comment moderation, threading, and engagement metrics.
    Includes bulk moderation actions for efficient spam/abuse management.
    
    List Display:
      - id: Comment ID
      - short_content: Truncated comment text (80 chars)
      - user: Comment author
      - post: Parent post
      - status_badge: Color-coded status indicator
      - parent_link: Link to parent comment (if threaded reply)
      - likes_count: Total likes on comment
      - is_edited: Edited flag
      - created_at: Creation timestamp
    
    Features:
      - Date Hierarchy: Navigate by creation date (year/month/day)
      - Date Hierarchy: Group by creation date
      - Bulk Actions: Approve, reject, mark spam
      - Raw ID Fields: User, post, parent (for large datasets)
      - Read-only: Timestamps, likes count
      - Search: Content, author, post title
      - Filters: Status, edited flag, date
      - Pagination: 30 items per page
    
    Fieldsets:
      - Content: Main comment data
      - Moderation: Status and edit tracking
      - Engagement: Likes count
      - Timestamps: Creation/update dates
    
    Methods:
      - short_content(): Display truncated content
      - status_badge(): Color-coded status indicator
      - parent_link(): Clickable link to parent comment
      - likes_count(): Display total likes
    
    @admin CommentAdmin
    """
    list_display = [
        "id", "short_content", "user", "post", "status_badge",
        "parent_link", "likes_count", "is_edited", "created_at",
    ]
    list_filter = ["status", "is_edited", "created_at"]
    list_editable = ["status_badge"]  # removed — see below
    search_fields = ["content", "user__username", "user__email", "post__title"]
    raw_id_fields = ["user", "post", "parent"]
    readonly_fields = ["created_at", "updated_at", "likes_count"]
    date_hierarchy = "created_at"
    actions = [approve_comments, reject_comments, mark_spam]
    list_per_page = 30

    # Remove list_editable for the badge — it's read-only display
    list_editable = []

    fieldsets = (
        (None, {"fields": ("content", "user", "post", "parent")}),
        ("Moderation", {"fields": ("status", "is_edited")}),
        ("Engagement", {"fields": ("likes_count",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    def short_content(self, obj):
        return _truncate(obj.content)
    short_content.short_description = "Content"

    @admin.display(description="Status")
    def status_badge(self, obj):
        colors = {
            "approved": "green",
            "pending": "orange",
            "spam": "red",
            "rejected": "gray",
        }
        color = colors.get(obj.status, "gray")
        return format_html(
            '<span style="color:{};font-weight:bold">{}</span>',
            color,
            obj.get_status_display(),
        )

    def parent_link(self, obj):
        if obj.parent_id:
            return f"↳ Reply to #{obj.parent_id}"
        return "—"
    parent_link.short_description = "Reply to"

    def likes_count(self, obj):
        return obj.likes.count()
    likes_count.short_description = "Likes"


# ---------------------------------------------------------------------------
# Lesson Comment Admin
# ---------------------------------------------------------------------------
@admin.register(LessonComment)
class LessonCommentAdmin(admin.ModelAdmin):
    list_display = ["id", "short_content", "user", "lesson", "likes_count", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["content", "user__username", "lesson__title"]
    raw_id_fields = ["user", "lesson"]
    readonly_fields = ["created_at", "updated_at"]
    list_per_page = 30

    def short_content(self, obj):
        return _truncate(obj.content)
    short_content.short_description = "Content"

    def likes_count(self, obj):
        return obj.likes.count()
    likes_count.short_description = "Likes"
