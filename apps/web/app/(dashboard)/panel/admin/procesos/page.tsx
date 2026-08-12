'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
import { Activity, Database, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface PipelineStatus {
  summary: {
    totalChunks: number;
    withEmbedding: number;
    withoutEmbedding: number;
    casesWithChunks: number;
  };
  bySourceType: Array<{
    sourceType: string;
    label: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    caseId: string;
    sourceType: string;
    label: string;
    hasEmbedding: boolean;
    processedAt: string;
  }>;
}

export default function PipelineMonitoringPage() {
  const { user } = useAuth();
  if (user?.role !== 'ADMINISTRADOR' && user?.role !== 'JEFATURA') {
    return (
      <AccesoRestringido mensaje="El monitoreo del pipeline RAG y la carga de los procesos asíncronos requiere permisos gerenciales." />
    );
  }

  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<PipelineStatus>('/knowledge/pipeline/status');
      setStatus(data);
    } catch (err) {
      console.error('Error fetching pipeline status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return <div style={{ padding: '2rem' }}>Cargando estado del pipeline...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={32} color="var(--salvia)" /> Monitor de Procesos (Pipeline RAG)
          </h1>
          <button
            onClick={fetchStatus}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: 'var(--card)', border: '1px solid var(--border)',
              padding: '0.5rem 1rem', borderRadius: 'var(--radius)',
              fontSize: '0.875rem', fontWeight: 600, color: 'var(--bosque-profundo)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Estado en tiempo real del procesamiento de evidencias y generación de vectores (PgBoss / Ollama).
        </p>
      </header>

      {status && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Summary Cards */}
          <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Database size={24} color="var(--bosque-profundo)" />
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--grafito)' }}>Total de Fragmentos (Chunks)</h3>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
              {status.summary.totalChunks}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.7, margin: 0, marginTop: '0.5rem' }}>
              En {status.summary.casesWithChunks} expedientes
            </p>
          </div>

          <div style={{ backgroundColor: 'oklch(0.92 0.08 140)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid oklch(0.85 0.1 140)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={24} color="oklch(0.3 0.1 140)" />
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'oklch(0.3 0.1 140)' }}>Vectorizados (Listos para IA)</h3>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'oklch(0.3 0.1 140)' }}>
              {status.summary.withEmbedding}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'oklch(0.3 0.1 140)', opacity: 0.8, margin: 0, marginTop: '0.5rem' }}>
              Ollama / Modelos locales
            </p>
          </div>

          <div style={{ backgroundColor: 'oklch(0.95 0.03 50)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid oklch(0.85 0.05 50)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertCircle size={24} color="oklch(0.4 0.1 50)" />
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'oklch(0.4 0.1 50)' }}>Pendientes o Fallidos</h3>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'oklch(0.4 0.1 50)' }}>
              {status.summary.withoutEmbedding}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'oklch(0.4 0.1 50)', opacity: 0.8, margin: 0, marginTop: '0.5rem' }}>
              Sin coordenadas vectoriales
            </p>
          </div>
        </div>
      )}

      {status && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Distribución */}
          <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              Distribución por Origen
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {status.bySourceType.map((source) => (
                <div key={source.sourceType}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--grafito)' }}>{source.label}</span>
                    <span style={{ fontWeight: 800, color: 'var(--bosque-profundo)' }}>{source.count}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--papel)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        backgroundColor: 'var(--tierra-calida)',
                        width: `${Math.max(1, (source.count / status.summary.totalChunks) * 100)}%` 
                      }} 
                    />
                  </div>
                </div>
              ))}
              {status.bySourceType.length === 0 && (
                <p style={{ fontSize: '0.875rem', color: 'var(--grafito)', opacity: 0.7 }}>No hay datos disponibles.</p>
              )}
            </div>
          </section>

          {/* Actividad Reciente */}
          <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              Actividad Reciente (Últimos procesados)
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {status.recentActivity.map((activity) => (
                <div key={activity.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.25rem' }}>
                      {activity.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--grafito)', opacity: 0.8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {new Date(activity.processedAt).toLocaleString()}</span>
                      <span style={{ fontFamily: 'monospace' }}>Caso: {activity.caseId.split('-')[0]}...</span>
                    </div>
                  </div>
                  <div>
                    {activity.hasEmbedding ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'oklch(0.3 0.1 140)', backgroundColor: 'oklch(0.92 0.08 140)', padding: '0.25rem 0.5rem', borderRadius: '999px' }}>
                        Indexado (Vectores)
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'oklch(0.4 0.1 50)', backgroundColor: 'oklch(0.95 0.03 50)', padding: '0.25rem 0.5rem', borderRadius: '999px' }}>
                        Solo Texto
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {status.recentActivity.length === 0 && (
                <p style={{ fontSize: '0.875rem', color: 'var(--grafito)', opacity: 0.7 }}>No hay actividad reciente.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
