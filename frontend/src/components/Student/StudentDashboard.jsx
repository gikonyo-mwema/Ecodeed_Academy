/**
 * Student Dashboard Component
 * 
 * Main dashboard interface for enrolled students providing comprehensive course management,
 * learning progress tracking, and content navigation.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FEATURES & FUNCTIONALITY
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Layout:
 * - Left Sidebar: Course list with week-level navigation and quick access
 * - Main Content: Dynamic content based on active view (courses, course details, lessons)
 * - Responsive: Mobile-friendly with collapsible sidebar
 * 
 * Core Views:
 * 1. My Courses (Default): Grid/list of enrolled courses with progress indicators
 * 2. Course Overview: Course details, description, instructor info
 * 3. Weeks View: Structured curriculum broken into weeks with unlock logic
 * 4. Week Lessons: Individual lesson content with assignments, resources, live sessions
 * 5. Profile: Student profile and account settings
 * 
 * Navigation:
 * - URL-driven tab system using query parameters (tab=my-courses, course-{id}-weeks, etc.)
 * - Breadcrumb-style navigation for deep views
 * - Auto-progression through course content
 * 
 * State Management:
 * - enrolledCourses: Array of student's enrolled courses
 * - activeCourse: Currently selected course object
 * - activeWeek: Currently selected week with lesson structure
 * - weekSection: Active tab within week (lessons, assignments, resources, live-session)
 * - activeLessonId: Currently viewing lesson ID
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * API ENDPOINTS USED
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * GET /api/v1/enrollments/my-courses/
 *   Returns: Array of enrollments with nested course_details and progress data
 *   Used: Fetch student's enrolled courses on component mount
 * 
 * GET /api/v1/courses/{courseId}/weeks/
 *   Returns: Course weeks with lesson structure and unlock status
 *   Used: Get weeks breakdown for a specific course
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 * @example
 * // Renders the complete student learning dashboard
 * <StudentDashboard />
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spinner } from 'flowbite-react';
import StudentSidebar from './StudentSidebar';
import EnrolledCourses from './EnrolledCourses';
import CourseContentView from './CourseContentView';
import CourseWeeksView from './CourseWeeksView';
import WeekLessonView from './WeekLessonView';
import DashProfile from '../Admin/Users/DashProfile';
import { apiFetch } from '../../utils/api';

export default function StudentDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  
  // ════════════════ COURSE STATE ════════════════
  const [enrolledCourses, setEnrolledCourses] = useState([]); // All courses student is enrolled in
  const [enrollmentMap, setEnrollmentMap] = useState({});     // courseId → enrollmentId mapping
  const [activeCourse, setActiveCourse] = useState(null);     // Currently selected course
  const [activeSection, setActiveSection] = useState('weeks'); // weeks | overview | assignments | etc.
  const [loading, setLoading] = useState(true);               // Initial data loading state
  const [tab, setTab] = useState('my-courses');                // my-courses | profile | course-{id}-{section}

  // ════════════════ WEEK/LESSON STATE ════════════════
  // These manage granular navigation within a course's structured content
  const [activeWeek, setActiveWeek] = useState(null);         // Current week object from /weeks/ API
  const [weeksData, setWeeksData] = useState(null);            // Full weeks response for sidebar
  const [activeLessonId, setActiveLessonId] = useState(null); // Current lesson ID in week
  const [weekSection, setWeekSection] = useState('lessons');  // lessons | assignments | resources | live-session

  /**
   * Parse and sync URL parameters with component state
   * Handles navigation from URL to component state (e.g., /dashboard?tab=course-5-weeks)
   * Also validates that selected course exists in enrolledCourses before setting it
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
      
      // Parse course-specific tabs
      if (tabFromUrl.startsWith('course-')) {
        const parts = tabFromUrl.split('-');
        if (parts.length >= 3) {
          const courseId = parts[1];
          const section = parts.slice(2).join('-');
          
          // Find and set the active course
          const course = enrolledCourses.find(c => c.id?.toString() === courseId);
          if (course) {
            setActiveCourse(course);
            setActiveSection(section);
          }
        }
      }
    }
  }, [location.search, enrolledCourses]);

  /**
   * Fetch and normalize student's enrolled courses on component mount
   * 
   * API Response Flow:
   * 1. GET /api/v1/enrollments/my-courses/ → array of enrollment objects
   * 2. Each enrollment has nested course_details with full course info
   * 3. Each enrollment has progress tracking (percentage, completed_count, etc)
   * 4. Build a map of courseId → enrollmentId for quick enrollment lookups
   * 5. Normalize API response into component-friendly course objects
   * 
   * Error Handling:
   * - On error: logs error and sets courses to empty array
   * - User can still view the dashboard, just with no courses
   * - Network errors won't crash the component
   */
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/api/v1/enrollments/my-courses/');
        
        // Handle various API response formats (array vs paginated vs nested)
        const enrollments = Array.isArray(data) ? data : (data.results || data.enrollments || []);
        
        // Build courseId → enrollmentId mapping for later API calls
        const eMap = {};
        enrollments.forEach(e => {
          const cid = e.course_details?.id || e.course;
          if (cid && e.id) eMap[cid] = e.id;
        });
        setEnrollmentMap(eMap);

        // Normalize enrollment data to component's expected course structure
        const courses = enrollments.map(enrollment => {
          const course = enrollment.course_details || enrollment.course || {};
          const progressData = enrollment.progress || {};
          
          return {
            // Identifiers
            id: course.id || enrollment.course,
            title: course.title || 'Untitled Course',
            slug: course.slug,
            
            // Descriptions
            shortDescription: course.short_description || course.shortDescription,
            description: course.full_description || course.description,
            image: course.image,
            
            // Progress & Metrics
            progress: progressData.percentage || 0,              // 0-100 percentage
            completedLessons: progressData.completed_count || 0,
            totalLessons: progressData.total_count || course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0,
            totalModules: course.modules?.length || 0,
            
            // Metadata
            duration: course.duration,
            certificate: course.has_certificate,
            instructor: course.instructor,
            enrolledAt: enrollment.enrolled_at,
            status: enrollment.status,
            isFree: course.is_free,
            category: course.category,
            
            // TODO: Backend should provide these
            pendingAssignments: 0,  // TODO: Calculate from backend
            upcomingLive: false,    // TODO: Calculate from backend
            
            // Content Structure
            modules: course.modules || [],
          };
        });
        
        setEnrolledCourses(courses);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        // Graceful degradation: empty courses array allows dashboard to render
        setEnrolledCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchEnrolledCourses();
    }
  }, [currentUser]);

  /**
   * COURSE SELECTION HANDLER
   * Sets active course and navigates to specified section
   * Also resets all week-level state to ensure clean course context
   * 
   * @param {Object} course - Course object to activate
   * @param {string} section - Course section to view ('weeks', 'overview', 'assignments', etc)
   */
  const handleCourseSelect = (course, section = 'weeks') => {
    setActiveCourse(course);
    setActiveSection(section);
    // Clean slate: reset week navigation when switching courses
    setActiveWeek(null);
    setWeeksData(null);
    setActiveLessonId(null);
    setWeekSection('lessons');
    navigate(`/dashboard?tab=course-${course.id}-${section}`);
  };

  /**
   * BACK TO COURSES HANDLER
   * Navigates back from any course view to the "My Courses" list
   * Clears all course-related state
   */
  const handleBackToCourses = () => {
    setActiveCourse(null);
    setActiveSection('weeks');
    setActiveWeek(null);
    setWeeksData(null);
    setActiveLessonId(null);
    setWeekSection('lessons');
    navigate('/dashboard?tab=my-courses');
  };

  /**
   * WEEK SELECTION HANDLER (from CourseWeeksView)
   * Called when student selects/unlocks a week
   * 
   * @param {Object} week - Selected week object
   * @param {Object} fullWeeksData - Complete weeks response (for sidebar)
   * @param {number} lessonId - Optional: specific lesson within week to navigate to
   */
  const handleWeekSelect = (week, fullWeeksData, lessonId = null) => {
    setActiveWeek(week);
    setWeeksData(fullWeeksData);
    setActiveLessonId(lessonId);
    setWeekSection('lessons');
  };

  /**
   * WEEK CHANGE HANDLER (from StudentSidebar)
   * Called when sidebar updates the active week
   * 
   * @param {Object} week - Week to activate from sidebar click
   */
  const handleWeekChange = (week) => {
    setActiveWeek(week);
    setActiveLessonId(null);
    setWeekSection('lessons');
  };

  /**
   * WEEK COMPLETION HANDLER
   * Triggered when all lessons in current week are complete
   * Auto-advances to next unlocked week
   * 
   * Flow:
   * 1. Get current week index in weeksData
   * 2. Fetch fresh weeks data from backend (to get updated unlock status)
   * 3. Check if next week is now unlocked
   * 4. If unlocked: navigate into first lesson of next week
   * 5. If not unlocked or no next week: return to weeks list for refresh
   */
  const handleWeekComplete = async () => {
    if (!weeksData?.weeks || !activeWeek || !activeCourse) return;
    const currentIdx = weeksData.weeks.findIndex(w => w.id === activeWeek.id);
    const nextWeek = weeksData.weeks[currentIdx + 1];

    // Refresh course weeks to get updated unlock status from backend
    try {
      const freshData = await apiFetch(`/api/v1/courses/${activeCourse.id}/weeks/`);
      setWeeksData(freshData);

      if (nextWeek) {
        const freshNext = freshData.weeks?.find(w => w.id === nextWeek.id);
        if (freshNext && freshNext.is_unlocked) {
          // Auto-navigate to first lesson of next unlocked week
          const firstLesson = freshNext.lessons?.[0];
          setActiveWeek(freshNext);
          setActiveLessonId(firstLesson?.id || null);
          setWeekSection('lessons');
          return;
        }
      }
    } catch (err) {
      console.error('Error refreshing weeks after completion:', err);
    }

    // No next week available or it's still locked → return to weeks list
    setActiveWeek(null);
    setActiveLessonId(null);
    setWeekSection('lessons');
  };

  /**
   * BACK FROM WEEK HANDLER
   * Exits week lesson view and returns to weeks list
   * Triggered by back button in WeekLessonView
   */
  const handleBackToWeeks = () => {
    setActiveWeek(null);
    setActiveLessonId(null);
    setWeekSection('lessons');
  };

  /**
   * DYNAMIC CONTENT RENDERER
   * Renders different views based on navigation state
   * 
   * Rendering Logic (priority order):
   * 1. Profile Tab: Shows student profile/settings
   * 2. Loading State: Shows spinner while fetching courses
   * 3. Active Course with Active Week: Shows WeekLessonView (deepest level)
   * 4. Active Course in Weeks Section: Shows CourseWeeksView (curriculum structure)
   * 5. Active Course in Other Sections: Shows CourseContentView (assignments, etc)
   * 6. Default: Shows EnrolledCourses list (my courses)
   * 
   * @returns {JSX.Element} Appropriate view based on current state
   */
  const renderContent = () => {
    // Profile view (authenticated user settings)
    if (tab === 'profile') {
      return <DashProfile />;
    }

    // Loading state (while fetching enrolled courses)
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="xl" className="mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading your courses...</p>
          </div>
        </div>
      );
    }

    // Course-specific views
    if (activeCourse) {
      // ── Inside a specific week — show lesson content ──
      if (activeWeek) {
        return (
          <WeekLessonView
            week={activeWeek}
            weeksData={weeksData}
            course={activeCourse}
            weekSection={weekSection}
            activeLessonId={activeLessonId}
            onBack={handleBackToWeeks}
            onLessonChange={(id) => setActiveLessonId(id)}
            onSectionChange={(s) => setWeekSection(s)}
            onWeekComplete={handleWeekComplete}
            enrollmentId={enrollmentMap[activeCourse.id]}
          />
        );
      }

      // ── Course weeks overview (default structured view) ──
      if (activeSection === 'weeks') {
        return (
          <CourseWeeksView
            course={activeCourse}
            onBack={handleBackToCourses}
            onWeekSelect={handleWeekSelect}
          />
        );
      }

      // ── Other course sections (overview, assignments, live sessions, etc.) ──
      return (
        <CourseContentView
          course={activeCourse}
          activeSection={activeSection}
          onBack={handleBackToCourses}
        />
      );
    }

    // ── Default view: My courses list ──
    return (
      <EnrolledCourses
        courses={enrolledCourses}
        onCourseSelect={handleCourseSelect}
        loading={loading}
      />
    );
  };

  /**
   * COMPONENT RENDER
   * Two-column layout:
   * - Left Sidebar: Course navigation, week list, quick access
   * - Right Content: Dynamic main content area
   * 
   * Welcome message shown only on "my-courses" tab for UX
   */
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* ════════ LEFT SIDEBAR ════════ */}
      {/* Manages course selection, week navigation, and tab switching */}
      <div className="md:w-72 flex-shrink-0">
        <StudentSidebar
          enrolledCourses={enrolledCourses}
          activeCourse={activeCourse}
          onCourseSelect={handleCourseSelect}
          activeTab={tab}
          activeWeek={activeWeek}
          weeksData={weeksData}
          weekSection={weekSection}
          activeLessonId={activeLessonId}
          onWeekChange={handleWeekChange}
          onWeekSectionChange={(s) => setWeekSection(s)}
          onLessonSelect={(id) => { setWeekSection('lessons'); setActiveLessonId(id); }}
          onBackToWeeks={handleBackToWeeks}
        />
      </div>

      {/* ════════ MAIN CONTENT AREA ════════ */}
      {/* Renders dynamic views based on navigation state */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Welcome banner (only show on courses list view) */}
        {tab === 'my-courses' && !activeCourse && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Welcome back, {currentUser?.username || 'Student'}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Continue your learning journey. You have {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''} in progress.
            </p>
          </div>
        )}

        {/* Render appropriate view based on state */}
        {renderContent()}
      </div>
    </div>
  );
}
