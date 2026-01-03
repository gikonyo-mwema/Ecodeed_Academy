"""
User Serializers for Authentication and Profile Management.

This module provides serializers for user-related operations including
registration, authentication, profile viewing, and profile updates.
These serializers handle data validation, transformation, and user creation.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile data.

    Used for serializing user information in API responses. Provides
    a read-only view of user data suitable for profile display.

    Fields:
        id (int): Unique user identifier (read-only).
        email (str): User's email address.
        first_name (str): User's first name.
        last_name (str): User's last name.
        user_type (str): Type/role of the user.
        profile_picture (str): URL to user's profile picture.
        bio (str): User's biography/description.
        phone_number (str): User's phone number.
        date_joined (datetime): Account creation timestamp (read-only).
    """

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "user_type",
            "profile_picture",
            "bio",
            "phone_number",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined"]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.

    Handles new user account creation with password validation.
    Ensures password confirmation matches before creating the user.

    Fields:
        email (str): User's email address (required).
        first_name (str): User's first name (required).
        last_name (str): User's last name (required).
        user_type (str): Type/role of the user (optional, defaults to READER).
        password (str): User's password, minimum 8 characters (write-only).
        confirm_password (str): Password confirmation (write-only).

    Raises:
        ValidationError: If passwords don't match.
    """

    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "user_type",
            "password",
            "confirm_password",
        ]

    def validate(self, data):
        """
        Validate that password and confirm_password match.

        Args:
            data (dict): The input data containing password fields.

        Returns:
            dict: Validated data with confirm_password removed.

        Raises:
            ValidationError: If passwords don't match.
        """
        if data["password"] != data.pop("confirm_password"):
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return data

    def create(self, validated_data):
        """
        Create a new user with the validated data.

        Args:
            validated_data (dict): Validated user data.

        Returns:
            User: The newly created user instance.
        """
        user = User.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            user_type=validated_data.get("user_type", User.UserType.READER),
            password=validated_data["password"],
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user authentication.

    Validates user credentials and returns the authenticated user
    if the credentials are valid.

    Fields:
        email (str): User's email address.
        password (str): User's password (write-only).

    Raises:
        ValidationError: If credentials are invalid or user is disabled.
    """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Validate user credentials.

        Checks if the provided email and password match an active user account.

        Args:
            data (dict): Input data containing email and password.

        Returns:
            dict: Validated data with 'user' key containing the authenticated user.

        Raises:
            ValidationError: If email/password missing, invalid, or user disabled.
        """
        email = data.get("email")
        password = data.get("password")

        if email and password:
            user = User.objects.filter(email=email).first()
            if user and user.check_password(password):
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                data["user"] = user
                return data
            raise serializers.ValidationError("Invalid email or password.")
        raise serializers.ValidationError("Must include email and password.")


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile information.

    Allows users to update their personal information excluding
    sensitive fields like email and password.

    Fields:
        first_name (str): User's first name.
        last_name (str): User's last name.
        profile_picture (str): URL to user's profile picture.
        bio (str): User's biography/description.
        phone_number (str): User's phone number.
    """

    class Meta:
        model = User
        fields = ["first_name", "last_name", "profile_picture", "bio", "phone_number"]
