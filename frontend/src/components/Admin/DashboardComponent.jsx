/**
 * Dashboard Component
 * 
 * The main admin dashboard component that provides an overview of all platform data.
 * This component serves as the central hub for administrators to monitor and manage
 * the entire platform's content and users.
 * 
 * Features:
 * - Real-time data fetching for all major entities
 * - Loading states and error handling for each data type
 * - Pagination controls for large datasets
 * - Admin-only access with role verification
 * - Comprehensive metrics and statistics display
 * - Quick action buttons for common tasks
 * 
 * Data Sources:
 * - Users: Platform user accounts and activity
 * - Posts: Blog posts and content management
 * - Comments: User interactions and engagement
 * - Services: Environmental consulting offerings
 * - Courses: Educational content and enrollment
 * 
 * State Management:
 * - Local state for data, loading, and error states
 * - Redux integration for user authentication
 * - Pagination state for efficient data loading
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardTables from "./DashTables";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

/**
 * DashboardComponent
 * Main admin dashboard with comprehensive platform overview
 * 
 * @returns {JSX.Element} Admin dashboard with metrics and data tables
 */
export default function DashboardComponent() {
  /**
   * Data state for all platform entities
   * Stores arrays of data for each major platform component
   */
  const [data, setData] = useState({
    users: [], 
    comments: [], 
    posts: [], 
    services: [], 
    courses: [] 
  });
  
  /**
   * Loading state for each data type
   * Tracks loading status for individual API calls
   */
  const [loading, setLoading] = useState({
    users: true, 
    posts: true, 
    comments: true, 
    services: true, 
    courses: true
  });

  /**
   * Error state for each data type
   * Stores error messages for failed API calls
   */
  const [error, setError] = useState({
    users: null, 
    posts: null, 
    comments: null, 
    services: null, 
    courses: null
  });

  /**
   * Pagination configuration for each data type
   * Controls the number of items displayed and current page
   */
  const [pagination, setPagination] = useState({
    users: { limit: 5, page: 1 },
    posts: { limit: 5, page: 1 },
    comments: { limit: 5, page: 1 },
    services: { limit: 5, page: 1 },
    courses: { limit: 5, page: 1 }
  });

  // Redux state for user authentication
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  /**
   * Effect to fetch dashboard data when component mounts or pagination changes
   * Only runs if user has admin privileges
   */
  useEffect(() => {
    if (!currentUser?.isAdmin) return;
    fetchDashboardData();
  }, [currentUser, pagination]);

  /**
   * Fetches all dashboard data concurrently
   * Uses Promise.all for efficient parallel data loading
   * 
   * @async
   * @function fetchDashboardData
   */
  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchData('users', '/api/users/getUsers'),
        fetchData('posts', '/api/post'),
        fetchData('comments', '/api/comments/getComments'), // Updated endpoint
        fetchData('services', '/api/services'),
        fetchData('courses', '/api/courses')
      ]);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    }
  };

  /**
   * Generic data fetching function for all entity types
   * Handles loading states, error handling, and data transformation
   * 
   * @async
   * @param {string} type - The data type being fetched (users, posts, etc.)
   * @param {string} endpoint - The API endpoint to fetch from
   */
  const fetchData = async (type, endpoint) => {
    try {
      // Clear previous error and set loading
      setError(prev => ({...prev, [type]: null}));
      setLoading(prev => ({...prev, [type]: true}));
      
      // Get pagination parameters for this data type
      const { limit, page } = pagination[type];
      
      // Make API request with credentials for authentication
      const res = await fetch(`${endpoint}?limit=${limit}&page=${page}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Handle session expiry
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      
      if (res.status === 404) {
        throw new Error(`Endpoint not found: ${endpoint}`);
      }
      
      const response = await res.json();
      
      if (!res.ok) {
        throw new Error(response.message || `Failed to fetch ${type}`);
      }

      // Extract data from response (handles different response structures)
      const responseData = response[type] || response.users || response.posts || 
                         response.comments || response.services || response.courses || 
                         response.data || [];

      // Update state with fetched data
      setData(prev => ({
        ...prev,
        [type]: Array.isArray(responseData) ? responseData : []
      }));
    } catch (error) {
      // Set error message for this data type
      setError(prev => ({
        ...prev, 
        [type]: error.message.includes('Session expired') 
          ? error.message 
          : `Failed to load ${type}. ${error.message}`
      }));
      console.error(`${type} fetch error:`, error.message);
    } finally {
      // Always clear loading state
      setLoading(prev => ({...prev, [type]: false}));
    }
  };

  /**
   * Handles session expiration by clearing storage and redirecting
   * Shows toast notification to inform user of session expiry
   */
  const handleSessionExpired = () => {
    localStorage.clear();
    sessionStorage.clear();
    
    toast.error('Session expired. Please login again.', {
      autoClose: 5000,
      onClose: () => {
        window.location.href = '/sign-in';
      }
    });
  };

  /**
   * Handles loading more items for a specific data type
   * Increases the limit to show more items in the table
   * 
   * @param {string} type - The data type to load more items for
   */
  const handleLoadMore = (type) => {
    setPagination(prev => ({
      ...prev,
      [type]: { ...prev[type], limit: prev[type].limit + 5 }
    }));
  };

  // Render access denied message for non-admin users
  if (!currentUser?.isAdmin) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 font-medium">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div className="p-3 md:mx-auto">
      {/* Handle session expiry display */}
      {error.users?.includes('Session expired') ? (
        <div className="text-center py-8">
          <p className="text-red-500 font-medium">{error.users}</p>
        </div>
      ) : (
        // Render dashboard tables with all data
        <DashboardTables 
          data={data} 
          loading={loading} 
          error={error} 
          onLoadMore={handleLoadMore} 
        />
      )}
    </div>
  );
}