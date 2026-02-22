from rest_framework import serializers
from .models import Service

class ServiceSerializer(serializers.ModelSerializer):
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
