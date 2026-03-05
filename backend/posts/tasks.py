"""
Periodic tasks for the posts app.

The publish_scheduled_posts function is called automatically by the
lightweight background scheduler (posts/scheduler.py) every 60 seconds.
No Celery or Redis required.
"""

from posts.scheduler import publish_scheduled_posts

__all__ = ["publish_scheduled_posts"]
