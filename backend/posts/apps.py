import os

from django.apps import AppConfig


class PostsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'posts'

    def ready(self):
        """Start the lightweight background scheduler for periodic tasks."""
        # Only start in the main process (skip the reloader child process
        # during development to avoid duplicate schedulers).
        if os.environ.get("RUN_MAIN") == "true" or not os.environ.get("RUN_MAIN"):
            from posts.scheduler import start
            start()
