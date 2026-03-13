"""
═══════════════════════════════════════════════════════════════════════════════
COMMENT URLS — Blog and lesson comment endpoints.

URL routing for threaded comments on blog posts and lesson content.

═══════════════════════════════════════════════════════════════════════════════
ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

Blog Comments (DRF Router):
  GET    /comments/                 - List all comments
  POST   /comments/                 - Create comment
  GET    /comments/{id}/            - Get comment details
  PUT    /comments/{id}/            - Update comment
  DELETE /comments/{id}/            - Delete comment
  
Lesson Comments (DRF Router):
  GET    /lesson-comments/          - List all lesson comments
  POST   /lesson-comments/          - Create lesson comment
  GET    /lesson-comments/{id}/     - Get comment details
  PUT    /lesson-comments/{id}/     - Update comment
  DELETE /lesson-comments/{id}/     - Delete comment

Legacy Blog Comment Routes (Backward Compatible):
  POST   /create                    - Create comment
  GET    /getPostComments/{postId}  - Get comments for post
  PUT    /likeComment/{id}          - Like/unlike comment
  PUT    /editComment/{id}          - Edit comment
  DELETE /deleteComment/{id}        - Delete comment
  GET    /getComments               - Get all comments

═══════════════════════════════════════════════════════════════════════════════
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommentViewSet, LessonCommentViewSet

router = DefaultRouter()
router.register(r'comments', CommentViewSet)
router.register(r'lesson-comments', LessonCommentViewSet)

urlpatterns = [
    # Router (includes DRF browsable API + moderation actions)
    path('', include(router.urls)),

    # --- Legacy Blog Comment routes (backward-compatible) ---
    path('create', CommentViewSet.as_view({'post': 'create'}), name='create-comment'),
    path('getPostComments/<str:postId>', CommentViewSet.as_view({'get': 'get_post_comments'}), name='get-post-comments'),
    path('likeComment/<int:id>', CommentViewSet.as_view({'put': 'likeComment'}), name='like-comment'),
    path('editComment/<int:id>', CommentViewSet.as_view({'put': 'editComment'}), name='edit-comment'),
    path('deleteComment/<int:id>', CommentViewSet.as_view({'delete': 'deleteComment'}), name='delete-comment'),
    path('getComments', CommentViewSet.as_view({'get': 'getComments'}), name='get-all-comments'),

    # --- Legacy Lesson Comment routes ---
    path('lesson/create', LessonCommentViewSet.as_view({'post': 'create'}), name='create-lesson-comment'),
    path('getLessonComments/<int:lessonId>', LessonCommentViewSet.as_view({'get': 'get_lesson_comments'}), name='get-lesson-comments'),
    path('likeLessonComment/<int:id>', LessonCommentViewSet.as_view({'put': 'likeComment'}), name='like-lesson-comment'),
    path('editLessonComment/<int:id>', LessonCommentViewSet.as_view({'put': 'editComment'}), name='edit-lesson-comment'),
    path('deleteLessonComment/<int:id>', LessonCommentViewSet.as_view({'delete': 'deleteComment'}), name='delete-lesson-comment'),
]