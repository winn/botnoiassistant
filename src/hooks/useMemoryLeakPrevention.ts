import { useEffect, useRef } from 'react';

export function useMemoryLeakPrevention(componentName: string) {
  const mountedRef = useRef(true);
  const timersRef = useRef<number[]>([]);
  const intervalsRef = useRef<number[]>([]);
  const subscriptionsRef = useRef<(() => void)[]>([]);

  // Track memory usage in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const initialMemory = (performance as any).memory?.usedJSHeapSize;
      
      return () => {
        const finalMemory = (performance as any).memory?.usedJSHeapSize;
        if (finalMemory && initialMemory) {
          const diff = finalMemory - initialMemory;
          if (diff > 1024 * 1024) { // More than 1MB difference
            console.warn(
              `Memory leak detected in ${componentName}:`,
              `${(diff / (1024 * 1024)).toFixed(2)}MB increase`
            );
          }
        }
      };
    }
  }, [componentName]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      
      // Clear all timeouts
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      // Clear all intervals
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current = [];

      // Clear all subscriptions
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current = [];
    };
  }, []);

  const safeSetTimeout = (callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      if (mountedRef.current) {
        callback();
      }
    }, delay);
    timersRef.current.push(id);
    return id;
  };

  const safeSetInterval = (callback: () => void, delay: number) => {
    const id = window.setInterval(() => {
      if (mountedRef.current) {
        callback();
      }
    }, delay);
    intervalsRef.current.push(id);
    return id;
  };

  const addSubscription = (unsubscribe: () => void) => {
    subscriptionsRef.current.push(unsubscribe);
  };

  return {
    isMounted: () => mountedRef.current,
    safeSetTimeout,
    safeSetInterval,
    addSubscription
  };
}