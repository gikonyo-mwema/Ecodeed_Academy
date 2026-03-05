from rest_framework import serializers

from users.serializers import UserSerializer
from .lesson_models import LessonComment
from .models import Comment


# ============================================================================
# Blog Comment serializers
# ============================================================================

class ReplySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for nested replies (one level deep).
    """
    _id = serializers.IntegerField(source="id", read_only=True)
    postId = serializers.PrimaryKeyRelatedField(source="post", read_only=True)
    userId = serializers.PrimaryKeyRelatedField(source="user", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    user = UserSerializer(read_only=True)
    numberOfLikes = serializers.SerializerMethodField()
    parentId = serializers.PrimaryKeyRelatedField(source="parent", read_only=True)

    class Meta:
        model = Comment
        fields = [
            "_id", "id", "content", "postId", "userId", "user",
            "likes", "numberOfLikes", "parentId", "is_edited",
            "status", "created_at", "createdAt", "updatedAt",
        ]
        read_only_fields = ["created_at", "updated_at", "likes", "is_edited"]

    def get_numberOfLikes(self, obj):
        return obj.likes.count()


class CommentSerializer(serializers.ModelSerializer):
    """
    Full comment serializer with nested replies.

    Backward-compatible fields kept:
    - ``_id`` → alias for ``id``
    - ``postId`` → alias for ``post``
    - ``userId`` → alias for ``user`` PK
    - ``numberOfLikes`` → count of likes M2M
    - ``likes`` → flat list of user PKs (frontend does ``likes.includes(userId)``)
    - ``createdAt`` / ``updatedAt`` → camelCase aliases
    """
    _id = serializers.IntegerField(source="id", read_only=True)
    postId = serializers.PrimaryKeyRelatedField(source="post", read_only=True)
    userId = serializers.PrimaryKeyRelatedField(source="user", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    user = UserSerializer(read_only=True)
    numberOfLikes = serializers.SerializerMethodField()
    parentId = serializers.PrimaryKeyRelatedField(source="parent", read_only=True)
    replies = ReplySerializer(many=True, read_only=True)
    replyCount = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "_id", "id", "content", "postId", "userId", "user",
            "likes", "numberOfLikes", "parentId", "replies", "replyCount",
            "is_edited", "status",
            "created_at", "createdAt", "updatedAt",
        ]
        read_only_fields = ["created_at", "updated_at", "likes", "is_edited"]

    def get_numberOfLikes(self, obj):
        return obj.likes.count()

    def get_replyCount(self, obj):
        # Uses prefetched replies when available
        if hasattr(obj, "_prefetched_objects_cache") and "replies" in obj._prefetched_objects_cache:
            return len(obj._prefetched_objects_cache["replies"])
        return obj.replies.count()


class CommentCreateSerializer(serializers.Serializer):
    """
    Validation-only serializer for creating comments.
    """
    content = serializers.CharField(max_length=2000)
    postId = serializers.IntegerField()
    parentId = serializers.IntegerField(required=False, allow_null=True)


# ============================================================================
# Lesson Comment serializers (unchanged)
# ============================================================================

class LessonCommentSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source="id", read_only=True)
    lessonId = serializers.PrimaryKeyRelatedField(source="lesson", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    user = UserSerializer(read_only=True)
    numberOfLikes = serializers.SerializerMethodField()

    class Meta:
        model = LessonComment
        fields = [
            "_id", "id", "content", "lessonId", "user",
            "likes", "numberOfLikes", "created_at", "updatedAt",
        ]
        read_only_fields = ["created_at", "updated_at", "likes"]

    def get_numberOfLikes(self, obj):
        return obj.likes.count()
