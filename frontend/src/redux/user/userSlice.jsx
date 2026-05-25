/**
 * User Redux Slice
 * 
 * Manages all user authentication and profile state including:
 * - User authentication (sign up, sign in, sign out)
 * - Social auth (Google, Facebook, Twitter)
 * - Profile updates and management
 * - User session persistence
 * - Loading and error states
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * STATE STRUCTURE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * @typedef {Object} UserState
 * @property {Object|null} currentUser - Authenticated user object with fields:
 *   - id: User ID (string/number)
 *   - email: User email address (string)
 *   - profile_picture: URL to profile image (string, Cloudinary CDN)
 *   - is_admin: Admin flag (boolean)
 *   - is_instructor: Instructor flag (boolean)
 *   - has_enrollments: Has enrolled in courses (boolean)
 *   - bio: User biography (string)
 *   - created_at: Account creation timestamp (ISO string)
 * @property {string|null} error - Error message from failed operations
 * @property {boolean} loading - Whether async operation is in progress
 * @property {string|null} token - JWT access token for API requests
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ASYNC THUNKS (API ACTIONS)
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * signUp:         Register new user (POST /api/v1/auth/register/)
 * signIn:         Login with email/password (POST /api/v1/auth/login/)
 * googleSignIn:   Sign in via Google OAuth (POST /api/v1/auth/google/)
 * facebookSignIn: Sign in via Facebook OAuth (POST /api/v1/auth/facebook/)
 * twitterComplete: Complete Twitter OAuth flow (POST /api/v1/auth/twitter/complete/)
 * updateUser:     Update profile info (PUT /api/v1/auth/profile/update/)
 * deleteUser:     Delete user account (DELETE /api/v1/auth/users/delete/{id})
 * signOut:        Logout user (POST /api/v1/auth/logout/)
 * refreshUser:    Fetch fresh user data (GET /api/v1/auth/profile/)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════
 * REDUCERS (SYNCHRONOUS ACTIONS)
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * clearError:       Clear error message from state
 * setCurrentUser:   Manually set current user object
 * socialAuthSuccess: Handle successful social auth callback (postMessage flow)
 * 
 * @module UserSlice
 * @version 2.0.0
 * @author Gikonyo Mwema
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../utils/api';

/**
 * Initial state for user slice
 * @type {UserState}
 */
const initialState = {
  currentUser: null,
  error: null,
  loading: false, 
  token: null,
};

/**
 * Fix profile picture URLs to ensure valid Cloudinary CDN URLs
 * Currently a no-op but reserved for future URL transformation needs
 * 
 * @param {Object} user - User object potentially with profile_picture URL
 * @returns {Object} User object with fixed URLs
 * @private
 */
const fixProfileUrl = (user) => {
  if (!user) return user;
  return user;
};

/**
 * Validate user object contains required fields
 * Ensures data integrity from backend responses
 * 
 * @param {*} user - Potential user object to validate
 * @returns {boolean} True if user is valid object with email field
 * @private
 */
const validateUser = (user) => {
  if (!user || typeof user !== 'object') return false;
  // Email is the critical field for email-based authentication system
  if (!user.email) return false;
  return true;
};

/**
 * Handle API errors consistently across async thunks
 * Logs error and returns readable message
 * 
 * @param {Error} error - Error thrown from apiFetch
 * @returns {string} Error message to store in state
 * @private
 */
const handleApiError = (error) => {
  console.error('API Error:', error);
  return error.message || 'Something went wrong';
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * ASYNC THUNKS - API INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Sign up - Register a new user account
 * 
 * @async
 * @type {AsyncThunk}
 * @param {Object} userData - Registration data
 * @param {string} userData.email - User email address
 * @param {string} userData.password - Password (min 6 chars)
 * @param {string} [userData.first_name] - First name (optional)
 * @param {string} [userData.last_name] - Last name (optional)
 * @returns {Promise<Object>} - {user, token, refresh_token}
 * @throws {string} - Error message on validation or network failure
 * 
 * @example
 * dispatch(signUp({ 
 *   email: 'user@example.com', 
 *   password: 'secure123',
 *   first_name: 'John'
 * }))
 */
export const signUp = createAsyncThunk(
  'user/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/v1/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Sign in - Authenticate user with email and password
 * 
 * @async
 * @type {AsyncThunk}
 * @param {Object} userData - Login credentials
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} - {user, token, refresh_token}
 * @throws {string} - "Invalid credentials" or network error
 * 
 * @example
 * dispatch(signIn({ email: 'user@example.com', password: 'password123' }))
 */
export const signIn = createAsyncThunk(
  'user/signin',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/v1/auth/login/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Google Sign In - OAuth 2.0 authentication via Google
 * 
 * @async
 * @type {AsyncThunk}
 * @param {Object} userData - Google OAuth data
 * @param {string} userData.id_token - Google ID token from frontend
 * @returns {Promise<Object>} - {user, token, refresh_token}
 * @throws {string} - Token validation error or network failure
 * 
 * @example
 * const googleResponse = await window.google.accounts.id.getCurrentAccount();
 * dispatch(googleSignIn({ id_token: googleResponse.credential }))
 */
export const googleSignIn = createAsyncThunk(
  'user/googleSignin',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/v1/auth/google/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Facebook Sign In - OAuth 2.0 authentication via Facebook
 * 
 * @async
 * @type {AsyncThunk}
 * @param {Object} userData - Facebook OAuth data
 * @param {string} userData.access_token - Facebook access token from SDK
 * @returns {Promise<Object>} - {user, token, refresh_token}
 * @throws {string} - Token invalid or network error
 * 
 * @example
 * FB.login((response) => {
 *   dispatch(facebookSignIn({ access_token: response.authResponse.accessToken }))
 * })
 */
export const facebookSignIn = createAsyncThunk(
  'user/facebookSignin',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/v1/auth/facebook/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Twitter Sign In Complete - Finalize Twitter OAuth 3-legged flow
 * 
 * @async
 * @type {AsyncThunk}
 * @param {Object} userData - OAuth verification data from Twitter callback
 * @param {string} userData.oauth_token - Request token from Twitter
 * @param {string} userData.oauth_verifier - Verifier from user approval
 * @returns {Promise<Object>} - {user, token, refresh_token}
 * @throws {string} - OAuth verification failed or network error
 * 
 * @note Twitter OAuth uses 3-legged flow; this completes the process
 */
export const twitterComplete = createAsyncThunk(
  'user/twitterComplete',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/v1/auth/twitter/complete/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Update User Profile - Update profile information and picture
 * 
 * @async
 * @type {AsyncThunk}
 * @param {Object} data - Update data as FormData
 * @param {FormData} data.formData - FormData object with:
 *   - profile_picture (File, optional): Profile image file
 *   - bio (string, optional): User biography
 *   - first_name (string, optional): First name
 *   - last_name (string, optional): Last name
 * @returns {Promise<Object>} - Updated user fields {profile_picture, bio, ...}
 * @throws {string} - Validation error or upload failure
 * 
 * @note Requires authentication token in localStorage
 * @note Profile picture: max 5MB, auto-crops with Cloudinary, returns CDN URL
 * 
 * @example
 * const formData = new FormData();
 * formData.append('profile_picture', fileInput.files[0]);
 * formData.append('bio', 'I teach web development');
 * dispatch(updateUser({ formData }))
 */
export const updateUser = createAsyncThunk(
  'user/update',
  async ({ userId, formData, onUploadProgress }, { rejectWithValue }) => {
    try {
      // Use the correct endpoint for updating the current user's profile
      // It doesn't require the ID in the URL as it uses the authenticated user from the request
      const response = await apiFetch('/api/v1/auth/profile/update/', {
        method: 'PUT',
        body: formData, // apiFetch will handle FormData properly
      });
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Delete User - Permanently delete user account and all data
 * 
 * @async
 * @type {AsyncThunk}
 * @param {string|number} userId - User ID to delete
 * @returns {Promise<string|number>} - Deleted user ID
 * @throws {string} - Permission denied or user not found
 * 
 * @warning This action is irreversible! All user data, enrollments, and posts are deleted
 * @note Only admin can delete other users; users can delete their own accounts
 */
export const deleteUser = createAsyncThunk(
  'user/delete',
  async (userId, { rejectWithValue }) => {
    try {
      await apiFetch(`/api/v1/auth/users/delete/${userId}`, {
        method: 'DELETE',
      });
      return userId;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

/**
 * Sign Out - Logout user and invalidate token
 * 
 * @async
 * @type {AsyncThunk}
 * @returns {Promise<boolean>} - Always true (forces frontend logout even if backend fails)
 * 
 * @note Calls backend to blacklist refresh token
 * @note If backend unreachable, still logs out frontend (graceful degradation)
 * @note Clears localStorage token and Redux auth state
 * 
 * @example
 * dispatch(signOut())
 */
export const signOut = createAsyncThunk(
  'user/signout',
  async (_, { rejectWithValue }) => {
    try {
      await apiFetch('/api/v1/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      return true;
    } catch (error) {
      // If backend logout fails (e.g. no refresh token, network error),
      // we still want to log the user out on the frontend.
      console.warn('Backend logout failed, forcing local logout:', error);
      return true;
    }
  }
);

/**
 * Refresh User - Fetch fresh user data from backend
 * 
 * @async
 * @type {AsyncThunk}
 * @returns {Promise<Object>} - Updated user object with latest flags
 * @throws {string} - Not authenticated or network error
 * 
 * @note Used to sync latest user data (e.g. has_enrollments flag after enrollment)
 * @note Called after enrollment, role changes, or profile updates
 * 
 * @example
 * dispatch(refreshUser()) // Get updated user data from backend
 */
export const refreshUser = createAsyncThunk(
  'user/refresh',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { user } = getState();
      if (!user.currentUser) {
        throw new Error('No user logged in');
      }
      const response = await apiFetch('/api/v1/auth/profile/');
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);


/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * REDUX SLICE - STATE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * This slice manages user authentication state and provides reducers for:
 * - Synchronous actions (clearError, setCurrentUser, socialAuthSuccess)
 * - Asynchronous thunk handlers (pending, fulfilled, rejected states)
 * 
 * All mutations follow Redux immutability patterns using RTK's Immer integration
 */

// Slice creation
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Clear the error message from state
     * Used after user acknowledges error, or on new action attempt
     */
    clearError: (state) => {
      state.error = null;
    },
    
    /**
     * Manually set current user object
     * Useful for programmatic user updates outside async thunks
     * Includes validation to prevent invalid data
     */
    setCurrentUser: (state, action) => {
      if (validateUser(action.payload)) {
        state.currentUser = action.payload;
      }
    },
    
    /**
     * Handle successful social authentication from postMessage callback
     * Twitter OAuth uses popup window that communicates via postMessage
     * This reducer handles the response from that popup
     * 
     * @param {Object} action.payload - Data from postMessage event
     * @param {Object} action.payload.user - User object from backend
     * @param {string} action.payload.token - JWT access token
     */
    socialAuthSuccess: (state, action) => {
      const userData = action.payload.user || action.payload;
      const token = action.payload.token || action.payload.access || action.payload.key;
      if (validateUser(userData)) {
        state.loading = false;
        state.currentUser = fixProfileUrl(userData);
        state.token = token;
        state.error = null;
        try { if (token) localStorage.setItem('token', token); } catch {}
      }
    },
  },
  extraReducers: (builder) => {
    /**
     * ═══════════════════════════════════════════════════════════════════════════════════
     * HELPER STATE UPDATERS - Reusable patterns for async thunk handlers
     * ═══════════════════════════════════════════════════════════════════════════════════
     */
    
    /**
     * Set loading state on pending async thunk
     * Called when any async operation starts
     */
    const pendingState = (state) => {
      state.loading = true;
      state.error = null;
    };

    /**
     * Set error state on rejected async thunk
     * Called when any async operation fails
     */
    const rejectedState = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    /**
     * Handle successful authentication thunk
     * Extracts user object and token from various response formats
     * Stores token in localStorage for persistence
     * Validates user data before setting state
     */
    const authFulfilledState = (state, action) => {
      // Direct access from payload.user based on how backend sends it
      const userData = action.payload.user || action.payload;
      const token = action.payload.token || action.payload.access || action.payload.key;

      if (validateUser(userData)) {
        state.loading = false;
        state.currentUser = fixProfileUrl(userData);
        state.token = token;
        state.error = null;
        try {
          if (token) {
            localStorage.setItem('token', token);
          }
        } catch {}
      } else {
        state.loading = false;
        state.error = 'Invalid user data received from server';
        console.error('Invalid user data:', userData);
      }
    };

    /**
     * Clear all user state on logout
     * Removes token from localStorage and resets Redux state
     * Called on successful logout or account deletion
     */
    const clearUserState = (state) => {
      state.currentUser = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
    };

    /**
     * ═══════════════════════════════════════════════════════════════════════════════════
     * ASYNC THUNK HANDLERS - Pending, Fulfilled, Rejected states
     * ═══════════════════════════════════════════════════════════════════════════════════
     */
    
    // Sign Up
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        const userData = action.payload.user || action.payload;
        const token = action.payload.token || action.payload.access || action.payload.key;
        
        state.loading = false;
        state.currentUser = fixProfileUrl(userData);
        state.token = token;
        state.error = null;
        
        if (token) {
          localStorage.setItem('token', token);
        }
      })
      .addCase(signUp.rejected, rejectedState)

      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        const userData = action.payload.user || action.payload;
        const token = action.payload.token || action.payload.access || action.payload.key;
        
        state.loading = false;
        state.currentUser = fixProfileUrl(userData);
        state.token = token;
        state.error = null;
        
        if (token) {
          localStorage.setItem('token', token);
        }
      })
      .addCase(signIn.rejected, rejectedState)

      // Google Sign In
      .addCase(googleSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        const userData = action.payload.user || action.payload;
        const token = action.payload.token || action.payload.access || action.payload.key;
        
        state.loading = false;
        state.currentUser = fixProfileUrl(userData);
        state.token = token;
        state.error = null;
        
        if (token) {
          localStorage.setItem('token', token);
        }
      })
      .addCase(googleSignIn.rejected, rejectedState)

      // Facebook Sign In
      .addCase(facebookSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(facebookSignIn.fulfilled, (state, action) => {
        const userData = action.payload.user || action.payload;
        const token = action.payload.token || action.payload.access || action.payload.key;
        
        state.loading = false;
        state.currentUser = fixProfileUrl(userData);
        state.token = token;
        state.error = null;
        
        if (token) {
          localStorage.setItem('token', token);
        }
      })
      .addCase(facebookSignIn.rejected, rejectedState)

      // Twitter Sign In Complete
      .addCase(twitterComplete.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(twitterComplete.fulfilled, (state, action) => {
        const userData = action.payload.user || action.payload;
        const token = action.payload.token || action.payload.access || action.payload.key;
        
        state.loading = false;
        state.currentUser = fixProfileUrl(userData);
        state.token = token;
        state.error = null;
        
        if (token) {
          localStorage.setItem('token', token);
        }
      })
      .addCase(twitterComplete.rejected, rejectedState)

      // Update User
      .addCase(updateUser.pending, pendingState)
      .addCase(updateUser.fulfilled, (state, action) => {
        let updatedFields = action.payload; // Contains profile_picture, etc.
        
        // Handle potential nested wrapper from backend (just in case)
        if (updatedFields && updatedFields.user) {
            updatedFields = updatedFields.user;
        }

        // Merge allowed update fields with existing user data
        if (state.currentUser && typeof updatedFields === 'object') {
            // Create a new object for currentUser to ensure immutability
            const newCurrentUser = { ...state.currentUser, ...updatedFields };
            
            state.currentUser = newCurrentUser;
        } else if (validateUser(updatedFields)) {
             // Fallback if full user object is returned
             state.currentUser = fixProfileUrl(updatedFields);
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUser.rejected, rejectedState)

      // Delete User
      .addCase(deleteUser.pending, pendingState)
      .addCase(deleteUser.fulfilled, clearUserState)
      .addCase(deleteUser.rejected, rejectedState)

      // Sign Out
      .addCase(signOut.pending, pendingState)
      .addCase(signOut.fulfilled, clearUserState)
      .addCase(signOut.rejected, rejectedState)

      // Refresh User Data
      .addCase(refreshUser.fulfilled, (state, action) => {
        const userData = action.payload.user || action.payload;
        if (validateUser(userData)) {
          state.currentUser = fixProfileUrl(userData);
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(refreshUser.rejected, (state, action) => {
        // Don't clear user on refresh failure, just log warning
        console.warn('User refresh failed:', action.payload);
        state.loading = false;
      });
  },
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * EXPORTS - Actions and Reducer
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Synchronous action creators from reducers
 * Import these for manual state updates
 */
export const { clearError, setCurrentUser, socialAuthSuccess } = userSlice.actions;
export default userSlice.reducer;