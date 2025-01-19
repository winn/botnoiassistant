import { useState, useCallback } from 'react';
import { AnalyticsTracker } from '../utils/analytics/tracker';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  context?: Record<string, any>;
}

export function useErrorTracking(componentName: string) {
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  const handleError = useCallback(async (error: Error, context = {}) => {
    setError(error);
    
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context: {
        component: componentName,
        ...context
      }
    };
    
    setErrorInfo(errorInfo);

    // Track error in analytics
    await AnalyticsTracker.trackError(error, errorInfo);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in component:', componentName);
      console.error('Error details:', errorInfo);
    }
  }, [componentName]);

  const clearError = useCallback(() => {
    setError(null);
    setErrorInfo(null);
  }, []);

  return {
    error,
    errorInfo,
    handleError,
    clearError
  };
}