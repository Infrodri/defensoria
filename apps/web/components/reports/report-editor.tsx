'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { FileText, Lock, Plus, CheckCircle2, AlertTriangle, CornerDownRight } from 'lucide-react';

interface ReportEditorProps {
  caseId: string;
  reports: any[];
  onReportUpdated: () => void;
}

export function ReportEditor({ caseId, reports, onReportUpdated }: ReportEditorProps) {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('INFORME_PSICOLOGICO');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [riskAssessment, setRiskAssessment] = useState<'BAJO' | 'MEDIO' | 'ALTO'>('MEDIO');
  const [submitting, setSubmitting] = useState(false);

  // Complementary report modal
  const [complementaryParentId, setComplementaryParentId] = useState<string | null>(null);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      if (complementaryParentId) {
        await fetchApi(`/reports/${complementaryParentId}/complementary`, {
          method: 'POST',
          body: JSON.stringify({ title, content }),
        });
      } else {
        await fetchApi('/reports', {
          method: 'POST',
          body: JSON.stringify({
            caseId,
            reportType,
            title,
            content,
            riskAssessment: reportType === 'INFORME_PSICOLOGICO' ? riskAssessment : undefined,
          }),
        });
      }

      setTitle('');
      setContent('');
      setComplementaryParentId(null);
      onReportUpdated();
    } catch (err: any) {
      alert(err.message || 'Error al guardar informe');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmitReport = async (reportId: string) => {
    if (!confirm('¿Desea EMITIR e inmutabilizar este informe? Una vez emitido no podrá modificar su contenido y si es psicológico actualizará el nivel de riesgo del caso.')) {
      return;
    }

    try {
      await fetchApi(`/reports/${reportId}/emit`, { method: 'POST' });
      onReportUpdated();
    } catch (err: any) {
      alert(err.message || 'Error al emitir informe');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      {/* Reports Timeline */}
      <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          Informes Profesionales Emitidos y Borradores
        </h3>

        {reports.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No hay informes redactados para este expediente aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports.map((rep) => (
              <div
                key={rep.id}
                style={{
                  padding: '1.25rem',
                  backgroundColor: rep.status === 'EMITIDO' ? 'oklch(0.97 0.01 90)' : 'oklch(0.96 0.03 65)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  marginLeft: rep.parentReportId ? '1.5rem' : '0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {rep.parentReportId && <CornerDownRight size={16} color="var(--tierra-calida)" />}
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: 'var(--bosque-profundo)', color: 'white', fontWeight: 700 }}>
                        {rep.reportType} (v{rep.version})
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          backgroundColor: rep.status === 'EMITIDO' ? 'var(--salvia)' : 'var(--tierra-calida)',
                          color: 'white',
                          fontWeight: 700,
                        }}
                      >
                        {rep.status === 'EMITIDO' ? 'EMITIDO (CONGELADO)' : 'BORRADOR'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginTop: '0.375rem' }}>
                      {rep.title}
                    </h4>
                  </div>

                  <div style={{ fontSize: '0.75rem', opacity: 0.7, textAlign: 'right' }}>
                    <div>{new Date(rep.createdAt).toLocaleDateString('es-BO')}</div>
                    <div>Autor: {rep.author?.firstName} {rep.author?.lastName} ({rep.author?.role})</div>
                  </div>
                </div>

                {rep.riskAssessment && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: rep.riskAssessment === 'ALTO' ? 'var(--riesgo-alto)' : 'var(--bosque-profundo)', marginBottom: '0.5rem' }}>
                    Evaluación de Riesgo Psicológico: {rep.riskAssessment}
                  </div>
                )}

                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.875rem', color: 'var(--grafito)' }}>
                  {rep.content}
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  {rep.status === 'BORRADOR' && rep.authorId === user?.id && (
                    <button
                      onClick={() => handleEmitReport(rep.id)}
                      style={{
                        backgroundColor: 'var(--salvia)',
                        color: 'white',
                        padding: '0.375rem 0.75rem',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Lock size={14} /> Emitir e Inmutabilizar Informe
                    </button>
                  )}

                  {rep.status === 'EMITIDO' && (
                    <button
                      onClick={() => {
                        setComplementaryParentId(rep.id);
                        setTitle(`Informe Complementario a v${rep.version}`);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid var(--bosque-profundo)',
                        color: 'var(--bosque-profundo)',
                        padding: '0.375rem 0.75rem',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      + Crear Informe Complementario v{rep.version + 1}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Form */}
      <form onSubmit={handleCreateReport} style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          {complementaryParentId ? 'Nuevo Informe Complementario' : 'Redactar Nuevo Informe Profesional'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!complementaryParentId && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Tipo de Informe</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
              >
                <option value="INFORME_PSICOLOGICO">Informe Psicológico (Área Psicología)</option>
                <option value="INFORME_SOCIAL">Informe Social (Trabajo Social)</option>
                <option value="INFORME_JURIDICO">Informe Jurídico (Área Legal)</option>
                <option value="INFORME_PSICOSOCIAL">Informe Psicosocial Interdisciplinario</option>
              </select>
            </div>
          )}

          {reportType === 'INFORME_PSICOLOGICO' && !complementaryParentId && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Evaluación de Nivel de Riesgo del NNA</label>
              <select
                value={riskAssessment}
                onChange={(e: any) => setRiskAssessment(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
              >
                <option value="BAJO">Riesgo Bajo (Situación Controlada)</option>
                <option value="MEDIO">Riesgo Medio (Requiere Seguimiento)</option>
                <option value="ALTO">Riesgo Alto (Protección Inmediata)</option>
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Título del Informe</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Evaluación Psicológica Inicial..."
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Contenido y Dictamen Técnico</label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Redacte el cuerpo del informe técnico, metodología, hallazgos y recomendaciones..."
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: 'var(--bosque-profundo)',
              color: 'white',
              padding: '0.625rem',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {submitting ? 'Guardando...' : complementaryParentId ? '+ Crear Complementario' : '+ Guardar Borrador'}
          </button>
        </div>
      </form>
    </div>
  );
}
