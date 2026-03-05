import nh3
from django.conf import settings
from django.db import models
from django.utils import timezone

from posts.models import Post


# ---------------------------------------------------------------------------
# Allowed HTML for comment content (very restrictive — no images/iframes)
# ---------------------------------------------------------------------------
COMMENT_ALLOWED_TAGS = {
    "a", "b", "br", "code", "em", "i", "li", "ol", "p", "pre",
    "s", "strong", "u", "ul",
}
COMMENT_ALLOWED_ATTRIBUTES = {
    "a": {"href", "title"},
}


def _sanitize_comment(html: str) -> str:
    """Strip everything except safe inline formatting."""
    return nh3.clean(
        html,
        tags=COMMENT_ALLOWED_TAGS,
        attributes=COMMENT_ALLOWED_ATTRIBUTES,
    ).strip()


# ============================================================================
# Comment
# ============================================================================
class Comment(models.Model):
    """
    Industry-standard comment model.

    Improvements over the original flat-comment model:
    - ``parent`` FK for threaded / nested replies (1 level deep recommended)
    - ``status`` field for moderation workflow (pending → approved / spam / rejected)
    - ``is_edited`` flag so the UI can show "(edited)"
    - HTML sanitization via nh3 on every save
    - DB indexes on common query patterns
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        SPAM = "spam", "Spam"
        REJECTED = "rejected", "Rejected"

    # --- Core ---
    content = models.TextField(
        max_length=2000,
        help_text="Comment body (HTML sanitized on save).",
    )
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="comments",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments",
    )

    # --- Threading ---
    parent = models.ForeignKey(
        "self", null=True, blank=True,
        on_delete=models.CASCADE, related_name="replies",
        help_text="If set, this comment is a reply to another comment.",
    )

    # --- Moderation ---
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.APPROVED,
        db_index=True,
        help_text="Moderation status. Default APPROVED for backward compat; "
                  "switch default to PENDING once a review workflow is in place.",
    )

    # --- Engagement ---
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="liked_comments", blank=True,
    )

    # --- Meta flags ---
    is_edited = models.BooleanField(default=False)

    # --- Timestamps ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["post", "-created_at"]),
            models.Index(fields=["post", "status", "-created_at"]),
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["parent"]),
        ]

    def __str__(self):
        prefix = "↳ Reply" if self.parent_id else "Comment"
        return f"{prefix} by {self.user} on {self.post}"

    # ------------------------------------------------------------------
    # Save: sanitize HTML
    # ------------------------------------------------------------------
    def save(self, *args, **kwargs):
        if self.content:
            self.content = _sanitize_comment(self.content)
        super().save(*args, **kwargs)

    # ------------------------------------------------------------------
    # Convenience properties
    # ------------------------------------------------------------------
    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def is_reply(self):
        return self.parent_id is not None
