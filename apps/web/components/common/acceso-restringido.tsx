'use client';
import { ShieldAlert } from 'lucide-react';

interface Props {
  mensaje?: string;
}

export function AccesoRestringido({ mensaje }: Props) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '4rem 1rem',
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        marginTop: '2rem',
      }}
    >
      <ShieldAlert size={48} color="var(--riesgo-alto)" style={{ marginBottom: '1rem' }} />
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--bosque-profundo)',
        }}
      >
        Acceso Restringido
      </h2>
      <p
        style={{
          fontSize: '0.875rem',
          opacity: 0.7,
          marginTop: '0.5rem',
          maxWidth: '400px',
          margin: '0.5rem auto 0',
        }}
      >
        {mensaje || 'No tienes permisos para acceder a esta sección.'}
      </p>
    </div>
  );
}
