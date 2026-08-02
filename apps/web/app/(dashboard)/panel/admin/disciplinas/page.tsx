'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
import { BookOpen, Layers, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Discipline {
  id: string;
  name: string;
  code: string;
  description?: string;
  reportTypes: { id: string; name: string; code: string }[];
}

interface Instrument {
  id: string;
  name: string;
  description?: string;
  disciplineId?: string;
  discipline?: { name: string };
}

const ROLE_COLOR: Record<string, string> = {
  ABOGADO:   'oklch(0.94 0.04 220)',
  PSICOLOGO: 'oklch(0.94 0.04 65)',
  SOCIAL:    'oklch(0.94 0.04 140)',
};

const REPORT_TYPE_LABEL: Record<string, string> = {
  INFORME_JURIDICO:    'Jurídico',
  INFORME_PSICOLOGICO: 'Psicológico',
  INFORME_PSICOSOCIAL: 'Psicosocial',
  INFORME_SOCIAL:      'Social',
};

export default function DisciplinasPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'disciplinas' | 'instrumentos'>('disciplinas');
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);

  if (user?.role !== 'ADMINISTRADOR') {
    return (
      <AccesoRestringido mensaje="La configuración de disciplinas profesionales e instrumentos es exclusiva del Administrador General." />
    );
  }

  useEffect(() => {
    Promise.all([
      fetchApi('/disciplines'),
      fetchApi('/instruments'),
    ])
      .then(([disc, inst]) => {
        setDisciplines(Array.isArray(disc) ? disc : []);
        setInstruments(Array.isArray(inst) ? inst : []);
      })
      .catch((err) => toast.error('Error al cargar datos', { description: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const tabStyle = (active: boolean) => ({
    padding: '0.75rem 1.25rem',
    border: 'none',
    borderBottom: active ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
    backgroundColor: 'transparent',
    fontWeight: active ? 700 : 500,
    color: active ? 'var(--bosque-profundo)' : 'var(--grafito)',
    cursor: 'pointer',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '0.5rem',
  });

  return (
    <div style={{ maxWidth: '1100px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen size={32} color="var(--tierra-calida)" /> Disciplinas e Instrumentos
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Configuración de las especialidades profesionales y sus herramientas de evaluación por expediente.
        </p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button onClick={() => setActiveTab('disciplinas')} style={tabStyle(activeTab === 'disciplinas')}>
          <BookOpen size={18} /> Disciplinas Profesionales ({disciplines.length})
        </button>
        <button onClick={() => setActiveTab('instrumentos')} style={tabStyle(activeTab === 'instrumentos')}>
          <Layers size={18} /> Instrumentos de Evaluación ({instruments.length})
        </button>
      </div>

      {loading ? (
        <p style={{ opacity: 0.6 }}>Cargando configuración de disciplinas...</p>
      ) : activeTab === 'disciplinas' ? (
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--papel)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Disciplina</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Código Rol</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Tipos de Informe Habilitados</th>
              </tr>
            </thead>
            <tbody>
              {disciplines.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                    No hay disciplinas configuradas. El seed las crea automáticamente.
                  </td>
                </tr>
              ) : disciplines.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>{d.name}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '12px', backgroundColor: ROLE_COLOR[d.code] || 'var(--papel)', color: 'var(--bosque-profundo)' }}>
                      {d.code}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {d.reportTypes?.map((rt) => (
                        <span key={rt.id} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '8px', backgroundColor: 'oklch(0.94 0.03 175)', color: 'var(--bosque-profundo)' }}>
                          {REPORT_TYPE_LABEL[rt.code] || rt.name}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--papel)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Instrumento</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Disciplina</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {instruments.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                    No hay instrumentos registrados.
                  </td>
                </tr>
              ) : instruments.map((i) => (
                <tr key={i.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>{i.name}</td>
                  <td style={{ padding: '0.875rem 1.25rem', opacity: 0.8 }}>{i.discipline?.name || '—'}</td>
                  <td style={{ padding: '0.875rem 1.25rem', opacity: 0.7 }}>{i.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
