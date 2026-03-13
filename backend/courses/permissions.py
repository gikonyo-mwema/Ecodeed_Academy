"""
═══════════════════════════════════════════════════════════════════════════════
COURSE PERMISSIONS — Access control for course resources.

Provides custom permission classes for course management endpoints.
Controls who can create, edit, and delete courses and course content.

═══════════════════════════════════════════════════════════════════════════════
PERMISSION CLASSES
═══════════════════════════════════════════════════════════════════════════════

IsInstructorOrReadOnly:
  - Read: Everyone (GET, HEAD, OPTIONS)
  - Write: Instructors/Mentors and Admins only
  - Object: Only course instructor + admins can edit
  
IsModuleContentInstructor:
  - Read: Everyone (GET, HEAD, OPTIONS)
  - Write: Course instructor + admins
  - Applies to: Lessons, Live Sessions, Resources, Assignments

═══════════════════════════════════════════════════════════════════════════════
"""

from rest_framework import permissions

class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    IsInstructorOrReadOnly — Course creation/editing permission.
    
    Allows read-only access to everyone.
    Allows write access (create/update/delete) to instructors and admins only.
    On object level, restricts editing to course instructor + admins.
    
    Permissions:
      READ (GET, HEAD, OPTIONS):
        ✓ Everyone (authenticated and anonymous)
      WRITE (POST, PUT, PATCH, DELETE):
        ✓ Authenticated instructors/mentors
        ✓ Staff users (admins)
        ✗ Regular students/readers
    
    Object-Level Permissions:
      - Edit (PUT, PATCH, DELETE): Only course instructor or admin
      - Delete: Only course instructor or admin
      - View (GET): Everyone
    
    Methods:
      has_permission(): Check if user can create courses
      has_object_permission(): Check if user can edit course
    
    @permission IsInstructorOrReadOnly
    """

    def has_permission(self, request, view):
        """
        Check if user can create/update courses globally.
        
        Args:
          request: HTTP request
          view: ViewSet being accessed
          
        Returns:
          bool: True if read-only or authenticated instructor
        """
        # Allow read-only for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Allow write if authenticated and (Admin OR Mentor)
        # Assuming user model has property is_mentor
        return request.user.is_authenticated and (request.user.is_staff or getattr(request.user, 'is_mentor', False))

    def has_object_permission(self, request, view, obj):
        """
        Check if user can edit specific course.
        
        Args:
          request: HTTP request
          view: ViewSet being accessed
          obj: Course object
          
        Returns:
          bool: True if read-only or user is course instructor/admin
        """
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the course or admins.
        return request.user.is_staff or obj.instructor == request.user


class IsModuleContentInstructor(permissions.BasePermission):
    """
    IsModuleContentInstructor — Access control for module content.
    
    Permission for nested objects under modules (lessons, live sessions,
    resources, assignments). Write access restricted to course instructor.
    
    Permissions:
      READ (GET, HEAD, OPTIONS):
        ✓ Everyone
      WRITE (POST, PUT, PATCH, DELETE):
        ✓ Authenticated instructors/mentors (at module level)
        ✓ Course instructor (at object level)
        ✓ Admins
        ✗ Other instructors (only course instructor can edit)
    
    Object-Level Permissions:
      - Edit: Only course instructor for this lesson's course
      - Delete: Only course instructor for this lesson's course
      - View: Everyone
    
    Methods:
      has_permission(): Check if authenticated instructor can create content
      has_object_permission(): Check if user is course instructor
    
    @permission IsModuleContentInstructor
    """

    def has_permission(self, request, view):
        """
        Check if user can create module content globally.
        
        Args:
          request: HTTP request
          view: ViewSet being accessed
          
        Returns:
          bool: True if read-only or authenticated instructor
        """
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and (
            request.user.is_staff or getattr(request.user, 'is_mentor', False)
        )

    def has_object_permission(self, request, view, obj):
        """
        Check if user is instructor for the course containing this object.
        
        Args:
          request: HTTP request
          view: ViewSet being accessed
          obj: Lesson/Resource/Assignment/LiveSession object
          
        Returns:
          bool: True if read-only or user is course instructor
        """
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff or obj.module.course.instructor == request.user