import { useEffect, useCallback } from 'react';
import { CacheManager } from '../utils/cache/cacheManager';

const cacheManager = new CacheManager();

export function useCache(namespace = 'default') {
  useEffect(() => {
    cacheManager.init().catch(console.error);
  }, []);

  const get = useCallback(async (key, options) => {
    return await cacheManager.get(`${namespace}:${key}`, options);
  }, [namespace]);

  const set = useCallback(async (key, value, options) => {
    await cacheManager.set(`${namespace}:${key}`, value, options);
  }, [namespace]);

  const clear = useCallback(async (options) => {
    await cacheManager.clear(options);
  }, []);

  return { get, set, clear };
}