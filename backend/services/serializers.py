"""
═══════════════════════════════════════════════════════════════════════════════
SERVICE SERIALIZERS — Professional services REST API serialization.

Provides serializer for service offerings (EIA, EA, training, consulting, etc.).
Includes backward-compatible camelCase field aliases.

═══════════════════════════════════════════════════════════════════════════════
"""

from rest_framework import serializers
from .models import Service

class ServiceSerializer(serializers.ModelSerializer):
    """
    ServiceSerializer — Professional service REST serialization.
    
    Full service representation with pricing, description, and publication status.
    Backward-compatible with frontend camelCase aliases.
    
    Fields (Identity & Content):
      id, _id: Service ID (pk and alias)
      title: Service name
      slug: URL slug (unique)
      category: Service type (EIA, EA, Training, Consulting, Research, Custom)
      short_description, shortDescription: Brief summary
      full_description, fullDescription: Complete description
      
    Fields (Pricing):
      price: Service price (decimal)
      price_suffix: Price modifier (e.g., "per project", "per day")
      timeline_estimate: Estimated delivery timeline
      
    Fields (Details):
      details (JSON): Service-specific details (features, capabilities)
      
    Fields (Media):
      featured_image: Service image URL
      
    Fields (Status):
      is_published, isPublished: Publication status (affects visibility)
      
    Fields (Metadata):
      created_at, createdAt: Creation timestamp
      updated_at, updatedAt: Last modification timestamp
    
    Write-only aliases:
      - Accepts snake_case fields for API requests
      - Returns both snake_case and camelCase in responses
    
    @serializer ServiceSerializer
    @version 1.0.0
    """
    _id = serializers.IntegerField(source='id', read_only=True)
    shortDescription = serializers.CharField(source='short_description', read_only=True)
    fullDescription = serializers.CharField(source='full_description', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    isPublished = serializers.BooleanField(source='is_published', read_only=True)
    
    class Meta:
        model = Service
        fields = '__all__'
        # We manually add the aliases to the fields list if using __all__ is not enough
        # Actually in DRF, fields = '__all__' plus custom fields on the class works fine.
        # But we need to make sure they are in the result.
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Add aliases to the returned dictionary
        ret['shortDescription'] = ret.get('short_description')
        ret['fullDescription'] = ret.get('full_description')
        ret['isPublished'] = ret.get('is_published')
        ret['_id'] = ret.get('id')
        ret['createdAt'] = ret.get('created_at')
        ret['updatedAt'] = ret.get('updated_at')
        return ret
