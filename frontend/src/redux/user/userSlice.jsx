import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../utils/api';

// Initial state
const initialState = {
  currentUser: null,
  error: null,
  loading: false, 
  token: null,
};

// Helper functions
const fixProfileUrl = (user) => {
  if (!user) return user;

  // Normalize ID for frontend compatibility (MongoDB -> SQL transition)
  if (user.id && !user._id) {
    user._id = user.id;
  }

  if (user.profile_picture && typeof user.profile_picture === 'string') {
    // Replace internal docker hostname with localhost for browser access
    user.profile_picture = user.profile_picture.replace('http://backend:8000', 'http://localhost:8000');
    user.profile_picture = user.profile_picture.replace('http://backend', 'http://localhost:8000');
  }
  return user;
};

const validateUser = (user) => {
  if (!user || typeof user !== 'object') return false;
  // Adjusted validation for backend response format (email is the critical field)
  if (!user.email) return false;
  return true;
};

const handleApiError = (error) => {
  console.error('API Error:', error);
  return error.message || 'Something went wrong';
};

// Async thunks
export const signUp = createAsyncThunk(
  'user/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const signIn = createAsyncThunk(
  'user/signin',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const googleSignIn = createAsyncThunk(
  'user/googleSignin',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/update',
  async ({ userId, formData, onUploadProgress }, { rejectWithValue }) => {
    try {
      // Use the correct endpoint for updating the current user's profile
      // It doesn't require the ID in the URL as it uses the authenticated user from the request
      const response = await apiFetch('/api/auth/profile/update/', {
        method: 'PUT',
        body: formData, // apiFetch will handle FormData properly
      });
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/delete',
  async (userId, { rejectWithValue }) => {
    try {
      await apiFetch(`/api/users/delete/${userId}`, {
        method: 'DELETE',
      });
      return userId;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const signOut = createAsyncThunk(
  'user/signout',
  async (_, { rejectWithValue }) => {
    try {
      await apiFetch('/api/auth/logout/', {
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

// Refresh user data from backend (to get updated hasEnrollments, etc.)
export const refreshUser = createAsyncThunk(
  'user/refresh',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { user } = getState();
      if (!user.currentUser) {
        throw new Error('No user logged in');
      }
      const response = await apiFetch('/api/auth/profile/');
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Slice creation
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action) => {
      if (validateUser(action.payload)) {
        state.currentUser = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Common state handlers
    const pendingState = (state) => {
      state.loading = true;
      state.error = null;
    };

    const rejectedState = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

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

    const clearUserState = (state) => {
      state.currentUser = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
    };

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

      .addCase(updateUser.pending, pendingState)
      .addCase(updateUser.fulfilled, (state, action) => {
        console.log('Update payload:', action.payload);
        let updatedFields = action.payload; // Contains profile_picture, etc.
        
        // Handle potential nested wrapper from backend (just in case)
        if (updatedFields && updatedFields.user) {
            updatedFields = updatedFields.user;
        }

        // Merge allowed update fields with existing user data
        if (state.currentUser && typeof updatedFields === 'object') {
            // Create a new object for currentUser to ensure immutability
            const newCurrentUser = { ...state.currentUser, ...updatedFields };
            
            // Fix profile URL if present and starts with internal backend URL
            if (newCurrentUser.profile_picture && typeof newCurrentUser.profile_picture === 'string') {
               newCurrentUser.profile_picture = newCurrentUser.profile_picture.replace('http://backend:8000', 'http://localhost:8000').replace('http://backend', 'http://localhost:8000');
            }
            
            state.currentUser = newCurrentUser;
        } else if (validateUser(updatedFields)) {
             // Fallback if full user object is returned
             state.currentUser = fixProfileUrl(updatedFields);
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUser.rejected, rejectedState)

      .addCase(deleteUser.pending, pendingState)
      .addCase(deleteUser.fulfilled, clearUserState)
      .addCase(deleteUser.rejected, rejectedState)

      .addCase(signOut.pending, pendingState)
      .addCase(signOut.fulfilled, clearUserState)
      .addCase(signOut.rejected, rejectedState)

      // Refresh user data
      .addCase(refreshUser.fulfilled, (state, action) => {
        const userData = action.payload.user || action.payload;
        if (validateUser(userData)) {
          state.currentUser = fixProfileUrl(userData);
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(refreshUser.rejected, (state, action) => {
        // Don't clear user on refresh failure, just log
        console.warn('User refresh failed:', action.payload);
        state.loading = false;
      });
  },
});

// Export actions and reducer
export const { clearError, setCurrentUser } = userSlice.actions;
export default userSlice.reducer;