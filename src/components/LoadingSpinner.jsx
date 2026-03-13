/**
 * Loading Spinner Component
 * 
 * A reusable loading spinner component used throughout the application
 * to indicate loading states and asynchronous operations.
 * 
 * Usage:
 * import LoadingSpinner from '@/components/LoadingSpinner';
 * 
 * {isLoading && <LoadingSpinner />}
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React from "react";

/**
 * LoadingSpinner - Displays an animated loading spinner
 * 
 * @returns {JSX.Element} A centered loading spinner component
 */
const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="loading-spinner"></div>
    </div>
  );
};

export default LoadingSpinner;