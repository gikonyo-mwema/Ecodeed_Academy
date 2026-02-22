/**
 * Instructor Dashboard Page
 * 
 * Main dashboard for instructors/tutors to manage their courses, students, and content.
 * Provides an overview of teaching activities and course management tools.
 * 
 * Features:
 * - Overview of courses being taught
 * - Student enrollment statistics
 * - Assignment submissions management
 * - Live session scheduling
 * - Course content management
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar } from 'flowbite-react';
import {
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineVideoCamera,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineUser,
  HiArrowSmRight,
  HiOutlineClipboardList,
} from 'react-icons/hi';
import DashProfile from '../components/Admin/Users/DashProfile';
import { apiFetch } from '../utils/api';

/**
 * InstructorDashboard Component
 * Main dashboard interface for instructors
 */
export default function InstructorDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    pendingReviews: 0,
    upcomingSessions: 0,
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect non-instructors
  useEffect(() => {
    if (currentUser && !currentUser.isInstructor && !currentUser.isAdmin) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Handle tab from URL
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab) {
      setTab(urlTab);
    }
  }, [searchParams]);

  // Fetch instructor data
  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        setLoading(true);
        // Fetch courses where current user is instructor
        const coursesData = await apiFetch('/api/courses/');
        const instructorCourses = (coursesData.results || coursesData || []).filter(
          (course) => course.instructor === currentUser?.id || course.instructor === currentUser?._id
        );
        setCourses(instructorCourses);
        
        // Calculate stats (mock for now - replace with actual API)
        setStats({
          totalCourses: instructorCourses.length,
          totalStudents: instructorCourses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0),
          totalAssignments: instructorCourses.reduce((acc, c) => acc + (c.assignmentCount || 0), 0),
          pendingReviews: 5, // TODO: Fetch actual pending reviews
          upcomingSessions: 2, // TODO: Fetch actual upcoming sessions
        });
      } catch (error) {
        console.error('Error fetching instructor data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.isInstructor || currentUser?.isAdmin) {
      fetchInstructorData();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">Please sign in to access your dashboard.</p>
      </div>
    );
  }

  if (!currentUser.isInstructor && !currentUser.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-500">You must be an instructor to access this page.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (tab) {
      case 'profile':
        return <DashProfile />;
      case 'courses':
        return <InstructorCourses courses={courses} loading={loading} />;
      case 'students':
        return <InstructorStudents />;
      case 'assignments':
        return <InstructorAssignments />;
      case 'sessions':
        return <InstructorSessions />;
      default:
        return <InstructorOverview stats={stats} courses={courses} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <Sidebar className="w-full">
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              <Sidebar.Item
                active={tab === 'overview'}
                icon={HiOutlineChartBar}
                as="div"
                onClick={() => setTab('overview')}
                className="cursor-pointer"
              >
                Overview
              </Sidebar.Item>
              <Sidebar.Item
                active={tab === 'profile'}
                icon={HiOutlineUser}
                as="div"
                onClick={() => setTab('profile')}
                className="cursor-pointer"
              >
                My Profile
              </Sidebar.Item>
              <Sidebar.Item
                active={tab === 'courses'}
                icon={HiOutlineAcademicCap}
                as="div"
                onClick={() => setTab('courses')}
                className="cursor-pointer"
                label={stats.totalCourses}
                labelColor="blue"
              >
                My Courses
              </Sidebar.Item>
              <Sidebar.Item
                active={tab === 'students'}
                icon={HiOutlineUsers}
                as="div"
                onClick={() => setTab('students')}
                className="cursor-pointer"
                label={stats.totalStudents}
                labelColor="green"
              >
                Students
              </Sidebar.Item>
              <Sidebar.Item
                active={tab === 'assignments'}
                icon={HiOutlineClipboardList}
                as="div"
                onClick={() => setTab('assignments')}
                className="cursor-pointer"
                label={stats.pendingReviews}
                labelColor="yellow"
              >
                Assignments
              </Sidebar.Item>
              <Sidebar.Item
                active={tab === 'sessions'}
                icon={HiOutlineVideoCamera}
                as="div"
                onClick={() => setTab('sessions')}
                className="cursor-pointer"
                label={stats.upcomingSessions}
                labelColor="purple"
              >
                Live Sessions
              </Sidebar.Item>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">{renderContent()}</div>
    </div>
  );
}

/**
 * Overview Component - Shows instructor stats and quick actions
 */
function InstructorOverview({ stats, courses, loading }) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Courses" value={stats.totalCourses} icon={HiOutlineAcademicCap} color="blue" />
        <StatCard title="Total Students" value={stats.totalStudents} icon={HiOutlineUsers} color="green" />
        <StatCard title="Pending Reviews" value={stats.pendingReviews} icon={HiOutlineClipboardList} color="yellow" />
        <StatCard title="Upcoming Sessions" value={stats.upcomingSessions} icon={HiOutlineVideoCamera} color="purple" />
      </div>

      {/* Recent Courses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Courses</h2>
          <Link to="/create-course" className="text-blue-600 hover:underline text-sm">
            + Create New Course
          </Link>
        </div>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course) => (
              <div key={course.id} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <img
                  src={course.image || '/placeholder-course.jpg'}
                  alt={course.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{course.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {course.enrollmentCount || 0} students enrolled
                </p>
                <Link
                  to={`/edit-course/${course.id}`}
                  className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                >
                  Edit Course →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <HiOutlineAcademicCap className="mx-auto h-12 w-12 mb-3" />
            <p>You haven't created any courses yet.</p>
            <Link to="/create-course" className="mt-2 inline-block text-blue-600 hover:underline">
              Create your first course
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction icon={HiOutlineAcademicCap} label="Create Course" to="/create-course" />
          <QuickAction icon={HiOutlineDocumentText} label="Add Lesson" to="#" />
          <QuickAction icon={HiOutlineVideoCamera} label="Schedule Session" to="#" />
          <QuickAction icon={HiOutlineClipboardList} label="Create Assignment" to="#" />
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4">
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

/**
 * Quick Action Button Component
 */
function QuickAction({ icon: Icon, label, to }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <Icon className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-2" />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </Link>
  );
}

/**
 * Instructor Courses Component
 */
function InstructorCourses({ courses, loading }) {
  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
        <Link
          to="/create-course"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Course
        </Link>
      </div>
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <img
                src={course.image || '/placeholder-course.jpg'}
                alt={course.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h3>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span>{course.enrollmentCount || 0} students</span>
                  <span>{course.moduleCount || 0} modules</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/edit-course/${course.id}`}
                    className="flex-1 text-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/courses/${course.slug}`}
                    className="flex-1 text-center bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <HiOutlineAcademicCap className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Start creating your first course to share your knowledge.</p>
          <Link
            to="/create-course"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Course
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Instructor Students Component - Placeholder
 */
function InstructorStudents() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Students</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <HiOutlineUsers className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Student Management</h3>
        <p className="text-gray-500 dark:text-gray-400">
          View and manage students enrolled in your courses.
        </p>
      </div>
    </div>
  );
}

/**
 * Instructor Assignments Component - Placeholder
 */
function InstructorAssignments() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <HiOutlineClipboardList className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Assignment Management</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create assignments and review student submissions.
        </p>
      </div>
    </div>
  );
}

/**
 * Instructor Sessions Component - Placeholder
 */
function InstructorSessions() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Sessions</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <HiOutlineVideoCamera className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Live Session Management</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Schedule and manage live sessions with your students.
        </p>
      </div>
    </div>
  );
}
