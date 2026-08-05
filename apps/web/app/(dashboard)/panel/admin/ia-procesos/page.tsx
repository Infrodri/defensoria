'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { BrainCircuit, CheckCircle, Clock, Activity, XCircle, AlertCircle } from 'lucide-react';

interface AiTask {
  id: string;
  status: string;
  type: 'imagen' | 'audio';
  caseId: string;
  caseCode: string;
  evidenceId: string;
  fileName: string;
  createdAt: string;
  errorMessage?: string | null;
  positionInQueue: number;
}

interface WorkerStatus {
  busy: boolean;
  task?: string;
  ref?: string;
  startedAt?: string;
  elapsedSeconds?: number;
  queueLength: number;
  queue?: Array<{ id: string; task: string; ref: string }>;
}

interface AiTasksResponse {
  worker: WorkerStatus;
  tasks: AiTask[];
}

function statusBadge(status: string) {
  switch (status) {
    case 'COMPLETADA':
      return { label: 'Listo', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle size={14} /> };
    case 'PROCESSING':
      return { label: 'Procesando', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <Activity size={14} /> };
    case 'PENDIENTE':
      return { label: 'En cola', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={14} /> };
    case 'ERROR':
      return { label: 'Error', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <XCircle size={14} /> };
    default:
      return { label: status, color: '#64748b', bg: 'rgba(100,116,140,0.1)', icon: <AlertCircle size={14} /> };
  }
}

function fmtDate(d: string) {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yy} ${hh}:${min}`;
}

export default function IaProcesosPage() {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === 'ADMINISTRADOR' || role === 'JEFATURA';

  const [data, setData] = useState<AiTasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetchApi<AiTasksResponse>('/knowledge/ai-tasks');
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el estado de la IA');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
    const id = setInterval(fetchData, 5000); // polling cada 5s
    return () => clearInterval(id);
  }, [isAdmin, fetchData]);

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>
          ⚠ Acceso restringido
        </h2>
        <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>
          Esta pantalla de monitoreo es exclusiva de Administrador y Jefatura.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <p style={{ opacity: 0.6 }}>Cargando estado de la IA...</p>
      </div>
    );
  }

  const worker = data?.worker;
  const tasks = data?.tasks || [];

  const counts = tasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Completados en las últimas 24h
  const dayAgo = Date.now() - 24 * 3600 * 1000;
  const completedToday = tasks.filter(
    (t) => t.status === 'COMPLETADA' && new Date(t.createdAt).getTime() > dayAgo,
  ).length;

  const metrics = [
    { label: 'En proceso', value: worker?.busy ? 1 : 0, sub: worker?.task, color: '#3b82f6', Icon: Activity },
    { label: 'En cola', value: worker?.queueLength || 0, color: '#f59e0b', Icon: Clock },
    { label: 'Completados (24h)', value: completedToday, color: '#10b981', Icon: CheckCircle },
    { label: 'Errores', value: counts.ERROR || 0, color: '#ef4444', Icon: XCircle },
  ];

  const handleRetry = async (id: string) => {
    if (!confirm('¿Reencolar esta tarea para re-procesarla?')) return;
    try {
      await fetchApi(`/knowledge/ai-tasks/${id}/retry`, { method: 'POST' });
      alert('✅ Tarea reencolada');
      fetchData();
    } catch (err: any) {
      alert('❌ ' + (err.message || 'No se pudo reencolar'));
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('¿Cancelar esta tarea? Será sacada de la cola.')) return;
    try {
      await fetchApi(`/knowledge/ai-tasks/${id}/cancel`, { method: 'POST' });
      alert('✅ Tarea cancelada');
      fetchData();
    } catch (err: any) {
      alert('❌ ' + (err.message || 'No se pudo cancelar'));
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0 }}>
            Procesos de IA
          </h1>
          <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Monitoreo en vivo de la cola de transcripción y análisis de imágenes (una petición a la vez).
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            backgroundColor: 'var(--bosque-profundo)',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}></span>
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </header>

      {/* Worker activo */}
      {worker?.busy && (
        <div style={{
          backgroundColor: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.875rem',
        }}>
          <strong>Activa: {worker.task}</strong> · ref: {worker.ref} · lleva {Math.round(worker.elapsedSeconds || 0)}s en curso.
        </div>
      )}

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <div style={{ color: m.color, marginBottom: '0.35rem' }}>{React.createElement(m.Icon, { size: 20 })}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>{m.value}</div>
            <div style={{ fontSize: '0.8rem', color: m.color, fontWeight: 600 }}>{m.label}</div>
            {m.sub && <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem' }}>{m.sub}</div>}
          </div>
        ))}
      </div>

      {/* Tabla de tareas */}
      {error && (
        <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#ef4444', fontSize: '0.875rem' }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
              <th style={{ textAlign: 'left', padding: '0.7rem 1rem', fontWeight: 700, color: 'var(--grafito)' }}>Estado</th>
              <th style={{ textAlign: 'left', padding: '0.7rem 1rem', fontWeight: 700, color: 'var(--grafito)' }}>Tipo</th>
              <th style={{ textAlign: 'left', padding: '0.7rem 1rem', fontWeight: 700, color: 'var(--grafito)' }}>Caso</th>
              <th style={{ textAlign: 'left', padding: '0.7rem 1rem', fontWeight: 700, color: 'var(--grafito)' }}>Archivo</th>
              <th style={{ textAlign: 'left', padding: '0.7rem 1rem', fontWeight: 700, color: 'var(--grafito)' }}>Posición</th>
              <th style={{ textAlign: 'left', padding: '0.7rem 1rem', fontWeight: 700, color: 'var(--grafito)' }}>Creado</th>
              <th style={{ textAlign: 'left', padding: '0.7rem 1rem', fontWeight: 700, color: 'var(--grafito)' }}>Detalle</th>
              <th style={{ textAlign: 'center', padding: '0.7rem 1rem', fontWeight: 700, color: 'var(--grafito)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '2rem 1rem', textAlign: 'center', opacity: 0.6 }}>
                  No hay trabajos de IA todavía. Las tareas aparecerán aquí al abrir un expediente con evidencias.
                </td>
              </tr>
            ) : (
              tasks.map((t) => {
                const b = statusBadge(t.status);
                const canRetry = t.status === 'ERROR';
                const canCancel = t.status === 'PENDIENTE';
                const inQueue = t.positionInQueue >= 0;
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
                    <td style={{ padding: '0.6rem 1rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.6rem', borderRadius: '999px', backgroundColor: b.bg, color: b.color, fontSize: '0.75rem', fontWeight: 600 }}>
                        {b.icon}<span>{b.label}</span>
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 1rem', textTransform: 'capitalize' }}>{t.type}</td>
                    <td style={{ padding: '0.6rem 1rem', fontFamily: 'mono', fontSize: '0.8rem' }}>{t.caseCode || `#${t.caseId.slice(0, 8)}`}</td>
                    <td style={{ padding: '0.6rem 1rem', maxWidth: '220px', wordBreak: 'break-word' }}>{t.fileName || '—'}</td>
                    <td style={{ padding: '0.6rem 1rem' }}>{inQueue ? `#${t.positionInQueue + 1}` : '—'}</td>
                    <td style={{ padding: '0.6rem 1rem', whiteSpace: 'nowrap' }}>{fmtDate(t.createdAt)}</td>
                    <td style={{ padding: '0.6rem 1rem', color: t.errorMessage ? '#ef4444' : 'var(--grafito)', fontSize: '0.8rem' }} title={t.errorMessage || ''}>
                      {t.errorMessage ? String(t.errorMessage).slice(0, 80) : '—'}
                    </td>
                    <td style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>
                      {canRetry && (
                        <button
                          onClick={() => handleRetry(t.id)}
                          style={{
                            backgroundColor: 'rgba(245,158,11,0.15)',
                            border: '1px solid #f59e0b',
                            borderRadius: 'var(--radius)',
                            padding: '0.3rem 0.7rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#b4530d',
                            cursor: 'pointer',
                            marginRight: '0.3rem',
                          }}
                          title="Reencolar para re-procesar"
                        >
                          Reintentar
                        </button>
                      )}
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(t.id)}
                          style={{
                            backgroundColor: 'rgba(239,68,68,0.15)',
                            border: '1px solid #ef4444',
                            borderRadius: 'var(--radius)',
                            padding: '0.3rem 0.7rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#b4530d',
                            cursor: 'pointer',
                          }}
                          title="Cancelar (sacar de la cola)"
                        >
                          Cancelar
                        </button>
                      )}
                      {!canRetry && !canCancel && <span style={{ opacity: 0.4, fontSize: '0.75rem' }}>—</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
