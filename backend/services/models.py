"""
═══════════════════════════════════════════════════════════════════════════════
SERVICE MODELS — Professional services and consulting offerings.

This module defines the Service model for Ecodeed Academy's consulting services,
including environmental impact assessments, energy audits, training, and other
professional services offered to organizations.

═══════════════════════════════════════════════════════════════════════════════
SERVICE CATEGORIES
═══════════════════════════════════════════════════════════════════════════════

• EIA: Environmental Impact Assessment
• EA: Environmental Audit
• Training: Professional training programs
• Consulting: Strategic consulting services
• Research: Research and analysis services
• Custom: Custom professional services

═══════════════════════════════════════════════════════════════════════════════
DATA STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

Service (Main offering)
  ├─ title: Service name
  ├─ category: Service type classification
  ├─ description: Short and full descriptions
  ├─ pricing: Price, suffix (e.g., "per project"), timeline
  ├─ details (JSON):
  │  ├─ features: Service capabilities
  │  ├─ benefits: Customer benefits
  │  ├─ process: Steps in service delivery
  │  ├─ faqs: Frequently asked questions
  │  └─ deliverables: Concrete outputs
  └─ metadata: Publishing status, image, timestamps

═══════════════════════════════════════════════════════════════════════════════
"""

from django.db import models
from django.utils.text import slugify

class Service(models.Model):
    """
    Service Model — Professional services offering.
    
    Represents a professional service (e.g., EIA, EA, Training) that Ecodeed
    Academy offers to organizations. Includes pricing, detailed descriptions,
    process steps, FAQs, and deliverables.
    
    Fields:
      title (str, required): Service name (max 255 chars)
      slug (str): URL-safe identifier (auto-generated, unique)
      category (str): Service type - 'EIA', 'EA', 'Training', 'Consulting', etc.
      short_description (str, required): Brief overview (max 500 chars)
      full_description (str): Detailed service description with HTML support
      is_published (bool): Publishing status (default: True)
      price (Decimal): Service cost in KES (null = price on request)
      price_suffix (str): Price context (e.g., "per project", "per day")
      features (JSON): List of service features/capabilities
        Format: [{ "title": "...", "description": "..." }, ...]
      benefits (JSON): Customer benefits list
        Format: [{ "title": "...", "description": "...", "icon": "..." }, ...]
      process (JSON): Service delivery steps
        Format: [{ "step": 1, "title": "...", "description": "..." }, ...]
      faqs (JSON): Frequently asked questions
        Format: [{ "question": "...", "answer": "..." }, ...]
      deliverables (JSON): Concrete outputs/deliverables
        Format: [{ "title": "...", "description": "...", "format": "..." }, ...]
      timeline (str): Estimated duration (e.g., "2-4 weeks", "1 month")
      image (URL): Service thumbnail/featured image
      icon (str): Emoji or icon identifier for UI display
      created_at (DateTime): Creation timestamp (auto-set)
      updated_at (DateTime): Last modification timestamp (auto-updated)
    
    Methods:
      save(): Auto-generates unique slug from title
      __str__(): Returns service title
    
    Indexes:
      - is_published: Fast filtering for published services
      - category: Fast filtering by service type
    
    @model Service
    @version 1.0.0
    @author Gikonyo Mwema
    """
    
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
