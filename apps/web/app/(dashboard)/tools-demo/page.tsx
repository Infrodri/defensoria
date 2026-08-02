'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getCasesList,
  getCaseDetail,
  CaseDetail,
  analyzeLegalDiscrepancies,
  analyzePenalTypicality,
  calculateProcessualDeadlines,
  extractTraumaIndicators,
  prefillRiskScales,
  translateClinically,
  analyzeTrauma,
  generateFamilyMap,
  calculateVulnerability,
  mapEnvironmental,
  createUnifiedTimeline,
  anonymizeReport,
  uploadAndTranscribeAudio,
  TranscriptionResult,
  formatApiError,
} from '@/lib/api-client';
import { useToolsData } from '@/hooks/useToolsData';
import { LegalToolsPanel } from '@/components/legal-tools';
import { PsychologicalToolsPanel } from '@/components/psychological-tools';
import { SocialToolsPanel } from '@/components/social-tools';
import { TransversalToolsPanel } from '@/components/transversal-tools';
import { AlertCircle, Loader, RotateCw, Upload } from 'lucide-react';

// ============================================================================
// ESTILOS
// ============================================================================

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    marginBottom: '2rem',
    borderBottom: '2px solid var(--border)',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--grafito)',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '1.5rem',
  },
  controlsSection: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--grafito)',
  },
  select: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    backgroundColor: 'white',
    color: 'var(--grafito)',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'var(--salvia)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s',
  },
  tabsContainer: {
    marginBottom: '2rem',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  tab: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#999',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: 'var(--salvia)',
    borderBottomColor: 'var(--salvia)',
  },
  contentSection: {
    minHeight: '400px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  errorContainer: {
    backgroundColor: '#fee',
    border: '1px solid #f99',
    borderRadius: '8px',
    padding: '1.5rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  errorIcon: {
    color: 'var(--rojo)',
    flexShrink: 0,
  },
  errorText: {
    color: 'var(--grafito)',
    fontSize: '0.875rem',
  },
  noDataContainer: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#999',
  },
  refreshButton: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
  userInfo: {
    fontSize: '0.875rem',
    color: '#666',
    marginTop: '1rem',
  },
  uploadButton: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '2px solid var(--salvia)',
    backgroundColor: 'transparent',
    color: 'var(--salvia)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
  uploadButtonActive: {
    backgroundColor: 'var(--salvia)',
    color: 'white',
  },
  transcriptionStatus: {
    padding: '1rem',
    borderRadius: '6px',
    backgroundColor: '#f0f8ff',
    border: '1px solid #b3d9ff',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  transcriptionStatusSuccess: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #b3e5fc',
    color: '#065f46',
  },
  transcriptionStatusError: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#7f1d1d',
  },
};

// ============================================================================
// TIPOS
// ============================================================================

type Tab = 'legal' | 'psychological' | 'social' | 'transversal';

interface ToolsState {
  legal: any;
  psychological: any;
  social: any;
  transversal: any;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ToolsDemoPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('legal');
  const [cases, setCases] = useState<CaseDetail[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [toolsData, setToolsData] = useState<ToolsState>({
    legal: null,
    psychological: null,
    social: null,
    transversal: null,
  });
  const [toolsLoading, setToolsLoading] = useState(false);
  const [toolsError, setToolsError] = useState<string | null>(null);
  
  // Audio upload state
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [transcriptionId, setTranscriptionId] = useState<string>('');
  const [transcriptionText, setTranscriptionText] = useState<string>('');
  const [transcriptionStatus, setTranscriptionStatus] = useState<'idle' | 'pending' | 'completed' | 'error'>('idle');
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  // Cargar listado de casos
  useEffect(() => {
    if (!token || !user) return;

    const loadCases = async () => {
      try {
        setCasesLoading(true);
        setCasesError(null);
        const casesArray = await getCasesList();
        setCases(casesArray);
        if (casesArray.length > 0) {
          setSelectedCaseId(casesArray[0].id);
        }
      } catch (err) {
        setCasesError(formatApiError(err));
      } finally {
        setCasesLoading(false);
      }
    };

    loadCases();
  }, [token, user]);

  // Manejar upload de audio
  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCaseId || !token) return;

    try {
      setUploadingAudio(true);
      setTranscriptionStatus('pending');
      setTranscriptionError(null);

      // Crear evidencia ID (usar timestamp)
      const evidenceId = `audio-${Date.now()}`;

      const result = await uploadAndTranscribeAudio(
        selectedCaseId,
        evidenceId,
        file
      );

      setTranscriptionId(result.id);
      setTranscriptionText(result.text);
      setTranscriptionStatus('completed');
      
      // Auto-recargar tools con el nuevo transcriptionId
      setTimeout(() => {
        loadToolsData();
      }, 500);
    } catch (err) {
      setTranscriptionStatus('error');
      setTranscriptionError(formatApiError(err));
    } finally {
      setUploadingAudio(false);
      // Limpiar el input
      event.target.value = '';
    }
  };

  // Cargar datos de herramientas desde API real
  const loadToolsData = async () => {
    if (!selectedCaseId || !token) return;

    try {
      setToolsLoading(true);
      setToolsError(null);
      const newToolsData: ToolsState = {
        legal: null,
        psychological: null,
        social: null,
        transversal: null,
      };

      // Usar el transcriptionId del estado actual si existe
      let txId = transcriptionId;

      // Si no existe, intentar obtenerlo del caso
      if (!txId) {
        try {
          const caseDetail = await getCaseDetail(selectedCaseId);
          if ('transcriptions' in caseDetail && Array.isArray(caseDetail.transcriptions) && caseDetail.transcriptions.length > 0) {
            txId = (caseDetail.transcriptions[0] as any).id;
          }
        } catch (err) {
          console.warn('Error obteniendo detalle del caso:', formatApiError(err));
        }
      }

      // HERRAMIENTAS LEGALES
      try {
        const result = await analyzeLegalDiscrepancies({
          caseId: selectedCaseId,
          transcriptionId: txId,
        });
        newToolsData.legal = result;
      } catch (err) {
        console.warn('Error cargando análisis legal:', formatApiError(err));
        newToolsData.legal = null;
      }

      // HERRAMIENTAS PSICOLÓGICAS - Indicadores de Trauma
      try {
        const result = await extractTraumaIndicators({
          caseId: selectedCaseId,
          transcriptionId: txId,
        });
        newToolsData.psychological = result;
      } catch (err) {
        console.warn('Error cargando indicadores de trauma:', formatApiError(err));
        newToolsData.psychological = null;
      }

      // HERRAMIENTAS SOCIALES - Mapa Familiar
      try {
        const result = await generateFamilyMap({
          caseId: selectedCaseId,
          transcriptionId: txId,
        });
        newToolsData.social = result;
      } catch (err) {
        console.warn('Error cargando mapa familiar:', formatApiError(err));
        newToolsData.social = null;
      }

      // HERRAMIENTAS TRANSVERSALES - Timeline Unificada
      try {
        const result = await createUnifiedTimeline({
          caseId: selectedCaseId,
        });
        newToolsData.transversal = result;
      } catch (err) {
        console.warn('Error cargando timeline unificada:', formatApiError(err));
        newToolsData.transversal = null;
      }

      setToolsData(newToolsData);
    } catch (err) {
      setToolsError(formatApiError(err));
    } finally {
      setToolsLoading(false);
    }
  };

  // Auto-cargar datos al cambiar caso
  useEffect(() => {
    if (selectedCaseId && token) {
      loadToolsData();
    }
  }, [selectedCaseId, token]);

  if (authLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <Loader style={{ animation: 'spin 1s linear infinite' }} />
          <p>Cargando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <AlertCircle style={styles.errorIcon} size={24} />
          <div style={styles.errorText}>
            <strong>No autenticado</strong>
            <p>Debes iniciar sesión para acceder a las herramientas de análisis.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Demo Integrado de Herramientas</h1>
        <p style={styles.subtitle}>
          Interfaz integrada que muestra todas las herramientas de análisis conectadas a la API real
        </p>
        <div style={styles.userInfo}>
          <strong>Usuario:</strong> {user.firstName} {user.lastName} ({user.role})
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controlsSection}>
        <div style={styles.selectWrapper}>
          <label style={styles.label}>Caso a Analizar:</label>
          <select
            style={styles.select}
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            disabled={casesLoading || cases.length === 0}
          >
            {cases.length === 0 ? (
              <option value="">No hay casos disponibles</option>
            ) : (
              cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseCode} - {c.nnaName || 'Sin nombre'}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Audio Upload Button */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginTop: '1.5rem' }}>
          <input
            type="file"
            id="audio-input"
            accept=".mp3,.wav,.m4a,.ogg"
            onChange={handleAudioUpload}
            disabled={uploadingAudio || !selectedCaseId}
            style={{ display: 'none' }}
          />
          <button
            style={{
              ...styles.uploadButton,
              ...(uploadingAudio ? styles.uploadButtonActive : {}),
              opacity: selectedCaseId ? 1 : 0.5,
              cursor: selectedCaseId ? 'pointer' : 'not-allowed',
            }}
            onClick={() => document.getElementById('audio-input')?.click()}
            disabled={uploadingAudio || !selectedCaseId}
          >
            {uploadingAudio ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Transcribiendo...
              </>
            ) : (
              <>
                <Upload size={16} />
                📁 Subir Entrevista
              </>
            )}
          </button>
        </div>

        <button
          style={{
            ...styles.refreshButton,
            marginTop: '1.5rem',
          }}
          onClick={loadToolsData}
          disabled={toolsLoading || !selectedCaseId}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.backgroundColor = 'var(--papel)')
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.backgroundColor = 'white')
          }
        >
          {toolsLoading ? (
            <>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Cargando...
            </>
          ) : (
            <>
              <RotateCw size={16} />
              Cargar Datos
            </>
          )}
        </button>
      </div>

      {/* Transcription Status */}
      {transcriptionStatus !== 'idle' && (
        <div
          style={{
            ...styles.transcriptionStatus,
            ...(transcriptionStatus === 'completed' ? styles.transcriptionStatusSuccess : {}),
            ...(transcriptionStatus === 'error' ? styles.transcriptionStatusError : {}),
          }}
        >
          {transcriptionStatus === 'pending' && (
            <>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
              Transcribiendo audio...
            </>
          )}
          {transcriptionStatus === 'completed' && (
            <>
              ✅ Transcripción completada exitosamente
              {transcriptionText && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
                  <strong>Vista previa:</strong> {transcriptionText.substring(0, 100)}...
                </p>
              )}
            </>
          )}
          {transcriptionStatus === 'error' && (
            <>
              ❌ Error en la transcripción: {transcriptionError}
            </>
          )}
        </div>
      )}

      {casesError && (
        <div style={styles.errorContainer}>
          <AlertCircle style={styles.errorIcon} size={24} />
          <div style={styles.errorText}>
            <strong>Error al cargar casos:</strong> {casesError}
          </div>
        </div>
      )}

      {toolsError && (
        <div style={styles.errorContainer}>
          <AlertCircle style={styles.errorIcon} size={24} />
          <div style={styles.errorText}>
            <strong>Error al cargar herramientas:</strong> {toolsError}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {(['legal', 'psychological', 'social', 'transversal'] as Tab[]).map((tab) => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab)}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                (e.target as HTMLElement).style.color = 'var(--grafito)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                (e.target as HTMLElement).style.color = '#999';
              }
            }}
          >
            {tab === 'legal' && '⚖️ Legal'}
            {tab === 'psychological' && '🧠 Psicológico'}
            {tab === 'social' && '👥 Social'}
            {tab === 'transversal' && '🔗 Transversal'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.contentSection}>
        {toolsLoading ? (
          <div style={styles.loadingContainer}>
            <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--salvia)' }} />
            <p>Analizando caso...</p>
          </div>
        ) : activeTab === 'legal' ? (
          toolsData.legal ? (
            <LegalToolsPanel 
              caseId={selectedCaseId} 
              discrepancyAnalysis={{
                analysisId: toolsData.legal.analysisId,
                discrepancies: (toolsData.legal.discrepancies || []).map((d: any) => ({
                  category: `Discrepancia ${d.id}`,
                  severity: d.severity,
                  currentStatement: 'Testimonio 1',
                  previousStatement: 'Testimonio 2',
                  implications: d.implication,
                  suggestedQuestion: `¿Puede aclarar sobre ${d.discrepancy}?`,
                })),
                consistencyScore: toolsData.legal.overallConsistencyScore || 75,
                riskLevel: (toolsData.legal.overallConsistencyScore || 75) > 80 ? 'BAJO' : (toolsData.legal.overallConsistencyScore || 75) > 50 ? 'MEDIO' : 'ALTO',
                recommendation: toolsData.legal.recommendation,
                analyzedAt: toolsData.legal.analyzedAt,
                analyzedBy: toolsData.legal.analyzedBy,
              }}
            />
          ) : (
            <div style={styles.noDataContainer}>
              <p>No hay análisis legales disponibles para este caso</p>
            </div>
          )
        ) : activeTab === 'psychological' ? (
          toolsData.psychological ? (
            <PsychologicalToolsPanel 
              caseId={selectedCaseId} 
              traumaIndicators={toolsData.psychological}
            />
          ) : (
            <div style={styles.noDataContainer}>
              <p>No hay análisis psicológicos disponibles para este caso</p>
            </div>
          )
        ) : activeTab === 'social' ? (
          toolsData.social ? (
            <SocialToolsPanel 
              caseId={selectedCaseId} 
              familyStructure={toolsData.social}
            />
          ) : (
            <div style={styles.noDataContainer}>
              <p>No hay análisis sociales disponibles para este caso</p>
            </div>
          )
        ) : (
          toolsData.transversal ? (
            <TransversalToolsPanel 
              caseId={selectedCaseId} 
              unifiedTimeline={toolsData.transversal}
            />
          ) : (
            <div style={styles.noDataContainer}>
              <p>No hay análisis transversales disponibles para este caso</p>
            </div>
          )
        )}
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
