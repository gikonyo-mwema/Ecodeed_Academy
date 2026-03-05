from rest_framework import serializers

from users.serializers import UserSerializer

from .models import Category, Post, Tag


# -----------------------------------------------------------------------
# Category / Tag serializers
# -----------------------------------------------------------------------
class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "emoji", "color_class", "order", "post_count"]
        read_only_fields = ["slug", "post_count"]


class TagSerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Tag
        fields = ["id", "name", "slug", "post_count"]
        read_only_fields = ["slug", "post_count"]


# -----------------------------------------------------------------------
# Post serializer  (backward-compatible + new fields)
# -----------------------------------------------------------------------
class PostSerializer(serializers.ModelSerializer):
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
