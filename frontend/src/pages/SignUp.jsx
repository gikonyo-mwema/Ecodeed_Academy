import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../components/OAuth";
import { signUp } from '../redux/user/userSlice';

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const [localError, setLocalError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value.trim(),
    }));
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = formData;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return setLocalError("Please fill out all required fields.");
    }

    if (password !== confirmPassword) {
      return setLocalError("Passwords do not match.");
    }

    if (password.length < 8) {
      return setLocalError("Password must be at least 8 characters.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setLocalError("Please enter a valid email address.");
    }

    try {
      setLocalError(null);
      const resultAction = await dispatch(signUp({
        firstName,
        lastName,
        email,
        password,
      }));

      if (signUp.fulfilled.match(resultAction)) {
        navigate("/");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setLocalError("Something went wrong. Please try again.");
    }
  };

  const displayError = localError || errorMessage;

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="firstName"
                  value="First Name"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                />
                <TextInput
                  type="text"
                  placeholder="John"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="focus:ring-brand-green focus:border-brand-green"
                />
              </div>
              <div>
                <Label
                  htmlFor="lastName"
                  value="Last Name"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                />
                <TextInput
                  type="text"
                  placeholder="Doe"
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
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
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

          {displayError && (
            <Alert className="mt-5" color="failure">
              {displayError}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}