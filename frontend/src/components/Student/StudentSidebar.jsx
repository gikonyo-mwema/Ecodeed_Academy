/**
 * Student Dashboard Sidebar Component
 * 
 * A responsive navigation sidebar for the student dashboard that provides
 * easy access to enrolled courses and course-specific content.
 * 
 * Features:
 * - Responsive design with mobile toggle functionality
 * - Collapsible sidebar for better screen space utilization
 * - Active tab highlighting based on URL parameters
 * - Course-specific navigation (weeks, assignments, live sessions, resources)
 * - Sign out functionality
 * 
 * @component
 * @version 1.0.0
 */

import React, { useEffect, useState } from "react";
import { Sidebar, Tooltip, Badge } from "flowbite-react";
import { 
  HiUser, 
  HiArrowSmRight, 
  HiOutlineViewGrid,
  HiAcademicCap,
  HiBookOpen,
  HiClipboardCheck,
  HiVideoCamera,
  HiArchive,
  HiCollection,
  HiChatAlt,
  HiHome,
  HiChevronDown,
  HiChevronRight,
  HiLockClosed,
  HiPlay,
  HiCheckCircle
} from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "../../redux/user/userSlice"; 

export default function StudentSidebar({ 
  enrolledCourses = [], 
  activeCourse = null, 
  onCourseSelect,
  activeTab = 'my-courses',
  // Week-level props
  activeWeek = null,
  weeksData = null,
  weekSection = 'lessons',
  activeLessonId = null,
  onWeekChange,
  onWeekSectionChange,
  onLessonSelect,
  onBackToWeeks,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentUser } = useSelector((state) => state.user);
  
  const [tab, setTab] = useState(activeTab);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState(activeCourse?.id || null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  useEffect(() => {
    if (activeCourse?.id) {
      setExpandedCourse(activeCourse.id);
    }
  }, [activeCourse]);

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      navigate("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  const handleTabClick = (tabName) => {
    navigate(`/dashboard?tab=${tabName}`);
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const toggleCourseExpand = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  // Course content tabs
  const courseContentTabs = [
    { id: "weeks", name: "Weekly Content", icon: HiCollection },
    { id: "overview", name: "Overview", icon: HiHome },
    { id: "assignments", name: "Assignments", icon: HiClipboardCheck },
    { id: "live-sessions", name: "Live Sessions", icon: HiVideoCamera },
    { id: "resources", name: "Resources", icon: HiArchive },
    { id: "discussions", name: "Discussions", icon: HiChatAlt },
  ];

  return (
    <>
      {/* Mobile menu toggle button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-20 left-4 z-50 p-2 rounded-md bg-gray-200 dark:bg-gray-700 shadow-lg"
        aria-label="Toggle sidebar menu"
      >
        <HiOutlineViewGrid className="w-6 h-6" />
      </button>

      {/* Main sidebar component with responsive design */}
      <Sidebar 
        className={`w-full md:w-72 fixed md:relative z-40 transition-all duration-300 h-screen ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-20' : ''}`}
        collapsed={collapsed}
      >
        <Sidebar.Items className="h-full overflow-y-auto">
          <Sidebar.ItemGroup className="flex flex-col gap-1">

            {/* ═══════════ WEEK MODE: inside a specific week ═══════════ */}
            {activeWeek && !collapsed ? (
              <>
                {/* Back to weeks list */}
                <button
                  onClick={() => {
                    if (onBackToWeeks) onBackToWeeks();
                    if (window.innerWidth < 768) setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <HiChevronRight className="w-4 h-4 rotate-180" />
                  <span>All Weeks</span>
                </button>

                {/* Current week title */}
                <div className="px-4 pt-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-brand-green dark:text-brand-green/80 font-semibold uppercase tracking-wider">
                    Week {activeWeek.week_number}
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                    {activeWeek.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeWeek.completed_count}/{activeWeek.total_count} lessons done
                  </p>
                </div>

                {/* ── Lessons ── */}
                <div className="mt-2">
                  <button
                    onClick={() => {
                      if (onWeekSectionChange) onWeekSectionChange('lessons');
                      if (window.innerWidth < 768) setMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors
                      ${weekSection === 'lessons'
                        ? 'bg-brand-green/5 dark:bg-brand-green/10 text-brand-green dark:text-brand-green/80'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <HiBookOpen className="w-4 h-4" />
                    <span>Lessons</span>
                    <Badge color="info" size="xs" className="ml-auto">{activeWeek.total_count}</Badge>
                  </button>

                  {/* Lesson list — always visible under lessons header */}
                  {weekSection === 'lessons' && activeWeek.lessons?.length > 0 && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-200 dark:border-gray-600 pl-2">
                      {activeWeek.lessons.map((lesson, idx) => {
                        const isActive = activeLessonId === lesson.id ||
                          (!activeLessonId && idx === 0 && weekSection === 'lessons');
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              if (onLessonSelect) onLessonSelect(lesson.id);
                              if (window.innerWidth < 768) setMobileOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-colors
                              ${isActive
                                ? 'bg-brand-green/10 dark:bg-brand-green/10 text-brand-green dark:text-brand-green/80 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }
                            `}
                          >
                            {lesson.is_completed ? (
                              <HiCheckCircle className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
                            ) : (
                              <HiPlay className="w-3.5 h-3.5 flex-shrink-0" />
                            )}
                            <span className="truncate">{idx + 1}. {lesson.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Assignments ── */}
                <button
                  onClick={() => {
                    if (onWeekSectionChange) onWeekSectionChange('assignments');
                    if (window.innerWidth < 768) setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors
                    ${weekSection === 'assignments'
                      ? 'bg-brand-green/5 dark:bg-brand-green/10 text-brand-green dark:text-brand-green/80'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <HiClipboardCheck className="w-4 h-4" />
                  <span>Assignment</span>
                  {(activeWeek.assignments?.length || 0) > 0 && (
                    <Badge color="warning" size="xs" className="ml-auto">{activeWeek.assignments.length}</Badge>
                  )}
                </button>

                {/* ── Resources ── */}
                <button
                  onClick={() => {
                    if (onWeekSectionChange) onWeekSectionChange('resources');
                    if (window.innerWidth < 768) setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors
                    ${weekSection === 'resources'
                      ? 'bg-brand-green/5 dark:bg-brand-green/10 text-brand-green dark:text-brand-green/80'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <HiArchive className="w-4 h-4" />
                  <span>Resources</span>
                  {(activeWeek.resources?.length || 0) > 0 && (
                    <Badge color="gray" size="xs" className="ml-auto">{activeWeek.resources.length}</Badge>
                  )}
                </button>

                {/* ── Live Session ── */}
                <button
                  onClick={() => {
                    if (onWeekSectionChange) onWeekSectionChange('live-session');
                    if (window.innerWidth < 768) setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors
                    ${weekSection === 'live-session'
                      ? 'bg-brand-green/5 dark:bg-brand-green/10 text-brand-green dark:text-brand-green/80'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <HiVideoCamera className="w-4 h-4" />
                  <span>Live Session</span>
                  {(activeWeek.live_sessions?.length || 0) > 0 && (
                    <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>

                {/* Divider + other weeks quick-nav */}
                {weeksData?.weeks?.length > 1 && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Other Weeks
                    </p>
                    <div className="space-y-0.5 max-h-40 overflow-y-auto">
                      {weeksData.weeks.filter(w => w.id !== activeWeek.id).map((w) => (
                        <button
                          key={w.id}
                          disabled={!w.is_unlocked}
                          onClick={() => {
                            if (w.is_unlocked && onWeekChange) onWeekChange(w);
                            if (window.innerWidth < 768) setMobileOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-1.5 text-xs rounded transition-colors
                            ${!w.is_unlocked
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                            }
                          `}
                        >
                          {w.all_completed ? (
                            <HiCheckCircle className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
                          ) : w.is_unlocked ? (
                            <span className="w-3.5 h-3.5 text-center font-bold text-[10px] flex-shrink-0">{w.week_number}</span>
                          ) : (
                            <HiLockClosed className="w-3 h-3 flex-shrink-0" />
                          )}
                          <span className="truncate">Wk {w.week_number}: {w.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* ═══════════ DEFAULT MODE: course list ═══════════ */
              <>
                {/* User profile section */}
                <Tooltip content="Profile" placement="right" trigger={collapsed ? "hover" : null}>
                  <Sidebar.Item
                    active={tab === "profile"}
                    icon={HiUser}
                    label="Student"
                    labelColor="dark"
                    onClick={() => handleTabClick("profile")}
                    as="div"
                    className="cursor-pointer"
                  >
                    {!collapsed && "Profile"}
                  </Sidebar.Item>
                </Tooltip>

                {/* My Courses - Dashboard home */}
                <Tooltip content="My Courses" placement="right" trigger={collapsed ? "hover" : null}>
                  <Sidebar.Item
                    active={tab === "my-courses"}
                    icon={HiAcademicCap}
                    onClick={() => handleTabClick("my-courses")}
                    as="div"
                    className="cursor-pointer"
                  >
                    {!collapsed && (
                      <span className="flex items-center gap-2">
                        My Courses
                        {enrolledCourses.length > 0 && (
                          <Badge color="info">{enrolledCourses.length}</Badge>
                        )}
                      </span>
                    )}
                  </Sidebar.Item>
                </Tooltip>

                {/* Enrolled Courses List */}
                {!collapsed && enrolledCourses.length > 0 && (
                  <div className="mt-4">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Enrolled Courses
                    </p>
                    {enrolledCourses.map((course) => (
                      <div key={course.id} className="mb-1">
                        {/* Course Header - Expandable */}
                        <button
                          onClick={() => {
                            toggleCourseExpand(course.id);
                            if (onCourseSelect) onCourseSelect(course);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors
                            ${activeCourse?.id === course.id 
                              ? 'bg-brand-green/5 dark:bg-brand-green/10 text-brand-green dark:text-brand-green/80' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <HiBookOpen className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{course.title}</span>
                          </div>
                          {expandedCourse === course.id ? (
                            <HiChevronDown className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <HiChevronRight className="w-4 h-4 flex-shrink-0" />
                          )}
                        </button>

                        {/* Course Content Navigation - Expanded */}
                        {expandedCourse === course.id && (
                          <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-2">
                            {courseContentTabs.map((contentTab) => (
                              <button
                                key={contentTab.id}
                                onClick={() => {
                                  if (onCourseSelect) onCourseSelect(course, contentTab.id);
                                  handleTabClick(`course-${course.id}-${contentTab.id}`);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-colors
                                  ${tab === `course-${course.id}-${contentTab.id}`
                                    ? 'bg-brand-green/10 dark:bg-brand-green/10 text-brand-green dark:text-brand-green/80'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                  }
                                `}
                              >
                                <contentTab.icon className="w-3.5 h-3.5" />
                                <span>{contentTab.name}</span>
                                {contentTab.id === 'assignments' && course.pendingAssignments > 0 && (
                                  <Badge color="warning" size="xs">{course.pendingAssignments}</Badge>
                                )}
                                {contentTab.id === 'live-sessions' && course.upcomingLive && (
                                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Browse More Courses */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <Tooltip content="Browse Courses" placement="right" trigger={collapsed ? "hover" : null}>
                    <Sidebar.Item
                      icon={HiCollection}
                      onClick={() => navigate('/courses')}
                      as="div"
                      className="cursor-pointer"
                    >
                      {!collapsed && "Browse Courses"}
                    </Sidebar.Item>
                  </Tooltip>
                </div>
              </>
            )}

            {/* Sign out option */}
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-600">
              <Tooltip content="Sign Out" placement="right" trigger={collapsed ? "hover" : null}>
                <Sidebar.Item
                  icon={HiArrowSmRight}
                  onClick={handleSignOut}
                  as="div"
                  className="cursor-pointer"
                >
                  {!collapsed && "Sign Out"}
                </Sidebar.Item>
              </Tooltip>
            </div>
          </Sidebar.ItemGroup>
        </Sidebar.Items>

        {/* Desktop collapse toggle button */}
        {!mobileOpen && (
          <button 
            onClick={toggleSidebar}
            className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2 bg-gray-200 dark:bg-gray-700 rounded-full p-1 shadow-md"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <HiArrowSmRight className="w-5 h-5 rotate-180" />
            ) : (
              <HiArrowSmRight className="w-5 h-5" />
            )}
          </button>
        )}
      </Sidebar>

      {/* Mobile overlay to close sidebar when clicking outside */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
}
