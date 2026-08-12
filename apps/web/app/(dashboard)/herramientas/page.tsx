'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { getToolsByRole, groupToolsByModule, TOOL_DESCRIPTIONS, canReadTool, canWriteTool } from '@/lib/role-access';
import { AlertCircle, ChevronDown, ChevronUp, FileText, BookOpen, Mic, Image as ImageIcon, Lock } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Case {
  id: string;
  caseCode: string;
  caseType: string;
  parties: Array<{ roleInCase: string; person: { firstName: string; lastName: string } }>;
}

interface Evidence {
  id: string;
  fileName: string;
  mimeType: string;
  description?: string;
  fileSize: number;
}

interface Report {
  id: string;
  title: string;
  disciplineReportType?: { category: string; name: string } | null;
  status: string;
  version: number;
}

// ─── Constantes de módulo ─────────────────────────────────────────────────────

const MODULE_META: Record<string, { icon: string; title: string; desc: string; color: string }> = {
  legal: {
    icon: '⚖️',
    title: 'Herramientas Legales',
    desc: 'Análisis de discrepancias, tipicidad penal y plazos procesales para fundamentar acciones jurídicas.',
    color: '#1E3A5F',
  },
  psychological: {
    icon: '🧠',
    title: 'Herramientas Psicológicas',
    desc: 'Indicadores de trauma, escalas de riesgo y traducción clínica para evaluar el estado del NNA.',
    color: '#4A1078',
  },
  social: {
    icon: '👥',
    title: 'Herramientas Sociales',
    desc: 'Estructura familiar, vulnerabilidad y mapeo ambiental para contextualizar el entorno del NNA.',
    color: '#065F46',
  },
  transversal: {
    icon: '🔗',
    title: 'Herramientas Transversales',
    desc: 'Línea de tiempo unificada y anonimización para coordinar el trabajo interdisciplinario.',
    color: '#7C2D12',
  },
};

// ─── Componente de tarjeta expandible por herramienta ────────────────────────

interface ToolCardProps {
  toolId: string;
  canRead: boolean;
  canWrite: boolean;
}

function ToolCard({ toolId, canRead, canWrite }: ToolCardProps) {
  const tool = TOOL_DESCRIPTIONS[toolId];
  const [expanded, setExpanded] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [loadingCase, setLoadingCase] = useState(false);
  const [selectedEvidences, setSelectedEvidences] = useState<string[]>([]);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  if (!tool) return null;

  const handleExpand = async () => {
    if (!canRead) return;
    const next = !expanded;
    setExpanded(next);
    if (next && cases.length === 0) {
      setLoadingCases(true);
      try {
        const data = await fetchApi('/cases');
        setCases(data);
      } catch {
        setCases([]);
      } finally {
        setLoadingCases(false);
      }
    }
  };

  const handleSelectCase = async (caseId: string) => {
    setSelectedCaseId(caseId);
    setSelectedEvidences([]);
    setSelectedReports([]);
    setEvidences([]);
    setReports([]);
    if (!caseId) return;

    setLoadingCase(true);
    try {
      const [evs, reps] = await Promise.all([
        fetchApi(`/evidences/case/${caseId}`).catch(() => []),
        fetchApi(`/reports/case/${caseId}`).catch(() => []),
      ]);
      setEvidences(evs);
      setReports(reps);
    } catch {
      /* empty */
    } finally {
      setLoadingCase(false);
    }
  };

  const toggleEvidence = (id: string) =>
    setSelectedEvidences((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleReport = (id: string) =>
    setSelectedReports((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const selectedCase = cases.find((c) => c.id === selectedCaseId);
  const nnaPrimary = selectedCase?.parties?.find((p) => p.roleInCase === 'NNA')?.person;

  const getMimeIcon = (mime: string) => {
    if (mime?.startsWith('audio')) return <Mic size={14} color="#6366F1" />;
    if (mime?.startsWith('image')) return <ImageIcon size={14} color="#F59E0B" />;
    return <FileText size={14} color="var(--bosque-profundo)" />;
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        border: `1px solid ${expanded ? 'var(--salvia)' : '#e2e8f0'}`,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        marginBottom: '0.75rem',
        boxShadow: expanded ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      {/* Cabecera clicable */}
      <button
        type="button"
        onClick={handleExpand}
        disabled={!canRead}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '1.1rem 1.25rem',
          background: 'none',
          border: 'none',
          cursor: canRead ? 'pointer' : 'not-allowed',
          textAlign: 'left',
          gap: '1rem',
          opacity: canRead ? 1 : 0.5,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.1rem' }}>{tool.icon}</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a202c' }}>{tool.title}</span>
            {/* Badge de permiso */}
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '10px',
              backgroundColor: canWrite ? '#dcfce7' : '#dbeafe',
              color: canWrite ? '#166534' : '#1e40af',
              display: 'flex', alignItems: 'center', gap: '0.2rem',
            }}>
              {canWrite ? '✏️ Lectura/Edición' : '👁️ Lectura'}
            </span>
            {!canRead && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#991b1b' }}>
                <Lock size={10} style={{ display: 'inline', marginRight: 2 }} /> Sin acceso
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
            {tool.description}
          </div>
        </div>
        {canRead && (
          expanded
            ? <ChevronUp size={18} color="#64748b" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
            : <ChevronDown size={18} color="#64748b" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
        )}
      </button>

      {/* Panel expandido */}
      {expanded && (
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '1.25rem', backgroundColor: '#fafbfc' }}>
          {/* Instrucciones de uso */}
          <div style={{
            backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px',
            padding: '0.875rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem',
          }}>
            <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: '0.375rem' }}>
              📖 ¿Cómo usar {tool.title}?
            </div>
            <div style={{ color: '#0c4a6e', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {tool.steps}
            </div>
          </div>

          {/* Selector de expediente */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', color: '#374151', marginBottom: '0.4rem' }}>
              📁 Seleccionar Expediente a Analizar
            </label>
            {loadingCases ? (
              <div style={{ fontSize: '0.8rem', color: '#64748b', padding: '0.5rem' }}>Cargando expedientes...</div>
            ) : (
              <select
                value={selectedCaseId}
                onChange={(e) => handleSelectCase(e.target.value)}
                style={{
                  width: '100%', padding: '0.625rem 0.875rem',
                  border: '1px solid #d1d5db', borderRadius: '8px',
                  fontSize: '0.875rem', backgroundColor: 'white',
                }}
              >
                <option value="">— Seleccionar expediente —</option>
                {cases.map((c) => {
                  const nna = c.parties?.find((p) => p.roleInCase === 'NNA')?.person;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.caseCode} {nna ? `· ${nna.firstName} ${nna.lastName}` : ''}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Evidencias e informes del expediente seleccionado */}
          {selectedCaseId && (
            <>
              {loadingCase ? (
                <div style={{ fontSize: '0.8rem', color: '#64748b', padding: '0.5rem' }}>Cargando datos del expediente...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  {/* Evidencias */}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#374151', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      🔗 Evidencias del caso ({evidences.length})
                    </div>
                    {evidences.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>Sin evidencias adjuntas</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '160px', overflowY: 'auto' }}>
                        {evidences.map((ev) => (
                          <label key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', cursor: 'pointer', padding: '0.25rem' }}>
                            <input
                              type="checkbox"
                              checked={selectedEvidences.includes(ev.id)}
                              onChange={() => toggleEvidence(ev.id)}
                              style={{ accentColor: 'var(--salvia)' }}
                            />
                            {getMimeIcon(ev.mimeType)}
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ev.description || ev.fileName}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Informes */}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#374151', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      📄 Informes del caso ({reports.length})
                    </div>
                    {reports.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>Sin informes redactados</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '160px', overflowY: 'auto' }}>
                        {reports.map((rep) => (
                          <label key={rep.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', cursor: 'pointer', padding: '0.25rem' }}>
                            <input
                              type="checkbox"
                              checked={selectedReports.includes(rep.id)}
                              onChange={() => toggleReport(rep.id)}
                              style={{ accentColor: 'var(--salvia)' }}
                            />
                            <BookOpen size={14} color="var(--bosque-profundo)" />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {rep.title} <span style={{ opacity: 0.6 }}>(v{rep.version} · {rep.status})</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botón de análisis */}
              <button
                type="button"
                disabled={!canWrite}
                onClick={() => {
                  // Navegar al módulo con los parámetros seleccionados
                  const moduleMap: Record<string, string> = {
                    legal_discrepancies: '/herramientas/legal?tool=discrepancias',
                    legal_typicality: '/herramientas/legal?tool=tipicidad',
                    legal_deadlines: '/herramientas/legal?tool=plazos',
                    psychological_indicators: '/herramientas/psicologico?tool=indicadores',
                    psychological_scales: '/herramientas/psicologico?tool=escalas',
                    psychological_translation: '/herramientas/psicologico?tool=traduccion',
                    psychological_trauma: '/herramientas/psicologico?tool=trauma',
                    social_family: '/herramientas/social?tool=familia',
                    social_vulnerability: '/herramientas/social?tool=vulnerabilidad',
                    social_environmental: '/herramientas/social?tool=ambiental',
                    transversal_timeline: '/herramientas/transversal?tool=timeline',
                    transversal_anonymize: '/herramientas/transversal?tool=anonimizar',
                  };
                  const params = new URLSearchParams({
                    caseId: selectedCaseId,
                    evidences: selectedEvidences.join(','),
                    reports: selectedReports.join(','),
                    autorun: 'true',
                  });
                  const base = moduleMap[toolId] || '/herramientas';
                  window.location.href = `${base}&${params.toString()}`;
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: canWrite ? 'var(--bosque-profundo)' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: canWrite ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {canWrite
                  ? `🚀 Abrir ${tool.title} con este Expediente`
                  : '🔒 Solo lectura — sin permisos de edición'}
              </button>

              {!canWrite && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                  Puedes ver los análisis existentes pero no crear nuevos. Contacta al profesional autorizado.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function HerramientasPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1rem', textAlign: 'center' }}>
        <AlertCircle size={40} color="#DC2626" style={{ margin: '0 auto 1rem' }} />
        <p>Debés iniciar sesión para acceder a las herramientas.</p>
      </div>
    );
  }

  const availableTools = getToolsByRole(user.role as any);

  if (availableTools.length === 0) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1rem' }}>
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#991B1B' }}>
          <AlertCircle size={40} style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Sin acceso a herramientas</h2>
          <p>Tu rol ({user.role}) no tiene acceso a herramientas de análisis.</p>
        </div>
      </div>
    );
  }

  const groupedTools = groupToolsByModule(availableTools as any);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--salvia)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', margin: 0 }}>
          🔧 Herramientas de Análisis
        </h1>
        <p style={{ color: 'var(--grafito)', marginTop: '0.375rem', fontSize: '0.95rem' }}>
          Profesional: <strong>{user.firstName} {user.lastName}</strong> · Rol: <strong>{user.role}</strong>
        </p>
        <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', backgroundColor: '#f0f8ff', borderLeft: '4px solid var(--salvia)', borderRadius: '6px', fontSize: '0.85rem', color: '#1e3a5f' }}>
          💡 Hacé clic en cada herramienta para expandirla, seleccionar un expediente y elegir las evidencias o informes que querés analizar. Luego presioná el botón para abrir la herramienta con esos datos pre-cargados.
        </div>
      </header>

      {/* Módulos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {Object.entries(groupedTools).map(([module, tools]) => {
          if (tools.length === 0) return null;
          const meta = MODULE_META[module];

          return (
            <div
              key={module}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              }}
            >
              {/* Header del módulo */}
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '2px solid var(--salvia)',
                backgroundColor: '#f8fafc',
              }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: meta.color, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ fontSize: '1.375rem' }}>{meta.icon}</span>
                  {meta.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.375rem', lineHeight: 1.4 }}>
                  {meta.desc}
                </div>
              </div>

              {/* Herramientas del módulo */}
              <div style={{ padding: '1.25rem' }}>
                {tools.map((toolId) => (
                  <ToolCard
                    key={toolId}
                    toolId={toolId}
                    canRead={canReadTool(user.role as any, toolId as any)}
                    canWrite={canWriteTool(user.role as any, toolId as any)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
