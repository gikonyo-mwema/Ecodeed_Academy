/**
 * API Utility Functions
 * Provides consistent API URL handling across the application
 * Updated for Django REST Framework backend with JWT authentication
 */

/**
 * Get the API base URL from environment variables
 * For unified Render deployment, always use relative URLs
 */
export const getApiBaseUrl = () => {
  // Prefer explicit base URL if provided (supports split frontend/backend)
  const envBase = import.meta.env.VITE_API_URL?.trim();
  if (envBase) return envBase.replace(/\/$/, '');

  // Fallback to same-origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // SSR/unknown: use relative
  return '';
};

/**
 * Build a complete API URL
 * @param {string} endpoint - The API endpoint (e.g., '/api/posts/getPosts')
 * @returns {string} - Complete URL
 */
export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();

  // Ensure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If base is empty, return endpoint as-is (relative)
  if (!baseUrl) return normalizedEndpoint;

  return `${baseUrl}${normalizedEndpoint}`;
};

/**
 * Get authentication token from storage
 * Supports both new (accessToken) and legacy (token) storage keys
 * @returns {string|null} The access token or null
 */
const getAuthToken = () => {
  // Try new token storage first (Django JWT)
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) return accessToken;
  
  // Fallback to legacy token storage
  const legacyToken = localStorage.getItem('token');
  if (legacyToken) return legacyToken;
  
  // Try extracting from cookies as fallback
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(row => row.startsWith('access_token=') || row.startsWith('access='));
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  
  return null;
};

/**
 * Refresh the access token using the refresh token
 * @returns {Promise<string|null>} New access token or null
 */
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  
  try {
    const response = await fetch(buildApiUrl('/api/auth/token/refresh/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (!response.ok) {
      // Refresh token is invalid, clear all tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
    
    const data = await response.json();
    if (data.access) {
      localStorage.setItem('accessToken', data.access);
      return data.access;
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

/**
 * Enhanced fetch function that handles API URLs correctly
 * Includes automatic token refresh on 401 responses
 * @param {string} endpoint - The API endpoint
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} - Parsed response data
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  
  // Ensure credentials are included for authentication
  const defaultOptions = {
    credentials: 'include',
    ...options,
  };

  // Add Authorization header if token is available
  const token = getAuthToken();
  
  // Only set default Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    defaultOptions.headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
  } else {
    // For FormData, let the browser set the Content-Type with boundary
    defaultOptions.headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
  }
  
  // Debug logging for upload requests
  if (endpoint.includes('upload')) {
    console.log('🔍 Upload request debug:', {
      url,
      credentials: defaultOptions.credentials,
      hasFormData: options.body instanceof FormData,
      cookies: document.cookie,
      headers: defaultOptions.headers
    });
  }
  
  try {
    let response = await fetch(url, defaultOptions);
    
    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && !options._isRetry) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry the request with new token
        defaultOptions.headers = {
          ...defaultOptions.headers,
          Authorization: `Bearer ${newToken}`,
        };
        defaultOptions._isRetry = true;
        response = await fetch(url, defaultOptions);
      }
    }
    
    // Check if the response is OK
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        // Handle Django REST Framework error format
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(', ');
        } else {
          // Handle field-specific errors
          const fieldErrors = Object.entries(errorData)
            .filter(([key, value]) => Array.isArray(value))
            .map(([key, value]) => `${key}: ${value.join(', ')}`)
            .join('; ');
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        }
      } catch (parseError) {
        // If we can't parse the error response, use the status text
        if (response.status === 401) {
          errorMessage = 'Authentication required. Please sign in.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (response.status === 502) {
          errorMessage = 'Backend service is temporarily unavailable. Please try again in a few moments.';
        } else if (response.status >= 500) {
          errorMessage = 'Internal server error. Please try again later.';
        }
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    
    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    }
    
    // Return empty object for no-content responses (204, etc.)
    return {};
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    
    // Re-throw other errors
    throw error;
  }
};

export default { getApiBaseUrl, buildApiUrl, apiFetch };
