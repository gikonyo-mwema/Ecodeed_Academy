"""
Lightweight background scheduler for periodic post tasks.

Replaces Celery Beat + Worker with a single daemon thread that runs
inside the Django backend process. This avoids the need for Redis,
Celery Worker, and Celery Beat containers.

The scheduler is started once from PostsConfig.ready() and runs
publish_scheduled_posts every 60 seconds.
"""

import logging
import threading

from django.utils import timezone

logger = logging.getLogger(__name__)

_scheduler_started = False
_lock = threading.Lock()

PUBLISH_INTERVAL = 60  # seconds


def publish_scheduled_posts():
    """Publish all posts with status='scheduled' whose scheduled_for <= now."""
    from posts.models import Post  # local import to avoid AppRegistryNotReady

    now = timezone.now()
    count = Post.objects.filter(
        status=Post.Status.SCHEDULED,
        scheduled_for__isnull=False,
        scheduled_for__lte=now,
    ).update(
        status=Post.Status.PUBLISHED,
        published_at=now,
    )

    if count:
        logger.info("Published %d scheduled post(s).", count)


def _tick():
    """Execute the periodic task and re-schedule the next run."""
    try:
        publish_scheduled_posts()
    except Exception:
        logger.exception("Error in scheduled post publisher")
    # Schedule the next tick
    timer = threading.Timer(PUBLISH_INTERVAL, _tick)
    timer.daemon = True
    timer.start()


def start():
    """
    Start the background scheduler (idempotent — safe to call multiple times).

    Only starts once, even if called from multiple threads or if Django's
    auto-reloader imports the module more than once.
    """
    global _scheduler_started
    with _lock:
        if _scheduler_started:
            return
        _scheduler_started = True

    logger.info("Starting background post scheduler (every %ds).", PUBLISH_INTERVAL)
    timer = threading.Timer(PUBLISH_INTERVAL, _tick)
    timer.daemon = True  # Dies when the main process exits
    timer.start()
