import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { FileText, Lock, Plus, CheckCircle2, AlertTriangle, CornerDownRight, Printer, Edit3, Shield, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ReportEditorProps {
  caseId: string;
  caseCode?: string;
  nnaName?: string;
  reports: any[];
  onReportUpdated: () => void;
}

export function ReportEditor({ caseId, caseCode, nnaName, reports, onReportUpdated }: ReportEditorProps) {
  const { user } = useAuth();

  // Tipo de informe por defecto según rol
  const defaultReportTypeByRole: Record<string, string> = {
    ABOGADO:   'INFORME_JURIDICO',
    PSICOLOGO: 'INFORME_PSICOLOGICO',
    SOCIAL:    'INFORME_SOCIAL',
    JEFATURA:  'INFORME_PSICOSOCIAL',
    ADMINISTRADOR: 'INFORME_PSICOSOCIAL',
  };

  const [reportType, setReportType] = useState(
    defaultReportTypeByRole[user?.role ?? ''] || 'INFORME_JURIDICO'
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [riskAssessment, setRiskAssessment] = useState<'BAJO' | 'MEDIO' | 'ALTO'>('MEDIO');
  const [submitting, setSubmitting] = useState(false);

  // Complementary report modal
  const [complementaryParentId, setComplementaryParentId] = useState<string | null>(null);

  // Pre-Emission & Print Preview Modal state
  const [previewReport, setPreviewReport] = useState<any | null>(null);
  const [isEmitting, setIsEmitting] = useState(false);

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
        toast.success('Informe complementario redactado en borrador');
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
        toast.success('Borrador de informe guardado correctamente');
      }

      setTitle('');
      setContent('');
      setComplementaryParentId(null);
      onReportUpdated();
    } catch (err: any) {
      toast.error('Error al guardar informe', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const openPreviewModal = (report: any) => {
    setPreviewReport(report);
  };

  const handleConfirmEmitAndPrint = async () => {
    if (!previewReport) return;

    setIsEmitting(true);
    try {
      if (previewReport.status === 'BORRADOR') {
        await fetchApi(`/reports/${previewReport.id}/emit`, { method: 'POST' });
        toast.success('Informe emitido e inmutabilizado oficialmente');
      }

      // Trigger browser print window
      window.print();

      setPreviewReport(null);
      onReportUpdated();
    } catch (err: any) {
      toast.error('Error al emitir e imprimir informe', { description: err.message });
    } finally {
      setIsEmitting(false);
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

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {rep.status === 'BORRADOR' && rep.authorId === user?.id && (
                    <button
                      onClick={() => openPreviewModal(rep)}
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
                    <>
                      <button
                        onClick={() => openPreviewModal(rep)}
                        style={{
                          backgroundColor: 'var(--papel)',
                          border: '1px solid var(--border)',
                          color: 'var(--bosque-profundo)',
                          padding: '0.375rem 0.75rem',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Printer size={14} /> Imprimir Documento Emitido
                      </button>

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
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pre-Emission Preview & Print Modal */}
      {previewReport && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '750px', backgroundColor: 'white', color: '#111827', borderRadius: 'calc(var(--radius) * 1.5)', border: '1px solid var(--border)', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header Bar */}
            <div style={{ backgroundColor: 'var(--bosque-profundo)', color: 'white', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={18} /> Vista Previa del Informe Institucional antes de Emitir
                </h3>
                <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0, marginTop: '0.15rem' }}>
                  {previewReport.status === 'BORRADOR' ? 'Revise la vista previa antes de congelar e imprimir el documento.' : 'Documento emitido inmutabilizado listo para impresión u oficialización.'}
                </p>
              </div>
              {/* ✕ Botón cerrar siempre visible */}
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                title="Cerrar vista previa"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  marginLeft: '1rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Printable Preview Area */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff', color: '#111827', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Gobierno Autónomo Municipal de Sucre
                </h2>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: '0.25rem 0' }}>
                  Defensoría de la Niñez y Adolescencia (DNA)
                </h3>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.5rem', color: '#111827' }}>
                  {previewReport.reportType.replace(/_/g, ' ')} (Versión {previewReport.version})
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8125rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
                <div><strong>Expediente:</strong> {caseCode || 'DNA-2026-XXXX'}</div>
                <div><strong>NNA Titular:</strong> {nnaName || 'NNA Protegido'}</div>
                <div><strong>Título / Asunto:</strong> {previewReport.title}</div>
                <div><strong>Estado:</strong> {previewReport.status}</div>
                <div><strong>Autor / Profesional:</strong> {previewReport.author?.firstName} {previewReport.author?.lastName} ({previewReport.author?.role})</div>
                <div><strong>Fecha de Elaboración:</strong> {new Date(previewReport.createdAt).toLocaleDateString('es-BO')}</div>
                {previewReport.riskAssessment && (
                  <div><strong>Nivel de Riesgo Evaluado:</strong> {previewReport.riskAssessment}</div>
                )}
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.375rem', marginBottom: '0.75rem' }}>
                  DICTAMEN Y CONTENIDO TÉCNICO PROFESIONAL
                </h4>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: 1.6, color: '#1f2937' }}>
                  {previewReport.content}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px dashed #9ca3af', textAlign: 'center' }}>
                <div>
                  <div style={{ borderBottom: '1px solid #111827', width: '80%', margin: '0 auto 0.5rem auto' }}></div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Firma y Sello del Profesional Autor</div>
                  <div style={{ fontSize: '0.6875rem', opacity: 0.8 }}>{previewReport.author?.firstName} {previewReport.author?.lastName} ({previewReport.author?.role})</div>
                </div>
                <div>
                  <div style={{ borderBottom: '1px solid #111827', width: '80%', margin: '0 auto 0.5rem auto' }}></div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Jefatura de Defensoría DNA</div>
                  <div style={{ fontSize: '0.6875rem', opacity: 0.8 }}>GAM Sucre - Recepción e Inmutabilizado</div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{ backgroundColor: 'var(--papel)', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Botón Modificar: solo visible si el informe es BORRADOR y el autor es el usuario actual */}
              {previewReport.status === 'BORRADOR' ? (
                <button
                  onClick={() => setPreviewReport(null)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    backgroundColor: 'var(--card)',
                    color: 'var(--grafito)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  <Edit3 size={16} /> ✏️ Modificar / Volver a Editar
                </button>
              ) : (
                /* Informe EMITIDO: mensaje informativo en lugar del botón de edición */
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.875rem',
                  backgroundColor: 'oklch(0.96 0.02 165)',
                  border: '1px solid var(--salvia)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--bosque-profundo)',
                }}>
                  <Shield size={14} color="var(--salvia)" />
                  Documento inmutabilizado — no editable
                </div>
              )}

              <button
                onClick={handleConfirmEmitAndPrint}
                disabled={isEmitting}
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: 'var(--salvia)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  cursor: isEmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px oklch(0.4 0.08 165 / 0.3)',
                }}
              >
                <Printer size={16} />
                {isEmitting
                  ? 'Emitiendo...'
                  : previewReport.status === 'BORRADOR'
                    ? '🖨️ Confirmar, Imprimir e Inmutabilizar'
                    : '🖨️ Imprimir Documento'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Report Form - SOLO PROFESIONALES (NO SECRETARIA) */}
      {user?.role !== 'SECRETARIA' && (
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
                  {/* Mostrar solo los tipos correspondientes al rol */}
                  {(user?.role === 'ABOGADO' || user?.role === 'JEFATURA' || user?.role === 'ADMINISTRADOR') && (
                    <option value="INFORME_JURIDICO">⚖️ Informe Jurídico (Área Legal)</option>
                  )}
                  {(user?.role === 'PSICOLOGO' || user?.role === 'JEFATURA' || user?.role === 'ADMINISTRADOR') && (
                    <option value="INFORME_PSICOLOGICO">🧠 Informe Psicológico (Área Psicología)</option>
                  )}
                  {(user?.role === 'SOCIAL' || user?.role === 'JEFATURA' || user?.role === 'ADMINISTRADOR') && (
                    <option value="INFORME_SOCIAL">👥 Informe Social (Trabajo Social)</option>
                  )}
                  {(user?.role === 'JEFATURA' || user?.role === 'ADMINISTRADOR') && (
                    <option value="INFORME_PSICOSOCIAL">🔗 Informe Psicosocial Interdisciplinario</option>
                  )}
                </select>
              </div>
            )}

            {reportType === 'INFORME_PSICOLOGICO' && !complementaryParentId && (              <div>
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
      )}
    </div>
  );
}
