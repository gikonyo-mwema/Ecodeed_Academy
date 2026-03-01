/**
 * Student Dashboard Component
 * 
 * Main dashboard for enrolled students with sidebar navigation,
 * course management, and learning progress tracking.
 * 
 * Features:
 * - Sidebar with enrolled courses and navigation
 * - View all enrolled courses
 * - Course-specific content (modules, assignments, live sessions, resources)
 * - Progress tracking
 * 
 * @component
 * @version 2.0.0
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
  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrollmentMap, setEnrollmentMap] = useState({});   // courseId → enrollmentId
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeSection, setActiveSection] = useState('weeks');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('my-courses');

  // ── Week-level state ──
  const [activeWeek, setActiveWeek] = useState(null);       // the full week object from /weeks/ API
  const [weeksData, setWeeksData] = useState(null);          // full /weeks/ response (so sidebar can list all weeks)
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [weekSection, setWeekSection] = useState('lessons'); // lessons | assignments | resources | live-session

  // Parse tab from URL
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

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/api/enrollments/my-courses/');
        
        // The API returns an array of enrollments with course_details
        const enrollments = Array.isArray(data) ? data : (data.results || data.enrollments || []);
        
        // Build enrollmentId map (courseId → enrollmentId)
        const eMap = {};
        enrollments.forEach(e => {
          const cid = e.course_details?.id || e.course;
          if (cid && e.id) eMap[cid] = e.id;
        });
        setEnrollmentMap(eMap);

        // Normalize the data from the Django serializer format
        const courses = enrollments.map(enrollment => {
          const course = enrollment.course_details || enrollment.course || {};
          const progressData = enrollment.progress || {};
          
          return {
            id: course.id || enrollment.course,
            title: course.title || 'Untitled Course',
            slug: course.slug,
            shortDescription: course.short_description || course.shortDescription,
            description: course.full_description || course.description,
            image: course.image,
            progress: progressData.percentage || 0,
            completedLessons: progressData.completed_count || 0,
            totalLessons: progressData.total_count || course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0,
            totalModules: course.modules?.length || 0,
            duration: course.duration,
            certificate: course.has_certificate,
            instructor: course.instructor,
            enrolledAt: enrollment.enrolled_at,
            status: enrollment.status,
            pendingAssignments: 0, // TODO: Calculate from backend
            upcomingLive: false, // TODO: Calculate from backend
            modules: course.modules || [],
            isFree: course.is_free,
            category: course.category,
          };
        });
        
        setEnrolledCourses(courses);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        // Set empty array on error
        setEnrolledCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchEnrolledCourses();
    }
  }, [currentUser]);

  const handleCourseSelect = (course, section = 'weeks') => {
    setActiveCourse(course);
    setActiveSection(section);
    // Reset week-level state when switching courses/sections
    setActiveWeek(null);
    setWeeksData(null);
    setActiveLessonId(null);
    setWeekSection('lessons');
    navigate(`/dashboard?tab=course-${course.id}-${section}`);
  };

  const handleBackToCourses = () => {
    setActiveCourse(null);
    setActiveSection('weeks');
    setActiveWeek(null);
    setWeeksData(null);
    setActiveLessonId(null);
    setWeekSection('lessons');
    navigate('/dashboard?tab=my-courses');
  };

  /** Called when student clicks an unlocked week in CourseWeeksView */
  const handleWeekSelect = (week, fullWeeksData, lessonId = null) => {
    setActiveWeek(week);
    setWeeksData(fullWeeksData);
    setActiveLessonId(lessonId);
    setWeekSection('lessons');
  };

  /** Called when sidebar changes the active week */
  const handleWeekChange = (week) => {
    setActiveWeek(week);
    setActiveLessonId(null);
    setWeekSection('lessons');
  };

  /** Called when all lessons in current week are complete — auto-navigate to next week */
  const handleWeekComplete = async () => {
    if (!weeksData?.weeks || !activeWeek || !activeCourse) return;
    const currentIdx = weeksData.weeks.findIndex(w => w.id === activeWeek.id);
    const nextWeek = weeksData.weeks[currentIdx + 1];

    // Re-fetch weeks to get fresh unlock status after backend registered the completion
    try {
      const freshData = await apiFetch(`/api/courses/${activeCourse.id}/weeks/`);
      setWeeksData(freshData);

      if (nextWeek) {
        const freshNext = freshData.weeks?.find(w => w.id === nextWeek.id);
        if (freshNext && freshNext.is_unlocked) {
          // Navigate directly into the next week's first lesson
          const firstLesson = freshNext.lessons?.[0];
          setActiveWeek(freshNext);
          setActiveLessonId(firstLesson?.id || null);
          setWeekSection('lessons');
          return;
        }
      }
    } catch (err) {
      console.error('Error refreshing weeks:', err);
    }

    // No next week or it's still locked — go back to weeks list (which will re-fetch)
    setActiveWeek(null);
    setActiveLessonId(null);
    setWeekSection('lessons');
  };

  /** Go back from week lesson view to weeks list */
  const handleBackToWeeks = () => {
    setActiveWeek(null);
    setActiveLessonId(null);
    setWeekSection('lessons');
  };

  const renderContent = () => {
    // Profile view
    if (tab === 'profile') {
      return <DashProfile />;
    }

    // Loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="xl" className="mb-4" />
            <p className="text-gray-500">Loading your courses...</p>
          </div>
        </div>
      );
    }

    // Course-specific view
    if (activeCourse) {
      // ── Inside a specific week ──
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

      // ── Weeks overview (default) ──
      if (activeSection === 'weeks') {
        return (
          <CourseWeeksView
            course={activeCourse}
            onBack={handleBackToCourses}
            onWeekSelect={handleWeekSelect}
          />
        );
      }
      // Other sections (overview, assignments, live-sessions, etc.)
      return (
        <CourseContentView
          course={activeCourse}
          activeSection={activeSection}
          onBack={handleBackToCourses}
        />
      );
    }

    // My courses list view (default)
    return (
      <EnrolledCourses
        courses={enrolledCourses}
        onCourseSelect={handleCourseSelect}
        loading={loading}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Welcome Header (only on my-courses tab) */}
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

        {renderContent()}
      </div>
    </div>
  );
}
