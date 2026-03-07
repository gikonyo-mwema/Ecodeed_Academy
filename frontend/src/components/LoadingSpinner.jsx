import React from "react";

const LoadingSpinner = ({ fullScreen = false }) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "min-h-screen" : "py-12"
      }`}
      role="status"
      aria-label="Loading"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-green" />
      <span className="sr-only">Loading…</span>
    </div>
  );
};

export default LoadingSpinner;