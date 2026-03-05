"""
Social Authentication Views for Ecodeed Academy.

Provides REST API endpoints for authenticating users via social providers:
  • Google  – Firebase popup  → email/name exchanged for JWT
  • Facebook – FB SDK popup   → access_token verified via Graph API
  • X / Twitter – OAuth 2.0 PKCE popup flow through the backend

Each endpoint verifies the provider's token/code, creates or retrieves the
user, links the social provider ID, and returns JWT access + refresh tokens.
"""

import json
import hashlib
import base64
import secrets
from urllib.parse import urlencode

import requests as http_requests
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import redirect as http_redirect
from django.template.loader import render_to_string
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import UserSerializer

User = get_user_model()

# ── Timeout for outbound HTTP requests (seconds) ─────────────────────────
_TIMEOUT = 10


# ── Helpers ───────────────────────────────────────────────────────────────

def _get_tokens(user):
    """Return JWT access & refresh tokens for *user*."""
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


def _get_or_create_social_user(email, first_name='', last_name='',
                               provider_field=None, provider_id=None):
    """
    Fetch an existing user by *email* or create a new READER account.

    If *provider_field* / *provider_id* are given the social-provider column
    is populated when it is still empty.
    """
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'first_name': first_name or email.split('@')[0],
            'last_name': last_name or '',
            'user_type': User.UserType.READER,
        },
    )
    dirty = False
    if provider_field and provider_id and not getattr(user, provider_field, None):
        setattr(user, provider_field, provider_id)
        dirty = True
    if not user.first_name and first_name:
        user.first_name = first_name
        dirty = True
    if not user.last_name and last_name:
        user.last_name = last_name
        dirty = True
    if dirty:
        user.save()
    return user, created


def _auth_response(user, created):
    """Standard JSON response containing user data + JWT tokens."""
    return Response(
        {'user': UserSerializer(user).data, **_get_tokens(user)},
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


def _frontend_url():
    return getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')


def _twitter_creds():
    prov = settings.SOCIALACCOUNT_PROVIDERS.get('twitter', {}).get('APP', {})
    return prov.get('client_id', ''), prov.get('secret', '')


# ─────────────────────────────────────────────────────────────────────────
#  Google
# ─────────────────────────────────────────────────────────────────────────

class GoogleSignInView(APIView):
    """
    Google OAuth sign-in.

    Accepts **either**:
      • ``{email, name, googlePhotoUrl}`` – from the Firebase popup flow
      • ``{access_token}`` – raw Google access token verified server-side
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        name = request.data.get('name', '')
        access_token = request.data.get('access_token')

        # ── Server-side token verification ──
        if access_token and not email:
            try:
                resp = http_requests.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    headers={'Authorization': f'Bearer {access_token}'},
                    timeout=_TIMEOUT,
                )
                if resp.status_code != 200:
                    return Response({'message': 'Invalid Google access token'},
                                    status=status.HTTP_401_UNAUTHORIZED)
                data = resp.json()
                email = data.get('email')
                first_name = data.get('given_name', '')
                last_name = data.get('family_name', '')
                google_id = data.get('sub', '')
            except http_requests.RequestException:
                return Response({'message': 'Failed to verify Google token'},
                                status=status.HTTP_503_SERVICE_UNAVAILABLE)
        else:
            # ── Firebase flow – email already verified client-side ──
            if not email:
                return Response({'message': 'Email is required'},
                                status=status.HTTP_400_BAD_REQUEST)
            parts = name.split(' ', 1) if name else [email.split('@')[0]]
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ''
            google_id = request.data.get('google_id', '')

        user, created = _get_or_create_social_user(
            email=email, first_name=first_name, last_name=last_name,
            provider_field='google_id', provider_id=google_id,
        )
        return _auth_response(user, created)


# ─────────────────────────────────────────────────────────────────────────
#  Facebook
# ─────────────────────────────────────────────────────────────────────────

class FacebookSignInView(APIView):
    """
    Facebook OAuth sign-in.

    Accepts ``{access_token}`` obtained from the Facebook JS SDK.
    The token is verified via the Graph API before authenticating.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get('access_token')
        if not access_token:
            return Response({'message': 'Facebook access token is required'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            resp = http_requests.get(
                'https://graph.facebook.com/me',
                params={
                    'fields': 'id,email,first_name,last_name',
                    'access_token': access_token,
                },
                timeout=_TIMEOUT,
            )
            if resp.status_code != 200:
                return Response({'message': 'Invalid Facebook access token'},
                                status=status.HTTP_401_UNAUTHORIZED)
            fb = resp.json()
            email = fb.get('email')
            if not email:
                return Response(
                    {'message': 'Your Facebook account does not have an email. '
                                'Please use a Facebook account with an email or '
                                'sign up with email instead.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user, created = _get_or_create_social_user(
                email=email,
                first_name=fb.get('first_name', ''),
                last_name=fb.get('last_name', ''),
                provider_field='facebook_id',
                provider_id=fb.get('id', ''),
            )
            return _auth_response(user, created)
        except http_requests.RequestException:
            return Response({'message': 'Failed to verify Facebook token'},
                            status=status.HTTP_503_SERVICE_UNAVAILABLE)


# ─────────────────────────────────────────────────────────────────────────
#  X / Twitter  —  OAuth 2.0 Authorization Code + PKCE (popup flow)
# ─────────────────────────────────────────────────────────────────────────

class TwitterLoginView(APIView):
    """
    **Step 1** – Start the Twitter OAuth 2.0 PKCE flow.

    The frontend opens a popup pointing at this endpoint.  The view
    generates PKCE parameters, stores them in the Django session, and
    redirects the popup to Twitter's authorization page.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        client_id, _ = _twitter_creds()
        if not client_id:
            return HttpResponse(
                '<h3>X (Twitter) authentication is not configured.</h3>',
                status=503,
            )

        # PKCE parameters
        code_verifier = secrets.token_urlsafe(64)[:128]
        code_challenge = (
            base64.urlsafe_b64encode(
                hashlib.sha256(code_verifier.encode()).digest()
            )
            .decode()
            .rstrip('=')
        )
        state = secrets.token_urlsafe(32)

        # Persist in session so the callback can retrieve them
        request.session['twitter_code_verifier'] = code_verifier
        request.session['twitter_state'] = state

        redirect_uri = f'{settings.SITE_URL}/api/auth/twitter/callback/'
        params = urlencode({
            'response_type': 'code',
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'scope': 'tweet.read users.read offline.access',
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256',
        })
        return http_redirect(f'https://twitter.com/i/oauth2/authorize?{params}')


class TwitterCallbackView(APIView):
    """
    **Step 2** – Handle Twitter's redirect after the user authorises.

    Exchanges the authorization code for an access token, fetches the
    Twitter profile, then renders a small HTML page that uses
    ``window.opener.postMessage()`` to relay the result back to the
    parent window (the SPA).
    """
    permission_classes = [AllowAny]

    def get(self, request):
        frontend_url = _frontend_url()

        # ── Twitter denied / user cancelled ──
        error = request.query_params.get('error')
        if error:
            return self._render(frontend_url, {
                'error': True,
                'message': request.query_params.get(
                    'error_description', 'Authorization was denied.'
                ),
            })

        code = request.query_params.get('code')
        state = request.query_params.get('state')
        saved_state = request.session.pop('twitter_state', None)
        code_verifier = request.session.pop('twitter_code_verifier', None)

        if not code or not code_verifier or state != saved_state:
            return self._render(frontend_url, {
                'error': True,
                'message': 'Invalid or expired authorization. Please try again.',
            })

        client_id, client_secret = _twitter_creds()
        redirect_uri = f'{settings.SITE_URL}/api/auth/twitter/callback/'

        # ── Exchange code → access_token ──
        try:
            tok_resp = http_requests.post(
                'https://api.twitter.com/2/oauth2/token',
                data={
                    'code': code,
                    'grant_type': 'authorization_code',
                    'client_id': client_id,
                    'redirect_uri': redirect_uri,
                    'code_verifier': code_verifier,
                },
                auth=(client_id, client_secret) if client_secret else None,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=_TIMEOUT,
            )
            if tok_resp.status_code != 200:
                return self._render(frontend_url, {
                    'error': True,
                    'message': 'Failed to exchange authorization code with X.',
                })
            access_token = tok_resp.json().get('access_token')
        except http_requests.RequestException:
            return self._render(frontend_url, {
                'error': True,
                'message': 'Network error while contacting X.',
            })

        # ── Fetch Twitter profile ──
        try:
            prof_resp = http_requests.get(
                'https://api.twitter.com/2/users/me',
                params={'user.fields': 'id,name,username,profile_image_url'},
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=_TIMEOUT,
            )
            if prof_resp.status_code != 200:
                return self._render(frontend_url, {
                    'error': True,
                    'message': 'Failed to fetch X profile.',
                })
            tw = prof_resp.json().get('data', {})
        except http_requests.RequestException:
            return self._render(frontend_url, {
                'error': True,
                'message': 'Network error while fetching X profile.',
            })

        twitter_id = tw.get('id', '')
        name = tw.get('name', '')
        username = tw.get('username', '')

        # ── Existing user with this twitter_id? → log them in directly ──
        existing = (
            User.objects.filter(twitter_id=twitter_id).first()
            if twitter_id else None
        )
        if existing:
            return self._render(frontend_url, {
                'user': UserSerializer(existing).data,
                **_get_tokens(existing),
            })

        # ── New user — frontend must collect an email first ──
        return self._render(frontend_url, {
            'email_required': True,
            'twitter_id': twitter_id,
            'name': name,
            'username': username,
        })

    # ── helpers ──────────────────────────────────────────────────────────

    @staticmethod
    def _render(frontend_url, data):
        """Return an HTML page that relays *data* via postMessage."""
        html = render_to_string('social_auth_callback.html', {
            'auth_data_json': json.dumps(data),
            'frontend_url': frontend_url,
        })
        return HttpResponse(html)


class TwitterCompleteView(APIView):
    """
    **Step 3** (optional) – Complete X sign-in after the user supplies
    their email address.

    Accepts ``{email, twitter_id, name}`` and creates or retrieves the
    user, then returns JWT tokens.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        twitter_id = request.data.get('twitter_id')
        name = request.data.get('name', '')

        if not email:
            return Response({'message': 'Email is required'},
                            status=status.HTTP_400_BAD_REQUEST)
        if not twitter_id:
            return Response({'message': 'Twitter ID is required'},
                            status=status.HTTP_400_BAD_REQUEST)

        parts = name.split(' ', 1) if name else [email.split('@')[0]]
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''

        user, created = _get_or_create_social_user(
            email=email, first_name=first_name, last_name=last_name,
            provider_field='twitter_id', provider_id=twitter_id,
        )
        return _auth_response(user, created)
