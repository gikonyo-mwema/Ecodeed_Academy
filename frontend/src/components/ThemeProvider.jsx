
/**
 * Theme Provider Component
 * 
 * A context provider component that manages global theme state for the entire application.
 * This component applies theme classes and provides consistent theming across all components.
 * 
 * Features:
 * - Redux integration for theme state management
 * - CSS class-based theme switching (light/dark)
 * - Consistent color scheme application
 * - Automatic theme persistence via Redux
 * - Seamless theme transitions
 * 
 * Theme Implementation:
 * - Uses Tailwind CSS dark mode classes
 * - Brand colors for consistent identity
 * - Light theme: Gray-50 background with dark text
 * - Dark theme: Brand-blue background with light text
 * 
 * State Management:
 * - Reads theme state from Redux store
 * - No local state - fully controlled by Redux
 * - Theme changes propagate automatically to all children
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import React from 'react';
import { useSelector } from 'react-redux';

/**
 * ThemeProvider Component
 * 
 * Wraps the entire application with theme-aware styling.
 * Applies appropriate CSS classes based on current theme state.
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to wrap with theme
 * @returns {JSX.Element} Theme-wrapped application content
 */
export default function ThemeProvider({ children }) {
  // Get current theme from Redux store
  const { theme } = useSelector((state) => state.theme);

  return (
    <div className={theme}>
      <div className="bg-gray-50 text-gray-800 dark:bg-brand-blue dark:text-gray-300 min-h-screen">
        {children}
      </div>
    </div>
  );
}
