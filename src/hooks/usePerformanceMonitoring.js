import { useEffect } from 'react';
import { PerformanceMonitor } from '../utils/monitoring/performance';

export function usePerformanceMonitoring(componentName) {
  useEffect(() => {
    PerformanceMonitor.startMeasure(`${componentName}-render`);

    return () => {
      const duration = PerformanceMonitor.endMeasure(`${componentName}-render`);
      
      if (duration > 100) { // Log slow renders
        console.warn(`Slow render detected in ${componentName}: ${duration}ms`);
      }
    };
  }, [componentName]);

  return {
    startMeasure: PerformanceMonitor.startMeasure,
    endMeasure: PerformanceMonitor.endMeasure,
    getMetrics: PerformanceMonitor.getMetrics
  };
}