/**
 * LoadingSpinner Component — Reusable loading indicator
 *
 * @component
 * @purpose
 *   Displays an animated loading spinner to indicate async operations or data fetching.
 *   Can be used for full-screen loading or partial loading states.
 *
 * @features
 *   - Animated spinning indicator
 *   - Full-screen or inline mode
 *   - Accessibility: aria-label, role="status", sr-only text
 *   - Dark mode support (brand green on gray)
 *   - Responsive sizing
 *
 * @props
 *   - fullScreen: boolean (default: false)
 *     When true: min-h-screen (full viewport)
 *     When false: py-12 (inline padding)
 *
 * @accessibility
 *   - role="status" for screen readers
 *   - aria-label="Loading" for context
 *   - sr-only span with "Loading…" text
 *
 * @styling
 *   - Tailwind classes
 *   - Gray border (200) with green top
 *   - Dark mode: gray-700 border, brand-green top
 *
 * @example
 *   // Inline loading (component level)
 *   {loading && <LoadingSpinner />}
 *
 *   // Full-screen loading
 *   {loading && <LoadingSpinner fullScreen />}
 *
 * @version 2.0.0
 * @author Gikonyo Mwema
 */

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