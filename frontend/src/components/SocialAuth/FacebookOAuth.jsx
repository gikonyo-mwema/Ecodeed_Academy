import { Button } from 'flowbite-react';
import { FaFacebook } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { facebookSignIn } from '../../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';

/**
 * Facebook OAuth Button
 *
 * Handles Facebook sign-in via Facebook SDK.
 * On success, exchanges Facebook user info with the backend
 * at /api/auth/social/facebook/ to create a session and JWT tokens.
 */

// Facebook App ID from environment variables
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

export default function FacebookOAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSdkLoaded, setIsSdkLoaded] = useState(false);

    // Initialize Facebook SDK
    useEffect(() => {
        if (!FACEBOOK_APP_ID || FACEBOOK_APP_ID === 'your_facebook_app_id_here') {
            console.log('Facebook App ID not configured');
            return;
        }

        // Load Facebook SDK asynchronously
        const loadFacebookSDK = () => {
            if (window.FB) {
                setIsSdkLoaded(true);
                return;
            }

            window.fbAsyncInit = function() {
                window.FB.init({
                    appId: FACEBOOK_APP_ID,
                    cookie: true,
                    xfbml: true,
                    version: 'v18.0'
                });
                setIsSdkLoaded(true);
                console.log('🔵 Facebook SDK initialized');
            };

            // Load the SDK
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        };

        loadFacebookSDK();
    }, []);

    const processFacebookUser = useCallback(async (authResponse) => {
        return new Promise((resolve, reject) => {
            window.FB.api('/me', { fields: 'id,name,email,picture.type(large)' }, async (response) => {
                if (!response || response.error) {
                    reject(new Error(response?.error?.message || 'Failed to get Facebook user info'));
                    return;
                }

                const userData = {
                    facebookId: response.id,
                    email: response.email,
                    name: response.name,
                    photoUrl: response.picture?.data?.url || '',
                };

                console.log('🔵 Processing Facebook user:', userData.email || userData.name);

                try {
                    const actionResult = await dispatch(facebookSignIn(userData));

                    if (facebookSignIn.fulfilled.match(actionResult)) {
                        console.log('✅ Facebook sign-in successful');
                        toast.success('Welcome! Facebook sign-in successful!');
                        navigate('/', { replace: true });
                        resolve(actionResult);
                    } else {
                        const backendError = actionResult.payload?.message || actionResult.error?.message;
                        reject(new Error(backendError || 'Facebook sign-in failed'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    }, [dispatch, navigate]);

    const handleFacebookError = (error) => {
        console.error('Facebook sign-in error:', error);
        setIsLoading(false);

        let errorMessage = 'Failed to sign in with Facebook';

        if (typeof error === 'object' && error !== null) {
            if (error.message) {
                errorMessage = error.message;
            }
        }

        toast.error(errorMessage);
    };

    const handleFacebookClick = async () => {
        if (!isSdkLoaded || !window.FB) {
            toast.error('Facebook sign-in is currently unavailable. Please try again later.');
            return;
        }

        if (isLoading) {
            return; // Prevent multiple clicks
        }

        setIsLoading(true);

        try {
            console.log('🔵 Starting Facebook sign-in...');

            window.FB.login(async (response) => {
                if (response.authResponse) {
                    console.log('🔵 Facebook login successful, fetching user data...');
                    try {
                        await processFacebookUser(response.authResponse);
                    } catch (error) {
                        handleFacebookError(error);
                    }
                } else {
                    console.log('Facebook login cancelled or failed');
                    setIsLoading(false);
                    toast.info('Facebook sign-in was cancelled');
                }
            }, { scope: 'email,public_profile' });

        } catch (error) {
            console.error('❌ Facebook sign-in failed:', error);
            handleFacebookError(error);
        }
    };

    const isAvailable = FACEBOOK_APP_ID && 
                        FACEBOOK_APP_ID !== 'your_facebook_app_id_here' && 
                        isSdkLoaded;

    return (
        <Button
            color="none"
            type="button"
            onClick={handleFacebookClick}
            aria-label="Continue with Facebook"
            disabled={!isAvailable || isLoading}
            className={`
                !border-2 !rounded-lg shadow-md font-semibold w-full flex items-center justify-center
                transition-all duration-200
                ${!isAvailable || isLoading
                    ? '!bg-gray-100 !border-gray-300 !text-gray-500 cursor-not-allowed' 
                    : '!bg-white !border-[#1877F2] !text-[#1877F2] hover:!bg-[#1877F2] hover:!text-white hover:!border-[#1877F2] focus:!ring-2 focus:!ring-[#1877F2] focus:!outline-none hover:scale-105 active:scale-95'
                }
            `}
        >
            <FaFacebook className="w-6 h-6 mr-2" />
            {isLoading ? 'Signing in...' : (!isAvailable ? 'Facebook Sign-in Unavailable' : 'Continue with Facebook')}
        </Button>
    );
}
