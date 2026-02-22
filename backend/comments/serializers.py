from rest_framework import serializers
from .models import Comment
from .lesson_models import LessonComment
from users.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)
    postId = serializers.PrimaryKeyRelatedField(source='post', read_only=True)
    userId = serializers.PrimaryKeyRelatedField(source='user', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    user = UserSerializer(read_only=True)
    numberOfLikes = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            '_id', 'id', 'content', 'postId', 'userId', 'user', 
            'likes', 'numberOfLikes', 'created_at', 'updatedAt'
        ]
        read_only_fields = ['created_at', 'updated_at', 'likes']

    def get_numberOfLikes(self, obj):
        return obj.likes.count()

class LessonCommentSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)
    lessonId = serializers.PrimaryKeyRelatedField(source='lesson', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    user = UserSerializer(read_only=True)
    numberOfLikes = serializers.SerializerMethodField()
    
    class Meta:
        model = LessonComment
        fields = [
            '_id', 'id', 'content', 'lessonId', 'user', 
            'likes', 'numberOfLikes', 'created_at', 'updatedAt'
        ]
        read_only_fields = ['created_at', 'updated_at', 'likes']

    def get_numberOfLikes(self, obj):
        return obj.likes.count()
