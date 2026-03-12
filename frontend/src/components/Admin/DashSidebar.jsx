/**
 * Dashboard Sidebar Component
 * 
 * Role-aware navigation sidebar for admin and instructor dashboards.
 * 
 * Admin sees:  Overview → All Courses / All Enrollments → Posts, Users,
 *              Comments, Newsletter, Announcement, Services
 * Instructor:  Overview → My Courses / My Students
 * 
 * Assignments, Live Sessions, and Resources are accessed via the
 * course drill-down (CourseDetailView) — NOT as top-level sidebar items.
 *
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
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
  
  const [tab, setTab] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = currentUser?.isAdmin;
  const isInstructor = currentUser?.isInstructor;

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

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

  /* ── Admin-only platform management tabs ── */
  const adminTabs = [
    { id: "posts", name: "Posts", icon: HiDocumentText },
    { id: "users", name: "Users", icon: HiOutlineUserGroup },
    { id: "comments", name: "Comments", icon: HiAnnotation },
    { id: "newsletter", name: "Newsletter", icon: HiMail },
    { id: "announcement", name: "Announcement", icon: HiSpeakerphone },
    { id: "services", name: "Services", icon: HiClipboardCheck },
  ];

  /* ── Course sub-tabs: role-aware ── */
  const courseTabs = isAdmin
    ? [
        { id: "courses", name: "All Courses", icon: HiAcademicCap },
        { id: "enrollments", name: "All Enrollments", icon: HiShoppingBag },
      ]
    : [
        { id: "courses", name: "My Courses", icon: HiAcademicCap },
        { id: "my-students", name: "My Students", icon: HiOutlineUserGroup },
        { id: "my-earnings", name: "My Earnings", icon: HiCurrencyDollar },
      ];

  /* Is the current tab inside the course collapse? Also match course-detail-* */
  const isCourseTabActive = courseTabs.some(t => t.id === tab) || tab?.startsWith('course-detail');

  return (
    <>
      {/* Mobile menu toggle button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-200 dark:bg-gray-700"
        aria-label="Toggle sidebar menu"
      >
        <HiOutlineViewGrid className="w-6 h-6" />
      </button>

      <Sidebar 
        className={`w-full md:w-56 fixed md:relative z-40 transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-20' : ''}`}
        collapsed={collapsed}
      >
        <Sidebar.Items>
          <Sidebar.ItemGroup className="flex flex-col gap-1">

            {/* ── Overview — first item for both roles ── */}
            <Tooltip content="Overview" placement="right" trigger={collapsed ? "hover" : null}>
              <Sidebar.Item
                active={tab === "dash"}
                icon={HiChartPie}
                onClick={() => handleTabClick("dash")}
                as="div"
                className="cursor-pointer"
              >
                {!collapsed && "Overview"}
              </Sidebar.Item>
            </Tooltip>

            {/* ── Profile ── */}
            <Tooltip content="Profile" placement="right" trigger={collapsed ? "hover" : null}>
              <Sidebar.Item
                active={tab === "profile"}
                icon={HiUser}
                label={isAdmin ? "Admin" : isInstructor ? "Instructor" : "User"}
                labelColor="dark"
                onClick={() => handleTabClick("profile")}
                as="div"
                className="cursor-pointer"
              >
                {!collapsed && "Profile"}
              </Sidebar.Item>
            </Tooltip>

            {/* ── Course Management — visible to admins AND instructors ── */}
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
                    as="div"
                    className="cursor-pointer"
                  >
                    {item.name}
                  </Sidebar.Item>
                ))}
              </Sidebar.Collapse>
            )}

            {/* ── Admin-only tabs — hidden from instructors ── */}
            {isAdmin && adminTabs.map((item) => (
              <Tooltip key={item.id} content={item.name} placement="right" trigger={collapsed ? "hover" : null}>
                <Sidebar.Item
                  active={tab === item.id}
                  icon={item.icon}
                  onClick={() => handleTabClick(item.id)}
                  as="div"
                  className="cursor-pointer"
                >
                  {!collapsed && item.name}
                </Sidebar.Item>
              </Tooltip>
            ))}

            {/* ── Sign out ── */}
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