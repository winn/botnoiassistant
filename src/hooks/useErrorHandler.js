import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleError = useCallback((error, customMessage) => {
    console.error('Error:', error);
    setError(error);

    // Show user-friendly error message
    const message = customMessage || 
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred';

    toast.error(message);

    // Log error to monitoring service (if implemented)
    // logErrorToService(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
}