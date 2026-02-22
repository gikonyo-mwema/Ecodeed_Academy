from django.db import models
from django.conf import settings
from courses.models import Lesson

class LessonComment(models.Model):
    content = models.TextField(max_length=500)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_comments')
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_lesson_comments', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.user} on {self.lesson.title}"

    @property
    def likes_count(self):
        return self.likes.count()
