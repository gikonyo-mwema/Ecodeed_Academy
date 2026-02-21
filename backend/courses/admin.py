from django.contrib import admin
from .models import Course, Module, Lesson, Enrollment, LessonCompletion

class LessonInline(admin.StackedInline):
    model = Lesson
    extra = 1

class ModuleAdmin(admin.ModelAdmin):
    inlines = [LessonInline]
    list_display = ['title', 'course', 'order']
    list_filter = ['course']
    search_fields = ['title', 'course__title']

class ModuleInline(admin.StackedInline):
    model = Module
    extra = 0
    show_change_link = True

class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'price', 'is_free', 'slug']
    list_filter = ['is_free']
    search_fields = ['title']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ModuleInline]

class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'module', 'video_url', 'is_free_preview']
    list_filter = ['module__course', 'is_free_preview']
    search_fields = ['title', 'module__title']

admin.site.register(Course, CourseAdmin)
admin.site.register(Module, ModuleAdmin)
admin.site.register(Lesson, LessonAdmin)
admin.site.register(Enrollment)
admin.site.register(LessonCompletion)
