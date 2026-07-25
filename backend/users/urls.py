"""
═══════════════════════════════════════════════════════════════════════════════
USER URLS — Authentication and profile management endpoints.

URL routing for user-related API endpoints including registration, login,
profile management, and social authentication (Google, Facebook, Twitter).

═══════════════════════════════════════════════════════════════════════════════
ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

Authentication:
  POST   /users/register/              - Register new user
  POST   /users/login/                 - Login with email/password
  POST   /users/logout/                - Logout (invalidate tokens)
  POST   /users/token/refresh/         - Exchange refresh token for new access token
  
Profile Management:
  GET    /users/profile/               - Get current user profile
  PUT    /users/profile/update/        - Update profile (name, picture, bio)

User Management (Admin):
  GET    /users/                       - List all users
  GET    /users/{id}/                  - Get user details
  PATCH  /users/updateRole/{id}/       - Update user role
  DELETE /users/delete/{id}/           - Delete user account

Social Authentication:
  POST   /users/google/                - Google OAuth login
  POST   /users/facebook/              - Facebook OAuth login
  POST   /users/twitter/login/         - Twitter OAuth step 1
  GET    /users/twitter/callback/      - Twitter OAuth step 2
  POST   /users/twitter/complete/      - Twitter OAuth step 3

═══════════════════════════════════════════════════════════════════════════════
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views import UserViewSet
from .social_auth import (
    GoogleSignInView,
    FacebookSignInView,
    TwitterLoginView,
    TwitterCallbackView,
    TwitterCompleteView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
        path('', include(router.urls)),
        path('register/', views.UserRegistrationView.as_view(), name='register'),
        path('login/', views.UserLoginView.as_view(), name='login'),
        path('logout/', views.LogoutView.as_view(), name='logout'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
        path('profile/', views.UserProfileView.as_view(), name='profile'),
        path('profile/update/', views.UserProfileUpdateView.as_view(), name='profile-update'),

        # Social authentication
        path('google/', GoogleSignInView.as_view(), name='google-signin'),
        path('facebook/', FacebookSignInView.as_view(), name='facebook-signin'),
        path('twitter/login/', TwitterLoginView.as_view(), name='twitter-login'),
        path('twitter/callback/', TwitterCallbackView.as_view(), name='twitter-callback'),
        path('twitter/complete/', TwitterCompleteView.as_view(), name='twitter-complete'),

        # Legacy / Dashboard mappings
        path('users/getUsers', UserViewSet.as_view({'get': 'getUsers'}), name='get-users'),
        path('users/delete/<int:pk>', UserViewSet.as_view({'delete': 'deleteUser'}), name='delete-user'),
        path('users/updateRole/<int:pk>', UserViewSet.as_view({'patch': 'updateRole'}), name='update-role'),
]

