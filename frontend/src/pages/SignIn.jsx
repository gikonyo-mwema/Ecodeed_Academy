/**
<<<<<<< HEAD:src/pages/SignIn.jsx
 * Sign In Page Component
 * User authentication page with email/password and OAuth.
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */
/**
 * Sign In Page Component
 * User authentication page with email/password and OAuth.
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */
=======
 * Sign In Page
 * 
 * User login page with email/password authentication.
 * Features:
 * - Email & password form validation
 * - Redux-based authentication flow
 * - OAuth integration (Google, Facebook, Twitter)
 * - Responsive layout (desktop + mobile)
 * - Loading states and error handling
 * - Auto-redirect to dashboard on successful login
 * - Link to sign up for new users
 * 
 * Form Validation:
 * - Email format: RFC 5322 basic validation
 * - Password: minimum 6 characters
 * - Both fields required
 * 
 * State Management:
 * - Redux user slice for auth state
 * - Local state for form data and validation errors
 * 
 * API Endpoints Used:
 * - POST /api/v1/auth/login/ (email/password)
 * - POST /api/v1/auth/google/ (via OAuth)
 * - POST /api/v1/auth/facebook/ (via OAuth)
 * 
 * @component
 * @returns {JSX.Element} Sign in page with form and OAuth options
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

>>>>>>> origin/develop:frontend/src/pages/SignIn.jsx
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signIn } from "../redux/user/userSlice";
import OAuth from "../components/OAuth";

/**
 * SignIn Component
 * Main login page for user authentication
 * 
 * @returns {JSX.Element} Renders sign in form with two-column layout
 */
export default function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [validationError, setValidationError] = useState(null);
  const { loading, error: errorMessage, currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value.trim(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    const { email, password } = formData;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      return setValidationError("Please fill in all fields.");
    }

    if (!emailRegex.test(email)) {
      return setValidationError("Please enter a valid email address.");
    }

    if (password.length < 6) {
      return setValidationError("Password must be at least 6 characters.");
    }

    try {
      const resultAction = await dispatch(signIn({ email, password }));
      if (signIn.fulfilled.match(resultAction)) {
        navigate("/");
      }
    } catch {
      // Handled by Redux error state
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-blue">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-8 py-12">
        {/* Left Section */}
        <div className="flex-1">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/dcrubaesi/image/upload/v1737333837/ECODEED_COLORED_LOGO_wj2yy8.png"
              alt="Ecodeed Logo"
              className="h-12 w-12"
            />
            <span className="text-3xl font-bold text-brand-blue dark:text-white">
              Ecodeed
            </span>
          </Link>
          <p className="text-gray-600 dark:text-gray-300 mt-6 text-lg">
            Welcome back to our community of environmental advocates. Sign in to
            access your personalized dashboard and continue contributing to
            sustainable conversations.
          </p>
          <div className="mt-8 hidden md:block">
            <div className="bg-brand-green/10 p-4 rounded-lg border border-brand-green/20">
              <h3 className="text-brand-green font-semibold mb-2">
                Member benefits
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-brand-green">✓</span>
                  <span>Access your saved articles and resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-green">✓</span>
                  <span>Continue your sustainability learning journey</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-green">✓</span>
                  <span>Connect with like-minded environmentalists</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Welcome back
          </h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label
                htmlFor="email"
                value="Email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              />
              <TextInput
                type="email"
                placeholder="your@email.com"
                id="email"
                onChange={handleChange}
                value={formData.email}
                required
                className="focus:ring-brand-green focus:border-brand-green"
              />
            </div>
            <div>
              <Label
                htmlFor="password"
                value="Password"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              />
              <TextInput
                type="password"
                placeholder="••••••••"
                id="password"
                onChange={handleChange}
                value={formData.password}
                required
                className="focus:ring-brand-green focus:border-brand-green"
              />
            </div>
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-brand-green hover:text-brand-green/80"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="mt-2 bg-brand-green hover:!bg-brand-yellow hover:!text-brand-blue focus:!ring-brand-yellow focus:!ring-2 focus:!ring-offset-2 text-white transition-colors duration-200"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
              <span className="px-3 text-gray-500 dark:text-gray-400 text-sm">
                OR
              </span>
              <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <OAuth />
          </form>

          <div className="text-sm mt-6 text-center text-gray-600 dark:text-gray-300">
            New to Ecodeed?{" "}
            <Link
              to="/sign-up"
              className="text-brand-green hover:text-brand-green/80 font-medium"
            >
              Create an account
            </Link>
          </div>

          {(validationError || errorMessage) && (
            <Alert className="mt-5" color="failure">
              {validationError || errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

