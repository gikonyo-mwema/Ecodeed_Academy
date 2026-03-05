from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Post, Tag


# -----------------------------------------------------------------------
# Category admin
# -----------------------------------------------------------------------
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
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