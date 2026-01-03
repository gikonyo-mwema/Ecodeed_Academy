"""
Custom Permission Classes for Ecodeed Academy.

This module provides custom permission classes for controlling access
to API endpoints based on user roles and authentication status.

Classes:
    - IsAdminOrReadOnly: Allow read access to all, write access to admins only.
    - IsOwnerOrAdmin: Allow access to object owner or admin users.
    - IsMentorOrAdmin: Allow access to mentors and admin users.
    - CanComment: Control commenting permissions based on user type.
"""

from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read-only access to any request,
    but only allow write access to admin users.

    Methods:
        has_permission: Check if the request should be permitted.
    """

    def has_permission(self, request, view):
        """
        Check if the request has permission.

        Args:
            request: The incoming HTTP request.
            view: The view being accessed.

        Returns:
            bool: True if request is read-only or user is admin.
        """
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_admin


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow access only to object owners or admin users.

    Used to protect user-specific resources like profiles.

    Methods:
        has_object_permission: Check if user owns the object or is admin.
    """

    def has_object_permission(self, request, view, obj):
        """
        Check if the user has permission for the specific object.

        Args:
            request: The incoming HTTP request.
            view: The view being accessed.
            obj: The object being accessed.

        Returns:
            bool: True if user is admin or owns the object.
        """
        if request.user and request.user.is_admin:
            return True
        return obj == request.user


class IsMentorOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow access only to mentors or admin users.

    Used to protect mentor-specific functionality like course creation.

    Methods:
        has_permission: Check if user is a mentor or admin.
    """

    def has_permission(self, request, view):
        """
        Check if the request has permission.

        Args:
            request: The incoming HTTP request.
            view: The view being accessed.

        Returns:
            bool: True if user is mentor or admin.
        """
        return request.user and (request.user.is_mentor or request.user.is_admin)


class CanComment(permissions.BasePermission):
    """
    Custom permission to control commenting access.

    Allows all users to read comments, but only non-reader users
    can create new comments.

    Methods:
        has_permission: Check if user can comment based on user type.
    """

    def has_permission(self, request, view):
        """
        Check if the request has permission to comment.

        Args:
            request: The incoming HTTP request.
            view: The view being accessed.

        Returns:
            bool: True if reading or user is not a reader type.
        """
        if request.method == "POST":
            return request.user and not request.user.is_reader
        return True
