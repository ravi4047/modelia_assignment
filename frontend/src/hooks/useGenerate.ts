// src/hooks/useGenerate.ts

import { useState, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { useRetry } from './useRetry';
import { type GenerationRequest, type Generation, GenerationStatus } from '../types';

export interface UseGenerateResult {
  generate: (request: GenerationRequest) => Promise<Generation>;
  abort: () => void;
  status: GenerationStatus;
  error: string | null;
  attempt: number;
  isRetrying: boolean;
  result: Generation | null;
}

export function useGenerate(): UseGenerateResult {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Generation | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { execute, attempt, isRetrying, reset } = useRetry<Generation>({
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 8000,
    backoffMultiplier: 2,
  });

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setStatus(GenerationStatus.ABORTED);
      setError('Generation aborted by user');
      reset();
    }
  }, [reset]);

  const generate = useCallback(
    async (request: GenerationRequest): Promise<Generation> => {
      try {
        setStatus(GenerationStatus.GENERATING);
        setError(null);
        setResult(null);

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();

        const generation = await execute(async () => {
          const response = await apiService.generateImage(
            request,
            abortControllerRef.current?.signal
          );

          return response.data;
        });

        setStatus(GenerationStatus.SUCCESS);
        setResult(generation);
        abortControllerRef.current = null;
        return generation;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setStatus(GenerationStatus.ABORTED);
          setError('Generation aborted');
        } else {
          setStatus(GenerationStatus.ERROR);
          const errorMessage = apiService.getErrorMessage(err);
          setError(errorMessage);
        }
        throw err;
      }
    },
    [execute]
  );

  return {
    generate,
    abort,
    status,
    error,
    attempt,
    isRetrying,
    result,
  };
}

// Export the type of the hook's return value
// export type UseGenerateReturn = ReturnType<typeof useGenerate>;