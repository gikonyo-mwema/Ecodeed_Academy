# Frontend-Backend Integration Guide

## Overview

This guide shows how frontend React components integrate with Django REST Framework backend API endpoints, data flows, state management, and real-world implementation patterns.

## Table of Contents

1. [Architecture](#architecture)
2. [Authentication Flow](#authentication-flow)
3. [Dashboard Integration](#dashboard-integration)
4. [Course Management](#course-management)
5. [Enrollment & Progress](#enrollment--progress)
6. [API Service Layer](#api-service-layer)
7. [Redux State Management](#redux-state-management)
8. [Error Handling](#error-handling)

---

## Architecture

### Request/Response Flow

```
React Component
     │
     ├─ User Interaction (click, form submit)
     │
     ├─ Redux Action Creator
     │      └─ Validates input
     │      └─ Calls API Service
     │
     ├─ API Service Layer (utils/api.js)
     │      └─ Constructs request
     │      └─ Adds Authorization header
     │      └─ Handles token refresh
     │
     ├─ HTTP Request
     │      GET  /api/v1/enrollments/my-courses/
     │      PUT  /api/v1/auth/profile/
     │      POST /api/v1/lessons/1/complete/
     │
     ├─ Django REST Framework
     │      └─ Permission checks
     │      └─ Serializer validation
     │      └─ Database query
     │
     ├─ HTTP Response
     │      { id, email, courses: [...] }
     │
     ├─ Redux Reducer
     │      └─ Updates state with response
     │      └─ Handles loading/error states
     │
     └─ Component Re-render
            └─ Displays data from Redux state
```

### Technology Stack

**Frontend**:
- React 18+ with React Router
- Redux for state management
- Axios or Fetch API for HTTP
- Flowbite React for UI components
- React Icons for icons

**Backend**:
- Django 4.x with Django REST Framework
- PostgreSQL database
- JWT for authentication
- Cloudinary for file storage
- Celery for async tasks (optional)

---

## Authentication Flow

### 1. Registration (New User)

```
┌─────────────────────────────────────────────────────────┐
│ Frontend: Registration Page                             │
│ ┌───────────────────────────────────────────────────┐   │
│ │ Form: email, password, password2, first_name      │   │
│ │ Button: "Register"                                │   │
│ └───────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ POST /api/v1/auth/register/
                   ├─ Validates email format
                   ├─ Validates password strength
                   ├─ Hashes password with bcrypt
                   │
┌──────────────────▼──────────────────────────────────────┐
│ Backend: UserRegistrationView                           │
│ ├─ Check email unique                                   │
│ ├─ Create CustomUser instance                           │
│ ├─ Generate JWT tokens (access + refresh)              │
│ └─ Return: { user, access, refresh }                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Response: 201 Created
                   ├─ { id, email, first_name, is_admin, ... }
                   ├─ { access: token }
                   ├─ { refresh: token }
                   │
┌──────────────────▼──────────────────────────────────────┐
│ Frontend: Registration Success                          │
│ ├─ localStorage.setItem('access_token', response.access)│
│ ├─ localStorage.setItem('refresh_token', response.refresh)
│ ├─ dispatch(setUser(response.user))                    │
│ ├─ dispatch(setAuthenticated(true))                    │
│ ├─ Navigate to dashboard (based on is_admin flag)      │
│ └─ Display "Welcome John!" message                     │
└─────────────────────────────────────────────────────────┘
```

**Frontend Implementation**:

```javascript
// src/redux/authSlice.js
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    accessToken: null,
    refreshToken: null
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setTokens: (state, action) => {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
    },
    // ... other reducers
  }
});

// src/redux/authActions.js
export const registerUser = (email, password, firstName, lastName) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await fetch('/api/v1/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        password2: password,
        first_name: firstName,
        last_name: lastName
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.email?.[0] || 'Registration failed');
    }

    const { user, access, refresh } = await response.json();
    
    // Store tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Update Redux
    dispatch(setUser(user));
    dispatch(setTokens({ access, refresh }));
    dispatch(setAuthenticated(true));
    
    // Redirect
    if (user.is_admin || user.is_instructor) {
      window.location.href = '/admin-dashboard';
    } else {
      window.location.href = '/student-dashboard';
    }
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};
```

### 2. Login (Existing User)

```
┌─────────────────────────────────────────────────────────┐
│ Frontend: Login Page                                    │
│ ┌───────────────────────────────────────────────────┐   │
│ │ Form: email, password                             │   │
│ │ Button: "Sign In"                                 │   │
│ └───────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ POST /api/v1/auth/login/
                   │ (Rate limited: 5/min per IP)
                   │
┌──────────────────▼──────────────────────────────────────┐
│ Backend: UserLoginView                                  │
│ ├─ Check email exists                                   │
│ ├─ Verify password with bcrypt                          │
│ ├─ Generate JWT tokens                                  │
│ └─ Return: { user, access, refresh }                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Response: 200 OK
                   │
┌──────────────────▼──────────────────────────────────────┐
│ Frontend: Login Handler                                 │
│ ├─ Store tokens in localStorage                         │
│ ├─ Fetch /api/v1/enrollments/my-courses/ (with token)  │
│ ├─ Fetch /api/v1/auth/users/getUsers/ (if admin)       │
│ ├─ Update Redux state                                   │
│ └─ Redirect to appropriate dashboard                    │
└─────────────────────────────────────────────────────────┘
```

### 3. Token Refresh (When Expired)

```
React Component
     │
     ├─ API returns 401 Unauthorized
     │
     ├─ API Interceptor detects 401
     │
     ├─ POST /api/v1/auth/jwt/refresh/
     │      { "refresh": "..." }
     │
     ├─ Backend validates refresh token
     │
     ├─ Backend returns new access token
     │
     ├─ Update localStorage['access_token']
     │
     ├─ Retry original request with new token
     │
     └─ Component receives response
```

**Implementation**:

```javascript
// src/utils/apiClient.js
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 and refresh token
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/jwt/refresh/`,
          { refresh: refreshToken }
        );
        
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Dashboard Integration

### Admin Dashboard Flow

```
┌─────────────────────────────────────┐
│ User navigates to /admin-dashboard  │
└─────────────────┬───────────────────┘
                  │
                  ├─ Check Redux.user.is_admin
                  │  (if false, redirect to /student-dashboard)
                  │
                  ├─ AdminDashboard component mounts
                  │  └─ useState for tab navigation
                  │  └─ Initialize Redux store
                  │
                  ├─ Load tab content based on URL params
                  │  tab=dash    → DashboardComponent
                  │  tab=users   → User Management Table
                  │  tab=courses → Course Management
                  │  etc.
                  │
                  └─ Each tab calls specific API endpoints
```

**DashboardComponent Integration**:

```javascript
// src/components/Admin/DashboardComponent.jsx
function DashboardComponent() {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.is_admin) {
      // Admin dashboard: Load platform-wide stats
      fetchAdminStats();
    } else if (user.is_instructor) {
      // Instructor dashboard: Load personal teaching stats
      fetchInstructorStats();
    }
  }, [user.is_admin, user.is_instructor]);

  const fetchAdminStats = async () => {
    try {
      const results = await Promise.all([
        apiClient.get('/auth/users/getUsers/?limit=1'),  // Get total count
        apiClient.get('/courses/?limit=1'),
        apiClient.get('/enrollments/?limit=1'),
        apiClient.get('/posts/?limit=1'),
        apiClient.get('/comments/getComments/?limit=1'),
        apiClient.get('/services/?limit=1'),
        apiClient.get('/payments/history/?limit=1')
      ]);

      const [users, courses, enrollments, posts, comments, services, payments] = results;

      setStats({
        totalUsers: users.data.totalUsers || 0,
        newUsersThisMonth: users.data.lastMonthUsers || 0,
        totalCourses: courses.data.count || 0,
        totalEnrollments: enrollments.data.count || 0,
        totalPosts: posts.data.count || 0,
        totalComments: comments.data.count || 0,
        totalServices: services.data.count || 0,
        totalRevenue: payments.data.count ? payments.data.results.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) : 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return <ErrorMessage message="Failed to load statistics" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard icon={HiOutlineUsers} label="Total Users" value={stats.totalUsers} />
      <StatCard icon={HiOutlineAcademicCap} label="Courses" value={stats.totalCourses} />
      <StatCard icon={HiOutlineUserGroup} label="Enrollments" value={stats.totalEnrollments} />
      <StatCard icon={HiOutlineCash} label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
      {/* More stat cards */}
    </div>
  );
}
```

### Student Dashboard Flow

```
┌─────────────────────────────────────────┐
│ User navigates to /dashboard            │
└──────────────────┬──────────────────────┘
                   │
                   ├─ Check if authenticated
                   │  (redirect to /login if not)
                   │
                   ├─ StudentDashboard mounts
                   │
                   ├─ Fetch enrolled courses
                   │  GET /api/v1/enrollments/my-courses/
                   │
┌──────────────────▼──────────────────────┐
│ Backend Response                        │
│ {                                       │
│   "results": [                          │
│     {                                   │
│       "id": 1,                          │
│       "course": {                       │
│         "id": 1,                        │
│         "title": "Python Basics",       │
│         "slug": "python-basics"         │
│       },                                │
│       "status": "active",               │
│       "progress": {                     │
│         "lessons_completed": 5,         │
│         "total_lessons": 45,            │
│         "completion_percentage": 11     │
│       }                                 │
│     }                                   │
│   ]                                     │
│ }                                       │
└──────────────────┬──────────────────────┘
                   │
                   ├─ Show course cards with progress bar
                   │
                   ├─ User clicks course card
                   │  └─ Fetch GET /api/v1/courses/{slug}/
                   │
                   ├─ Show course weeks/modules
                   │
                   ├─ User clicks week
                   │  └─ Show lessons in that week
                   │
                   ├─ User clicks lesson
                   │  └─ Show lesson content + video
                   │
                   ├─ User clicks "Mark Complete"
                   │  └─ POST /api/v1/lessons/{id}/complete/
                   │     └─ Update enrollment progress
                   │     └─ Show next lesson
                   │
                   └─ All state stored in Redux
                      enrollments.list = [...]
                      enrollments.selected = {...}
                      enrollments.selectedLesson = {...}
```

---

## Course Management

### Enroll in Course Flow

```
Frontend                                  Backend
┌─────────────────┐
│ Course Detail   │
│ Button: Enroll  │
└────────┬────────┘
         │
         │ POST /api/v1/enrollments/
         │ { "course_id": 1 }
         │
         │─────────────────────────────►┌──────────────────┐
         │                              │ Check if already │
         │                              │ enrolled         │
         │                              ├──────────────────┤
         │                              │ If not, create   │
         │                              │ Enrollment       │
         │                              │ + LessonCompletion
         │                              │ (tracking data)  │
         │                              └────────┬─────────┘
         │                                       │
         │◄──────────── 201 Created ────────────┤
         │ { id, course, status, progress }     │
         │
         ├─ Update Redux
         │  enrollments.list.push(enrollment)
         │
         └─ Show success message
            "Successfully enrolled!"
            Redirect to course
```

### Create Course (Instructor)

```
Instructor                                Backend
┌──────────────────┐
│ Create Course    │
│ Form:            │
│ - Title          │
│ - Description    │
│ - Price          │
│ - Category       │
│ - Image          │
└────────┬─────────┘
         │
         │ POST /api/v1/courses/
         │ {
         │   "title": "Advanced Python",
         │   "short_description": "...",
         │   "price": "99.99",
         │   "category": "specialized",
         │   ...
         │ }
         │
         │─────────────────────────────►┌──────────────────┐
         │                              │ Validate input   │
         │                              │ + Set instructor │
         │                              │ to current user  │
         │                              └────────┬─────────┘
         │
         │◄──────── 201 Created ───────────┤
         │ { id, slug, title, ... }       │
         │
         ├─ Update Redux
         │  courses.byId[id] = course
         │
         └─ Navigate to course editor
            Can add modules, lessons, etc.
```

---

## Enrollment & Progress

### Mark Lesson Complete

```
React Component (StudentDashboard)
     │
     ├─ User watches lesson video
     │
     ├─ User clicks "Mark as Complete" button
     │
     ├─ POST /api/v1/lessons/{lessonId}/complete/
     │
     ├─ Backend:
     │  ├─ Create LessonCompletion record
     │  ├─ Update Enrollment.progress
     │  │  ├─ lessons_completed += 1
     │  │  ├─ completion_percentage = (lessons_completed / total) * 100
     │  │  └─ last_accessed = now()
     │  │
     │  └─ Return updated enrollment
     │
     ├─ Frontend receives response
     │
     ├─ Update Redux
     │  enrollments[selected].progress = response.progress
     │
     ├─ Show success toast
     │  "Lesson complete! Next: [Lesson Title]"
     │
     ├─ Update UI:
     │  ├─ Progress bar increases
     │  ├─ Checkmark on lesson
     │  ├─ Show next lesson
     │
     └─ Auto-scroll to next uncompleted lesson
        (Or show "Course Complete!" if all done)
```

**Implementation**:

```javascript
// src/components/Student/StudentDashboard.jsx
const handleWeekComplete = async () => {
  try {
    setLoading(true);
    
    // Mark all lessons in week as complete
    const completionPromises = currentWeekLessons.map(lesson =>
      apiClient.post(`/lessons/${lesson.id}/complete/`)
    );
    
    const results = await Promise.all(completionPromises);
    
    // Get updated enrollment with new progress
    const enrollment = results[results.length - 1].data.enrollment;
    
    // Update Redux
    dispatch(updateEnrollment({
      enrollmentId: activeEnrollment.id,
      enrollment
    }));
    
    // Find next uncompleted week
    const nextWeek = weeks.find(w => !w.is_completed);
    if (nextWeek) {
      setActiveWeek(nextWeek);
      showToast(`Great! Move on to ${nextWeek.title}`);
    } else {
      showToast('Congratulations! Course complete! 🎉');
      // Show certificate option
    }
  } catch (error) {
    showError('Failed to mark complete');
  } finally {
    setLoading(false);
  }
};
```

---

## API Service Layer

### Centralized API Service

```javascript
// src/utils/api.js
import apiClient from './apiClient';

// Authentication
export const authService = {
  register: (email, password, firstName, lastName) =>
    apiClient.post('/auth/register/', {
      email,
      password,
      password2: password,
      first_name: firstName,
      last_name: lastName
    }),

  login: (email, password) =>
    apiClient.post('/auth/login/', { email, password }),

  logout: (refreshToken) =>
    apiClient.post('/auth/logout/', { refresh: refreshToken }),

  getProfile: () =>
    apiClient.get('/auth/profile/'),

  updateProfile: (data, file) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    if (file) formData.append('profile_picture', file);
    
    return apiClient.put('/auth/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Courses
export const courseService = {
  list: (params) =>
    apiClient.get('/courses/', { params }),

  get: (slugOrId) =>
    apiClient.get(`/courses/${slugOrId}/`),

  getWeeks: (courseId) =>
    apiClient.get(`/courses/${courseId}/weeks/`),

  create: (courseData) =>
    apiClient.post('/courses/', courseData),

  update: (courseId, courseData) =>
    apiClient.put(`/courses/${courseId}/`, courseData)
};

// Enrollments
export const enrollmentService = {
  myCourses: () =>
    apiClient.get('/enrollments/my-courses/'),

  enroll: (courseId) =>
    apiClient.post('/enrollments/', { course_id: courseId }),

  get: (enrollmentId) =>
    apiClient.get(`/enrollments/${enrollmentId}/`),

  updateStatus: (enrollmentId, status) =>
    apiClient.patch(`/enrollments/${enrollmentId}/`, { status })
};

// Lessons
export const lessonService = {
  get: (lessonId) =>
    apiClient.get(`/lessons/${lessonId}/`),

  complete: (lessonId) =>
    apiClient.post(`/lessons/${lessonId}/complete/`)
};

// Admin
export const adminService = {
  getUsers: (params) =>
    apiClient.get('/auth/users/getUsers/', { params }),

  deleteUser: (userId) =>
    apiClient.delete(`/auth/users/${userId}/deleteUser/`),

  updateUserRole: (userId, role) =>
    apiClient.patch(`/auth/users/${userId}/updateRole/`, {
      user_type: role
    })
};
```

---

## Redux State Management

### Auth State Slice

```javascript
// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../utils/api';

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password, firstName, lastName }, { rejectWithValue }) => {
    try {
      const response = await authService.register(email, password, firstName, lastName);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ... similar for loginUser
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

### Enrollments State Slice

```javascript
// src/redux/enrollmentSlice.js
const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState: {
    list: [],           // All enrollments
    selected: null,     // Currently viewing enrollment
    selectedCourse: null,
    selectedWeek: null,
    selectedLesson: null,
    loading: false,
    error: null
  },
  reducers: {
    selectEnrollment: (state, action) => {
      state.selected = action.payload;
    },
    selectCourse: (state, action) => {
      state.selectedCourse = action.payload;
    },
    selectWeek: (state, action) => {
      state.selectedWeek = action.payload;
    },
    selectLesson: (state, action) => {
      state.selectedLesson = action.payload;
    },
    updateEnrollment: (state, action) => {
      const index = state.list.findIndex(e => e.id === action.payload.enrollmentId);
      if (index !== -1) {
        state.list[index] = action.payload.enrollment;
        if (state.selected?.id === action.payload.enrollmentId) {
          state.selected = action.payload.enrollment;
        }
      }
    }
  }
});

export const { selectEnrollment, selectCourse, selectWeek, selectLesson, updateEnrollment } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
```

---

## Error Handling

### Global Error Boundary

```javascript
// src/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Log to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-8">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling

```javascript
// Handle different error types
const handleApiError = (error) => {
  if (!error.response) {
    // Network error
    return 'No internet connection. Check your network.';
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      // Validation errors
      if (typeof data === 'object') {
        return Object.values(data)
          .flat()
          .join(', ');
      }
      return data.message || 'Invalid input';

    case 401:
      // Unauthorized
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return 'Session expired. Please login again.';

    case 403:
      return 'You don\'t have permission for this action.';

    case 404:
      return 'Resource not found.';

    case 429:
      return 'Too many requests. Please wait before trying again.';

    case 500:
      return 'Server error. Our team has been notified.';

    default:
      return 'An unexpected error occurred.';
  }
};
```

---

## Performance Optimization

### Request Batching

```javascript
// Load multiple resources in parallel
async function loadDashboard() {
  const [enrollments, profile, stats] = await Promise.all([
    enrollmentService.myCourses(),
    authService.getProfile(),
    adminService.getStats()
  ]);

  dispatch(setEnrollments(enrollments));
  dispatch(setUser(profile));
  dispatch(setStats(stats));
}
```

### Pagination Implementation

```javascript
// src/hooks/usePaginatedFetch.js
function usePaginatedFetch(url, pageSize = 10) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchPage = async (pageNum) => {
    setLoading(true);
    try {
      const response = await apiClient.get(url, {
        params: { limit: pageSize, offset: (pageNum - 1) * pageSize }
      });
      setData(response.data.results);
      setHasMore(!!response.data.next);
    } finally {
      setLoading(false);
    }
  };

  return { data, page, setPage, hasMore, loading, fetchPage };
}
```

### Lazy Loading

```javascript
// Load courses on scroll
const { data, hasMore, fetchPage } = usePaginatedFetch('/courses/', 20);

useEffect(() => {
  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      if (hasMore) {
        fetchPage(page + 1);
      }
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [page, hasMore]);
```

---

## Deployment Checklist

- [ ] Set `API_BASE_URL` environment variable in frontend
- [ ] Configure CORS allowed origins in backend settings
- [ ] Set up HTTPS certificates
- [ ] Enable Django CSRF protection
- [ ] Configure secure cookies (SameSite, Secure, HttpOnly)
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging and monitoring
- [ ] Test token refresh flow
- [ ] Test file upload with Cloudinary
- [ ] Test all dashboard tabs
- [ ] Test enrollment and progress tracking
- [ ] Load test with multiple concurrent users

---

**Version**: 1.0  
**Last Updated**: February 2024  
**Status**: Production Ready
