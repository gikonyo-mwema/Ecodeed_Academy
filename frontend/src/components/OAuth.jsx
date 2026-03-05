import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { FaFacebook } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, isFirebaseAvailable } from '../firebase';
import { useDispatch } from 'react-redux';
import {
  googleSignIn,
  facebookSignIn,
  twitterComplete,
  socialAuthSuccess,
} from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState, useEffect, useCallback, useRef } from 'react';
import { buildApiUrl } from '../utils/api';

/* ────────────────────────────────────────────────────────
   Facebook SDK – loaded lazily on first click
   ──────────────────────────────────────────────────────── */
const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

const loadFacebookSDK = () =>
  new Promise((resolve, reject) => {
    if (window.FB) {
      resolve(window.FB);
      return;
    }
    if (!FB_APP_ID) {
      reject(new Error('Facebook App ID not configured'));
      return;
    }
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: FB_APP_ID,
        cookie: true,
        xfbml: false,
        version: 'v19.0',
      });
      resolve(window.FB);
    };
    const s = document.createElement('script');
    s.src = 'https://connect.facebook.net/en_US/sdk.js';
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error('Failed to load Facebook SDK'));
    document.head.appendChild(s);
  });

/* ────────────────────────────────────────────────────────
   Shared error handler
   ──────────────────────────────────────────────────────── */
const friendlyError = (error, provider) => {
  if (error?.code === 'auth/popup-closed-by-user')
    return 'Sign-in window was closed. Please try again.';
  if (error?.code === 'auth/popup-blocked')
    return 'Popup blocked by your browser. Please allow popups and try again.';
  if (error?.code === 'auth/network-request-failed')
    return 'Network error. Please check your connection and try again.';
  if (error?.message) return error.message;
  return `Failed to sign in with ${provider}`;
};

/* ────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────── */

/**
 * Social OAuth Buttons – Google, Facebook, and X (Twitter).
 *
 * • Google  – Firebase popup → backend /api/auth/google
 * • Facebook – FB SDK popup → backend /api/auth/facebook/
 * • X        – OAuth 2.0 PKCE popup through backend redirect
 */
export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Which provider is currently authenticating (null = none)
  const [loadingProvider, setLoadingProvider] = useState(null);

  // X / Twitter – email prompt state (Twitter doesn't always share email)
  const [twitterData, setTwitterData] = useState(null);
  const [twitterEmail, setTwitterEmail] = useState('');
  const [showTwitterEmailPrompt, setShowTwitterEmailPrompt] = useState(false);
  const twitterPopupRef = useRef(null);

  /* ── success helper ── */
  const onSuccess = useCallback(
    (provider) => {
      toast.success(`Welcome! Signed in with ${provider}!`);
      navigate('/', { replace: true });
    },
    [navigate],
  );

  /* ────────── Google ────────── */
  const handleGoogle = async () => {
    if (!isFirebaseAvailable() || !auth) {
      toast.error('Google sign-in is currently unavailable.');
      return;
    }
    if (loadingProvider) return;
    setLoadingProvider('google');
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
      if (googleSignIn.fulfilled.match(action)) onSuccess('Google');
      else throw new Error(action.payload || 'Google sign-in failed');
    } catch (err) {
      toast.error(friendlyError(err, 'Google'));
    } finally {
      setLoadingProvider(null);
    }
  };

  /* ────────── Facebook ────────── */
  const handleFacebook = async () => {
    if (!FB_APP_ID) {
      toast.error('Facebook sign-in is not configured.');
      return;
    }
    if (loadingProvider) return;
    setLoadingProvider('facebook');
    try {
      const FB = await loadFacebookSDK();

      const loginResp = await new Promise((resolve, reject) => {
        FB.login(
          (resp) => {
            if (resp.authResponse) resolve(resp.authResponse);
            else reject(new Error('Facebook login was cancelled.'));
          },
          { scope: 'email,public_profile' },
        );
      });

      const action = await dispatch(
        facebookSignIn({ access_token: loginResp.accessToken }),
      );
      if (facebookSignIn.fulfilled.match(action)) onSuccess('Facebook');
      else throw new Error(action.payload || 'Facebook sign-in failed');
    } catch (err) {
      toast.error(friendlyError(err, 'Facebook'));
    } finally {
      setLoadingProvider(null);
    }
  };

  /* ────────── X / Twitter ────────── */

  // Listen for postMessage from the Twitter callback popup
  useEffect(() => {
    const handleMessage = (event) => {
      const msg = event.data;
      if (msg?.type !== 'social-auth-callback' || msg?.provider !== 'twitter')
        return;

      const payload = msg.payload;

      // Error from callback
      if (payload?.error) {
        toast.error(payload.message || 'X sign-in failed.');
        setLoadingProvider(null);
        return;
      }

      // Twitter doesn't share email → prompt the user
      if (payload?.email_required) {
        setTwitterData({
          twitter_id: payload.twitter_id,
          name: payload.name,
          username: payload.username,
        });
        setShowTwitterEmailPrompt(true);
        setLoadingProvider(null);
        return;
      }

      // Full success – user + JWT already returned
      if (payload?.user && payload?.access) {
        dispatch(socialAuthSuccess(payload));
        toast.success('Welcome! Signed in with X!');
        navigate('/', { replace: true });
        setLoadingProvider(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [dispatch, navigate]);

  const handleTwitter = () => {
    if (loadingProvider) return;
    setLoadingProvider('twitter');

    const w = 600;
    const h = 700;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;

    const popup = window.open(
      buildApiUrl('/api/auth/twitter/login/'),
      'twitter-auth',
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`,
    );

    if (!popup) {
      toast.error('Popup blocked. Please allow popups for this site.');
      setLoadingProvider(null);
      return;
    }

    twitterPopupRef.current = popup;

    // Detect if the user closes the popup manually
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setLoadingProvider((prev) => (prev === 'twitter' ? null : prev));
      }
    }, 500);
  };

  // Complete X sign-in after email is provided
  const handleTwitterEmailSubmit = async (e) => {
    e.preventDefault();
    if (!twitterEmail || !twitterData) return;
    setLoadingProvider('twitter');
    try {
      const action = await dispatch(
        twitterComplete({
          email: twitterEmail,
          twitter_id: twitterData.twitter_id,
          name: twitterData.name,
        }),
      );
      if (twitterComplete.fulfilled.match(action)) {
        setShowTwitterEmailPrompt(false);
        setTwitterData(null);
        setTwitterEmail('');
        onSuccess('X');
      } else {
        throw new Error(action.payload || 'Failed to complete X sign-in');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete X sign-in');
    } finally {
      setLoadingProvider(null);
    }
  };

  /* ────────── Render ────────── */

  const googleAvailable = isFirebaseAvailable() && !!auth;
  const facebookAvailable = !!FB_APP_ID;

  const btnBase =
    '!border-2 !rounded-lg shadow-md font-semibold w-full flex items-center justify-center transition-all duration-200';
  const btnDisabled =
    '!bg-gray-100 !border-gray-300 !text-gray-500 cursor-not-allowed';

  return (
    <div className="flex flex-col gap-2">
      {/* ── Google ── */}
      <Button
        color="none"
        type="button"
        onClick={handleGoogle}
        aria-label="Continue with Google"
        disabled={!googleAvailable || !!loadingProvider}
        className={`${btnBase} ${
          googleAvailable && !loadingProvider
            ? '!bg-white !border-red-500 !text-red-600 hover:!bg-red-500 hover:!text-white hover:!border-red-500 focus:!ring-2 focus:!ring-red-400 focus:!outline-none hover:scale-[1.02] active:scale-95'
            : btnDisabled
        }`}
      >
        <AiFillGoogleCircle className="w-6 h-6 mr-2" />
        {loadingProvider === 'google'
          ? 'Signing in…'
          : !googleAvailable
            ? 'Google Unavailable'
            : 'Continue with Google'}
      </Button>

      {/* ── Facebook ── */}
      <Button
        color="none"
        type="button"
        onClick={handleFacebook}
        aria-label="Continue with Facebook"
        disabled={!facebookAvailable || !!loadingProvider}
        className={`${btnBase} ${
          facebookAvailable && !loadingProvider
            ? '!bg-white !border-blue-600 !text-blue-600 hover:!bg-blue-600 hover:!text-white hover:!border-blue-600 focus:!ring-2 focus:!ring-blue-400 focus:!outline-none hover:scale-[1.02] active:scale-95'
            : btnDisabled
        }`}
      >
        <FaFacebook className="w-5 h-5 mr-2" />
        {loadingProvider === 'facebook'
          ? 'Signing in…'
          : !facebookAvailable
            ? 'Facebook Unavailable'
            : 'Continue with Facebook'}
      </Button>

      {/* ── X / Twitter ── */}
      <Button
        color="none"
        type="button"
        onClick={handleTwitter}
        aria-label="Continue with X"
        disabled={!!loadingProvider}
        className={`${btnBase} ${
          !loadingProvider
            ? '!bg-white !border-gray-900 !text-gray-900 hover:!bg-gray-900 hover:!text-white hover:!border-gray-900 focus:!ring-2 focus:!ring-gray-700 focus:!outline-none hover:scale-[1.02] active:scale-95'
            : btnDisabled
        }`}
      >
        <FaXTwitter className="w-5 h-5 mr-2" />
        {loadingProvider === 'twitter' ? 'Signing in…' : 'Continue with X'}
      </Button>

      {/* ── Twitter email-prompt modal ── */}
      {showTwitterEmailPrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Complete X Sign-In
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              X doesn't share your email address. Please enter it to complete
              your sign-in.
            </p>
            <form onSubmit={handleTwitterEmailSubmit}>
              <input
                type="email"
                required
                value={twitterEmail}
                onChange={(e) => setTwitterEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border rounded-lg px-3 py-2 mb-3 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-brand-green focus:border-brand-green"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loadingProvider === 'twitter'}
                  className="flex-1 bg-brand-green text-white py-2 rounded-lg hover:bg-brand-yellow hover:text-brand-blue transition-colors font-medium"
                >
                  {loadingProvider === 'twitter' ? 'Signing in…' : 'Continue'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTwitterEmailPrompt(false);
                    setTwitterData(null);
                    setTwitterEmail('');
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

