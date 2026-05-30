# Ecodeed Academy Django configuration package.

# ─────────────────────────────────────────────────────────────────────────────
# Celery Setup
# ─────────────────────────────────────────────────────────────────────────────
# Import Celery app on Django startup so it's available when the application
# loads. This ensures background tasks are ready to be queued and processed.
# Without this, Celery won't be initialized when views try to queue tasks.

from .celery import app as celery_app

__all__ = ('celery_app',)
