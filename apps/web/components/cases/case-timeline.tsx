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

function getPendingSubsteps(
  role: string,
  userId?: string,
  reports: any[] = [],
  teamHistory: any[] = [],
): { key: string; label: string; done: boolean }[] {
  const myReports = reports.filter((r: any) => r.authorId === userId || r.coAuthorId === userId);

  const hasReport = (categories: string[]) =>
    myReports.some((r: any) => categories.includes(r.disciplineReportType?.category));

  const isInTeam = teamHistory.some((m: any) => m.user?.id === userId && m.endDate === null);
  const hasPlan = teamHistory.some((m: any) => m.user?.id === userId && (m.requiredSessions ?? 0) > 0);

  if (role === 'ABOGADO') {
    return [
      { key: 'asignado', label: 'Asignado al equipo del expediente', done: isInTeam },
      { key: 'informe-juridico', label: 'Informe Jurídico Inicial emitido', done: hasReport(['INFORME_JURIDICO']) },
      { key: 'plan-sesiones', label: 'Plan de sesiones legales registrado', done: hasPlan },
    ];
  }

  if (role === 'PSICOLOGO') {
    return [
      { key: 'asignado', label: 'Asignado al equipo del expediente', done: isInTeam },
      { key: 'informe-psicologico', label: 'Informe Psicológico inicial emitido', done: hasReport(['INFORME_PSICOLOGICO', 'INFORME_PSICOSOCIAL']) },
      { key: 'plan-sesiones', label: 'Plan de sesiones psicológicas registrado', done: hasPlan },
    ];
  }

  if (role === 'SOCIAL') {
    return [
      { key: 'asignado', label: 'Asignado al equipo del expediente', done: isInTeam },
      { key: 'ficha-social', label: 'Ficha Social Habilitante completada', done: hasReport(['INFORME_SOCIAL']) },
      { key: 'informe-social', label: 'Informe Social Inicial emitido', done: hasReport(['INFORME_SOCIAL', 'INFORME_PSICOSOCIAL']) },
      { key: 'plan-sesiones', label: 'Plan de seguimiento social registrado', done: hasPlan },
    ];
  }

  return [];
}

export function CaseTimeline({ caseId, currentUserId, currentUserRole, reports, teamHistory }: {
  caseId: string;
  currentUserId?: string;
  currentUserRole?: string;
  reports?: any[];
  teamHistory?: any[];
}) {
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

      {/* Pending substeps for the current professional */}
      {currentUserRole && ['ABOGADO', 'PSICOLOGO', 'SOCIAL'].includes(currentUserRole) && (
        <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', backgroundColor: 'oklch(0.97 0.02 175)', borderRadius: 'var(--radius)', border: '1px solid oklch(0.88 0.04 175)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.75rem' }}>
            📋 Mis subpasos pendientes — {currentUserRole === 'ABOGADO' ? 'Área Legal' : currentUserRole === 'PSICOLOGO' ? 'Psicología' : 'Trabajo Social'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {getPendingSubsteps(currentUserRole, currentUserId, reports ?? [], teamHistory ?? []).map((step) => (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <span style={{ color: step.done ? 'var(--salvia)' : 'var(--tierra-calida)', fontSize: '1rem' }}>
                  {step.done ? '✅' : '⏳'}
                </span>
                <span style={{ color: step.done ? 'var(--grafito)' : 'var(--bosque-profundo)', fontWeight: step.done ? 400 : 600 }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
