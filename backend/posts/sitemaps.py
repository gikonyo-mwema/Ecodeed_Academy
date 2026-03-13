"""
XML Sitemaps for the Ecodeed Academy blog.

Provides:
    - PostSitemap  — all published posts
    - CategorySitemap — all categories
    - StaticSitemap — key static pages (home, search, about, etc.)

Wire into config/urls.py:
    from django.contrib.sitemaps.views import sitemap
    from posts.sitemaps import SITEMAPS
    path("sitemap.xml", sitemap, {"sitemaps": SITEMAPS}, name="sitemap"),
"""

from django.contrib.sitemaps import Sitemap

from .models import Post, Category


SITE_URL = "https://www.ecodeedconsulting.com"


# ---------------------------------------------------------------------------
# Published posts
# ---------------------------------------------------------------------------
class PostSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8
    protocol = "https"

    def items(self):
        return (
            Post.objects.filter(status=Post.Status.PUBLISHED)
            .select_related("category_fk")
            .order_by("-published_at")
        )

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f"/post/{obj.slug}"


# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------
class CategorySitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.6
    protocol = "https"

    def items(self):
        return Category.objects.all()

    def location(self, obj):
        return f"/search?category={obj.slug}"


# ---------------------------------------------------------------------------
# Static / evergreen pages (match your frontend routes)
# ---------------------------------------------------------------------------
class StaticSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.5
    protocol = "https"

    _pages = [
        "/",
        "/search",
        "/about",
        "/services",
        "/courses",
        "/contact",
    ]

    def items(self):
        return self._pages

    def location(self, item):
        return item


# ---------------------------------------------------------------------------
# Convenience dict for config/urls.py
# ---------------------------------------------------------------------------
SITEMAPS = {
    "posts": PostSitemap,
    "categories": CategorySitemap,
    "static": StaticSitemap,
}
