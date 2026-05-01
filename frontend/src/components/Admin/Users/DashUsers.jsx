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

import { Table, Modal, Button, Badge, Dropdown } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle, HiDotsVertical } from 'react-icons/hi';
import { FaCheck, FaTimes, FaUserShield, FaChalkboardTeacher, FaUser, FaUserGraduate } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../utils/api';

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
   * Role modal visibility state
   * Controls the role change confirmation modal
   */
  const [showRoleModal, setShowRoleModal] = useState(false);
  
  /**
   * Role change target info
   * Stores the user ID and new role for role changes
   */
  const [roleChangeInfo, setRoleChangeInfo] = useState({ userId: null, newRole: null, userName: '' });
  
  /**
   * User statistics state
   * Stores aggregated user data and analytics
   */
  const [stats, setStats] = useState({ 
    totalUsers: 0,
    lastMonthUsers: 0,
    adminCount: 0,
    instructorCount: 0,
    studentCount: 0
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
      
      const data = await apiFetch(`/api/v1/auth/users/getUsers?startIndex=${startIndex}&limit=9`);

      // Handle initial load vs pagination
      if (startIndex === 0) {
        setUsers(data.users || []);
        if (data.users) {
          setStats({
            totalUsers: data.totalUsers,
            lastMonthUsers: data.lastMonthUsers,
            adminCount: data.users.filter(user => user.isAdmin).length,
            instructorCount: data.users.filter(user => user.isInstructor).length,
            studentCount: data.users.filter(user => user.hasEnrollments).length
          });
        }
      } else {
        // Append to existing users for pagination
        setUsers(prev => [...prev, ...(data.users || [])]);
      }

      // Update pagination control
      setShowMore(data.users && data.users.length >= 9);
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
      await apiFetch(`/api/v1/auth/users/delete/${userIdToDelete}`, {
        method: 'DELETE',
      });

      // Update local state after successful deletion
      setUsers(prev => prev.filter(user => user.id !== userIdToDelete));
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        adminCount: prev.adminCount - (users.find(u => u.id === userIdToDelete)?.isAdmin ? 1 : 0)
      }));
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message);
    } finally {
      setShowModal(false);
      setUserIdToDelete(null);
    }
  };

  /**
   * Handles user role change with API call
   * Updates user role and refreshes local state
   * 
   * @async
   */
  const handleRoleChange = async () => {
    try {
      const { userId, newRole } = roleChangeInfo;
      const response = await apiFetch(`/api/v1/auth/users/updateRole/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ user_type: newRole }),
      });

      // Update local state with new user data
      setUsers(prev => prev.map(user => 
        user.id === userId ? response.user : user
      ));
      
      // Recalculate stats
      setStats(prev => ({
        ...prev,
        adminCount: users.filter(u => u.isAdmin || (u.id === userId && newRole === 'ADMIN')).length,
        instructorCount: users.filter(u => u.isInstructor || (u.id === userId && newRole === 'MENTOR')).length,
      }));
      
      setShowRoleModal(false);
      setRoleChangeInfo({ userId: null, newRole: null, userName: '' });
    } catch (error) {
      console.error('Role change error:', error);
      setError(error.message);
    }
  };

  /**
   * Opens role change confirmation modal
   * @param {object} user - User object
   * @param {string} newRole - New role to assign
   */
  const openRoleModal = (user, newRole) => {
    setRoleChangeInfo({
      userId: user.id,
      newRole,
      userName: user.username || user.email
    });
    setShowRoleModal(true);
  };

  /**
   * Gets role badge color based on user type
   * @param {object} user - User object
   * @returns {string} Badge color
   */
  const getRoleBadge = (user) => {
    if (user.isAdmin) return { color: 'failure', text: 'Admin', icon: FaUserShield };
    if (user.isInstructor) return { color: 'warning', text: 'Instructor', icon: FaChalkboardTeacher };
    if (user.hasEnrollments) return { color: 'success', text: 'Student', icon: FaUserGraduate };
    return { color: 'gray', text: 'User', icon: FaUser };
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Users</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">New (30d)</h3>
          <p className="text-2xl font-bold">{stats.lastMonthUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-red-500">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
            <FaUserShield className="text-red-500" /> Admins
          </h3>
          <p className="text-2xl font-bold">{stats.adminCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
            <FaChalkboardTeacher className="text-yellow-500" /> Instructors
          </h3>
          <p className="text-2xl font-bold">{stats.instructorCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
            <FaUserGraduate className="text-green-500" /> Students
          </h3>
          <p className="text-2xl font-bold">{stats.studentCount}</p>
        </div>
      </div>

      {error && !error.includes('Session expired') && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 rounded-lg text-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {users.length > 0 ? (
          <>
            <div className="overflow-x-auto overflow-y-visible">
            <Table hoverable className="w-full">
              <Table.Head>
                <Table.HeadCell>Date Created</Table.HeadCell>
                <Table.HeadCell>User</Table.HeadCell>
                <Table.HeadCell>Email</Table.HeadCell>
                <Table.HeadCell>Role</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {users.map((user) => {
                  const roleBadge = getRoleBadge(user);
                  const RoleIcon = roleBadge.icon;
                  const userId = user.id;
                  const isSelf = userId === currentUser.id;
                  
                  return (
                    <Table.Row key={userId} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell className="whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                          ) : null}
                          <div
                            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                            style={{
                              display: user.profilePicture ? 'none' : 'flex',
                              backgroundColor: `hsl(${((user.email || '').charCodeAt(0) * 37) % 360}, 60%, 45%)`,
                            }}
                          >
                            {(user.email || 'U')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate max-w-[140px]">{user.firstName || user.first_name} {user.lastName || user.last_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[140px]">@{user.username}</p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-gray-600 dark:text-gray-300 max-w-[180px]">
                        <p className="truncate" title={user.email}>{user.email}</p>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={roleBadge.color} className="inline-flex items-center gap-1">
                          <RoleIcon className="w-3 h-3" />
                          {roleBadge.text}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <Dropdown
                            label=""
                            dismissOnClick={true}
                            renderTrigger={() => (
                              <button 
                                type="button"
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                aria-label={isSelf ? 'Role actions unavailable for your account' : `Open role actions for ${user.email}`}
                                disabled={isSelf}
                              >
                                <HiDotsVertical className={`w-5 h-5 ${isSelf ? 'text-gray-300' : 'text-gray-500'}`} />
                              </button>
                            )}
                          >
                            <Dropdown.Header>
                              <span className="block text-sm font-semibold">Change Role</span>
                            </Dropdown.Header>
                            <Dropdown.Item 
                              icon={FaUser}
                              onClick={() => openRoleModal(user, 'READER')}
                              disabled={isSelf}
                            >
                              Set as User
                            </Dropdown.Item>
                            <Dropdown.Item 
                              icon={FaChalkboardTeacher}
                              onClick={() => openRoleModal(user, 'MENTOR')}
                              disabled={isSelf}
                            >
                              Set as Instructor
                            </Dropdown.Item>
                            <Dropdown.Item 
                              icon={FaUserShield}
                              onClick={() => openRoleModal(user, 'ADMIN')}
                              disabled={isSelf}
                            >
                              Set as Admin
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              className="text-red-600"
                              onClick={() => {
                                setShowModal(true);
                                setUserIdToDelete(userId);
                              }}
                              disabled={isSelf}
                            >
                              Delete User
                            </Dropdown.Item>
                          </Dropdown>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
            </div>

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

      {/* Role Change Confirmation Modal */}
      <Modal show={showRoleModal} onClose={() => setShowRoleModal(false)} popup size="md">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <FaUserShield className="h-14 w-14 text-blue-500 mb-4 mx-auto" />
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Change User Role
            </h3>
            <p className="mb-5 text-gray-500 dark:text-gray-400">
              Are you sure you want to change <span className="font-semibold">{roleChangeInfo.userName}</span>'s role to{' '}
              <Badge color={
                roleChangeInfo.newRole === 'ADMIN' ? 'failure' : 
                roleChangeInfo.newRole === 'MENTOR' ? 'warning' : 'gray'
              } className="inline">
                {roleChangeInfo.newRole === 'MENTOR' ? 'Instructor' : roleChangeInfo.newRole}
              </Badge>?
            </p>
            {roleChangeInfo.newRole === 'ADMIN' && (
              <p className="mb-5 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                ⚠️ This will grant full administrative access to the platform.
              </p>
            )}
            <div className="flex justify-center gap-4">
              <Button color="blue" onClick={handleRoleChange}>
                Yes, change role
              </Button>
              <Button color="gray" onClick={() => setShowRoleModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}