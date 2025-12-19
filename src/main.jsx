/**
 * Main Client Entry Point
 * 
 * This is the root entry point for the React client application.
 * It sets up the Redux store, theme provider, routing, and global configurations.
 * 
 * Features:
 * - Redux state management with persistence
 * - Axios HTTP client configuration with interceptors
 * - Theme provider for dark/light mode
 * - Authentication token management
 * - Error handling and automatic redirects
 * 
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { store, persistor } from './redux/store.js';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import ThemeProvider from './components/ThemeProvider.jsx';
import React from 'react';
import axios from 'axios';
import { getApiBaseUrl } from './utils/api.js';
import { initDevUtils } from './utils/devUtils.js';

// Initialize development utilities for better error handling
if (import.meta.env.DEV) {
  initDevUtils();
} 

/**
 * Axios Global Configuration
 * Sets up default configuration for all HTTP requests
 */
axios.defaults.baseURL = getApiBaseUrl(); // Centralized API base URL
axios.defaults.withCredentials = true; // Include cookies in requests

/**
 * Enhanced request interceptor
 * Automatically adds authentication token to all requests
 * Checks both localStorage and cookies for token availability
 */
axios.interceptors.request.use((config) => {
  // Check both localStorage and cookies for token 
  const token = localStorage.getItem('token') || 
                document.cookie.split('; ')
                  .find(row => row.startsWith('token='))
                  ?.split('=')[1];
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Enhanced response interceptor
 * Handles authentication errors and automatic redirects
 */
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear auth state and redirect to sign in
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

/**
 * React Application Root Render
 * Sets up the complete application with all providers and configuration
 */
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Redux Persist Gate - waits for persisted state to be retrieved */}
    <PersistGate loading={null} persistor={persistor}>
      {/* Redux Provider - provides store to all components */}
      <Provider store={store}>
        {/* Theme Provider - manages dark/light theme throughout app */}
        <ThemeProvider>     
          <App />        
        </ThemeProvider>
      </Provider>
    </PersistGate>
  </React.StrictMode>
);