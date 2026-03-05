from django.contrib import admin
from django.utils.html import strip_tags

from .lesson_models import LessonComment
from .models import Comment


def _truncate(text, length=80):
    plain = strip_tags(text)
    return plain[:length] + "…" if len(plain) > length else plain


# ---------------------------------------------------------------------------
# Bulk moderation actions
# ---------------------------------------------------------------------------
@admin.action(description="✅ Approve selected comments")
def approve_comments(modeladmin, request, queryset):
    queryset.update(status=Comment.Status.APPROVED)


@admin.action(description="🚫 Reject selected comments")
def reject_comments(modeladmin, request, queryset):
    queryset.update(status=Comment.Status.REJECTED)


@admin.action(description="🗑 Mark selected as spam")
def mark_spam(modeladmin, request, queryset):
    queryset.update(status=Comment.Status.SPAM)


# ---------------------------------------------------------------------------
# Blog Comment Admin
# ---------------------------------------------------------------------------
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
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

    def status_badge(self, obj):
        colors = {
            "approved": "green",
            "pending": "orange",
            "spam": "red",
            "rejected": "gray",
        }
        color = colors.get(obj.status, "gray")
        return f'<span style="color:{color};font-weight:bold">{obj.get_status_display()}</span>'
    status_badge.short_description = "Status"
    status_badge.allow_tags = True

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
