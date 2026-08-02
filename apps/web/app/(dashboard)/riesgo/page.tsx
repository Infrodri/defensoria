'use client';

import React from 'react';
import { ShieldAlert, Activity } from 'lucide-react';

export default function RiesgoPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
          Matriz de Indicadores de Riesgo NNA
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Valoración psicosocial de factores de vulnerabilidad bajo la Ley 548
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--riesgo-alto)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} /> Riesgo Alto (Medidas Urgentes)
          </h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            Violencia física grave, abuso sexual, acogimiento circunstancial no comunicado o abandono total.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--tierra-calida)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} /> Riesgo Medio (Acompañamiento)
          </h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            Negligencia temporal, conflicto entre progenitores, falta de asistencia escolar no justificada.
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--salvia)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} /> Riesgo Bajo (Monitoreo)
          </h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            Derivación preventiva, acuerdos familiares en conciliación o consultas informativas.
          </p>
        </div>
      </div>
    </div>
  );
}
