from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model

User = get_user_model()

class Course(models.Model):
    CATEGORY_CHOICES = [
        ('specialized', 'Specialized'),
        ('masterclass', 'Masterclass'),
        ('webinar', 'Webinar'),
        ('coaching', 'Coaching'),
        ('compliance', 'Compliance'),
        ('licensing', 'Licensing'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    short_description = models.TextField(max_length=500)
    full_description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_free = models.BooleanField(default=False)
    
    # Metadata
    level = models.JSONField(default=list, blank=True) 
    format = models.JSONField(default=list, blank=True)
    features = models.JSONField(default=list, blank=True)
    
    # Keeping curriculum as a property or removing it. Removing it to force API update.
    # curriculum = models.JSONField(default=list, blank=True) DEPRECATED
    
    faqs = models.JSONField(default=list, blank=True)
    target_audience = models.JSONField(default=list, blank=True)
    resources = models.JSONField(default=list, blank=True)
    
    external_url = models.URLField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    is_popular = models.BooleanField(default=False)
    is_live = models.BooleanField(default=False)
    
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses_taught')

    image = models.URLField(max_length=1000, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Lesson(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, help_text="Text content or lecture notes")
    video_url = models.URLField(blank=True, null=True, help_text="Vimeo/YouTube/S3 URL")
    duration = models.PositiveIntegerField(help_text="Duration in seconds", default=0)
    is_free_preview = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='active') 
    progress = models.JSONField(default=dict, blank=True) 

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"

class LessonCompletion(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='completed_lessons')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('enrollment', 'lesson')
