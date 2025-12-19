/**
 * Admin-Only Private Route Component
 * 
 * A specialized route protection component that restricts access to admin users only.
 * This component provides:
 * - Authentication verification
 * - Admin role verification
 * - Automatic redirects for unauthorized access
 * - Location state preservation for navigation
 * 
 * Usage:
 * Wrap admin-only routes with this component to ensure only authenticated admin users can access them.
 * 
 * Route Protection Flow:
 * 1. Check if user is authenticated
 * 2. If not authenticated, redirect to sign-in
 * 3. If authenticated but not admin, redirect to unauthorized page
 * 4. If admin, allow access to protected route
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import { useSelector } from 'react-redux';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

/**
 * OnlyAdminPrivateRoute component
 * Protects routes that should only be accessible to admin users
 * 
 * @returns {JSX.Element} Either the protected route content or a redirect
 */
export default function OnlyAdminPrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();

  // Redirect unauthenticated users to sign-in page
  // Preserve the attempted location for post-login redirect
  if (!currentUser) {
    return <Navigate to='/sign-in' state={{ from: location }} replace />;
  }

  // Redirect non-admin users to unauthorized page
  // Admin users have isAdmin flag set to true
  if (!currentUser.isAdmin) {
    return <Navigate to='/unauthorized' replace />;
  }

  // Render the protected admin route content
  return <Outlet />;
}
