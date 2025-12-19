/**
 * Dashboard Sidebar Component
 * 
 * A responsive navigation sidebar for the admin dashboard that provides
 * easy access to all administrative functions and data management sections.
 * 
 * Features:
 * - Responsive design with mobile toggle functionality
 * - Collapsible sidebar for better screen space utilization
 * - Active tab highlighting based on URL parameters
 * - Tooltips for better user experience when collapsed
 * - Role-based access control (admin only)
 * - Sign out functionality with proper state cleanup
 * 
 * Navigation Sections:
 * - Dashboard Overview: Main dashboard with all data summaries
 * - User Management: User accounts, permissions, and activity
 * - Content Management: Posts, comments, and content moderation
 * - Business Operations: Services, courses, and enrollment
 * - Financial Tracking: Payments and revenue analytics
 * - Communication: Email newsletters and messaging
 * 
 * State Management:
 * - Local state for sidebar collapse and mobile menu
 * - URL-based active tab tracking
 * - Redux integration for user authentication
 * 
 * @component
 * @version 1.0.0
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
  HiMail
} from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "../../redux/user/userSlice"; 

/**
 * DashSidebar Component
 * Administrative navigation sidebar with responsive design
 * 
 * @returns {JSX.Element} Responsive sidebar with admin navigation options
 */
export default function DashSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state for user authentication
  const { currentUser } = useSelector((state) => state.user);
  
  /**
   * Current active tab state
   * Synchronized with URL parameters for proper navigation
   */
  const [tab, setTab] = useState("");
  
  /**
   * Sidebar collapsed state for desktop view
   * Allows users to maximize content area when needed
   */
  const [collapsed, setCollapsed] = useState(false);
  
  /**
   * Mobile menu open state
   * Controls sidebar visibility on mobile devices
   */
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Effect to sync tab state with URL parameters
   * Updates active tab when user navigates via URL
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  /**
   * Handles user sign out process
   * Clears Redux state and redirects to sign-in page
   * 
   * @async
   */
  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      navigate("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  /**
   * Handles tab navigation with mobile responsiveness
   * Updates URL and closes mobile menu on small screens
   * 
   * @param {string} tabName - The tab name to navigate to
   */
  const handleTabClick = (tabName) => {
    navigate(`/dashboard?tab=${tabName}`);
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  /**
   * Toggles sidebar visibility/collapse state
   * Handles both mobile menu toggle and desktop collapse
   */
  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  /**
   * Admin navigation tab configuration
   * Defines all available admin sections with icons and routing
   */
  const adminTabs = [
    { id: "posts", name: "Posts", icon: HiDocumentText },
    { id: "users", name: "Users", icon: HiOutlineUserGroup },
    { id: "comments", name: "Comments", icon: HiAnnotation },
    { id: "newsletter", name: "Newsletter", icon: HiMail },
    { id: "services", name: "Services", icon: HiClipboardCheck },
    { id: "courses", name: "Courses", icon: HiAcademicCap }
  ];

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

            {/* Main sidebar component with responsive design */}
      <Sidebar 
        className={`w-full md:w-56 fixed md:relative z-40 transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-20' : ''}`}
        collapsed={collapsed}
      >
        <Sidebar.Items>
          <Sidebar.ItemGroup className="flex flex-col gap-1">
            {/* User profile section */}
            <Tooltip content="Profile" placement="right" trigger={collapsed ? "hover" : null}>
              <Sidebar.Item
                active={tab === "profile"}
                icon={HiUser}
                label={currentUser?.isAdmin ? "Admin" : "User"}
                labelColor="dark"
                onClick={() => handleTabClick("profile")}
                as="div"
                className="cursor-pointer"
              >
                {!collapsed && "Profile"}
              </Sidebar.Item>
            </Tooltip>

            {/* Admin navigation tabs */}
            {currentUser?.isAdmin && adminTabs.map((item) => (
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

            {/* Sign out option */}
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