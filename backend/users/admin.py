"""
Admin Configuration for User Models.

This module configures the Django admin interface for user management.
It provides a customized admin view for the CustomUser model with
appropriate list displays, filters, and search capabilities.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Custom admin configuration for the CustomUser model.

    Provides an enhanced admin interface with:
        - Custom list display showing key user information
        - Filtering options for user type and status
        - Search functionality for email and name fields
        - Organized fieldsets for user management
    """

    # Fields displayed in the user list view
    list_display = (
        "email",
        "first_name",
        "last_name",
        "user_type",
        "is_active",
        "is_staff",
        "date_joined",
    )

    # Filters available in the right sidebar
    list_filter = ("user_type", "is_active", "is_staff", "is_superuser", "date_joined")

    # Fields searchable via the search box
    search_fields = ("email", "first_name", "last_name")

    # Default ordering of the user list
    ordering = ("-date_joined",)

    # Fieldsets for the user detail/edit view
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal Info",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "phone_number",
                    "bio",
                    "profile_picture",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "user_type",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Social Auth", {"fields": ("google_id", "facebook_id", "twitter_id")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    # Fieldsets for the add user form
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "user_type",
                ),
            },
        ),
    )
