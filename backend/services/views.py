"""
═══════════════════════════════════════════════════════════════════════════════
SERVICE API VIEWS — Professional services REST endpoints.

Provides CRUD operations for managing professional services (EIA, EA, Training,
etc.). Includes filtering by publication status and category, search functionality,
and slug-based lookup for SEO-friendly URLs.

═══════════════════════════════════════════════════════════════════════════════
ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

Services:
  GET    /api/v1/services/               - List all published services
  POST   /api/v1/services/               - Create service (admin only)
  GET    /api/v1/services/{id}/          - Retrieve service details
  PUT    /api/v1/services/{id}/          - Update service (admin only)
  PATCH  /api/v1/services/{id}/          - Partial update (admin only)
  DELETE /api/v1/services/{id}/          - Delete service (admin only)
  GET    /api/v1/services/slug/{slug}/   - Retrieve by slug (SEO-friendly)

Filtering:
  ?isPublished=true  - Only published services (default for public)
  ?search=keyword    - Search in title, category, description
  ?category=EIA      - Filter by service category

═══════════════════════════════════════════════════════════════════════════════
PERMISSIONS
═══════════════════════════════════════════════════════════════════════════════

Public Access (IsAdminOrReadOnly):
  - Anyone: GET (list, retrieve)
  - Admin: POST, PUT, PATCH, DELETE (create, update, delete)
  - Others: Read-only

Publishing:
  - is_published=true: Visible to all users
  - is_published=false: Admin only

═══════════════════════════════════════════════════════════════════════════════
SEARCH & FILTERING
═══════════════════════════════════════════════════════════════════════════════

Search searches across:
  - title: Service name
  - category: Service type (EIA, EA, Training)

Example: GET /api/v1/services/?search=assessment&isPublished=true

═══════════════════════════════════════════════════════════════════════════════
"""

from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Service, AboutUs
from .serializers import ServiceSerializer, AboutUsSerializer
from users.permissions import IsAdminOrReadOnly

class ServiceViewSet(viewsets.ModelViewSet):
    """
    ServiceViewSet — REST API for professional services management.
    
    Provides CRUD operations for services with admin-only write access.
    Includes search, filtering by publication status, and slug-based lookup.
    
    Permissions:
      - Public: GET (list, retrieve)
      - Admin: GET, POST, PUT, PATCH, DELETE
    
    Serializers:
      - All actions: ServiceSerializer
    
    Search Fields:
      - title: Service name
      - category: Service type/category
    
    Methods:
      list(): List published services with search/filter
      create(): Create new service (admin only)
      retrieve(): Get service details
      by_slug(): Get service by slug (SEO-friendly URL)
      update(): Update service (admin only)
      destroy(): Delete service (admin only)
    
    @viewset ServiceViewSet
    @version 1.0.0
    """
    
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'category']

    def get_queryset(self):
        """Filter services by publication status.
        
        Default behavior: Return all published services for public access.
        Admins see all services including unpublished drafts.
        
        Query params:
          ?isPublished=true  - Only published services
          ?isPublished=false - Only unpublished (admin only visible)
        """
        queryset = super().get_queryset()
        is_published = self.request.query_params.get('isPublished')
        if is_published == 'true':
            queryset = queryset.filter(is_published=True)
        return queryset

    @action(detail=False, methods=['get'], url_path='slug/(?P<slug>[^/.]+)')
    def by_slug(self, request, slug=None):
        """
        Retrieve service by slug (SEO-friendly URL).
        
        GET /api/v1/services/slug/{slug}/
        
        Args:
          slug: Service slug identifier (unique)
        
        Returns:
          200: Service data
          404: Service not found
        
        @action GET
        """
        service = get_object_or_404(self.queryset, slug=slug)
        serializer = self.get_serializer(service)
        return Response(serializer.data)


from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView

class AboutUsViewSet(viewsets.ModelViewSet):
    """
    About Us page content management API.
    
    Provides single endpoint for retrieving and updating the About Us page content.
    Admin users can edit: hero section, mission, founder info, values, metrics, team.
    
    Endpoints:
      GET    /api/v1/aboutus/       - Get About Us content (public)
      PUT    /api/v1/aboutus/1/     - Update About Us (admin only)
      PATCH  /api/v1/aboutus/1/     - Partial update (admin only)
    
    Permissions:
      - Public: GET (read-only)
      - Admin: GET, PUT, PATCH
    """
    
    queryset = AboutUs.objects.all()
    serializer_class = AboutUsSerializer
    permission_classes = [IsAdminOrReadOnly]
    basename = 'aboutus'
    
    def get_queryset(self):
        """Always return the single About Us object"""
        return AboutUs.objects.filter(id=1)
    
    def get_object(self):
        """Get or create default About Us content"""
        obj, _ = AboutUs.get_or_create_default()
        self.check_object_permissions(self.request, obj)
        return obj
    
    def list(self, request, *args, **kwargs):
        """Get About Us content as singleton"""
        obj = self.get_object()
        serializer = self.get_serializer(obj)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None, *args, **kwargs):
        """Retrieve single About Us content"""
        obj = self.get_object()
        serializer = self.get_serializer(obj)
        return Response(serializer.data)
    
    def update(self, request, pk=None, *args, **kwargs):
        """Update About Us content (admin only)"""
        obj = self.get_object()
        serializer = self.get_serializer(obj, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)
    
    def partial_update(self, request, pk=None, *args, **kwargs):
        """Partial update About Us content (admin only)"""
        obj = self.get_object()
        serializer = self.get_serializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)
