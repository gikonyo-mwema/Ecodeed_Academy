"""
User Authentication URL Configuration.

This module defines URL patterns for user-related endpoints including
registration, authentication, profile management, admin operations,
and social authentication (Google, Facebook, Twitter/X).

URL Patterns:
    - register/: User registration endpoint
    - login/: User login endpoint
    - logout/: User logout endpoint
    - profile/: User profile retrieval
    - profile/update/: User profile update
    - users/: Admin-only user list
    - users/<int:pk>/: Admin-only user detail/update/delete
    - social/google/: Google OAuth authentication
    - social/facebook/: Facebook OAuth authentication
    - social/twitter/: Twitter/X OAuth authentication
    - social/twitter/login/: Twitter OAuth login initiation
    - social/twitter/callback/: Twitter OAuth callback handler
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .social_auth import (
    GoogleSocialAuthView,
    FacebookSocialAuthView,
    TwitterLoginView,
    TwitterCallbackView,
    TwitterSocialAuthView,
)


router = DefaultRouter()

urlpatterns = [
        path('', include(router.urls)),
        path('register/', views.UserRegistrationView.as_view(), name='register'),
        path('login/', views.UserLoginView.as_view(), name='login'),
        path('logout/', views.LogoutView.as_view(), name='logout'),
        path('profile/', views.UserProfileView.as_view(), name='profile'),
        path('profile/update/', views.UserProfileUpdateView.as_view(), name='profile-update'),

        # Admin only endpoints
        path('users/', views.UserListView.as_view(), name='user-list'),
        path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),

        # Social authentication endpoints
        path('social/google/', GoogleSocialAuthView.as_view(), name='social-google'),
        path('social/facebook/', FacebookSocialAuthView.as_view(), name='social-facebook'),
        path('social/twitter/', TwitterSocialAuthView.as_view(), name='social-twitter'),
        path('social/twitter/login/', TwitterLoginView.as_view(), name='social-twitter-login'),
        path('social/twitter/callback/', TwitterCallbackView.as_view(), name='social-twitter-callback'),
]

