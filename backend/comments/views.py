from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Comment
from .lesson_models import LessonComment
from .serializers import CommentSerializer, LessonCommentSerializer
from posts.models import Post
from courses.models import Lesson
from rest_framework import permissions

# Reuse the admin permission from posts if needed or define here
class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.is_staff:
            return True
        return obj.user == request.user

class CommentViewSet(viewsets.ModelViewSet):
    # ... existing code ...
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'id'

    def create(self, request, *args, **kwargs):
        # Handle postId explicitly
        post_id = request.data.get('postId')
        if not post_id:
             return Response({'message': 'Post ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        post = get_object_or_404(Post, id=post_id)
        
        # Manually create the comment
        comment = Comment.objects.create(
            content=request.data.get('content'),
            post=post,
            user=request.user
        )
        
        return Response(self.get_serializer(comment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def get_post_comments(self, request, postId=None):
        if not postId:
             postId = request.query_params.get('postId')
        
        comments = self.queryset.filter(post__id=postId).order_by('-created_at')
        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def getComments(self, request):
        if not request.user.is_superuser and not request.user.is_staff:
             return Response({'message': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
             
        start_index = int(request.query_params.get('startIndex', 0))
        limit = int(request.query_params.get('limit', 9))
        
        sort_direct = request.query_params.get('sort', 'desc')
        order_field = '-created_at' if sort_direct == 'desc' else 'created_at'

        queryset = self.queryset.order_by(order_field)
        total_comments = queryset.count()
        
        comments = queryset[start_index:start_index+limit]
        
        # Calculate stats (simplified)
        from django.utils import timezone
        now = timezone.now()
        last_month_comments = queryset.filter(
            created_at__month=now.month,
            created_at__year=now.year
        ).count()

        return Response({
            'comments': self.get_serializer(comments, many=True).data,
            'totalComments': total_comments,
            'lastMonthComments': last_month_comments
        })

    @action(detail=True, methods=['put'], permission_classes=[permissions.IsAuthenticated])
    def likeComment(self, request, id=None):
        comment = self.get_object()
        user = request.user
        
        if comment.likes.filter(id=user.id).exists():
            comment.likes.remove(user)
        else:
            comment.likes.add(user)
            
        return Response(self.get_serializer(comment).data)

    @action(detail=True, methods=['put'], permission_classes=[IsOwnerOrAdmin])
    def editComment(self, request, id=None):
        comment = self.get_object()
        comment.content = request.data.get('content', comment.content)
        comment.save()
        return Response(self.get_serializer(comment).data)

    @action(detail=True, methods=['delete'], permission_classes=[IsOwnerOrAdmin])
    def deleteComment(self, request, id=None):
        return self.destroy(request)


class LessonCommentViewSet(viewsets.ModelViewSet):
    queryset = LessonComment.objects.all()
    serializer_class = LessonCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'id'

    def create(self, request, *args, **kwargs):
        lesson_id = request.data.get('lessonId')
        if not lesson_id:
             return Response({'message': 'Lesson ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        comment = LessonComment.objects.create(
            content=request.data.get('content'),
            lesson=lesson,
            user=request.user
        )
        
        return Response(self.get_serializer(comment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def get_lesson_comments(self, request, lessonId=None):
        if not lessonId:
            lessonId = request.query_params.get('lessonId')
            
        if not lessonId:
             return Response({'message': 'Lesson ID required'}, status=status.HTTP_400_BAD_REQUEST)

        comments = self.queryset.filter(lesson__id=lessonId).order_by('-created_at')
        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['put'], permission_classes=[permissions.IsAuthenticated])
    def likeComment(self, request, id=None):
        comment = self.get_object()
        user = request.user
        
        if comment.likes.filter(id=user.id).exists():
            comment.likes.remove(user)
        else:
            comment.likes.add(user)
            
        return Response(self.get_serializer(comment).data)

    @action(detail=True, methods=['put'], permission_classes=[IsOwnerOrAdmin])
    def editComment(self, request, id=None):
        comment = self.get_object()
        comment.content = request.data.get('content', comment.content)
        comment.save()
        return Response(self.get_serializer(comment).data)

    @action(detail=True, methods=['delete'], permission_classes=[IsOwnerOrAdmin])
    def deleteComment(self, request, id=None):
        return self.destroy(request)

