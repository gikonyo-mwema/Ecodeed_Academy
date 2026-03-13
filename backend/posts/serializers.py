"""
═══════════════════════════════════════════════════════════════════════════════
POST SERIALIZERS — Blog post REST API serialization.

Provides serializers for blog content: posts, categories, tags, and comments.
Includes nested relationships and backward-compatible camelCase field aliases
for frontend compatibility.

═══════════════════════════════════════════════════════════════════════════════
SERIALIZER HIERARCHY
═══════════════════════════════════════════════════════════════════════════════

PostSerializer (Main)
  ├─ UserSerializer (Nested author)
  ├─ CategorySerializer (Post category)
  └─ TagSerializer (Post tags, many)

CategorySerializer (Post categories)
  └─ post_count (Computed count)

TagSerializer (Post tags)
  └─ post_count (Computed count)

═══════════════════════════════════════════════════════════════════════════════
FIELD ALIASES (Frontend Compatibility)
═══════════════════════════════════════════════════════════════════════════════

PostSerializer aliases (camelCase):
  - _id: Alias for id (primary key)
  - userId: Alias for user.id (author ID)
  - createdAt: Alias for created_at
  - updatedAt: Alias for updated_at
  - publishedAt: Alias for published_at
  - scheduledFor: Alias for scheduled_for
  - numberOfLikes: Computed likes count

Write-only fields:
  - tag_ids: Accept tag IDs on create/update
  - category_id: Accept category ID on create/update

═══════════════════════════════════════════════════════════════════════════════
"""

from rest_framework import serializers

from users.serializers import UserSerializer

from .models import Category, Post, Tag


# -----------------------------------------------------------------------
# Category / Tag serializers
# -----------------------------------------------------------------------
class CategorySerializer(serializers.ModelSerializer):
    """
    CategorySerializer — Blog post category serialization.
    
    Lightweight category representation for filtering and listing.
    Includes computed post count.
    
    Fields:
      id: Category ID
      name: Category name
      slug: URL slug (auto-generated from name)
      description: Category description
      emoji: Display emoji
      color_class: Tailwind CSS classes for styling
      order: Display order
      post_count: Computed count of posts in this category (read-only)
    
    @serializer CategorySerializer
    """
    post_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "emoji", "color_class", "order", "post_count"]
        read_only_fields = ["slug", "post_count"]


class TagSerializer(serializers.ModelSerializer):
    """
    TagSerializer — Blog post tag serialization.
    
    Lightweight tag representation for multi-dimensional classification.
    Includes computed post count.
    
    Fields:
      id: Tag ID
      name: Tag name (e.g., "environment", "renewable-energy")
      slug: URL slug (auto-generated from name)
      post_count: Computed count of posts with this tag (read-only)
    
    @serializer TagSerializer
    """
    post_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Tag
        fields = ["id", "name", "slug", "post_count"]
        read_only_fields = ["slug", "post_count"]


# -----------------------------------------------------------------------
# Post serializer  (backward-compatible + new fields)
# -----------------------------------------------------------------------
class PostSerializer(serializers.ModelSerializer):
    """
    PostSerializer — Complete blog post REST serialization.
    
    Full post representation with nested author, category, and tags.
    Backward-compatible with frontend camelCase aliases and legacy field names.
    
    Fields (Identity & Content):
      id, _id: Post ID (pk and alias)
      title: Post title
      slug: URL slug (unique)
      content: HTML post content (sanitized)
      excerpt: Plain-text summary (auto-generated if blank)
      image: Featured image URL
      
    Fields (Classification):
      category: Legacy category string (backward-compat)
      category_fk, category_detail: Category as FK + nested serializer
      category_id: Write-only category ID for create/update
      tags, tags_detail: Tags relationship + nested serializers
      tag_ids: Write-only tag IDs for create/update
      
    Fields (Publishing Workflow):
      status: Draft | Published | Scheduled | Archived
      published_at, publishedAt: Publication timestamp
      scheduled_for, scheduledFor: Scheduled publication time
      featured: Pin to top of listings
      
    Fields (SEO):
      meta_title: Search engine title (max 70 chars)
      meta_description: Search engine description (max 160 chars)
      canonical_url: For cross-posted/syndicated content
      og_image: Open Graph image (Facebook, LinkedIn)
      twitter_image: Twitter card image
      
    Fields (Metrics):
      reading_time: Computed reading time in minutes
      views: View count
      numberOfLikes: Computed total likes
      likes: Array of user IDs who liked this post
      
    Fields (Metadata):
      user: Nested UserSerializer (post author)
      created_at, createdAt: Creation timestamp
      updated_at, updatedAt: Last modification timestamp
    
    Computed Fields:
      - numberOfLikes: Count of likes M2M relationship
      - slug: Auto-generated from title if not provided
      - excerpt: Auto-generated from content if blank
      - reading_time: Computed on save (200 words/minute)
    
    Defaults on Create:
      - status: Defaults to 'published' for backward compatibility
    
    @serializer PostSerializer
    @version 1.0.0
    """
    # Legacy aliases for frontend compatibility
    _id = serializers.IntegerField(source="id", read_only=True)
    userId = serializers.CharField(source="user.id", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    publishedAt = serializers.DateTimeField(source="published_at", read_only=True)
    scheduledFor = serializers.DateTimeField(source="scheduled_for", required=False, allow_null=True)

    # Nested relations
    user = UserSerializer(read_only=True)
    category_detail = CategorySerializer(source="category_fk", read_only=True)
    tags_detail = TagSerializer(source="tags", many=True, read_only=True)

    # Write-only helpers for create/update
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False,
        source="tags",
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), write_only=True, required=False,
        source="category_fk",
    )

    # Computed / aggregated
    numberOfLikes = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            # Identity
            "_id", "id", "userId", "user", "slug",
            # Content
            "title", "content", "excerpt", "image",
            # Classification (legacy + new)
            "category", "category_fk", "category_detail",
            "category_id",
            "tags", "tags_detail", "tag_ids",
            # Workflow
            "status", "published_at", "publishedAt",
            "scheduled_for", "scheduledFor",
            "featured",
            # SEO
            "meta_title", "meta_description", "canonical_url",
            "og_image", "twitter_image",
            # Metrics
            "reading_time", "views",
            "numberOfLikes", "likes",
            # Timestamps
            "created_at", "updated_at", "createdAt", "updatedAt",
        ]
        read_only_fields = [
            "views", "slug", "created_at", "updated_at",
            "reading_time", "published_at",
        ]

    def get_numberOfLikes(self, obj):
        return obj.likes.count()

    # ------------------------------------------------------------------
    # On create, default status to 'published' to match the old behavior
    # so existing frontend "Publish" button keeps working seamlessly.
    # ------------------------------------------------------------------
    def create(self, validated_data):
        tags = validated_data.pop("tags", [])
        if "status" not in validated_data:
            validated_data["status"] = Post.Status.PUBLISHED
        post = super().create(validated_data)
        if tags:
            post.tags.set(tags)
        return post

    def update(self, instance, validated_data):
        tags = validated_data.pop("tags", None)
        post = super().update(instance, validated_data)
        if tags is not None:
            post.tags.set(tags)
        return post
