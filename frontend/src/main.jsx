/**
 * Main Client Entry Point
 * 
 * This is the root entry point for the React client application.
 * It sets up the Redux store, theme provider, routing, and global configurations.
 * 
 * Features:
 * - Redux state management with persistence
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
import { HelmetProvider } from 'react-helmet-async';
import ThemeProvider from './components/ThemeProvider.jsx';
import React from 'react';
import { initDevUtils } from './utils/devUtils.js';

// Initialize development utilities for better error handling
if (import.meta.env.DEV) {
  initDevUtils();
}

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
        {/* HelmetProvider - enables async <head> management for SEO */}
        <HelmetProvider>
          {/* Theme Provider - manages dark/light theme throughout app */}
          <ThemeProvider>     
            <App />        
          </ThemeProvider>
        </HelmetProvider>
      </Provider>
    </PersistGate>
  </React.StrictMode>
);