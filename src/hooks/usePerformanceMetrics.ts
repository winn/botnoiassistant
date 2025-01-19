import { useEffect, useRef } from 'react';
import { PerformanceMonitor } from '../utils/monitoring/performance';

export function usePerformanceMetrics(componentName: string) {
  const metricsRef = useRef({
    renderCount: 0,
    firstRender: Date.now(),
    lastRender: Date.now()
  });

  useEffect(() => {
    const metrics = metricsRef.current;
    metrics.renderCount++;
    metrics.lastRender = Date.now();

    // Start performance measurement
    PerformanceMonitor.startMeasure(`${componentName}-render`);

    return () => {
      const duration = PerformanceMonitor.endMeasure(`${componentName}-render`);
      
      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && duration > 16) {
        console.warn(
          `Slow render detected in ${componentName}:`,
          `${duration.toFixed(2)}ms`,
          `(Render count: ${metrics.renderCount})`
        );
      }
    };
  });

  return metricsRef.current;
}