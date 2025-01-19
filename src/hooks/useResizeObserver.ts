import { useEffect, useRef, useState, useCallback } from 'react';

interface Size {
  width: number;
  height: number;
}

export function useResizeObserver<T extends HTMLElement>() {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const elementRef = useRef<T>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    if (entry) {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    }
  }, []);

  useEffect(() => {
    if (!elementRef.current) return;

    observerRef.current = new ResizeObserver(handleResize);
    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleResize]);

  return { elementRef, size };
}