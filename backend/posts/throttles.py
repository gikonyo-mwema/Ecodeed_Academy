"""
Custom throttle classes for the posts API.

Prevents abuse of expensive endpoints (image upload, view counting)
while keeping read endpoints fast and unthrottled.
"""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class ImageUploadThrottle(UserRateThrottle):
    """Limit image uploads to 30/hour per authenticated user."""
    rate = "30/hour"
    scope = "image_upload"


class ViewCountThrottle(AnonRateThrottle):
    """
    Limit how often the same IP can increment a post's view counter.
    Prevents inflating view counts via refresh-spam.
    1 view-count per post per IP per minute.
    """
    rate = "60/min"
    scope = "view_count"

    def get_cache_key(self, request, view):
        """Include the post PK so the throttle is per-post, not global."""
        pk = view.kwargs.get("pk", "unknown")
        ident = self.get_ident(request)
        return f"throttle_viewcount_{pk}_{ident}"


class PostWriteThrottle(UserRateThrottle):
    """Limit post create/update to 20/hour for admins (anti-spam)."""
    rate = "20/hour"
    scope = "post_write"
