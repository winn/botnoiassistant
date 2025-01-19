import { useState, useEffect, useCallback, useRef } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  overscan?: number;
  containerHeight?: number;
}

export function useVirtualScroll<T>(
  items: T[],
  { itemHeight, overscan = 3, containerHeight = 800 }: VirtualScrollOptions
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleItems, setVisibleItems] = useState<(T & { index: number })[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateVisibleItems = useCallback(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    setVisibleItems(
      items.slice(startIndex, endIndex).map((item, index) => ({
        ...item,
        index: startIndex + index
      }))
    );
  }, [items, itemHeight, overscan, scrollTop, containerHeight]);

  useEffect(() => {
    updateVisibleItems();
  }, [updateVisibleItems]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    containerRef,
    visibleItems,
    totalHeight: items.length * itemHeight,
    handleScroll,
    scrollTop
  };
}