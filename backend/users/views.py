"""
User Authentication and Management Views.

This module provides API views for user authentication, registration,
profile management, and administrative user operations using Django REST
Framework and SimpleJWT for token-based authentication.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
        UserSerializer, UserRegistrationSerializer,
        UserLoginSerializer, UserProfileUpdateSerializer
)

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """
    Handle user registration.

    Allows any user to create a new account. Upon successful registration,
    returns the user data along with JWT refresh and access tokens.

    Permissions:
        AllowAny - No authentication required.

    Request Body:
        - email (str): User's email address.
        - password (str): User's password.
        - Additional fields as defined in UserRegistrationSerializer.

    Returns:
        201 Created: User data with refresh and access tokens.
        400 Bad Request: Validation errors.
    """

    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """Create a new user and return JWT tokens."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    """
    Handle user login.

    Authenticates a user with their credentials and returns JWT tokens
    upon successful authentication.

    Permissions:
        AllowAny - No authentication required.

    Request Body:
        - email (str): User's email address.
        - password (str): User's password.

    Returns:
        200 OK: User data with refresh and access tokens.
        400 Bad Request: Invalid credentials or validation errors.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Authenticate user and return JWT tokens."""
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the authenticated user's profile.

    Allows authenticated users to view and update their own profile information.

    Permissions:
        IsAuthenticated - User must be logged in.

    Methods:
        GET: Retrieve the current user's profile.
        PUT/PATCH: Update the current user's profile.

    Returns:
        200 OK: User profile data.
        401 Unauthorized: User not authenticated.
    """

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Return the currently authenticated user."""
        return self.request.user


class UserProfileUpdateView(generics.UpdateAPIView):
    """
    Update the authenticated user's profile with extended fields.

    Provides a dedicated endpoint for profile updates using a specialized
    serializer that may include additional updateable fields.

    Permissions:
        IsAuthenticated - User must be logged in.

    Methods:
        PUT/PATCH: Update the current user's profile.

    Returns:
        200 OK: Updated user profile data.
        401 Unauthorized: User not authenticated.
        400 Bad Request: Validation errors.
    """

    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Return the currently authenticated user."""
        return self.request.user


class UserListView(generics.ListAPIView):
    """
    List all users (Admin only).

    Provides administrators with a list of all registered users.

    Permissions:
        IsAdminUser - Only admin users can access this endpoint.

    Methods:
        GET: Retrieve a list of all users.

    Returns:
        200 OK: List of user objects.
        403 Forbidden: User is not an admin.
    """

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific user (Admin only).

    Provides administrators with full CRUD operations on individual users.

    Permissions:
        IsAdminUser - Only admin users can access this endpoint.

    URL Parameters:
        pk (int): The primary key of the user.

    Methods:
        GET: Retrieve a specific user's details.
        PUT/PATCH: Update a specific user's information.
        DELETE: Remove a user from the system.

    Returns:
        200 OK: User data (GET, PUT, PATCH).
        204 No Content: User successfully deleted (DELETE).
        403 Forbidden: User is not an admin.
        404 Not Found: User does not exist.
    """

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()


class LogoutView(APIView):
    """
    Handle user logout.

    Blacklists the provided refresh token to invalidate the user's session.
    The access token will remain valid until it expires, but the refresh
    token can no longer be used to obtain new access tokens.

    Permissions:
        IsAuthenticated - User must be logged in.

    Request Body:
        - refresh (str): The refresh token to blacklist.

    Returns:
        205 Reset Content: Logout successful.
        400 Bad Request: Invalid or missing refresh token.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Blacklist the refresh token to log out the user."""
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

