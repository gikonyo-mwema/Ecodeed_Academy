# Dashboard Components - Quick Reference Guide

## Dashboard Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    /pages/Dashboard.jsx                      │
│              (Entry point - Role-based router)               │
│  Authentication Check → Routes to Admin or Student Dashboard │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ↓                     ↓
    ┌─────────────┐      ┌──────────────┐
    │   ADMIN     │      │   STUDENT    │
    │  DASHBOARD  │      │  DASHBOARD   │
    └─────────────┘      └──────────────┘
```

---

## Component Quick Links

### Student Dashboard Stack
| Component | Purpose | Location |
|-----------|---------|----------|
| StudentDashboard | Main student dashboard container | `components/Student/StudentDashboard.jsx` |
| StudentSidebar | Course navigation sidebar | `components/Student/StudentSidebar.jsx` |
| EnrolledCourses | List view of enrolled courses | `components/Student/EnrolledCourses.jsx` |
| CourseWeeksView | Course curriculum breakdown | `components/Student/CourseWeeksView.jsx` |
| WeekLessonView | Individual lesson viewer | `components/Student/WeekLessonView.jsx` |
| CourseContentView | Course overview and other sections | `components/Student/CourseContentView.jsx` |

### Admin Dashboard Stack
| Component | Purpose | Location | Visibility |
|-----------|---------|----------|------------|
| AdminDashboard | Main admin dashboard container | `components/Admin/AdminDashboard.jsx` | Both |
| DashSidebar | Role-aware navigation | `components/Admin/DashSidebar.jsx` | Both |
| DashboardComponent | Statistics overview | `components/Admin/DashboardComponent.jsx` | Both |
| DashCourses | Course management | `components/Admin/Courses/DashCourses.jsx` | Both |
| DashEnrollments | Enrollment tracking | `components/Admin/Courses/DashEnrollments.jsx` | Both |
| DashUsers | User management | `components/Admin/Users/DashUsers.jsx` | Admin Only |
| DashPosts | Post moderation | `components/Admin/Posts/DashPosts.jsx` | Admin Only |
| DashComments | Comment moderation | `components/Admin/Comments/DashComments.jsx` | Admin Only |
| DashNewsletter | Newsletter management | `components/Admin/DashNewsletter.jsx` | Admin Only |
| DashAnnouncement | Platform announcements | `components/Admin/DashAnnouncement.jsx` | Admin Only |
| DashServices | Service management | `components/Admin/Services/DashServices.jsx` | Admin Only |
| MyStudents | Student roster | `components/Admin/Courses/MyStudents.jsx` | Instructor Only |
| MyEarnings | Revenue tracking | `components/Admin/Courses/MyEarnings.jsx` | Instructor Only |

---

## State Management Guide

### StudentDashboard State
```javascript
// Course Selection
const [enrolledCourses, setEnrolledCourses] = useState([])
const [activeCourse, setActiveCourse] = useState(null)

// Week/Lesson Navigation
const [activeWeek, setActiveWeek] = useState(null)
const [activeLessonId, setActiveLessonId] = useState(null)
const [weekSection, setWeekSection] = useState('lessons')
// weekSection values: 'lessons', 'assignments', 'resources', 'live-session'

// UI State
const [tab, setTab] = useState('my-courses')
const [loading, setLoading] = useState(true)
```

### AdminDashboard State
```javascript
// Navigation
const [tab, setTab] = useState('dash')
// tab values: 'dash', 'profile', 'courses', 'enrollments', 'users', 
//             'posts', 'comments', 'newsletter', 'announcement', 'services',
//             'my-students', 'my-earnings'
```

### DashSidebar State
```javascript
// Responsive UI
const [collapsed, setCollapsed] = useState(false)  // Desktop collapse
const [mobileOpen, setMobileOpen] = useState(false) // Mobile drawer
const [tab, setTab] = useState("")                  // Active tab
```

---

## API Endpoints Cheat Sheet

### Student Endpoints
```bash
GET /api/v1/enrollments/my-courses/
# Returns: Student's enrolled courses with progress

GET /api/v1/courses/{courseId}/weeks/
# Returns: Course weeks structure with lessons
```

### Admin Endpoints
```bash
GET /api/v1/auth/users/getUsers
# Returns: List of users

GET /api/v1/posts/
# Returns: List of posts

GET /api/v1/comments/getComments
# Returns: List of comments

GET /api/v1/services/
# Returns: Services data

GET /api/v1/courses/
# Returns: All courses

GET /api/v1/payments/history/
# Returns: Payment transactions

GET /api/v1/enrollments/
# Returns: All enrollments
```

### Instructor Endpoints
```bash
GET /api/v1/courses/my-taught-courses/
# Returns: Courses taught by this instructor

GET /api/v1/enrollments/
# Returns: Enrollments (filtered by instructor's courses)
```

---

## Navigation Examples

### From Header to Dashboard
```javascript
// Student Dashboard
<Link to="/dashboard?tab=learning">Student Dashboard</Link>

// Instructor Dashboard
<Link to="/dashboard">Instructor Dashboard</Link>

// Admin Dashboard
<Link to="/dashboard">Admin Dashboard</Link>
```

### Within Dashboard
```javascript
// Navigate to specific tab
navigate(`/dashboard?tab=courses`)

// Deep link to tab
window.location.href = '/dashboard?tab=users'

// From sidebar click
handleTabClick('posts') // → /dashboard?tab=posts
```

### Within Student Dashboard
```javascript
// Select course
handleCourseSelect(course) 
// → /dashboard?tab=course-{id}-weeks

// Select week
handleWeekSelect(week, weeksData)
// → Shows week content

// Back to courses
navigate('/dashboard?tab=my-courses')
```

---

## Role Permissions Matrix

| Feature | Admin | Instructor | Student |
|---------|-------|-----------|---------|
| View Overview | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Moderate Posts | ✅ | ❌ | ❌ |
| Moderate Comments | ✅ | ❌ | ❌ |
| Send Newsletter | ✅ | ❌ | ❌ |
| Create Announcements | ✅ | ❌ | ❌ |
| View All Courses | ✅ | ❌ | ❌ |
| View All Enrollments | ✅ | ❌ | ❌ |
| View My Courses | ✅ | ✅ | ❌ |
| Manage My Courses | ✅ | ✅ | ❌ |
| View My Students | ✅ | ✅ | ❌ |
| View My Earnings | ✅ | ✅ | ❌ |
| View Enrolled Courses | ❌ | ❌ | ✅ |
| Track Progress | ❌ | ❌ | ✅ |
| Complete Lessons | ❌ | ❌ | ✅ |

---

## Common Tasks

### Task: Navigate to User Management
```javascript
// In component
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()

// Navigate
navigate('/dashboard?tab=users')
```

### Task: Add New Course (Instructor)
```javascript
// Click on "My Courses" in sidebar
// Sidebar shows: /dashboard?tab=courses
// DashCourses component renders with create button
```

### Task: Enroll in Course (Student)
```javascript
// From course details page
// Click "Enroll"
// Redirect to: /dashboard?tab=learning
// StudentDashboard automatically loads new enrollment
```

### Task: Check Student Progress (Admin)
```javascript
// Navigate to: /dashboard?tab=enrollments
// DashEnrollments shows all enrollments with progress
// Click student to view details
```

---

## Debugging Guide

### Issue: Dashboard shows "No permission"
**Cause**: User doesn't have required role
**Check**: `currentUser.isAdmin` or `currentUser.isInstructor` in Redux state

### Issue: Sidebar not showing instructor items
**Cause**: `currentUser.isInstructor === false`
**Check**: User role in database and Redux state

### Issue: Wrong tab content showing
**Cause**: URL tab parameter doesn't match any component
**Check**: Verify tab name in URL matches tab ID in tabs array

### Issue: Mobile sidebar won't close
**Cause**: Window width not being checked properly
**Check**: Ensure window.innerWidth < 768 condition in toggleSidebar

### Issue: Courses not loading
**Cause**: API request failed
**Check**: 
- Network tab for API errors
- Console for error messages
- User authentication status
- API endpoint availability

---

## Performance Tips

1. **Lazy Load Components**: Use React.lazy() for admin-only sections
2. **Pagination**: Don't load all users/posts at once
3. **Memoization**: Use useMemo for computed values
4. **Debounce**: Debounce search/filter inputs
5. **Caching**: Cache enrollment data in Redux
6. **Code Splitting**: Split large tabs into separate bundles

---

## Testing Checklist

### Student Dashboard
- [ ] Can view enrolled courses
- [ ] Can select course and view weeks
- [ ] Can select week and view lessons
- [ ] Can complete lessons and auto-advance
- [ ] Can navigate back through content
- [ ] Profile page loads correctly
- [ ] Mobile sidebar works
- [ ] URL parameters persist on reload

### Admin Dashboard
- [ ] Overview shows correct KPIs
- [ ] All tabs load without errors
- [ ] Admin-only tabs hidden from instructors
- [ ] Sidebar collapse works on desktop
- [ ] Mobile sidebar opens/closes
- [ ] Sign out works correctly
- [ ] Deep links to tabs work
- [ ] Role labels show correctly

### Navigation
- [ ] All links navigate correctly
- [ ] Browser back button works
- [ ] Bookmarkable URLs work
- [ ] Query parameters persist
- [ ] Sign-in redirect works

---

## Common Error Messages

```
"You do not have permission to view this page."
└─ Solution: Check user role and redirect to appropriate dashboard

"Failed to load overview data."
└─ Solution: Check API endpoint availability and network

"Please sign in to access your dashboard."
└─ Solution: Ensure user is authenticated before accessing /dashboard

"Failed to load [type]:"
└─ Solution: Check specific API endpoint for that data type
```

---

## File Size Summary

| File | Size | Complexity |
|------|------|-----------|
| StudentDashboard.jsx | ~10KB | High |
| AdminDashboard.jsx | ~2KB | Medium |
| DashboardComponent.jsx | ~8KB | Medium |
| DashSidebar.jsx | ~7KB | Medium |
| Dashboard.jsx | <1KB | Low |

---

## Related Documentation

📄 **Main Documentation**: [DASHBOARD_DOCUMENTATION.md](./DASHBOARD_DOCUMENTATION.md)
📄 **Backend API Docs**: (Backend documentation)
📄 **Component Library**: (Flowbite-React components used)
📄 **Redux Store Structure**: (User state management)

---

**Last Updated**: March 2026
**Author**: Gikonyo Mwema
**Version**: 2.0.0
