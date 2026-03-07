from django.urls import path, include
from rest_framework.routers import DefaultRouter
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

