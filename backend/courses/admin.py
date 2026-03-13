"""
═══════════════════════════════════════════════════════════════════════════════
COURSE ADMIN — Django admin configuration for courses.

Provides admin interface for managing courses, modules, lessons, enrollments,
and lesson completion tracking. Includes inline editing and nested relationships.

═══════════════════════════════════════════════════════════════════════════════
ADMIN CLASSES
═══════════════════════════════════════════════════════════════════════════════

CourseAdmin:
  - List Display: Title, price, is_free flag, slug
  - Filters: By is_free status
  - Search: By title
  - Inline: Modules (nested editing)
  - Auto-slug: Generated from title

ModuleAdmin:
  - List Display: Title, course, order (sequence)
  - Filters: By course
  - Search: By title or course title
  - Inline: Lessons (stacked)

LessonAdmin:
  - List Display: Title, module, video URL, free preview status
  - Filters: By course (through module), free preview flag
  - Search: By title or module title

ModuleInline:
  - Stacked inline editor for modules
  - Change link to edit module details
  - Extra: 0 (no extra blank modules)

LessonInline:
  - Stacked inline editor for lessons
  - Extra: 1 (allow adding new lessons)

Enrollment:
  - Basic registration (admin only)

LessonCompletion:
  - Basic registration (admin only)

═══════════════════════════════════════════════════════════════════════════════
"""

from django.contrib import admin
from .models import Course, Module, Lesson, Enrollment, LessonCompletion

class LessonInline(admin.StackedInline):
    """
    LessonInline — Inline editor for lessons within modules.
    
    Allows admin to add/edit/delete lessons directly in the module edit page.
    
    Features:
      - Stacked layout for easy content editing
      - Extra: 1 (blank lesson form for adding new lessons)
    """
    model = Lesson
    extra = 1

class ModuleAdmin(admin.ModelAdmin):
    """
    ModuleAdmin — Admin interface for course modules.
    
    Manages course module structure with inline lesson editing.
    
    List Display:
      - title: Module name
      - course: Parent course
      - order: Position within course
    
    Inlines:
      - LessonInline: Edit lessons directly from module page
    """
    inlines = [LessonInline]
    list_display = ['title', 'course', 'order']
    list_filter = ['course']
    search_fields = ['title', 'course__title']

class ModuleInline(admin.StackedInline):
    """
    ModuleInline — Inline editor for modules within courses.
    
    Allows admin to add/edit/delete modules directly in the course edit page.
    
    Features:
      - Stacked layout
      - Change link to edit module details separately
      - Extra: 0 (no blank module forms)
    """
    model = Module
    extra = 0
    show_change_link = True

class CourseAdmin(admin.ModelAdmin):
    """
    CourseAdmin — Comprehensive admin interface for courses.
    
    Manages course information with inline module editing for
    creating complete course structures.
    
    List Display:
      - title: Course name
      - price: Course price
      - is_free: Free course flag
      - slug: URL slug
    
    Features:
      - Inline Modules: Edit course structure (modules → lessons)
      - Auto-slug: Generated from title
      - Filters: By free/paid status
      - Search: By course title
    
    Inlines:
      - ModuleInline: Edit modules directly from course page
    """
    list_display = ['title', 'price', 'is_free', 'slug']
    list_filter = ['is_free']
    search_fields = ['title']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ModuleInline]

class LessonAdmin(admin.ModelAdmin):
    """
    LessonAdmin — Admin interface for lesson content.
    
    Manages lesson details, videos, and preview permissions.
    
    List Display:
      - title: Lesson name
      - module: Parent module
      - video_url: Video link
      - is_free_preview: Free preview flag
    
    Features:
      - Filters: By course (through module), free preview status
      - Search: By title or module name
    """
    list_display = ['title', 'module', 'video_url', 'is_free_preview']
    list_filter = ['module__course', 'is_free_preview']
    search_fields = ['title', 'module__title']

admin.site.register(Course, CourseAdmin)
admin.site.register(Module, ModuleAdmin)
admin.site.register(Lesson, LessonAdmin)
admin.site.register(Enrollment)
admin.site.register(LessonCompletion)
