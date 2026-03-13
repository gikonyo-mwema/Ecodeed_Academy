"""
═══════════════════════════════════════════════════════════════════════════════
POST PERMISSIONS — Access control for blog posts.

Provides custom permission class for post management.
Controls who can create, edit, and delete blog posts.

═══════════════════════════════════════════════════════════════════════════════
"""

from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    IsOwnerOrAdmin — Post editing permission.
    
    Allows read-only access to everyone.
    Allows write access only to post author and admins.
    
    Permissions:
      READ (GET, HEAD, OPTIONS):
        ✓ Everyone (for published posts)
      WRITE (POST, PUT, PATCH, DELETE):
        ✓ Post author
        ✓ Staff users (admins)
        ✓ Superusers
        ✗ Other authenticated users
    
    Object-Level Permissions:
      - Edit (PUT, PATCH): Only post author or admin
      - Delete: Only post author or admin
      - View (GET): Everyone (if published)
    
    Methods:
      has_object_permission(): Check if user owns post or is admin
    
    Usage:
      Applied to PostViewSet for update/delete operations.
      Prevents users from editing other users' posts.
    
    @permission IsOwnerOrAdmin
    """

    def has_object_permission(self, request, view, obj):
        """
        Check if user owns the post or is admin.
        
        Args:
          request: HTTP request
          view: ViewSet being accessed
          obj: Post object
          
        Returns:
          bool: True if read-only or user owns post/is admin
        """
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the post or admins.
        return obj.user == request.user or request.user.is_staff or request.user.is_superuser
