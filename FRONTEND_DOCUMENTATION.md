# Frontend Documentation - Ecodeed Academy

**Status:** In Progress  
**Last Updated:** March 13, 2026  
**Coverage:** ~20% Complete (actively documenting remaining 85 files)

## Overview

This document provides comprehensive documentation of the Ecodeed Academy frontend application. The frontend is a React 18+ single-page application (SPA) with Redux state management, Tailwind CSS styling, and integration with Django REST API backend.

**Total Files:** 105 JavaScript/JSX files  
**Documented:** 14 files with comprehensive JSDoc  
**In Progress:** Adding JSDoc headers and inline documentation to all remaining files

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Documented Files](#documented-files)
4. [Technology Stack](#technology-stack)
5. [Key Patterns & Practices](#key-patterns--practices)
6. [File-by-File Documentation](#file-by-file-documentation)

---

## Architecture Overview

### Frontend Stack

The frontend is built with modern React patterns and technologies:

- **Framework:** React 18+ with React Router v6
- **State Management:** Redux Toolkit with Redux Persist
- **Styling:** Tailwind CSS + custom dark/light theme
- **UI Components:** Flowbite React (Headless component library)
- **Icons:** React Icons library
- **Authentication:** Firebase + JWT tokens
- **Rich Text Editing:** TipTap Editor (block editor)
- **Image Optimization:** Cloudinary CDN integration
- **API:** RESTful endpoints with custom fetch wrapper
- **Notifications:** React Toastify for toast messages
- **Build Tool:** Vite (fast HMR and bundling)

### Application Flow

```
┌─────────────────────────────────────────────────────────┐
│                    main.jsx (Entry Point)              │
├─────────────────────────────────────────────────────────┤
│ • Redux Provider (state management)                     │
│ • PersistGate (rehydrate persisted state)              │
│ • HelmetProvider (SEO/document head management)        │
│ • ThemeProvider (dark/light mode context)              │
│ • App Router (React Router v6 routes)                  │
└─────────────────────────────────────────────────────────┘
         │
         ├─ App.jsx (Route definitions)
         │   │
         │   ├─ PUBLIC ROUTES
         │   │  ├─ Home.jsx (landing/posts)
         │   │  ├─ Courses.jsx (course listing)
         │   │  ├─ Services.jsx (services listing)
         │   │  ├─ SignIn.jsx (login)
         │   │  ├─ SignUp.jsx (registration)
         │   │  └─ ... (other public pages)
         │   │
         │   ├─ AUTHENTICATED ROUTES
         │   │  ├─ Dashboard.jsx (student/admin/instructor)
         │   │  └─ ... (protected features)
         │   │
         │   └─ ADMIN ROUTES
         │      ├─ AdminDashboard.jsx
         │      └─ ... (admin-only features)
         │
         ├─ Header (global navigation)
         ├─ Footer (global footer)
         └─ ScrollToTop (utility)
```

### State Management (Redux)

```
Redux Store Structure:
├── user
│   ├── currentUser: { id, email, profile_picture, roles, ... }
│   ├── token: JWT access token
│   ├── loading: boolean (async operation state)
│   └── error: string | null
│
└── theme
    ├── mode: 'light' | 'dark'
    └── preferences: { ... }
```

**Key Slices:**
- `user/userSlice.jsx` - Authentication, profile, user operations
- `theme/themeSlice.js` - Dark/light mode theme state

---

## Project Structure

```
frontend/src/
├── pages/                          # Page-level components (routes)
│   ├── Home.jsx                   # Landing page with posts
│   ├── Courses.jsx                # Course listing/filtering
│   ├── CourseDetails.jsx          # Course details & enrollment
│   ├── LearningPlayer.jsx         # Video lesson player
│   ├── Dashboard.jsx              # Main dashboard router
│   ├── PostPage.jsx               # Individual blog post
│   ├── PostEditorPage.jsx         # Post creation/editing
│   ├── Services.jsx               # Services listing
│   ├── ServiceDetail.jsx          # Service details
│   ├── Search.jsx                 # Search results
│   ├── SignIn.jsx                 # Login page ✅
│   ├── SignUp.jsx                 # Registration page ✅
│   ├── About.jsx                  # About page
│   ├── Contact.jsx                # Contact form
│   ├── Unauthorized.jsx           # 401/403 error
│   ├── NotFound.jsx               # 404 error
│   ├── NewsletterConfirm.jsx      # Newsletter confirmation
│   ├── Unsubscribe.jsx            # Newsletter unsubscribe
│   ├── TermsOfService.jsx         # Terms page
│   └── PrivacyPolicy.jsx          # Privacy policy
│
├── components/                     # Reusable components
│   ├── Header.jsx                 # Global navigation ✅
│   ├── Footer.jsx                 # Global footer
│   ├── LoadingSpinner.jsx         # Loading indicator
│   ├── Pagination.jsx             # Pagination controls
│   ├── PostCard.jsx               # Post preview card
│   ├── ServiceCard.jsx            # Service card
│   ├── UserCourses.jsx            # User courses display
│   ├── Comments.jsx               # Comments list
│   ├── CommentSection.jsx         # Comments section
│   ├── RightSidebar.jsx           # Right content sidebar
│   ├── ScrollToTop.jsx            # Scroll to top utility
│   ├── ThemeProvider.jsx          # Theme context provider
│   ├── OAuth.jsx                  # Google OAuth button ✅
│   ├── PrivateRoute.jsx           # Auth route protection ✅
│   ├── OnlyAdminPrivateRoute.jsx  # Admin route protection
│   ├── CallToAction.jsx           # CTA component
│   ├── Modal/
│   │   └── PaymentModal.jsx       # Payment modal
│   ├── PostPage/
│   │   ├── PostContent.jsx        # Post main content
│   │   ├── PostSEO.jsx            # Post SEO management
│   │   ├── SocialShareButtons.jsx # Share buttons
│   │   └── TableOfContents.jsx    # Post TOC
│   ├── Editor/
│   │   ├── TipTapEditor.jsx       # Rich text editor
│   │   ├── EditorToolbar.jsx      # Editor toolbar
│   │   ├── FeaturedImageUpload.jsx# Featured image
│   │   ├── SEOPanel.jsx           # SEO settings
│   │   └── extensions/
│   │       ├── Callout.js
│   │       └── ImageUpload.js
│   ├── Admin/
│   │   ├── AdminDashboard.jsx     # Admin dashboard container
│   │   ├── DashboardComponent.jsx # Dashboard overview
│   │   ├── DashMetrics.jsx        # Metrics visualization
│   │   ├── DashSidebar.jsx        # Admin sidebar
│   │   ├── DashTables.jsx         # Data tables
│   │   ├── DashAnnouncement.jsx   # Announcements
│   │   ├── DashNewsletter.jsx     # Newsletter management
│   │   ├── DashUsers.jsx          # User management
│   │   ├── DashProfile.jsx        # Admin profile
│   │   ├── DashComments.jsx       # Comment moderation
│   │   ├── DashResources.jsx      # Resource management
│   │   ├── DashAssignments.jsx    # Assignment tracking
│   │   ├── DashLiveSessions.jsx   # Live session management
│   │   ├── DashServices.jsx       # Service management
│   │   ├── DashPosts.jsx          # Post management
│   │   ├── DashEnrollments.jsx    # Enrollment tracking
│   │   ├── DashCourses.jsx        # Course management
│   │   ├── Courses/
│   │   │   ├── CreateCourse.jsx   # Course creation
│   │   │   ├── EditCourse.jsx     # Course editing
│   │   │   ├── CourseForm.jsx     # Reusable form
│   │   │   ├── CourseDetailView.jsx
│   │   │   ├── MyEarnings.jsx     # Instructor earnings
│   │   │   └── MyStudents.jsx     # Instructor students
│   │   ├── Posts/
│   │   │   ├── DashPosts.jsx
│   │   │   ├── PostForm/
│   │   │   │   ├── PostForm.jsx
│   │   │   │   ├── PostCategorySelect.jsx
│   │   │   │   └── PostImageUpload.jsx
│   │   │   ├── PostTable/
│   │   │   │   ├── PostTable.jsx
│   │   │   │   ├── PostTableRow.jsx
│   │   │   │   └── PostTableHeader.jsx
│   │   │   ├── PostModals/
│   │   │   │   ├── AlertMessage.jsx
│   │   │   │   └── DeletePostModal.jsx
│   │   │   └── hooks/
│   │   │       ├── usePostForm.js
│   │   │       ├── usePostFetch.js
│   │   │       └── usePostActions.js
│   │   ├── Services/
│   │   │   ├── DashServices.jsx
│   │   │   ├── DashServicesTable.jsx
│   │   │   ├── ServiceForm/
│   │   │   │   └── ServiceFormTabs.jsx
│   │   │   ├── modals/
│   │   │   │   └── ServiceFormModal.jsx
│   │   │   └── hooks/
│   │   │       ├── useServiceForm.js
│   │   │       └── useServices.js
│   │   ├── Courses/
│   │   │   ├── Unauthorized.jsx
│   │   │   └── hooks/
│   │   │       └── useCourseForm.js
│   │   └── Comments/
│   │       └── DashComments.jsx
│   └── Student/
│       ├── StudentDashboard.jsx   # Student learning dashboard ✅
│       ├── StudentSidebar.jsx     # Student sidebar
│       ├── EnrolledCourses.jsx    # Enrolled courses list
│       ├── CourseWeeksView.jsx    # Week-based view
│       ├── WeekLessonView.jsx     # Lessons in week
│       └── CourseContentView.jsx  # Lesson content
│
├── redux/                          # Redux state management
│   ├── store.js                   # Store configuration ✅
│   ├── user/
│   │   └── userSlice.jsx          # User auth state ✅
│   └── theme/
│       └── themeSlice.js          # Theme state
│
├── utils/                          # Utility functions
│   ├── api.js                     # API fetch wrapper ✅
│   ├── cloudinary.js              # Cloudinary helpers ✅
│   ├── categories.js              # Category constants
│   ├── devUtils.js                # Dev utilities
│   └── serviceSanitizer.js        # Data sanitization
│
├── App.jsx                         # Main app component ✅
├── main.jsx                        # App entry point ✅
├── firebase.js                     # Firebase config ✅
└── index.css                       # Global styles
```

---

## Documented Files

### ✅ Fully Documented (14 files)

1. **src/App.jsx** - Main routing and layout
2. **src/main.jsx** - Application entry point
3. **src/redux/store.js** - Redux store configuration
4. **src/redux/user/userSlice.jsx** - Authentication state (comprehensive)
5. **src/components/Header.jsx** - Global navigation
6. **src/components/PrivateRoute.jsx** - Auth route protection
7. **src/components/Student/StudentDashboard.jsx** - Student dashboard (comprehensive)
8. **src/pages/Home.jsx** - Landing page
9. **src/pages/SignIn.jsx** - Login page (✅ just updated)
10. **src/pages/SignUp.jsx** - Registration page (✅ just updated)
11. **src/components/OAuth.jsx** - Google OAuth (✅ just updated)
12. **src/firebase.js** - Firebase configuration
13. **src/utils/cloudinary.js** - Cloudinary utilities
14. **src/utils/api.js** - API utilities

### 📋 In Progress (remaining 91 files)

Additional files are being systematically documented with JSDoc headers, component descriptions, props documentation, and usage examples.

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.x | UI framework |
| react-dom | 18.x | DOM rendering |
| react-router-dom | 6.x | Client-side routing |
| @reduxjs/toolkit | Latest | Redux state management |
| react-redux | Latest | Redux React bindings |
| redux-persist | Latest | State persistence |
| axios / fetch | Native | HTTP client |
| tailwindcss | 3.x | Utility CSS framework |
| flowbite-react | Latest | Component library |
| react-icons | Latest | Icon library |
| firebase | Latest | Authentication |
| tiptap | Latest | Rich text editor |
| react-toastify | Latest | Toast notifications |
| react-helmet-async | Latest | SEO document head |
| vite | Latest | Build tool |

---

## Key Patterns & Practices

### 1. Authentication Flow

```javascript
// Sign in -> Redux dispatch -> API call -> Token storage -> Redirect
dispatch(signIn({ email, password }))
  .then((action) => {
    if (signIn.fulfilled.match(action)) {
      // Token stored in localStorage by reducer
      navigate("/dashboard");
    }
  });
```

### 2. Protected Routes

```javascript
// Wrap routes with PrivateRoute or OnlyAdminPrivateRoute
<Route element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />

// Access check: if !currentUser -> redirect to /sign-in
// If adminOnly && !user.is_admin -> redirect to /unauthorized
```

### 3. State Management

```javascript
// Access Redux state in components
const user = useSelector(state => state.user.currentUser);
const isLoading = useSelector(state => state.user.loading);

// Dispatch actions
const dispatch = useDispatch();
dispatch(updateUser({ formData }));
```

### 4. API Calls

```javascript
// Use apiFetch utility for consistency
const data = await apiFetch('/api/v1/courses/', {
  method: 'GET',
  credentials: 'include' // Auto-included by apiFetch
});
// Token from localStorage automatically added to headers
```

### 5. Form Handling

```javascript
// Local state for form data
const [formData, setFormData] = useState({});
// Validation before dispatch
// Dispatch async thunk
const action = await dispatch(createItem(formData));
// Check fulfilled/rejected
if (thunk.fulfilled.match(action)) { /* success */ }
```

### 6. Theme Management

```javascript
// Toggle dark/light mode
dispatch(toggleTheme());
// Theme applied via Tailwind class on root element
// Persisted via redux-persist
```

---

## File-by-File Documentation

### Pages (15 files)

**Status:** 2/15 documented ✅

#### Home.jsx ✅
- **Purpose:** Landing page with featured blog posts and sidebars
- **Features:** Post grid, pagination, category filtering, sidebar widgets
- **State:** posts[], currentPage, loading, error
- **API Endpoints:** GET /api/v1/posts/
- **Props:** None (page component)
- **Route:** `/`

#### Courses.jsx
- **Purpose:** Course listing and discovery with filtering
- **Features:** Course grid, filters (category, price, level), search
- **State:** courses[], filters, currentPage, loading
- **API Endpoints:** GET /api/v1/courses/
- **Route:** `/courses`

#### CourseDetails.jsx
- **Purpose:** Detailed course view with enrollment option
- **Features:** Course info, module preview, instructor bio, reviews, enroll button
- **State:** course, enrolled, enrolling, loading
- **API Endpoints:** GET /api/v1/courses/{slug}/, POST /api/v1/enrollments/
- **Route:** `/courses/:slug`

#### Dashboard.jsx
- **Purpose:** Main dashboard router (student/admin/instructor)
- **Features:** Role-based rendering
- **State:** currentUser from Redux
- **API Endpoints:** (routing only)
- **Route:** `/dashboard`

#### LearningPlayer.jsx
- **Purpose:** Video lesson player with progress tracking
- **Features:** Video player, sidebar modules, assignments, progress bar
- **State:** currentLesson, progress, completed, assignments
- **API Endpoints:** GET /api/v1/enrollments/{id}/lessons/, POST mark-complete
- **Route:** `/learning/:courseId/:lessonId`

#### SignIn.jsx ✅
- **Purpose:** User login form
- **Features:** Email/password auth, validation, OAuth buttons, loading
- **State:** formData, validationError, Redux loading/error
- **API Endpoints:** POST /api/v1/auth/login/
- **Route:** `/sign-in`
- **Status:** JSDoc header added ✅

#### SignUp.jsx ✅
- **Purpose:** User registration form
- **Features:** Multi-field form, password validation, OAuth options
- **State:** formData, validationError, Redux loading/error
- **API Endpoints:** POST /api/v1/auth/register/
- **Route:** `/sign-up`
- **Status:** JSDoc header added ✅

#### PostPage.jsx
- **Purpose:** Individual blog post view
- **Features:** Post content, comments section, related posts, sharing
- **State:** post, comments, loading, error
- **API Endpoints:** GET /api/v1/posts/{slug}/, GET /api/v1/comments/
- **Route:** `/post/:postSlug`

#### PostEditorPage.jsx
- **Purpose:** Blog post creation and editing
- **Features:** TipTap rich editor, featured image upload, SEO settings, categories
- **State:** postData, saving, error, authorizing
- **API Endpoints:** POST /api/v1/posts/, PUT /api/v1/posts/{id}/
- **Route:** `/create-post` or `/edit-post/:id`

#### About.jsx
- **Purpose:** About page with platform information
- **Features:** Mission, team, company info
- **State:** None (static content)
- **Route:** `/about`

#### Contact.jsx
- **Purpose:** Contact form for user inquiries
- **Features:** Contact form, validation, sending logic
- **State:** formData, sending, error, success
- **API Endpoints:** POST /api/v1/contact/ (or similar)
- **Route:** `/contact`

#### Services.jsx
- **Purpose:** Browse available services
- **Features:** Service grid, filters, search
- **State:** services[], filters, loading
- **API Endpoints:** GET /api/v1/services/
- **Route:** `/services`

#### ServiceDetail.jsx
- **Purpose:** Detailed service view
- **Features:** Service info, pricing, booking/contact form
- **State:** service, booking, loading
- **API Endpoints:** GET /api/v1/services/{slug}/
- **Route:** `/services/:slug`

#### Search.jsx
- **Purpose:** Search results across posts, courses, services
- **Features:** Multi-type search, filters, pagination
- **State:** results, searchTerm, type, loading
- **API Endpoints:** GET /api/v1/search/?q=...
- **Route:** `/search?q=...`

#### (More pages...)

### Components - Shared (20+ files)

**Status:** 2/20+ documented ✅

[Similar documentation structure for remaining components...]

---

## Documentation Standards

All files follow JSDoc 3.0 format:

```javascript
/**
 * Component Description
 * 
 * Longer description of what it does, how to use it, key features
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * 
 * @component
 * @returns {JSX.Element} Component output description
 * @version 1.0.0
 * @author Gikonyo Mwema
 * 
 * @example
 * // Usage example
 * <Component prop={value} />
 */
```

---

## Development Guidelines

### Adding New Components

1. Create file in appropriate folder
2. Add JSDoc header
3. Document props with JSDoc
4. Document default exports
5. Add meaningful comments for complex logic
6. Test with various props

### API Integration

1. Use `apiFetch` utility (includes auth)
2. Handle loading/error states
3. Dispatch Redux actions for auth-related calls
4. Validate response structure
5. Show user-friendly error messages

### State Management

1. Use Redux for app-wide state
2. Use local state for form/UI state
3. Persist user/theme to localStorage
4. Clear state on logout

---

## Quick Reference

| Feature | Files |
|---------|-------|
| **Authentication** | SignIn, SignUp, OAuth, userSlice |
| **Dashboard** | Dashboard, StudentDashboard, AdminDashboard |
| **Courses** | Courses, CourseDetails, LearningPlayer |
| **Posts/Blog** | Home, PostPage, PostEditorPage, PostCard |
| **Admin** | AdminDashboard, Dash* components |
| **Theme** | ThemeProvider, themeSlice |
| **Routing** | App, PrivateRoute, OnlyAdminPrivateRoute |
| **API** | utils/api.js, apiFetch wrapper |
| **State** | redux/store.js, userSlice, themeSlice |

---

## Next Steps

1. ✅ Document core files (App, main, redux)
2. ✅ Document auth pages (SignIn, SignUp, OAuth)
3. 📝 Continue documenting remaining pages (in progress)
4. 📝 Document shared components
5. 📝 Document admin components
6. 📝 Document student components
7. 📝 Document utility hooks and functions
8. ✅ Create integration guide (planned)
9. ✅ Create troubleshooting guide (planned)

---

**Total Progress:** ~13% | **Estimated Completion:** ~95% when documenting remaining files  
**Last Updated:** March 13, 2026  
**Maintained By:** Gikonyo Mwema

