'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { formatApiError } from '@/lib/api-client';

// ============================================================================
// TIPOS
// ============================================================================

export type ToolsDataState = 'idle' | 'loading' | 'success' | 'error';

export interface UseToolsDataOptions<T> {
  cacheTime?: number; // ms, default 5 minutes
  retryCount?: number; // default 3
  retryDelay?: number; // ms, default 1000
  onError?: (error: string) => void;
  enabled?: boolean; // default true
}

export interface UseToolsDataReturn<T> {
  data: T | null;
  state: ToolsDataState;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  retry: () => Promise<void>;
  reset: () => void;
}

// ============================================================================
// CACHE MANAGER
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

function getCacheKey<T>(fetcher: () => Promise<T>, deps?: unknown[]): string {
  return `cache_${fetcher.toString()}_${JSON.stringify(deps || [])}`;
}

function getFromCache<T>(key: string, cacheTime: number): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > cacheTime;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

function clearCache(key: string): void {
  cache.delete(key);
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useToolsData<T>(
  fetcher: () => Promise<T>,
  options: UseToolsDataOptions<T> = {},
): UseToolsDataReturn<T> {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutos por defecto
    retryCount = 3,
    retryDelay = 1000,
    onError,
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [state, setState] = useState<ToolsDataState>('idle');
  const [error, setError] = useState<string | null>(null);

  const retryCountRef = useRef(0);
  const cacheKeyRef = useRef('');

  const executeRequest = useCallback(async (isRetry = false) => {
    if (!enabled) return;

    try {
      setState('loading');
      setError(null);

      // Verificar cache
      if (!isRetry) {
        cacheKeyRef.current = getCacheKey(fetcher);
        const cachedData = getFromCache<T>(cacheKeyRef.current, cacheTime);
        if (cachedData) {
          setData(cachedData);
          setState('success');
          return;
        }
      }

      // Realizar solicitud
      const result = await fetcher();
      setCache(cacheKeyRef.current, result);
      setData(result);
      setState('success');
      retryCountRef.current = 0;
    } catch (err) {
      const errorMessage = formatApiError(err);

      // Reintentar si no se ha alcanzado el límite
      if (retryCountRef.current < retryCount) {
        retryCountRef.current += 1;
        setTimeout(() => {
          executeRequest(true);
        }, retryDelay * retryCountRef.current);
        return;
      }

      // Máximo de reintentos alcanzado
      setError(errorMessage);
      setState('error');
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [fetcher, cacheTime, retryCount, retryDelay, onError, enabled]);

  // Efecto para ejecutar el fetcher
  useEffect(() => {
    if (!enabled) {
      setState('idle');
      return;
    }

    retryCountRef.current = 0;
    executeRequest(false);
  }, [fetcher, enabled, executeRequest]);

  const retry = useCallback(async () => {
    retryCountRef.current = 0;
    clearCache(cacheKeyRef.current);
    await executeRequest(false);
  }, [executeRequest]);

  const reset = useCallback(() => {
    setData(null);
    setState('idle');
    setError(null);
    retryCountRef.current = 0;
    clearCache(cacheKeyRef.current);
  }, []);

  return {
    data,
    state,
    error,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    retry,
    reset,
  };
}

// ============================================================================
// HOOK ESPECÍFICO PARA MÚLTIPLES HERRAMIENTAS
// ============================================================================

export interface ToolsDataCollectionReturn {
  legalData: UseToolsDataReturn<any>;
  psychologicalData: UseToolsDataReturn<any>;
  socialData: UseToolsDataReturn<any>;
  transversalData: UseToolsDataReturn<any>;
  allLoading: boolean;
  allSuccess: boolean;
  anyError: boolean;
  refresh: () => Promise<void>;
}

export function useAllToolsData(
  fetchers: {
    legal?: () => Promise<any>;
    psychological?: () => Promise<any>;
    social?: () => Promise<any>;
    transversal?: () => Promise<any>;
  },
  options?: UseToolsDataOptions<any>,
): ToolsDataCollectionReturn {
  const legalData = useToolsData(
    fetchers.legal || (() => Promise.resolve(null)),
    { ...options, enabled: !!fetchers.legal },
  );

  const psychologicalData = useToolsData(
    fetchers.psychological || (() => Promise.resolve(null)),
    { ...options, enabled: !!fetchers.psychological },
  );

  const socialData = useToolsData(
    fetchers.social || (() => Promise.resolve(null)),
    { ...options, enabled: !!fetchers.social },
  );

  const transversalData = useToolsData(
    fetchers.transversal || (() => Promise.resolve(null)),
    { ...options, enabled: !!fetchers.transversal },
  );

  const allLoading =
    legalData.isLoading || psychologicalData.isLoading || socialData.isLoading || transversalData.isLoading;

  const allSuccess =
    legalData.isSuccess && psychologicalData.isSuccess && socialData.isSuccess && transversalData.isSuccess;

  const anyError = legalData.isError || psychologicalData.isError || socialData.isError || transversalData.isError;

  const refresh = useCallback(async () => {
    await Promise.all([
      legalData.retry(),
      psychologicalData.retry(),
      socialData.retry(),
      transversalData.retry(),
    ]);
  }, [legalData, psychologicalData, socialData, transversalData]);

  return {
    legalData,
    psychologicalData,
    socialData,
    transversalData,
    allLoading,
    allSuccess,
    anyError,
    refresh,
  };
}
