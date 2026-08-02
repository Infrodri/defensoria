'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { FileText, Shield, Paperclip, Calendar, Circle, ArrowRight, User } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'CASE_OPENED' | 'ACTION_LOG' | 'APPOINTMENT' | 'REPORT' | 'EVIDENCE';
  title: string;
  description: string;
  date: string;
  metadata?: any;
  user?: { firstName: string; lastName: string; role: string };
}

export function CaseTimeline({ caseId }: { caseId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi(`/cases/${caseId}/timeline`)
      .then(data => setEvents(data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [caseId]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CASE_OPENED': return <ArrowRight size={16} color="var(--bosque-profundo)" />;
      case 'ACTION_LOG': return <FileText size={16} color="var(--tierra-calida)" />;
      case 'REPORT': return <Shield size={16} color="var(--salvia)" />;
      case 'EVIDENCE': return <Paperclip size={16} color="var(--grafito)" />;
      case 'APPOINTMENT': return <Calendar size={16} color="oklch(0.6 0.1 260)" />;
      default: return <Circle size={16} />;
    }
  };

  if (loading) return <div style={{ opacity: 0.6 }}>Cargando línea de tiempo procesal...</div>;

  return (
    <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '1.5rem' }}>
        Línea de Tiempo Procesal (Historial Consolidado)
      </h3>

      <div style={{ position: 'relative', borderLeft: '2px solid var(--border)', marginLeft: '1rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {events.map((event, index) => (
          <div key={event.id} style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '-2.25rem',
              top: '0',
              width: '1.5rem',
              height: '1.5rem',
              backgroundColor: 'var(--papel)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--border)',
              zIndex: 1
            }}>
              {getEventIcon(event.type)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--tierra-calida)', textTransform: 'uppercase' }}>
                  {event.type.replace('_', ' ')}
                </span>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginTop: '0.25rem' }}>
                  {event.title}
                </h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                  {event.description}
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.75rem', opacity: 0.7 }}>
                <div style={{ fontWeight: 600 }}>{new Date(event.date).toLocaleString('es-BO')}</div>
                {event.user && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                    <User size={12} /> {event.user.firstName} {event.user.lastName} ({event.user.role})
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
