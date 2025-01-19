import { useCallback } from 'react';
import { AnalyticsTracker } from '../utils/analytics/tracker';
import { usePerformanceMonitoring } from './usePerformanceMonitoring';

export function useAnalytics(componentName) {
  const { startMeasure, endMeasure } = usePerformanceMonitoring(componentName);

  const trackAction = useCallback(async (action, properties = {}) => {
    startMeasure(action);
    try {
      await AnalyticsTracker.trackEvent(action, properties);
    } finally {
      const duration = endMeasure(action);
      if (duration > 1000) {
        console.warn(`Slow action detected: ${action} took ${duration}ms`);
      }
    }
  }, [startMeasure, endMeasure]);

  const trackError = useCallback(async (error, context = {}) => {
    await AnalyticsTracker.trackError(error, {
      component: componentName,
      ...context
    });
  }, [componentName]);

  return {
    trackAction,
    trackError,
    trackMessage: AnalyticsTracker.trackMessage,
    trackVoice: AnalyticsTracker.trackVoice,
    trackToolUse: AnalyticsTracker.trackToolUse
  };
}