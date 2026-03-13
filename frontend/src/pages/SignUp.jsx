/**
 * Sign Up Page
 * 
 * User registration page for creating new accounts.
 * Features:
 * - Multi-field registration form (first name, last name, email, password)
 * - Password confirmation with match validation
 * - Redux-based authentication flow
 * - OAuth integration (Google, Facebook, Twitter)
 * - Client-side and server-side validation
 * - Responsive layout (desktop + mobile)
 * - Loading states and error handling
 * - Auto-redirect to dashboard on successful signup
 * - Link to sign in for existing users
 * 
 * Form Validation:
 * - All fields required
 * - Email format validation (RFC 5322 basic)
 * - Password: minimum 6 characters
 * - Password confirmation must match
 * 
 * State Management:
 * - Redux user slice for auth state and error messages
 * - Local state for form data and client-side validation
 * 
 * API Endpoints Used:
 * - POST /api/v1/auth/register/ (email/password signup)
 * - POST /api/v1/auth/google/ (OAuth signup via Google)
 * - POST /api/v1/auth/facebook/ (OAuth signup via Facebook)
 * 
 * @component
 * @returns {JSX.Element} Sign up page with registration form and OAuth options
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../components/OAuth";
import { signUp } from "../redux/user/userSlice";

/**
 * SignUp Component
 * Main registration page for new user accounts
 * 
 * @returns {JSX.Element} Renders registration form with two-column layout
 */
export default function SignUp() {
  const [formData, setFormData] = useState({
     firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [validationError, setValidationError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // use redux state for loading/errors so we can show backend messages
  const { loading, error: errorMessage, currentUser } = useSelector((state) => state.user);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value.trim(),
    }));
  };

  // if user is already logged in, send them home
  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return setValidationError("Please fill out all fields.");
    }
    
    if (password !== confirmPassword) {
       return setValidationError("Passwords do not match.");
    }

    if (password.length < 8) {
      return setValidationError("Password must be at least 8 characters.");
    }

    try {
      const resultAction = await dispatch(
        signUp({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          confirm_password: confirmPassword,
        })
      );

      if (signUp.fulfilled.match(resultAction)) {
        // Automatically logged in by redux slice; redirect to home/dashboard
        navigate("/", { state: { newUser: true } });
      }
    } catch {
      // Handled by Redux error state
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-blue">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-8 py-12">
        {/* Left section */}
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
            Join our community of environmental enthusiasts and professionals.
            Share your insights, learn about sustainability, and contribute to
            meaningful discussions about our planet's future.
          </p>
          <div className="mt-8 hidden md:block">
            <div className="bg-brand-green/10 p-4 rounded-lg border border-brand-green/20">
              <h3 className="text-brand-green font-semibold mb-2">
                Why join Ecodeed?
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-brand-green">✓</span>
                  <span>Access exclusive environmental resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-green">✓</span>
                  <span>Connect with sustainability experts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-green">✓</span>
                  <span>Stay updated on eco-friendly practices</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Create your account
          </h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex gap-4">
                <div className="flex-1">
                    <Label
                        htmlFor="firstName"
                        value="First Name"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    />
                    <TextInput
                        type="text"
                        placeholder="First Name"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="focus:ring-brand-green focus:border-brand-green"
                    />
                </div>
                <div className="flex-1">
                    <Label
                        htmlFor="lastName"
                        value="Last Name"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    />
                    <TextInput
                        type="text"
                        placeholder="Last Name"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="focus:ring-brand-green focus:border-brand-green"
                    />
                </div>
            </div>
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
                value={formData.email}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
                required
                className="focus:ring-brand-green focus:border-brand-green"
              />
            </div>
             <div>
              <Label
                htmlFor="confirmPassword"
                value="Confirm Password"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              />
              <TextInput
                type="password"
                placeholder="••••••••"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="focus:ring-brand-green focus:border-brand-green"
              />
            </div>

            {/* ✅ Fixed Sign Up Button */}
            <Button
              color="none"
              type="submit"
              disabled={loading}
              className="
                !bg-brand-green !border-2 !border-brand-green !text-white
                hover:!bg-brand-yellow hover:!text-brand-blue hover:!border-brand-yellow
                focus:!ring-2 focus:!ring-brand-yellow focus:!outline-none
                rounded-lg shadow-md
                transition-all duration-200
                hover:scale-105 active:scale-95
                font-semibold w-full mt-2
              "
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Creating account...</span>
                </>
              ) : (
                "Sign Up"
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
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="text-brand-green hover:text-brand-green/80 font-medium"
            >
              Sign in
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

