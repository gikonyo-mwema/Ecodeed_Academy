"""
═══════════════════════════════════════════════════════════════════════════════
POST ADMIN — Django admin configuration for blog posts.

Provides admin interface customization for managing blog posts, categories,
tags, and comments. Includes custom filters, inline editing, search, and
formatted display options.

═══════════════════════════════════════════════════════════════════════════════
ADMIN CLASSES
═══════════════════════════════════════════════════════════════════════════════

CategoryAdmin:
  - List Display: Emoji, name, slug, order, post count
  - Editable Fields: Display order (inline editing)
  - Search: By name
  - Auto-slug generation from name

TagAdmin:
  - List Display: Name, slug, post count
  - Auto-slug generation from name
  - Search: By name

PostAdmin (Comprehensive):
  - List Display: Title, status badge, category, author, featured, views,
    reading time, published date
  - List Filters: Status (draft/published), featured flag, category, date
  - Inline Editing: Featured flag
  - Search: Title, excerpt, content
  - Auto-slug generation from title
  - Read-only: Reading time, views, timestamps
  - Many-to-many: Tags, likes (filter horizontal)
  - Fieldsets: Organized sections for content, classification, publishing,
    SEO, social media, metrics, timestamps

═══════════════════════════════════════════════════════════════════════════════
FEATURES
═══════════════════════════════════════════════════════════════════════════════

Status Indicator:
  - Custom badge showing post status with color coding
  - Draft, Published, Scheduled, or Archived

Date Hierarchy:
  - Navigate posts by creation date (year/month/day)

Custom Methods:
  - post_count(): Display count of posts with each category/tag

═══════════════════════════════════════════════════════════════════════════════
"""

from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Post, Tag


# -----------------------------------------------------------------------
# Category admin
# -----------------------------------------------------------------------
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    CategoryAdmin — Admin interface for blog categories.
    
    Allows admin to create, edit, and manage post categories.
    Features include ordering, slug auto-generation, and post count display.
    
    List Display:
      - emoji: Category emoji icon
      - name: Category name
      - slug: URL slug (auto-generated)
      - order: Display priority (editable)
      - post_count: Number of posts in category
    
    Features:
      - Auto-slug generation: slug auto-populated from name
      - Inline editing: Change order without opening detail page
      - Search: Find categories by name
      - Custom ordering: By order field, then name
    """
    list_display = ("emoji", "name", "slug", "order", "post_count")
    list_editable = ("order",)
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)
    ordering = ("order", "name")

    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = "Posts"


# -----------------------------------------------------------------------
# Tag admin
# -----------------------------------------------------------------------
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """
    TagAdmin — Admin interface for blog post tags.
    
    Allows admin to manage tags for post classification.
    Tags support many-to-many relationships with posts.
    
    List Display:
      - name: Tag name
      - slug: URL slug (auto-generated)
      - post_count: Number of posts with this tag
    
    Features:
      - Auto-slug generation: slug auto-populated from name
      - Search: Find tags by name
    """
    list_display = ("name", "slug", "post_count")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)

    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = "Posts"


# -----------------------------------------------------------------------
# Post admin
# -----------------------------------------------------------------------
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """
    PostAdmin — Comprehensive admin interface for blog posts.
    
    Advanced admin configuration for managing blog content with full
    support for publishing workflows, SEO, social media, and content metrics.
    
    List Display:
      - title: Post title
      - status_badge: Visual status indicator (draft/published/scheduled)
      - category: Post category
      - user: Author/creator
      - featured: Featured flag (checkbox)
      - views: Total view count
      - reading_time: Estimated read time
      - published_at: Publication date
      - created_at: Creation date
    
    Features:
      - Status Indicator: Custom badge with color-coded status
      - Content Fieldsets: Organized sections (content, classification, publishing, SEO, social, metrics, timestamps)
      - Inline Editing: Featured flag editable from list view
      - Collapsible Sections: SEO, social images, metrics, timestamps
      - Search: Title, excerpt, content
      - Filters: Status, featured, category, creation date
      - Date Hierarchy: Navigate by creation date (year/month/day)
      - Auto-slug: Generated from title
      - Many-to-many: Tags (filter horizontal), likes (filter horizontal)
      - Autocomplete: Category and user autocomplete
      - Read-only: Reading time, views, timestamps, likes
    
    Methods:
      - status_badge(): Display colored status indicator
    """
    list_display = (
        "title", "status_badge", "category", "user",
        "featured", "views", "reading_time", "published_at", "created_at",
    )
    list_filter = ("status", "featured", "category_fk", "created_at")
    list_editable = ("featured",)
    search_fields = ("title", "excerpt", "content")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("reading_time", "views", "created_at", "updated_at", "published_at")
    autocomplete_fields = ("category_fk", "user")
    filter_horizontal = ("tags", "likes")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    fieldsets = (
        ("Content", {
            "fields": ("title", "slug", "content", "excerpt", "image"),
        }),
        ("Classification", {
            "fields": ("category", "category_fk", "tags"),
        }),
        ("Publishing", {
            "fields": ("status", "featured", "published_at", "user"),
        }),
        ("SEO", {
            "classes": ("collapse",),
            "fields": ("meta_title", "meta_description", "canonical_url"),
        }),
        ("Social Images", {
            "classes": ("collapse",),
            "fields": ("og_image", "twitter_image"),
        }),
        ("Metrics (read-only)", {
            "classes": ("collapse",),
            "fields": ("reading_time", "views", "likes"),
        }),
        ("Timestamps", {
            "classes": ("collapse",),
            "fields": ("created_at", "updated_at"),
        }),
    )

    def status_badge(self, obj):
        colors = {
            "draft": "#6b7280",
            "published": "#10b981",
            "scheduled": "#f59e0b",
            "archived": "#ef4444",
        }
        color = colors.get(obj.status, "#6b7280")
        return format_html(
            '<span style="background:{}; color:white; padding:2px 8px; '
            'border-radius:4px; font-size:11px;">{}</span>',
            color, obj.get_status_display(),
        )
    status_badge.short_description = "Status"
    status_badge.admin_order_field = "status"