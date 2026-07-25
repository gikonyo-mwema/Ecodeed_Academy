/**
 * API Utility Functions — Core HTTP/fetch abstraction layer.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Provides consistent API URL handling and fetch wrapping across the application.
 * Centralizes authentication token management, error handling, and URL construction.
 * Supports both relative URLs (Render unified deployment) and explicit API URLs.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════
 * - getApiBaseUrl(): Get configured API base URL from environment or current origin
 * - buildApiUrl(endpoint): Construct complete API URL from endpoint path
 * - apiFetch(endpoint, options): Fetch with auth headers and error handling
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * AUTHENTICATION FLOW
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 1. Token lookup: localStorage → cookies → none
 * 2. Authorization header: Set "Authorization: Bearer {token}" if token exists
 * 3. Credentials: Always include='include' for cookie-based auth fallback
 * 4. Error handling: Network errors, auth errors, response parsing
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 * USAGE EXAMPLES
 * ═══════════════════════════════════════════════════════════════════════════════════
 * import { apiFetch } from '@/utils/api';
 * // Simple GET
 * const users = await apiFetch('/api/v1/auth/users/');
 * // POST with body
 * const post = await apiFetch('/api/v1/posts/', {
 *   method: 'POST',
 *   body: JSON.stringify({ title: 'Hello', content: 'World' })
 * });
 * // DELETE with ID
 * await apiFetch('/api/v1/posts/123/', { method: 'DELETE' });
 * @module APIUtils
 * @version 2.0.0
 * @author Gikonyo Mwema
 */

/**
 * Get the API base URL from environment variables.
 * For unified Render deployment, always use relative URLs.
 * For separate deployments, use VITE_API_URL from environment.
 *
 * Resolution order:
 * 1. VITE_API_URL environment variable (if set and not empty)
 * 2. window.location.origin (current domain, same-origin requests)
 * 3. Empty string (relative URLs)
 *
 * @returns {string} Base URL for API requests (may be empty for relative URLs)
 */
export const getApiBaseUrl = () => {
  // Prefer explicit base URL if provided (supports split frontend/backend)
  const envBase = import.meta.env.VITE_API_URL?.trim();
  if (envBase) {
    const normalizedEnvBase = envBase.replace(/\/$/, '');
    const isLocalApi = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedEnvBase);

    // In production builds, ignore localhost API URLs entirely.
    // Use relative requests so the browser stays within the same origin and CSP.
    if (import.meta.env.PROD && isLocalApi) {
      return '';
    }

    if (isLocalApi && typeof window !== 'undefined') {
      // In development, keep localhost API URL so local frontend can reach local backend.
      return normalizedEnvBase;
    }

    return normalizedEnvBase;
  }

  // Fallback to relative same-origin requesting path.
  // This avoids scheme/host mismatches that can trigger CSP violations
  // when the app is served through a proxy or secure host.
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
 * Silent token refresh (single-flight).
 *
 * When the access token expires (~60 min) we exchange the stored refresh
 * token for a fresh access token instead of logging the user out.  This
 * keeps admins signed in while editing long posts/courses.
 *
 * A single in-flight promise is shared so that N parallel 401s trigger
 * exactly ONE refresh request (important because ROTATE_REFRESH_TOKENS
 * blacklists the old refresh token after each use).
 *
 * @returns {Promise<string|null>} - New access token, or null if refresh failed
 */
let refreshInFlight = null;

const tryRefreshToken = () => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    let refresh = null;
    try { refresh = localStorage.getItem('refresh_token'); } catch {}
    if (!refresh || refresh === 'undefined' || refresh === 'null') return null;

    try {
      const response = await fetch(buildApiUrl('/api/v1/auth/token/refresh/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) return null;

      const data = await response.json();
      if (!data?.access) return null;

      try {
        localStorage.setItem('token', data.access);
        // Backend rotates refresh tokens — store the new one
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
      } catch {}
      return data.access;
    } catch {
      return null;
    }
  })().finally(() => {
    // Allow future refreshes once this one settles
    setTimeout(() => { refreshInFlight = null; }, 0);
  });

  return refreshInFlight;
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
                              endpoint.includes('/auth/register') ||
                              endpoint.includes('/auth/token/refresh');

        // Special handling for 401 Unauthorized with invalid token
        if (response.status === 401 && !isAuthEndpoint) {
            // Check if we are already on sign-in or sign-up pages to avoid loops
            const isAuthPage = window.location.pathname.includes('/sign-in') || 
                              window.location.pathname.includes('/sign-up');
            
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
                    // ── Step 1: try a silent token refresh ──────────────
                    // Keeps the admin logged in when the access token
                    // expires mid-edit instead of forcing a re-login.
                    const newAccess = await tryRefreshToken();

                    if (newAccess) {
                        const refreshedOptions = { ...defaultOptions };
                        refreshedOptions.headers = {
                            ...refreshedOptions.headers,
                            Authorization: `Bearer ${newAccess}`,
                        };
                        const refreshedResponse = await fetch(url, refreshedOptions);
                        if (refreshedResponse.ok) {
                            if (refreshedResponse.status === 204 ||
                                refreshedResponse.headers.get('content-length') === '0') {
                                return null;
                            }
                            try {
                                return await refreshedResponse.json();
                            } catch (e) {
                                return null;
                            }
                        }
                        // Refresh worked but request still failed → real error
                        let refreshedErrorData = {};
                        try {
                            refreshedErrorData = await refreshedResponse.json();
                        } catch (e) {}
                        const refreshedErrorMessage = refreshedErrorData.detail || refreshedErrorData.message ||
                            `Request failed with status ${refreshedResponse.status}`;
                        const refreshedError = new Error(refreshedErrorMessage);
                        refreshedError.status = refreshedResponse.status;
                        throw refreshedError;
                    }

                    // ── Step 2: refresh failed → session truly expired ──
                    // Only dispatch logout if we're not already on an auth page and actually have a token to clear
                    if (!isAuthPage && localStorage.getItem('token')) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('refresh_token');
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
