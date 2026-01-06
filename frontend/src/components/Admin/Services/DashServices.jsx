/**
 * Dashboard Services Management Component
 * 
 * A simplified services management interface for administrators that provides
 * direct access to the services table for CRUD operations.
 * 
 * Features:
 * - Direct access to services table
 * - Clean, streamlined interface
 * - Alert notifications for operations
 * - Admin access control
 * 
 * @component
 * @version 2.0.0
 * @author Gikonyo Mwema
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Alert } from 'flowbite-react';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import DashServicesTable from './DashServicesTable';
import { useServices } from './hooks/useServices';

/**
 * DashServices Component
 * Main services management interface for administrators
 * 
 * @returns {JSX.Element} Complete services management dashboard
 */
const DashServices = () => {
  // Redux state for user authentication
  const { currentUser } = useSelector((state) => state.user);
  
  /**
   * Custom hook for service data management
   * Handles CRUD operations and loading states
   */
  const {
    alert,
    showAlert
  } = useServices();

  // Access control for non-admin users
  if (!currentUser?.isAdmin) {
    return (
      <div className="p-4 text-center">
        <Alert color="failure">
          <span className="font-medium">Access Denied!</span> Only administrators can manage services.
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-3 max-w-7xl mx-auto min-h-screen">
      {/* Alert notification system */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-md">
          <Alert 
            color={alert.type}
            icon={alert.type === 'success' ? HiOutlineCheckCircle : HiOutlineXCircle}
            onDismiss={() => showAlert('', alert.type, false)}
            className="shadow-lg"
          >
            <span>{alert.message}</span>
          </Alert>
        </div>
      )}

      {/* Services Table */}
      <DashServicesTable />
    </div>
  );
};

export default DashServices;