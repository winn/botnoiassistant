import { useCallback, useRef } from 'react';

export function useMemoizedCallback(callback, dependencies) {
  const ref = useRef(null);

  ref.current = useCallback((...args) => {
    return callback(...args);
  }, dependencies);

  return useCallback((...args) => {
    return ref.current?.(...args);
  }, []);
}