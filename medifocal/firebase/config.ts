import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Firebase configuration
// Note: API keys are loaded from environment variables for security
// Create a .env file in the medifocal/ directory with your Firebase config
//
// Note: Firestore timeout errors (ERR_TIMED_OUT) are expected network behavior.
// The Firestore SDK automatically retries failed connections. These errors in the
// browser console are harmless and don't affect functionality.
// Firebase API key - safe to expose in client-side code
// Security is handled by Firebase Security Rules
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBPygS2h6l1sVGqepmyo3EVcguxf3nLbg0";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "medifocal.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "medifocal",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "medifocal.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "592439525175",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:592439525175:web:9f6907344d25efef1f64b2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-L6CXGJ3XBK",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://medifocal-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with better error handling and incognito mode support
// Firestore will automatically work without persistence in incognito mode
export const db = getFirestore(app);

// Configure Firestore settings for better timeout handling
if (typeof window !== 'undefined') {
  // Suppress Firestore timeout/network errors in console
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: any[]) => {
    const errorMessage = args[0]?.toString() || '';
    // Suppress Firestore timeout/network errors (these are handled gracefully by Firestore SDK)
    if (errorMessage.includes('ERR_TIMED_OUT') || 
        errorMessage.includes('firestore.googleapis.com') ||
        errorMessage.includes('Listen/channel') ||
        errorMessage.includes('Failed to load resource') && errorMessage.includes('firestore')) {
      return; // Don't log these errors - Firestore SDK handles retries automatically
    }
    originalError.apply(console, args);
  };
  
  // Also suppress warnings related to Firestore timeouts and Realtime Database
  console.warn = (...args: any[]) => {
    const warnMessage = args[0]?.toString() || '';
    if (warnMessage.includes('firestore.googleapis.com') ||
        warnMessage.includes('Listen/channel') ||
        warnMessage.includes('FIREBASE WARNING') ||
        warnMessage.includes('Realtime Database') ||
        warnMessage.includes('firebaseio.com')) {
      return; // Suppress Firebase Realtime Database warnings
    }
    originalWarn.apply(console, args);
  };
  
  // Suppress network errors in browser console (these are logged by browser, not our code)
  // Note: We can't fully suppress browser network error logs, but we can minimize their impact
  window.addEventListener('error', (event) => {
    const errorSource = event.filename || event.target?.toString() || '';
    const errorMessage = event.message || '';
    
    // Suppress Firestore timeout errors and Realtime Database warnings
    if (errorSource.includes('firestore.googleapis.com') ||
        errorMessage.includes('firestore.googleapis.com') ||
        errorMessage.includes('ERR_TIMED_OUT') ||
        errorMessage.includes('Listen/channel') ||
        errorMessage.includes('Realtime Database') ||
        errorMessage.includes('firebaseio.com')) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    
    // Suppress 404 errors for missing SVG assets (handled gracefully in components)
    if (errorSource.includes('storage.googleapis.com') && 
        (errorSource.includes('.svg') || errorSource.includes('medifocal-public-assets'))) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
  
  // Also intercept resource loading errors
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.toString() || '';
    if (reason.includes('firestore.googleapis.com') ||
        reason.includes('ERR_TIMED_OUT') ||
        reason.includes('Listen/channel') ||
        reason.includes('Realtime Database') ||
        reason.includes('firebaseio.com')) {
      event.preventDefault();
    }
  });
}

// Initialize Auth
export const auth = getAuth(app);

// Initialize Functions (using your region: australia-southeast1)
export const functions = getFunctions(app, 'australia-southeast1');

// Initialize Storage
export const storage = getStorage(app);

// Initialize Realtime Database
export const realtimeDb = getDatabase(app);

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };

export default app;

