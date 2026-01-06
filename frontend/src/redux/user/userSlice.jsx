import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../utils/api';

// Initial state
const initialState = {
  currentUser: null,
  error: null,
  loading: false, 
  accessToken: null,
  refreshToken: null,
};

/**
 * Normalize user data from Django backend to frontend format.
 * This ensures backward compatibility with existing frontend components.
 * 
 * Django Backend User Fields:
 *   - id, email, first_name, last_name, user_type, profile_picture, bio, phone_number, date_joined
 * 
 * Frontend Expected Fields:
 *   - id (was _id), email, username (derived), profilePicture, isAdmin, etc.
 */
const normalizeUser = (djangoUser) => {
  if (!djangoUser) return null;
  
  return {
    // Map Django 'id' to frontend (also support _id for backward compatibility)
    id: djangoUser.id,
    _id: djangoUser.id, // Backward compatibility
    
    // Email is the primary identifier
    email: djangoUser.email,
    
    // Create a username from first_name + last_name, or email prefix
    username: djangoUser.first_name && djangoUser.last_name 
      ? `${djangoUser.first_name} ${djangoUser.last_name}`.trim()
      : djangoUser.email?.split('@')[0] || '',
    
    // Name fields
    firstName: djangoUser.first_name || '',
    lastName: djangoUser.last_name || '',
    
    // Profile fields - convert snake_case to camelCase
    profilePicture: djangoUser.profile_picture || '',
    bio: djangoUser.bio || '',
    phoneNumber: djangoUser.phone_number || '',
    
    // User role/type
    userType: djangoUser.user_type || 'READER',
    
    // Admin check - Django uses user_type 'ADMIN' or is_staff/is_superuser
    isAdmin: djangoUser.user_type === 'ADMIN' || djangoUser.is_staff || djangoUser.is_superuser || false,
    
    // Timestamps
    dateJoined: djangoUser.date_joined || null,
    createdAt: djangoUser.date_joined || null, // Backward compatibility
  };
};

// Helper functions
const validateUser = (user) => {
  if (!user || typeof user !== 'object') return false;
  // Updated validation for Django backend (uses 'id' not '_id', uses email not username)
  if (!user.id || !user.email) return false;
  return true;
};

const handleApiError = (error) => {
  console.error('API Error:', error);
  return error.message || 'Something went wrong';
};

// Async thunks - Updated endpoints for Django backend
export const signUp = createAsyncThunk(
  'user/signup',
  async (userData, { rejectWithValue }) => {
    try {
      // Transform frontend signup data to Django backend format
      const djangoPayload = {
        email: userData.email,
        password: userData.password,
        confirm_password: userData.password, // Django requires confirmation
        first_name: userData.firstName || userData.username?.split(' ')[0] || userData.email.split('@')[0],
        last_name: userData.lastName || userData.username?.split(' ').slice(1).join(' ') || '',
        user_type: userData.userType || 'READER',
      };
      
      const response = await apiFetch('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify(djangoPayload),
      });
      
      // Store tokens
      if (response.access) {
        localStorage.setItem('accessToken', response.access);
      }
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
      
      return {
        user: normalizeUser(response.user),
        access: response.access,
        refresh: response.refresh,
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const signIn = createAsyncThunk(
  'user/signin',
  async (userData, { rejectWithValue }) => {
    try {
      // Django login endpoint uses email and password
      const response = await apiFetch('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });
      
      // Store tokens
      if (response.access) {
        localStorage.setItem('accessToken', response.access);
      }
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
      
      return {
        user: normalizeUser(response.user),
        access: response.access,
        refresh: response.refresh,
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const googleSignIn = createAsyncThunk(
  'user/googleSignin',
  async (userData, { rejectWithValue }) => {
    try {
      // Django social auth endpoint for Google
      const response = await apiFetch('/api/auth/social/google/', {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          first_name: userData.name?.split(' ')[0] || userData.email.split('@')[0],
          last_name: userData.name?.split(' ').slice(1).join(' ') || '',
          google_id: userData.googleId || '',
          profile_picture: userData.googlePhotoUrl || '',
        }),
      });
      
      // Store tokens
      if (response.access) {
        localStorage.setItem('accessToken', response.access);
      }
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
      
      return {
        user: normalizeUser(response.user),
        access: response.access,
        refresh: response.refresh,
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Facebook OAuth sign in
export const facebookSignIn = createAsyncThunk(
  'user/facebookSignin',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/auth/social/facebook/', {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          first_name: userData.name?.split(' ')[0] || userData.email?.split('@')[0] || '',
          last_name: userData.name?.split(' ').slice(1).join(' ') || '',
          facebook_id: userData.facebookId || userData.id || '',
          profile_picture: userData.picture?.data?.url || userData.photoUrl || '',
        }),
      });
      
      if (response.access) {
        localStorage.setItem('accessToken', response.access);
      }
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
      
      return {
        user: normalizeUser(response.user),
        access: response.access,
        refresh: response.refresh,
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Twitter/X OAuth sign in
export const twitterSignIn = createAsyncThunk(
  'user/twitterSignin',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/auth/social/twitter/', {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email || '',
          first_name: userData.name?.split(' ')[0] || userData.username || '',
          last_name: userData.name?.split(' ').slice(1).join(' ') || '',
          twitter_id: userData.twitterId || userData.id || '',
          profile_picture: userData.profile_image_url || userData.photoUrl || '',
        }),
      });
      
      if (response.access) {
        localStorage.setItem('accessToken', response.access);
      }
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
      }
      
      return {
        user: normalizeUser(response.user),
        access: response.access,
        refresh: response.refresh,
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/update',
  async ({ userId, formData, onUploadProgress }, { rejectWithValue }) => {
    try {
      // Django profile update endpoint
      const response = await apiFetch('/api/auth/profile/update/', {
        method: 'PATCH',
        body: formData, // apiFetch will handle FormData properly
      });
      return { user: normalizeUser(response) };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/delete',
  async (userId, { rejectWithValue }) => {
    try {
      // Self-delete via profile endpoint or admin endpoint
      await apiFetch('/api/auth/profile/', {
        method: 'DELETE',
      });
      // Clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return userId;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const signOut = createAsyncThunk(
  'user/signout',
  async (_, { rejectWithValue, getState }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await apiFetch('/api/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      });
      // Clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return true;
    } catch (error) {
      // Still clear tokens even if logout fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Fetch current user profile
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiFetch('/api/auth/profile/', {
        method: 'GET',
      });
      return { user: normalizeUser(response) };
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
    // Clear all user state (useful for logout)
    clearUserState: (state) => {
      state.currentUser = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
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

    // Updated auth fulfilled handler for Django JWT response
    const authFulfilledState = (state, action) => {
      const payload = action.payload;
      const user = payload.user || payload;
      
      if (validateUser(user)) {
        state.currentUser = user;
        state.accessToken = payload.access || null;
        state.refreshToken = payload.refresh || null;
      } else {
        state.error = 'Invalid user data';
      }
      state.loading = false;
    };

    const clearUserStateReducer = (state) => {
      state.currentUser = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
    };

    builder
      .addCase(signUp.pending, pendingState)
      .addCase(signUp.fulfilled, authFulfilledState)
      .addCase(signUp.rejected, rejectedState)

      .addCase(signIn.pending, pendingState)
      .addCase(signIn.fulfilled, authFulfilledState)
      .addCase(signIn.rejected, rejectedState)

      .addCase(googleSignIn.pending, pendingState)
      .addCase(googleSignIn.fulfilled, authFulfilledState)
      .addCase(googleSignIn.rejected, rejectedState)

      .addCase(facebookSignIn.pending, pendingState)
      .addCase(facebookSignIn.fulfilled, authFulfilledState)
      .addCase(facebookSignIn.rejected, rejectedState)

      .addCase(twitterSignIn.pending, pendingState)
      .addCase(twitterSignIn.fulfilled, authFulfilledState)
      .addCase(twitterSignIn.rejected, rejectedState)

      .addCase(updateUser.pending, pendingState)
      .addCase(updateUser.fulfilled, (state, action) => {
        const user = action.payload.user || action.payload;
        if (validateUser(user)) {
          state.currentUser = user;
        } else {
          state.error = 'Invalid user data';
        }
        state.loading = false;
      })
      .addCase(updateUser.rejected, rejectedState)

      .addCase(deleteUser.pending, pendingState)
      .addCase(deleteUser.fulfilled, clearUserStateReducer)
      .addCase(deleteUser.rejected, rejectedState)

      .addCase(signOut.pending, pendingState)
      .addCase(signOut.fulfilled, clearUserStateReducer)
      .addCase(signOut.rejected, (state, action) => {
        // Still clear user state even on logout error
        state.currentUser = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchCurrentUser.pending, pendingState)
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const user = action.payload.user || action.payload;
        if (validateUser(user)) {
          state.currentUser = user;
        }
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, rejectedState);
  },
});

// Export actions and reducer
export const { clearError, setCurrentUser, clearUserState } = userSlice.actions;
export default userSlice.reducer;