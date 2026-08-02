'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { FileText, AlertTriangle, Clock, Users, ArrowRight, Calendar, Zap, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PanelPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Filter urgent appointments (High risk cases or upcoming 48 hours)
  const urgentAppointments = myAppointments.filter((app) => {
    const isHighRisk = app.case?.riskLevel === 'ALTO';
    const isAudienceOrInterview = app.appointmentType === 'AUDIENCIA' || app.appointmentType === 'ENTREVISTA';
    return isHighRisk || isAudienceOrInterview;
  });

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
