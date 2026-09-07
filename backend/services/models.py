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
from django.contrib.auth import get_user_model

User = get_user_model()

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


class AboutUs(models.Model):
    """
    About Us Page Content Model
    
    Stores all editable content for the About Us page including:
    - Hero section (title, subtitle, image)
    - Mission and vision statements
    - Founder information
    - Core values
    - Impact metrics
    - Team members
    """
    
    # Hero Section
    hero_title = models.TextField(
        default="Transforming Compliance Into Competitive Advantage",
        help_text="Main headline for the About Us page"
    )
    hero_subtitle = models.TextField(
        default="Where environmental responsibility meets business success",
        help_text="Subtitle/tagline for hero section"
    )
    hero_image_url = models.URLField(
        default="https://res.cloudinary.com/dcrubaesi/image/upload/v1737333837/ECODEED_COLORED_LOGO_wj2yy8.png",
        blank=True,
        help_text="URL to hero section image or logo"
    )
    
    # Mission & Vision
    mission_statement = models.TextField(
        default="At Ecodeed Consulting, we empower businesses, governments, and communities to navigate environmental compliance, implement sustainable practices, and future-proof their operations—so no dream is lost due to regulatory hurdles.",
        help_text="Company mission statement"
    )
    vision_statement = models.TextField(
        default="",
        blank=True,
        help_text="Company vision statement"
    )
    
    # Founder Section
    founder_name = models.CharField(
        max_length=255,
        default="Miriam Mukami Mwema",
        help_text="Founder's full name"
    )
    founder_bio = models.TextField(
        default="",
        blank=True,
        help_text="Founder's biography and background"
    )
    founder_image_url = models.URLField(
        default="",
        blank=True,
        help_text="URL to founder's profile photo"
    )
    
    # Core Values (JSON)
    values = models.JSONField(
        default=list,
        blank=True,
        help_text="Array of core values with name and description"
    )
    
    # Impact Metrics (JSON)
    metrics = models.JSONField(
        default=list,
        blank=True,
        help_text="Array of impact metrics (clients served, projects, results)"
    )
    
    # Team Members (JSON)
    team_members = models.JSONField(
        default=list,
        blank=True,
        help_text="Array of team member profiles"
    )
    
    # Status
    is_published = models.BooleanField(
        default=True,
        help_text="Whether this version is live"
    )
    
    # Audit Trail
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="aboutus_updates"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "About Us Page"
        verbose_name_plural = "About Us Pages"
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"About Us ({self.updated_at.strftime('%Y-%m-%d %H:%M')})"
    
    @classmethod
    def get_published(cls):
        """Get the published About Us content"""
        return cls.objects.filter(is_published=True).first() or cls.objects.first()
    
    @classmethod
    def get_or_create_default(cls):
        """Get existing or create default About Us content"""
        about_us, created = cls.objects.get_or_create(
            id=1,
            defaults={
                'hero_title': 'Transforming Compliance Into Competitive Advantage',
                'hero_subtitle': 'Where environmental responsibility meets business success',
                'mission_statement': 'At Ecodeed Consulting, we empower businesses, governments, and communities to navigate environmental compliance, implement sustainable practices, and future-proof their operations—so no dream is lost due to regulatory hurdles.',
                'founder_name': 'Miriam Mukami Mwema',
                'values': [
                    {'name': 'Integrity', 'description': 'Honest and transparent in all dealings'},
                    {'name': 'Innovation', 'description': 'Constantly seeking new solutions'},
                    {'name': 'Impact', 'description': 'Committed to meaningful change'},
                    {'name': 'Excellence', 'description': 'Striving for the highest standards'},
                ],
                'metrics': [
                    {'label': 'Clients Served', 'value': '500+'},
                    {'label': 'Projects Completed', 'value': '1000+'},
                    {'label': 'Years of Experience', 'value': '15+'},
                ],
            }
        )
        return about_us, created
