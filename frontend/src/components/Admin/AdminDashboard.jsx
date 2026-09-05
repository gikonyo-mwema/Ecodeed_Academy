/**
 * Admin Dashboard Component
 * 
 * Role-aware admin/instructor management dashboard that serves as the main hub for
 * platform administrators and course instructors.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ROLE-BASED ACCESS & VISIBILITY
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * ADMIN Users see:
 * ├─ Overview: Platform-wide KPIs (total users, courses, enrollments, revenue)
 * ├─ Profile: Account settings
 * ├─ Courses: All courses on platform with bulk management
 * ├─ Users: User management and role assignment
 * ├─ Posts: Content moderation
 * ├─ Comments: Discussion moderation
 * ├─ Newsletter: Bulk communications
 * ├─ Announcements: Platform-wide announcements
 * └─ Services: Platform services management
 * 
 * INSTRUCTOR Users see:
 * ├─ Overview: Personal teaching metrics (my courses, students, revenue)
 * ├─ Profile: Account settings
 * ├─ My Courses: Courses taught by this instructor
 * ├─ My Students: All students across instructor's courses
 * └─ My Earnings: Revenue tracking
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * LAYOUT & NAVIGATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Two-Column Layout:
 * ┌─────────────────────────────┐
 * │  Left Sidebar (56 width)    │  ← DashSidebar: Tab navigation with role gating
 * │  - Overview                 │
 * │  - Courses/Teaching         │
 * │  - Admin-only sections      │
 * │  - Sign Out                 │
 * └─────────────────────────────┴─────────────────────────┐
 * │  Main Content Area (flex-1)                           │
 * │  - Renders tab-specific component                     │
 * │  - Responsive padding                                 │
 * └─────────────────────────────────────────────────────────┘
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * TAB SYSTEM & STATE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * URL Query Parameters:
 * - /dashboard?tab=dash           → Overview (DashboardComponent)
 * - /dashboard?tab=profile        → Profile settings (DashProfile)
 * - /dashboard?tab=courses        → Course management (DashCourses)
 * - /dashboard?tab=users          → User management (DashUsers) [ADMIN ONLY]
 * - /dashboard?tab=posts          → Post moderation (DashPosts) [ADMIN ONLY]
 * - /dashboard?tab=comments       → Comment moderation (DashComments) [ADMIN ONLY]
 * - /dashboard?tab=newsletter     → Newsletter (DashNewsletter) [ADMIN ONLY]
 * - /dashboard?tab=announcement   → Announcements (DashAnnouncement) [ADMIN ONLY]
 * - /dashboard?tab=services       → Services (DashServices) [ADMIN ONLY]
 * - /dashboard?tab=my-students    → My Students (MyStudents) [INSTRUCTOR ONLY]
 * - /dashboard?tab=my-earnings    → My Earnings (MyEarnings) [INSTRUCTOR ONLY]
 * 
 * NOTE: Deep links are supported — users can share/bookmark specific tabs
 *
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 * @example
 * // Renders admin/instructor dashboard with role-based content
 * <AdminDashboard />
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Shared Components
import DashSidebar from './DashSidebar';
import DashProfile from './Users/DashProfile';

// Admin & Instructor Shared
import DashboardComponent from './DashboardComponent';
import { DashCourses } from './Courses/DashCourses';

// Admin Only
import DashPosts from './Posts/DashPosts';
import DashUsers from './Users/DashUsers';
import DashComments from './Comments/DashComments';
import DashNewsletter from './DashNewsletter';
import DashAnnouncement from './DashAnnouncement';
import DashServices from './Services/DashServices';

// Instructor Only
import MyStudents from './Courses/MyStudents';
import DashInstructors from './Courses/DashInstructors';
import MyEarnings from './Courses/MyEarnings';

export default function AdminDashboard() {
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState('dash'); // Default to overview

  /**
   * SYNC URL WITH TAB STATE
   * Parses the URL query parameter and updates component state
   * Allows deep-linking and browser back/forward navigation
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  /**
   * RENDER CONTENT BASED ON ACTIVE TAB
   * 
   * Shared components rendered for both admins and instructors:
   * - DashboardComponent: Role-aware overview stats
   * - DashProfile: User profile settings
   * - DashCourses: Course management
   * - DashEnrollments: Enrollment tracking
   * 
   * Admin-only components (tab checks role visibility):
   * - DashUsers: User management and role assignment
   * - DashPosts: Content moderation
   * - DashComments: Discussion moderation
   * - DashNewsletter: Bulk email communications
   * - DashAnnouncement: Platform announcements
   * - DashServices: Service management
   * 
   * Instructor-only components (tab only available in sidebar for instructors):
   * - MyStudents: Student roster
   * - MyEarnings: Revenue tracking
   */
  return (
    <div className='min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900'>
      {/* ════════ LEFT SIDEBAR ════════ */}
      {/* Fixed width sidebar with role-aware navigation */}
      <div className='md:w-56'>
        <DashSidebar />
      </div>

      {/* ════════ MAIN CONTENT AREA ════════ */}
      {/* Flexible width container for tab-specific component */}
      <div className="flex-1 p-4 md:p-8">
        {/* ──── SHARED COMPONENTS (Admin + Instructor) ──── */}
        {tab === 'dash' && <DashboardComponent />}
        {tab === 'profile' && <DashProfile />}
        {tab === 'courses' && <DashCourses />}
        {tab === 'instructors' && <DashInstructors />}

        {/* ──── INSTRUCTOR-SPECIFIC COMPONENTS ──── */}
        {tab === 'my-students' && <MyStudents />}
        {tab === 'my-earnings' && <MyEarnings />}

        {/* ──── ADMIN-ONLY COMPONENTS ──── */}
        {tab === 'posts' && <DashPosts />}
        {tab === 'users' && <DashUsers />}
        {tab === 'comments' && <DashComments />}
        {tab === 'newsletter' && <DashNewsletter />}
        {tab === 'announcement' && <DashAnnouncement />}
        {tab === 'services' && <DashServices />}
      </div>
    </div>
  );
}
