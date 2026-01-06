import axios from 'axios';
/**
 * Axios-based API requester
 * - Adds JSON body automatically for plain objects
 * - Includes credentials (cookies)
 * - Pass an explicit token to set Authorization header
 * Prefer using apiFetch for fetch-based calls within client; this is used
 * by some admin hooks and remains for compatibility.
 */

export default async function apiRequest(url, token, options = {}) {
  try {
    const config = {
      method: options.method || 'GET',
      url: url,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json', 
        ...options.headers
      },
      withCredentials: true,
      ...options
    };

    // Add data for POST/PUT requests
    if (options.body) {
      config.data = JSON.parse(options.body);
    }

    const response = await axios(config);
    return response.data;

  } catch (error) {
    // Extract error message from axios response
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        `Request failed with status ${error.response?.status}`;
    
    throw new Error(errorMessage);
  }
}