"""
═══════════════════════════════════════════════════════════════════════════════
CUSTOM USER MODELS FOR ECODEED ACADEMY

This module defines a custom user model that extends Django's AbstractBaseUser
and PermissionsMixin to provide email-based authentication instead of the
default username-based authentication.

═══════════════════════════════════════════════════════════════════════════════
MODELS OVERVIEW
═══════════════════════════════════════════════════════════════════════════════

CustomUser:
  - Main user model with role-based access control
  - Email-based authentication (no username field)
  - Supports multiple user types: Student, Mentor/Instructor, Admin, Reader
  - Tracks enrollment status and certificate tracking
  - Integration with social authentication

UserManager:
  - Custom manager for user creation and management
  - Email-based user creation (not username-based)
  - Superuser creation with elevated permissions

═══════════════════════════════════════════════════════════════════════════════
USER ROLES & PERMISSIONS
═══════════════════════════════════════════════════════════════════════════════

Fields that determine user role:
  - is_superuser: Full admin access to entire platform
  - is_staff: Access to Django admin interface
  - is_admin: Platform admin (manages users, courses, content)
  - is_instructor: Can create and teach courses
  - has_enrollments: Student flag (enrolled in at least one course)

Role Hierarchy:
  Admin (is_admin) > Instructor (is_instructor) > Student (has_enrollments) > Reader

Each role has specific permissions enforced at the view level.

═══════════════════════════════════════════════════════════════════════════════
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class UserManager(BaseUserManager):
    """
    ═════════════════════════════════════════════════════════════════════════════
    CUSTOM USER MANAGER
    
    Manages user creation using email as the unique identifier instead of username.
    Provides methods for creating regular users and superusers.
    
    ═════════════════════════════════════════════════════════════════════════════
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """
        CREATE REGULAR USER
        
        Creates and saves a regular user with the given email and password.
        This method handles password hashing and email normalization.
        
        Args:
            email (str): 
              - User's email address (required, must be unique)
              - Will be normalized (lowercased) before storage
            password (str, optional): 
              - User's password (will be hashed with PBKDF2)
              - Can be None for social authentication users
            **extra_fields: 
              - Additional user model fields (e.g., username, first_name, last_name)
        
        Returns:
            CustomUser: The newly created and saved user instance
        
        Raises:
            ValueError: If email field is not provided
        
        Example:
            user = User.objects.create_user(
                email='student@example.com',
                password='securepass123'
            )
        """
        if not email:
            raise ValueError('The Email field must be set')
        
        # Normalize email: lowercase domain part (user@EXAMPLE.COM → user@example.com)
        email = self.normalize_email(email)
        
        # Create user instance with provided fields
        user = self.model(email=email, **extra_fields)
        
        # Hash password using Django's password hasher
        # set_password(None) is safe and creates an unusable password
        user.set_password(password)
        
        # Save to database (using allows testing with multiple databases)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        CREATE SUPERUSER
        
        Creates and saves a superuser with full platform access.
        Superusers have is_staff and is_superuser flags set to True.
        
        Args:
            email (str): Superuser's email address (required)
            password (str, optional): Superuser's password
            **extra_fields: Additional user model fields
        
        Returns:
            CustomUser: The newly created superuser instance
        
        Raises:
            ValueError: If is_staff or is_superuser is not True
        
        Example:
            admin = User.objects.create_superuser(
                email='admin@example.com',
                password='adminpass123'
            )
        """
        # Set default values for superuser permissions
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        # Validate that superuser has required permissions
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
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
        STUDENT = 'STUDENT', 'Student'
        MENTOR = 'MENTOR', 'Mentor'
        ADMIN = 'ADMIN', 'Admin'
        READER = 'READER', 'Reader'

    # ==================== Authentication Fields ====================
    # Primary identifier for authentication (replaces username)
    email = models.EmailField(
        unique=True,
        help_text='Required. Enter a valid email address.'
    )
    
    # ==================== Personal Information ====================
    first_name = models.CharField(
        max_length=30,
        help_text='User\'s first name (max 30 characters).'
    )
    last_name = models.CharField(
        max_length=30,
        help_text='User\'s last name (max 30 characters).'
    )
    
    # User role/type - determines access permissions within the application
    user_type = models.CharField(
        max_length=10,
        choices=UserType.choices,
        default=UserType.READER,
        help_text='The role of the user in the system.'
    )

    # ==================== Profile Fields ====================
    # Optional profile customization fields
    profile_picture = models.URLField(
        max_length=1000,
        blank=True,
        default='',
        help_text='Cloudinary URL for the user profile picture.',
    )
    bio = models.TextField(
        max_length=500,
        blank=True,
        help_text='Optional biography or description (max 500 characters).'
    )
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        help_text='Optional contact phone number.'
    )

    # ==================== Social Authentication Fields ====================
    # Store OAuth provider IDs for social login functionality
    google_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Google OAuth user ID for social authentication.'
    )
    facebook_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Facebook OAuth user ID for social authentication.'
    )
    twitter_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Twitter OAuth user ID for social authentication.'
    )

    # ==================== Status Fields ====================
    # Control user account status and permissions
    is_active = models.BooleanField(
        default=True,
        help_text='Whether this user account is active. Deactivate instead of deleting.'
    )
    is_staff = models.BooleanField(
        default=False,
        help_text='Whether the user can access the Django admin interface.'
    )
    is_superuser = models.BooleanField(
        default=False,
        help_text='Whether the user has all permissions without explicit assignment.'
    )

    # ==================== Timestamp Fields ====================
    date_joined = models.DateTimeField(
        default=timezone.now,
        help_text='The date and time when the user account was created.'
    )
    last_login = models.DateTimeField(
        null=True,
        blank=True,
        help_text='The date and time of the user\'s last login.'
    )

    # ==================== Model Configuration ====================
    # Assign the custom manager to handle user creation
    objects = UserManager()

    # Use email as the unique identifier for authentication
    USERNAME_FIELD = 'email'
    
    # Fields required when creating a user via createsuperuser command
    # (email is already required as USERNAME_FIELD)
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        """Model metadata options."""
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['user_type']),
            models.Index(fields=['is_active', 'user_type']),
            models.Index(fields=['-date_joined']),
        ]

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

