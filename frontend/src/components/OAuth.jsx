/**
 * OAuth Component - Social Authentication Button
 * 
 * Provides OAuth authentication via Google using Firebase.
 * 
 * Features:
 * - Google Sign In via Firebase popup
 * - Friendly error messages for popup/network issues
 * - Loading state while authenticating
 * - Toast notifications for user feedback
 * - Automatic redirect to dashboard on success
 * - Redux dispatch for user state management
 * 
 * OAuth Flow:
 * 1. User clicks Google button
 * 2. Firebase popup opens with Google consent screen
 * 3. User approves → Firebase returns ID token
 * 4. Frontend sends token to backend POST /api/v1/auth/google/
 * 5. Backend validates & returns user + JWT token
 * 6. Redux stores user data in localStorage
 * 7. User redirected to dashboard
 * 
 * Error Handling:
 * - Popup blocked by browser
 * - Popup closed by user
 * - Network connection failures
 * - Firebase availability checks
 * 
 * Dependencies:
 * - Firebase SDK for authentication
 * - Redux for state management
 * - React Toastify for notifications
 * 
 * @component
 * @returns {JSX.Element} Button with Google OAuth option
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, isFirebaseAvailable } from '../firebase';
import { useDispatch } from 'react-redux';
import { googleSignIn } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState, useCallback } from 'react';

/**
 * Convert Firebase auth errors to user-friendly messages
 * 
 * Handles common Firebase authentication errors and provides
 * meaningful messages that users can understand and act upon.
 * 
 * @param {Error} error - Firebase auth error object with code property
 * @returns {string} Human-readable error message
 * @private
 */
const friendlyError = (error) => {
  if (error?.code === 'auth/popup-closed-by-user')
    return 'Sign-in window was closed. Please try again.';
  if (error?.code === 'auth/popup-blocked')
    return 'Popup blocked by your browser. Please allow popups and try again.';
  if (error?.code === 'auth/network-request-failed')
    return 'Network error. Please check your connection and try again.';
  // Firebase SDK internal race condition — safe to retry
  if (error?.message?.includes('INTERNAL ASSERTION FAILED'))
    return 'Sign-in encountered a temporary error. Please try again.';
  if (error?.message) return error.message;
  return 'Failed to sign in with Google';
};

/* ────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────── */

/**
 * Social OAuth Button – Google only.
 *
 * Google – Firebase popup → backend /api/v1/auth/google/
 */
export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSuccess = useCallback(() => {
    toast.success('Welcome! Signed in with Google!');
    navigate('/', { replace: true });
  }, [navigate]);

  /* ────────── Google ────────── */
  const handleGoogle = async () => {
    if (!isFirebaseAvailable() || !auth) {
      toast.error('Google sign-in is currently unavailable.');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user?.email) throw new Error('Google account is missing an email.');

      const action = await dispatch(
        googleSignIn({
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          googlePhotoUrl: user.photoURL || '',
        }),
      );
      if (googleSignIn.fulfilled.match(action)) onSuccess();
      else throw new Error(action.payload || 'Google sign-in failed');
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ────────── Render ────────── */
  const googleAvailable = isFirebaseAvailable() && !!auth;

  return (
    <div className="flex flex-col gap-2">
      <Button
        color="none"
        type="button"
        onClick={handleGoogle}
        aria-label="Continue with Google"
        disabled={!googleAvailable || loading}
        className={`!border-2 !rounded-lg shadow-md font-semibold w-full flex items-center justify-center transition-all duration-200 ${
          googleAvailable && !loading
            ? '!bg-white !border-brand-green !text-brand-green hover:!bg-brand-green hover:!text-white hover:!border-brand-green focus:!ring-2 focus:!ring-brand-yellow focus:!outline-none hover:scale-[1.02] active:scale-95'
            : '!bg-gray-100 !border-gray-300 !text-gray-500 cursor-not-allowed'
        }`}
      >
        <AiFillGoogleCircle className="w-6 h-6 mr-2" />
        {loading
          ? 'Signing in…'
          : !googleAvailable
            ? 'Google Unavailable'
            : 'Continue with Google'}
      </Button>
    </div>
  );
}

