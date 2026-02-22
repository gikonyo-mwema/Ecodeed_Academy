from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import Post
from .serializers import PostSerializer
from .permissions import IsOwnerOrAdmin
from datetime import datetime
import os
import uuid

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    lookup_field = 'pk'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        queryset = Post.objects.all()
        
        # Filtering parameters
        category = self.request.query_params.get('category')
        slug = self.request.query_params.get('slug')
        post_id = self.request.query_params.get('postId')
        search_term = self.request.query_params.get('searchTerm')
        user_id = self.request.query_params.get('userId')
        order = self.request.query_params.get('order', 'desc')
        limit = self.request.query_params.get('limit')
        start_index = self.request.query_params.get('startIndex', 0)

        if category and category != 'uncategorized':
            queryset = queryset.filter(category=category)
        
        if slug:
            queryset = queryset.filter(slug=slug)
            
        if post_id:
            queryset = queryset.filter(id=post_id)
            
        if user_id:
            queryset = queryset.filter(user__id=user_id)

        if search_term:
            queryset = queryset.filter(
                Q(title__icontains=search_term) | 
                Q(content__icontains=search_term)
            )

        # Ordering
        if order == 'asc':
            queryset = queryset.order_by('created_at')
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Pagination logic (Custom implementation to match frontend expectations)
        start_index = int(request.query_params.get('startIndex', 0))
        limit = request.query_params.get('limit')
        page = request.query_params.get('page')

        if page and limit:
            try:
                start_index = (int(page) - 1) * int(limit)
            except ValueError:
                pass

        total_posts = queryset.count()
        
        # Determine current month's posts for stats
        now = datetime.now()
        last_month_posts = queryset.filter(
            created_at__year=now.year, 
            created_at__month=now.month
        ).count()

        # Custom Slicing
        if limit and limit != 'undefined': 
            try:
                limit = int(limit)
                queryset = queryset[start_index : start_index + limit]
            except ValueError:
                pass # Ignore invalid limit
                
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'posts': serializer.data,
            'totalPosts': total_posts,
            'lastMonthPosts': last_month_posts
        })

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        queryset = Post.objects.order_by('-views')[:5]
        serializer = self.get_serializer(queryset, many=True)
        return Response({'posts': serializer.data})


class UploadImageView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if 'image' not in request.FILES:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file_obj = request.FILES['image']
        file_ext = os.path.splitext(file_obj.name)[1]
        unique_filename = f"posts/{uuid.uuid4()}{file_ext}"
        
        # Save locally to media folder
        path = default_storage.save(unique_filename, ContentFile(file_obj.read()))
        
        # Build URL - use SITE_URL from settings if available, otherwise use request host
        # This avoids Docker internal hostname issues (backend:8000 vs localhost:8000)
        site_url = getattr(settings, 'SITE_URL', None)
        if site_url:
            file_url = f"{site_url.rstrip('/')}{settings.MEDIA_URL}{path}"
        else:
            # Fallback: try to get proper host from request headers
            host = request.META.get('HTTP_X_FORWARDED_HOST') or request.META.get('HTTP_HOST', 'localhost:8000')
            scheme = 'https' if request.is_secure() else 'http'
            file_url = f"{scheme}://{host}{settings.MEDIA_URL}{path}"
        
        return Response({
            'secureUrl': file_url,
            'public_id': unique_filename
        })
