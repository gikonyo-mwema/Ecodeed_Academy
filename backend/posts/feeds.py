"""
RSS & Atom feeds for the Ecodeed Academy blog.

Provides:
    - LatestPostsFeed — RSS 2.0 feed of the latest published posts
    - LatestPostsAtomFeed — Atom 1.0 equivalent
    - CategoryPostsFeed — RSS feed filtered by category slug

Usage in urls.py:
    path("feed/rss/", LatestPostsFeed(), name="rss-feed"),
    path("feed/atom/", LatestPostsAtomFeed(), name="atom-feed"),
    path("feed/rss/category/<slug:slug>/", CategoryPostsFeed(), name="rss-feed-category"),
"""

from django.contrib.syndication.views import Feed
from django.utils.feedgenerator import Atom1Feed
from django.utils.html import strip_tags

from .models import Post, Category


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
SITE_URL = "https://www.ecodeedconsulting.com"
FEED_LIMIT = 20


def _post_link(post):
    """Absolute URL for a post (matches frontend route)."""
    return f"{SITE_URL}/post/{post.slug}"


# ---------------------------------------------------------------------------
# RSS 2.0 — Latest Posts
# ---------------------------------------------------------------------------
class LatestPostsFeed(Feed):
    title = "Ecodeed Blog"
    link = SITE_URL
    description = (
        "Latest articles on environmental impact assessment, ecology, "
        "sustainability, and green careers from Ecodeed."
    )
    language = "en"

    def items(self):
        return (
            Post.objects.filter(status=Post.Status.PUBLISHED)
            .select_related("user", "category_fk")
            .order_by("-published_at")[:FEED_LIMIT]
        )

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        # Prefer the pre-computed excerpt; fall back to stripped content
        return item.excerpt or strip_tags(item.content)[:300]

    def item_link(self, item):
        return _post_link(item)

    def item_pubdate(self, item):
        return item.published_at or item.created_at

    def item_updateddate(self, item):
        return item.updated_at

    def item_author_name(self, item):
        u = item.user
        return u.get_full_name() or u.email

    def item_categories(self, item):
        cats = []
        if item.category_fk:
            cats.append(item.category_fk.name)
        cats.extend(item.tags.values_list("name", flat=True))
        return cats


# ---------------------------------------------------------------------------
# Atom 1.0 — Latest Posts
# ---------------------------------------------------------------------------
class LatestPostsAtomFeed(LatestPostsFeed):
    feed_type = Atom1Feed
    subtitle = LatestPostsFeed.description


# ---------------------------------------------------------------------------
# RSS 2.0 — Posts in a single Category
# ---------------------------------------------------------------------------
class CategoryPostsFeed(Feed):
    language = "en"

    def get_object(self, request, slug):
        return Category.objects.get(slug=slug)

    def title(self, obj):
        return f"Ecodeed — {obj.name}"

    def link(self, obj):
        return f"{SITE_URL}/search?category={obj.slug}"

    def description(self, obj):
        return obj.description or f"Latest articles in {obj.name} from Ecodeed."

    def items(self, obj):
        return (
            Post.objects.filter(status=Post.Status.PUBLISHED, category_fk=obj)
            .select_related("user", "category_fk")
            .order_by("-published_at")[:FEED_LIMIT]
        )

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        return item.excerpt or strip_tags(item.content)[:300]

    def item_link(self, item):
        return _post_link(item)

    def item_pubdate(self, item):
        return item.published_at or item.created_at

    def item_author_name(self, item):
        u = item.user
        return u.get_full_name() or u.email

    def item_categories(self, item):
        cats = []
        if item.category_fk:
            cats.append(item.category_fk.name)
        cats.extend(item.tags.values_list("name", flat=True))
        return cats
