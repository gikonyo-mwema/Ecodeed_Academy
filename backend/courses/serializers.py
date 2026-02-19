from rest_framework import serializers
from .models import Course, Enrollment, Module, Lesson, LessonCompletion, Assignment, LiveSession, Resource

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'due_date', 'resource_url']

class LiveSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveSession
        fields = ['id', 'title', 'description', 'date_time', 'zoom_link', 'recording_url']

class ResourceModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'title', 'file_url']

class PublicLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'duration', 'is_free_preview', 'order']

class FullLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'video_url', 'duration', 'is_free_preview', 'order']

class ModuleSerializer(serializers.ModelSerializer):
    lessons = PublicLessonSerializer(many=True, read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)
    live_sessions = LiveSessionSerializer(many=True, read_only=True)
    resources = ResourceModelSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'order', 'lessons', 'assignments', 'live_sessions', 'resources']

class FullModuleSerializer(serializers.ModelSerializer):
    lessons = FullLessonSerializer(many=True, read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)
    live_sessions = LiveSessionSerializer(many=True, read_only=True)
    resources = ResourceModelSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'order', 'lessons', 'assignments', 'live_sessions', 'resources']

class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    _id = serializers.IntegerField(source='id', read_only=True)
    
    # Accept curriculum as input (write_only) and output (via get_curriculum)
    curriculum = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', '_id', 'title', 'slug', 'short_description', 'full_description',
            'image', 'price', 'category', 'is_free', 'modules', 'curriculum',
            'created_at', 'updated_at', 'level', 'format', 'features', 'faqs',
            'target_audience', 'resources', 'external_url', 'is_popular', 'is_live',
            'instructor'
        ]
        read_only_fields = ['instructor']

    def get_curriculum(self, obj):
        return [
            {
                "id": module.id,
                "title": module.title,
                "items": [
                    {"id": lesson.id, "title": lesson.title} 
                    for lesson in module.lessons.all()
                ]
            }
            for module in obj.modules.all()
        ]

class CourseContentSerializer(CourseSerializer):
    modules = FullModuleSerializer(many=True, read_only=True)
    
    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields
        
    def get_curriculum(self, obj):
        return [
            {
                "id": module.id,
                "title": module.title,
                "items": [
                    {"id": lesson.id, "title": lesson.title} 
                    for lesson in module.lessons.all()
                ]
            }
            for module in obj.modules.all()
        ]

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
                    
                Lesson.objects.create(
                    module=module,
                    title=lesson_title,
                    order=lesson_idx
                )
        
        return course

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
                        
                    if lesson_id and lesson_id in existing_lesson_ids:
                        lesson = Lesson.objects.get(id=lesson_id)
                        lesson.title = lesson_title
                        lesson.order = lesson_idx
                        lesson.save()
                    else:
                        Lesson.objects.create(
                            module=module,
                            title=lesson_title,
                            order=lesson_idx
                        )
        
        return instance

class EnrollmentSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    student_username = serializers.CharField(source='user.username', read_only=True)
    student_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'course', 'course_details', 'student_username', 'student_email', 'enrolled_at', 'status', 'progress']
        read_only_fields = ['user', 'enrolled_at']
