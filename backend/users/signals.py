"""
Signal Handlers for User Model Events.

This module defines Django signals that respond to user-related events.
Currently handles automatic token creation for new users.

Signals:
    - create_auth_token: Creates an authentication token when a user is created.

Note:
    Signals are automatically connected when the users app is ready,
    as configured in users/apps.py.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()


@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    """
    Create an authentication token for newly registered users.

    This signal is triggered after a User instance is saved to the database.
    When a new user is created, it automatically generates an auth token
    that can be used for API authentication.

    Args:
        sender (Model): The model class that sent the signal (User).
        instance (User, optional): The actual user instance being saved.
        created (bool): True if a new record was created, False if updated.
        **kwargs: Additional keyword arguments passed by the signal.

    Returns:
        None
    """
    if created:
        Token.objects.create(user=instance)
