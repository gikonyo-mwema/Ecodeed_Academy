from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer, CourseContentSerializer
from .permissions import IsInstructorOrReadOnly

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
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
        if request.user.is_staff:
             # Admins see all
             courses = self.queryset.all()
        else:
             # Mentors see only their own
             courses = self.queryset.filter(instructor=request.user)
        
        page = self.paginate_queryset(courses)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-category')
    def by_category(self, request):
        courses = self.queryset.all()
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

        modules = course.modules.all().order_by('order')

        # Get completed lesson IDs
        completed_lesson_ids = set()
        if enrollment:
            completed_lesson_ids = set(
                LessonCompletion.objects.filter(enrollment=enrollment)
                .values_list('lesson_id', flat=True)
            )

        weeks_data = []
        prev_week_complete = True  # Makes week 1 always unlocked

        for idx, module in enumerate(modules):
            lessons = module.lessons.all().order_by('order')
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
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Enrollment.objects.all()
        return Enrollment.objects.filter(user=self.request.user)

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
        
        # Save the enrollment
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
        
        enrollment = Enrollment.objects.filter(
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
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        # Verify lesson belongs to course
        if lesson.module.course != enrollment.course:
             return Response({'message': 'Invalid lesson for this course'}, status=status.HTTP_400_BAD_REQUEST)
             
        LessonCompletion.objects.get_or_create(enrollment=enrollment, lesson=lesson)
        
        # Update overall progress
        total_lessons = Lesson.objects.filter(module__course=enrollment.course).count()
        completed = LessonCompletion.objects.filter(enrollment=enrollment).count()
        completed_lesson_ids = list(LessonCompletion.objects.filter(enrollment=enrollment).values_list('lesson_id', flat=True))
        
        progress_data = enrollment.progress or {}
        progress_data['completed_count'] = completed
        progress_data['completed_lessons'] = completed_lesson_ids
        progress_data['total_count'] = total_lessons
        progress_data['percentage'] = (completed / total_lessons) * 100 if total_lessons > 0 else 0
        
        enrollment.progress = progress_data
        enrollment.save()
        
        return Response({
            'message': 'Lesson marked as complete',
            'progress': enrollment.progress
        })
