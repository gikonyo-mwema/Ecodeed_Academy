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

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import DashboardTables from "./DashTables";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

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
    courses: [],
    payments: [], // payment records for admin view
    enrollments: [] // all student enrollments
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
    courses: true,
    payments: true,
    enrollments: true
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
    courses: null,
    payments: null,
    enrollments: null
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
    courses: { limit: 5, page: 1 },
    payments: { limit: 5, page: 1 },
    enrollments: { limit: 5, page: 1 }
  });

  // Redux state for user authentication
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  /**
   * Generic data fetching function for a single entity type.
   * Handles loading states, error handling, and data transformation.
   */
  const fetchData = useCallback(async (type, endpoint, limit, page) => {
    try {
      setError(prev => ({...prev, [type]: null}));
      setLoading(prev => ({...prev, [type]: true}));

      const response = await apiFetch(`${endpoint}?limit=${limit}&page=${page}`);

      // Extract data from response (handles different DRF/custom response structures)
      const responseData = response[type] || response.users || response.posts || 
                         response.comments || response.services || response.courses || 
                         response.payments || response.data || response.results || [];

      setData(prev => ({
        ...prev,
        [type]: Array.isArray(responseData) ? responseData : []
      }));
    } catch (err) {
      setError(prev => ({
        ...prev, 
        [type]: err.message.includes('Session expired') 
          ? err.message 
          : `Failed to load ${type}. ${err.message}`
      }));
    } finally {
      setLoading(prev => ({...prev, [type]: false}));
    }
  }, []);

  /** Endpoint map — keeps the route list in one place */
  const endpoints = {
    users: '/api/v1/auth/users/getUsers',
    posts: '/api/v1/posts/',
    comments: '/api/v1/comments/getComments',
    services: '/api/v1/services/',
    courses: '/api/v1/courses/',
    payments: '/api/v1/payments/history/',
    enrollments: '/api/v1/enrollments/',
  };

  /**
   * Initial fetch — runs once on mount (admin only).
   * Fetches all 7 entity types in parallel with their default pagination.
   */
  useEffect(() => {
    if (!currentUser?.isAdmin) return;

    Object.entries(endpoints).forEach(([type, endpoint]) => {
      const { limit, page } = pagination[type];
      fetchData(type, endpoint, limit, page);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  /**
   * Handles loading more items for a specific data type.
   * Increases the limit and refetches ONLY that type.
   */
  const handleLoadMore = (type) => {
    setPagination(prev => {
      const updated = { ...prev[type], limit: prev[type].limit + 5 };
      // Fetch only the affected type with the new limit
      fetchData(type, endpoints[type], updated.limit, updated.page);
      return { ...prev, [type]: updated };
    });
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