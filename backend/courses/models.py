"""
═══════════════════════════════════════════════════════════════════════════════
COURSE MANAGEMENT MODELS

This module defines the core course structure for Ecodeed Academy, including
courses, modules, lessons, assignments, resources, and live sessions.

═══════════════════════════════════════════════════════════════════════════════
DATA MODEL HIERARCHY
═══════════════════════════════════════════════════════════════════════════════

Course (top level)
  ├─ Instructor: FK to User
  ├─ Category: Choice field (Specialized, Masterclass, Webinar, etc.)
  ├─ Modules: One-to-many relationship
  │  └─ Module (course content container)
  │     ├─ Lessons: One-to-many
  │     ├─ Assignments: One-to-many
  │     ├─ Resources: One-to-many
  │     └─ Live Sessions: One-to-many
  │
  └─ Enrollments: One-to-many relationship

Example hierarchy:
  Python Basics (Course)
    └─ Module 1: Getting Started
       ├─ Lesson 1.1: Environment Setup
       ├─ Lesson 1.2: First Program
       ├─ Assignment 1: Write Hello World
       ├─ Resource: Python Docs
       └─ Live Session: Office Hours

═══════════════════════════════════════════════════════════════════════════════
"""

from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model

User = get_user_model()

class Course(models.Model):
    """
    ═════════════════════════════════════════════════════════════════════════════
    COURSE MODEL
    
    Main course representation. Contains metadata, instructor info, and curriculum.
    Each course can have multiple modules that organize lessons hierarchically.
    
    Key Features:
    - Email-based slug generation for URL-safe course identifiers
    - Price management (free or paid courses)
    - Draft/published states (is_live flag)
    - Certificate support for course completion
    - Weekly pacing or self-paced delivery
    - SEO-optimized (slug field, sitemaps support)
    
    Fields:
      title (str): Course title (max 255 chars)
      slug (str): URL-safe identifier (auto-generated from title)
      short_description (str): Brief course description (max 500 chars)
      full_description (str): Detailed course content description
      price (Decimal): Course price in KES (0 for free courses)
      is_free (bool): Flag for free courses (overrides price)
      instructor (FK): Course creator/teacher (User model)
      category (str): Course classification (choices: Specialized, Masterclass, etc.)
      level (JSON): Difficulty levels (Beginner, Intermediate, Advanced, etc.)
      format (JSON): Course format tags (video, interactive, live, etc.)
      features (JSON): Course features/capabilities list
      faqs (JSON): Frequently asked questions
      target_audience (JSON): Who should take this course
      is_popular (bool): Marketing flag for featured courses
      is_live (bool): Published status (false = draft, true = published)
      has_certificate (bool): Whether certificate is awarded on completion
      pacing_type (str): Delivery mode (self_paced or weekly)
      image (URL): Course thumbnail/banner image
      icon_name (str): Name of the icon to display for the course
      created_at (DateTime): Course creation timestamp
      updated_at (DateTime): Last modification timestamp
    
    Methods:
      save(): Auto-generates slug from title if not provided
      __str__(): Returns course title
    
    Indexes:
      - category: Fast filtering by course category
      - -created_at: Newest courses first
    ═════════════════════════════════════════════════════════════════════════════
    """
    
    CATEGORY_CHOICES = [
        ('specialized', 'Specialized'),
        ('masterclass', 'Masterclass'),
        ('webinar', 'Webinar'),
        ('coaching', 'Coaching'),
        ('compliance', 'Compliance'),
        ('licensing', 'Licensing'),
    ]

    PACING_CHOICES = [
        ('self_paced', 'Self-Paced'),
        ('weekly', 'Weekly Content'),
    ]

    # ── Course Metadata ──
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    short_description = models.TextField(max_length=500)
    full_description = models.TextField(blank=True, null=True)
    
    # ── Pricing ──
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_free = models.BooleanField(default=False)
    
    # ── Content Organization ──
    level = models.JSONField(default=list, blank=True) 
    format = models.JSONField(default=list, blank=True)
    features = models.JSONField(default=list, blank=True)
    
    # ── Additional Info ──
    faqs = models.JSONField(default=list, blank=True)
    target_audience = models.JSONField(default=list, blank=True)
    resources = models.JSONField(default=list, blank=True)
    
    # ── Course Details ──
    external_url = models.URLField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    is_popular = models.BooleanField(default=False)
    is_live = models.BooleanField(default=False)
    has_certificate = models.BooleanField(default=False, help_text="Whether this course offers a certificate upon completion")
    pacing_type = models.CharField(max_length=20, choices=PACING_CHOICES, default='self_paced', help_text="How weekly content is unlocked")
    
    # ── Media & Icon ──
    image = models.URLField(max_length=1000, blank=True, null=True)
    icon_name = models.CharField(max_length=100, blank=True, null=True, help_text="Name of the icon to display for the course")
    
    # ── Relationships ──
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses_taught')

    # ── Timestamps ──
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """
        AUTO-GENERATE SLUG
        
        If slug is not provided, automatically generate it from the course title.
        Handles slug collisions by appending incrementing numbers.
        
        Example:
          "Python Basics" → slug: "python-basics"
          If taken, next: "python-basics-2", "python-basics-3", etc.
        """
        if not self.slug:
            base = slugify(self.title) or 'course'
            slug = base
            counter = 1
            while Course.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    class Meta:
        # Database indexes for frequently filtered fields
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        """String representation returns course title"""
        return self.title

class Module(models.Model):
    """
    ═════════════════════════════════════════════════════════════════════════════
    MODULE MODEL
    
    Organizes course content into logical sections. Each module contains lessons,
    assignments, resources, and live sessions.
    
    Modules are ordered within a course and form the main curriculum structure.
    
    Fields:
      course (FK): Parent course
      title (str): Module title
      description (str): Module description
      order (int): Display order within course (0-indexed)
    
    Example:
      Course: "Python Basics"
        Module 1: "Getting Started" (order=1)
        Module 2: "Working with Data" (order=2)
        Module 3: "Functions & Modules" (order=3)
    ═════════════════════════════════════════════════════════════════════════════
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        indexes = [
            models.Index(fields=['course', 'order']),
        ]

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Lesson(models.Model):
    """
    ═════════════════════════════════════════════════════════════════════════════
    LESSON MODEL
    
    Individual learning units within a module. Lessons contain text content and
    optional videos, serving as the smallest curriculum unit.
    
    Features:
    - Video embedding (Vimeo, YouTube, S3)
    - Duration tracking for analytics
    - Free preview support (first lesson often free)
    - Ordered sequentially within module
    
    Fields:
      module (FK): Parent module (cascade delete)
      title (str): Lesson title (max 255 chars)
      content (str): Markdown/HTML text content, lecture notes, transcripts
      video_url (str): Video hosting URL (optional):
        - Vimeo: https://vimeo.com/{id}
        - YouTube: https://youtube.com/watch?v={id}
        - Cloudinary: https://res.cloudinary.com/{id}/video/upload/{file}
        - S3: https://s3.amazonaws.com/bucket/file.mp4
      duration (int): Video/lesson duration in seconds (0 if no video)
      is_free_preview (bool): Whether lesson is available to non-enrolled users
        - First lesson often free to encourage enrollment
      order (int): Display order within module (0-indexed)
        - 0 = first lesson, 1 = second lesson, etc.
      created_at (timestamp): When lesson was created
      updated_at (timestamp): When lesson was last updated
    
    Methods:
      __str__(): Returns lesson title
      get_duration_minutes(): Returns duration as "HH:MM" format
      
    Indexes:
      - (module, order): Fast retrieval of lesson sequence
    
    Example:
      Lesson: "What is Python?"
        module: "Getting Started" (Module)
        title: "What is Python?"
        video_url: "https://vimeo.com/123456789"
        duration: 600 (10 minutes)
        is_free_preview: True
        order: 0
    
    Usage:
      lesson = Lesson.objects.get(module__course__slug='python-basics')
      lessons = module.lessons.all().order_by('order')
    ═════════════════════════════════════════════════════════════════════════════
    """
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, help_text="Markdown/HTML text content or lecture notes")
    video_url = models.URLField(blank=True, null=True, help_text="Vimeo/YouTube/S3 video URL")
    duration = models.PositiveIntegerField(help_text="Duration in seconds", default=0)
    is_free_preview = models.BooleanField(default=False, help_text="Whether this lesson is free to preview")
    order = models.PositiveIntegerField(default=0, help_text="Display order within module")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
        indexes = [
            models.Index(fields=['module', 'order']),
        ]

    def __str__(self):
        return self.title
    
    def get_duration_minutes(self):
        """Convert duration (seconds) to MM:SS format"""
        minutes = self.duration // 60
        seconds = self.duration % 60
        return f"{minutes}:{seconds:02d}"

class Assignment(models.Model):
    """
    ═════════════════════════════════════════════════════════════════════════════
    ASSIGNMENT MODEL
    
    Homework and practice assignments given to students within a module.
    Tracks assignment metadata and submission links.
    
    Features:
    - Due date management
    - Resource templates/instructions
    - Tracks submissions separately (AssignmentSubmission model)
    - Optional grading integration
    
    Fields:
      module (FK): Parent module (cascade delete)
      title (str): Assignment title (max 255 chars)
      description (str): Assignment instructions/requirements
      due_date (timestamp): When assignment is due (optional)
        - NULL = no specific deadline
        - Used for analytics and reminder notifications
      resource_url (str): Link to assignment template or instructions
        - Google Docs, Dropbox Paper, PDF, etc.
        - Can be blank if instructions in description
      created_at (timestamp): When assignment was created
      updated_at (timestamp): When assignment was last updated
    
    Relationships:
      submissions: Reverse relation to AssignmentSubmission (many)
        - Access all student submissions: assignment.submissions.all()
        - Filter by status: .filter(is_reviewed=False)
    
    Methods:
      __str__(): Returns assignment title
      get_pending_submissions(): Returns unreviewed submissions
      
    Example:
      Assignment: "Build a Calculator"
        module: "Functions & Modules"
        title: "Build a Calculator Program"
        description: "Create a simple calculator that supports +, -, *, /"
        due_date: 2024-02-15 23:59:59
        resource_url: "https://docs.google.com/document/d/1Abc123..."
    
    Related Models:
      AssignmentSubmission: Individual student submissions
        - Tracks student, submission file, feedback, grades
    ═════════════════════════════════════════════════════════════════════════════
    """
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=255)
    description = models.TextField(help_text="Assignment instructions and requirements")
    due_date = models.DateTimeField(null=True, blank=True, help_text="When assignment is due (optional)")
    resource_url = models.URLField(blank=True, null=True, help_text="Link to assignment file, template, or rubric")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    def get_pending_submissions(self):
        """Get all submissions that haven't been reviewed yet"""
        return self.submissions.filter(is_reviewed=False)

class AssignmentSubmission(models.Model):
    """
    ═════════════════════════════════════════════════════════════════════════════
    ASSIGNMENT SUBMISSION MODEL
    
    Tracks individual student submissions for assignments including files,
    feedback, and grades from instructors.
    
    Features:
    - File submission management (typically Cloudinary URLs)
    - Instructor feedback system
    - Automatic submission timestamps
    - Grade tracking (flexible format: A+, 95/100, pass/fail, etc.)
    - Review workflow (is_reviewed flag)
    
    Fields:
      assignment (FK): Parent assignment (cascade delete)
      student (FK): Student who submitted (cascade delete on user delete)
      submission_file_url (str): URL to submitted file (Cloudinary, S3, etc.)
        - Example: "https://res.cloudinary.com/.../c_scale,w_800/assignment123.pdf"
      submitted_at (timestamp): When student submitted (auto-set)
      feedback (str): Instructor feedback/comments (optional)
      grade (str): Grade given by instructor (flexible)
        - Examples: "A+", "95/100", "pass", "excellent", etc.
      is_reviewed (bool): Whether instructor has reviewed
        - False = pending review
        - True = feedback and grade have been provided
      created_at (timestamp): When submission record was created
      updated_at (timestamp): When submission was last modified
    
    Methods:
      __str__(): Returns "student@email - assignment title"
      mark_as_reviewed(): Sets is_reviewed=True and saves
      
    Indexes:
      - (assignment, is_reviewed): Find unreviewed submissions for grading
      - (student, submitted_at): Student submission history
    
    Example:
      Submission: Student's calculator project
        assignment: "Build a Calculator"
        student: "john@example.com"
        submission_file_url: "https://res.cloudinary.com/.../calculator.py"
        submitted_at: 2024-02-14 15:30:00 (before due date)
        feedback: "Great work! Consider adding error handling."
        grade: "A"
        is_reviewed: True
    
    Workflow:
      1. Student submits assignment → AssignmentSubmission created
      2. Instructor reviews submission → Adds feedback and grade
      3. Instructor marks is_reviewed=True → Student notified
      4. Report can show graded vs pending submissions
    ═════════════════════════════════════════════════════════════════════════════
    """
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    submission_file_url = models.URLField(max_length=1000, help_text="Cloudinary or S3 URL to submitted file")
    submitted_at = models.DateTimeField(auto_now_add=True, help_text="When student submitted")
    feedback = models.TextField(blank=True, null=True, help_text="Instructor feedback/comments")
    grade = models.CharField(max_length=50, blank=True, null=True, help_text="Grade given (A+, 95/100, etc.)")
    is_reviewed = models.BooleanField(default=False, help_text="Whether instructor has reviewed and graded")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['assignment', 'is_reviewed']),
            models.Index(fields=['student', '-submitted_at']),
        ]

    def __str__(self):
        return f"{self.student.email} - {self.assignment.title}"
    
    def mark_as_reviewed(self):
        """Mark submission as reviewed by instructor"""
        self.is_reviewed = True
        self.save(update_fields=['is_reviewed', 'updated_at'])

class LiveSession(models.Model):
    """
    ═════════════════════════════════════════════════════════════════════════════
    LIVE SESSION MODEL
    
    Live classes, workshops, Q&A sessions, and office hours scheduled for
    synchronous learning. Tracks Zoom meetings with optional recordings.
    
    Features:
    - Zoom integration (live meeting links)
    - Recording support (for students who miss live session)
    - Date/time scheduling
    - Module-based organization
    
    Fields:
      module (FK): Parent module (cascade delete)
      title (str): Session title (max 255 chars)
        - Examples: "Module 1 Live Class", "Q&A Session", "Office Hours"
      description (str): Session description, agenda, or guidelines
      date_time (timestamp): When the live session occurs
        - Used for scheduling, reminders, and timezone conversions
      zoom_link (str): Zoom meeting URL
        - Example: "https://zoom.us/j/123456789?pwd=ABC123..."
        - Should include password for security
      recording_url (str): URL to recording after session (optional)
        - Example: "https://zoom.us/recording/share/abc123xyz"
        - NULL until session is recorded
      created_at (timestamp): When session was scheduled
      updated_at (timestamp): When session details were last updated
    
    Methods:
      __str__(): Returns session title
      is_upcoming(): Check if session hasn't occurred yet
      has_recording(): Check if recording is available
      
    Example:
      LiveSession: Python Module Q&A
        module: "Functions & Modules"
        title: "Module 3 Live Q&A Session"
        description: "Ask questions about functions, scope, decorators"
        date_time: 2024-02-20 14:00:00 (UTC)
        zoom_link: "https://zoom.us/j/91234567890?pwd=..."
        recording_url: NULL (until after session)
    
    Workflow:
      1. Instructor creates LiveSession with zoom_link and date_time
      2. At scheduled time, students join via zoom_link
      3. After session, Zoom recording uploaded and recording_url added
      4. Students can watch recording if they missed live session
      5. Recording stays available for course duration
    
    Integration:
      - Sends reminder emails 24h and 1h before session
      - Notifications to enrolled students: "Live session in 1 hour"
      - Calendar invites may be auto-generated with zoom_link
    ═════════════════════════════════════════════════════════════════════════════
    """
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='live_sessions')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, help_text="Session agenda, requirements, or guidelines")
    date_time = models.DateTimeField(help_text="When the live session occurs (UTC timezone)")
    zoom_link = models.URLField(max_length=1000, help_text="Zoom meeting URL with password")
    recording_url = models.URLField(max_length=1000, blank=True, null=True, help_text="Zoom recording URL (added after session)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    def is_upcoming(self):
        """Check if session hasn't occurred yet"""
        from django.utils import timezone
        return self.date_time > timezone.now()
    
    def has_recording(self):
        """Check if recording is available"""
        return bool(self.recording_url)

class Resource(models.Model):
    """
    ═════════════════════════════════════════════════════════════════════════════
    RESOURCE MODEL
    
    Supplementary learning materials (PDFs, documents, links, videos) provided
    for a module. Resources support multiple file types and are indexed by type
    for easy discovery.
    
    Features:
    - Multiple resource types (PDF, document, spreadsheet, link, video, etc.)
    - Rich descriptions and metadata
    - File hosting support (Cloudinary, Drive, external links)
    - Categorization by type
    
    Fields:
      module (FK): Parent module (cascade delete)
      title (str): Resource title (max 255 chars)
        - Examples: "Reading List", "Slides PDF", "Dataset"
      description (str): What the resource contains, how to use it
      file_url (str): URL to the resource file or external link
        - PDF: "https://res.cloudinary.com/.../my_guide.pdf"
        - Google Drive: "https://drive.google.com/file/d/1abc..."
        - External: "https://github.com/user/repo"
        - Video: "https://vimeo.com/123456789"
      resource_type (str): Category of resource (see RESOURCE_TYPE_CHOICES)
        - pdf: PDF documents
        - link: External website/resource
        - video: Video file or link
        - document: Google Docs, Word docs
        - spreadsheet: Excel, Google Sheets
        - other: Miscellaneous
      created_at (timestamp): When resource was added
      updated_at (timestamp): When resource was last updated
    
    Methods:
      __str__(): Returns resource title
      get_icon(): Returns icon name based on resource type
      
    Example Resources:
      Resource 1: Supplementary Reading
        module: "Getting Started"
        title: "Python Official Documentation"
        resource_type: "link"
        file_url: "https://docs.python.org/3/"
        description: "Official Python language reference"
      
      Resource 2: Course Materials
        module: "Data Structures"
        title: "Lecture Slides"
        resource_type: "pdf"
        file_url: "https://res.cloudinary.com/.../week1_slides.pdf"
        description: "Comprehensive slides covering lists, tuples, dictionaries"
    
    Usage in Frontend:
      - Display resources in tab with icons based on resource_type
      - Filter: .filter(resource_type='pdf')
      - Group by type: .values('resource_type').annotate(count=Count('id'))
    
    Filtering Examples:
      # Get all PDFs in a module
      resources = module.resources.filter(resource_type='pdf')
      
      # Get all external links
      links = Resource.objects.filter(resource_type='link')
      
      # Get resources by type with count
      by_type = Resource.objects.values('resource_type').annotate(
          total=Count('id')
      )
    ═════════════════════════════════════════════════════════════════════════════
    """
    RESOURCE_TYPE_CHOICES = [
        ('pdf', 'PDF Document'),
        ('link', 'External Link'),
        ('video', 'Video'),
        ('document', 'Document'),
        ('spreadsheet', 'Spreadsheet'),
        ('other', 'Other'),
    ]

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, help_text="Description of resource and how to use it")
    file_url = models.URLField(max_length=1000, help_text="URL to file or external resource")
    resource_type = models.CharField(
        max_length=20,
        choices=RESOURCE_TYPE_CHOICES,
        default='link',
        help_text="Type of resource for categorization and icons"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    def get_icon(self):
        """Return icon name for frontend based on resource type"""
        icon_map = {
            'pdf': 'HiOutlineDocumentText',
            'link': 'HiOutlineExternalLink',
            'video': 'HiOutlinePlayCircle',
            'document': 'HiOutlineDocument',
            'spreadsheet': 'HiOutlineTable',
            'other': 'HiOutlineDocumentDuplicate',
        }
        return icon_map.get(self.resource_type, 'HiOutlineDocument')

class Enrollment(models.Model):
    """
    ═════════════════════════════════════════════════════════════════════════════
    ENROLLMENT MODEL
    
    Represents a student's registration and participation in a course.
    Tracks enrollment status, progress, and learning journey metrics.
    
    Features:
    - Unique enrollment per student per course
    - Status tracking (active, completed, dropped, paused)
    - Progress tracking (lessons completed, modules done)
    - Timestamps for analytics (when enrolled, completion date)
    
    Fields:
      user (FK): Student/user enrolled (cascade delete)
      course (FK): Course enrolled in (cascade delete)
      enrolled_at (timestamp): When student enrolled (auto-set)
      status (str): Current enrollment status
        - "active": Currently taking the course
        - "completed": Finished course, passed all requirements
        - "dropped": Student withdrew
        - "paused": Temporarily paused learning
      progress (JSON): Tracks learning progress
        - Example: {
            "lessons_completed": 15,
            "modules_completed": 3,
            "total_lessons": 45,
            "last_accessed": "2024-02-20T10:30:00Z",
            "completion_percentage": 33
          }
      created_at (timestamp): When enrollment was created
      updated_at (timestamp): When enrollment was last updated
    
    Methods:
      __str__(): Returns "student@email enrolled in Course Title"
      get_completion_percentage(): Calculate % progress
      mark_lesson_complete(): Update progress when lesson done
      mark_course_complete(): Set status to "completed"
      
    Constraints:
      - unique_together: (user, course) - One enrollment per student per course
      - user + course combo is unique (prevents duplicate enrollments)
    
    Indexes:
      - status: Find active/completed enrollments
      - -enrolled_at: Newest enrollments first
      - (user, status): Student's enrollments filtered by status
    
    Example:
      Enrollment: John in Python Basics
        user: "john@example.com"
        course: "Python Basics" (python-basics)
        enrolled_at: 2024-01-15 09:00:00
        status: "active"
        progress: {
          "lessons_completed": 5,
          "modules_completed": 1,
          "total_lessons": 45,
          "completion_percentage": 11,
          "last_accessed": "2024-02-20T14:30:00Z"
        }
    
    Related Models:
      LessonCompletion: Track which lessons are done (many)
        - Access: enrollment.completed_lessons.all()
    
    Queries:
      # Get all active enrollments
      enrollments = Enrollment.objects.filter(status='active')
      
      # Get student's courses
      courses = student.enrollments.filter(
          status='active'
      ).values_list('course', flat=True)
      
      # Get course's students
      students = course.enrollments.filter(
          status='active'
      ).select_related('user')
      
      # Find incomplete enrollments (for progress reports)
      incomplete = Enrollment.objects.filter(
          status__in=['active', 'paused']
      ).select_related('user', 'course')
    ═════════════════════════════════════════════════════════════════════════════
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        default='active',
        choices=[
            ('active', 'Active'),
            ('completed', 'Completed'),
            ('dropped', 'Dropped'),
            ('paused', 'Paused'),
        ],
        help_text="Current enrollment status"
    )
    progress = models.JSONField(
        default=dict,
        blank=True,
        help_text="Tracks learning progress: lessons_completed, modules_done, etc."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'course')
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['-enrolled_at']),
            models.Index(fields=['user', 'status']),
        ]

    def __str__(self):
        return f"{self.user.email} enrolled in {self.course.title}"
    
    def get_completion_percentage(self):
        """Calculate course completion percentage"""
        return self.progress.get('completion_percentage', 0)
    
    def mark_lesson_complete(self, lesson):
        """Update progress when student completes a lesson"""
        if 'lessons_completed' not in self.progress:
            self.progress['lessons_completed'] = 0
        self.progress['lessons_completed'] += 1
        self.save(update_fields=['progress', 'updated_at'])

class LessonCompletion(models.Model):
    """
    ═════════════════════════════════════════════════════════════════════════════
    LESSON COMPLETION MODEL
    
    Tracks when individual students complete specific lessons within their
    enrollment. This is the granular completion tracking at lesson level.
    
    Features:
    - Atomic completion tracking (each lesson tracked separately)
    - Timestamp of completion for analytics
    - Prevents duplicate completion records
    
    Fields:
      enrollment (FK): Student's course enrollment (cascade delete)
      lesson (FK): The lesson completed (cascade delete)
      completed_at (timestamp): When student completed the lesson (auto-set)
      created_at (timestamp): When record was created
    
    Methods:
      __str__(): Returns completion info
      get_time_to_complete(): Calculate time spent (if timestamps available)
      
    Constraints:
      - unique_together: (enrollment, lesson) - Can't mark same lesson complete twice
      
    Example:
      LessonCompletion: John completed Python Lesson 1
        enrollment: "john@example.com" in "Python Basics"
        lesson: "What is Python?" (from Module 1)
        completed_at: 2024-02-20 15:45:30
    
    Usage Patterns:
      # Get all lessons completed by student
      completions = student.enrollments.get(
          course=course
      ).completed_lessons.all()
      
      # Check if student completed a lesson
      is_done = LessonCompletion.objects.filter(
          enrollment=enrollment,
          lesson=lesson
      ).exists()
      
      # Get lessons not yet completed (for "resume course" feature)
      completed_ids = enrollment.completed_lessons.values_list(
          'lesson_id', flat=True
      )
      incomplete = lesson.objects.exclude(id__in=completed_ids)
      
      # Track learning velocity (completions per day)
      from django.utils import timezone
      from datetime import timedelta
      week_ago = timezone.now() - timedelta(days=7)
      recent_completions = LessonCompletion.objects.filter(
          completed_at__gte=week_ago
      ).count()
    
    Integration:
      - When student "Mark as Complete", new LessonCompletion record created
      - Enrollment.progress updated (lessons_completed incremented)
      - If all lessons done, Enrollment.status set to "completed"
      - Dashboard displays completion badges for finished lessons
      - "Resume course" button shows next uncompleted lesson
    
    Frontend Integration:
      - Checkbox marked when LessonCompletion exists
      - "Mark as complete" button creates new record
      - Progress bar calculates: completed_count / total_lessons
      - Last lesson shows "Congratulations!" and certificate option
    ═════════════════════════════════════════════════════════════════════════════
    """
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='completed_lessons')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True, help_text="When student marked lesson complete")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('enrollment', 'lesson')
        indexes = [
            models.Index(fields=['enrollment', '-completed_at']),
        ]
    
    def __str__(self):
        return f"{self.enrollment.user.email} completed {self.lesson.title}"
