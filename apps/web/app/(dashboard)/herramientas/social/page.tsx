'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { ArrowLeft, Brain, FileText, Mic, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type SocialTool = 'familia' | 'vulnerabilidad' | 'ambiental';

type SocialToolDef = {
  icon: string;
  label: string;
  endpoint: string;
  usesTranscription?: boolean;           // muestra el input de ID de transcripción
  requiresTranscription?: boolean;       // el backend exige transcriptionId
  requiresVulnerabilityInputs?: boolean; // inputs de ingresos/vivienda/cargas
};

const VIVIENDA_OPTIONS = ['Propia', 'Alquilada', 'Cedida', 'Precaria', 'Otra'];

const TOOLS: Record<SocialTool, SocialToolDef> = {
  familia: {
    icon: '🌳',
    label: 'Familiograma',
    endpoint: '/social-tools/familymap/generate',
    usesTranscription: true,
  },
  vulnerabilidad: {
    icon: '📉',
    label: 'Índice de Vulnerabilidad',
    endpoint: '/social-tools/vulnerability/calculate',
    requiresVulnerabilityInputs: true,
  },
  ambiental: {
    icon: '🏘️',
    label: 'Mapeo Ambiental',
    endpoint: '/social-tools/environmental/map',
    usesTranscription: true,
    requiresTranscription: true,
  },
};

const ACCENT = '#065F46'; // verde bosque — identidad visual de la disciplina

function SocialToolsContent() {
  const params = useSearchParams();
  const caseId      = params.get('caseId') || '';
  const tool        = (params.get('tool') || 'familia') as SocialTool;
  const evidenceIds = params.get('evidences')?.split(',').filter(Boolean) || [];
  const reportIds   = params.get('reports')?.split(',').filter(Boolean) || [];

  const [caseData,        setCaseData]        = useState<any>(null);
  const [evidences,       setEvidences]       = useState<any[]>([]);
  const [reports,         setReports]         = useState<any[]>([]);
  const [activeTool,      setActiveTool]      = useState<SocialTool>(tool);
  const [transcriptionId, setTranscriptionId] = useState('');
  const [ingresos,        setIngresos]        = useState('1500');
  const [vivienda,        setVivienda]        = useState('Propia');
  const [cargas,          setCargas]          = useState('2');
  const [analyzing,       setAnalyzing]       = useState(false);
  const [aiResult,        setAiResult]        = useState('');
  const [error,           setError]           = useState('');

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
  }, [caseId]);

  const def = TOOLS[activeTool];

  const handleAnalyze = async () => {
    if (!caseId) { setError('No hay expediente seleccionado.'); return; }

    if (def.requiresTranscription && !transcriptionId.trim()) {
      setError('Esta herramienta requiere un ID de transcripción. Escribilo en el campo de transcripción.');
      return;
    }
    if (def.requiresVulnerabilityInputs && (ingresos === '' || cargas === '')) {
      setError('Completá los ingresos mensuales y las cargas familiares para calcular el índice.');
      return;
    }

    setAnalyzing(true); setError(''); setAiResult('');

    const body: Record<string, any> = { caseId };
    if (def.usesTranscription && transcriptionId.trim()) body.transcriptionId = transcriptionId.trim();
    if (def.requiresVulnerabilityInputs) {
      body.ingresos = Number(ingresos);
      body.vivienda = vivienda;
      body.cargasFamiliares = Number(cargas);
    }

    try {
      const res = await fetchApi(def.endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setAiResult(formatResult(res));
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servicio.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      <BreadcrumbBar caseData={caseData} areaLabel="Herramientas Sociales" />

      {!caseId && <NoCaseWarning />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        {/* Panel principal: selector de herramienta + resultado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Selector de herramienta */}
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', backgroundColor: ACCENT, color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>👥 Herramientas Sociales</h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', opacity: 0.85 }}>
                Selecciona la herramienta, revisa el contexto cargado y ejecuta el análisis con IA.
              </p>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(Object.entries(TOOLS) as [SocialTool, SocialToolDef][]).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setActiveTool(key); setAiResult(''); setError(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    backgroundColor: activeTool === key ? ACCENT : 'var(--papel)',
                    color: activeTool === key ? 'white' : 'var(--grafito)',
                    border: `2px solid ${activeTool === key ? ACCENT : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left', width: '100%',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{t.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resultado del análisis */}
          <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={18} color={ACCENT} />
              Análisis: {def.icon} {def.label}
            </h3>

            {error && (
              <div style={{ backgroundColor: 'oklch(0.95 0.05 28)', color: 'var(--riesgo-alto)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                ❌ {error}
              </div>
            )}

            {def.usesTranscription && (
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="social-transcription-id" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)', marginBottom: '0.375rem' }}>
                  ID de transcripción {def.requiresTranscription ? '(obligatorio)' : '(opcional)'}
                </label>
                <input
                  id="social-transcription-id"
                  type="text"
                  value={transcriptionId}
                  onChange={(e) => setTranscriptionId(e.target.value)}
                  placeholder="UUID de la transcripción de la entrevista"
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--papel)', fontSize: '0.8rem', color: 'var(--grafito)', fontFamily: 'inherit' }}
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--grafito)', opacity: 0.7, margin: '0.25rem 0 0' }}>
                  {def.requiresTranscription
                    ? 'Sin el ID la herramienta no puede ejecutarse. Se genera al transcribir una evidencia de audio del expediente.'
                    : 'Opcional: sin el ID el sistema genera un análisis de ejemplo.'}
                </p>
              </div>
            )}
            {def.requiresVulnerabilityInputs && (
              <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label htmlFor="social-ingresos" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)', marginBottom: '0.375rem' }}>
                    Ingresos mensuales familiares (Bs)
                  </label>
                  <input
                    id="social-ingresos"
                    type="number"
                    min={0}
                    value={ingresos}
                    onChange={(e) => setIngresos(e.target.value)}
                    placeholder="Ej: 1500"
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--papel)', fontSize: '0.8rem', color: 'var(--grafito)', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label htmlFor="social-vivienda" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)', marginBottom: '0.375rem' }}>
                    Tipo de vivienda
                  </label>
                  <select
                    id="social-vivienda"
                    value={vivienda}
                    onChange={(e) => setVivienda(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--papel)', fontSize: '0.8rem', color: 'var(--grafito)', fontFamily: 'inherit' }}
                  >
                    {VIVIENDA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="social-cargas" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--grafito)', marginBottom: '0.375rem' }}>
                    Cargas familiares
                  </label>
                  <input
                    id="social-cargas"
                    type="number"
                    min={0}
                    value={cargas}
                    onChange={(e) => setCargas(e.target.value)}
                    placeholder="Ej: 2"
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--papel)', fontSize: '0.8rem', color: 'var(--grafito)', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={analyzing || !caseId}
              style={{
                width: '100%', padding: '0.875rem',
                backgroundColor: analyzing || !caseId ? 'var(--border)' : ACCENT,
                color: 'white', border: 'none', borderRadius: 'var(--radius)',
                fontWeight: 700, fontSize: '0.875rem',
                cursor: analyzing || !caseId ? 'not-allowed' : 'pointer',
                marginBottom: '1rem',
              }}
            >
              {analyzing ? '⏳ Analizando con IA...' : `${def.icon} Ejecutar análisis IA`}
            </button>

            {!aiResult && !analyzing && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--grafito)', opacity: 0.5 }}>
                <Brain size={36} style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                <p style={{ fontSize: '0.8rem', margin: 0 }}>
                  El resultado del análisis aparecerá aquí.
                </p>
              </div>
            )}

            {aiResult && (
              <div style={{
                backgroundColor: 'var(--papel)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '1.25rem',
                fontSize: '0.8rem', lineHeight: 1.7, color: 'var(--grafito)',
                whiteSpace: 'pre-wrap', maxHeight: '600px', overflowY: 'auto',
              }}>
                {aiResult}
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral: materiales */}
        <MaterialsPanel
          caseData={caseData}
          evidences={evidences}
          reports={reports}
          steps={[
            'Elige la herramienta social en el panel izquierdo',
            'Verifica que el expediente y materiales estén cargados',
            'Completa los datos familiares o del entorno requeridos',
            'Presiona el botón de análisis',
            'La IA procesa la estructura familiar y vulnerabilidad social',
            'Usa el resultado para redactar el informe social',
          ]}
        />
      </div>
    </div>
  );
}

export default function SocialPage() {
  return (
    <Suspense fallback={<LoadingState label="herramientas sociales" />}>
      <SocialToolsContent />
    </Suspense>
  );
}

// ─── Sub-componentes compartidos ──────────────────────────────────────────────

function formatResult(res: any): string {
  if (typeof res === 'string') return res;
  if (res && typeof res === 'object') {
    for (const key of ['analisisCompleto', 'ollamaAnalysis', 'forensicTranslation', 'response', 'message']) {
      if (typeof res[key] === 'string' && res[key].trim()) return res[key];
    }
  }
  return JSON.stringify(res, null, 2);
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
        , expandí la herramienta, seleccioná un expediente y sus materiales, y presioná "Abrir herramienta".
      </div>
    </div>
  );
}

function MaterialsPanel({ caseData, evidences, reports, steps }: { caseData: any; evidences: any[]; reports: any[]; steps: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ backgroundColor: 'var(--card)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
          📎 Materiales cargados para análisis
        </h3>

        {!caseData && (
          <p style={{ fontSize: '0.8rem', color: 'var(--grafito)', opacity: 0.7 }}>
            Sin expediente cargado. Volvé a la página de herramientas para seleccionar uno.
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
            ⚠️ No marcaste evidencias ni informes. El análisis usará solo la narrativa inicial del expediente.
          </p>
        )}
      </div>

      {/* Instrucciones de uso */}
      <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          💡 ¿Cómo funciona?
        </div>
        <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#0c4a6e', lineHeight: 1.6 }}>
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return <div style={{ padding: '2rem', opacity: 0.6 }}>Cargando {label}...</div>;
}
