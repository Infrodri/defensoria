'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Loader, RefreshCw, CheckCheck } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface ToolHealth {
  name: string;
  status: 'OK' | 'ERROR' | 'DEGRADED';
  lastCheck: string;
  message: string;
  responseTime?: number;
}

interface ToolsHealthReport {
  timestamp: string;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  tools: {
    ollama: ToolHealth;
    whisper: ToolHealth;
    rag: ToolHealth;
    database: ToolHealth;
    transcriptions: ToolHealth;
    knowledgeBase: ToolHealth;
  };
}

interface Statistics {
  transcriptions: {
    total: number;
    completed: number;
    pending: number;
    successRate: number;
  };
  analyses: {
    total: number;
  };
  knowledgeBase: {
    documentsIndexed: number;
  };
}

const styles = {
  container: {
    maxWidth: '1200px',
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
    marginBottom: '1rem',
  },
  controlsSection: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
  },
  button: {
    padding: '0.75rem 1.5rem',
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
    transition: 'all 0.2s',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--grafito)',
  },
  healthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  healthCard: {
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '1.5rem',
    backgroundColor: 'white',
  },
  healthCardOK: {
    borderLeftColor: '#22c55e',
    borderLeftWidth: '4px',
  },
  healthCardDegraded: {
    borderLeftColor: '#eab308',
    borderLeftWidth: '4px',
  },
  healthCardError: {
    borderLeftColor: '#ef4444',
    borderLeftWidth: '4px',
  },
  toolName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--grafito)',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
  },
  statusOK: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusDegraded: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  message: {
    fontSize: '0.875rem',
    color: '#666',
    marginTop: '0.5rem',
  },
  responseTime: {
    fontSize: '0.75rem',
    color: '#999',
    marginTop: '0.5rem',
  },
  overallStatus: {
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
  },
  overallStatusDown: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
  },
  overallStatusDegraded: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
  },
  statisticsSection: {
    marginBottom: '2rem',
  },
  statisticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    backgroundColor: '#f9fafb',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--salvia)',
  },
  statProgress: {
    marginTop: '1rem',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    height: '6px',
    overflow: 'hidden',
  },
  statProgressBar: {
    backgroundColor: 'var(--salvia)',
    height: '100%',
    transition: 'width 0.3s',
  },
  approvalsSection: {
    marginBottom: '2rem',
  },
  approvalCard: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  approvalText: {
    fontSize: '1rem',
    color: '#166534',
    marginBottom: '1rem',
  },
  approveButton: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  testResultsSection: {
    marginBottom: '2rem',
  },
  testResult: {
    backgroundColor: '#f9fafb',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
  },
  testPassed: {
    borderLeftColor: '#22c55e',
    borderLeftWidth: '4px',
  },
  testFailed: {
    borderLeftColor: '#ef4444',
    borderLeftWidth: '4px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
};

export function AdminToolsPanel() {
  const [health, setHealth] = useState<ToolsHealthReport | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchApi<ToolsHealthReport>('/tools-admin/health');
      setHealth(data);

      // Cargar estadísticas también
      try {
        const statusData = await fetchApi<any>('/tools-admin/status');
        setStatistics(statusData.statistics);
      } catch {
        // Status endpoint may not exist yet, ignore
      }
    } catch (err: any) {
      setError(err.message || 'Error loading health data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTools = async () => {
    try {
      setApproving(true);
      setApprovalMessage(null);

      const data = await fetchApi<any>('/tools-admin/approve', {
        method: 'POST',
        body: JSON.stringify({
          notes: 'Approved by admin via dashboard',
        }),
      });

      if (data.approved) {
        setApprovalMessage('✅ Herramientas aprobadas exitosamente');
      } else {
        setApprovalMessage(`❌ ${data.message}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error approving tools');
    } finally {
      setApproving(false);
    }
  };

  const handleRunTests = async () => {
    try {
      setTesting(true);
      setError(null);

      const data = await fetchApi<any>('/tools-admin/test-tools');
      setTestResults(data);
    } catch (err: any) {
      setError(err.message || 'Error running tests');
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    loadHealthData();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--salvia)' }} />
          <p>Cargando estado de herramientas...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK':
        return <CheckCircle size={20} style={{ color: '#22c55e' }} />;
      case 'DEGRADED':
        return <AlertTriangle size={20} style={{ color: '#eab308' }} />;
      case 'ERROR':
        return <AlertCircle size={20} style={{ color: '#ef4444' }} />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OK':
        return { ...styles.statusBadge, ...styles.statusOK };
      case 'DEGRADED':
        return { ...styles.statusBadge, ...styles.statusDegraded };
      case 'ERROR':
        return { ...styles.statusBadge, ...styles.statusError };
      default:
        return styles.statusBadge;
    }
  };

  const getCardStyle = (status: string) => {
    switch (status) {
      case 'OK':
        return { ...styles.healthCard, ...styles.healthCardOK };
      case 'DEGRADED':
        return { ...styles.healthCard, ...styles.healthCardDegraded };
      case 'ERROR':
        return { ...styles.healthCard, ...styles.healthCardError };
      default:
        return styles.healthCard;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🛠️ Panel de Administración - Herramientas Phase 2</h1>
        <p style={styles.subtitle}>Verificación y aprobación del status de las herramientas de análisis</p>
      </div>

      {/* Controls */}
      <div style={styles.controlsSection}>
        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={loadHealthData}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>

        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={handleRunTests}
          disabled={testing}
        >
          {testing ? (
            <>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Ejecutando tests...
            </>
          ) : (
            <>
              <CheckCheck size={16} />
              Ejecutar Tests en Vivo
            </>
          )}
        </button>

        <button
          style={{ ...styles.button, ...styles.approveButton }}
          onClick={handleApproveTools}
          disabled={approving || health?.overallStatus === 'DOWN'}
        >
          {approving ? (
            <>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Aprobando...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              Aprobar Herramientas
            </>
          )}
        </button>
      </div>

      {/* Overall Status */}
      {health && (
        <div
          style={{
            ...styles.overallStatus,
            ...(health.overallStatus === 'DOWN' ? styles.overallStatusDown : {}),
            ...(health.overallStatus === 'DEGRADED' ? styles.overallStatusDegraded : {}),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            {getStatusIcon(health.overallStatus === 'HEALTHY' ? 'OK' : health.overallStatus === 'DEGRADED' ? 'DEGRADED' : 'ERROR')}
            <div>
              <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>
                Estado General: <span style={getStatusStyle(health.overallStatus === 'HEALTHY' ? 'OK' : health.overallStatus === 'DEGRADED' ? 'DEGRADED' : 'ERROR')}>{health.overallStatus}</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                Verificación realizada: {new Date(health.timestamp).toLocaleString('es-ES')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', color: '#991b1b' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Approval Message */}
      {approvalMessage && (
        <div
          style={{
            backgroundColor: approvalMessage.startsWith('✅') ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${approvalMessage.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            color: approvalMessage.startsWith('✅') ? '#166534' : '#991b1b',
          }}
        >
          {approvalMessage}
        </div>
      )}

      {/* Health Check Cards */}
      {health && (
        <>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--grafito)' }}>
            ✓ Estado de Servicios
          </h2>
          <div style={styles.healthGrid}>
            {Object.entries(health.tools).map(([key, tool]) => (
              <div key={key} style={getCardStyle(tool.status)}>
                <div style={styles.toolName}>
                  {getStatusIcon(tool.status)}
                  {tool.name}
                </div>
                <span style={getStatusStyle(tool.status)}>{tool.status}</span>
                <div style={styles.message}>{tool.message}</div>
                {tool.responseTime && <div style={styles.responseTime}>Tiempo de respuesta: {tool.responseTime}ms</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Statistics */}
      {statistics && (
        <>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--grafito)' }}>
            📊 Estadísticas
          </h2>
          <div style={styles.statisticsSection}>
            <div style={styles.statisticsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Transcripciones Completadas</div>
                <div style={styles.statValue}>{statistics.transcriptions.completed}</div>
                <div style={styles.statProgress}>
                  <div
                    style={{
                      ...styles.statProgressBar,
                      width: `${statistics.transcriptions.successRate}%`,
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                  Tasa de éxito: {statistics.transcriptions.successRate}%
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>Análisis Realizados</div>
                <div style={styles.statValue}>{statistics.analyses.total}</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '1rem' }}>
                  Total de análisis generados
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>Documentos en Base de Conocimiento</div>
                <div style={styles.statValue}>{statistics.knowledgeBase.documentsIndexed}</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '1rem' }}>
                  Documentos legales indexados
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Test Results */}
      {testResults && (
        <>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--grafito)' }}>
            🧪 Resultados de Tests
          </h2>
          <div style={styles.testResultsSection}>
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Resumen: {testResults.summary.passed}/{testResults.summary.totalTests} tests pasados ({testResults.summary.successRate}%)
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {testResults.summary.allPassed ? '✅ Todos los tests pasaron exitosamente' : '⚠️ Algunos tests fallaron'}
              </div>
            </div>

            {Object.entries(testResults.tests)
              .filter(([key]) => key.endsWith('_status'))
              .map(([key, status]) => (
                <div
                  key={key}
                  style={{
                    ...styles.testResult,
                    ...(status === 'PASSED' ? styles.testPassed : styles.testFailed),
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {status === 'PASSED' ? (
                      <CheckCircle size={16} style={{ color: '#22c55e' }} />
                    ) : (
                      <AlertCircle size={16} style={{ color: '#ef4444' }} />
                    )}
                    <strong>{key.replace('_status', '').toUpperCase()}</strong>: {String(status)}
                  </div>
                  {testResults.tests[`${key.replace('_status', '')}`] && (
                    <div style={{ marginLeft: '1.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
                      {JSON.stringify(testResults.tests[`${key.replace('_status', '')}`], null, 2)}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </>
      )}

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
