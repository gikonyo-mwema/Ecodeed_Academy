from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, EnrollmentViewSet
from messages_app.views import course_notify_students

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
    # Instructor: notify all students enrolled in a course
    path('courses/<int:course_id>/notify/',
         course_notify_students,
         name='course-notify-students'),
]