'use client';

import React from 'react';
import { Building2, MapPin, Phone } from 'lucide-react';

export default function DerivacionPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
          Directorio de Derivación Interinstitucional
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Red de apoyo del GAM, Juzgados de Niñez, Salud y Entidades de Acogimiento
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>Juzgado Público en Materia de Niñez y Adolescencia</h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><MapPin size={14} /> Calle España N° 120, Sucre</p>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Phone size={14} /> +591 4 64-52200</p>
        </div>

        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>Instancia Técnica Departamental (ITDPS - Chuquisaca)</h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><MapPin size={14} /> Av. Jaime Mendoza N° 2300</p>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Phone size={14} /> +591 4 64-61010</p>
        </div>
      </div>
    </div>
  );
}
