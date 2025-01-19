import { CacheManager } from '../utils/cache/cacheManager';

export class ErrorRecovery {
  private static cache = new CacheManager('error-recovery');
  private static MAX_RETRIES = 3;
  private static RETRY_DELAY = 1000; // 1 second

  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      retries?: number;
      delay?: number;
      onRetry?: (attempt: number, error: Error) => void;
    } = {}
  ): Promise<T> {
    const retries = options.retries ?? this.MAX_RETRIES;
    const delay = options.delay ?? this.RETRY_DELAY;

    let lastError: Error;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        options.onRetry?.(attempt, lastError);

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError!;
  }

  static async withFallback<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    cacheKey?: string
  ): Promise<T> {
    try {
      const result = await operation();
      if (cacheKey) {
        await this.cache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      if (cacheKey) {
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }
      return await fallback();
    }
  }

  static async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    options: {
      threshold?: number;
      timeout?: number;
      resetAfter?: number;
    } = {}
  ): Promise<T> {
    const threshold = options.threshold ?? 5;
    const timeout = options.timeout ?? 10000;
    const resetAfter = options.resetAfter ?? 60000;

    const circuitKey = 'circuit-state';
    const failureKey = 'failure-count';

    const circuitState = await this.cache.get(circuitKey);
    const failureCount = await this.cache.get(failureKey) ?? 0;

    if (circuitState === 'open') {
      const lastFailure = await this.cache.get('last-failure');
      if (Date.now() - lastFailure > resetAfter) {
        await this.cache.set(circuitKey, 'half-open');
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Operation timed out')), timeout)
        )
      ]);

      if (circuitState === 'half-open') {
        await this.cache.set(circuitKey, 'closed');
        await this.cache.set(failureKey, 0);
      }

      return result;
    } catch (error) {
      const newFailureCount = failureCount + 1;
      await this.cache.set(failureKey, newFailureCount);

      if (newFailureCount >= threshold) {
        await this.cache.set(circuitKey, 'open');
        await this.cache.set('last-failure', Date.now());
      }

      throw error;
    }
  }
}