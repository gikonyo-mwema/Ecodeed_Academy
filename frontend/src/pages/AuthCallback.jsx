/**
 * OAuth Callback Handler Page
 * 
 * This page handles redirects from OAuth providers (Twitter, Facebook, etc.)
 * It extracts tokens from URL parameters and stores them in Redux.
 * 
 * Expected URL params:
 * - success: 'true' if authentication was successful
 * - access: JWT access token
 * - refresh: JWT refresh token
 * - provider: OAuth provider name (twitter, facebook)
 * - error: Error message if authentication failed
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Spinner } from 'flowbite-react';
import { setCurrentUser, clearError } from '../redux/user/userSlice';
import { apiFetch } from '../utils/api';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [processing, setProcessing] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            const success = searchParams.get('success');
            const accessToken = searchParams.get('access');
            const refreshToken = searchParams.get('refresh');
            const provider = searchParams.get('provider') || 'social';
            const errorMsg = searchParams.get('error');

            // Handle error case
            if (errorMsg) {
                setError(errorMsg);
                setProcessing(false);
                toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in failed: ${errorMsg}`);
                
                // Redirect to sign-in page after a short delay
                setTimeout(() => {
                    navigate('/sign-in', { replace: true });
                }, 2000);
                return;
            }

            // Validate required params
            if (success !== 'true' || !accessToken || !refreshToken) {
                const msg = 'Invalid authentication callback';
                setError(msg);
                setProcessing(false);
                toast.error(msg);
                
                setTimeout(() => {
                    navigate('/sign-in', { replace: true });
                }, 2000);
                return;
            }

            try {
                // Store tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Fetch user profile with the new token
                const userData = await apiFetch('/api/auth/profile/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                // Dispatch success with user data - use setCurrentUser action
                dispatch(setCurrentUser(userData));

                toast.success(`Welcome! ${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in successful!`);
                
                // Get stored redirect path or default to home
                const redirectPath = sessionStorage.getItem(`${provider}_auth_redirect`) || '/';
                sessionStorage.removeItem(`${provider}_auth_redirect`);
                
                navigate(redirectPath, { replace: true });

            } catch (err) {
                console.error('Auth callback error:', err);
                const errorMessage = err.message || 'Failed to complete authentication';
                setError(errorMessage);
                setProcessing(false);
                toast.error(errorMessage);
                
                setTimeout(() => {
                    navigate('/sign-in', { replace: true });
                }, 2000);
            }
        };

        handleCallback();
    }, [searchParams, navigate, dispatch]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-brand-blue">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
                {processing ? (
                    <>
                        <Spinner size="xl" className="mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                            Completing Sign In...
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Please wait while we verify your authentication.
                        </p>
                    </>
                ) : error ? (
                    <>
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                            Authentication Failed
                        </h2>
                        <p className="text-red-500 dark:text-red-400 mb-4">
                            {error}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                            Redirecting to sign-in page...
                        </p>
                    </>
                ) : null}
            </div>
        </div>
    );
}
