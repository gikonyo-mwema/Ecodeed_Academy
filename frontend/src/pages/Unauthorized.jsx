/**
 * Unauthorized Page — 403 access denied error page\n *\n * @component\n * @purpose Display 403 error when user lacks permissions to view resource\n * @features\n *   - Lock icon indicating access denied\n *   - 403 status code\n *   - Friendly error message\n *   - Home button link\n *   - Sign In button link\n *   - Responsive design\n * @usage\n *   Rendered by OnlyAdminPrivateRoute, OnlyInstructorPrivateRoute\n *   when user lacks required permissions\n * @example\n *   <Route path=\"/unauthorized\" element={<Unauthorized />} />\n * @version 2.0.0\n * @author Gikonyo Mwema\n */\nimport React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineLockClosed } from 'react-icons/hi';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <HiOutlineLockClosed className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">403</h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          You don&rsquo;t have permission to view this page. If you believe this
          is an error, please contact the site administrator.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-brand-green hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition"
          >
            Go Home
          </Link>
          <Link
            to="/sign-in"
            className="inline-flex items-center gap-2 border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white font-medium py-2.5 px-6 rounded-lg transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
