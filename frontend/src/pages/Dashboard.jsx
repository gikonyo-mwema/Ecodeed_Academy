/**
 * Dashboard Router Page Component
 * 
 * Top-level router that directs users to their appropriate dashboard based on role.
 * This is the entry point for all dashboard access from `/dashboard` route.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ROUTING LOGIC
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * The routing decision is made based on user role flags:
 * 
 * 1. NOT AUTHENTICATED → Show "Please sign in" message
 *    Condition: currentUser is null/undefined
 *    Prevents unauthorized dashboard access
 * 
 * 2. ADMIN or INSTRUCTOR → Show AdminDashboard
 *    Condition: currentUser.isAdmin === true OR currentUser.isInstructor === true
 *    Both roles share the same dashboard component
 *    Role-based sidebar gating determines what tabs each role sees
 *    Note: A user can be both admin AND instructor
 * 
 * 3. REGULAR STUDENT → Show StudentDashboard
 *    Condition: currentUser is authenticated but has no admin/instructor roles
 *    Provides learning-focused interface for course progress tracking
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * COMPONENT HIERARCHY
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * /pages/Dashboard.jsx (THIS FILE)
 *   ├─ currentUser is null → Auth error
 *   ├─ currentUser.isAdmin || currentUser.isInstructor → AdminDashboard
 *   │  ├─ DashSidebar (role-aware navigation)
 *   │  └─ [Tab-specific component from tab query param]
 *   │     ├─ DashboardComponent (overview)
 *   │     ├─ DashCourses / DashEnrollments (courses)
 *   │     ├─ DashUsers / DashPosts / etc (admin-only)
 *   │     └─ MyStudents / MyEarnings (instructor-only)
 *   │
 *   └─ currentUser has enrollments → StudentDashboard (student view)
 *      ├─ StudentSidebar (course navigation)
 *      └─ [Dynamic content based on view]
 *         ├─ EnrolledCourses (my courses list)
 *         ├─ CourseWeeksView (weeks structure)
 *         ├─ WeekLessonView (lesson content)
 *         └─ DashProfile (settings)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * AUTHENTICATION STATE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * currentUser object (from Redux user state):
 * {
 *   id: number,
 *   username: string,
 *   email: string,
 *   isAdmin: boolean,        // Admin permission flag
 *   isInstructor: boolean,   // Instructor permission flag
 *   hasEnrollments: boolean, // Student enrollment flag
 *   ... other user fields
 * }
 * 
 * NOTE: A user can have multiple roles simultaneously
 * - Admin user can also be an instructor (teach courses)
 * - Instructor user can also be a student (take courses)
 * - The route /dashboard?tab=... param determines which dashboard renders
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ROUTE NAVIGATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * From Header component menu:
 * - Student Dashboard button → /dashboard?tab=learning (shown if hasEnrollments)
 * - Instructor Dashboard button → /dashboard (shown if isInstructor)
 * - Admin Dashboard button → /dashboard (shown if isAdmin)
 * 
 * From app navigation:
 * - Direct navigation to /dashboard goes to appropriate dashboard
 * - Users can also share/bookmark specific tabs: /dashboard?tab=courses
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 * @example
 * // In App.jsx router:
 * <Route path="/dashboard" element={<Dashboard />} />
 * 
 * // Direct navigation:
 * navigate('/dashboard');
 * 
 * // Navigation to specific tab:
 * navigate('/dashboard?tab=courses');
 */

import React from 'react';
import { useSelector } from 'react-redux';
import AdminDashboard from '../components/Admin/AdminDashboard';
import StudentDashboard from '../components/Student/StudentDashboard';

export default function Dashboard() {
  const { currentUser } = useSelector((state) => state.user);

  /**
   * ROUTE DECISION LOGIC
   * Checks authentication and role to determine which dashboard to show
   */

  // No authentication — show sign-in prompt
  if (!currentUser) {
    return (
      <div className='min-h-screen flex items-center justify-center text-xl text-gray-500'>
        Please sign in to access your dashboard.
      </div>
    );
  }

  /**
   * ADMIN & INSTRUCTOR DASHBOARD
   * Both roles share the same dashboard component
   * Role-based sidebar and content gating in AdminDashboard determines visibility
   * 
   * Condition: User is either admin OR instructor (or both)
   */
  if (currentUser.isAdmin || currentUser.isInstructor) {
    return <AdminDashboard />;
  }

  /**
   * STUDENT DASHBOARD
   * Shown to regular authenticated users without admin/instructor roles
   * Provides learning-focused interface for course progress and content
   * 
   * Note: Students can still be admins/instructors — the above condition catches them first
   */
  return <StudentDashboard />;
}
