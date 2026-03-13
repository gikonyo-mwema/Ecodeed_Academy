/**
 * Dashboard Overview Component
 * 
 * Role-aware statistics and KPI dashboard that displays different metrics based on user role.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * RENDERING LOGIC
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * This component checks the currentUser's role and renders the appropriate view:
 * 
 * ADMIN USERS → AdminOverview():
 * - Platform-wide statistics and KPIs
 * - Total users, courses, enrollments, posts, and revenue
 * - Data fetched from multiple endpoints
 * - Provides 5 key metric cards
 * 
 * INSTRUCTOR USERS → InstructorOverview():
 * - Personal teaching statistics
 * - My courses, students, enrollments, revenue
 * - Quick course list with enrollment counts
 * - Recent enrollments timeline
 * - Personalized view of their teaching activity
 * 
 * OTHER USERS → Error message
 * - Permission denied message
 * - Prevents unauthorized access to dashboard
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * COMPONENT STRUCTURE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * StatCard (Sub-component):
 * - Reusable KPI display card with icon, label, value
 * - Supports loading state with spinner
 * - Customizable icon and color scheme
 * - Responsive grid layout
 * 
 * AdminOverview (Sub-component):
 * - Fetches data from 7 different API endpoints in parallel
 * - Displays 5 main KPI cards
 * - Handles data normalization from various response formats
 * - Error handling and loading states
 * 
 * InstructorOverview (Sub-component):
 * - Fetches instructor's courses and enrollments
 * - Calculates derived metrics (unique students, total revenue)
 * - Displays course cards with quick stats
 * - Shows recent enrollments timeline
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * DATA FLOW & API CALLS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * ADMIN ENDPOINTS:
 * - GET /api/v1/auth/users/getUsers         → Total user count
 * - GET /api/v1/posts/                       → Total posts
 * - GET /api/v1/comments/getComments        → Total comments (not displayed)
 * - GET /api/v1/services/                    → Services data (not displayed)
 * - GET /api/v1/courses/                     → Total courses
 * - GET /api/v1/payments/history/            → Revenue calculations
 * - GET /api/v1/enrollments/                 → Total enrollments
 * 
 * INSTRUCTOR ENDPOINTS:
 * - GET /api/v1/courses/my-taught-courses/  → Courses taught by instructor
 * - GET /api/v1/enrollments/                 → All enrollments (filtered by course ID)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 * @example
 * // Renders appropriate dashboard overview based on user role
 * <DashboardComponent />
 */

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { apiFetch } from "../../utils/api";
import { Spinner } from "flowbite-react";
import {
  HiAcademicCap, HiOutlineUserGroup, HiCurrencyDollar,
  HiDocumentText, HiAnnotation, HiClipboardCheck, HiShoppingBag,
} from "react-icons/hi";

/**
 * STAT CARD SUB-COMPONENT
 * 
 * Reusable KPI card with icon, label, value display
 * 
 * @param {React.ReactNode} icon - Icon component from react-icons
 * @param {string} label - Metric label (e.g., "Total Users")
 * @param {string|number} value - Value to display (e.g., "1,234" or <Spinner />)
 * @param {string} color - Tailwind color class (e.g., "brand-green", "brand-blue")
 * @param {boolean} loading - Show spinner instead of value if true
 * @returns {JSX.Element} Rendered stat card
 */
const StatCard = ({ icon: Icon, label, value, color = "brand-green", loading }) => (
  <div className="flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl shadow">
    <div className={`p-3 rounded-lg bg-${color}/10`}>
      <Icon className={`w-7 h-7 text-${color}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? "—"}</p>
      )}
    </div>
  </div>
);

/**
 * ADMIN OVERVIEW SUB-COMPONENT
 * 
 * Displays platform-wide KPI statistics for administrators.
 * Fetches data from multiple endpoints and displays key metrics.
 * 
 * @returns {JSX.Element} Admin dashboard overview
 */
function AdminOverview() {
  // State for all data types
  const [data, setData] = useState({
    users: [], comments: [], posts: [], services: [],
    courses: [], payments: [], enrollments: [],
  });
  
  // Track loading state per data type for granular spinners
  const [loading, setLoading] = useState({
    users: true, posts: true, comments: true, services: true,
    courses: true, payments: true, enrollments: true,
  });

  /**
   * FETCH DATA BY TYPE
   * Generic data fetcher that handles various API response formats
   * 
   * Supports multiple response structures:
   * - { users: [...] }
   * - { results: [...] }
   * - { data: [...] }
   * - Direct array: [...]
   * 
   * @param {string} type - Data type to fetch (e.g., 'users', 'posts')
   * @param {string} endpoint - API endpoint URL
   */
  const fetchData = useCallback(async (type, endpoint) => {
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      const response = await apiFetch(endpoint);
      
      // Handle various API response formats
      const responseData =
        response[type] || response.users || response.posts ||
        response.comments || response.services || response.courses ||
        response.payments || response.data || response.results || [];
      
      setData(prev => ({
        ...prev,
        [type]: Array.isArray(responseData) ? responseData : [],
      }));
    } catch (err) {
      console.error(`Failed to load ${type}:`, err.message);
      // Keep empty array on error to prevent crashes
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  /**
   * API ENDPOINTS CONFIGURATION
   * All endpoints used by admin overview
   */
  const endpoints = {
    users:       "/api/v1/auth/users/getUsers",
    posts:       "/api/v1/posts/",
    comments:    "/api/v1/comments/getComments",
    services:    "/api/v1/services/",
    courses:     "/api/v1/courses/",
    payments:    "/api/v1/payments/history/",
    enrollments: "/api/v1/enrollments/",
  };

  /**
   * FETCH ALL DATA ON MOUNT
   * Fetches data from all endpoints in parallel
   */
  useEffect(() => {
    Object.entries(endpoints).forEach(([type, endpoint]) => {
      fetchData(type, endpoint);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate KPI totals from first page of data
  // NOTE: These are first-page counts only, not total database counts
  const totalUsers       = data.users.length;
  const totalPosts       = data.posts.length;
  const totalCourses     = data.courses.length;
  const totalEnrollments = data.enrollments.length;
  const totalRevenue     = data.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="p-3 md:mx-auto space-y-6">
      {/* KPI STAT CARDS - 5 column grid on lg, 2 on sm, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={HiOutlineUserGroup} label="Total Users"       value={totalUsers}       loading={loading.users} />
        <StatCard icon={HiAcademicCap}      label="Total Courses"     value={totalCourses}     loading={loading.courses} />
        <StatCard icon={HiShoppingBag}      label="Total Enrollments" value={totalEnrollments} loading={loading.enrollments} />
        <StatCard icon={HiDocumentText}     label="Total Posts"       value={totalPosts}       loading={loading.posts} />
        <StatCard icon={HiCurrencyDollar}   label="Total Revenue"     value={`KES ${totalRevenue.toLocaleString()}`} loading={loading.payments} />
      </div>
    </div>
  );
}

/**
 * INSTRUCTOR OVERVIEW SUB-COMPONENT
 * 
 * Displays personalized teaching metrics for course instructors.
 * Shows courses taught, student enrollment, and recent activity.
 * 
 * Data Fetched:
 * 1. GET /api/v1/courses/my-taught-courses/ → Instructor's courses
 * 2. GET /api/v1/enrollments/ → All enrollments (filtered for this instructor's courses)
 * 
 * Derived Metrics:
 * - totalStudents: Unique count of enrolled students across all courses
 * - totalEnrollments: Total enrollment records
 * - totalRevenue: Sum of course prices for paid enrollments
 * 
 * @returns {JSX.Element} Instructor-specific overview
 */
function InstructorOverview() {
  const [stats, setStats] = useState(null);     // KPI and course data
  const [loading, setLoading] = useState(true); // Initial load state

  /**
   * FETCH INSTRUCTOR STATISTICS
   * Runs on component mount to fetch all necessary data
   */
  useEffect(() => {
    (async () => {
      try {
        // Fetch instructor's taught courses
        const coursesRes = await apiFetch("/api/v1/courses/my-taught-courses/");
        const courses = Array.isArray(coursesRes) ? coursesRes : (coursesRes.results || []);

        // Fetch all enrollments system-wide
        const enrollRes = await apiFetch("/api/v1/enrollments/");
        const enrollments = Array.isArray(enrollRes) ? enrollRes : (enrollRes.results || []);

        // Filter enrollments to only those in this instructor's courses
        const courseIds = new Set(courses.map(c => c.id));
        const myEnrollments = enrollments.filter(
          e => courseIds.has(e.course_details?.id || e.course)
        );
        
        // Calculate derived metrics
        const uniqueStudents = new Set(myEnrollments.map(e => e.student_email || e.user));
        const totalRevenue = myEnrollments.reduce(
          (sum, e) => sum + (Number(e.course_details?.price) || 0),
          0
        );

        setStats({
          courses,                                    // List of taught courses
          totalCourses: courses.length,              // KPI
          totalStudents: uniqueStudents.size,         // KPI
          totalEnrollments: myEnrollments.length,     // KPI
          totalRevenue,                              // KPI
          recentEnrollments: myEnrollments.slice(0, 5), // Recent activity
        });
      } catch (err) {
        console.error("Instructor overview fetch error:", err);
        // On error, stats remains null and we show error message
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  // Error state
  if (!stats) {
    return <p className="text-center text-gray-500 py-8">Failed to load overview data.</p>;
  }

  return (
    <div className="p-3 md:mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instructor Overview</h1>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiAcademicCap}      label="My Courses"       value={stats.totalCourses} />
        <StatCard icon={HiOutlineUserGroup}  label="My Students"      value={stats.totalStudents} />
        <StatCard icon={HiShoppingBag}       label="Total Enrollments" value={stats.totalEnrollments} />
        <StatCard icon={HiCurrencyDollar}    label="Total Revenue"    value={`KES ${stats.totalRevenue.toLocaleString()}`} />
      </div>

      {/* MY COURSES SECTION */}
      {/* Quick view of all courses taught by this instructor */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">My Courses</h2>
        {stats.courses.length === 0 ? (
          <p className="text-gray-500">You haven't created any courses yet.</p>
        ) : (
          <div className="space-y-3">
            {stats.courses.map(course => (
              <div key={course.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Course thumbnail */}
                  {course.image && (
                    <img src={course.image} alt="" className="w-12 h-8 rounded object-cover" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{course.title}</p>
                    <p className="text-xs text-gray-500">
                      {course.is_free ? "Free" : `KES ${Number(course.price).toLocaleString()}`}
                      {" · "}
                      {course.modules?.length || 0} modules
                    </p>
                  </div>
                </div>
                {/* Popularity badge */}
                <span className={`text-xs px-2 py-1 rounded-full ${course.is_popular ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                  {course.is_popular ? "Popular" : "Standard"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECENT ENROLLMENTS SECTION */}
      {/* Shows latest student enrollments in instructor's courses */}
      {stats.recentEnrollments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Enrollments</h2>
          <div className="space-y-2">
            {stats.recentEnrollments.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{e.student_email || "Student"}</p>
                  <p className="text-xs text-gray-500">{e.course_details?.title}</p>
                </div>
                {/* Enrollment date */}
                <span className="text-xs text-gray-500">
                  {new Date(e.enrolled_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * MAIN EXPORT - ROLE-BASED DISPATCHER
 * 
 * Checks user role and renders appropriate overview component.
 * This is the entry point for the dashboard overview.
 * 
 * Permission Rules:
 * - Admins (isAdmin=true) → AdminOverview with platform-wide metrics
 * - Instructors (isInstructor=true) → InstructorOverview with personal metrics
 * - Others → Permission denied error message
 * 
 * @returns {JSX.Element} Role-appropriate dashboard overview
 */
export default function DashboardComponent() {
  const { currentUser } = useSelector((state) => state.user);

  // Render appropriate view based on user role
  if (currentUser?.isAdmin) return <AdminOverview />;
  if (currentUser?.isInstructor) return <InstructorOverview />;

  // No permission
  return (
    <div className="text-center p-4">
      <p className="text-red-500 font-medium">
        You do not have permission to view this page.
      </p>
    </div>
  );
}