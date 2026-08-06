'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

export interface UseCaseRecordOptions {
  /** Endpoint GET que devuelve el registro (null si no existe). */
  getEndpoint: string;
  /** Endpoint usado en el primer guardado (POST de creación). */
  createEndpoint: string;
  /** Devuelve el endpoint de actualización (PATCH) a partir del registro existente. */
  updateEndpoint: (record: any) => string;
}

/**
 * Carga un registro 1:1 de un trámite especial por caseId y gestiona el
 * guardado (POST si no existe, PATCH si ya existe). Consume los endpoints de
 * Fase 2 vía fetchApi — no crea endpoints nuevos.
 */
export function useCaseRecord({ getEndpoint, createEndpoint, updateEndpoint }: UseCaseRecordOptions) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi(getEndpoint);
      setData(res ?? null);
    } catch (err: any) {
      // A 404 means the record has not been created yet — treat it as an
      // empty form so the creation UI shows immediately, not an error banner.
      if (err?.status === 404) {
        setData(null);
      } else {
        setData(null);
        setError(err?.message || 'No se pudo cargar el registro');
      }
    } finally {
      setLoading(false);
    }
  }, [getEndpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (body: Record<string, unknown>): Promise<any> => {
    setSaving(true);
    setError(null);
    try {
      const isUpdate = !!data;
      const endpoint = isUpdate ? updateEndpoint(data) : createEndpoint;
      const res = await fetchApi(endpoint, {
        method: isUpdate ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      });
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el registro');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { data, loading, error, saving, save, load, setError, setData };
}

/** Convierte una lista separada por comas o saltos de línea en un arreglo limpio. */
export function splitList(value: string): string[] {
  return value
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
