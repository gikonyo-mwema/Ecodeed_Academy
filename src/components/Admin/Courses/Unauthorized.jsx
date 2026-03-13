/**
 * Unauthorized Component
 * 
 * Displays an error message when a user attempts to access restricted content
 * without proper authorization. Used for access control and permission enforcement.
 * 
 * Features:
 * - Full-screen centered error message
 * - Clear authorization rejection feedback
 * - Responsive design
 * - Styled for visibility and emphasis
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 * 
 * @returns {JSX.Element} Unauthorized access message
 * 
 * @example
 * ```jsx
 * {!hasAccess && <Unauthorized />}
 * ```
 */

// Reusable components
export function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">You are not authorized to view this page</p>
    </div>
  );
}
