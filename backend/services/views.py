from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Service
from .serializers import ServiceSerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'category']

    def get_queryset(self):
        queryset = super().get_queryset()
        is_published = self.request.query_params.get('isPublished')
        if is_published == 'true':
            queryset = queryset.filter(is_published=True)
        return queryset

    @action(detail=False, methods=['get'], url_path='slug/(?P<slug>[^/.]+)')
    def by_slug(self, request, slug=None):
        service = get_object_or_404(self.queryset, slug=slug)
        serializer = self.get_serializer(service)
        return Response(serializer.data)
