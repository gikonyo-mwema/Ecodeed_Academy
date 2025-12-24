"""
Unit Tests for the Users Application.

This module contains test cases for user-related functionality including:
    - User model creation and validation
    - User registration API
    - User authentication (login/logout)
    - Profile management
    - Permission classes

Usage:
    Run tests with: python manage.py test users
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()


class UserModelTests(TestCase):
    """
    Test cases for the CustomUser model.
    """
    
    def test_create_user(self):
        """
        Test creating a regular user with valid credentials.
        """
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.is_active)
    
    def test_create_superuser(self):
        """
        Test creating a superuser with elevated permissions.
        """
        admin = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User'
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
    
    def test_user_str_representation(self):
        """
        Test the string representation of a user.
        """
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.assertEqual(str(user), 'test@example.com')


class UserRegistrationAPITests(APITestCase):
    """
    Test cases for the user registration API endpoint.
    """
    
    def test_register_user_success(self):
        """
        Test successful user registration.
        """
        data = {
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'confirm_password': 'securepass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_register_user_password_mismatch(self):
        """
        Test registration fails when passwords don't match.
        """
        data = {
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'confirm_password': 'differentpass',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
