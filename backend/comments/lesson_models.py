"""
═══════════════════════════════════════════════════════════════════════════════
LESSON COMMENT MODELS — Comments on course lesson content.

Threaded comment model for lesson-specific discussions. Supports likes,
user tracking, and HTML sanitization for safe user-generated content.

═══════════════════════════════════════════════════════════════════════════════
MODEL: LessonComment
═══════════════════════════════════════════════════════════════════════════════

Purpose:
  Comments on specific lessons within courses. Allows students to ask
  questions and engage with course content at the lesson level.

Fields:
  - content (Text, max 500): Comment body (HTML sanitized on save)
  - lesson (FK → Lesson): The lesson being commented on
  - user (FK → User): Author of the comment
  - likes (M2M → User): Users who liked this comment
  - created_at (DateTime): Auto-set creation timestamp
  - updated_at (DateTime): Auto-updated modification timestamp

Relationships:
  - lesson: Related lesson (cascade delete on lesson removal)
  - user: Comment author (cascade delete on user removal)
  - likes: Users who liked this comment (symmetric M2M)

Methods:
  - __str__: Human-readable comment identifier ("Comment by X on Y")
  - save(): Sanitize HTML content before storing
  - likes_count (property): Count total likes on comment

Database:
  Table: comments_lessoncomment
  Indexes:
    - (lesson, -created_at): Fast retrieval of lesson comments by date
  Ordering: -created_at (newest first)

Security:
  - HTML sanitization: All user content cleaned via _sanitize_comment()
  - Only 500 chars max to prevent abuse

═══════════════════════════════════════════════════════════════════════════════
"""

from django.db import models
from django.conf import settings
from courses.models import Lesson
from .models import _sanitize_comment

class LessonComment(models.Model):
    """
    LessonComment — Comment on a lesson within a course.
    
    Allows students to discuss and ask questions about specific lesson content.
    Supports likes and automatic HTML sanitization for security.
    
    Fields:
      content (TextField): Comment text (max 500 chars, sanitized)
      lesson (ForeignKey): Lesson being commented on
      user (ForeignKey): Author of comment
      likes (ManyToMany): Users who liked this comment
      created_at (DateTime): Auto-set timestamp
      updated_at (DateTime): Auto-updated timestamp
    
    Methods:
      __str__(): Returns comment summary
      save(): Sanitizes HTML before storage
      likes_count: Property returning count of likes
    
    Relationships:
      - lesson: Cascade delete (comment removed if lesson deleted)
      - user: Cascade delete (comment removed if user deleted)
    
    Ordering: -created_at (newest first)
    
    Indexes:
      - (lesson, -created_at): Fast retrieval by lesson + date
    
    @model LessonComment
    @version 1.0.0
    """
    content = models.TextField(max_length=500)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_comments')
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_lesson_comments', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['lesson', '-created_at']),
        ]

    def __str__(self):
        return f"Comment by {self.user} on {self.lesson.title}"

    def save(self, *args, **kwargs):
        if self.content:
            self.content = _sanitize_comment(self.content)
        super().save(*args, **kwargs)

    @property
    def likes_count(self):
        return self.likes.count()
