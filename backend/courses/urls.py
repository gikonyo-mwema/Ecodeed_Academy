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