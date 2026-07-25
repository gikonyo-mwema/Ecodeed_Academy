"""
Periodic tasks for the posts app.

publish_due_posts — promotes posts whose status is 'scheduled' and
scheduled_for <= now to 'published'.  Registered in CELERY_BEAT_SCHEDULE
(config/settings.py) to run every minute via the embedded beat started
in start.sh.

The same logic is also available as a management command for manual /
cron usage:

    python manage.py publish_scheduled
"""

import logging

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(name="posts.publish_due_posts")
def publish_due_posts():
    """Publish all scheduled posts whose scheduled_for time has passed."""
    from posts.models import Post

    now = timezone.now()
    due = Post.objects.filter(
        status=Post.Status.SCHEDULED,
        scheduled_for__isnull=False,
        scheduled_for__lte=now,
    )

    published = 0
    for post in due:
        post.status = Post.Status.PUBLISHED
        post.published_at = post.scheduled_for
        post.save(update_fields=["status", "published_at", "updated_at"])
        published += 1
        logger.info("Auto-published scheduled post: %s (was due %s)", post.title, post.scheduled_for)

    return published
