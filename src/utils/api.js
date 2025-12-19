/**
 * API Utility Functions
 * Provides consistent API URL handling across the application
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
 * Enhanced fetch function that handles API URLs correctly
 * @param {string} endpoint - The API endpoint
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} - Parsed response data
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  
  // Get authentication token from various sources
  const getAuthToken = () => {
    // Try localStorage
    const localToken = localStorage.getItem('token');
    if (localToken) return localToken;
    
    // Try extracting from cookies as fallback
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(row => row.startsWith('access_token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    
    return null;
  };
  
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
    const response = await fetch(url, defaultOptions);
    
    // Check if the response is OK
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        // If we can't parse the error response, use the status text
        if (response.status === 502) {
          errorMessage = 'Backend service is temporarily unavailable. Please try again in a few moments.';
        } else if (response.status >= 500) {
          errorMessage = 'Internal server error. Please try again later.';
        }
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    
    // Parse the response as JSON
    const data = await response.json();
    return data;
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
