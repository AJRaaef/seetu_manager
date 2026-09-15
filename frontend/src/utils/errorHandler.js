/**
 * Utility helper to extract detailed, actionable error guidance from API error responses.
 */
export const getErrorMessage = (err, defaultFallback = 'An error occurred. Please try again.') => {
  if (!err) return defaultFallback;

  if (err.response?.data) {
    const data = err.response.data;
    
    // If backend returns a plain string
    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    // If backend returns structured JSON with message
    if (data.message && typeof data.message === 'string') {
      // If detailed field validation errors list is present
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return `${data.message}: ${data.errors.join(', ')}`;
      }
      if (typeof data.errors === 'object' && data.errors !== null) {
        const details = Object.entries(data.errors)
          .map(([key, val]) => `${key}: ${val}`)
          .join('; ');
        if (details) return `${data.message} (${details})`;
      }
      return data.message;
    }

    // If backend returns 'error' field
    if (data.error && typeof data.error === 'string') {
      return data.error;
    }
  }

  // Network / Connection errors
  if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
    return '🔌 Network Connection Error: Unable to reach the backend server. Please verify your internet connection or server availability.';
  }

  if (err.message) {
    return err.message;
  }

  return defaultFallback;
};
