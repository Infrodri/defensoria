'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { FileText, AlertTriangle, Clock, Users, ArrowRight, Calendar, Zap, MapPin, ShieldAlert, NotebookPen, AlertOctagon } from 'lucide-react';
import Link from 'next/link';

const MEASURE_LABELS: Record<string, string> = {
  ACOGIMIENTO_CIRCUNSTANCIAL: 'Acogimiento Circunstancial',
  INTEGRACION_RED_APOYO: 'Integración a Red de Apoyo',
  RESTITUCION_DOMICILIARIA: 'Restitución Domiciliaria',
};

export default function PanelPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Alertas y plazos (Fase 3) ──
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [protectionAlerts, setProtectionAlerts] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);

  const isManager = user?.role === 'JEFATURA' || user?.role === 'ADMINISTRADOR';
  const isProfessional = user?.role === 'ABOGADO' || user?.role === 'PSICOLOGO' || user?.role === 'SOCIAL';

  useEffect(() => {
    Promise.all([
      fetchApi('/cases'),
      fetchApi('/appointments?onlyMine=true'),
    ])
      .then(([casesData, appData]) => {
        setCases(casesData);
        setMyAppointments(appData);
      })
      .catch(() => {
        setCases([]);
        setMyAppointments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Alerta 24h ACOGIMIENTO_CIRCUNSTANCIAL (JEFATURA/ADMINISTRADOR) y
  // tareas pendientes (profesionales): informes en borrador + próximas citas.
  useEffect(() => {
    if (!cases.length || (!isManager && !isProfessional)) return;

    setAlertsLoading(true);
    const targetCases = cases.slice(0, 30);

    const load = async () => {
      if (isManager) {
        const results = await Promise.allSettled(
          targetCases.map((c) =>
            fetchApi(`/protection-measures/case/${c.id}`)
              .then((measures: any[]) => (measures ?? []).map((m) => ({ ...m, _case: c })))
              .catch(() => []),
          ),
        );
        const alerts = results
          .flatMap((r) => (r.status === 'fulfilled' ? (r.value as any[]) : []))
          .filter((m: any) => m.measureType === 'ACOGIMIENTO_CIRCUNSTANCIAL' && m.isWithinLegalDeadline === false);
        setProtectionAlerts(alerts);
      } else {
        const results = await Promise.allSettled(
          targetCases.map((c) =>
            fetchApi(`/reports/case/${c.id}`)
              .then((reports: any[]) => (reports ?? []).map((r) => ({ ...r, _case: c })))
              .catch(() => []),
          ),
        );
        const drafts = results
          .flatMap((r) => (r.status === 'fulfilled' ? (r.value as any[]) : []))
          .filter((r: any) => r.status === 'BORRADOR');
        setPendingReports(drafts);
      }
      setAlertsLoading(false);
    };

    load();
  }, [cases, isManager, isProfessional]);

  // Filter urgent appointments (High risk cases or upcoming 48 hours)
  const urgentAppointments = myAppointments.filter((app) => {
    const isHighRisk = app.case?.riskLevel === 'ALTO';
    const isAudienceOrInterview = app.appointmentType === 'AUDIENCIA' || app.appointmentType === 'ENTREVISTA';
    return isHighRisk || isAudienceOrInterview;
  });

  // Próximas citas confirmadas/programadas (siguientes 7 días)
  const upcomingAppointments = myAppointments
    .filter((app) => app.scheduledAt && new Date(app.scheduledAt).getTime() > Date.now())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);

  const nnaNameOf = (c: any) => {
    const nna = c?.parties?.find((p: any) => p.roleInCase === 'NNA')?.person;
    return nna ? `${nna.firstName} ${nna.lastName}` : 'NNA no especificado';
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
          Bienvenido/a, {user?.firstName}
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Rol de trabajo: <strong style={{ color: 'var(--tierra-calida)' }}>{user?.role}</strong> · {user?.office?.name || 'Oficina Central'}
        </p>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--grafito)', opacity: 0.7 }}>Casos Activos</span>
            <FileText size={20} color="var(--bosque-profundo)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>{cases.length}</div>
        </div>

        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--grafito)', opacity: 0.7 }}>Riesgo Alto</span>
            <AlertTriangle size={20} color="var(--riesgo-alto)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--riesgo-alto)' }}>
            {cases.filter((c) => c.riskLevel === 'ALTO').length}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--grafito)', opacity: 0.7 }}>En Evaluación</span>
            <Clock size={20} color="var(--tierra-calida)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--tierra-calida)' }}>
            {cases.filter((c) => c.currentPhase === 'EVALUACION').length}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--grafito)', opacity: 0.7 }}>Derivados Vía Judicial</span>
            <Users size={20} color="var(--salvia)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--salvia)' }}>
            {cases.filter((c) => c.currentInterventionPath === 'VIA_JUDICIAL').length}
          </div>
        </div>
      </div>

      {/* Section: Urgent Appointments for Logged-In Professional */}
      <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} color="var(--riesgo-alto)" /> Citaciones Urgentes y Próximos Compromisos (Mi Agenda)
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8, marginTop: '0.2rem' }}>
              Compromisos prioritarios asignados a tu rol ({user?.role}) con expedientes en riesgo o citaciones programadas
            </p>
          </div>
          <Link
            href="/citas"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--salvia)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            Ver Mi Agenda Completa <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Cargando citaciones de tu agenda personal...</p>
        ) : urgentAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <Calendar size={32} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bosque-profundo)', margin: 0 }}>
              No tienes citaciones ni audiencias urgentes pendientes para hoy
            </p>
            <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
              Todos tus compromisos agendados están al día.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {urgentAppointments.slice(0, 4).map((app) => {
              const dateObj = new Date(app.scheduledAt);
              const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = dateObj.toLocaleDateString();
              const nnaParty = app.case?.parties?.[0]?.person;
              const nnaName = nnaParty ? `${nnaParty.firstName} ${nnaParty.lastName}` : 'NNA no especificado';

              return (
                <div
                  key={app.id}
                  style={{
                    backgroundColor: 'var(--papel)',
                    padding: '1rem',
                    borderRadius: 'var(--radius)',
                    border: '1.5px solid var(--border)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--bosque-profundo)', backgroundColor: 'oklch(0.94 0.02 165)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        🕒 {dateStr} - {timeStr}
                      </span>
                      {app.case?.riskLevel === 'ALTO' && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 800, backgroundColor: 'oklch(0.92 0.08 30)', color: 'oklch(0.4 0.15 30)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                          🔴 RIESGO ALTO
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '0.2rem' }}>
                      {app.title}
                    </div>

                    {app.case && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--grafito)', marginBottom: '0.5rem' }}>
                        Expediente: <strong style={{ fontFamily: 'monospace' }}>{app.case.caseCode}</strong> ({nnaName})
                      </div>
                    )}

                    {app.location && (
                      <div style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={12} /> {app.location}
                      </div>
                    )}
                  </div>

                  {app.case && (
                    <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                      <Link
                        href={`/casos/${app.case.id}`}
                        style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--salvia)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        Ver Expediente <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section: Alertas y Plazos (Fase 3 — por rol) */}
      {(isManager || isProfessional) && (
        <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} color="var(--riesgo-alto)" /> Alertas y Plazos
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.8, marginTop: '0.2rem' }}>
                {isManager
                  ? 'Medidas de ACOGIMIENTO_CIRCUNSTANCIAL con notificación judicial fuera del plazo legal de 24h'
                  : 'Tareas pendientes: informes en borrador y próximas citas en tus casos'}
              </p>
            </div>
          </div>

          {alertsLoading ? (
            <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>Evaluando alertas y plazos...</p>
          ) : isManager ? (
            protectionAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bosque-profundo)', margin: 0 }}>
                  Sin alertas de plazo legal activas
                </p>
                <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                  No hay medidas de acogimiento circunstancial con notificación judicial fuera de las 24h reglamentarias.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {protectionAlerts.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: '1rem 1.25rem',
                      backgroundColor: 'oklch(0.95 0.05 28)',
                      borderRadius: 'var(--radius)',
                      border: '1.5px solid var(--riesgo-alto)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <AlertOctagon size={16} color="var(--riesgo-alto)" />
                        <strong style={{ fontFamily: 'monospace' }}>{m._case?.caseCode}</strong>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: 'var(--riesgo-alto)', color: 'white' }}>
                          {MEASURE_LABELS[m.measureType] ?? m.measureType}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', marginTop: '0.375rem' }}>
                        {m.alert ?? 'Notificación judicial fuera del plazo legal de 24 horas.'}
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.25rem' }}>
                        {nnaNameOf(m._case)} · Ejecución: {m.executedAt ? new Date(m.executedAt).toLocaleString('es-BO') : '—'}
                        {m.judgeNotifiedAt ? ` · Notif.: ${new Date(m.judgeNotifiedAt).toLocaleString('es-BO')}` : ' · Sin notificación judicial'}
                      </div>
                    </div>
                    <Link
                      href={`/casos/${m._case?.id}`}
                      style={{ color: 'var(--bosque-profundo)', fontWeight: 700, fontSize: '0.8125rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
                    >
                      Ver Expediente <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Informes en borrador */}
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <NotebookPen size={16} color="var(--tierra-calida)" /> Informes en Borrador ({pendingReports.length})
                </h3>
                {pendingReports.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.25rem 1rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.7, margin: 0 }}>Sin informes en borrador pendientes de emitir.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {pendingReports.map((r) => (
                      <div key={r.id} style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>{r.title}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.25rem' }}>
                          {r.disciplineReportType?.name ?? r.disciplineReportType?.category ?? 'Informe'} · Autor: {r.author?.firstName} {r.author?.lastName}
                          {' '}· <Link href={`/casos/${r._case?.id}`} style={{ color: 'var(--salvia)', fontWeight: 700, textDecoration: 'none' }}>
                            {r._case?.caseCode}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Próximas citas */}
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Calendar size={16} color="var(--salvia)" /> Próximas Citas ({upcomingAppointments.length})
                </h3>
                {upcomingAppointments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.25rem 1rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--grafito)', opacity: 0.7, margin: 0 }}>No tienes citas próximas programadas.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {upcomingAppointments.map((app) => (
                      <div key={app.id} style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--papel)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>{app.title}</span>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 800, backgroundColor: 'oklch(0.94 0.02 165)', color: 'var(--bosque-profundo)', padding: '0.15rem 0.4rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            {new Date(app.scheduledAt).toLocaleDateString('es-BO')} {new Date(app.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {app.case && (
                          <Link href={`/casos/${app.case.id}`} style={{ fontSize: '0.75rem', color: 'var(--salvia)', fontWeight: 700, textDecoration: 'none', display: 'block', marginTop: '0.25rem' }}>
                            {app.case.caseCode} · {nnaNameOf(app.case)}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Recent Cases Section */}
      <section style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>
            Expedientes Recientes
          </h2>
          {(user?.role === 'SECRETARIA' || user?.role === 'JEFATURA') && (
            <Link
              href="/ingesta-caso"
              style={{
                backgroundColor: 'var(--bosque-profundo)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              + Inicio de Caso Nuevo
            </Link>
          )}
        </div>

        {loading ? (
          <p style={{ opacity: 0.6 }}>Cargando expedientes...</p>
        ) : cases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.6 }}>
            <FileText size={48} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
            <p>No se encontraron expedientes registrados aún.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cases.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: 'var(--papel)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--bosque-profundo)' }}>
                      {c.caseCode}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '12px',
                        backgroundColor: 'oklch(0.90 0.04 175)',
                        color: 'var(--bosque-profundo)',
                        fontWeight: 600,
                      }}
                    >
                      {c.currentPhase}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}>
                    NNA Titular:{' '}
                    <strong>
                      {c.parties?.find((p: any) => p.roleInCase === 'NNA')?.person?.firstName}{' '}
                      {c.parties?.find((p: any) => p.roleInCase === 'NNA')?.person?.lastName || 'N/A'}
                    </strong>
                  </div>
                </div>

                <Link
                  href={`/casos/${c.id}`}
                  style={{
                    color: 'var(--bosque-profundo)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  Ver Expediente <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
