'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { ArrowLeft, Brain, FileText, Mic, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import Link from 'next/link';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type LegalTool = 'discrepancias' | 'tipicidad' | 'plazos';

function LegalToolsContent() {
  const params = useSearchParams();
  const caseId      = params.get('caseId') || '';
  const tool        = (params.get('tool') || 'discrepancias') as LegalTool;
  const evidenceIds = params.get('evidences')?.split(',').filter(Boolean) || [];
  const reportIds   = params.get('reports')?.split(',').filter(Boolean) || [];

  const [caseData,   setCaseData]   = useState<any>(null);
  const [evidences,  setEvidences]  = useState<any[]>([]);
  const [reports,    setReports]    = useState<any[]>([]);
  const [activeTool, setActiveTool] = useState<LegalTool>(tool);
  const [analyzing,  setAnalyzing]  = useState(false);
  const [aiResult,   setAiResult]   = useState('');
  const [error,      setError]      = useState('');

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

  const TOOLS: Record<LegalTool, { icon: string; label: string; prompt: string }> = {
    discrepancias: {
      icon: '⚖️',
      label: 'Análisis de Discrepancias',
      prompt: `Actuás como abogado forense de la Defensoría de la Niñez y Adolescencia de Bolivia.
Analizá el expediente e identificá INCONSISTENCIAS Y DISCREPANCIAS en los testimonios y documentos.

Para cada discrepancia encontrada indicá:
- Categoría (temporal, factual, testimonial, documental)
- Severidad (BAJA / MEDIA / ALTA)
- Descripción de la contradicción
- Implicaciones legales
- Pregunta de aclaración sugerida

Al final indicá el score de consistencia narrativa (0-100%) y nivel de riesgo (BAJO/MEDIO/ALTO).`,
    },
    tipicidad: {
      icon: '📋',
      label: 'Tipicidad Penal',
      prompt: `Actuás como abogado penalista de la Defensoría de la Niñez y Adolescencia de Bolivia.
Analizá el expediente y determiná las FIGURAS PENALES APLICABLES según la Ley 548 (Código Niña, Niño y Adolescente) y el Código Penal boliviano.

Para cada figura penal indicá:
- Nombre del tipo penal y artículo
- Probabilidad de encuadre (%)
- Elementos del tipo presentes y ausentes
- Pruebas que lo acreditan
- Pruebas que faltan

Indicá el delito principal, los delitos concurrentes si los hay, y la ruta de investigación recomendada.`,
    },
    plazos: {
      icon: '⏰',
      label: 'Vencimientos Procesales',
      prompt: `Actuás como abogado procesal de la Defensoría de la Niñez y Adolescencia de Bolivia.
Analizá el expediente y calculá los PLAZOS PROCESALES CRÍTICOS según la fecha de apertura del caso.

Para cada plazo indicá:
- Hito procesal (nombre del plazo)
- Fecha límite calculada
- Días restantes (o días vencido si corresponde)
- Estado: EN_TIEMPO / PRÓXIMO (menos de 7 días) / VENCIDO
- Nivel de urgencia (BAJA/MEDIA/ALTA)
- Base legal (artículo y ley)

Ordená por urgencia, de más crítico a menos crítico.`,
    },
  };

  const handleAnalyze = async () => {
    if (!caseId) { setError('No hay expediente seleccionado.'); return; }
    setAnalyzing(true); setError(''); setAiResult('');

    const context = buildContext(caseData, evidences, reports);
    const toolDef = TOOLS[activeTool];

    try {
      const res = await fetchApi('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: `${toolDef.prompt}\n\nCONTEXTO DEL EXPEDIENTE:\n${context}`,
          caseId,
        }),
      });
      setAiResult(res.response || res.message || JSON.stringify(res));
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el asistente IA. Verificá que el servidor esté activo.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      <BreadcrumbBar caseData={caseData} area="legal" areaLabel="Herramientas Legales" />

      {!caseId && <NoCaseWarning />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        {/* Panel principal: selector de herramienta + resultado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Selector de herramienta */}
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', backgroundColor: '#1E3A5F', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>⚖️ Herramientas Legales</h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', opacity: 0.85 }}>
                Seleccioná la herramienta, revisá el contexto cargado y ejecutá el análisis con IA.
              </p>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(Object.entries(TOOLS) as [LegalTool, typeof TOOLS[LegalTool]][]).map(([key, def]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setActiveTool(key); setAiResult(''); setError(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    backgroundColor: activeTool === key ? '#1E3A5F' : 'var(--papel)',
                    color: activeTool === key ? 'white' : 'var(--grafito)',
                    border: `2px solid ${activeTool === key ? '#1E3A5F' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left', width: '100%',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{def.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{def.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resultado del análisis */}
          <AnalysisResultPanel
            toolLabel={TOOLS[activeTool].label}
            toolIcon={TOOLS[activeTool].icon}
            analyzing={analyzing}
            aiResult={aiResult}
            error={error}
            onAnalyze={handleAnalyze}
            canAnalyze={!!caseId}
          />
        </div>

        {/* Panel lateral: materiales */}
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

// ─── Sub-componentes compartidos ──────────────────────────────────────────────

function buildContext(caseData: any, evidences: any[], reports: any[]) {
  return [
    caseData
      ? `EXPEDIENTE: ${caseData.caseCode}
Tipo de caso: ${caseData.caseType}
Fase actual: ${caseData.currentPhase}
Vía de intervención: ${caseData.currentInterventionPath}
Narrativa inicial: ${caseData.intakeNarrative || 'Sin narrativa registrada'}
Fecha apertura: ${caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString('es-BO') : 'N/D'}`
      : 'Sin datos del expediente',

    reports.length > 0
      ? `INFORMES PROFESIONALES (${reports.length}):\n` +
        reports.map((r: any) =>
          `[${r.reportType} v${r.version} — ${r.status}]\nTítulo: ${r.title}\nContenido:\n${r.content || '(sin contenido)'}`
        ).join('\n\n')
      : 'Sin informes profesionales seleccionados',

    evidences.length > 0
      ? `EVIDENCIAS DEL CASO (${evidences.length}):\n` +
        evidences.map((e: any) =>
          `- ${e.mimeType?.startsWith('audio') ? '🎙️ Audio' :
             e.mimeType?.startsWith('image') ? '🖼️ Imagen' :
             e.mimeType === 'application/pdf' ? '📄 PDF' : '📎 Doc'}: ${e.description || e.fileName}`
        ).join('\n')
      : 'Sin evidencias seleccionadas',
  ].join('\n\n---\n\n');
}

function BreadcrumbBar({ caseData, area, areaLabel }: { caseData: any; area: string; areaLabel: string }) {
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

function MaterialsPanel({ caseData, evidences, reports }: { caseData: any; evidences: any[]; reports: any[] }) {
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
          <li>Elegí la herramienta legal en el panel izquierdo</li>
          <li>Verificá que el expediente y materiales estén cargados</li>
          <li>Presioná el botón de análisis</li>
          <li>La IA lee todo el contexto del caso y genera el análisis especializado</li>
          <li>Usá el resultado para redactar el informe jurídico</li>
        </ol>
      </div>
    </div>
  );
}

function AnalysisResultPanel({
  toolLabel, toolIcon, analyzing, aiResult, error, onAnalyze, canAnalyze,
}: {
  toolLabel: string; toolIcon: string; analyzing: boolean;
  aiResult: string; error: string; onAnalyze: () => void; canAnalyze: boolean;
}) {
  return (
    <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bosque-profundo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Brain size={18} color="var(--tierra-calida)" />
        Análisis: {toolIcon} {toolLabel}
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
          backgroundColor: analyzing || !canAnalyze ? 'var(--border)' : 'var(--bosque-profundo)',
          color: 'white', border: 'none', borderRadius: 'var(--radius)',
          fontWeight: 700, fontSize: '0.875rem',
          cursor: analyzing || !canAnalyze ? 'not-allowed' : 'pointer',
          marginBottom: '1rem',
        }}
      >
        {analyzing ? '⏳ Analizando con IA...' : `${toolIcon} Ejecutar análisis IA`}
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
  );
}

function LoadingState({ label }: { label: string }) {
  return <div style={{ padding: '2rem', opacity: 0.6 }}>Cargando {label}...</div>;
}
