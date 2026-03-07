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
 * @param {string} endpoint - The API endpoint (e.g., '/api/v1/posts/')
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
    if (localToken && localToken !== 'undefined' && localToken !== 'null') {
      return localToken;
    }
    
    // Try extracting from cookies as fallback
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(row => row.startsWith('access_token='));
    if (tokenCookie) {
      const value = tokenCookie.split('=')[1];
      if (value && value !== 'undefined' && value !== 'null') {
        return value;
      }
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
  
  try {
    const response = await fetch(url, defaultOptions);
    
    // Check if the response is OK
    if (!response.ok) {
        const isAuthEndpoint = endpoint.includes('/auth/login') || 
                              endpoint.includes('/auth/logout') || 
                              endpoint.includes('/auth/register');

        // Special handling for 401 Unauthorized with invalid token
        if (response.status === 401 && !isAuthEndpoint) {
            // Check if we are already on sign-in or sign-up pages to avoid loops
            const isAuthPage = window.location.pathname.includes('/sign-in') || 
                              window.location.pathname.includes('/sign-up');
            
            // If the token is invalid/expired, we should clear it and potentially retry
            // if the endpoint allows anonymous access (like getPosts)
            try {
                const errorClone = response.clone();
                let errorData = {};
                try {
                    errorData = await errorClone.json();
                } catch (e) {
                    // Not JSON
                }

                // Improved check to catch more token related errors
                const checkString = JSON.stringify(errorData);
                const isTokenError = checkString && (
                    checkString.includes('token_not_valid') || 
                    checkString.includes('Given token not valid') ||
                    checkString.includes('Invalid token') ||
                    checkString.includes('Authentication credentials were not provided')
                );

                if (isTokenError || response.status === 401) {
                    // Only dispatch logout if we're not already on an auth page and actually have a token to clear
                    if (!isAuthPage && localStorage.getItem('token')) {
                        localStorage.removeItem('token');
                        window.dispatchEvent(new CustomEvent('auth:logout'));
                    }
                    
                    // Remove Authorization header and retry anonymously
                    const retryOptions = { ...defaultOptions };
                    retryOptions.credentials = 'omit';
                    
                    if (retryOptions.headers) {
                        const newHeaders = { ...retryOptions.headers };
                        delete newHeaders['Authorization'];
                        retryOptions.headers = newHeaders;
                    }
                    
                    // Retry the request
                    const retryResponse = await fetch(url, retryOptions);
                    if (retryResponse.ok) {
                        try {
                            return await retryResponse.json();
                        } catch (e) {
                            return null;
                        }
                    }
                    
                    // If retry fails, use it's error details
                    let retryErrorData = {};
                    try {
                        retryErrorData = await retryResponse.json();
                    } catch (e) {}

                    const retryErrorMessage = retryErrorData.detail || retryErrorData.message || 
                        (typeof retryErrorData === 'string' ? retryErrorData : `Request failed with status ${retryResponse.status}`);
                    
                    const retryError = new Error(retryErrorMessage);
                    retryError.status = retryResponse.status;
                    throw retryError;
                }
            } catch (e) {
                if (e.status) throw e; 
            }
        }

      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
            errorMessage = errorData.message;
        } else if (errorData.error) {
            errorMessage = errorData.error;
        } else if (typeof errorData === 'object' && errorData !== null) {
            // Handle DRF validation errors: { "field": ["Error msg"], ... }
            const messages = Object.values(errorData).flat();
            if (messages.length > 0) {
                errorMessage = messages.join(' ');
            }
        }
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
    
    // Handle empty responses (e.g., 204 No Content for DELETE requests)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }
    
    // Check if response has content before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // No JSON content, return null or empty object
      return null;
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
