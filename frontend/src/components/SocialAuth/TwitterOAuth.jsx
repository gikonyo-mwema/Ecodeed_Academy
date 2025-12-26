import { Button } from 'flowbite-react';
import { FaXTwitter } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';
import { twitterSignIn } from '../../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState, useCallback } from 'react';
import { apiFetch } from '../../utils/api';

/**
 * Twitter/X OAuth Button
 *
 * Handles Twitter/X sign-in via OAuth 2.0 PKCE flow.
 * Since Twitter OAuth requires server-side handling, this component
 * initiates the OAuth flow through the backend.
 * 
 * Flow:
 * 1. User clicks button
 * 2. Frontend requests auth URL from backend
 * 3. User is redirected to Twitter for authorization
 * 4. Twitter redirects back to backend callback
 * 5. Backend exchanges code for tokens and creates session
 * 6. Backend redirects to frontend with user data
 */

export default function TwitterOAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Check if Twitter auth is configured
    const TWITTER_CLIENT_ID = import.meta.env.VITE_TWITTER_CLIENT_ID;
    const isConfigured = TWITTER_CLIENT_ID && 
                         TWITTER_CLIENT_ID !== 'your_twitter_client_id_here';

    const handleTwitterClick = useCallback(async () => {
        if (!isConfigured) {
            toast.error('Twitter/X sign-in is not configured. Please contact support.');
            return;
        }

        if (isLoading) {
            return; // Prevent multiple clicks
        }

        setIsLoading(true);

        try {
            console.log('🔵 Starting Twitter/X sign-in...');

            // Request OAuth URL from backend
            const response = await apiFetch('/api/auth/social/twitter/login/', {
                method: 'GET',
            });

            if (response.auth_url) {
                // Store current URL for redirect after auth
                sessionStorage.setItem('twitter_auth_redirect', window.location.pathname);
                
                // Redirect to Twitter authorization
                window.location.href = response.auth_url;
            } else {
                throw new Error('Failed to get Twitter authorization URL');
            }

        } catch (error) {
            console.error('❌ Twitter/X sign-in failed:', error);
            setIsLoading(false);
            
            let errorMessage = 'Failed to sign in with Twitter/X';
            if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        }
    }, [isConfigured, isLoading]);

    // Handle callback from Twitter OAuth (for popup flow alternative)
    const processTwitterCallback = useCallback(async (userData) => {
        try {
            const actionResult = await dispatch(twitterSignIn(userData));

            if (twitterSignIn.fulfilled.match(actionResult)) {
                console.log('✅ Twitter/X sign-in successful');
                toast.success('Welcome! Twitter/X sign-in successful!');
                navigate('/', { replace: true });
            } else {
                const backendError = actionResult.payload?.message || actionResult.error?.message;
                throw new Error(backendError || 'Twitter/X sign-in failed');
            }
        } catch (error) {
            console.error('Twitter callback error:', error);
            toast.error(error.message || 'Failed to complete Twitter/X sign-in');
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, navigate]);

    return (
        <Button
            color="none"
            type="button"
            onClick={handleTwitterClick}
            aria-label="Continue with Twitter/X"
            disabled={!isConfigured || isLoading}
            className={`
                !border-2 !rounded-lg shadow-md font-semibold w-full flex items-center justify-center
                transition-all duration-200
                ${!isConfigured || isLoading
                    ? '!bg-gray-100 !border-gray-300 !text-gray-500 cursor-not-allowed' 
                    : '!bg-white !border-black !text-black hover:!bg-black hover:!text-white hover:!border-black focus:!ring-2 focus:!ring-gray-500 focus:!outline-none hover:scale-105 active:scale-95'
                }
            `}
        >
            <FaXTwitter className="w-5 h-5 mr-2" />
            {isLoading ? 'Signing in...' : (!isConfigured ? 'X Sign-in Unavailable' : 'Continue with X')}
        </Button>
    );
}

/**
 * Twitter OAuth Callback Handler Component
 * 
 * This component handles the callback from Twitter OAuth.
 * Place this component at the route: /auth/twitter/callback
 */
export function TwitterOAuthCallback() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useState(() => {
        const handleCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const errorParam = urlParams.get('error');

            if (errorParam) {
                setError('Twitter authorization was denied or failed');
                return;
            }

            if (!code) {
                setError('No authorization code received');
                return;
            }

            try {
                // Exchange code for user data through backend
                const response = await apiFetch('/api/auth/social/twitter/callback/', {
                    method: 'POST',
                    body: JSON.stringify({ code, state }),
                });

                if (response.user) {
                    const actionResult = await dispatch(twitterSignIn(response.user));
                    
                    if (twitterSignIn.fulfilled.match(actionResult)) {
                        toast.success('Welcome! Twitter/X sign-in successful!');
                        const redirectPath = sessionStorage.getItem('twitter_auth_redirect') || '/';
                        sessionStorage.removeItem('twitter_auth_redirect');
                        navigate(redirectPath, { replace: true });
                    } else {
                        setError('Failed to complete sign-in');
                    }
                } else {
                    setError('No user data received');
                }
            } catch (err) {
                console.error('Twitter callback error:', err);
                setError(err.message || 'Failed to complete Twitter/X sign-in');
            }
        };

        handleCallback();
    }, [dispatch, navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-brand-blue">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <FaXTwitter className="w-12 h-12 mx-auto mb-4 text-red-500" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        Sign-in Failed
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                    <Button
                        onClick={() => navigate('/sign-in')}
                        className="bg-brand-green hover:bg-brand-yellow"
                    >
                        Back to Sign In
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-brand-blue">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <FaXTwitter className="w-12 h-12 mx-auto mb-4 text-black dark:text-white animate-pulse" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    Completing Sign-in...
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Please wait while we finish signing you in with Twitter/X.
                </p>
            </div>
        </div>
    );
}
