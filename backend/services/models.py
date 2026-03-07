from django.db import models
from django.utils.text import slugify

class Service(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    category = models.CharField(max_length=100, blank=True) # e.g., 'EIA', 'EA', 'Training'
    short_description = models.TextField(max_length=500)
    full_description = models.TextField(blank=True, null=True)
    
    is_published = models.BooleanField(default=True)
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_suffix = models.CharField(max_length=50, blank=True, null=True) # e.g. "per project"
    
    # Details as JSON
    features = models.JSONField(default=list, blank=True)
    benefits = models.JSONField(default=list, blank=True)
    process = models.JSONField(default=list, blank=True) # [{step: 1, title: "", desc: ""}]
    faqs = models.JSONField(default=list, blank=True) # [{question: "", answer: ""}]
    deliverables = models.JSONField(default=list, blank=True)
    
    timeline = models.CharField(max_length=100, blank=True, null=True)
    
    image = models.URLField(max_length=1000, blank=True, null=True)
    
    icon = models.CharField(max_length=50, blank=True, null=True, help_text="Emoji or icon name")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['is_published']),
            models.Index(fields=['category']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or 'service'
            slug = base
            counter = 1
            while Service.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
