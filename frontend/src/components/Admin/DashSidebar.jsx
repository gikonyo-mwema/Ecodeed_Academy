/**
 * Dashboard Sidebar Component
 * 
 * Responsive role-aware navigation sidebar for admin and instructor dashboards.
 * Intelligently shows/hides menu items based on user role to prevent unauthorized access.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ROLE-BASED MENU STRUCTURE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * ADMIN USERS see (complete menu):
 * ├─ Overview (dashboard)
 * ├─ Profile (settings)
 * ├─ Teaching (collapsible)
 * │  ├─ All Courses
 * │  └─ All Enrollments
 * └─ Platform Management (admin-only tabs)
 *    ├─ Posts (moderation)
 *    ├─ Users (role management)
 *    ├─ Comments (discussion moderation)
 *    ├─ Newsletter (bulk email)
 *    ├─ Announcement (platform announcements)
 *    └─ Services (service management)
 * └─ Sign Out
 * 
 * INSTRUCTOR USERS see (teaching-focused menu):
 * ├─ Overview (personal dashboard)
 * ├─ Profile (settings)
 * ├─ Teaching (collapsible)
 * │  ├─ My Courses
 * │  ├─ My Students
 * │  └─ My Earnings
 * └─ Sign Out
 * 
 * (Admin-only sections are completely hidden from instructors)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * RESPONSIVE BEHAVIOR
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * DESKTOP (md and above):
 * - Sidebar is sticky, always visible
 * - Collapse toggle button in bottom-right corner
 * - When collapsed: icons only, text hidden, tooltips on hover
 * - When expanded: full width (w-56) with text labels
 * 
 * MOBILE (below md):
 * - Hamburger menu toggle in fixed position (top-left)
 * - Sidebar slides in from left with z-40 stacking
 * - Semi-transparent overlay behind sidebar
 * - Auto-closes when clicking a menu item or overlay
 * - Full width when open
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FEATURES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * Active State Indication:
 * - Current tab highlighted with active styling
 * - Teaching section expands automatically if viewing course tabs
 * 
 * Tooltips:
 * - Appear on hover when sidebar is collapsed (desktop)
 * - Text labels disappear when collapsed for cleaner UI
 * 
 * Sign Out:
 * - Dispatches Redux signOut action
 * - Redirects to /sign-in on success
 * - Error handling with console logging
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 * @example
 * // Renders role-aware navigation sidebar for admin/instructor dashboard
 * <DashSidebar />
 */

import React, { useEffect, useState } from "react";
import { Sidebar, Tooltip } from "flowbite-react";
import { 
  HiUser, 
  HiArrowSmRight, 
  HiDocumentText, 
  HiOutlineUserGroup, 
  HiAnnotation,  
  HiClipboardCheck,
  HiAcademicCap,
  HiOutlineViewGrid,
  HiMail,
  HiShoppingBag,
  HiChartPie,
  HiSpeakerphone,
  HiCurrencyDollar,
} from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "../../redux/user/userSlice"; 

export default function DashSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentUser } = useSelector((state) => state.user);
  
  // ════════════════ STATE ════════════════
  const [tab, setTab] = useState("");              // Currently active tab from URL
  const [collapsed, setCollapsed] = useState(false); // Desktop collapse state
  const [mobileOpen, setMobileOpen] = useState(false); // Mobile sidebar open state

  // ════════════════ ROLE CHECKS ════════════════
  const isAdmin = currentUser?.isAdmin;           // Admin permission flag
  const isInstructor = currentUser?.isInstructor; // Instructor permission flag

  /**
   * SYNC URL WITH TAB STATE
   * Parses URL query parameter to highlight active menu item
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  /**
   * HANDLE TAB NAVIGATION
   * Navigates to tab by setting URL query parameter
   * On mobile: closes sidebar after navigation
   * 
   * @param {string} tabName - Tab identifier (e.g., 'posts', 'users', 'courses')
   */
  const handleTabClick = (tabName) => {
    navigate(`/dashboard?tab=${tabName}`);
    // Close mobile sidebar after selection
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  /**
   * TOGGLE SIDEBAR
   * - Desktop: Toggles collapsed state (w-56 → w-20)
   * - Mobile: Toggles mobile sidebar visibility
   */
  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  /**
   * SIGN OUT HANDLER
   * Dispatches Redux signOut action and redirects to login
   * Handles errors gracefully with console logging
   */
  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      navigate("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  // ════════════════ ADMIN-ONLY MENU ITEMS ════════════════
  // These tabs only appear for users with isAdmin=true
  const adminTabs = [
    { id: "posts", name: "Posts", icon: HiDocumentText },
    { id: "users", name: "Users", icon: HiOutlineUserGroup },
    { id: "comments", name: "Comments", icon: HiAnnotation },
    { id: "newsletter", name: "Newsletter", icon: HiMail },
    { id: "announcement", name: "Announcement", icon: HiSpeakerphone },
    { id: "services", name: "Services", icon: HiClipboardCheck },
  ];

  // ════════════════ ROLE-AWARE COURSE TABS ════════════════
  // Admin sees "All Courses/Enrollments", Instructor sees "My Courses/Students/Earnings"
  const courseTabs = isAdmin
    ? [
        { id: "courses", name: "All Courses", icon: HiAcademicCap },
        { id: "enrollments", name: "All Enrollments", icon: HiShoppingBag },
        { id: "instructors", name: "Instructors", icon: HiOutlineUserGroup },
      ]
    : [
        { id: "courses", name: "My Courses", icon: HiAcademicCap },
        { id: "my-students", name: "My Students", icon: HiOutlineUserGroup },
        { id: "my-earnings", name: "My Earnings", icon: HiCurrencyDollar },
      ];

  /**
   * DETECT IF COURSE TABS SECTION IS ACTIVE
   * Returns true if current tab is one of the course tabs
   * or if tab starts with 'course-detail-' (drill-down view)
   * This keeps the Teaching collapse open when inside course views
   */
  const isCourseTabActive = courseTabs.some(t => t.id === tab) || tab?.startsWith('course-detail');

  return (
    <>
      {/* ════════════════ MOBILE MENU TOGGLE ════════════════ */}
      {/* Hamburger button visible only on mobile */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-200 dark:bg-gray-700"
        aria-label="Toggle sidebar menu"
      >
        <HiOutlineViewGrid className="w-6 h-6" />
      </button>

      {/* ════════════════ SIDEBAR CONTAINER ════════════════ */}
      <Sidebar 
        className={`w-full md:w-56 fixed md:relative z-40 transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-20' : ''}`}
        collapsed={collapsed}
      >
        <Sidebar.Items>
          <Sidebar.ItemGroup className="flex flex-col gap-1">

            {/* ─────────────── OVERVIEW (First Item) ─────────────── */}
            {/* Dashboard overview — available to both admins and instructors */}
            <Tooltip content="Overview" placement="right" trigger={collapsed ? "hover" : null}>
              <Sidebar.Item
                active={tab === "dash"}
                icon={HiChartPie}
                onClick={() => handleTabClick("dash")}
                as="button"
                type="button"
                className="cursor-pointer"
              >
                {!collapsed && "Overview"}
              </Sidebar.Item>
            </Tooltip>

            {/* ─────────────── PROFILE ─────────────── */}
            {/* User profile settings with role label */}
            <Tooltip content="Profile" placement="right" trigger={collapsed ? "hover" : null}>
              <Sidebar.Item
                active={tab === "profile"}
                icon={HiUser}
                label={isAdmin ? "Admin" : isInstructor ? "Instructor" : "User"}
                labelColor="dark"
                onClick={() => handleTabClick("profile")}
                as="button"
                type="button"
                className="cursor-pointer"
              >
                {!collapsed && "Profile"}
              </Sidebar.Item>
            </Tooltip>

            {/* ─────────────── COURSE MANAGEMENT COLLAPSE ─────────────── */}
            {/* Visible to admins and instructors — contains role-specific options */}
            {(isAdmin || isInstructor) && (
              <Sidebar.Collapse 
                icon={HiAcademicCap} 
                label={isAdmin ? "Courses" : "Teaching"} 
                open={isCourseTabActive}
              >
                {courseTabs.map((item) => (
                  <Sidebar.Item
                    key={item.id}
                    active={tab === item.id}
                    icon={item.icon}
                    onClick={() => handleTabClick(item.id)}
                    as="button"
                    type="button"
                    className="cursor-pointer"
                  >
                    {item.name}
                  </Sidebar.Item>
                ))}
              </Sidebar.Collapse>
            )}

            {/* ─────────────── ADMIN-ONLY MANAGEMENT TABS ─────────────── */}
            {/* These sections only appear for admin users */}
            {isAdmin && adminTabs.map((item) => (
              <Tooltip key={item.id} content={item.name} placement="right" trigger={collapsed ? "hover" : null}>
                <Sidebar.Item
                  active={tab === item.id}
                  icon={item.icon}
                  onClick={() => handleTabClick(item.id)}
                  as="button"
                  type="button"
                  className="cursor-pointer"
                >
                  {!collapsed && item.name}
                </Sidebar.Item>
              </Tooltip>
            ))}

            {/* ─────────────── SIGN OUT ─────────────── */}
            {/* Logout button with sign-out action */}
            <Tooltip content="Sign Out" placement="right" trigger={collapsed ? "hover" : null}>
              <Sidebar.Item
                icon={HiArrowSmRight}
                onClick={handleSignOut}
                as="button"
                type="button"
                className="cursor-pointer"
              >
                {!collapsed && "Sign Out"}
              </Sidebar.Item>
            </Tooltip>
          </Sidebar.ItemGroup>
        </Sidebar.Items>

        {/* ════════════════ DESKTOP COLLAPSE TOGGLE ════════════════ */}
        {/* Floating button in bottom-right corner for expanding/collapsing sidebar */}
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

      {/* ════════════════ MOBILE OVERLAY ════════════════ */}
      {/* Semi-transparent backdrop that appears when mobile sidebar is open */}
      {/* Click to close sidebar (improves UX on mobile) */}
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