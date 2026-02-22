from rest_framework import serializers
from .models import Post
from users.serializers import UserSerializer

class PostSerializer(serializers.ModelSerializer):
    # Map 'id' to '_id' for frontend compatibility
    _id = serializers.IntegerField(source='id', read_only=True)
    userId = serializers.CharField(source='user.id', read_only=True)
    
    # CamelCase aliases for timestamps
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    
    # Return full user object or specific fields if needed
    user = UserSerializer(read_only=True)
    
    # Reading time calculation
    reading_time = serializers.SerializerMethodField()
    
    # Likes count
    numberOfLikes = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            '_id', 'id', 'userId', 'user',
            'title', 'content', 'category', 'image', 'slug',
            'views', 'created_at', 'updated_at', 'createdAt', 'updatedAt',
            'reading_time', 'numberOfLikes', 'likes'
        ]
        read_only_fields = ['views', 'slug', 'created_at', 'updated_at']

    def get_reading_time(self, obj):
        import math
        # Strip HTML tags approx logic or just count words
        word_count = len(obj.content.split())
        return math.ceil(word_count / 200)

    def get_numberOfLikes(self, obj):
        return obj.likes.count()
