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

const hasValidApiKey = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return apiKey && 
         apiKey !== "your_firebase_api_key_here" && 
         apiKey !== "placeholder-api-key" && 
         apiKey.length > 10; // Basic length validation
};

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

// Helper function to check if Firebase is available
const isFirebaseAvailable = () => {
  return app !== null && auth !== null;
};

// Helper function to get auth instance
const getAuthInstance = () => {
  return auth;
};

export { app, analytics, auth, trackEvent, isFirebaseAvailable, getAuthInstance };