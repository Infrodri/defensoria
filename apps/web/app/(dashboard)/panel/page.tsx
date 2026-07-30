'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { FileText, AlertTriangle, Clock, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PanelPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/cases')
      .then((data) => setCases(data))
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, []);

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
              + Ingesta de Caso Nuevo
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
