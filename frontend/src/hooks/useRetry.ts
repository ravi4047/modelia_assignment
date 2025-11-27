// src/hooks/useRetry.ts

import { useState, useCallback, useRef } from 'react';
import type { RetryConfig } from '../types';

interface UseRetryResult<T> {
  execute: (fn: () => Promise<T>) => Promise<T>;
  attempt: number;
  isRetrying: boolean;
  reset: () => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2, // Exponential backoff
};

export function useRetry<T>(config: Partial<RetryConfig> = {}): UseRetryResult<T> {
  const [attempt, setAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const calculateDelay = useCallback(
    (attemptNumber: number): number => {
      const delay = Math.min(
        finalConfig.initialDelay * Math.pow(finalConfig.backoffMultiplier, attemptNumber),
        finalConfig.maxDelay
      );
      return delay;
    },
    [finalConfig.initialDelay, finalConfig.backoffMultiplier, finalConfig.maxDelay]
  );

  const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T> => {
      let lastError: Error | null = null;

      for (let i = 0; i < finalConfig.maxAttempts; i++) {
        try {
          setAttempt(i + 1);
          
          if (i > 0) {
            setIsRetrying(true);
            const delay = calculateDelay(i - 1);
            await sleep(delay);
            setIsRetrying(false);
          }

          const result = await fn();
          setAttempt(0);
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          
          // Don't retry if it's an abort error
          if (error instanceof Error && error.name === 'AbortError') {
            throw error;
          }

          // Don't retry on last attempt
          if (i === finalConfig.maxAttempts - 1) {
            break;
          }
        }
      }

      setAttempt(0);
      setIsRetrying(false);
      throw lastError || new Error('Max retry attempts reached');
    },
    [finalConfig.maxAttempts, calculateDelay]
  );

  const reset = useCallback(() => {
    setAttempt(0);
    setIsRetrying(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    execute,
    attempt,
    isRetrying,
    reset,
  };
}