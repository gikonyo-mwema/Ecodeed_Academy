"""
═══════════════════════════════════════════════════════════════════════════════
COURSE SERIALIZERS — REST API serialization for course data.

Provides serializers for course hierarchy: courses → modules → lessons → assignments.
Includes nested relationships for full course structure, instructor details, and
enrollment metadata. Backward-compatible with frontend camelCase field aliases.

═══════════════════════════════════════════════════════════════════════════════
SERIALIZER HIERARCHY
═══════════════════════════════════════════════════════════════════════════════

CourseSerializer (Main)
  ├─ InstructorSerializer (Nested instructor)
  └─ ModuleSerializer (Many modules)
      ├─ PublicLessonSerializer (Lessons)
      ├─ AssignmentSerializer (Assignments)
      ├─ LiveSessionSerializer (Live sessions)
      └─ ResourceModelSerializer (Resources)

FullModuleSerializer (Full module details with complete lessons)
  ├─ FullLessonSerializer (Complete lesson content)
  ├─ AssignmentSerializer (Assignments)
  ├─ LiveSessionSerializer (Live sessions)
  └─ ResourceModelSerializer (Resources)

═══════════════════════════════════════════════════════════════════════════════
FIELD ALIASES (Frontend Compatibility)
═══════════════════════════════════════════════════════════════════════════════

CourseSerializer provides both snake_case (DRF default) and camelCase aliases:
  - _id: Alias for id (primary key)
  - instructor: Full instructor object (nested)
  - instructor_name: Computed instructor display name
  - enrollment_count: Computed number of enrollments
  - curriculum: Computed curriculum structure

═══════════════════════════════════════════════════════════════════════════════
"""

from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Course, Enrollment, Module, Lesson, Assignment, LiveSession, Resource

User = get_user_model()


class InstructorSerializer(serializers.ModelSerializer):
    """
    InstructorSerializer — Lightweight instructor representation.
    
    Used for displaying instructor info on course cards and course details.
    
    Fields:
      id: Instructor user ID
      first_name: Instructor's first name
      last_name: Instructor's last name
      email: Instructor's email address
      profile_picture: URL to instructor profile image (Cloudinary)
      bio: Instructor biography/description
    
    Usage: Nested in CourseSerializer for instructor details
    
    @serializer InstructorSerializer
    """
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'profile_picture', 'bio']

class AssignmentSerializer(serializers.ModelSerializer):
    """
    AssignmentSerializer — Assignment metadata for courses.
    
    Lightweight serializer for lesson assignments (quizzes, projects, etc.).
    
    Fields:
      id: Assignment ID
      title: Assignment title
      description: Assignment description/instructions
      due_date: Deadline for assignment
      resource_url: URL to assignment resources/attachments
    
    @serializer AssignmentSerializer
    """
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'due_date', 'resource_url']

class LiveSessionSerializer(serializers.ModelSerializer):
    """
    LiveSessionSerializer — Live class/session metadata.
    
    Serializer for scheduled live sessions (webinars, Q&A, live classes).
    
    Fields:
      id: Session ID
      title: Session title
      description: Session description
      date_time: Scheduled start time
      zoom_link: Zoom or video conference URL
      recording_url: Link to recorded session
    
    @serializer LiveSessionSerializer
    """
    class Meta:
        model = LiveSession
        fields = ['id', 'title', 'description', 'date_time', 'zoom_link', 'recording_url']

class ResourceModelSerializer(serializers.ModelSerializer):
    """
    ResourceModelSerializer — Downloadable course resources.
    
    Serializer for course materials: PDFs, documents, code snippets, etc.
    
    Fields:
      id: Resource ID
      title: Resource title
      description: Resource description
      file_url: URL to download resource
      resource_type: Type of resource (pdf, code, document, etc.)
    
    @serializer ResourceModelSerializer
    """
    class Meta:
        model = Resource
        fields = ['id', 'title', 'description', 'file_url', 'resource_type']

class PublicLessonSerializer(serializers.ModelSerializer):
    """
    PublicLessonSerializer — Lightweight lesson info (preview).
    
    Used in module listings to show lesson metadata without full content.
    
    Fields:
      id: Lesson ID
      title: Lesson title
      duration: Video duration in minutes
      is_free_preview: Whether lesson available for free preview
      order: Lesson position within module
    
    @serializer PublicLessonSerializer
    """
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'duration', 'is_free_preview', 'order']

class FullLessonSerializer(serializers.ModelSerializer):
    """
    FullLessonSerializer — Complete lesson content.
    
    Full lesson details including video content and complete metadata.
    
    Fields:
      id: Lesson ID
      title: Lesson title
      content: Lesson HTML content/description
      video_url: Video URL (YouTube, Vimeo, or self-hosted)
      duration: Video duration in minutes
      is_free_preview: Whether accessible for non-enrolled users
      order: Lesson position within module
    
    @serializer FullLessonSerializer
    """
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'video_url', 'duration', 'is_free_preview', 'order']

class ModuleSerializer(serializers.ModelSerializer):
    """
    ModuleSerializer — Course module with nested lessons.
    
    Module representation with nested serialization of all contained elements
    (lessons, assignments, live sessions, resources).
    
    Fields:
      id: Module ID
      title: Module title
      description: Module description
      order: Position within course
      lessons: List of PublicLessonSerializer (preview mode)
      assignments: List of assignments in module
      live_sessions: List of scheduled live sessions
      resources: List of downloadable resources
    
    Nested Serializers:
      - lessons: PublicLessonSerializer (lightweight)
      - assignments: AssignmentSerializer
      - live_sessions: LiveSessionSerializer
      - resources: ResourceModelSerializer
    
    @serializer ModuleSerializer
    """
    lessons = PublicLessonSerializer(many=True, read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)
    live_sessions = LiveSessionSerializer(many=True, read_only=True)
    resources = ResourceModelSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'order', 'lessons', 'assignments', 'live_sessions', 'resources']

class FullModuleSerializer(serializers.ModelSerializer):
    """
    FullModuleSerializer — Module with complete lesson content.
    
    Full module representation with detailed lesson content for enrolled users.
    Uses FullLessonSerializer for complete lesson information.
    
    Fields:
      id: Module ID
      title: Module title
      description: Module description
      order: Position within course
      lessons: List of FullLessonSerializer (with full content)
      assignments: List of assignments in module
      live_sessions: List of scheduled live sessions
      resources: List of downloadable resources
    
    Nested Serializers:
      - lessons: FullLessonSerializer (includes content + video_url)
      - assignments: AssignmentSerializer
      - live_sessions: LiveSessionSerializer
      - resources: ResourceModelSerializer
    
    Usage: Used when user is enrolled or course is being updated by instructor
    
    @serializer FullModuleSerializer
    """
    lessons = FullLessonSerializer(many=True, read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)
    live_sessions = LiveSessionSerializer(many=True, read_only=True)
    resources = ResourceModelSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'order', 'lessons', 'assignments', 'live_sessions', 'resources']

class CourseSerializer(serializers.ModelSerializer):
    """
    CourseSerializer — Complete course REST serialization.
    
    Full course representation with nested module structure, instructor info,
    and enrollment metadata. Provides backward-compatible camelCase aliases.
    
    Fields (Core):
      id, _id: Course ID (pk and alias)
      title: Course title
      slug: URL slug (unique)
      short_description: Brief course summary
      full_description: Complete course description
      image: Featured image URL
      icon_name: Name of the icon to display for the course
      
    Fields (Pricing & Status):
      price: Course price (decimal)
      is_free: Boolean flag for free courses
      category: Course category/subject
      level: Difficulty level (beginner, intermediate, advanced)
      is_live: Whether course is currently available
      is_popular: Featured course flag
      
    Fields (Content):
      modules: List of ModuleSerializer (complete course structure)
      curriculum: Computed curriculum tree structure
      resources: Associated resources
      
    Fields (Educational):
      format: Delivery format (online, hybrid, self-paced)
      features: Course features (array)
      faqs: FAQ entries (array)
      target_audience: Who should take this course
      has_certificate: Whether completion certificate awarded
      pacing_type: Pacing strategy (instructor-paced, self-paced)
      
    Fields (Metadata):
      instructor: InstructorSerializer (full instructor object)
      instructor_name: Computed instructor display name
      enrollment_count: Count of enrolled students
      created_at, updated_at: Timestamps
    
    Computed Fields:
      - instructor_name: Formatted display name or email
      - enrollment_count: Total enrollments (uses annotation if available)
      - curriculum: Nested curriculum tree (modules → lessons)
    
    @serializer CourseSerializer
    @version 1.0.0
    """
    modules = ModuleSerializer(many=True, read_only=True)
    _id = serializers.IntegerField(source='id', read_only=True)
    instructor = InstructorSerializer(read_only=True)
    instructor_name = serializers.SerializerMethodField()
    enrollment_count = serializers.SerializerMethodField()
    
    # Accept curriculum as input (write_only) and output (via get_curriculum)
    curriculum = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', '_id', 'title', 'slug', 'short_description', 'full_description',
            'image', 'icon_name', 'price', 'category', 'is_free', 'modules', 'curriculum',
            'created_at', 'updated_at', 'level', 'format', 'features', 'faqs',
            'target_audience', 'resources', 'external_url', 'is_popular', 'is_live',
            'has_certificate', 'pacing_type', 'instructor', 'instructor_name',
            'enrollment_count',
        ]
        read_only_fields = ['instructor']

    def get_instructor_name(self, obj):
        if obj.instructor:
            name = f"{obj.instructor.first_name} {obj.instructor.last_name}".strip()
            return name if name else obj.instructor.email
        return None

    def get_enrollment_count(self, obj):
        # Use annotation if available (set in viewset queryset), else fallback to DB
        count = getattr(obj, '_enrollment_count', None)
        if count is not None:
            return count
        return obj.enrollments.count()

    def get_curriculum(self, obj):
        return [
            {
                "id": module.id,
                "title": module.title,
                "items": [
                    {
                        "id": lesson.id,
                        "title": lesson.title,
                        "video_url": lesson.video_url or '',
                        "content": lesson.content or '',
                        "duration": lesson.duration or 0,
                        "is_free_preview": lesson.is_free_preview,
                        "order": lesson.order,
                    }
                    for lesson in module.lessons.all()
                ],
                "live_sessions": [
                    {
                        "id": ls.id,
                        "title": ls.title,
                        "description": ls.description or '',
                        "date_time": ls.date_time.isoformat() if ls.date_time else '',
                        "zoom_link": ls.zoom_link or '',
                        "recording_url": ls.recording_url or '',
                    }
                    for ls in module.live_sessions.all()
                ],
                "resources": [
                    {
                        "id": r.id,
                        "title": r.title,
                        "description": r.description or '',
                        "file_url": r.file_url or '',
                        "resource_type": r.resource_type or 'link',
                    }
                    for r in module.resources.all()
                ],
            }
            for module in obj.modules.all()
        ]

class CourseContentSerializer(CourseSerializer):
    modules = FullModuleSerializer(many=True, read_only=True)
    
    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields

    # get_curriculum() is inherited from CourseSerializer — no need to duplicate.

    @transaction.atomic
    def create(self, validated_data):
        # Extract curriculum payload
        curriculum_data = self.initial_data.get('curriculum', [])
        
        course = Course.objects.create(**validated_data)
        
        # Create nested modules and lessons
        for module_idx, module_data in enumerate(curriculum_data):
            if not module_data.get('title'):
                continue
                
            module = Module.objects.create(
                course=course,
                title=module_data['title'],
                order=module_idx
            )
            
            # Helper to normalize items (strings or objects)
            items = module_data.get('items', [])
            for lesson_idx, lesson_item in enumerate(items):
                # Handle both string "Lesson 1" and object {"id": 1, "title": "Lesson 1"}
                lesson_title = lesson_item if isinstance(lesson_item, str) else lesson_item.get('title')
                
                if not lesson_title:
                    continue

                lesson_kwargs = {
                    'module': module,
                    'title': lesson_title,
                    'order': lesson_idx,
                }
                if isinstance(lesson_item, dict):
                    lesson_kwargs['video_url'] = lesson_item.get('video_url', '') or ''
                    lesson_kwargs['content'] = lesson_item.get('content', '') or ''
                    lesson_kwargs['duration'] = lesson_item.get('duration', 0) or 0
                    lesson_kwargs['is_free_preview'] = bool(lesson_item.get('is_free_preview', False))

                Lesson.objects.create(**lesson_kwargs)

            # Create live sessions for this module
            for ls_data in module_data.get('live_sessions', []):
                if not ls_data.get('title'):
                    continue
                LiveSession.objects.create(
                    module=module,
                    title=ls_data['title'],
                    description=ls_data.get('description', ''),
                    date_time=ls_data.get('date_time') or None,
                    zoom_link=ls_data.get('zoom_link', ''),
                    recording_url=ls_data.get('recording_url', ''),
                )

            # Create resources for this module
            for r_data in module_data.get('resources', []):
                if not r_data.get('title'):
                    continue
                Resource.objects.create(
                    module=module,
                    title=r_data['title'],
                    description=r_data.get('description', ''),
                    file_url=r_data.get('file_url', ''),
                    resource_type=r_data.get('resource_type', 'link'),
                )

        # Refresh from DB with select_related so the response serializer
        # has full instructor data (first_name, last_name, etc.)
        course.refresh_from_db()
        return course

    @transaction.atomic
    def update(self, instance, validated_data):
        # Update standard fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle curriculum updates with ID preservation
        curriculum_data = self.initial_data.get('curriculum', None)
        
        if curriculum_data is not None:
            # 1. Get existing module IDs for this course
            existing_module_ids = [m.id for m in instance.modules.all()]
            incoming_module_ids = [m.get('id') for m in curriculum_data if m.get('id')]
            
            # 2. Delete modules that are not in the incoming data
            modules_to_delete = set(existing_module_ids) - set(incoming_module_ids)
            Module.objects.filter(id__in=modules_to_delete).delete()

            for module_idx, module_data in enumerate(curriculum_data):
                module_id = module_data.get('id')
                module_title = module_data.get('title')
                
                if not module_title:
                    continue

                # UPDATE or CREATE Module
                if module_id and module_id in existing_module_ids:
                    module = Module.objects.get(id=module_id)
                    module.title = module_title
                    module.order = module_idx
                    module.save()
                else:
                    module = Module.objects.create(
                        course=instance,
                        title=module_title,
                        order=module_idx
                    )

                # Handle Lessons for this Module
                incoming_items = module_data.get('items', [])
                
                # Normalize items to ensure they are objects with titles
                normalized_items = []
                for item in incoming_items:
                    if isinstance(item, str):
                        normalized_items.append({'title': item}) # New item without ID
                    else:
                        normalized_items.append(item) # Existing item or new item object
                
                # Get existing lesson IDs
                existing_lesson_ids = [l.id for l in module.lessons.all()]
                incoming_lesson_ids = [l.get('id') for l in normalized_items if l.get('id')]
                
                # Delete removed lessons
                lessons_to_delete = set(existing_lesson_ids) - set(incoming_lesson_ids)
                Lesson.objects.filter(id__in=lessons_to_delete).delete()
                
                for lesson_idx, lesson_data in enumerate(normalized_items):
                    lesson_id = lesson_data.get('id')
                    lesson_title = lesson_data.get('title')
                    
                    if not lesson_title:
                        continue

                    lesson_kwargs = {
                        'title': lesson_title,
                        'order': lesson_idx,
                        'video_url': lesson_data.get('video_url', '') or '',
                        'content': lesson_data.get('content', '') or '',
                        'duration': lesson_data.get('duration', 0) or 0,
                        'is_free_preview': bool(lesson_data.get('is_free_preview', False)),
                    }

                    if lesson_id and lesson_id in existing_lesson_ids:
                        lesson = Lesson.objects.get(id=lesson_id)
                        for attr, val in lesson_kwargs.items():
                            setattr(lesson, attr, val)
                        lesson.save()
                    else:
                        Lesson.objects.create(module=module, **lesson_kwargs)

                # ── Upsert live sessions ──
                incoming_ls = module_data.get('live_sessions', [])
                existing_ls_ids = list(module.live_sessions.values_list('id', flat=True))
                incoming_ls_ids = [ls.get('id') for ls in incoming_ls if ls.get('id')]
                LiveSession.objects.filter(id__in=set(existing_ls_ids) - set(incoming_ls_ids)).delete()
                for ls_data in incoming_ls:
                    ls_id = ls_data.get('id')
                    ls_title = ls_data.get('title')
                    if not ls_title:
                        continue
                    ls_kwargs = {
                        'title': ls_title,
                        'description': ls_data.get('description', ''),
                        'date_time': ls_data.get('date_time') or None,
                        'zoom_link': ls_data.get('zoom_link', ''),
                        'recording_url': ls_data.get('recording_url', ''),
                    }
                    if ls_id and ls_id in existing_ls_ids:
                        ls_obj = LiveSession.objects.get(id=ls_id)
                        for attr, val in ls_kwargs.items():
                            setattr(ls_obj, attr, val)
                        ls_obj.save()
                    else:
                        LiveSession.objects.create(module=module, **ls_kwargs)

                # ── Upsert resources ──
                incoming_res = module_data.get('resources', [])
                existing_res_ids = list(module.resources.values_list('id', flat=True))
                incoming_res_ids = [r.get('id') for r in incoming_res if r.get('id')]
                Resource.objects.filter(id__in=set(existing_res_ids) - set(incoming_res_ids)).delete()
                for r_data in incoming_res:
                    r_id = r_data.get('id')
                    r_title = r_data.get('title')
                    if not r_title:
                        continue
                    r_kwargs = {
                        'title': r_title,
                        'description': r_data.get('description', ''),
                        'file_url': r_data.get('file_url', ''),
                        'resource_type': r_data.get('resource_type', 'link'),
                    }
                    if r_id and r_id in existing_res_ids:
                        r_obj = Resource.objects.get(id=r_id)
                        for attr, val in r_kwargs.items():
                            setattr(r_obj, attr, val)
                        r_obj.save()
                    else:
                        Resource.objects.create(module=module, **r_kwargs)

        # Refresh from DB so the response serializer has up-to-date data
        instance.refresh_from_db()
        return instance

class EnrollmentSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    student_email = serializers.CharField(source='user.email', read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'course', 'course_details', 'student_email', 'enrolled_at', 'status', 'progress']
        read_only_fields = ['user', 'enrolled_at']

    def get_progress(self, obj):
        """Build progress dict from queryset annotations + prefetched
        completed_lessons.  Falls back to the stored JSONField when the
        instance was not loaded through the annotated queryset."""
        total = getattr(obj, 'total_lessons', None)
        completed = getattr(obj, 'completed_count', None)

        if total is not None and completed is not None:
            completed_ids = [
                lc.lesson_id for lc in obj.completed_lessons.all()
            ]
            percentage = (completed / total) * 100 if total > 0 else 0
            return {
                'completed_count': completed,
                'total_count': total,
                'completed_lessons': completed_ids,
                'percentage': round(percentage, 1),
            }

        # Fallback: instance loaded outside the annotated queryset
        return obj.progress or {}


# ──────────── Detail serializers for dashboard CRUD ────────────

class LessonDetailSerializer(serializers.ModelSerializer):
    """Lesson serializer with module/course context for dashboard CRUD."""
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_id = serializers.IntegerField(source='module.course_id', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id', 'module', 'module_title', 'course_id', 'course_title',
            'title', 'content', 'video_url', 'duration', 'is_free_preview', 'order',
        ]


class LiveSessionDetailSerializer(serializers.ModelSerializer):
    """Live session serializer with module/course context for dashboard CRUD."""
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_id = serializers.IntegerField(source='module.course_id', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)

    class Meta:
        model = LiveSession
        fields = [
            'id', 'module', 'module_title', 'course_id', 'course_title',
            'title', 'description', 'date_time', 'zoom_link', 'recording_url',
        ]


class ResourceDetailSerializer(serializers.ModelSerializer):
    """Resource serializer with module/course context for dashboard CRUD."""
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_id = serializers.IntegerField(source='module.course_id', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)

    class Meta:
        model = Resource
        fields = [
            'id', 'module', 'module_title', 'course_id', 'course_title',
            'title', 'description', 'file_url', 'resource_type',
        ]


class AssignmentDetailSerializer(serializers.ModelSerializer):
    """Assignment serializer with module/course context for dashboard CRUD."""
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_id = serializers.IntegerField(source='module.course_id', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)

    class Meta:
        model = Assignment
        fields = [
            'id', 'module', 'module_title', 'course_id', 'course_title',
            'title', 'description', 'due_date', 'resource_url',
        ]
