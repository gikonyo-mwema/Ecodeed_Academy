"""
═══════════════════════════════════════════════════════════════════════════════
COMMENT SERIALIZERS — Blog and lesson comment REST API serialization.

Provides serializers for threaded comments on blog posts and lessons.
Supports nested reply structure, likes, and moderation status.
Backward-compatible with frontend camelCase field aliases.

═══════════════════════════════════════════════════════════════════════════════
SERIALIZER HIERARCHY
═══════════════════════════════════════════════════════════════════════════════

CommentSerializer (Main - Blog)
  ├─ UserSerializer (Nested author)
  └─ ReplySerializer (Nested replies, one level deep)
      └─ UserSerializer (Nested reply author)

LessonCommentSerializer (Lesson Comments)
  └─ UserSerializer (Nested author)

═══════════════════════════════════════════════════════════════════════════════
"""

from rest_framework import serializers

from users.serializers import UserSerializer
from .lesson_models import LessonComment
from .models import Comment


# ============================================================================
# Blog Comment serializers
# ============================================================================

class ReplySerializer(serializers.ModelSerializer):
    """
    ReplySerializer — Nested comment reply serialization (one level deep).
    
    Lightweight serializer for comment replies (top-level only, not recursive).
    Includes user details, like count, and moderation status.
    
    Fields (Identity):
      id, _id: Reply/comment ID (pk and alias)
      postId: Parent post ID
      userId: Author user ID
      parentId: Parent comment ID
      
    Fields (Content):
      content: Reply text
      is_edited: Whether comment has been edited
      status: Moderation status (pending, approved, rejected)
      
    Fields (Relationships):
      user: Nested UserSerializer (reply author)
      likes: Array of user IDs who liked this reply
      numberOfLikes: Computed total likes
      
    Fields (Metadata):
      created_at: Creation timestamp
      createdAt: Alias for created_at (camelCase)
      updated_at: Last modification timestamp
      updatedAt: Alias for updated_at (camelCase)
    
    Backward Compatibility:
      - _id: Alias for id
      - postId: Alias for post (FK)
      - userId: Alias for user ID (FK)
      - createdAt/updatedAt: camelCase timestamp aliases
      - numberOfLikes: Computed likes count
    
    @serializer ReplySerializer
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
    CommentSerializer — Complete blog comment with nested replies.
    
    Full comment representation with nested replies (one level deep).
    Supports likes, moderation status, and edit tracking.
    Backward-compatible with frontend camelCase aliases.
    
    Fields (Identity):
      id, _id: Comment ID (pk and alias)
      postId: Parent post ID
      userId: Author user ID
      parentId: Parent comment ID (for threaded replies)
      
    Fields (Content):
      content: Comment text
      is_edited: Whether comment has been edited
      status: Moderation status (pending, approved, rejected)
      
    Fields (Relationships):
      user: Nested UserSerializer (comment author)
      likes: Array of user IDs who liked this comment
      numberOfLikes: Computed total likes count
      replies: Nested ReplySerializer (one-level deep reply chain)
      replyCount: Computed count of replies
      
    Fields (Metadata):
      created_at: Creation timestamp
      createdAt: Alias for created_at (camelCase)
      updated_at: Last modification timestamp (read-only)
      updatedAt: Alias for updated_at (camelCase)
    
    Nested Serializers:
      - user: UserSerializer (comment author details)
      - replies: ReplySerializer (many=True, replies on this comment)
    
    Backward Compatibility:
      - _id: Alias for id
      - postId: Alias for post (FK)
      - userId: Alias for user ID (FK)
      - createdAt/updatedAt: camelCase timestamp aliases
      - numberOfLikes: Computed likes count
      - replyCount: Computed reply count
    
    Optimization:
      - replyCount uses prefetch_related cache when available
    
    @serializer CommentSerializer
    @version 1.0.0
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
    CommentCreateSerializer — Validation-only comment creation serializer.
    
    Simple input validation for creating new comments.
    Does not use Comment model directly (cleaner validation).
    
    Fields:
      content (str): Comment text (max 2000 chars)
      postId (int): Parent post ID (required)
      parentId (int, optional): Parent comment ID for threaded replies
    
    Validation:
      - content: Required, max 2000 characters
      - postId: Required, must exist
      - parentId: Optional, for nested replies
    
    @serializer CommentCreateSerializer
    """
    content = serializers.CharField(max_length=2000)
    postId = serializers.IntegerField()
    parentId = serializers.IntegerField(required=False, allow_null=True)


# ============================================================================
# Lesson Comment serializers
# ============================================================================

class LessonCommentSerializer(serializers.ModelSerializer):
    """
    LessonCommentSerializer — Lesson comment serialization.
    
    Comments on lesson content within courses.
    Simpler than blog comments (no threading/nesting).
    
    Fields (Identity):
      id, _id: Comment ID (pk and alias)
      lessonId: Parent lesson ID
      user: Nested UserSerializer (comment author)
      
    Fields (Content):
      content: Comment text
      
    Fields (Relationships):
      likes: Array of user IDs who liked this comment
      numberOfLikes: Computed total likes count
      
    Fields (Metadata):
      created_at: Creation timestamp
      updated_at: Last modification timestamp (read-only)
      updatedAt: Alias for updated_at (camelCase)
    
    Backward Compatibility:
      - _id: Alias for id
      - lessonId: Alias for lesson (FK)
      - numberOfLikes: Computed likes count
      - updatedAt: camelCase timestamp alias
    
    @serializer LessonCommentSerializer
    @version 1.0.0
    """
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
