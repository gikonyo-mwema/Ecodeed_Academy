"""
═══════════════════════════════════════════════════════════════════════════════
COURSE URLS — Course management and enrollment endpoints.

URL routing for course-related API endpoints including course CRUD, enrollment,
lesson content, live sessions, resources, and assignments.

═══════════════════════════════════════════════════════════════════════════════
ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

Courses:
  GET    /courses/                   - List published courses
  POST   /courses/                   - Create course (admin/instructor)
  GET    /courses/{id}/              - Get course details
  PUT    /courses/{id}/              - Update course (admin/instructor)
  DELETE /courses/{id}/              - Delete course (admin/instructor)

Enrollments:
  GET    /enrollments/               - List user enrollments
  POST   /enrollments/               - Enroll in course
  GET    /enrollments/{id}/          - Get enrollment details
  PUT    /enrollments/{id}/          - Update enrollment
  DELETE /enrollments/{id}/          - Unenroll from course

Lessons:
  GET    /lessons/                   - List lessons
  POST   /lessons/                   - Create lesson (instructor)
  GET    /lessons/{id}/              - Get lesson content
  PUT    /lessons/{id}/              - Update lesson
  DELETE /lessons/{id}/              - Delete lesson

Live Sessions:
  GET    /live-sessions/             - List live sessions
  POST   /live-sessions/             - Create session (instructor)
  GET    /live-sessions/{id}/        - Get session details
  PUT    /live-sessions/{id}/        - Update session
  DELETE /live-sessions/{id}/        - Delete session

Resources:
  GET    /resources/                 - List course resources
  POST   /resources/                 - Add resource (instructor)
  GET    /resources/{id}/            - Get resource details
  PUT    /resources/{id}/            - Update resource
  DELETE /resources/{id}/            - Delete resource

Assignments:
  GET    /assignments/               - List assignments
  POST   /assignments/               - Create assignment (instructor)
  GET    /assignments/{id}/          - Get assignment details
  PUT    /assignments/{id}/          - Update assignment
  DELETE /assignments/{id}/          - Delete assignment

Notifications:
  POST   /courses/{course_id}/notify/ - Notify all enrolled students (instructor)

═══════════════════════════════════════════════════════════════════════════════
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, EnrollmentViewSet,
    LessonViewSet, LiveSessionViewSet, ResourceViewSet, AssignmentViewSet,
)
from messages_app.views import course_notify_students

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'live-sessions', LiveSessionViewSet, basename='live-session')
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = [
    path('', include(router.urls)),
    # Instructor: notify all students enrolled in a course
    path('courses/<int:course_id>/notify/',
         course_notify_students,
         name='course-notify-students'),
]