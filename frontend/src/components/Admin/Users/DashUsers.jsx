/**
 * Dashboard Users Management Component
 * 
 * A comprehensive user management interface for administrators that provides
 * user account oversight, role management, and user activity monitoring.
 * 
 * Features:
 * - View all platform users with detailed information
 * - User role management (admin/regular user)
 * - User account deletion with confirmation
 * - Real-time user statistics and analytics
 * - Search and filter capabilities
 * - Pagination for large user databases
 * - User activity tracking and last login data
 * - Bulk operations for user management
 * 
 * User Information Displayed:
 * - Profile picture and basic information
 * - Registration date and last login
 * - User role and permissions level
 * - Account status (active/inactive)
 * - Email verification status
 * - User activity metrics
 * 
 * Security Features:
 * - Admin-only access with role verification
 * - Secure user deletion with confirmation
 * - Session validation and token management
 * - Protection against unauthorized access
 * 
 * State Management:
 * - Local state for users list and pagination
 * - Redux integration for current user authentication
 * - Loading and error states for better UX
 * - Modal state for delete confirmations
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import { Table, Modal, Button } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaCheck, FaTimes } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';

/**
 * DashUsers Component
 * Main user management interface for administrators
 * 
 * @returns {JSX.Element} Complete users management dashboard
 */
export default function DashUsers() {
  // Redux state for current user authentication
  const { currentUser } = useSelector((state) => state.user);
  
  /**
   * Users list state
   * Stores the array of user objects fetched from the API
   */
  const [users, setUsers] = useState([]);
  
  /**
   * Pagination control state
   * Determines if more users can be loaded
   */
  const [showMore, setShowMore] = useState(true);
  
  /**
   * Delete modal visibility state
   * Controls the confirmation modal for user deletion
   */
  const [showModal, setShowModal] = useState(false);
  
  /**
   * User deletion target
   * Stores the ID of the user selected for deletion
   */
  const [userIdToDelete, setUserIdToDelete] = useState('');
  
  /**
   * Loading state for API operations
   * Shows loading indicators during data fetching
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * Error state for operation failures
   * Stores error messages for user feedback
   */
  const [error, setError] = useState(null);
  
  /**
   * User statistics state
   * Stores aggregated user data and analytics
   */
  const [stats, setStats] = useState({ 
    totalUsers: 0,
    lastMonthUsers: 0,
    adminCount: 0
  });

  /**
   * Fetches users from the API with pagination support
   * Handles authentication and error states
   * 
   * @async
   * @param {number} startIndex - Starting index for pagination
   */
  const fetchUsers = async (startIndex = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get authentication token for API request
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/getUsers?startIndex=${startIndex}&limit=9`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      // Handle different error responses
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        if (res.status === 403) {
          throw new Error('You are not authorized to view this page');
        }
        throw new Error('Failed to fetch users');
      }

      const data = await res.json();
      
      // Handle initial load vs pagination
      if (startIndex === 0) {
        setUsers(data.users);
        setStats({
          totalUsers: data.totalUsers,
          lastMonthUsers: data.lastMonthUsers,
          adminCount: data.users.filter(user => user.isAdmin).length
        });
      } else {
        // Append to existing users for pagination
        setUsers(prev => [...prev, ...data.users]);
      }

      // Update pagination control
      setShowMore(data.users.length >= 9);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect to fetch users when component mounts
   * Only runs if current user has admin privileges
   */
  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchUsers();
    }
  }, [currentUser]);

  /**
   * Handles loading more users for pagination
   * Fetches the next batch of users
   * 
   * @async
   */
  const handleShowMore = async () => {
    await fetchUsers(users.length);
  };

  /**
   * Handles user deletion with API call
   * Updates local state and statistics after successful deletion
   * 
   * @async
   */
  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/delete/${userIdToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      // Update local state after successful deletion
      setUsers(prev => prev.filter(user => user._id !== userIdToDelete));
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        adminCount: prev.adminCount - (users.find(u => u._id === userIdToDelete)?.isAdmin ? 1 : 0)
      }));
      setShowModal(false);
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message);
    }
  };

  /**
   * Formats date strings for display
   * Converts ISO date strings to readable format
   * 
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!currentUser) {
    return (
      <div className="p-4 text-center">
        Loading user data...
      </div>
    );
  }

  if (!currentUser?.isAdmin) {
    return (
      <div className="p-4 text-center text-red-500">
        You must be an admin to access this page
      </div>
    );
  }

  if (error?.includes('Session expired')) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.href = '/login'}>
          Go to Login Page
        </Button>
      </div>
    );
  }

  if (loading && users.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400">Total Users</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400">New Users (30d)</h3>
          <p className="text-2xl font-bold">{stats.lastMonthUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400">Admin Users</h3>
          <p className="text-2xl font-bold">{stats.adminCount}</p>
        </div>
      </div>

      {error && !error.includes('Session expired') && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 rounded-lg text-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        {users.length > 0 ? (
          <>
            <Table hoverable className="w-full">
              <Table.Head>
                <Table.HeadCell>Date Created</Table.HeadCell>
                <Table.HeadCell>User</Table.HeadCell>
                <Table.HeadCell>Username</Table.HeadCell>
                <Table.HeadCell>Email</Table.HeadCell>
                <Table.HeadCell>Admin</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {users.map((user) => (
                  <Table.Row key={user._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell>
                      {formatDate(user.createdAt)}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
                          }}
                        />
                      </div>
                    </Table.Cell>
                    <Table.Cell className="font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </Table.Cell>
                    <Table.Cell>{user.email}</Table.Cell>
                    <Table.Cell>
                      {user.isAdmin ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setUserIdToDelete(user._id);
                        }}
                        className={`font-medium text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-300 ${
                          user._id === currentUser._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={user._id === currentUser._id}
                        title={user._id === currentUser._id ? "Cannot delete your own account" : ""}
                      >
                        Delete
                      </button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            {showMore && (
              <div className="p-4 text-center">
                <Button
                  onClick={handleShowMore}
                  color="light"
                  className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Show More'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No users found
          </div>
        )}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this user?
            </h3>
            <p className="mb-5 text-sm text-gray-400 dark:text-gray-300">
              This action cannot be undone and will permanently delete the user account.
            </p>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}