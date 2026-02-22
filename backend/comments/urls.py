from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommentViewSet, LessonCommentViewSet

router = DefaultRouter()
router.register(r'comments', CommentViewSet)
router.register(r'lesson-comments', LessonCommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Blog Comments
    path('create', CommentViewSet.as_view({'post': 'create'}), name='create-comment'),
    path('getPostComments/<str:postId>', CommentViewSet.as_view({'get': 'get_post_comments'}), name='get-post-comments'),
    path('likeComment/<int:id>', CommentViewSet.as_view({'put': 'likeComment'}), name='like-comment'),
    path('editComment/<int:id>', CommentViewSet.as_view({'put': 'editComment'}), name='edit-comment'),
    path('deleteComment/<int:id>', CommentViewSet.as_view({'delete': 'deleteComment'}), name='delete-comment'),
    path('getComments', CommentViewSet.as_view({'get': 'getComments'}), name='get-all-comments'),

    # Lesson Comments
    path('lesson/create', LessonCommentViewSet.as_view({'post': 'create'}), name='create-lesson-comment'),
    path('getLessonComments/<int:lessonId>', LessonCommentViewSet.as_view({'get': 'get_lesson_comments'}), name='get-lesson-comments'),
    path('likeLessonComment/<int:id>', LessonCommentViewSet.as_view({'put': 'likeComment'}), name='like-lesson-comment'),
    path('editLessonComment/<int:id>', LessonCommentViewSet.as_view({'put': 'editComment'}), name='edit-lesson-comment'),
    path('deleteLessonComment/<int:id>', LessonCommentViewSet.as_view({'delete': 'deleteComment'}), name='delete-lesson-comment'),
]