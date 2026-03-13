# Ecodeed Academy Backend - API Documentation Guide

## Overview

Complete reference for all Ecodeed backend API endpoints, authentication, data models, and integration patterns. This guide covers the Django REST Framework API powering the learning platform.

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Error Handling](#error-handling)
4. [Pagination & Filtering](#pagination--filtering)
5. [Rate Limiting](#rate-limiting)
6. [Data Models](#data-models)
7. [Integration Examples](#integration-examples)

---

## Authentication

### JWT Token-Based Authentication

Ecodeed uses JWT (JSON Web Tokens) for stateless authentication.

#### Token Flow

```
1. User Registration/Login
   ├─ POST /api/v1/auth/register/ or POST /api/v1/auth/login/
   └─ Returns: { access_token, refresh_token, user }

2. Access Token Usage
   ├─ Valid for: 15 minutes
   ├─ Usage: Authorization: Bearer {access_token}
   └─ Endpoint: GET /api/v1/auth/profile/

3. Token Refresh
   ├─ When access token expires, use refresh token
   ├─ POST /api/v1/auth/jwt/refresh/
   └─ Returns: { access: new_token }

4. Logout
   ├─ POST /api/v1/auth/logout/
   ├─ Action: Blacklist refresh token
   └─ Result: User session ended
```

#### Token Storage (Frontend)

```javascript
// Store tokens after login/registration
localStorage.setItem('access_token', response.access);
localStorage.setItem('refresh_token', response.refresh);

// Use in API requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`
};

// On token expiry error (401)
// Call POST /api/v1/auth/jwt/refresh/ with refresh_token
// Get new access_token
// Retry original request
```

#### Permission Levels

| Level | Description | Endpoints |
|-------|-------------|-----------|
| Anonymous | No auth required | Register, Login, List public courses |
| Authenticated | Valid JWT token | Profile, Enroll, Submit assignments |
| Instructor | is_instructor=true | Create courses, Grade assignments |
| Admin | is_admin=true | Manage users, Delete content, View analytics |

---

## API Endpoints

### Authentication Endpoints

#### 1. User Registration

```http
POST /api/v1/auth/register/
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "password2": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe"
}

Response (201 Created):
{
  "user": {
    "id": 123,
    "email": "newuser@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_admin": false,
    "is_instructor": false,
    "has_enrollments": false,
    "profile_picture": null,
    "date_joined": "2024-02-20T10:30:00Z"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### 2. User Login

```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response (200 OK):
{
  "user": { ...user object },
  "access": "eyJ0eXAi...",
  "refresh": "eyJ0eXAi..."
}

Errors:
- 401 Unauthorized: Invalid email or password
- 429 Too Many Requests: Rate limited (5 attempts/min)
```

#### 3. Get User Profile

```http
GET /api/v1/auth/profile/
Authorization: Bearer {access_token}

Response (200 OK):
{
  "id": 123,
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_admin": true,
  "is_instructor": false,
  "profile_picture": "https://res.cloudinary.com/.../user_123.jpg",
  "bio": "Python expert",
  "date_joined": "2024-01-15T09:00:00Z",
  "has_enrollments": true
}
```

#### 4. Update User Profile with Picture

```http
PUT /api/v1/auth/profile/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Form Data:
- first_name: "John Updated"
- bio: "Senior Python Developer"
- profile_picture: <binary image file>

Response (200 OK):
{
  "id": 123,
  "email": "john@example.com",
  "first_name": "John Updated",
  "profile_picture": "https://res.cloudinary.com/.../user_123_new.jpg",
  "bio": "Senior Python Developer",
  ...
}

Errors:
- 400 Bad Request: File size > 5MB or invalid format
- 502 Bad Gateway: Cloudinary upload error
```

#### 5. User Logout

```http
POST /api/v1/auth/logout/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "refresh": "eyJ0eXAi..."
}

Response (205 Reset Content):
{
  "message": "Successfully logged out"
}
```

#### 6. Refresh Access Token

```http
POST /api/v1/auth/jwt/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAi..."
}

Response (200 OK):
{
  "access": "eyJ0eXAiOiJKV1Q..."
}

Errors:
- 401 Unauthorized: Invalid or expired refresh token
```

### Courses Endpoints

#### 1. List Courses

```http
GET /api/v1/courses/

Query Parameters:
- category: "specialized" | "masterclass" | "webinar" | "coaching" | "compliance" | "licensing"
- is_free: true | false
- search: "search term"
- limit: number
- offset: number

Response (200 OK):
{
  "count": 45,
  "next": "http://api.example.com/courses/?limit=10&offset=10",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Python Basics",
      "slug": "python-basics",
      "short_description": "Learn Python from scratch",
      "category": "specialized",
      "price": "49.99",
      "is_free": false,
      "has_certificate": true,
      "instructor": {
        "id": 5,
        "email": "instructor@example.com",
        "first_name": "Jane"
      },
      "image": "https://res.cloudinary.com/.../course_1.jpg",
      "created_at": "2024-01-15T09:00:00Z",
      "modules": [
        {
          "id": 1,
          "title": "Getting Started",
          "order": 1
        }
      ]
    }
  ]
}
```

#### 2. Get Course Detail

```http
GET /api/v1/courses/{id}/
or
GET /api/v1/courses/{slug}/

Response (200 OK):
{
  "id": 1,
  "title": "Python Basics",
  "slug": "python-basics",
  "full_description": "Comprehensive Python course...",
  "short_description": "Learn Python from scratch",
  "price": "49.99",
  "is_free": false,
  "category": "specialized",
  "level": ["beginner"],
  "format": ["video", "assignments"],
  "features": ["certificates", "live_sessions"],
  "has_certificate": true,
  "pacing_type": "self_paced",
  "instructor": { ...instructor object },
  "target_audience": ["students", "professionals"],
  "faqs": [
    {
      "question": "Do I get a certificate?",
      "answer": "Yes, upon completion."
    }
  ],
  "modules": [
    {
      "id": 1,
      "title": "Getting Started",
      "description": "Introduction to Python",
      "order": 1,
      "lessons": [
        {
          "id": 1,
          "title": "What is Python?",
          "duration": 600,
          "is_free_preview": true
        }
      ]
    }
  ],
  "enrollments_count": 150,
  "created_at": "2024-01-15T09:00:00Z"
}
```

#### 3. Get Course Weeks (Structured View)

```http
GET /api/v1/courses/{id}/weeks/
Authorization: Bearer {access_token}

Response (200 OK):
{
  "course": {
    "id": 1,
    "title": "Python Basics"
  },
  "weeks": [
    {
      "week_number": 1,
      "start_date": "2024-02-20",
      "modules": [
        {
          "id": 1,
          "title": "Getting Started",
          "lessons": [
            {
              "id": 1,
              "title": "What is Python?",
              "video_url": "https://vimeo.com/123456",
              "duration": 600,
              "completed": false
            }
          ]
        }
      ]
    }
  ]
}
```

#### 4. Create Course (Instructor)

```http
POST /api/v1/courses/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Advanced Python",
  "short_description": "Advanced Python concepts",
  "full_description": "...",
  "category": "specialized",
  "price": "99.99",
  "is_free": false,
  "has_certificate": true,
  "pacing_type": "weekly",
  "target_audience": ["professionals"],
  "faqs": [],
  "features": ["certificates", "assignments"]
}

Response (201 Created):
{
  "id": 2,
  "slug": "advanced-python",
  ...course object
}

Errors:
- 403 Forbidden: Not an instructor
```

### Enrollments Endpoints

#### 1. Get My Courses

```http
GET /api/v1/enrollments/my-courses/
Authorization: Bearer {access_token}

Response (200 OK):
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "course": {
        "id": 1,
        "title": "Python Basics",
        "slug": "python-basics",
        "image": "https://res.cloudinary.com/.../course.jpg"
      },
      "status": "active",
      "enrolled_at": "2024-02-15T10:00:00Z",
      "progress": {
        "lessons_completed": 5,
        "total_lessons": 45,
        "completion_percentage": 11
      }
    }
  ]
}
```

#### 2. Enroll in Course

```http
POST /api/v1/enrollments/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "course_id": 1
}

Response (201 Created):
{
  "id": 123,
  "course": { ...course object },
  "status": "active",
  "enrolled_at": "2024-02-20T10:00:00Z",
  "progress": {}
}

Errors:
- 400 Bad Request: Already enrolled
- 404 Not Found: Course doesn't exist
```

### Lessons Endpoints

#### 1. Mark Lesson Complete

```http
POST /api/v1/lessons/{id}/complete/
Authorization: Bearer {access_token}

Response (200 OK):
{
  "message": "Lesson marked as complete",
  "enrollment": {
    "progress": {
      "lessons_completed": 6,
      "total_lessons": 45,
      "completion_percentage": 13
    }
  }
}
```

#### 2. Get Lesson Details

```http
GET /api/v1/lessons/{id}/
Authorization: Bearer {access_token}

Response (200 OK):
{
  "id": 1,
  "title": "What is Python?",
  "content": "Python is a high-level programming language...",
  "video_url": "https://vimeo.com/123456789",
  "duration": 600,
  "is_free_preview": false,
  "order": 0,
  "module": {
    "id": 1,
    "title": "Getting Started"
  },
  "completed": true,
  "completed_at": "2024-02-20T15:30:00Z"
}
```

### Assignments Endpoints

#### 1. Submit Assignment

```http
POST /api/v1/assignments/{id}/submit/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Form Data:
- submission_file: <binary file>

Response (201 Created):
{
  "id": 456,
  "assignment": {
    "id": 10,
    "title": "Build a Calculator"
  },
  "submitted_at": "2024-02-20T10:00:00Z",
  "is_reviewed": false
}

Errors:
- 400 Bad Request: File missing or invalid
- 403 Forbidden: Not enrolled in course
```

#### 2. Get Assignment Submissions (Instructor)

```http
GET /api/v1/assignments/{id}/submissions/
Authorization: Bearer {access_token}

Response (200 OK):
{
  "count": 25,
  "results": [
    {
      "id": 456,
      "student": {
        "id": 5,
        "email": "student@example.com",
        "first_name": "John"
      },
      "submitted_at": "2024-02-20T10:00:00Z",
      "submission_file_url": "https://res.cloudinary.com/.../submission.zip",
      "is_reviewed": false,
      "feedback": null,
      "grade": null
    }
  ]
}
```

#### 3. Grade Assignment (Instructor)

```http
PATCH /api/v1/submissions/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "feedback": "Excellent work! Consider adding error handling.",
  "grade": "A",
  "is_reviewed": true
}

Response (200 OK):
{
  "id": 456,
  "feedback": "Excellent work!...",
  "grade": "A",
  "is_reviewed": true
}
```

### Comments Endpoints

#### 1. Get Lesson Comments

```http
GET /api/v1/comments/lesson/{lesson_id}/
Authorization: Bearer {access_token}

Response (200 OK):
{
  "count": 12,
  "results": [
    {
      "id": 1,
      "author": {
        "id": 5,
        "email": "student@example.com",
        "first_name": "John"
      },
      "lesson": 1,
      "text": "Great explanation!",
      "created_at": "2024-02-20T10:00:00Z",
      "replies": []
    }
  ]
}
```

#### 2. Create Comment

```http
POST /api/v1/comments/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "lesson": 1,
  "text": "This is really helpful!"
}

Response (201 Created):
{
  "id": 13,
  "lesson": 1,
  "text": "This is really helpful!",
  "author": { ...user object },
  "created_at": "2024-02-20T15:30:00Z"
}
```

---

## Error Handling

### Standard Error Responses

```javascript
// 400 Bad Request - Invalid input
{
  "field_name": ["Error message"],
  "another_field": ["Another error"]
}

// 401 Unauthorized - No valid token
{
  "detail": "Authentication credentials were not provided."
}

// 403 Forbidden - Insufficient permissions
{
  "detail": "You do not have permission to perform this action."
}

// 404 Not Found - Resource doesn't exist
{
  "detail": "Not found."
}

// 429 Too Many Requests - Rate limited
{
  "detail": "Request was throttled. Expected available in 45 seconds."
}

// 500 Internal Server Error - Server error
{
  "detail": "Internal server error. Try again later."
}
```

### Frontend Error Handling

```javascript
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        ...options.headers
      },
      ...options
    });

    if (response.status === 401) {
      // Token expired, refresh
      const refreshToken = localStorage.getItem('refresh_token');
      const refreshResponse = await fetch('/api/v1/auth/jwt/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      });
      
      if (refreshResponse.ok) {
        const { access } = await refreshResponse.json();
        localStorage.setItem('access_token', access);
        // Retry original request
        return apiRequest(url, options);
      } else {
        // Token refresh failed, redirect to login
        window.location.href = '/login';
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API Error');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## Pagination & Filtering

### List Response Format

All list endpoints return paginated results:

```javascript
{
  "count": 250,                    // Total items
  "next": "?limit=10&offset=10",   // Next page URL
  "previous": null,                // Previous page URL
  "results": [ {...}, {...} ]      // Items for current page
}
```

### Pagination Parameters

```http
GET /api/v1/courses/?limit=20&offset=40

// Results 40-60 (20 items per page, page 3)

GET /api/v1/enrollments/?page=2&page_size=15

// Alternative format: page-based pagination
```

### Filtering & Search

```http
// Filter by category
GET /api/v1/courses/?category=specialized

// Search courses
GET /api/v1/courses/?search=python

// Filter by status
GET /api/v1/enrollments/?status=active

// Combine filters
GET /api/v1/courses/?category=specialized&is_free=false&search=advanced
```

---

## Rate Limiting

### Login Rate Limiting

- **Limit**: 5 requests per minute per IP address
- **Endpoint**: `POST /api/v1/auth/login/`
- **When Exceeded**: Returns HTTP 429 Too Many Requests

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45

{
  "detail": "Request was throttled. Expected available in 45 seconds."
}
```

### Frontend Handling

```javascript
async function loginWithRateLimit(email, password) {
  try {
    const response = await fetch('/api/v1/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      showError(`Too many login attempts. Try again in ${retryAfter} seconds.`);
      return;
    }

    // ... handle response
  } catch (error) {
    // ... handle error
  }
}
```

---

## Data Models

### User Model

```python
{
  "id": 123,
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_admin": true,           # Platform admin
  "is_instructor": false,     # Can create courses
  "is_staff": true,           # Can access Django admin
  "has_enrollments": true,    # Has enrolled in any course
  "profile_picture": "https://...",
  "bio": "Software engineer",
  "date_joined": "2024-01-15T09:00:00Z",
  "last_login": "2024-02-20T10:00:00Z"
}
```

### Course Model

```python
{
  "id": 1,
  "title": "Python Basics",
  "slug": "python-basics",
  "short_description": "Learn Python from scratch",
  "full_description": "...",
  "price": "49.99",
  "is_free": false,
  "category": "specialized",
  "level": ["beginner"],
  "format": ["video", "assignments"],
  "has_certificate": true,
  "pacing_type": "self_paced",
  "instructor": { ...user object },
  "image": "https://...",
  "enrollments_count": 150,
  "created_at": "2024-01-15T09:00:00Z",
  "updated_at": "2024-02-20T10:00:00Z"
}
```

### Enrollment Model

```python
{
  "id": 456,
  "user": { ...user object },
  "course": { ...course object },
  "status": "active",          # active | completed | dropped | paused
  "enrolled_at": "2024-02-15T10:00:00Z",
  "progress": {
    "lessons_completed": 10,
    "total_lessons": 45,
    "modules_completed": 2,
    "completion_percentage": 22
  }
}
```

### Lesson Model

```python
{
  "id": 1,
  "title": "What is Python?",
  "content": "Python is a high-level language...",
  "video_url": "https://vimeo.com/123456",
  "duration": 600,          # seconds
  "is_free_preview": true,
  "order": 0,
  "module": { ...module object },
  "completed": false
}
```

---

## Integration Examples

### Complete Login & Dashboard Flow

```javascript
// 1. User enters credentials
async function login(email, password) {
  const response = await fetch('/api/v1/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }
  
  const { user, access, refresh } = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Dispatch Redux action
  dispatch(setUser(user));
  
  // Redirect based on role
  if (user.is_admin || user.is_instructor) {
    window.location.href = '/admin-dashboard';
  } else {
    window.location.href = '/student-dashboard';
  }
}

// 2. Load dashboard data
async function loadDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const accessToken = localStorage.getItem('access_token');
  
  if (user.is_admin) {
    // Admin dashboard
    const [users, courses, stats] = await Promise.all([
      fetch('/api/v1/auth/users/getUsers/', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }).then(r => r.json()),
      
      fetch('/api/v1/courses/?limit=100', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }).then(r => r.json()),
      
      fetchAdminStats(accessToken)
    ]);
    
    dispatch(setAdminData({ users: users.users, courses: courses.results }));
  } else {
    // Student dashboard
    const enrollments = await fetch('/api/v1/enrollments/my-courses/', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }).then(r => r.json());
    
    dispatch(setStudentCourses(enrollments.results));
  }
}

// 3. Handle logout
async function logout() {
  const refreshToken = localStorage.getItem('refresh_token');
  const accessToken = localStorage.getItem('access_token');
  
  try {
    await fetch('/api/v1/auth/logout/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: refreshToken })
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  // Clear local storage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  
  // Clear Redux
  dispatch(clearUser());
  
  // Redirect to login
  window.location.href = '/login';
}
```

### Enroll and Track Progress

```javascript
// 1. Enroll in course
async function enrollCourse(courseId, accessToken) {
  const response = await fetch('/api/v1/enrollments/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ course_id: courseId })
  });
  
  if (!response.ok) throw new Error('Enrollment failed');
  return await response.json();
}

// 2. Mark lesson as complete
async function completeLessonLesson(lessonId, accessToken) {
  const response = await fetch(`/api/v1/lessons/${lessonId}/complete/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (!response.ok) throw new Error('Mark complete failed');
  return await response.json();
}

// 3. Get updated progress
async function getProgress(enrollmentId, accessToken) {
  const response = await fetch(`/api/v1/enrollments/${enrollmentId}/`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  return await response.json();
}
```

---

## Environment Configuration

Backend environment variables in `.env`:

```env
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=ecodeed.com,www.ecodeed.com,api.ecodeed.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecodeed

# JWT
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=0.25

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Paystack
PAYSTACK_SECRET_KEY=your-paystack-secret

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://ecodeed.com
```

---

## Performance Tips

1. **Use select_related for ForeignKey**: Reduces database queries
2. **Use prefetch_related for M2M**: Optimizes reverse lookups
3. **Pagination**: Always use `limit` and `offset` for large result sets
4. **Caching**: Cache course list and frequently accessed data
5. **Lazy Load**: Load enrollments only when needed
6. **Compress**: Gzip responses for faster transfers

Example optimized queryset:

```python
courses = Course.objects.select_related(
    'instructor'  # Avoid N+1 query
).prefetch_related(
    'modules__lessons'  # Prefetch nested relations
).annotate(
    enroll_count=Count('enrollments')  # Add calculated fields
)
```

---

## Support & Troubleshooting

### Common Issues

**Issue**: "Authentication credentials were not provided"
- **Cause**: Missing Authorization header
- **Solution**: Include `Authorization: Bearer {token}` in request

**Issue**: "Token is invalid or expired"
- **Cause**: Access token expired (15 min)
- **Solution**: Use refresh token to get new access token

**Issue**: "Request was throttled"
- **Cause**: Too many login attempts
- **Solution**: Wait before retrying login

**Issue**: "Profile picture upload failed"
- **Cause**: File size > 5MB or invalid format
- **Solution**: Use smaller image, format must be JPEG/PNG/GIF/WebP

---

## API Changelog

### Version 1.0 (Current)
- User authentication (register, login, JWT)
- Course management (list, detail, search)
- Enrollment tracking
- Lesson completion
- Assignment submission & grading
- Comments system

---

**Last Updated**: February 2024
**API Version**: v1
**Contact**: api-support@ecodeed.com
