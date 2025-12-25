"""
Unit Tests for the Users Application.

This module contains comprehensive test cases for user-related functionality including:
    - User model creation and validation
    - User registration API
    - User authentication (login/logout)
    - Profile management
    - Permission classes
    - Admin-only endpoints

Usage:
    Run tests with: python manage.py test users
    Run with verbosity: python manage.py test users -v 2
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

User = get_user_model()


# ==================== Model Tests ====================

class UserModelTests(TestCase):
    """
    Test cases for the CustomUser model.
    """
    
    def test_create_user_with_email(self):
        """Test creating a regular user with valid credentials."""
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
        self.assertEqual(user.user_type, User.UserType.READER)
    
    def test_create_user_without_email_raises_error(self):
        """Test that creating a user without email raises ValueError."""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email='',
                password='testpass123',
                first_name='Test',
                last_name='User'
            )
    
    def test_create_user_email_normalized(self):
        """Test that email is normalized (lowercase domain)."""
        user = User.objects.create_user(
            email='test@EXAMPLE.COM',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.assertEqual(user.email, 'test@example.com')
    
    def test_create_superuser(self):
        """Test creating a superuser with elevated permissions."""
        admin = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User'
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_active)
    
    def test_create_superuser_without_is_staff_raises_error(self):
        """Test that superuser must have is_staff=True."""
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email='admin@example.com',
                password='adminpass123',
                first_name='Admin',
                last_name='User',
                is_staff=False
            )
    
    def test_create_superuser_without_is_superuser_raises_error(self):
        """Test that superuser must have is_superuser=True."""
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email='admin@example.com',
                password='adminpass123',
                first_name='Admin',
                last_name='User',
                is_superuser=False
            )
    
    def test_user_str_representation(self):
        """Test the string representation of a user."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.assertEqual(str(user), 'test@example.com')
    
    def test_user_get_full_name(self):
        """Test getting user's full name."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.assertEqual(user.get_full_name(), 'Test User')
    
    def test_user_get_short_name(self):
        """Test getting user's short name (first name)."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.assertEqual(user.get_short_name(), 'Test')
    
    def test_user_type_properties(self):
        """Test user type property methods."""
        student = User.objects.create_user(
            email='student@example.com',
            password='testpass123',
            first_name='Student',
            last_name='User',
            user_type=User.UserType.STUDENT
        )
        mentor = User.objects.create_user(
            email='mentor@example.com',
            password='testpass123',
            first_name='Mentor',
            last_name='User',
            user_type=User.UserType.MENTOR
        )
        admin = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            first_name='Admin',
            last_name='User',
            user_type=User.UserType.ADMIN
        )
        reader = User.objects.create_user(
            email='reader@example.com',
            password='testpass123',
            first_name='Reader',
            last_name='User',
            user_type=User.UserType.READER
        )
        
        self.assertTrue(student.is_student)
        self.assertFalse(student.is_mentor)
        
        self.assertTrue(mentor.is_mentor)
        self.assertFalse(mentor.is_student)
        
        self.assertTrue(admin.is_admin)
        self.assertFalse(admin.is_student)
        
        self.assertTrue(reader.is_reader)
        self.assertFalse(reader.is_admin)
    
    def test_user_default_type_is_reader(self):
        """Test that default user type is READER."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.assertEqual(user.user_type, User.UserType.READER)
        self.assertTrue(user.is_reader)


# ==================== Registration API Tests ====================

class UserRegistrationAPITests(APITestCase):
    """
    Test cases for the user registration API endpoint.
    """
    
    def test_register_user_success(self):
        """Test successful user registration."""
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
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'newuser@example.com')
    
    def test_register_user_password_mismatch(self):
        """Test registration fails when passwords don't match."""
        data = {
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'confirm_password': 'differentpass',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_user_short_password(self):
        """Test registration fails with short password (< 8 chars)."""
        data = {
            'email': 'newuser@example.com',
            'password': 'short',
            'confirm_password': 'short',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_user_invalid_email(self):
        """Test registration fails with invalid email format."""
        data = {
            'email': 'invalidemail',
            'password': 'securepass123',
            'confirm_password': 'securepass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_user_duplicate_email(self):
        """Test registration fails with already registered email."""
        User.objects.create_user(
            email='existing@example.com',
            password='testpass123',
            first_name='Existing',
            last_name='User'
        )
        data = {
            'email': 'existing@example.com',
            'password': 'securepass123',
            'confirm_password': 'securepass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_user_missing_fields(self):
        """Test registration fails with missing required fields."""
        data = {
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'confirm_password': 'securepass123',
            # Missing first_name and last_name
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_user_with_user_type(self):
        """Test registration with specific user type."""
        data = {
            'email': 'student@example.com',
            'password': 'securepass123',
            'confirm_password': 'securepass123',
            'first_name': 'Student',
            'last_name': 'User',
            'user_type': 'STUDENT'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['user_type'], 'STUDENT')


# ==================== Login API Tests ====================

class UserLoginAPITests(APITestCase):
    """
    Test cases for the user login API endpoint.
    """
    
    def setUp(self):
        """Set up test user for login tests."""
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    def test_login_success(self):
        """Test successful login with valid credentials."""
        data = {
            'email': 'testuser@example.com',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'testuser@example.com')
    
    def test_login_invalid_password(self):
        """Test login fails with wrong password."""
        data = {
            'email': 'testuser@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_invalid_email(self):
        """Test login fails with non-existent email."""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_missing_email(self):
        """Test login fails without email."""
        data = {
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_missing_password(self):
        """Test login fails without password."""
        data = {
            'email': 'testuser@example.com'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_inactive_user(self):
        """Test login fails for inactive user."""
        self.user.is_active = False
        self.user.save()
        
        data = {
            'email': 'testuser@example.com',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ==================== Logout API Tests ====================

class UserLogoutAPITests(APITestCase):
    """
    Test cases for the user logout API endpoint.
    """
    
    def setUp(self):
        """Set up test user and tokens for logout tests."""
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        # Login to get tokens
        login_response = self.client.post('/api/auth/login/', {
            'email': 'testuser@example.com',
            'password': 'testpass123'
        })
        self.access_token = login_response.data['access']
        self.refresh_token = login_response.data['refresh']
    
    def test_logout_success(self):
        """Test successful logout with valid refresh token."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.post('/api/auth/logout/', {'refresh': self.refresh_token})
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)
    
    def test_logout_without_auth(self):
        """Test logout fails without authentication."""
        response = self.client.post('/api/auth/logout/', {'refresh': self.refresh_token})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_logout_invalid_token(self):
        """Test logout fails with invalid refresh token."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.post('/api/auth/logout/', {'refresh': 'invalid_token'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_logout_missing_refresh_token(self):
        """Test logout fails without refresh token."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.post('/api/auth/logout/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ==================== Profile API Tests ====================

class UserProfileAPITests(APITestCase):
    """
    Test cases for the user profile API endpoints.
    """
    
    def setUp(self):
        """Set up test user and authentication."""
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            bio='Original bio'
        )
        # Login to get access token
        login_response = self.client.post('/api/auth/login/', {
            'email': 'testuser@example.com',
            'password': 'testpass123'
        })
        self.access_token = login_response.data['access']
    
    def test_get_profile_authenticated(self):
        """Test retrieving profile for authenticated user."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'testuser@example.com')
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')
    
    def test_get_profile_unauthenticated(self):
        """Test retrieving profile without authentication fails."""
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_profile_success(self):
        """Test updating profile with valid data."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'bio': 'Updated bio'
        }
        response = self.client.patch('/api/auth/profile/update/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Updated')
        self.assertEqual(response.data['bio'], 'Updated bio')
    
    def test_update_profile_unauthenticated(self):
        """Test updating profile without authentication fails."""
        data = {'first_name': 'Updated'}
        response = self.client.patch('/api/auth/profile/update/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_profile_contains_expected_fields(self):
        """Test profile response contains all expected fields."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.get('/api/auth/profile/')
        expected_fields = ['id', 'email', 'first_name', 'last_name', 
                         'user_type', 'profile_picture', 'bio', 
                         'phone_number', 'date_joined']
        for field in expected_fields:
            self.assertIn(field, response.data)


# ==================== Admin User Management Tests ====================

class AdminUserManagementAPITests(APITestCase):
    """
    Test cases for admin-only user management endpoints.
    """
    
    def setUp(self):
        """Set up admin and regular users for testing."""
        # Create admin user (is_staff=True for IsAdminUser permission)
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User',
            user_type=User.UserType.ADMIN,
            is_staff=True
        )
        
        # Create regular user
        self.regular_user = User.objects.create_user(
            email='regular@example.com',
            password='regularpass123',
            first_name='Regular',
            last_name='User'
        )
        
        # Get admin access token
        admin_login = self.client.post('/api/auth/login/', {
            'email': 'admin@example.com',
            'password': 'adminpass123'
        })
        self.admin_token = admin_login.data['access']
        
        # Get regular user access token
        regular_login = self.client.post('/api/auth/login/', {
            'email': 'regular@example.com',
            'password': 'regularpass123'
        })
        self.regular_token = regular_login.data['access']
    
    def test_admin_list_users(self):
        """Test admin can list all users."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should have at least 2 users (admin + regular)
        self.assertGreaterEqual(len(response.data['results']), 2)
    
    def test_non_admin_cannot_list_users(self):
        """Test regular user cannot list all users."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_token}')
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_unauthenticated_cannot_list_users(self):
        """Test unauthenticated request cannot list users."""
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_admin_get_user_detail(self):
        """Test admin can get specific user details."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.get(f'/api/auth/users/{self.regular_user.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'regular@example.com')
    
    def test_non_admin_cannot_get_user_detail(self):
        """Test regular user cannot get other user's details."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_token}')
        response = self.client.get(f'/api/auth/users/{self.admin.pk}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_update_user(self):
        """Test admin can update user information."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        data = {'first_name': 'AdminUpdated'}
        response = self.client.patch(f'/api/auth/users/{self.regular_user.pk}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'AdminUpdated')
    
    def test_admin_delete_user(self):
        """Test admin can delete a user."""
        # Create a user to delete
        user_to_delete = User.objects.create_user(
            email='todelete@example.com',
            password='deletepass123',
            first_name='Delete',
            last_name='Me'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.delete(f'/api/auth/users/{user_to_delete.pk}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify user is deleted
        self.assertFalse(User.objects.filter(pk=user_to_delete.pk).exists())
    
    def test_non_admin_cannot_delete_user(self):
        """Test regular user cannot delete users."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_token}')
        response = self.client.delete(f'/api/auth/users/{self.admin.pk}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_nonexistent_user(self):
        """Test getting non-existent user returns 404."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.get('/api/auth/users/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ==================== Permission Tests ====================

class PermissionTests(TestCase):
    """
    Test cases for custom permission classes.
    """
    
    def setUp(self):
        """Set up users with different roles."""
        self.student = User.objects.create_user(
            email='student@example.com',
            password='testpass123',
            first_name='Student',
            last_name='User',
            user_type=User.UserType.STUDENT
        )
        self.mentor = User.objects.create_user(
            email='mentor@example.com',
            password='testpass123',
            first_name='Mentor',
            last_name='User',
            user_type=User.UserType.MENTOR
        )
        self.admin_user = User.objects.create_user(
            email='adminuser@example.com',
            password='testpass123',
            first_name='Admin',
            last_name='User',
            user_type=User.UserType.ADMIN
        )
        self.reader = User.objects.create_user(
            email='reader@example.com',
            password='testpass123',
            first_name='Reader',
            last_name='User',
            user_type=User.UserType.READER
        )
    
    def test_is_admin_property(self):
        """Test is_admin property returns correct values."""
        self.assertTrue(self.admin_user.is_admin)
        self.assertFalse(self.student.is_admin)
        self.assertFalse(self.mentor.is_admin)
        self.assertFalse(self.reader.is_admin)
    
    def test_is_mentor_property(self):
        """Test is_mentor property returns correct values."""
        self.assertTrue(self.mentor.is_mentor)
        self.assertFalse(self.student.is_mentor)
        self.assertFalse(self.admin_user.is_mentor)
        self.assertFalse(self.reader.is_mentor)
    
    def test_is_student_property(self):
        """Test is_student property returns correct values."""
        self.assertTrue(self.student.is_student)
        self.assertFalse(self.mentor.is_student)
        self.assertFalse(self.admin_user.is_student)
        self.assertFalse(self.reader.is_student)
    
    def test_is_reader_property(self):
        """Test is_reader property returns correct values."""
        self.assertTrue(self.reader.is_reader)
        self.assertFalse(self.student.is_reader)
        self.assertFalse(self.mentor.is_reader)
        self.assertFalse(self.admin_user.is_reader)


# ==================== Token Tests ====================

class TokenTests(APITestCase):
    """
    Test cases for JWT token functionality.
    """
    
    def setUp(self):
        """Set up test user."""
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    def test_login_returns_tokens(self):
        """Test login returns both access and refresh tokens."""
        response = self.client.post('/api/auth/login/', {
            'email': 'testuser@example.com',
            'password': 'testpass123'
        })
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertTrue(len(response.data['access']) > 0)
        self.assertTrue(len(response.data['refresh']) > 0)
    
    def test_registration_returns_tokens(self):
        """Test registration returns both access and refresh tokens."""
        data = {
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'confirm_password': 'securepass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_access_token_works_for_protected_endpoint(self):
        """Test access token can be used to access protected endpoints."""
        login_response = self.client.post('/api/auth/login/', {
            'email': 'testuser@example.com',
            'password': 'testpass123'
        })
        access_token = login_response.data['access']
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_invalid_token_rejected(self):
        """Test invalid token is rejected."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
