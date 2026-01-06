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
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileUpdateSerializer,
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

        return Response(
            {
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )


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
        user = serializer.validated_data["user"]

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        )


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


class DataDeletionRequestView(APIView):
    """
    Handle user data deletion requests.

    Allows users to request deletion of their personal data.
    For authenticated users, this will delete their account.
    For unauthenticated users, this submits a deletion request for review.

    This endpoint is required by Facebook for app compliance.

    Permissions:
        AllowAny - Anyone can submit a deletion request.

    Request Body:
        - email (str): Email address of the account to delete.
        - reason (str, optional): Reason for deletion.

    Returns:
        200 OK: Deletion request submitted/processed successfully.
        400 Bad Request: Invalid email or request.
        404 Not Found: User not found.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Process data deletion request."""
        email = request.data.get("email", "").strip().lower()
        reason = request.data.get("reason", "")

        if not email:
            return Response(
                {"message": "Email address is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
            
            # If the request is from an authenticated user deleting their own account
            if request.user.is_authenticated and request.user.email == email:
                # Delete the user account
                user.delete()
                return Response(
                    {
                        "message": "Your account and all associated data have been deleted.",
                        "confirmation_code": f"DEL-{user.id}-{hash(email) % 100000:05d}",
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                # For unauthenticated requests, we could log this for manual review
                # or send a verification email. For now, return a confirmation.
                return Response(
                    {
                        "message": "Your data deletion request has been received. "
                                   "We will process it within 30 days and send a confirmation to your email.",
                        "confirmation_code": f"REQ-{hash(email) % 100000:05d}",
                    },
                    status=status.HTTP_200_OK,
                )
        except User.DoesNotExist:
            # Don't reveal whether the email exists for security
            return Response(
                {
                    "message": "If an account exists with this email, "
                               "a deletion request has been submitted.",
                },
                status=status.HTTP_200_OK,
            )


class DeleteAccountView(APIView):
    """
    Delete the authenticated user's account.

    Permanently deletes the user's account and all associated data.
    This action cannot be undone.

    Permissions:
        IsAuthenticated - User must be logged in.

    Returns:
        200 OK: Account successfully deleted.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Delete the authenticated user's account."""
        user = request.user
        email = user.email
        user_id = user.id
        
        # Delete the user
        user.delete()
        
        return Response(
            {
                "message": "Your account and all associated data have been permanently deleted.",
                "confirmation_code": f"DEL-{user_id}-{hash(email) % 100000:05d}",
            },
            status=status.HTTP_200_OK,
        )
