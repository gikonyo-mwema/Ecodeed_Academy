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
    def content(self, request, slug=None):
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
        course = serializer.validated_data.get('course')
        
        # Security: Prevent direct enrollment in paid courses via API
        if not course.is_free and not self.request.user.is_staff:
             # Paid enrollments must go through the payment verification flow
             raise PermissionDenied("Direct enrollment is restricted for paid courses. Please complete payment.")
             
        serializer.save(user=self.request.user)

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
        # Explicit filter for the logged-in user, regardless of admin status
        enrollments = Enrollment.objects.filter(user=request.user).order_by('-enrolled_at')
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-courses')
    def my_courses(self, request):
        enrollments = self.get_queryset()
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)
