'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { RefreshCw, CheckCircle2, AlertCircle, Clock, Database, Activity } from 'lucide-react';

interface PipelineStatus {
  summary: {
    totalChunks: number;
    withEmbedding: number;
    withoutEmbedding: number;
    casesWithChunks: number;
  };
  bySourceType: { sourceType: string; label: string; count: number }[];
  recentActivity: {
    id: string;
    caseId: string;
    sourceType: string;
    label: string;
    hasEmbedding: boolean;
    processedAt: string;
  }[];
}

export default function RagMonitorPage() {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [caseIdFilter, setCaseIdFilter] = useState('');
  const [filterActive, setFilterActive] = useState(false);

  const load = useCallback(async (caseId?: string) => {
    setLoading(true);
    try {
      const endpoint = caseId
        ? `/knowledge/pipeline/status/${caseId}`
        : '/knowledge/pipeline/status';
      const data = await fetchApi(endpoint);
      setStatus(data);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error cargando estado del pipeline:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => load(filterActive ? caseIdFilter : undefined), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (caseIdFilter.trim()) {
      setFilterActive(true);
      load(caseIdFilter.trim());
    }
  };

  const clearFilter = () => {
    setFilterActive(false);
    setCaseIdFilter('');
    load();
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    padding: '1.5rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
  };

  const totalChunks = status?.summary.totalChunks ?? 0;
  const withEmbedding = status?.summary.withEmbedding ?? 0;
  const pctIndexed = totalChunks > 0 ? Math.round((withEmbedding / totalChunks) * 100) : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
            🔬 Monitor de Pipeline RAG
          </h1>
          <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
            Estado del procesamiento de evidencias — transcripciones, imágenes y documentos indexados por expediente
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <button
            onClick={() => load(filterActive ? caseIdFilter : undefined)}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bosque-profundo)', color: 'white',
              border: 'none', borderRadius: 'var(--radius)',
              fontSize: '0.875rem', fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
            }}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Actualizando...' : 'Refrescar'}
          </button>
          {lastRefresh && (
            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
              Última actualización: {lastRefresh.toLocaleTimeString('es-BO')} · Auto-refresh 30s
            </span>
          )}
        </div>
      </header>

      {/* Filtro por expediente */}
      <form onSubmit={handleFilter} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={caseIdFilter}
          onChange={(e) => setCaseIdFilter(e.target.value)}
          placeholder="Filtrar por ID de expediente (UUID)..."
          style={{
            flex: 1, padding: '0.5rem 0.75rem',
            border: `1px solid ${filterActive ? 'var(--salvia)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)', fontSize: '0.875rem',
          }}
        />
        <button
          type="submit"
          style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--salvia)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer' }}
        >
          Filtrar
        </button>
        {filterActive && (
          <button
            type="button"
            onClick={clearFilter}
            style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer' }}
          >
            ✕ Ver todo
          </button>
        )}
      </form>

      {/* Tarjetas de resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>{status?.summary.totalChunks ?? 0}</div>
          <div style={{ fontSize: '0.8125rem', opacity: 0.7, marginTop: '0.25rem' }}>Chunks totales indexados</div>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--salvia)' }}>{status?.summary.withEmbedding ?? 0}</div>
          <div style={{ fontSize: '0.8125rem', opacity: 0.7, marginTop: '0.25rem' }}>Con embedding vectorial</div>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: status?.summary.withoutEmbedding ?? 0 > 0 ? 'var(--tierra-calida)' : 'var(--salvia)' }}>
            {status?.summary.withoutEmbedding ?? 0}
          </div>
          <div style={{ fontSize: '0.8125rem', opacity: 0.7, marginTop: '0.25rem' }}>Sin embedding (texto plano)</div>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>{status?.summary.casesWithChunks ?? 0}</div>
          <div style={{ fontSize: '0.8125rem', opacity: 0.7, marginTop: '0.25rem' }}>Expedientes con RAG activo</div>
        </div>
      </div>

      {/* Barra de progreso general */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            <Activity size={14} style={{ display: 'inline', marginRight: '0.375rem' }} />
            Cobertura de embeddings vectoriales
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: pctIndexed === 100 ? 'var(--salvia)' : 'var(--tierra-calida)' }}>
            {pctIndexed}%
          </span>
        </div>
        <div style={{ height: '10px', backgroundColor: 'var(--border)', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pctIndexed}%`,
            backgroundColor: pctIndexed === 100 ? 'var(--salvia)' : pctIndexed > 70 ? 'var(--tierra-calida)' : 'var(--riesgo-alto)',
            borderRadius: '5px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        {pctIndexed < 100 && totalChunks > 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--tierra-calida)', marginTop: '0.375rem' }}>
            ⚠️ {status?.summary.withoutEmbedding} chunk(s) sin vectorizar — Ollama puede estar no disponible cuando se procesaron.
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Por tipo de fuente */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={16} /> Chunks por tipo de fuente
          </h3>
          {status?.bySourceType.length === 0 ? (
            <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>No hay chunks indexados aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {(status?.bySourceType ?? []).map((item) => (
                <div key={item.sourceType} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem' }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      height: '6px',
                      width: `${Math.max(16, (item.count / (totalChunks || 1)) * 120)}px`,
                      backgroundColor: 'var(--bosque-profundo)',
                      borderRadius: '3px', opacity: 0.6,
                    }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '2rem', textAlign: 'right' }}>{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} /> Últimos 10 procesados
          </h3>
          {status?.recentActivity.length === 0 ? (
            <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Sin actividad reciente.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(status?.recentActivity ?? []).map((item) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.625rem',
                  backgroundColor: 'var(--papel)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                }}>
                  {item.hasEmbedding
                    ? <CheckCircle2 size={14} color="var(--salvia)" />
                    : <AlertCircle size={14} color="var(--tierra-calida)" />
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.6875rem', opacity: 0.6 }}>
                      Exp: {item.caseId.slice(0, 8)}... · {new Date(item.processedAt).toLocaleString('es-BO')}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.375rem',
                    borderRadius: '8px',
                    backgroundColor: item.hasEmbedding ? 'var(--salvia)' : 'var(--tierra-calida)',
                    color: 'white', whiteSpace: 'nowrap',
                  }}>
                    {item.hasEmbedding ? 'vectorizado' : 'texto plano'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
