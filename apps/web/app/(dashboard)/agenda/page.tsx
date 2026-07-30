'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Calendar as CalendarIcon, Clock, MapPin, Building2, Shield, Plus } from 'lucide-react';

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/appointments')
      .then((data) => setAppointments(data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
          Agenda Centralizada de Casos
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Citas, audiencias y visitas domiciliarias programadas en la oficina
        </p>
      </header>

      {loading ? (
        <p style={{ opacity: 0.6 }}>Cargando agenda...</p>
      ) : appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <CalendarIcon size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>No hay citas o audiencias programadas</h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.25rem' }}>
            Las citas programadas desde el detalle de cada expediente aparecerán en esta vista central.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.map((app) => (
            <div
              key={app.id}
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--bosque-profundo)', fontSize: '0.875rem' }}>
                    {app.case?.caseCode}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      backgroundColor: 'oklch(0.95 0.03 65)',
                      color: 'var(--tierra-calida)',
                      fontWeight: 700,
                    }}
                  >
                    {app.appointmentType}
                  </span>
                </div>

                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--grafito)' }}>
                  {app.title}
                </div>

                {app.description && (
                  <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}>
                    {app.description}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} />
                    <span>{new Date(app.scheduledAt).toLocaleString('es-BO')}</span>
                  </div>

                  {app.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} />
                      <span>{app.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.75rem', opacity: 0.7 }}>
                Programado por: {app.creator?.firstName} {app.creator?.lastName}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
