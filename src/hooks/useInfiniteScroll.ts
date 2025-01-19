import { useEffect, useRef, useCallback } from 'react';

interface InfiniteScrollOptions {
  threshold?: number;
  disabled?: boolean;
}

export function useInfiniteScroll(
  onLoadMore: () => Promise<void>,
  { threshold = 0.8, disabled = false }: InfiniteScrollOptions = {}
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);

  const handleIntersection = useCallback(async (entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !loadingRef.current && !disabled) {
      loadingRef.current = true;
      await onLoadMore();
      loadingRef.current = false;
    }
  }, [onLoadMore, disabled]);

  const setObservedElement = useCallback((element: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (element && !disabled) {
      observerRef.current = new IntersectionObserver(handleIntersection, {
        threshold
      });
      observerRef.current.observe(element);
    }
  }, [handleIntersection, threshold, disabled]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return setObservedElement;
}