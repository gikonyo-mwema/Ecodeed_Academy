/**
 * Header Navigation Component
 * 
 * A comprehensive navigation header that provides:
 * - Logo and branding
 * - Main navigation menu (desktop and mobile)
 * - Search functionality
 * - User authentication dropdown
 * - Theme toggle (dark/light mode)
 * - Responsive design with mobile hamburger menu
 * 
 * Features:
 * - Dynamic theme-based styling
 * - User authentication state management
 * - Search with URL parameter handling
 * - Dropdown menus for user actions
 * - Mobile-responsive navigation
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React from "react";
import {
  Avatar,
  Button,
  Dropdown,
  Navbar,
  TextInput,
} from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signOut } from "../redux/user/userSlice";
import { useEffect, useState } from "react";

/**
 * Header Component
 * Main navigation component with authentication, search, and theme management
 * 
 * @returns {JSX.Element} The header navigation component
 */
export default function Header() {
  // Router hooks
  const path = useLocation().pathname;
  const location = useLocation();
  const navigate = useNavigate();
  
  // Redux hooks
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  /**
   * Effect to sync search term with URL parameters
   * Updates local search state when URL search parameters change
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  /**
   * Handles user sign out
   * Dispatches sign out action and redirects to sign in page
   * 
   * @async
   * @function handleSignout
   */
  const handleSignout = async () => {
    try {
      await dispatch(signOut()).unwrap();
      navigate("/sign-in");
    } catch (error) {
      console.error("Sign-out failed:", error.message);
    }
  };

  /**
   * Handles search form submission
   * Updates URL with search parameters and navigates to search page
   * 
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", searchTerm);
    navigate(`/search?${urlParams.toString()}`);
  // Close mobile search after submitting
  setIsMobileSearchOpen(false);
  };

  // Logo URL based on current theme
  const logoUrl = theme === "light" 
    ? "https://res.cloudinary.com/dcrubaesi/image/upload/v1753007363/ECODEED_BLACK_LOGO_xtwjoy.png"
    : "https://res.cloudinary.com/dcrubaesi/image/upload/v1737333837/ECODEED_COLORED_LOGO_wj2yy8.png";

  // Default user avatar
  const userAvatar = currentUser?.profilePicture || 
    "https://res.cloudinary.com/dcrubaesi/image/upload/v1753008847/EcodeedUser2_ekhqvm.jpg";

  return (
    <header className={`sticky top-0 z-50 ${theme === "light" ? "bg-white shadow-md" : "bg-brand-blue"}`}>
      {/* Top Quote Bar (hide on very small screens) */}
      <div className="bg-brand-green py-2 px-4 text-center hidden sm:block">
        <p className="text-sm italic text-white inline">
          "Empowering a sustainable future through expert environmental consulting"{" "}
          <Link
            to="/about"
            className="text-xs text-brand-yellow hover:underline inline font-medium"
          >
            Learn more →
          </Link>
        </p>
      </div>

      {/* Main Navbar */}
      <Navbar
        fluid
        rounded
        className={`border-b ${theme === "light" ? "border-gray-200" : "border-gray-700"} max-w-7xl mx-auto px-4 py-3 ${theme === "light" ? "bg-white" : "bg-brand-blue"}`}
      >
        {/* Logo Section */}
        <Navbar.Brand as={Link} to="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
          <img
            src={logoUrl}
            alt="Ecodeed Logo"
            className="h-10 w-10"
          />
          {/* Hide wordmark on mobile, show only on >=sm */}
          <span className={`hidden sm:inline self-center text-xl font-semibold whitespace-nowrap ${theme === "light" ? "text-brand-blue" : "text-white"}`}>
            Ecodeed
          </span>
        </Navbar.Brand>

        {/* Desktop Search Form */}
        <form
          onSubmit={handleSubmit}
          className="hidden md:block flex-1 max-w-xs md:max-w-md mx-2 md:mx-4"
        >
          <div className={`relative flex items-center rounded-full border ${
            theme === "light" 
              ? "border-gray-300 bg-gray-50 focus-within:border-brand-green" 
              : "border-gray-600 bg-gray-700 focus-within:border-brand-yellow"
          } transition-colors duration-200`}>
            <input
              type="text"
              placeholder="Search articles..."
              className={`w-full h-10 pl-4 pr-10 text-sm bg-transparent outline-none rounded-full ${
                theme === "light" ? "text-gray-800" : "text-white"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                theme === "light" ? "text-gray-500" : "text-gray-300"
              } hover:text-brand-green`}
              aria-label="Search"
            >
              <AiOutlineSearch className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Navbar Links - Center */}
        <div className="hidden lg:flex lg:items-center lg:space-x-4">
          {[
            { to: "/", label: "Home" },
            { to: "/about", label: "About" },
            { to: "/services", label: "Services" },
            /*{ to: "/courses", label: "Courses" },*/
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                path === to
                  ? "text-white bg-brand-green"
                  : theme === "light"
                    ? "text-brand-blue hover:text-brand-green hover:bg-gray-100"
                    : "text-white hover:text-brand-yellow hover:bg-gray-700"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 md:gap-3 flex-nowrap">
          {/* Mobile Search Toggle */}
          <Button
            className="w-9 h-9 md:hidden"
            color="gray"
            pill
            size="sm"
            onClick={() => setIsMobileSearchOpen((s) => !s)}
            aria-label={isMobileSearchOpen ? "Close search" : "Open search"}
            aria-expanded={isMobileSearchOpen}
          >
            <AiOutlineSearch className={theme === "light" ? "text-gray-700" : "text-white"} />
          </Button>
          {/* Theme Toggle */}
          <Button
            className="w-9 h-9"
            color="gray"
            pill
            size="sm"
            onClick={() => dispatch(toggleTheme())}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {theme === "light" ? (
              <FaSun className="text-brand-yellow" />
            ) : (
              <FaMoon className="text-white" />
            )}
          </Button>

          {/* User Avatar/Dropdown */}
          {currentUser ? (
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar
                  alt="user"
                  img={userAvatar}
                  rounded
                  size="sm"
                  className={`border-2 ${theme === "light" ? "border-brand-green" : "border-brand-yellow"} cursor-pointer hover:scale-105 transition-transform duration-200`}
                />
              }
              className="z-50"
            >
              <Dropdown.Header>
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  @{currentUser.username}
                </span>
                <span className="block text-sm text-gray-500 dark:text-gray-400 truncate">
                  {currentUser.email}
                </span>
              </Dropdown.Header>
              <Link to="/dashboard?tab=profile">
                <Dropdown.Item className="text-gray-700 dark:text-gray-200 hover:!bg-brand-green dark:hover:!bg-brand-green hover:!text-white dark:hover:!text-white transition-colors duration-200 focus:!bg-brand-green focus:!text-white">
                  My Profile
                </Dropdown.Item>
              </Link>
              {currentUser.isAdmin && (
                <Link to="/dashboard">
                  <Dropdown.Item className="text-gray-700 dark:text-gray-200 hover:!bg-brand-blue dark:hover:!bg-brand-blue hover:!text-white dark:hover:!text-white transition-colors duration-200 focus:!bg-brand-blue focus:!text-white">
                    Admin Dashboard
                  </Dropdown.Item>
                </Link>
              )}
              <Dropdown.Divider />
              <Dropdown.Item 
                onClick={handleSignout}
                className="text-gray-700 dark:text-gray-200 hover:!bg-red-500 dark:hover:!bg-red-500 hover:!text-white dark:hover:!text-white transition-colors duration-200 focus:!bg-red-500 focus:!text-white"
              >
                Sign out
              </Dropdown.Item>
            </Dropdown>
          ) : (
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar
                  alt="user"
                  rounded
                  size="sm"
                  img={userAvatar}
                  className={`border-2 cursor-pointer hover:scale-105 transition-transform duration-200 ${
                    theme === "light" 
                      ? "border-brand-green bg-gray-100" 
                      : "border-brand-yellow bg-gray-700"
                  }`}
                />
              }
              className="z-50"
            >
              <Link to="/sign-in">
                <Dropdown.Item className="text-gray-700 dark:text-gray-200 hover:!bg-brand-green dark:hover:!bg-brand-green hover:!text-white dark:hover:!text-white transition-colors duration-200 focus:!bg-brand-green focus:!text-white">
                  Sign In
                </Dropdown.Item>
              </Link>
              <Link to="/sign-up">
                <Dropdown.Item className="text-gray-700 dark:text-gray-200 hover:!bg-brand-blue dark:hover:!bg-brand-blue hover:!text-white dark:hover:!text-white transition-colors duration-200 focus:!bg-brand-blue focus:!text-white">
                  Sign Up
                </Dropdown.Item>
              </Link>
            </Dropdown>
          )}

          <Navbar.Toggle className="lg:hidden text-brand-green dark:text-brand-yellow" />
        </div>

        {/* Mobile Search Panel */}
        {isMobileSearchOpen && (
          <div className="md:hidden w-full mt-3 px-1 sm:px-0">
            <form onSubmit={handleSubmit} className="px-2">
              <div className={`relative flex items-center rounded-full border ${
                theme === "light" 
                  ? "border-gray-300 bg-gray-50 focus-within:border-brand-green" 
                  : "border-gray-600 bg-gray-700 focus-within:border-brand-yellow"
              } transition-colors duration-200`}>
                <input
                  type="text"
                  placeholder="Search articles..."
                  className={`w-full h-10 pl-4 pr-10 text-sm bg-transparent outline-none rounded-full ${
                    theme === "light" ? "text-gray-800" : "text-white"
                  }`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    theme === "light" ? "text-gray-500" : "text-gray-300"
                  } hover:text-brand-green`}
                  aria-label="Search"
                >
                  <AiOutlineSearch className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        <Navbar.Collapse className="lg:hidden w-full mt-3 bg-white dark:bg-brand-blue rounded-lg shadow-lg">
          {[
            { to: "/", label: "Home" },
            { to: "/about", label: "About" },
            { to: "/services", label: "Services" },
          ].map(({ to, label }) => (
            <Navbar.Link
              key={to}
              active={path === to}
              as={Link}
              to={to}
              className={`px-4 py-3 rounded-md transition-colors duration-200 ${
                path === to
                  ? "bg-brand-green text-white"
                  : theme === "light"
                    ? "text-brand-blue hover:bg-gray-100 hover:text-brand-green"
                    : "text-white hover:bg-gray-700 hover:text-brand-yellow"
              }`}
            >
              {label}
            </Navbar.Link>
          ))}
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
}