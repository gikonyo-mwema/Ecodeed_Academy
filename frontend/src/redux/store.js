/**
 * Redux Store Configuration
 * 
 * Configures the global state management for the MERN blog application.
 * This store manages:
 * - User authentication state
 * - Theme preferences (dark/light mode)
 * - Application-wide state persistence
 * 
 * Features:
 * - Redux Toolkit for modern Redux patterns
 * - Redux Persist for state persistence across sessions
 * - Combined reducers for modular state management
 * - Serialization handling for complex data types
 * 
 * State Structure:
 * - user: Authentication state, user profile, admin status
 * - theme: UI theme preferences and settings
 * 
 * Persistence:
 * - Stores state in localStorage
 * - Automatically rehydrates state on app restart
 * - Maintains user sessions and preferences
 * 
 * @module ReduxStore
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import individual slice reducers
import userReducer from './user/userSlice';
import themeReducer from './theme/themeSlice';

/**
 * Root Reducer Configuration
 * 
 * Combines all individual reducers into a single root reducer
 * Each slice manages its own portion of the application state
 */
const rootReducer = combineReducers({
    user: userReducer,   // Handles authentication, user profile, and admin status
    theme: themeReducer, // Manages UI theme preferences
});

/**
 * Persistence Configuration
 * 
 * Configures Redux Persist to save state to localStorage
 * - key: Storage key for the persisted state
 * - storage: Storage engine (localStorage)
 * - version: Schema version for migration handling
 */
const persistConfig = {
    key: 'root',
    storage,
    version: 1,
};

/**
 * Persisted Reducer
 * 
 * Wraps the root reducer with persistence capabilities
 * This allows state to survive browser refreshes and app restarts
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Redux Store Configuration
 * 
 * Creates the Redux store with:
 * - Persisted reducer for state management
 * - Disabled serialization check for non-serializable values
 * - Redux Toolkit's default middleware (thunk, devtools, etc.)
 */
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        // Disable serializable check for redux-persist compatibility
        serializableCheck: false
    }),
});

/**
 * Persistor Instance
 * 
 * Creates a persistor for the store to handle state persistence
 * Used in PersistGate component to delay rendering until state is rehydrated
 */
export const persistor = persistStore(store);