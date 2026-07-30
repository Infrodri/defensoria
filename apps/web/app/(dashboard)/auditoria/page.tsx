'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, Lock, User, Clock, ShieldAlert } from 'lucide-react';

export default function AuditoriaPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'JEFATURA') {
      fetchApi('/audit')
        .then((data) => setLogs(data))
        .catch(() => setLogs([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.role !== 'JEFATURA') {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <ShieldAlert size={48} color="var(--riesgo-alto)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>Acceso Restringido</h2>
        <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.25rem' }}>
          El registro inmutable de auditoría solo es accesible para el rol de **Jefatura de Unidad**.
        </p>
      </div>
    );
  }

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tierra-calida)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
          <ShieldCheck size={16} /> Registro Inmutable (Append-Only)
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
          Auditoría de Actividad del Sistema
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Trazabilidad inalterable de accesos, descargas y cambios en la plataforma
        </p>
      </header>

      {loading ? (
        <p style={{ opacity: 0.6 }}>Cargando registros de auditoría...</p>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)' }}>
          <Lock size={36} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
          <p style={{ opacity: 0.7 }}>No hay eventos de auditoría registrados aún.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--papel)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>Fecha / Hora</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>Usuario</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>Rol</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>Acción</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>Entidad</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', opacity: 0.8 }}>
                    {new Date(log.createdAt).toLocaleString('es-BO')}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Sistema'}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: 'var(--papel)', fontWeight: 600 }}>
                      {log.userRole}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', opacity: 0.8 }}>
                    {log.entityType} ({log.entityId?.slice(0, 8)}...)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
