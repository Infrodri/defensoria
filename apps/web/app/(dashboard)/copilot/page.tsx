'use client';

import React, { useState } from 'react';
import { Bot, Copy } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';

// Configuración por disciplina — no cambiar sin alinearlo con el backend
const DISCIPLINE_CONFIG = {
  ABOGADO: {
    titulo: 'Copiloto Jurídico (IA Local)',
    descripcion: 'Asistencia para la redacción de escritos, memoriales y fundamentación legal en el marco de la Ley 548.',
    placeholder: 'Describa los hechos del expediente para redactar un escrito o memorial legal...',
    boton: 'Redactar Escrito Legal',
    subtitulo: 'Borrador Legal Generado',
  },
  PSICOLOGO: {
    titulo: 'Copiloto Psicológico (IA Local)',
    descripcion: 'Asistencia para la redacción de informes psicológicos y evaluación de indicadores de riesgo del NNA.',
    placeholder: 'Describa las observaciones del NNA, contexto familiar y hallazgos para redactar el informe psicológico...',
    boton: 'Redactar Informe Psicológico',
    subtitulo: 'Borrador de Informe Psicológico',
  },
  SOCIAL: {
    titulo: 'Copiloto Social (IA Local)',
    descripcion: 'Asistencia para la redacción de informes sociales, fichas familiares y planes de intervención social.',
    placeholder: 'Describa la situación familiar, condiciones socioeconómicas y red de apoyo del NNA...',
    boton: 'Redactar Informe Social',
    subtitulo: 'Borrador de Informe Social',
  },
} as const;

const ROLES_CON_ACCESO = ['ABOGADO', 'PSICOLOGO', 'SOCIAL'] as const;

export default function CopilotPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  // Guard: solo profesionales de campo
  if (user && !ROLES_CON_ACCESO.includes(user.role as any)) {
    return (
      <AccesoRestringido mensaje="El Copiloto IA está disponible para los profesionales del equipo interdisciplinario: Abogado/a, Psicólogo/a y Trabajador/a Social." />
    );
  }

  const config = DISCIPLINE_CONFIG[user?.role as keyof typeof DISCIPLINE_CONFIG]
    ?? DISCIPLINE_CONFIG.ABOGADO;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetchApi('/ai/chat-general', {
        method: 'POST',
        body: JSON.stringify({ message: query }),
      });
      setDraft(res.response);
      toast.success('Respuesta generada por Copiloto General (IA Local).');
    } catch (err: any) {
      toast.error('Error al consultar Copiloto', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
          {config.titulo}
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          {config.descripcion}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
            Consulta de Normativa / Asistente General
          </h3>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={8}
              placeholder="Realice preguntas sobre normativa legal, Ley 548, procedimientos o plantillas..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bosque-profundo)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Bot size={18} /> {loading ? 'Consultando RAG de Normativa...' : 'Consultar Copiloto General'}
            </button>
          </form>
        </div>

        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
              Respuesta Basada en Normativa Indexada
            </h3>
            {draft && (
              <button
                onClick={() => { navigator.clipboard.writeText(draft); toast.success('Copiado al portapapeles'); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Copy size={16} /> Copiar
              </button>
            )}
          </div>
          {draft ? (
            <pre style={{ padding: '1rem', backgroundColor: 'var(--papel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto' }}>
              {draft}
            </pre>
          ) : (
            <div style={{ opacity: 0.6, fontStyle: 'italic', textAlign: 'center', paddingTop: '4rem' }}>
              El borrador generado por Ollama aparecerá aquí.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
