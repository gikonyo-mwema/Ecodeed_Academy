import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, isFirebaseAvailable } from '../firebase';
import { useDispatch } from 'react-redux';
import { googleSignIn } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

/**
 * Google OAuth Button
 *
 * Handles Google sign-in via Firebase (popup in dev, redirect in prod).
 * On success, exchanges Google user info with the backend
 * at /api/auth/google to create a session cookie, then navigates home.
 */
export default function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // No redirect flow in production. Popup only.
    useEffect(() => {}, []);

    const processGoogleUser = async (user) => {
        if (!user?.email) {
            throw new Error("Google account is missing an email address.");
        }

        const userData = {
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            googlePhotoUrl: user.photoURL || '',
        };

        console.log('🔵 Processing Google user:', userData.email);

        const actionResult = await dispatch(googleSignIn(userData));

        if (googleSignIn.fulfilled.match(actionResult)) {
            console.log('✅ Google sign-in successful, navigating to home');
            toast.success('Welcome! Google sign-in successful!');
            navigate('/', { replace: true });
        } else {
            const backendError = actionResult.payload?.message || actionResult.error?.message;
            throw new Error(backendError || 'Google sign-in failed');
        }
    };

    const handleGoogleError = (error) => {
        console.error('Google sign-in error:', error);
        setIsLoading(false);

    let errorMessage = 'Failed to sign in with Google';

        if (typeof error === 'object' && error !== null) {
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = 'The Google sign-in window was closed. Please allow popups for this site and try again.';
                    break;
                case 'auth/popup-blocked':
                    errorMessage = 'Popup was blocked by your browser. Please allow popups for this site and try again.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your connection and try again.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                default:
                    if (error.message) {
                        errorMessage = error.message;
                    }
            }
        }

        toast.error(errorMessage);
    };

    const handleGoogleClick = async () => {
        if (!isFirebaseAvailable() || !auth) {
            toast.error('Google sign-in is currently unavailable. Please contact support or use email sign-in.');
            return;
        }

        if (isLoading) {
            return; // Prevent multiple clicks
        }

        setIsLoading(true);

        try {
            console.log('🔵 Starting Google sign-in...');
            
            // Create Google provider with specific configuration
            const provider = new GoogleAuthProvider();
            
            // Force account selection and ensure we get fresh credentials
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            
            // Explicitly set scopes
            provider.addScope('email');
            provider.addScope('profile');
            
            // Popup-only flow (prod and dev). No redirects.
            console.log('🔵 Using popup flow');
            const result = await signInWithPopup(auth, provider);
            console.log('🔵 Google popup sign-in successful');
            await processGoogleUser(result.user);
            
        } catch (error) {
            console.error('❌ Google sign-in failed:', error);
            handleGoogleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            color="none" // disables default Flowbite blue variant
            type="button"
            onClick={handleGoogleClick}
            aria-label="Continue with Google"
            disabled={!isFirebaseAvailable() || !auth || isLoading}
            className={`
                !border-2 !rounded-lg shadow-md font-semibold w-full flex items-center justify-center
                transition-all duration-200
                ${!isFirebaseAvailable() || !auth || isLoading
                    ? '!bg-gray-100 !border-gray-300 !text-gray-500 cursor-not-allowed' 
                    : '!bg-white !border-brand-green !text-brand-green hover:!bg-brand-yellow hover:!text-brand-blue hover:!border-brand-yellow focus:!ring-2 focus:!ring-brand-yellow focus:!outline-none hover:scale-105 active:scale-95'
                }
            `}
        >
            <AiFillGoogleCircle className="w-6 h-6 mr-2 text-current" />
            {isLoading ? 'Signing in...' : (!isFirebaseAvailable() || !auth ? 'Google Sign-in Unavailable' : 'Continue with Google')}
        </Button>
    );
}

