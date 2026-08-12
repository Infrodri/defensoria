import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { FileText, Lock, Plus, CheckCircle2, AlertTriangle, CornerDownRight, Printer, Edit3, Shield, Eye, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  code: string;
  name: string;
  documentType: string;
  targetRole: string;
  requiresCoAuthor: boolean;
  structure: {
    sections: Section[];
  };
}

interface Section {
  key: string;
  title: string;
  required: boolean;
  promptTemplate: {
    template: string;
    systemPrompt: string;
    ragQuery: string;
    ragInstruction: string;
  };
}

interface AIDraftResponse {
  suggestedContent: string;
  citations: string[];
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: '0.875rem',
  backgroundColor: 'var(--card)',
  color: 'var(--grafito)',
  boxSizing: 'border-box',
};

/** Selector de coautor para informes psicosociales en borrador (PATCH /reports/:id/coauthor). */
function CoAuthorSelector({
  reportId,
  authorId,
  authorRole,
  currentCoAuthor,
  professionalsByRole,
  onChanged,
}: {
  reportId: string;
  authorId?: string;
  authorRole?: string;
  currentCoAuthor?: any;
  professionalsByRole: { PSICOLOGO: any[]; SOCIAL: any[] };
  onChanged: () => void;
}) {
  const { user } = useAuth();
  const [selected, setSelected] = useState(currentCoAuthor?.id ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complement: 'PSICOLOGO' | 'SOCIAL' | null =
    authorRole === 'PSICOLOGO' ? 'SOCIAL' : authorRole === 'SOCIAL' ? 'PSICOLOGO' : null;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await fetchApi(`/reports/${reportId}/coauthor`, {
        method: 'PATCH',
        body: JSON.stringify({ coAuthorId: selected }),
      });
      toast.success('Coautor asignado al informe psicosocial');
      onChanged();
    } catch (err: any) {
      setError(err?.message || 'Error al asignar coautor');
      toast.error('Error al asignar coautor', { description: err?.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.5rem' }}>
        🔗 Coautor del Informe Psicosocial
      </div>

      {currentCoAuthor && (
        <div style={{ fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
          Coautor actual: <strong>{currentCoAuthor.firstName} {currentCoAuthor.lastName}</strong> ({currentCoAuthor.role === 'PSICOLOGO' ? 'Psicólogo/a' : 'Trabajador/a Social'})
        </div>
      )}

      {complement ? (
        <form onSubmit={handleAssign} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
            <option value="">-- {complement === 'PSICOLOGO' ? 'Psicólogo/a' : 'Trabajador/a Social'} coautor --</option>
            {professionalsByRole[complement]
              .filter((u: any) => u.id !== authorId && u.id !== user?.id)
              .map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} — {u.email} {u.office?.name ? `(${u.office.name})` : ''}
                </option>
              ))}
          </select>
          <button
            type="submit"
            disabled={saving || !selected}
            style={{
              backgroundColor: selected ? 'var(--salvia)' : 'var(--border)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 0.875rem',
              borderRadius: 'var(--radius)',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: selected ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
            }}
          >
            {saving ? 'Asignando...' : 'Asignar'}
          </button>
        </form>
      ) : (
        <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0 }}>
          Este informe requiere un coautor de la disciplina complementaria (equipo PSICOLOGO + SOCIAL). Solicítelo a Jefatura.
        </p>
      )}

      {error && <p style={{ fontSize: '0.75rem', color: 'var(--riesgo-alto)', marginTop: '0.375rem' }}>⚠️ {error}</p>}
    </div>
  );
}

interface ReportEditorProps {
  caseId: string;
  caseCode?: string;
  nnaName?: string;
  reports: any[];
  onReportUpdated: () => void;
}

export function ReportEditor({ caseId, caseCode, nnaName, reports, onReportUpdated }: ReportEditorProps) {
  const { user } = useAuth();

  // Categoría de informe por defecto según rol (ReportCategory).
  const defaultCategoryByRole: Record<string, string> = {
    ABOGADO:   'INFORME_JURIDICO',
    PSICOLOGO: 'INFORME_PSICOLOGICO',
    SOCIAL:    'INFORME_SOCIAL',
    JEFATURA:  'INFORME_PSICOSOCIAL',
    ADMINISTRADOR: 'INFORME_PSICOSOCIAL',
  };

  const CATEGORY_EMOJI: Record<string, string> = {
    INFORME_JURIDICO: '⚖️',
    INFORME_PSICOLOGICO: '🧠',
    INFORME_SOCIAL: '👥',
    INFORME_PSICOSOCIAL: '🔗',
    INFORME_SESION_SEGUIMIENTO: '📋',
    INFORME_FINAL_CONCILIACION: '🤝',
    INFORME_COMPLEMENTARIO: '📄',
  };

  // Categorías que el rol puede redactar (espejo de checkReportRolePermission en el backend).
  const allowedCategoriesForRole = (role?: string): string[] => {
    const allowed: string[] = [];
    if (role === 'ABOGADO' || role === 'JEFATURA' || role === 'ADMINISTRADOR') allowed.push('INFORME_JURIDICO');
    if (role === 'PSICOLOGO' || role === 'JEFATURA' || role === 'ADMINISTRADOR') allowed.push('INFORME_PSICOLOGICO');
    if (role === 'SOCIAL' || role === 'JEFATURA' || role === 'ADMINISTRADOR') allowed.push('INFORME_SOCIAL');
    if (role === 'JEFATURA' || role === 'ADMINISTRADOR') allowed.push('INFORME_PSICOSOCIAL');
    return allowed;
  };

  const [selectedCategory, setSelectedCategory] = useState(
    defaultCategoryByRole[user?.role ?? ''] || 'INFORME_JURIDICO'
  );
  // Catálogo real de DisciplineReportType (id + category) para mapear categoría -> id.
  const [reportTypes, setReportTypes] = useState<{ id: string; code: string; name: string; category: string }[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [riskAssessment, setRiskAssessment] = useState<'BAJO' | 'MEDIO' | 'ALTO'>('MEDIO');
  const [submitting, setSubmitting] = useState(false);

  // ── Template system (IPS-01) ──
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateCode, setSelectedTemplateCode] = useState<string>('');
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [sectionContents, setSectionContents] = useState<Record<string, string>>({});

  // Fetch templates based on user role
  useEffect(() => {
    if (!user?.role) return;
    fetchApi<Template[]>(`/templates?role=${user.role}`)
      .then(setTemplates)
      .catch(() => {
        // Silently fail - templates are optional
      });
  }, [user?.role]);

  // Reset template selection when templates change
  useEffect(() => {
    if (templates.length > 0) {
      const filtered = templates.filter(t => 
        t.targetRole === user?.role || user?.role === 'ADMINISTRADOR' || user?.role === 'JEFATURA'
      );
      if (filtered.length > 0 && !filtered.some(t => t.code === selectedTemplateCode)) {
        setSelectedTemplateCode(filtered[0].code);
        setActiveSectionIndex(0);
        setSectionContents({});
      }
    }
  }, [templates, user?.role]);

  useEffect(() => {
    fetchApi('/disciplines')
      .then((disciplines: any[]) => {
        const all = (disciplines ?? []).flatMap((d) =>
          (d.reportTypes ?? []).map((rt: any) => ({
            id: rt.id,
            code: rt.code,
            name: rt.name,
            category: rt.category,
          })),
        );
        setReportTypes(all);
      })
      .catch(() => {
        // Sin catálogo no se puede mapear categoría -> id; el form lo indicará.
      });
  }, []);

  const availableOptions = useMemo(() => {
    const allowed = new Set(allowedCategoriesForRole(user?.role));
    return reportTypes.filter((rt) => allowed.has(rt.category));
  }, [reportTypes, user?.role]);

  // Si la categoría por defecto no está disponible en el catálogo del rol, usar la primera.
  useEffect(() => {
    if (availableOptions.length > 0 && !availableOptions.some((rt) => rt.category === selectedCategory)) {
      setSelectedCategory(availableOptions[0].category);
    }
  }, [availableOptions, selectedCategory]);

  // Complementary report modal
  const [complementaryParentId, setComplementaryParentId] = useState<string | null>(null);

  // ── Coautoría (Fase 3): informe psicosocial requiere equipo PSICOLOGO + SOCIAL ──
  const [professionalsByRole, setProfessionalsByRole] = useState<{ PSICOLOGO: any[]; SOCIAL: any[] }>({ PSICOLOGO: [], SOCIAL: [] });
  const [coauthorRole, setCoauthorRole] = useState<'PSICOLOGO' | 'SOCIAL'>(user?.role === 'PSICOLOGO' ? 'SOCIAL' : 'PSICOLOGO');
  const [coauthorId, setCoauthorId] = useState('');

  useEffect(() => {
    if (user?.role === 'SECRETARIA') return;
    // El backend expone /users/professionals/list?role= (Fase 2 usa el mismo endpoint en el caso).
    Promise.allSettled([
      fetchApi('/users/professionals/list?role=PSICOLOGO').catch(() => []),
      fetchApi('/users/professionals/list?role=SOCIAL').catch(() => []),
    ]).then(([psico, social]) => {
      setProfessionalsByRole({
        PSICOLOGO: (psico as any).status === 'fulfilled' ? ((psico as any).value ?? []) : [],
        SOCIAL: (social as any).status === 'fulfilled' ? ((social as any).value ?? []) : [],
      });
    });
  }, [user?.role]);

  /** Rol complementario al autor para el informe psicosocial. */
  const complementaryRoleFor = (authorRole?: string): 'PSICOLOGO' | 'SOCIAL' | null => {
    if (authorRole === 'PSICOLOGO') return 'SOCIAL';
    if (authorRole === 'SOCIAL') return 'PSICOLOGO';
    return null;
  };

  // Pre-Emission & Print Preview Modal state
  const [previewReport, setPreviewReport] = useState<any | null>(null);
  const [isEmitting, setIsEmitting] = useState(false);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    // When template is selected, validate sections and co-author
    let finalContent = content;
    if (selectedTemplateCode && !complementaryParentId) {
      const template = templates.find(t => t.code === selectedTemplateCode);
      if (template) {
        // Check co-author requirement
        if (template.requiresCoAuthor && !coauthorId) {
          toast.error('Esta plantilla requiere seleccionar un coautor antes de guardar');
          return;
        }
        
        // Check required sections have content
        const emptyRequiredSections = template.structure.sections
          .filter(s => s.required && !sectionContents[s.key]?.trim());
        if (emptyRequiredSections.length > 0) {
          toast.error(`Las siguientes secciones obligatorias están vacías: ${emptyRequiredSections.map(s => s.title).join(', ')}`);
          return;
        }
        
        // Combine sections into content
        finalContent = template.structure.sections
          .map(s => {
            const sectionContent = sectionContents[s.key]?.trim();
            return sectionContent ? `## ${s.title}\n\n${sectionContent}` : '';
          })
          .filter(Boolean)
          .join('\n\n---\n\n');
        
        if (!finalContent.trim()) {
          toast.error('El informe debe tener al menos una sección con contenido');
          return;
        }
      }
    } else if (!content.trim()) {
      toast.error('El contenido es obligatorio');
      return;
    }

    setSubmitting(true);
    try {
      if (complementaryParentId) {
        await fetchApi(`/reports/${complementaryParentId}/complementary`, {
          method: 'POST',
          body: JSON.stringify({ title, content: finalContent }),
        });
        toast.success('Informe complementario redactado en borrador');
      } else {
        const selected = reportTypes.find((rt) => rt.category === selectedCategory);
        if (!selected) {
          toast.error('No hay un tipo de informe configurado para esta categoría en el catálogo');
          return;
        }
        await fetchApi('/reports', {
          method: 'POST',
          body: JSON.stringify({
            caseId,
            disciplineReportTypeId: selected.id,
            title,
            content: finalContent,
            riskAssessment: selectedCategory === 'INFORME_PSICOLOGICO' ? riskAssessment : undefined,
          }),
        }).then(async (created: any) => {
          // INFORME_PSICOSOCIAL: asignar el coautor de la disciplina complementaria
          // (PATCH /reports/:id/coauthor — Fase 2). Si falla, el borrador se creó igual
          // y el profesional puede asignarlo desde el listado.
          if (created?.id && selectedCategory === 'INFORME_PSICOSOCIAL' && coauthorId) {
            await fetchApi(`/reports/${created.id}/coauthor`, {
              method: 'PATCH',
              body: JSON.stringify({ coAuthorId: coauthorId }),
            }).catch(() => undefined);
          }
          
          // Also assign co-author if template requires it (IPS-01)
          if (created?.id && selectedTemplateCode) {
            const template = templates.find(t => t.code === selectedTemplateCode);
            if (template?.requiresCoAuthor && coauthorId) {
              await fetchApi(`/reports/${created.id}/coauthor`, {
                method: 'PATCH',
                body: JSON.stringify({ coAuthorId: coauthorId }),
              }).catch(() => undefined);
            }
          }
          return created;
        });
        toast.success('Borrador de informe guardado correctamente');
      }

      setTitle('');
      setContent('');
      setSectionContents({});
      setSelectedTemplateCode('');
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
                        {rep.disciplineReportType?.name ?? rep.disciplineReportType?.category ?? 'Informe'} (v{rep.version})
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

                <div className="report-preview-content" style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--grafito)' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{rep.content}</ReactMarkdown>
                </div>

                {rep.disciplineReportType?.category === 'INFORME_PSICOSOCIAL' && (
                  rep.status === 'BORRADOR' ? (
                    <CoAuthorSelector
                      reportId={rep.id}
                      authorId={rep.author?.id}
                      authorRole={rep.author?.role}
                      currentCoAuthor={rep.coAuthor}
                      professionalsByRole={professionalsByRole}
                      onChanged={onReportUpdated}
                    />
                  ) : (
                    rep.coAuthor && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }}>
                        <strong>🔗 Coautor:</strong> {rep.coAuthor.firstName} {rep.coAuthor.lastName} ({rep.coAuthor.role})
                      </div>
                    )
                  )
                )}

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
                  {(previewReport.disciplineReportType?.name ?? previewReport.disciplineReportType?.category ?? '').replace(/_/g, ' ')} (Versión {previewReport.version})
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
                <div className="report-preview-content" style={{ fontSize: '0.875rem', lineHeight: 1.8, color: '#1f2937' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewReport.content}</ReactMarkdown>
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
            {/* Template Selector (IPS-01) — solo mostrar si hay plantillas reales cargadas */}
            {!complementaryParentId && templates.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Plantilla de Informe</label>
                <select
                  value={selectedTemplateCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedTemplateCode(code);
                    setActiveSectionIndex(0);
                    setSectionContents({});
                  }}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                >
                  <option value="">— Sin plantilla (redacción libre) —</option>
                  {templates
                    .filter(t => t.targetRole === user?.role || user?.role === 'ADMINISTRADOR' || user?.role === 'JEFATURA')
                    .map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.name} {t.requiresCoAuthor && '🔗'}
                      </option>
                    ))}
                </select>
                <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                  Seleccione una plantilla para estructurar el informe por secciones.
                </p>
              </div>
            )}

            {!complementaryParentId && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Tipo de Informe</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                >
                  {availableOptions.length === 0 && (
                    <option value="">No hay tipos de informe configurados para su área (contacte al administrador)</option>
                  )}
                  {availableOptions.map((rt) => (
                    <option key={rt.id} value={rt.category}>
                      {CATEGORY_EMOJI[rt.category] ?? '📄'} {rt.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Campo Título — siempre visible */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Título del Informe <span style={{ color: 'var(--riesgo-alto)' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  selectedCategory === 'INFORME_JURIDICO'    ? 'Ej: Informe Jurídico Inicial — Caso DNA-2026-0001' :
                  selectedCategory === 'INFORME_PSICOLOGICO' ? 'Ej: Informe de Entrevista Psicológica — Evaluación Inicial' :
                  selectedCategory === 'INFORME_SOCIAL'      ? 'Ej: Diagnóstico Social — Visita Domiciliaria' :
                  selectedCategory === 'INFORME_PSICOSOCIAL' ? 'Ej: Informe Psicosocial Unificado — Medidas de Protección' :
                  'Título del informe...'
                }
                required
                style={{ ...inputStyle }}
              />
            </div>

            {selectedCategory === 'INFORME_PSICOLOGICO' && !complementaryParentId && (              <div>
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

            {/* Co-author requirement for template (IPS-01) */}
            {selectedTemplateCode && !complementaryParentId && (() => {
              const template = templates.find(t => t.code === selectedTemplateCode);
              if (template?.requiresCoAuthor) {
                const complement = user?.role === 'PSICOLOGO' ? 'SOCIAL' : user?.role === 'SOCIAL' ? 'PSICOLOGO' : null;
                return (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '0.5rem' }}>
                      🔗 Coautor Requerido para esta Plantilla
                    </div>
                    {complement ? (
                      <select
                        value={coauthorId}
                        onChange={(e) => setCoauthorId(e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">-- Seleccionar {complement === 'PSICOLOGO' ? 'Psicólogo/a' : 'Trabajador/a Social'} coautor --</option>
                        {professionalsByRole[complement]
                          .filter((u: any) => u.id !== user?.id)
                          .map((u: any) => (
                            <option key={u.id} value={u.id}>
                              {u.firstName} {u.lastName} — {u.email} {u.office?.name ? `(${u.office.name})` : ''}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0 }}>
                        Esta plantilla requiere un coautor de la disciplina complementaria (equipo PSICOLOGO + SOCIAL). Solicítelo a Jefatura.
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            })()}

            {/* Section-based editor when template is selected */}
            {selectedTemplateCode && !complementaryParentId && (() => {
              const template = templates.find(t => t.code === selectedTemplateCode);
              if (!template) return null;
              const sections = template.structure.sections;
              
              return (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bosque-profundo)', marginBottom: '0.75rem' }}>
                    Secciones del Informe ({sections.length})
                  </div>
                  
                  {/* Section tabs */}
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem' }}>
                    {sections.map((section, index) => (
                      <button
                        key={section.key}
                        type="button"
                        onClick={() => setActiveSectionIndex(index)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius) var(--radius) 0 0',
                          border: '1px solid var(--border)',
                          borderBottom: 'none',
                          backgroundColor: activeSectionIndex === index ? 'var(--bosque-profundo)' : 'var(--card)',
                          color: activeSectionIndex === index ? 'white' : 'var(--grafito)',
                          fontWeight: activeSectionIndex === index ? 700 : 500,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        {section.required && <AlertTriangle size={12} />}
                        {section.title}
                      </button>
                    ))}
                  </div>

                  {/* Active section content */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', backgroundColor: 'var(--card)' }}>
                    {sections.map((section, index) => (
                      activeSectionIndex === index && (
                        <div key={section.key}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', margin: 0 }}>
                              {section.title} {section.required && <span style={{ color: 'var(--riesgo-alto)', marginLeft: '0.5rem' }}>(obligatoria)</span>}
                            </h4>
                          </div>
                          
                          <textarea
                            rows={10}
                            value={sectionContents[section.key] || ''}
                            onChange={(e) => setSectionContents(prev => ({ ...prev, [section.key]: e.target.value }))}
                            placeholder={`Redacte la sección: ${section.title}...`}
                            required={section.required}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', fontFamily: 'inherit', minHeight: '200px' }}
                          />
                          
                          {/* AI Generation Button */}
                          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={async () => {
                                setGeneratingSection(section.key);
                                try {
                                  const response = await fetchApi<AIDraftResponse>('/ai/draft-section', {
                                    method: 'POST',
                                    body: JSON.stringify({
                                      caseId,
                                      templateCode: selectedTemplateCode,
                                      sectionKey: section.key,
                                    }),
                                  });
                                  setSectionContents(prev => ({
                                    ...prev,
                                    [section.key]: (prev[section.key] || '') + (prev[section.key] ? '\n\n' : '') + response.suggestedContent,
                                  }));
                                  if (response.citations && response.citations.length > 0) {
                                    toast.success(`Sección generada con ${response.citations.length} cita(s) sugerida(s)`);
                                  } else {
                                    toast.success('Sección generada con IA');
                                  }
                                } catch (err: any) {
                                  toast.error('Error al generar sección con IA', { description: err.message });
                                } finally {
                                  setGeneratingSection(null);
                                }
                              }}
                              disabled={generatingSection === section.key}
                              style={{
                                backgroundColor: 'var(--salvia)',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius)',
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                                border: 'none',
                                cursor: generatingSection === section.key ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                              }}
                            >
                              <Zap size={14} />
                              {generatingSection === section.key ? 'Generando...' : 'Generar con IA'}
                            </button>
                            
                            {/* Citations display - would need to store citations per section */}
                          </div>
                        </div>
                      )
                    ))}
</div>
                </div>
              );
            })()}

            {/* Fallback single content field when no template selected */}
            {!selectedTemplateCode && (
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
            )}

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
