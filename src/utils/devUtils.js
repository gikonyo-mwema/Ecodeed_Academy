/**
 * Development utilities for handling browser-specific issues
 * Particularly useful for Firefox WebSocket and CORS handling
 */

/**
 * Suppress Firefox WebSocket errors in development
 * These errors don't affect the application functionality but can clutter the console
 */
export const suppressWebSocketErrors = () => {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // Filter out known development-only WebSocket errors
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Skip WebSocket connection errors in development
      if (message.includes('WebSocket connection') || 
          message.includes('ws://localhost') ||
          message.includes('An invalid or illegal string was specified')) {
        return;
      }

      // Enhanced error logging for API responses
      if (args[0] === 'Error response:' && args[1] && typeof args[1] === 'object') {
        console.group('🔍 API Validation Error Details');
        console.log('Message:', args[1].message);
        if (args[1].errors) {
          console.log('Field Errors:', JSON.stringify(args[1].errors, null, 2));
        }
        console.groupEnd();
        return;
      }
      
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Skip cookie warnings in development
      if (message.includes('Cookie') && message.includes('SameSite')) {
        return;
      }
      
      // Skip known library deprecation warnings
      if (message.includes('findDOMNode is deprecated') ||
          message.includes('mozInputSource is deprecated') ||
          message.includes('DOMNodeInserted is deprecated') ||
          message.includes('scroll-linked positioning effect')) {
        return;
      }
      
      originalWarn.apply(console, args);
    };

    // Restore original console methods on page unload
    window.addEventListener('beforeunload', () => {
      console.error = originalError;
      console.warn = originalWarn;
    });
  }
};

/**
 * Handle image loading errors gracefully
 * Provides fallback for CORS-blocked images
 */
export const handleImageError = (event, fallbackUrl) => {
  const img = event.target;
  if (img.src !== fallbackUrl) {
    img.src = fallbackUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  }
};

/**
 * Initialize development utilities
 */
export const initDevUtils = () => {
  suppressWebSocketErrors();
  
  // Add global error handler for images
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      if (event.target && event.target.tagName === 'IMG') {
        handleImageError(event);
      }
    }, true);
  }
};
