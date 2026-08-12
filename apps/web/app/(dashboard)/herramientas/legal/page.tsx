'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import {
  ArrowLeft,
  Brain,
  FileText,
  Mic,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────
type LegalTool = 'discrepancias' | 'tipicidad' | 'plazos';

const ACCENT = '#1E3A5F';

const EVENT_TYPES = [
  { value: 'MEDIDAS_PROTECCION', label: 'Medidas de Protección' },
  { value: 'AUDIENCIA', label: 'Audiencia' },
  { value: 'DENUNCIA', label: 'Denuncia' },
];

function LegalToolsContent() {
  const params = useSearchParams();
  const caseId      = params.get('caseId') || '';
  const tool        = (params.get('tool') || 'discrepancias') as LegalTool;
  const evidenceIds = params.get('evidences')?.split(',').filter(Boolean) || [];
  const reportIds   = params.get('reports')?.split(',').filter(Boolean) || [];
  const autorun     = params.get('autorun') === 'true';
  const [autoRunDone, setAutoRunDone] = useState(false);

  const [caseData,        setCaseData]        = useState<any>(null);
  const [evidences,       setEvidences]       = useState<any[]>([]);
  const [reports,         setReports]         = useState<any[]>([]);
  const [activeTool,      setActiveTool]      = useState<LegalTool>(tool);
  const [analyzing,       setAnalyzing]       = useState(false);
  const [result,          setResult]          = useState<any>(null);
  const [error,           setError]           = useState('');

  // Per-tool fields
  const [transcriptionId, setTranscriptionId] = useState('');
  const [caseTypeCode,    setCaseTypeCode]     = useState('');
  const [eventDate,       setEventDate]        = useState('');
  const [eventType,       setEventType]        = useState('MEDIDAS_PROTECCION');

  useEffect(() => {
    if (!caseId) return;
    Promise.all([
      fetchApi(`/cases/${caseId}`).catch(() => null),
      fetchApi(`/evidences/case/${caseId}`).catch(() => []),
      fetchApi(`/reports/case/${caseId}`).catch(() => []),
    ]).then(([c, evs, reps]) => {
      setCaseData(c);
      setEvidences((evs as any[]).filter((e: any) => evidenceIds.length === 0 || evidenceIds.includes(e.id)));
      setReports((reps as any[]).filter((r: any) => reportIds.length === 0 || reportIds.includes(r.id)));
    });
  }, [caseId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!caseId || autoRunDone) return;
    if (autorun && activeTool === 'discrepancias') {
      setAutoRunDone(true);
      handleAnalyze();
    }
  }, [caseId, autorun, activeTool, autoRunDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnalyze = async () => {
    if (!caseId) { setError('No hay expediente seleccionado.'); return; }

    // Per-tool validations
    if (activeTool === 'tipicidad' && !transcriptionId.trim()) {
      setError('Tipicidad requiere un ID de transcripción. Ingresalo en el campo correspondiente.');
      return;
    }
    if (activeTool === 'plazos' && !eventDate) {
      setError('Plazos procesales requiere la fecha del evento.');
      return;
    }

    setAnalyzing(true); setError(''); setResult(null);

    try {
      let res: any;

      if (activeTool === 'discrepancias') {
        const body: Record<string, any> = { caseId };
        if (transcriptionId.trim()) body.transcriptionId = transcriptionId.trim();
        res = await fetchApi('/legal-tools/discrepancies/analyze', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      } else if (activeTool === 'tipicidad') {
        res = await fetchApi('/legal-tools/typicality/analyze', {
          method: 'POST',
          body: JSON.stringify({
            transcriptionId: transcriptionId.trim(),
            caseTypeCode: caseTypeCode.trim() || caseData?.caseType || 'GENERAL',
          }),
        });
      } else if (activeTool === 'plazos') {
        res = await fetchApi('/legal-tools/deadlines/calculate', {
          method: 'POST',
          body: JSON.stringify({ caseId, eventDate, eventType }),
        });
      }

      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servicio. Verificá que el servidor esté activo.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      <BreadcrumbBar caseData={caseData} areaLabel="Herramientas Legales" />

      {!caseId && <NoCaseWarning />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Tool selector */}
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', backgroundColor: ACCENT, color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>⚖️ Herramientas Legales</h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', opacity: 0.85 }}>
                Selecciona la herramienta, completa los campos y ejecuta el análisis.
              </p>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(['discrepancias', 'tipicidad', 'plazos'] as LegalTool[]).map((key) => {
                const def = TOOL_DEFS[key];
                const active = activeTool === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setActiveTool(key); setResult(null); setError(''); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.875rem 1rem',
                      backgroundColor: active ? ACCENT : 'var(--papel)',
                      color: active ? 'white' : 'var(--grafito)',
                      border: `2px solid ${active ? ACCENT : 'var(--border)'}`,
                      borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left', width: '100%',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{def.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{def.label}</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.75 }}>{def.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Per-tool fields */}
          <ToolFields
            activeTool={activeTool}
            transcriptionId={transcriptionId}
            setTranscriptionId={setTranscriptionId}
            caseTypeCode={caseTypeCode}
            setCaseTypeCode={setCaseTypeCode}
            eventDate={eventDate}
            setEventDate={setEventDate}
            eventType={eventType}
            setEventType={setEventType}
          />

          {/* Result panel */}
          <ResultPanel
            activeTool={activeTool}
            analyzing={analyzing}
            result={result}
            error={error}
            onAnalyze={handleAnalyze}
            canAnalyze={!!caseId}
          />
        </div>

        {/* Right panel: materials */}
        <MaterialsPanel caseData={caseData} evidences={evidences} reports={reports} />
      </div>
    </div>
  );
}

export default function LegalPage() {
  return (
    <Suspense fallback={<LoadingState label="herramientas legales" />}>
      <LegalToolsContent />
    </Suspense>
  );
}

// ─── Tool definitions ─────────────────────────────────────────────────────────
const TOOL_DEFS: Record<LegalTool, { icon: string; label: string; description: string }> = {
  discrepancias: {
    icon: '⚖️',
    label: 'Análisis de Discrepancias',
    description: 'Identifica inconsistencias y contradicciones en testimonios',
  },
  tipicidad: {
    icon: '📋',
    label: 'Tipicidad Penal',
    description: 'Analiza figuras penales aplicables según Ley 548',
  },
  plazos: {
    icon: '⏰',
    label: 'Vencimientos Procesales',
    description: 'Calcula plazos críticos del proceso legal',
  },
};

// ─── Per-tool fields ──────────────────────────────────────────────────────────
function ToolFields({
  activeTool,
  transcriptionId, setTranscriptionId,
  caseTypeCode, setCaseTypeCode,
  eventDate, setEventDate,
  eventType, setEventType,
}: {
  activeTool: LegalTool;
  transcriptionId: string; setTranscriptionId: (v: string) => void;
  caseTypeCode: string; setCaseTypeCode: (v: string) => void;
  eventDate: string; setEventDate: (v: string) => void;
  eventType: string; setEventType: (v: string) => void;
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.625rem 0.75rem',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    backgroundColor: 'var(--papel)', color: 'var(--grafito)', fontSize: '0.875rem',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)', marginBottom: '0.35rem', display: 'block',
  };

  if (activeTool === 'plazos') {
    return (
      <div style={{ backgroundColor: 'var(--card)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          Parámetros — Vencimientos Procesales
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={labelStyle}>Tipo de evento *</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={inputStyle}>
              {EVENT_TYPES.map((et) => (
                <option key={et.value} value={et.value}>{et.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Fecha del evento *</label>
            <input
              type="date" value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>
    );
  }

  // discrepancias & tipicidad both use transcriptionId
  return (
    <div style={{ backgroundColor: 'var(--card)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
        Parámetros — {TOOL_DEFS[activeTool].label}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <label style={labelStyle}>
            ID de transcripción {activeTool === 'tipicidad' ? '*' : '(opcional)'}
          </label>
          <input
            type="text"
            value={transcriptionId}
            onChange={(e) => setTranscriptionId(e.target.value)}
            placeholder={activeTool === 'tipicidad' ? 'Requerido para tipicidad' : 'Dejar vacío para usar la última disponible'}
            style={inputStyle}
          />
          {activeTool === 'discrepancias' && (
            <p style={{ fontSize: '0.7rem', color: 'var(--grafito)', opacity: 0.65, marginTop: '0.25rem', margin: '0.25rem 0 0' }}>
              Si no completás este campo, se usa la transcripción más reciente del expediente.
            </p>
          )}
        </div>
        {activeTool === 'tipicidad' && (
          <div>
            <label style={labelStyle}>Tipo de caso (opcional)</label>
            <input
              type="text"
              value={caseTypeCode}
              onChange={(e) => setCaseTypeCode(e.target.value)}
              placeholder="Ej: VIOLENCIA_FAMILIAR — se autodetecta si se deja vacío"
              style={inputStyle}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result panel ─────────────────────────────────────────────────────────────
function ResultPanel({
  activeTool, analyzing, result, error, onAnalyze, canAnalyze,
}: {
  activeTool: LegalTool; analyzing: boolean;
  result: any; error: string;
  onAnalyze: () => void; canAnalyze: boolean;
}) {
  const def = TOOL_DEFS[activeTool];

  return (
    <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Brain size={18} color="var(--tierra-calida)" />
        {def.icon} {def.label}
      </h3>

      {error && (
        <div style={{ backgroundColor: 'oklch(0.95 0.05 28)', color: 'var(--riesgo-alto)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          ❌ {error}
        </div>
      )}

      <button
        onClick={onAnalyze}
        disabled={analyzing || !canAnalyze}
        style={{
          width: '100%', padding: '0.875rem',
          backgroundColor: analyzing || !canAnalyze ? 'var(--border)' : ACCENT,
          color: 'white', border: 'none', borderRadius: 'var(--radius)',
          fontWeight: 700, fontSize: '0.875rem',
          cursor: analyzing || !canAnalyze ? 'not-allowed' : 'pointer',
          marginBottom: '1.25rem',
        }}
      >
        {analyzing ? '⏳ Analizando...' : `${def.icon} Ejecutar análisis`}
      </button>

      {!result && !analyzing && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--grafito)', opacity: 0.5 }}>
          <Brain size={36} style={{ margin: '0 auto 0.75rem', display: 'block' }} />
          <p style={{ fontSize: '0.8rem', margin: 0 }}>El resultado aparecerá aquí.</p>
        </div>
      )}

      {result && activeTool === 'discrepancias' && <DiscrepancyResult data={result} />}
      {result && activeTool === 'tipicidad' && <TypicalityResult data={result} />}
      {result && activeTool === 'plazos' && <DeadlinesResult data={result} />}
    </div>
  );
}

// ─── Discrepancy result ───────────────────────────────────────────────────────
function DiscrepancyResult({ data }: { data: any }) {
  const riskColor: Record<string, string> = { BAJO: '#16a34a', MEDIO: '#d97706', ALTO: '#dc2626' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Stat label="Score de consistencia" value={`${data.consistencyScore ?? '—'}%`} />
        <Stat
          label="Nivel de riesgo"
          value={data.riskLevel ?? '—'}
          color={riskColor[data.riskLevel] ?? 'var(--grafito)'}
        />
      </div>
      {data.recommendation && (
        <div style={{ backgroundColor: 'var(--papel)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--grafito)' }}>
          <strong>Recomendación:</strong> {data.recommendation}
        </div>
      )}
      {Array.isArray(data.discrepancies) && data.discrepancies.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--grafito)', marginBottom: '0.5rem' }}>
            Discrepancias identificadas ({data.discrepancies.length})
          </div>
          {data.discrepancies.map((d: any, i: number) => (
            <div key={i} style={{ backgroundColor: 'var(--papel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <strong>{d.category}</strong>
                <span style={{ color: riskColor[d.severity] ?? 'var(--grafito)', fontWeight: 700 }}>{d.severity}</span>
              </div>
              <p style={{ margin: '0 0 0.25rem', color: 'var(--grafito)' }}>{d.implications}</p>
              {d.suggestedQuestion && (
                <p style={{ margin: 0, color: '#0369a1', fontStyle: 'italic' }}>❓ {d.suggestedQuestion}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {data.ollamaAnalysis && (
        <details style={{ fontSize: '0.75rem', color: 'var(--grafito)', opacity: 0.7 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Ver análisis completo de IA</summary>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{data.ollamaAnalysis}</pre>
        </details>
      )}
    </div>
  );
}

// ─── Typicality result ────────────────────────────────────────────────────────
function TypicalityResult({ data }: { data: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {data.notaSugerencia && (
        <div style={{ backgroundColor: 'oklch(0.98 0.03 65)', border: '1px solid var(--tierra-calida)', borderRadius: 'var(--radius)', padding: '0.625rem 0.875rem', fontSize: '0.72rem', color: '#92400e' }}>
          <AlertTriangle size={12} style={{ display: 'inline', marginRight: '0.35rem' }} />
          {data.notaSugerencia}
        </div>
      )}
      {data.primaryCrime && (
        <Stat label="Delito principal propuesto" value={data.primaryCrime} />
      )}
      {Array.isArray(data.potentialCrimes) && data.potentialCrimes.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--grafito)', marginBottom: '0.5rem' }}>
            Figuras penales compatibles ({data.potentialCrimes.length})
          </div>
          {data.potentialCrimes.map((c: any, i: number) => (
            <div key={i} style={{ backgroundColor: 'var(--papel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <strong>{c.crimeType}</strong>
                <span style={{ color: c.likelihood >= 70 ? '#dc2626' : c.likelihood >= 40 ? '#d97706' : '#16a34a', fontWeight: 700 }}>
                  {c.likelihood}%
                </span>
              </div>
              <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{c.criminalCode}</div>
              <p style={{ margin: 0, color: 'var(--grafito)' }}>{c.fundamento}</p>
            </div>
          ))}
        </div>
      )}
      {Array.isArray(data.evidenceGaps) && data.evidenceGaps.length > 0 && (
        <div style={{ backgroundColor: 'var(--papel)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.78rem' }}>
          <strong style={{ display: 'block', marginBottom: '0.35rem' }}>Vacíos probatorios:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--grafito)' }}>
            {data.evidenceGaps.map((g: string, i: number) => <li key={i}>{g}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Deadlines result ─────────────────────────────────────────────────────────
function DeadlinesResult({ data }: { data: any }) {
  const alertColor: Record<string, string> = { VERDE: '#16a34a', AMARILLO: '#d97706', ROJO: '#dc2626' };
  const statusLabel: Record<string, string> = { EN_TIEMPO: 'En tiempo', PROXIMO: 'Próximo', VENCIDO: 'Vencido' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Stat label="Tipo de evento" value={data.eventType?.replace('_', ' ')} />
        <Stat label="Tipo de días" value={data.dayType} />
        {data.alertLevel && (
          <Stat
            label="Alerta global"
            value={data.alertLevel}
            color={alertColor[data.alertLevel] ?? 'var(--grafito)'}
          />
        )}
      </div>

      {Array.isArray(data.deadlines) && data.deadlines.length === 0 && (
        <div style={{ backgroundColor: 'oklch(0.98 0.03 65)', border: '1px solid var(--tierra-calida)', borderRadius: 'var(--radius)', padding: '0.75rem', fontSize: '0.8rem', color: '#92400e' }}>
          <Clock size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />
          No hay plazos definidos para este tipo de evento todavía. Ver `pendingValidations` abajo.
        </div>
      )}

      {Array.isArray(data.deadlines) && data.deadlines.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--grafito)', marginBottom: '0.5rem' }}>
            Hitos procesales ({data.deadlines.length})
          </div>
          {data.deadlines.map((d: any, i: number) => (
            <div key={i} style={{ backgroundColor: 'var(--papel)', border: `1px solid ${alertColor[d.alertLevel] ?? 'var(--border)'}22`, borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <strong>{d.milestone}</strong>
                <span style={{ color: alertColor[d.alertLevel] ?? 'var(--grafito)', fontWeight: 700 }}>
                  {statusLabel[d.status] ?? d.status}
                </span>
              </div>
              <div style={{ color: 'var(--grafito)' }}>
                {d.calculatedDate ? new Date(d.calculatedDate).toLocaleDateString('es-BO') : '—'}
                {' · '}
                <span style={{ color: d.daysRemaining < 0 ? '#dc2626' : 'var(--grafito)' }}>
                  {d.daysRemaining < 0
                    ? `Vencido hace ${Math.abs(d.daysRemaining)} días`
                    : `${d.daysRemaining} días restantes`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {Array.isArray(data.pendingValidations) && data.pendingValidations.length > 0 && (
        <details style={{ fontSize: '0.72rem', color: '#92400e' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>⚠️ Validaciones pendientes ({data.pendingValidations.length})</summary>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
            {data.pendingValidations.map((v: string, i: number) => <li key={i}>{v}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ flex: 1, backgroundColor: 'var(--papel)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--grafito)', opacity: 0.65 }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: color ?? 'var(--bosque-profundo)', marginTop: '0.2rem' }}>{value}</div>
    </div>
  );
}

function BreadcrumbBar({ caseData, areaLabel }: { caseData: any; areaLabel: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      <Link href="/herramientas" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--bosque-profundo)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Herramientas
      </Link>
      <span style={{ color: 'var(--grafito)', fontSize: '0.875rem' }}>›</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bosque-profundo)' }}>{areaLabel}</span>
      {caseData && (
        <>
          <span style={{ color: 'var(--grafito)', fontSize: '0.875rem' }}>›</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--grafito)' }}>
            Expediente: <strong>{caseData.caseCode}</strong>
          </span>
        </>
      )}
    </div>
  );
}

function NoCaseWarning() {
  return (
    <div style={{
      backgroundColor: 'oklch(0.98 0.03 65)',
      border: '1px solid var(--tierra-calida)',
      borderRadius: 'var(--radius)',
      padding: '1rem 1.25rem',
      marginBottom: '1.5rem',
      fontSize: '0.875rem',
      color: '#92400E',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    }}>
      <AlertTriangle size={18} />
      <div>
        <strong>No hay expediente seleccionado.</strong>{' '}
        Volvé a{' '}
        <Link href="/herramientas" style={{ color: 'var(--bosque-profundo)', fontWeight: 700 }}>
          Herramientas
        </Link>
        , expandí la herramienta, seleccioná un expediente y presioná &quot;Abrir herramienta&quot;.
      </div>
    </div>
  );
}

function MaterialsPanel({ caseData, evidences, reports }: { caseData: any; evidences: any[]; reports: any[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ backgroundColor: 'var(--card)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          📎 Materiales cargados
        </h3>

        {!caseData && (
          <p style={{ fontSize: '0.8rem', color: 'var(--grafito)', opacity: 0.7 }}>
            Sin expediente cargado.
          </p>
        )}

        {caseData && (
          <div style={{ fontSize: '0.8rem', backgroundColor: 'var(--papel)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--bosque-profundo)' }}>📁 {caseData.caseCode}</div>
            <div style={{ color: 'var(--grafito)', marginTop: '0.25rem' }}>
              {caseData.caseType} · {caseData.currentPhase}
            </div>
          </div>
        )}

        {evidences.length > 0 && (
          <div style={{ marginBottom: '0.875rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--grafito)', marginBottom: '0.5rem' }}>
              Evidencias ({evidences.length})
            </div>
            {evidences.map((e: any) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', marginBottom: '0.25rem', color: 'var(--grafito)' }}>
                <CheckCircle2 size={12} color="var(--salvia)" />
                {e.mimeType?.startsWith('audio') ? <Mic size={12} color="#6366F1" /> : <FileText size={12} />}
                {e.description || e.fileName}
              </div>
            ))}
          </div>
        )}

        {reports.length > 0 && (
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--grafito)', marginBottom: '0.5rem' }}>
              Informes ({reports.length})
            </div>
            {reports.map((r: any) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', marginBottom: '0.25rem', color: 'var(--grafito)' }}>
                <CheckCircle2 size={12} color="var(--salvia)" />
                <FileText size={12} color="var(--bosque-profundo)" />
                {r.title} <span style={{ opacity: 0.6 }}>(v{r.version})</span>
              </div>
            ))}
          </div>
        )}

        {caseData && evidences.length === 0 && reports.length === 0 && (
          <p style={{ fontSize: '0.78rem', color: '#92400E', backgroundColor: 'oklch(0.98 0.03 65)', padding: '0.625rem', borderRadius: 'var(--radius)' }}>
            ⚠️ Sin materiales seleccionados. El análisis usará solo la narrativa inicial.
          </p>
        )}
      </div>

      <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          💡 ¿Cómo funciona?
        </div>
        <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#0c4a6e', lineHeight: 1.6 }}>
          <li>Elige la herramienta legal</li>
          <li>Completa los campos requeridos</li>
          <li>Presiona el botón de análisis</li>
          <li>El sistema consulta al backend con los datos del expediente</li>
          <li>Usa el resultado para redactar el informe jurídico</li>
        </ol>
      </div>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return <div style={{ padding: '2rem', opacity: 0.6 }}>Cargando {label}...</div>;
}
