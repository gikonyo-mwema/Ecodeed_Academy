/**
 * Private Route Component
 * 
 * A route protection component that handles authentication and authorization.
 * It wraps protected routes and provides:
 * - Authentication checking
 * - Admin-only route protection  
 * - Course access verification
 * - Automatic redirects for unauthorized access
 * - Loading states during auth verification
 * 
 * Usage Examples:
 * - Basic auth: <PrivateRoute><Dashboard /></PrivateRoute>
 * - Admin only: <PrivateRoute adminOnly><AdminPanel /></PrivateRoute>
 * - Course access: <PrivateRoute requireCourseAccess="course123"><CourseContent /></PrivateRoute>
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * PrivateRoute component that handles authenticated routes with optional access controls
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} [props.children=null] - Child components to render
 * @param {string|boolean} [props.requireCourseAccess=false] - Course ID or flag to check course access
 * @param {boolean} [props.adminOnly=false] - Restrict route to admin users only
 * @returns {ReactNode} - Rendered component or redirect
 */
export default function PrivateRoute({
  children = null,
  requireCourseAccess = false,
  adminOnly = false
}) {
  const { currentUser, isLoading } = useSelector((state) => state.user);
  const location = useLocation();

  // Show loading state while auth status is being determined
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Redirect unauthenticated users to sign-in page
  if (!currentUser) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Block non-admin users from admin-only routes
  if (adminOnly && !currentUser.isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check course access if required
  if (requireCourseAccess && !checkCourseAccess(currentUser, requireCourseAccess)) {
    return <Navigate to="/courses" state={{ 
      from: location,
      message: 'You do not have access to this course'
    }} replace />;
  }

  // Render children if provided, otherwise render nested routes via Outlet
  return children || <Outlet />;
}

/**
 * Checks if user has access to a specific course
 * 
 * @param {Object} user - Current user object
 * @param {string|boolean} courseAccess - Course ID or access requirement
 * @returns {boolean} - Access verification result
 */
function checkCourseAccess(user, courseAccess) {
  // Return true if no specific course access required
  if (!courseAccess || courseAccess === true) return true;
  
  // Check if user is admin or enrolled in the course
  return user.enrolledCourses?.includes(courseAccess) || user.isAdmin;
}

PrivateRoute.propTypes = {
  /** React children nodes */
  children: PropTypes.node,
  
  /** Course ID string or boolean flag */
  requireCourseAccess: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]),
  
  /** Admin-only restriction flag */
  adminOnly: PropTypes.bool
};