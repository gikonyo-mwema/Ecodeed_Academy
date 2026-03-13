# Ecodeed Backend Quick Reference

## Authentication Quick Links

### Token Management

| Action | Endpoint | Method | Auth | Body |
|--------|----------|--------|------|------|
| Register | `/auth/register/` | POST | No | email, password, first_name, last_name |
| Login | `/auth/login/` | POST | No | email, password |
| Get Profile | `/auth/profile/` | GET | Yes | - |
| Update Profile | `/auth/profile/` | PUT | Yes | name, bio, profile_picture |
| Logout | `/auth/logout/` | POST | Yes | refresh_token |
| Refresh Token | `/auth/jwt/refresh/` | POST | No | refresh_token |

### Rate Limits

- **Login**: 5 attempts per minute per IP
- **General API**: No limit (can be added per endpoint)

---

## Data Models Quick Reference

### User Model Fields

```python
User
├── id (int)
├── email (str) - unique
├── password (str)
├── first_name (str)
├── last_name (str)
├── profile_picture (URL)
├── bio (str)
├── is_admin (bool)
├── is_instructor (bool)
├── is_staff (bool)
├── has_enrollments (bool)
├── date_joined (datetime)
└── last_login (datetime)

# Relations
├── courses_taught (reverse FK) → Course
├── enrollments (reverse FK) → Enrollment
├── comments (reverse FK) → Comment
└── submissions (reverse FK) → AssignmentSubmission
```

### Course Model Fields

```python
Course
├── id (int)
├── title (str)
├── slug (str) - auto-generated
├── short_description (str)
├── full_description (str)
├── price (decimal)
├── is_free (bool)
├── category (choice) - specialized, masterclass, webinar, coaching, compliance, licensing
├── level (list) - beginner, intermediate, advanced
├── format (list) - video, assignments, live_sessions
├── features (list) - certificates, feedback, community
├── has_certificate (bool)
├── pacing_type (choice) - self_paced, weekly
├── instructor (FK) → User
├── image (URL)
├── created_at (datetime)
└── updated_at (datetime)

# Relations
├── modules (reverse FK) → Module
├── enrollments (reverse FK) → Enrollment
└── resources (reverse FK) → Resource
```

### Module Model Fields

```python
Module
├── id (int)
├── course (FK) → Course
├── title (str)
├── description (str)
├── order (int)
└── created_at (datetime)

# Relations
├── lessons (reverse FK) → Lesson
├── assignments (reverse FK) → Assignment
├── live_sessions (reverse FK) → LiveSession
└── resources (reverse FK) → Resource
```

### Lesson Model Fields

```python
Lesson
├── id (int)
├── module (FK) → Module
├── title (str)
├── content (str)
├── video_url (URL)
├── duration (int) - seconds
├── is_free_preview (bool)
├── order (int)
├── created_at (datetime)
└── updated_at (datetime)

# Relations
└── completions (reverse FK) → LessonCompletion
```

### Enrollment Model Fields

```python
Enrollment
├── id (int)
├── user (FK) → User
├── course (FK) → Course
├── status (choice) - active, completed, dropped, paused
├── progress (JSON)
│   ├── lessons_completed (int)
│   ├── modules_completed (int)
│   ├── total_lessons (int)
│   ├── completion_percentage (int)
│   └── last_accessed (datetime)
├── enrolled_at (datetime)
├── created_at (datetime)
└── updated_at (datetime)

# Relations
└── completed_lessons (reverse FK) → LessonCompletion

# Constraints
└── unique_together: (user, course)
```

### Assignment Model Fields

```python
Assignment
├── id (int)
├── module (FK) → Module
├── title (str)
├── description (str)
├── due_date (datetime)
├── resource_url (URL)
├── created_at (datetime)
└── updated_at (datetime)

# Relations
└── submissions (reverse FK) → AssignmentSubmission
```

### AssignmentSubmission Model Fields

```python
AssignmentSubmission
├── id (int)
├── assignment (FK) → Assignment
├── student (FK) → User
├── submission_file_url (URL) - Cloudinary
├── feedback (str)
├── grade (str) - A+, 95/100, etc.
├── is_reviewed (bool)
├── submitted_at (datetime)
├── created_at (datetime)
└── updated_at (datetime)
```

### Resource Model Fields

```python
Resource
├── id (int)
├── module (FK) → Module
├── title (str)
├── description (str)
├── file_url (URL)
├── resource_type (choice) - pdf, link, video, document, spreadsheet, other
├── created_at (datetime)
└── updated_at (datetime)
```

---

## API Endpoint Summary

### Authentication (7 endpoints)

```
POST   /api/v1/auth/register/        Create account
POST   /api/v1/auth/login/           Login user
GET    /api/v1/auth/profile/         Get user profile
PUT    /api/v1/auth/profile/         Update profile + picture
POST   /api/v1/auth/logout/          Logout user
POST   /api/v1/auth/jwt/refresh/     Refresh access token
```

### Courses (4+ endpoints)

```
GET    /api/v1/courses/              List courses
POST   /api/v1/courses/              Create course (instructor)
GET    /api/v1/courses/{id}/         Course detail
GET    /api/v1/courses/{id}/weeks/   Course schedule
PUT    /api/v1/courses/{id}/         Update course (instructor)
```

### Enrollments (3+ endpoints)

```
GET    /api/v1/enrollments/          List enrollments (admin)
GET    /api/v1/enrollments/my-courses/ My enrolled courses
POST   /api/v1/enrollments/          Enroll in course
GET    /api/v1/enrollments/{id}/     Enrollment detail
PATCH  /api/v1/enrollments/{id}/     Update enrollment status
```

### Lessons (2+ endpoints)

```
GET    /api/v1/lessons/{id}/         Lesson detail
POST   /api/v1/lessons/{id}/complete/ Mark complete
```

### Assignments (3+ endpoints)

```
GET    /api/v1/assignments/          List assignments
POST   /api/v1/assignments/{id}/submit/ Submit assignment
GET    /api/v1/assignments/{id}/submissions/ View submissions (instructor)
```

### Comments (2+ endpoints)

```
GET    /api/v1/comments/lesson/{id}/ Get lesson comments
POST   /api/v1/comments/            Create comment
```

### Admin User Management (4 endpoints)

```
GET    /api/v1/auth/users/getUsers/        List users + stats
DELETE /api/v1/auth/users/{id}/deleteUser/ Delete user
PATCH  /api/v1/auth/users/{id}/updateRole/ Change user role
```

---

## Common API Queries

### Fetch User's Enrolled Courses

```javascript
const accessToken = localStorage.getItem('access_token');
const response = await fetch('/api/v1/enrollments/my-courses/', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
const { results } = await response.json();
// results = [{ id, course, status, progress, enrolled_at }]
```

### Get Course with All Modules & Lessons

```javascript
const response = await fetch('/api/v1/courses/1/');
const course = await response.json();
// course.modules = [{ id, title, lessons: [...] }]
```

### List Courses with Filters

```javascript
// All free courses
fetch('/api/v1/courses/?is_free=true')

// By category
fetch('/api/v1/courses/?category=specialized')

// Search
fetch('/api/v1/courses/?search=python')

// Pagination
fetch('/api/v1/courses/?limit=20&offset=0')
```

### Mark Lesson Complete

```javascript
const response = await fetch('/api/v1/lessons/1/complete/', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
const { enrollment } = await response.json();
// enrollment.progress.completion_percentage = 15
```

### Submit Assignment

```javascript
const formData = new FormData();
formData.append('submission_file', fileInput.files[0]);

const response = await fetch('/api/v1/assignments/1/submit/', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` },
  body: formData
});
```

### Grade Assignment (Instructor)

```javascript
const response = await fetch('/api/v1/submissions/456/', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    feedback: 'Great work!',
    grade: 'A',
    is_reviewed: true
  })
});
```

### Admin: Get All Users

```javascript
const response = await fetch('/api/v1/auth/users/getUsers/?limit=20', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
const { users, totalUsers, lastMonthUsers } = await response.json();
```

### Admin: Change User Role

```javascript
const response = await fetch('/api/v1/auth/users/123/updateRole/', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ user_type: 'INSTRUCTOR' })
});
```

---

## Error Status Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input, check parameters |
| 401 | Unauthorized | Token missing/expired, login again |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limited, wait and retry |
| 500 | Server Error | Server issue, try again later |

---

## Permission Levels

### Anonymous (No Auth)
- List courses
- Get course detail
- Register
- Login

### Authenticated (Any User)
- Get own profile
- Update own profile
- View enrolled courses
- View course details (enrolled)
- Submit assignments
- Complete lessons
- Comment on lessons

### Instructor (is_instructor=true)
- Create courses
- Edit own courses
- View own course enrollments
- Grade submissions
- Create live sessions

### Admin (is_admin=true)
- Manage all users
- Delete courses
- Ban users
- View analytics
- Change user roles
- Access Django admin

---

## File Upload Endpoints

### Profile Picture Upload

```
PUT /api/v1/auth/profile/
Content-Type: multipart/form-data

Form Fields:
- profile_picture: <file>

Validations:
- Max size: 5 MB
- Formats: JPEG, PNG, GIF, WebP
- Stored: Cloudinary CDN

Response: { ...user with updated profile_picture URL }
```

### Assignment Submission Upload

```
POST /api/v1/assignments/{id}/submit/
Content-Type: multipart/form-data

Form Fields:
- submission_file: <file>

Validations:
- Max size: 50 MB (configurable)
- Formats: Any
- Stored: Cloudinary CDN

Response: { id, submitted_at, is_reviewed }
```

---

## Database Indexes

Optimized for:
- Fast course lookups by slug
- User enrollments by status
- Lesson sequences by module order
- Submission grading workflows
- Monthly user statistics

```python
# Course model
Index on: (category)
Index on: (-created_at)

# Enrollment model
Index on: (status)
Index on: (-enrolled_at)
Index on: (user, status)

# LessonCompletion model
Index on: (enrollment, -completed_at)

# AssignmentSubmission model
Index on: (assignment, is_reviewed)
Index on: (student, -submitted_at)
```

---

## Cache Strategies

### Frontend Redux State

```javascript
{
  user: { id, email, is_admin, is_instructor },
  enrollments: [{ course, status, progress }],
  courses: { byId: { 1: {...}, 2: {...} } }
}
```

### Backend Cache (Optional)

```python
# Cache frequently accessed
cache.get('courses_all')
cache.get(f'course_{slug}')
cache.get(f'enrollments_user_{user_id}')
```

---

## Integration Checklist

- [ ] Copy API base URL to frontend config
- [ ] Set up JWT token storage in localStorage
- [ ] Configure CORS allowed origins
- [ ] Set Cloudinary credentials
- [ ] Create Redux slices for auth, courses, enrollments
- [ ] Add error boundary + fallback UI
- [ ] Set up API interceptor for token refresh
- [ ] Configure pagination for list views
- [ ] Add loading states for async operations
- [ ] Test token expiry and refresh flow
- [ ] Test file uploads (profile pic, assignments)
- [ ] Test role-based access control

---

## Useful Django Management Commands

```bash
# Create admin user
python manage.py createsuperuser

# Create demo data
python manage.py seed_data

# Run migrations
python manage.py migrate

# Export data
python manage.py dumpdata > backup.json

# Load data
python manage.py loaddata backup.json

# Clear tokens (invalidate all sessions)
python manage.py flush_tokens

# Run tests
python manage.py test

# Generate API docs
python manage.py spectacular --file schema.yml
```

---

## Environment Variables Needed

```bash
# Django
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,api.ecodeed.com

# Database
DATABASE_URL=postgresql://user:pass@localhost/ecodeed_db

# JWT Tokens
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DELTA_SECONDS=900  # 15 minutes

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com

# CORS
CORS_ALLOW_CREDENTIALS=True
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://ecodeed.com

# Stripe/Paystack
PAYSTACK_PUBLIC_KEY=your-public-key
PAYSTACK_SECRET_KEY=your-secret-key
```

---

## Troubleshooting Guide

### Issue: CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**: Add frontend URL to `CORS_ALLOWED_ORIGINS` in settings

### Issue: Token Expired

```
{
  "detail": "Token is invalid or expired"
}
```

**Solution**: Use refresh_token to get new access_token

### Issue: File Upload Fails

```
"Profile picture too large. Maximum is 5 MB."
```

**Solution**: Compress image before upload or increase MAX_PROFILE_PICTURE_SIZE

### Issue: Rate Limited on Login

```
"Request was throttled. Expected available in 45 seconds."
```

**Solution**: Wait before retrying or implement exponential backoff

---

**Version**: 1.0  
**Last Updated**: February 2024  
**Contact**: dev-team@ecodeed.com
