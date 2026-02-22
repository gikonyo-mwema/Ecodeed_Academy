from django.db import models
from django.conf import settings
from django.utils.text import slugify
import uuid

class Post(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=100, default='uncategorized')
    image = models.URLField(max_length=1000, blank=True, null=True)
    slug = models.SlugField(unique=True, max_length=255, blank=True)
    
    # Relations
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)
    
    # Metadata
    views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            # Generate basic slug
            base_slug = slugify(self.title)
            if not base_slug:  # Fallback if slugify returns empty (e.g. non-ascii title)
                 base_slug = str(uuid.uuid4())[:8]
            
            # Ensure unique slug
            unique_slug = base_slug
            counter = 1
            while Post.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)
