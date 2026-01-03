"""
Social Authentication Views for Ecodeed Academy.

This module provides API views for social authentication (Google, Facebook, Twitter/X)
using OAuth protocols. Each provider has a dedicated view that handles user authentication
and account creation/linking.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.conf import settings
import requests
import secrets
import hashlib
import base64
from urllib.parse import urlencode

from .serializers import UserSerializer

User = get_user_model()


class BaseSocialAuthView(APIView):
    """
    Base class for social authentication views.

    Provides common functionality for creating/updating users
    and generating JWT tokens.
    """

    permission_classes = [AllowAny]

    def get_or_create_user(
        self,
        email,
        first_name,
        last_name,
        social_id_field,
        social_id,
        profile_picture="",
    ):
        """
        Get existing user or create a new one for social authentication.

        Args:
            email (str): User's email address.
            first_name (str): User's first name.
            last_name (str): User's last name.
            social_id_field (str): The model field name for the social ID (e.g., 'google_id').
            social_id (str): The social provider's unique user ID.
            profile_picture (str): URL to the user's profile picture.

        Returns:
            tuple: (user, created) where user is the User instance and created is a boolean.
        """
        # Try to find user by social ID first
        filter_kwargs = {social_id_field: social_id}
        user = User.objects.filter(**filter_kwargs).first()

        if user:
            return user, False

        # Try to find user by email
        user = User.objects.filter(email=email).first()

        if user:
            # Link social account to existing user
            setattr(user, social_id_field, social_id)
            if profile_picture and not user.profile_picture:
                user.profile_picture = profile_picture
            user.save()
            return user, False

        # Create new user
        user = User.objects.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=None,  # Social auth users don't have a password
            **{social_id_field: social_id},
        )

        if profile_picture:
            user.profile_picture = profile_picture
            user.save()

        return user, True

    def generate_tokens(self, user):
        """
        Generate JWT tokens for a user.

        Args:
            user: The User instance.

        Returns:
            dict: Dictionary containing 'access' and 'refresh' tokens.
        """
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

    def create_response(self, user, tokens, created=False):
        """
        Create a standardized API response for social auth.

        Args:
            user: The User instance.
            tokens (dict): JWT tokens.
            created (bool): Whether a new user was created.

        Returns:
            Response: DRF Response object.
        """
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "created": created,
            },
            status=status_code,
        )


class GoogleSocialAuthView(BaseSocialAuthView):
    """
    Handle Google OAuth authentication.

    This view receives user data from the frontend (after Firebase Google auth)
    and creates/updates the user in the database.

    Request Body:
        - email (str): User's email from Google.
        - first_name (str): User's first name.
        - last_name (str): User's last name.
        - google_id (str): Google's unique user ID.
        - profile_picture (str, optional): URL to Google profile picture.

    Returns:
        200/201: User data with JWT tokens.
        400: Validation error.
    """

    def post(self, request):
        """Process Google authentication data."""
        email = request.data.get("email")
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        google_id = request.data.get("google_id", "")
        profile_picture = request.data.get("profile_picture", "")

        if not email:
            return Response(
                {"error": "Email is required for Google authentication."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If no google_id provided, generate one from email (for Firebase flow)
        if not google_id:
            google_id = f"google_{hashlib.sha256(email.encode()).hexdigest()[:20]}"

        user, created = self.get_or_create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            social_id_field="google_id",
            social_id=google_id,
            profile_picture=profile_picture,
        )

        tokens = self.generate_tokens(user)
        return self.create_response(user, tokens, created)


class FacebookSocialAuthView(BaseSocialAuthView):
    """
    Handle Facebook OAuth authentication.

    This view receives user data from the frontend (after Facebook SDK auth)
    and creates/updates the user in the database.

    Request Body:
        - email (str): User's email from Facebook.
        - first_name (str): User's first name.
        - last_name (str): User's last name.
        - facebook_id (str): Facebook's unique user ID.
        - profile_picture (str, optional): URL to Facebook profile picture.

    Returns:
        200/201: User data with JWT tokens.
        400: Validation error.
    """

    def post(self, request):
        """Process Facebook authentication data."""
        email = request.data.get("email")
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        facebook_id = request.data.get("facebook_id", "")
        profile_picture = request.data.get("profile_picture", "")

        # Facebook might not always provide email
        if not email and not facebook_id:
            return Response(
                {"error": "Email or Facebook ID is required for authentication."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate placeholder email if not provided
        if not email:
            email = f"fb_{facebook_id}@facebook.placeholder.com"

        user, created = self.get_or_create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            social_id_field="facebook_id",
            social_id=facebook_id,
            profile_picture=profile_picture,
        )

        tokens = self.generate_tokens(user)
        return self.create_response(user, tokens, created)


class TwitterLoginView(APIView):
    """
    Initiate Twitter/X OAuth 2.0 PKCE flow.

    Returns the authorization URL for the frontend to redirect the user to Twitter.

    Returns:
        200: Authorization URL and state for CSRF protection.
        500: Configuration error.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        """Generate Twitter OAuth authorization URL."""
        client_id = getattr(
            settings, "TWITTER_CLIENT_ID", None
        ) or settings.SOCIALACCOUNT_PROVIDERS.get("twitter", {}).get("APP", {}).get(
            "client_id"
        )

        if not client_id:
            return Response(
                {"error": "Twitter OAuth is not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Generate PKCE code verifier and challenge
        code_verifier = secrets.token_urlsafe(32)
        code_challenge = (
            base64.urlsafe_b64encode(hashlib.sha256(code_verifier.encode()).digest())
            .rstrip(b"=")
            .decode()
        )

        # Generate state for CSRF protection
        state = secrets.token_urlsafe(16)

        # Store in session for callback verification
        request.session["twitter_oauth_state"] = state
        request.session["twitter_code_verifier"] = code_verifier

        # Build callback URL
        callback_url = request.build_absolute_uri("/api/auth/social/twitter/callback/")

        # Twitter OAuth 2.0 authorization URL
        params = {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": callback_url,
            "scope": "tweet.read users.read offline.access",
            "state": state,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
        }

        auth_url = f"https://twitter.com/i/oauth2/authorize?{urlencode(params)}"

        return Response(
            {
                "auth_url": auth_url,
                "state": state,
            }
        )


class TwitterCallbackView(BaseSocialAuthView):
    """
    Handle Twitter/X OAuth 2.0 callback.

    Exchanges the authorization code for tokens and creates/updates the user.

    Request Body:
        - code (str): Authorization code from Twitter.
        - state (str): State parameter for CSRF verification.

    Returns:
        200/201: User data with JWT tokens.
        400: Validation or authentication error.
    """

    def post(self, request):
        """Process Twitter OAuth callback."""
        code = request.data.get("code")
        state = request.data.get("state")

        if not code:
            return Response(
                {"error": "Authorization code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify state
        stored_state = request.session.get("twitter_oauth_state")
        code_verifier = request.session.get("twitter_code_verifier")

        if not stored_state or state != stored_state:
            return Response(
                {"error": "Invalid state parameter. Possible CSRF attack."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get client credentials
        client_id = getattr(
            settings, "TWITTER_CLIENT_ID", None
        ) or settings.SOCIALACCOUNT_PROVIDERS.get("twitter", {}).get("APP", {}).get(
            "client_id"
        )
        client_secret = getattr(
            settings, "TWITTER_CLIENT_SECRET", None
        ) or settings.SOCIALACCOUNT_PROVIDERS.get("twitter", {}).get("APP", {}).get(
            "secret"
        )

        callback_url = request.build_absolute_uri("/api/auth/social/twitter/callback/")

        # Exchange code for tokens
        token_url = "https://api.twitter.com/2/oauth2/token"
        token_data = {
            "code": code,
            "grant_type": "authorization_code",
            "client_id": client_id,
            "redirect_uri": callback_url,
            "code_verifier": code_verifier,
        }

        # Basic auth with client credentials
        auth = (client_id, client_secret) if client_secret else None

        try:
            token_response = requests.post(
                token_url,
                data=token_data,
                auth=auth,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            token_response.raise_for_status()
            tokens = token_response.json()
        except requests.RequestException as e:
            return Response(
                {"error": f"Failed to exchange authorization code: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get user info from Twitter
        access_token = tokens.get("access_token")
        user_url = "https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url"

        try:
            user_response = requests.get(
                user_url, headers={"Authorization": f"Bearer {access_token}"}
            )
            user_response.raise_for_status()
            twitter_user = user_response.json().get("data", {})
        except requests.RequestException as e:
            return Response(
                {"error": f"Failed to get user info: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Parse Twitter user data
        twitter_id = twitter_user.get("id", "")
        name = twitter_user.get("name", "")
        username = twitter_user.get("username", "")
        profile_image = twitter_user.get("profile_image_url", "").replace("_normal", "")

        # Twitter might not provide email
        # Generate placeholder email using Twitter username
        email = f"{username}@twitter.placeholder.com"

        # Split name into first and last
        name_parts = name.split(" ", 1)
        first_name = name_parts[0] if name_parts else username
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        user, created = self.get_or_create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            social_id_field="twitter_id",
            social_id=twitter_id,
            profile_picture=profile_image,
        )

        # Clear session data
        request.session.pop("twitter_oauth_state", None)
        request.session.pop("twitter_code_verifier", None)

        jwt_tokens = self.generate_tokens(user)
        return self.create_response(user, jwt_tokens, created)


class TwitterSocialAuthView(BaseSocialAuthView):
    """
    Handle direct Twitter/X authentication data.

    This is an alternative endpoint for frontend-handled Twitter auth.

    Request Body:
        - email (str, optional): User's email.
        - first_name (str): User's first name.
        - last_name (str): User's last name.
        - twitter_id (str): Twitter's unique user ID.
        - profile_picture (str, optional): URL to Twitter profile picture.

    Returns:
        200/201: User data with JWT tokens.
        400: Validation error.
    """

    def post(self, request):
        """Process Twitter authentication data."""
        email = request.data.get("email", "")
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        twitter_id = request.data.get("twitter_id", "")
        profile_picture = request.data.get("profile_picture", "")

        if not twitter_id:
            return Response(
                {"error": "Twitter ID is required for authentication."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate placeholder email if not provided
        if not email:
            email = f"twitter_{twitter_id}@twitter.placeholder.com"

        user, created = self.get_or_create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            social_id_field="twitter_id",
            social_id=twitter_id,
            profile_picture=profile_picture,
        )

        tokens = self.generate_tokens(user)
        return self.create_response(user, tokens, created)
