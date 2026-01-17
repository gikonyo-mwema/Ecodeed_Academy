from django.db import models
from django.conf import settings
from django.utils.text import slugify
import uuid


class CourseCategory(models.Model):
    """Categories like Environment, Business, Technology, etc."""
    name = models.CharField(max_length=100)
    slug= models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)


    class Meta:
        verbose_name_plural = "Course Categories"

    def __str__(self):
        return self.name

class Course(models.Model):
    COURSE_STATUS = (
            ('draft', 'Draft'),
            ('published', 'Published'),
            ('archived', 'Archived'),
    )

    LEVELS = (
            ('beginner', 'Beginner'),
            ('intermediate',  'Intermediate'),
            ('advanced', 'Advanced'),
        )

    # Basic information
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    subtitle = models.CharField(max_length=300, blank=True)  # Optional subtitle for the course
    description = models.TextField()
    short_description = models.CharField(max_length=500)

    # Categorization
    # ForeignKey to CourseCategory (corrected typo)
    category = models.ForeignKey(CourseCategory, on_delete=models.SET_NULL, null=True, related_name='courses')
    level = models.CharField(max_length=20, choices=LEVELS, default='beginner')
    tags = models.JSONField(default=list, blank=True)


    # Media
    thumbnail = models.ImageField(upload_to='course_thumbnails/')
    promo_video_url = models.URLField(blank=True)


    # Course Details
    duration_hours = models.PositiveIntegerField(default=0)
    total_lessons = models.PositiveIntegerField(default=0)
    total_quizzes = models.PositiveIntegerField(default=0)

    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3,  default='KES')
    is_free = models.BooleanField(default=False)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_expiry = models.DateTimeField(null=True, blank=True)

    # Requirements & Outcomes
    requirements = models.TextField(blank=True)
    what_you_will_learn = models.JSONField(default=list)

    # Status & Visibility
    status = models.CharField(max_length=20, choices=COURSE_STATUS, default='draft')
    is_featured = models.BooleanField(default=False)
    published_date = models.DateTimeField(null=True, blank=True)

    # Instructors
    instructors = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='courses_teaching')  # Instructors for the course


    # Metadata
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            # Uniqueness
            original_slug = self.slug
            counter = 1
            while Course.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)


    @property
    def is_on_discount(self):
        if self.discount_price and self.discount_expiry:
            from django.utils import timezone
            return timezone.now() < self.discount_expiry
        return False

    @property
    def current_price(self):
        return self.discount_price if self.is_on_discount else self.price

class Module(models.Model):
    """ A module is a section within a course"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    duration_minutes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        ordering = ['order']
        unique_together = ['course', 'order']


    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Lesson(models.Model):
    """ Individual lessons within a module"""
    LESSON_TYPES = (
        ('video', 'Video Lesson'),
        ('text', 'Text Lesson'),
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
    )

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPES)
    order = models.PositiveIntegerField(default=0)


    # Content based on type
    video_url = models.URLField(blank=True)
    video_duration = models.PositiveIntegerField(default=0) 
    content = models.TextField(blank=True)

    # Resources
    resources = models.JSONField(default=list, blank=True)


    # Metadata
    is_preview = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        unique_together = ['module', 'order']

    def __str__(self):
        return f"{self.module.title} - {self.title}"


class Enrollment(models.Model):
    """ Track user enrollments"""
    ENROLLMENT_STATUS = (
            ('active', 'Active'),
            ('completed', 'Completed'),
            ('dropped', 'Dropped'),
        )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=ENROLLMENT_STATUS, default='active')

    # Progress tracking
    last_accessed = models.DateTimeField(auto_now=True)
    current_lesson = models.ForeignKey('Lesson', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.email} - {self.course.title}"

    @property
    def progress_percentage(self):
        """Returns the percentage of lessons completed by the user in this enrollment."""
        total_lessons = self.course.total_lessons
        if total_lessons == 0:
            return 0
        # Use the related_name 'completed_lessons' from LessonProgress to count completed lessons
        completed = self.completed_lessons.count()
        return int((completed / total_lessons) * 100)

class LessonProgress(models.Model):
    """ Track which lessons a user has completed """
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='completed_lessons')
    lesson = models.ForeignKey('Lesson', on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)
    time_spent = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['enrollment', 'lesson']

    def __str__(self):
        return f"{self.enrollment.user.email} complete {self.lesson.title}"

class Payment(models.Model):
    """ Payment records for course enrollments """
    PAYMENT_STATUS = (
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('refunded', 'Refunded'),
    )

    PAYMENT_METHODS = (
            ('mpesa', 'M-Pesa'),
            ('stripe', 'Stripe'),
            ('paypal', 'Paypal'),
            ('manual', 'Manual'),
    )

    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='KES')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    transaction_id = models.CharField(max_length=100, unique=True)
    mpesa_code = models.CharField(max_length=50, blank=True)


    # Status
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    paid_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"payment {self.transaction_id} -  {self.amount} {self.currency}"


class Certificate(models.Model):
    """Certificates issued upon course completion"""
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='certificate')
    certificate_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    issue_date = models.DateTimeField(auto_now_add=True)
    certificate_url = models.URLField(blank=True)
    issued_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    # PDF generation
    certificate_data = models.JSONField(default=dict)


    class Meta:
        ordering = ['-issue_date']

    def __str__(self):
        return f"Certificate {self.certificate_id} - {self.enrollment.user.email}"

class CourseReview(models.Model):
    """User reviews for courses"""
    RATINGS = [(i, str(i)) for i in range(1, 6)]


    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveSmallIntegerField(choices=RATINGS)
    comment = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.enrollment.user.email} - {self.rating} stars"
# Models for the Courses app
# Each model represents a key entity in the course management system



