from rest_framework import permissions

class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow instructors to edit their own courses.
    Admins can edit anything.
    """

    def has_permission(self, request, view):
        # Allow read-only for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Allow write if authenticated and (Admin OR Mentor)
        # Assuming user model has property is_mentor
        return request.user.is_authenticated and (request.user.is_staff or getattr(request.user, 'is_mentor', False))

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the course or admins.
        return request.user.is_staff or obj.instructor == request.user


class IsModuleContentInstructor(permissions.BasePermission):
    """
    Permission for objects nested under a Module (Lesson, LiveSession, Resource, Assignment).
    Write access requires admin or the course instructor.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and (
            request.user.is_staff or getattr(request.user, 'is_mentor', False)
        )

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff or obj.module.course.instructor == request.user