"""
Custom User Models for Ecodeed Academy

This module defines a custom user model that extends Django's AbstractBaseUser
and PermissionsMixin to provide email-based authentication instead of the
default username-based authentication.

Models:
    - CustomUser: The main user model with different user types (Student, Mentor, Admin, Reader)
    - UserManager: Custom manager for creating regular users and superusers
"""

from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.utils import timezone


class UserManager(BaseUserManager):
    """
    Custom manager for CustomUser model.

    This manager provides methods to create regular users and superusers
    using email as the unique identifier instead of username.

    Methods:
        create_user: Creates and saves a regular user with the given email and password.
        create_superuser: Creates and saves a superuser with elevated permissions.
    """

    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a regular user with the given email and password.

        Args:
            email (str): The user's email address (required, must be unique).
            password (str, optional): The user's password. Will be hashed before storage.
            **extra_fields: Additional fields to be set on the user model.

        Returns:
            CustomUser: The newly created user instance.

        Raises:
            ValueError: If the email field is not provided.
        """
        if not email:
            raise ValueError("The Email field must be set")

        # Normalize email by lowercasing the domain part
        email = self.normalize_email(email)

        # Create user instance with provided fields
        user = self.model(email=email, **extra_fields)

        # Hash the password before saving (handles None passwords for social auth)
        user.set_password(password)

        # Save to database using the current database connection
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a superuser with the given email and password.

        Superusers have full access to the admin interface and all permissions.

        Args:
            email (str): The superuser's email address (required).
            password (str, optional): The superuser's password.
            **extra_fields: Additional fields to be set on the user model.

        Returns:
            CustomUser: The newly created superuser instance.

        Raises:
            ValueError: If is_staff or is_superuser is not True.
        """
        # Set default values for superuser permissions
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        # Validate that superuser has required permissions
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        # Use create_user method to create the superuser
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for Ecodeed Academy.

    This model uses email as the unique identifier for authentication
    instead of the default username. It supports multiple user types
    and includes fields for social authentication and user profiles.

    Attributes:
        email (EmailField): Primary identifier for authentication (unique).
        first_name (CharField): User's first name.
        last_name (CharField): User's last name.
        user_type (CharField): Role of the user (Student, Mentor, Admin, Reader).
        profile_picture (ImageField): Optional profile image.
        bio (TextField): Optional biography/description.
        phone_number (CharField): Optional contact number.
        google_id (CharField): Google OAuth identifier for social login.
        facebook_id (CharField): Facebook OAuth identifier for social login.
        twitter_id (CharField): Twitter OAuth identifier for social login.
        is_active (BooleanField): Whether the user account is active.
        is_staff (BooleanField): Whether the user can access the admin site.
        is_superuser (BooleanField): Whether the user has all permissions.
        date_joined (DateTimeField): When the user account was created.
        last_login (DateTimeField): When the user last logged in.

    User Types:
        - STUDENT: Enrolled learners who can access courses
        - MENTOR: Instructors who can create and manage courses
        - ADMIN: Administrators with elevated management permissions
        - READER: Basic users who can read blog posts (default)
    """

    class UserType(models.TextChoices):
        """
        Enumeration of available user types/roles.

        Each choice is a tuple of (stored_value, human_readable_label).
        """

        STUDENT = "STUDENT", "Student"
        MENTOR = "MENTOR", "Mentor"
        ADMIN = "ADMIN", "Admin"
        READER = "READER", "Reader"

    # ==================== Authentication Fields ====================
    # Primary identifier for authentication (replaces username)
    email = models.EmailField(
        unique=True, help_text="Required. Enter a valid email address."
    )

    # ==================== Personal Information ====================
    first_name = models.CharField(
        max_length=30, help_text="User's first name (max 30 characters)."
    )
    last_name = models.CharField(
        max_length=30, help_text="User's last name (max 30 characters)."
    )

    # User role/type - determines access permissions within the application
    user_type = models.CharField(
        max_length=10,
        choices=UserType.choices,
        default=UserType.READER,
        help_text="The role of the user in the system.",
    )

    # ==================== Profile Fields ====================
    # Optional profile customization fields
    profile_picture = models.ImageField(
        upload_to="profile_pics/",
        null=True,
        blank=True,
        help_text="Optional profile picture. Uploaded to profile_pics/ directory.",
    )
    bio = models.TextField(
        max_length=500,
        blank=True,
        help_text="Optional biography or description (max 500 characters).",
    )
    phone_number = models.CharField(
        max_length=15, blank=True, help_text="Optional contact phone number."
    )

    # ==================== Social Authentication Fields ====================
    # Store OAuth provider IDs for social login functionality
    google_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Google OAuth user ID for social authentication.",
    )
    facebook_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Facebook OAuth user ID for social authentication.",
    )
    twitter_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Twitter OAuth user ID for social authentication.",
    )

    # ==================== Status Fields ====================
    # Control user account status and permissions
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this user account is active. Deactivate instead of deleting.",
    )
    is_staff = models.BooleanField(
        default=False,
        help_text="Whether the user can access the Django admin interface.",
    )
    is_superuser = models.BooleanField(
        default=False,
        help_text="Whether the user has all permissions without explicit assignment.",
    )

    # ==================== Timestamp Fields ====================
    date_joined = models.DateTimeField(
        default=timezone.now,
        help_text="The date and time when the user account was created.",
    )
    last_login = models.DateTimeField(
        null=True, blank=True, help_text="The date and time of the user's last login."
    )

    # ==================== Model Configuration ====================
    # Assign the custom manager to handle user creation
    objects = UserManager()

    # Use email as the unique identifier for authentication
    USERNAME_FIELD = "email"

    # Fields required when creating a user via createsuperuser command
    # (email is already required as USERNAME_FIELD)
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        """Model metadata options."""

        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-date_joined"]

    def __str__(self):
        """
        Return string representation of the user.

        Returns:
            str: The user's email address.
        """
        return self.email

    def get_full_name(self):
        """
        Return the user's full name.

        Returns:
            str: First name and last name separated by a space.
        """
        return f"{self.first_name} {self.last_name}"

    def get_short_name(self):
        """
        Return the user's short name (first name only).

        Returns:
            str: The user's first name.
        """
        return self.first_name

    # ==================== Role Check Properties ====================
    @property
    def is_student(self):
        """
        Check if the user is a student.

        Returns:
            bool: True if user_type is STUDENT, False otherwise.
        """
        return self.user_type == self.UserType.STUDENT

    @property
    def is_mentor(self):
        """
        Check if the user is a mentor.

        Returns:
            bool: True if user_type is MENTOR, False otherwise.
        """
        return self.user_type == self.UserType.MENTOR

    @property
    def is_admin(self):
        """
        Check if the user is an admin.

        Returns:
            bool: True if user_type is ADMIN, False otherwise.
        """
        return self.user_type == self.UserType.ADMIN

    @property
    def is_reader(self):
        """
        Check if the user is a reader.

        Returns:
            bool: True if user_type is READER, False otherwise.
        """
        return self.user_type == self.UserType.READER
