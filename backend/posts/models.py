import math
import re
import uuid

import nh3
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


# ---------------------------------------------------------------------------
# Allowed HTML tags/attributes for server-side sanitization (nh3)
# Covers everything a rich-text editor (Quill / TipTap) would produce.
# ---------------------------------------------------------------------------
ALLOWED_TAGS = {
    "a", "abbr", "b", "blockquote", "br", "code", "em", "h1", "h2", "h3",
    "h4", "h5", "h6", "hr", "i", "img", "li", "ol", "p", "pre", "s",
    "span", "strong", "sub", "sup", "table", "tbody", "td", "th", "thead",
    "tr", "u", "ul", "figure", "figcaption", "video", "source", "iframe",
    "div",
}
ALLOWED_ATTRIBUTES = {
    "*": {"class", "style", "id"},
    "a": {"href", "title", "target"},
    "img": {"src", "alt", "width", "height", "loading", "data-cloudinary-id"},
    "iframe": {"src", "width", "height", "frameborder", "allowfullscreen"},
    "source": {"src", "type"},
    "video": {"src", "controls", "width", "height"},
    "td": {"colspan", "rowspan"},
    "th": {"colspan", "rowspan"},
    "span": {"style"},
}

# Tag displayed on hover in admin
TAG_STRIP_RE = re.compile(r"<[^>]+>")


def _strip_html(html: str) -> str:
    """Remove all HTML tags and collapse whitespace."""
    return TAG_STRIP_RE.sub(" ", html).strip()


def _compute_reading_time(html: str) -> int:
    """Return estimated reading time in minutes (200 wpm)."""
    words = len(_strip_html(html).split())
    return max(1, math.ceil(words / 200))


def _generate_excerpt(html: str, max_length: int = 300) -> str:
    """Generate a plain-text excerpt from HTML content."""
    text = _strip_html(html)
    if len(text) <= max_length:
        return text
    # Cut at the last space before max_length to avoid splitting a word
    truncated = text[:max_length].rsplit(" ", 1)[0]
    return truncated + "…"


# ============================================================================
# Category
# ============================================================================
class Category(models.Model):
    """
    Blog categories — managed via admin instead of hardcoded in frontend.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, default="")
    emoji = models.CharField(max_length=10, blank=True, default="🌍",
                             help_text="Emoji shown alongside the category label")
    color_class = models.CharField(
        max_length=100, blank=True, default="",
        help_text="Tailwind CSS class(es) for category badge, e.g. 'bg-green-100 text-green-800'",
    )
    order = models.PositiveSmallIntegerField(default=0, help_text="Display order (lower = first)")

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return f"{self.emoji} {self.name}" if self.emoji else self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) or str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)


# ============================================================================
# Tag
# ============================================================================
class Tag(models.Model):
    """
    Freeform tags for multi-dimensional post classification.
    A post can have many tags in addition to one primary category.
    """
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) or str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)


# ============================================================================
# Post
# ============================================================================
class Post(models.Model):
    """
    Industry-standard blog post model.

    Key improvements over the original:
    - Category as ForeignKey (admin-manageable) with backward-compat CharField
    - Tags (ManyToMany) for multi-classification
    - Draft / Published / Scheduled workflow via `status` + `published_at`
    - SEO fields: meta_title, meta_description, canonical_url
    - Social images: og_image, twitter_image
    - Server-side excerpt & reading_time computed on save
    - HTML sanitization on save via nh3
    - Featured flag for homepage pinning
    """

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        SCHEDULED = "scheduled", "Scheduled"
        ARCHIVED = "archived", "Archived"

    # --- Core content ---
    title = models.CharField(max_length=255)
    content = models.TextField(help_text="Rich HTML content (sanitized on save)")
    excerpt = models.TextField(
        blank=True, default="",
        help_text="Short plain-text summary. Auto-generated from content if left blank.",
    )
    slug = models.SlugField(unique=True, max_length=255, blank=True)
    image = models.URLField(max_length=1000, blank=True, null=True,
                            help_text="Primary featured image URL")

    # --- Classification ---
    # Keep the old CharField for backward compatibility during migration;
    # new code should use the FK.  We'll populate the FK from the CharField
    # in a data migration or on save.
    category = models.CharField(max_length=100, default="uncategorized")
    category_fk = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="posts", verbose_name="Category",
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="posts")

    # --- Publishing workflow ---
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.DRAFT, db_index=True,
    )
    published_at = models.DateTimeField(
        null=True, blank=True,
        help_text="When the post goes/went live. Set automatically on first publish.",
    )
    scheduled_for = models.DateTimeField(
        null=True, blank=True,
        help_text="When to auto-publish a scheduled post. Required when status='scheduled'.",
    )
    featured = models.BooleanField(
        default=False, db_index=True,
        help_text="Pin this post to the top of listings / homepage.",
    )

    # --- SEO ---
    meta_title = models.CharField(
        max_length=70, blank=True, default="",
        help_text="Title for search engines. Falls back to post title if blank.",
    )
    meta_description = models.CharField(
        max_length=160, blank=True, default="",
        help_text="Description for search engines. Falls back to excerpt if blank.",
    )
    canonical_url = models.URLField(
        max_length=500, blank=True, default="",
        help_text="Canonical URL for syndicated / cross-posted content.",
    )

    # --- Social media images ---
    og_image = models.URLField(
        max_length=1000, blank=True, default="",
        help_text="Open Graph image (Facebook, LinkedIn). Falls back to featured image.",
    )
    twitter_image = models.URLField(
        max_length=1000, blank=True, default="",
        help_text="Twitter card image. Falls back to OG image, then featured image.",
    )

    # --- Relations ---
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts",
    )
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="liked_posts", blank=True,
    )

    # --- Computed / metrics ---
    reading_time = models.PositiveSmallIntegerField(
        default=1, help_text="Estimated reading time in minutes (computed on save).",
    )
    views = models.PositiveIntegerField(default=0)

    # --- Timestamps ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-published_at"]),
            models.Index(fields=["status", "-published_at"]),
            models.Index(fields=["status", "scheduled_for"]),
            models.Index(fields=["slug"]),
        ]

    def __str__(self):
        return self.title

    # ------------------------------------------------------------------
    # Save: slug, sanitization, excerpt, reading_time, published_at
    # ------------------------------------------------------------------
    def save(self, *args, **kwargs):
        # 1. Generate unique slug
        if not self.slug:
            base_slug = slugify(self.title)
            if not base_slug:
                base_slug = str(uuid.uuid4())[:8]
            unique_slug = base_slug
            counter = 1
            while Post.objects.filter(slug=unique_slug).exclude(pk=self.pk).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug

        # 2. Sanitize HTML content (server-side XSS prevention)
        if self.content:
            self.content = nh3.clean(
                self.content,
                tags=ALLOWED_TAGS,
                attributes=ALLOWED_ATTRIBUTES,
            )

        # 3. Auto-generate excerpt from content if not provided
        if not self.excerpt and self.content:
            self.excerpt = _generate_excerpt(self.content)

        # 4. Compute reading time
        if self.content:
            self.reading_time = _compute_reading_time(self.content)

        # 5. Set published_at on first publish
        if self.status == self.Status.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()

        # 6. Auto-publish if scheduled time has passed
        if (
            self.status == self.Status.SCHEDULED
            and self.scheduled_for
            and self.scheduled_for <= timezone.now()
        ):
            self.status = self.Status.PUBLISHED
            self.published_at = self.scheduled_for

        super().save(*args, **kwargs)
