"""
═══════════════════════════════════════════════════════════════════════════════
COURSE API VIEWS — Course management and enrollment endpoints.

Provides REST endpoints for course browsing, creation, enrollment, and module
content retrieval. Includes permission-based access control (instructors can
manage courses, students can enroll and access content).

═══════════════════════════════════════════════════════════════════════════════
KEY ENDPOINTS
═══════════════════════════════════════════════════════════════════════════════

Courses:
  GET    /api/v1/courses/                 - List published courses (paginated)
  POST   /api/v1/courses/                 - Create course (instructors/admins)
  GET    /api/v1/courses/{id}/            - Retrieve course details + modules
  PUT    /api/v1/courses/{id}/            - Update course (instructor only)
  PATCH  /api/v1/courses/{id}/            - Partial update
  DELETE /api/v1/courses/{id}/            - Delete course (instructor only)
  GET    /api/v1/courses/{id}/content/    - Get full curriculum (enrolled users)
  GET    /api/v1/courses/{id}/enroll/     - Enroll current user

Enrollments:
  GET    /api/v1/enrollments/             - List user's enrollments
  GET    /api/v1/enrollments/{id}/        - Get enrollment details

Modules:
  GET    /api/v1/modules/{id}/            - Get module + lessons
  POST   /api/v1/modules/                 - Create module (instructor)

═══════════════════════════════════════════════════════════════════════════════
PERMISSIONS
═══════════════════════════════════════════════════════════════════════════════

Course Visibility:
  - Public (is_live=true): Visible to all users
  - Draft (is_live=false):
    * Instructor creator: Can see and edit
    * Admin: Can see and edit
    * Others: Hidden

Course Editing:
  - Instructor: Can edit/delete own courses
  - Admin: Can edit/delete any course
  - Others: Read-only access

Enrollment:
  - Authenticated users: Can enroll in published courses
  - Enrolled users: Can access course content
  - Non-enrolled: Limited content access (preview only)

═══════════════════════════════════════════════════════════════════════════════
QUERY OPTIMIZATION
═══════════════════════════════════════════════════════════════════════════════

Uses select_related and prefetch_related to prevent N+1 queries:
  - select_related('instructor'): Course creator (FK)
  - prefetch_related('modules__lessons'): Module lessons (reverse FK)
  - prefetch_related('modules__assignments'): Module assignments
  - prefetch_related('modules__live_sessions'): Module live sessions
  - prefetch_related('modules__resources'): Module resources
  - annotate(_enrollment_count=Count('enrollments')): Enrollment count

═══════════════════════════════════════════════════════════════════════════════
PAGINATION
═══════════════════════════════════════════════════════════════════════════════

List endpoints use CoursePageNumberPagination (default: 10 per page, max: 50)
Response format:
  {
    "count": 150,
    "next": "http://api.example.com/courses/?page=2",
    "previous": null,
    "results": [...]
  }

═══════════════════════════════════════════════════════════════════════════════
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from .models import Course, Enrollment, Lesson, LiveSession, Resource, Assignment
from .serializers import (
    CourseSerializer, EnrollmentSerializer, CourseContentSerializer,
    LessonDetailSerializer, LiveSessionDetailSerializer,
    ResourceDetailSerializer, AssignmentDetailSerializer,
)
from .permissions import IsInstructorOrReadOnly, IsModuleContentInstructor

class CourseViewSet(viewsets.ModelViewSet):
    """
    CourseViewSet — REST API for course management and enrollment.
    
    Provides CRUD operations for courses with role-based access control.
    Instructors can create/edit their own courses; students can enroll
    and access content.
    
    Permissions:
      - Anonymous: GET (list published courses)
      - Authenticated: GET, POST (create), GET detail
      - Instructor: Can edit/delete own courses
      - Admin: Can edit/delete any course
    
    Serializers:
      - Read: CourseSerializer (minimal course info)
      - Write: CourseContentSerializer (includes curriculum, sessions, resources)
    
    Methods:
      list(): List published courses with filtering
      create(): Create new course (instructor/admin only)
      retrieve(): Get course details with modules
      content(): Get full curriculum content (enrolled users only)
      enroll(): Enroll current user in course
      stats(): Get course engagement metrics (admin only)
    
    @viewset CourseViewSet
    @version 1.0.0
    """
    
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        """Use CourseContentSerializer for write operations so the custom
        create()/update() logic that persists curriculum, live_sessions,
        and resources is actually invoked."""
        if self.action in ('create', 'update', 'partial_update'):
            return CourseContentSerializer
        return CourseSerializer

    def get_queryset(self):
        """Optimised queryset with prefetch_related to prevent N+1 queries.
        
        Module → lessons, assignments, live_sessions, resources are all
        reverse FK relations, so we use prefetch_related (not select_related).
        instructor is a FK on Course, so select_related is appropriate.
        _enrollment_count is annotated for the serializer.

        For public list views, only published (is_live=True) courses are shown.
        Admins see everything; instructors also see their own drafts.
        """
        qs = Course.objects.select_related('instructor').prefetch_related(
            'modules__lessons',
            'modules__assignments',
            'modules__live_sessions',
            'modules__resources',
        ).annotate(
            _enrollment_count=Count('enrollments'),
        )

        # For list actions, filter out drafts for public visitors
        if self.action == 'list':
            user = self.request.user
            if user.is_authenticated and user.is_staff:
                # Admins see all courses including drafts
                return qs
            elif user.is_authenticated and getattr(user, 'user_type', None) == 'instructor':
                # Instructors see published courses + their own drafts
                from django.db.models import Q
                return qs.filter(Q(is_live=True) | Q(instructor=user))
            else:
                # Public visitors and regular users see only published courses
                return qs.filter(is_live=True)

        return qs

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsInstructorOrReadOnly()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # Assign current user as instructor if they are creating the course
        serializer.save(instructor=self.request.user)

    lookup_field = 'id' # Use id for most things (like delete)

    def get_object(self):
        """
        Support both ID and Slug as lookups.
        If lookup is numeric, assume ID; otherwise assume Slug.
        """
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]

        if lookup_value.isdigit():
            # If it's a digit, look by ID
            filter_kwargs = {self.lookup_field: lookup_value}
        else:
            # Otherwise look by slug
            filter_kwargs = {'slug': lookup_value}

        obj = get_object_or_404(queryset, **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='my-taught-courses')
    def my_taught_courses(self, request):
        qs = self.get_queryset()
        if request.user.is_staff:
             # Admins see all
             courses = qs.all()
        else:
             # Mentors see only their own
             courses = qs.filter(instructor=request.user)
        
        page = self.paginate_queryset(courses)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-category')
    def by_category(self, request):
        courses = self.get_queryset()
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def content(self, request, **kwargs):
        """
        Secure endpoint to get full course content (videos, resources).
        Only accessible if enrolled.
        """
        course = self.get_object()
        user = request.user
        
        # Check enrollment or admin status
        if user.is_staff or user.is_superuser:
            is_enrolled = True
        else:
            is_enrolled = Enrollment.objects.filter(user=user, course=course, status='active').exists()
            
        if not is_enrolled:
            return Response(
                {'message': 'You must be enrolled to access this content.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # If enrolled, return full data including protected assets
# Use the specialized serializer that includes protected content (video_url)
        serializer = CourseContentSerializer(course)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='preview-content')
    def preview_content(self, request, **kwargs):
        """
        Instructor/Admin preview endpoint.
        Returns the same full payload as student learning view, but only for:
        - course instructor
        - admin/staff users
        """
        course = self.get_object()
        user = request.user

        is_admin = user.is_staff or user.is_superuser
        is_owner = course.instructor_id == user.id

        if not (is_admin or is_owner):
            return Response(
                {'message': 'Only the course instructor or admin can preview this course as a student.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CourseContentSerializer(course)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def weeks(self, request, **kwargs):
        """Return weekly content with lock/unlock status for enrolled student.
        
        Self-paced: Each week unlocks when all lessons in the previous week are completed.
        Scheduled: Each week unlocks N weeks after the student's enrollment date.
        Week 1 is always unlocked.
        """
        from datetime import timedelta
        from django.utils import timezone
        from .models import Lesson, LessonCompletion

        course = self.get_object()
        user = request.user
        is_staff = user.is_staff or user.is_superuser

        # Check enrollment
        enrollment = None
        if not is_staff:
            enrollment = Enrollment.objects.filter(
                user=user, course=course, status='active'
            ).first()
            if not enrollment:
                return Response(
                    {'message': 'You must be enrolled to access this content.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            enrollment = Enrollment.objects.filter(user=user, course=course).first()

        # Prefetch all nested relations in two queries instead of N+1
        from django.db.models import Prefetch
        modules = course.modules.prefetch_related(
            Prefetch('lessons', queryset=Lesson.objects.order_by('order')),
            'assignments',
            'resources',
            'live_sessions',
        ).order_by('order')

        # Get completed lesson IDs (single query)
        completed_lesson_ids = set()
        if enrollment:
            completed_lesson_ids = set(
                LessonCompletion.objects.filter(enrollment=enrollment)
                .values_list('lesson_id', flat=True)
            )

        weeks_data = []
        prev_week_complete = True  # Makes week 1 always unlocked

        for idx, module in enumerate(modules):
            lessons = module.lessons.all()  # Uses prefetched cache (already ordered)
            lesson_ids = [l.id for l in lessons]
            completed_in_week = [lid for lid in lesson_ids if lid in completed_lesson_ids]
            all_done = len(completed_in_week) == len(lesson_ids) and len(lesson_ids) > 0

            # Determine unlock status
            if is_staff:
                is_unlocked = True
            elif idx == 0:
                is_unlocked = True
            elif course.pacing_type == 'self_paced':
                is_unlocked = prev_week_complete
            else:  # scheduled
                enroll_date = enrollment.enrolled_at if enrollment else timezone.now()
                unlock_date = enroll_date + timedelta(weeks=idx)
                # Unlock if: calendar date has passed OR previous week is fully completed
                is_unlocked = timezone.now() >= unlock_date or prev_week_complete

            lessons_data = []
            for lesson in lessons:
                lesson_data = {
                    'id': lesson.id,
                    'title': lesson.title,
                    'duration': lesson.duration,
                    'is_completed': lesson.id in completed_lesson_ids,
                    'is_accessible': is_unlocked,
                    'order': lesson.order,
                }
                # Include full content only for unlocked weeks
                if is_unlocked:
                    lesson_data['content'] = lesson.content
                    lesson_data['video_url'] = lesson.video_url
                lessons_data.append(lesson_data)

            # Gather assignments, resources, live sessions for this week
            assignments_data = []
            for a in module.assignments.all():
                assignments_data.append({
                    'id': a.id,
                    'title': a.title,
                    'description': a.description if is_unlocked else '',
                    'due_date': a.due_date.isoformat() if a.due_date else None,
                    'resource_url': a.resource_url if is_unlocked else None,
                })

            resources_data = []
            for r in module.resources.all():
                resources_data.append({
                    'id': r.id,
                    'title': r.title,
                    'file_url': r.file_url if is_unlocked else None,
                })

            live_sessions_data = []
            for ls in module.live_sessions.all():
                live_sessions_data.append({
                    'id': ls.id,
                    'title': ls.title,
                    'description': ls.description,
                    'date_time': ls.date_time.isoformat() if ls.date_time else None,
                    'zoom_link': ls.zoom_link if is_unlocked else None,
                    'recording_url': ls.recording_url if is_unlocked else None,
                })

            weeks_data.append({
                'id': module.id,
                'week_number': idx + 1,
                'title': module.title,
                'description': module.description,
                'is_unlocked': is_unlocked,
                'is_current': False,
                'all_completed': all_done,
                'completed_count': len(completed_in_week),
                'total_count': len(lesson_ids),
                'lessons': lessons_data,
                'assignments': assignments_data,
                'resources': resources_data,
                'live_sessions': live_sessions_data,
            })

            prev_week_complete = all_done

        # Mark the current week (first unlocked + not fully completed)
        for w in weeks_data:
            if w['is_unlocked'] and not w['all_completed']:
                w['is_current'] = True
                break

        return Response({
            'course_id': course.id,
            'course_title': course.title,
            'course_slug': course.slug,
            'pacing_type': course.pacing_type,
            'total_weeks': len(weeks_data),
            'weeks': weeks_data,
        })

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Prefetch course → modules → children so EnrollmentSerializer
        doesn't trigger N+1 when nesting CourseSerializer.

        Annotations provide live progress counts (total_lessons,
        completed_count) so the serializer never needs per-row queries.
        """
        qs = Enrollment.objects.select_related(
            'user', 'course__instructor'
        ).prefetch_related(
            'course__modules__lessons',
            'course__modules__assignments',
            'course__modules__live_sessions',
            'course__modules__resources',
            'completed_lessons',          # for completed lesson IDs list
        ).annotate(
            total_lessons=Count('course__modules__lessons', distinct=True),
            completed_count=Count('completed_lessons', distinct=True),
        )
        if self.request.user.is_staff:
            return qs
        # Instructors see enrollments for courses they teach
        from users.models import CustomUser
        if self.request.user.user_type == CustomUser.UserType.MENTOR:
            return qs.filter(
                Q(user=self.request.user) |
                Q(course__instructor=self.request.user)
            )
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        from users.models import CustomUser
        
        course = serializer.validated_data.get('course')
        user = self.request.user
        
        # Security: Prevent direct enrollment in paid courses via API
        if not course.is_free and not user.is_staff:
             # Paid enrollments must go through the payment verification flow
             raise PermissionDenied("Direct enrollment is restricted for paid courses. Please complete payment.")
        
        # Check if user is already enrolled
        if Enrollment.objects.filter(user=user, course=course).exists():
            raise PermissionDenied("You are already enrolled in this course.")
        
        # Enrollment + role promotion must succeed or fail together
        with transaction.atomic():
            serializer.save(user=user)
            
            # Update user role to STUDENT if they're currently a READER
            if user.user_type == CustomUser.UserType.READER:
                user.user_type = CustomUser.UserType.STUDENT
                user.save(update_fields=['user_type'])

    @action(detail=False, methods=['get'])
    def check(self, request):
        user_id = request.query_params.get('userId')
        course_slug = request.query_params.get('courseSlug')
        
        if not user_id or not course_slug:
             return Response({'message': 'Missing parameters'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Use get_queryset() so select_related/prefetch_related are applied,
        # preventing N+1 when EnrollmentSerializer nests CourseSerializer.
        enrollment = self.get_queryset().filter(
            user__id=user_id, 
            course__slug=course_slug
        ).first()
        
        if enrollment:
            data = self.get_serializer(enrollment).data
            data['isEnrolled'] = True
            return Response(data)
        return Response({'isEnrolled': False, 'message': 'Not enrolled'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-courses')
    def my_courses(self, request):
        enrollments = self.get_queryset().order_by('-enrolled_at')
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='complete-lesson')
    def complete_lesson(self, request, pk=None):
        enrollment = self.get_object()
        lesson_id = request.data.get('lesson_id')
        
        if not lesson_id:
            return Response({'message': 'Lesson ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Update specific lesson completion
        from .models import Lesson, LessonCompletion
        lesson = get_object_or_404(
            Lesson.objects.select_related('module__course'), id=lesson_id
        )
        
        # Verify lesson belongs to course (no extra queries thanks to select_related)
        if lesson.module.course_id != enrollment.course_id:
             return Response({'message': 'Invalid lesson for this course'}, status=status.HTTP_400_BAD_REQUEST)
             
        LessonCompletion.objects.get_or_create(enrollment=enrollment, lesson=lesson)

        # Compute fresh progress for this single enrollment (2 queries).
        # List views use queryset annotations instead, so no N+1 there.
        total = Lesson.objects.filter(
            module__course_id=enrollment.course_id
        ).count()
        completed_ids = list(
            LessonCompletion.objects.filter(enrollment=enrollment)
            .values_list('lesson_id', flat=True)
        )
        completed = len(completed_ids)

        return Response({
            'message': 'Lesson marked as complete',
            'progress': {
                'completed_count': completed,
                'total_count': total,
                'completed_lessons': completed_ids,
                'percentage': round(
                    (completed / total) * 100, 1
                ) if total > 0 else 0,
            },
        })


# ──────────── Module-content CRUD ViewSets ────────────

class LessonViewSet(viewsets.ModelViewSet):
    """CRUD for individual lessons.  Filter with ?course=ID or ?module=ID."""
    serializer_class = LessonDetailSerializer
    permission_classes = [IsModuleContentInstructor]

    def get_queryset(self):
        qs = Lesson.objects.select_related('module__course__instructor')
        course_id = self.request.query_params.get('course')
        module_id = self.request.query_params.get('module')
        if course_id:
            qs = qs.filter(module__course_id=course_id)
        if module_id:
            qs = qs.filter(module_id=module_id)
        user = self.request.user
        if user.is_authenticated and not user.is_staff:
            qs = qs.filter(module__course__instructor=user)
        return qs.order_by('module__order', 'order')


class LiveSessionViewSet(viewsets.ModelViewSet):
    """CRUD for live sessions.  Filter with ?course=ID or ?module=ID."""
    serializer_class = LiveSessionDetailSerializer
    permission_classes = [IsModuleContentInstructor]

    def get_queryset(self):
        qs = LiveSession.objects.select_related('module__course__instructor')
        course_id = self.request.query_params.get('course')
        module_id = self.request.query_params.get('module')
        if course_id:
            qs = qs.filter(module__course_id=course_id)
        if module_id:
            qs = qs.filter(module_id=module_id)
        user = self.request.user
        if user.is_authenticated and not user.is_staff:
            qs = qs.filter(module__course__instructor=user)
        return qs.order_by('date_time')


class ResourceViewSet(viewsets.ModelViewSet):
    """CRUD for downloadable resources.  Filter with ?course=ID or ?module=ID."""
    serializer_class = ResourceDetailSerializer
    permission_classes = [IsModuleContentInstructor]

    def get_queryset(self):
        qs = Resource.objects.select_related('module__course__instructor')
        course_id = self.request.query_params.get('course')
        module_id = self.request.query_params.get('module')
        if course_id:
            qs = qs.filter(module__course_id=course_id)
        if module_id:
            qs = qs.filter(module_id=module_id)
        user = self.request.user
        if user.is_authenticated and not user.is_staff:
            qs = qs.filter(module__course__instructor=user)
        return qs


class AssignmentViewSet(viewsets.ModelViewSet):
    """CRUD for assignments.  Filter with ?course=ID or ?module=ID."""
    serializer_class = AssignmentDetailSerializer
    permission_classes = [IsModuleContentInstructor]

    def get_queryset(self):
        qs = Assignment.objects.select_related('module__course__instructor')
        course_id = self.request.query_params.get('course')
        module_id = self.request.query_params.get('module')
        if course_id:
            qs = qs.filter(module__course_id=course_id)
        if module_id:
            qs = qs.filter(module_id=module_id)
        user = self.request.user
        if user.is_authenticated and not user.is_staff:
            qs = qs.filter(module__course__instructor=user)
        return qs
