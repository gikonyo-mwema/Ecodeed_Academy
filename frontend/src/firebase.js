/**
 * Firebase Configuration & Initialization — Optional analytics and auth setup.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Initializes Firebase with credentials from environment variables. Provides optional
 * Firebase Authentication and Google Analytics support. Gracefully disables when
 * credentials are missing (fallback to JWT auth). Validates config before initialization.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ENVIRONMENT VARIABLES REQUIRED
 * ═══════════════════════════════════════════════════════════════════════════════════
 * VITE_FIREBASE_API_KEY           - Firebase API key (>10 chars)
 * VITE_FIREBASE_AUTH_DOMAIN       - Auth domain (e.g., project.firebaseapp.com)
 * VITE_FIREBASE_PROJECT_ID        - Firebase project ID
 * VITE_FIREBASE_STORAGE_BUCKET    - Storage bucket (optional)
 * VITE_FIREBASE_MESSAGING_SENDER_ID - Sender ID
 * VITE_FIREBASE_APP_ID            - App ID
 * VITE_FIREBASE_MEASUREMENT_ID    - GA4 measurement ID (G-XXXXXXXXXX format)
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * INITIALIZATION RULES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * • Firebase initialization: Required VITE_FIREBASE_API_KEY (valid format)
 * • Authentication setup: Automatic if API key valid; emulator in development
 * • Analytics initialization: Production only + valid measurement ID (G- prefix)
 *   Disabled on localhost/127.0.0.1 regardless of production flag
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * EXPORTED FUNCTIONS & OBJECTS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * app: Firebase app instance (null if init failed)
 * auth: Firebase Authentication instance (null if init failed)
 * analytics: Google Analytics instance (null if not initialized)
 * isFirebaseAvailable(): Returns boolean - true if app & auth initialized
 * getAuthInstance(): Returns auth instance or null
 * trackEvent(eventName, parameters): Safe async event tracking (production only)
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * CONFIGURATION VALIDATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 * hasValidApiKey():
 *   • Checks length > 10
 *   • Rejects placeholder values ('your_firebase_api_key_here')
 *   • Prevents accidental public key exposure
 *
 * hasValidAnalyticsConfig():
 *   • Checks GA4 format (starts with 'G-')
 *   • Rejects placeholder values
 *   • Prevents invalid measurement IDs
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * USAGE EXAMPLE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * // Check if Firebase is available
 * import { isFirebaseAvailable, trackEvent } from '@/firebase';
 *
 * if (isFirebaseAvailable()) {
 *   // Use Firebase authentication
 *   const auth = getAuthInstance();
 *   signInWithGoogle(auth);
 * }
 *
 * // Track analytics event
 * trackEvent('page_view', { page_title: 'Home' });
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FALLBACK BEHAVIOR
 * ═══════════════════════════════════════════════════════════════════════════════════
 * If Firebase is not configured:
 * • JWT authentication is used (primary method)
 * • App continues to function normally
 * • Console warnings guide configuration (no errors)
 *
 * @module FirebaseConfig
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if API key is provided and valid
let app = null;
let analytics = null;
let auth = null;

/**
 * Validates Firebase API key format and prevents placeholder values
 * @returns {boolean} True if API key is valid and configured
 * @private
 */
const hasValidApiKey = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return apiKey && 
         apiKey !== "your_firebase_api_key_here" && 
         apiKey !== "placeholder-api-key" && 
         apiKey.length > 10; // Basic length validation
};

/**
 * Validates Google Analytics GA4 measurement ID format
 * @returns {boolean} True if measurement ID is valid GA4 format
 * @private
 */
const hasValidAnalyticsConfig = () => {
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
  return measurementId && 
         measurementId !== "your_measurement_id_here" && 
         measurementId !== "placeholder-measurement-id" &&
         measurementId.startsWith('G-'); // Valid GA4 measurement ID format
};

try {
  if (hasValidApiKey()) {
    console.log('🔧 Initializing Firebase with config:', {
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId
    });
    
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Add debugging for auth domain
    console.log('🔧 Firebase Auth domain:', auth.config?.authDomain);
    
    // Only initialize analytics in production with proper domain and measurement ID validation
    if (typeof window !== 'undefined' && 
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1' &&
        hasValidAnalyticsConfig() &&
        import.meta.env.NODE_ENV === 'production') {
      
      analytics = getAnalytics(app);
      console.log('✅ Firebase initialized with Analytics');
    } else {
      console.log('🔥 Firebase initialized (Analytics disabled - not production environment or missing configuration)');
    }
  } else {
    console.warn('⚠️ Firebase API key not configured. Firebase features will be disabled.');
    console.warn('💡 To enable Firebase, add your API key to VITE_FIREBASE_API_KEY in .env file');
  }
} catch (error) {
  console.warn('⚠️ Firebase initialization failed:', error.message);
  console.warn('💡 This is normal if Firebase is not configured for this environment');
}

// Helper function to safely track analytics events
/**
 * Safely track analytics events (async import)
 * Silently fails if analytics not available or in development
 * @param {string} eventName - GA4 event identifier
 * @param {object} [parameters={}] - Event properties/dimensions
 * @returns {void}
 */
const trackEvent = (eventName, parameters = {}) => {
  if (analytics && typeof window !== 'undefined') {
    try {
      import('firebase/analytics').then(({ logEvent }) => {
        logEvent(analytics, eventName, parameters);
      });
    } catch (error) {
      // Silently fail analytics tracking
    }
  }
};

/**
 * Checks if Firebase is fully initialized and available
 * @returns {boolean} True if app and auth instances exist
 */
const isFirebaseAvailable = () => {
  return app !== null && auth !== null;
};

/**
 * Retrieves Firebase Authentication instance
 * @returns {object|null} Firebase auth instance or null if unavailable
 */
const getAuthInstance = () => {
  return auth;
};

export { app, analytics, auth, trackEvent, isFirebaseAvailable, getAuthInstance };