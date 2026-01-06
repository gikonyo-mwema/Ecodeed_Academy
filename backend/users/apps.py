"""
Users App Configuration.

This module contains the Django app configuration for the users application.
It handles app-specific settings and signal registration.
"""

from django.apps import AppConfig


class UsersConfig(AppConfig):
    """
    Configuration class for the Users application.

    Attributes:
        default_auto_field (str): The default primary key field type.
        name (str): The name of the application.

    Methods:
        ready: Called when Django starts, used to register signals.
    """

    default_auto_field = "django.db.models.BigAutoField"
    name = "users"

    def ready(self):
        """
        Perform initialization when the app is ready.

        Imports the signals module to register signal handlers.
        This ensures signals are connected when Django starts.
        """
        import users.signals  # noqa: F401
