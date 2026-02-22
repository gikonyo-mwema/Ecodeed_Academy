from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, UploadImageView

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='posts')

urlpatterns = [
    # Legacy / Frontend-Compatible Routes (Adapters)
    path('post', PostViewSet.as_view({'get': 'list'}), name='post-list-singular'),
    path('posts/getPosts', PostViewSet.as_view({'get': 'list'}), name='post-list-legacy'),
    path('post/create', PostViewSet.as_view({'post': 'create'}), name='post-create-legacy'),
    
    # Update and Delete include userId in URL in frontend, but backend uses request.user and PK
    # We must handle the userId part in the URL pattern but ignore it in the view (or validate it)
    # Using 'pk' as the parameter name so ViewSet.update() can find the object
    path('posts/update/<int:pk>/<str:userId>/', PostViewSet.as_view({'put': 'update'}), name='post-update-legacy'),
    path('posts/delete/<int:pk>/<str:userId>/', PostViewSet.as_view({'delete': 'destroy'}), name='post-delete-legacy'),
    
    # Trending
    path('posts/trending', PostViewSet.as_view({'get': 'trending'}), name='post-trending'),

    # Standard REST API (Cleaner)
    path('', include(router.urls)),
    
    # Image Upload
    path('upload/upload', UploadImageView.as_view(), name='image-upload'),
]
