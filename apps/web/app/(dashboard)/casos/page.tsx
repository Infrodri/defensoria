'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatPhase, formatInterventionPath, formatCaseType } from '@defensoria/shared';
import { FileText, ArrowRight, UserPlus } from 'lucide-react';

export default function CasosListPage() {
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
    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
            Expedientes de Casos
          </h1>
          <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
            Listado de casos asignados y activos en la oficina
          </p>
        </div>

        {(user?.role === 'SECRETARIA' || user?.role === 'JEFATURA') && (
          <Link
            href="/ingesta-caso"
            style={{
              backgroundColor: 'var(--bosque-profundo)',
              color: 'white',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <UserPlus size={18} /> Ingesta de Caso Nuevo
          </Link>
        )}
      </header>

      {loading ? (
        <p style={{ opacity: 0.6 }}>Cargando expedientes...</p>
      ) : cases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)' }}>No tenés casos asignados o registrados</h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.25rem' }}>
            Los expedientes aparecerán aquí según tu rol y asignación activa.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cases.map((c) => {
            const nnaParty = c.parties?.find((p: any) => p.roleInCase === 'NNA');
            const primaryNna = nnaParty?.person;

            return (
              <div
                key={c.id}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--card)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--bosque-profundo)', fontSize: '1rem' }}>
                      {c.caseCode}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.625rem',
                        borderRadius: '12px',
                        backgroundColor: 'oklch(0.92 0.04 175)',
                        color: 'var(--bosque-profundo)',
                        fontWeight: 700,
                      }}
                    >
                      {formatPhase(c.currentPhase)}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.625rem',
                        borderRadius: '12px',
                        backgroundColor: 'oklch(0.96 0.03 65)',
                        color: 'var(--tierra-calida)',
                        fontWeight: 600,
                      }}
                    >
                      {formatInterventionPath(c.currentInterventionPath)}
                    </span>
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--grafito)' }}>
                    NNA Titular: {primaryNna ? `${primaryNna.firstName} ${primaryNna.lastName}` : 'Sin datos del NNA'}
                  </div>

                  <div style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.25rem' }}>
                    Tipo de caso: <strong>{formatCaseType(c.caseType)}</strong> · Oficina: {c.currentOffice?.name}
                  </div>
                </div>

                <Link
                  href={`/casos/${c.id}`}
                  style={{
                    backgroundColor: 'var(--bosque-profundo)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    flexShrink: 0,
                  }}
                >
                  Abrir Expediente <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

