"""
═══════════════════════════════════════════════════════════════════════════════
SERVICE URLS — Professional services endpoints.

URL routing for service offerings (EIA, EA, training, consulting, research).

═══════════════════════════════════════════════════════════════════════════════
ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

Services:
  GET    /services/                 - List published services
  POST   /services/                 - Create service (admin)
  GET    /services/{id}/            - Get service details
  PUT    /services/{id}/            - Update service (admin)
  DELETE /services/{id}/            - Delete service (admin)
  GET    /services/slug/{slug}/     - Get service by slug

Filtering:
  ?isPublished=true  - Only published services
  ?search=keyword    - Search title/category
  ?category=EIA      - Filter by service type

═══════════════════════════════════════════════════════════════════════════════
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]