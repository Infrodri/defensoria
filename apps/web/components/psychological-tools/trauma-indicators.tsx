'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface Indicator {
  id: string;
  name: string;
  severity: 'BAJA' | 'MEDIA' | 'ALTA';
  description: string;
  evidence?: string;
}

interface TraumaIndicatorsProps {
  caseId: string;
  analysisId: string;
  traumaLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  indicators: Indicator[];
  overallScore: number;
  recommendation: string;
  analyzedAt: string;
  analyzedBy: string;
}

const getSeverityColor = (severity: 'BAJA' | 'MEDIA' | 'ALTA') => {
  switch (severity) {
    case 'BAJA':
      return 'var(--salvia)';
    case 'MEDIA':
      return 'var(--amarillo)';
    case 'ALTA':
      return 'var(--rojo)';
  }
};

const getSeverityIcon = (severity: 'BAJA' | 'MEDIA' | 'ALTA') => {
  switch (severity) {
    case 'BAJA':
      return CheckCircle2;
    case 'MEDIA':
      return AlertTriangle;
    case 'ALTA':
      return XCircle;
  }
};

const getScoreColor = (score: number) => {
  if (score < 33) return 'var(--salvia)';
  if (score < 66) return 'var(--amarillo)';
  return 'var(--rojo)';
};

export const TraumaIndicators: React.FC<TraumaIndicatorsProps> = ({
  caseId,
  analysisId,
  traumaLevel,
  indicators,
  overallScore,
  recommendation,
  analyzedAt,
  analyzedBy,
}) => {
  const traumaLevelColor =
    traumaLevel === 'BAJO' ? 'var(--salvia)' : traumaLevel === 'MEDIO' ? 'var(--amarillo)' : 'var(--rojo)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1.5rem',
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--salvia)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Evaluación de Trauma
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--grafito)',
          }}
        >
          Indicadores de Trauma
        </h3>
      </div>

      {/* Score Circle */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.5rem',
          backgroundColor: 'var(--papel)',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: `8px solid ${getScoreColor(overallScore)}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            boxShadow: `0 0 0 4px ${getScoreColor(overallScore)}40`,
          }}
        >
          <span
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: getScoreColor(overallScore),
            }}
          >
            {overallScore}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--grafito)',
              opacity: 0.6,
            }}
          >
            /100
          </span>
        </div>

        <div
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--grafito)',
            }}
          >
            Nivel de Trauma
          </span>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: traumaLevelColor,
              textTransform: 'uppercase',
            }}
          >
            {traumaLevel}
          </span>
        </div>
      </div>

      {/* Recommendation Box */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'rgba(73, 180, 142, 0.08)',
          borderLeft: `4px solid var(--salvia)`,
          borderRadius: '4px',
          display: 'flex',
          gap: '0.75rem',
        }}
      >
        <AlertCircle size={20} style={{ color: 'var(--salvia)', flexShrink: 0 }} />
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--grafito)',
            lineHeight: 1.5,
          }}
        >
          {recommendation}
        </p>
      </div>

      {/* Indicators List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--grafito)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Indicadores Encontrados: {indicators.length}
        </div>

        {indicators.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--grafito)',
              opacity: 0.6,
            }}
          >
            Sin indicadores detectados
          </div>
        ) : (
          indicators.map((indicator, idx) => {
            const SeverityIcon = getSeverityIcon(indicator.severity);
            const severityColor = getSeverityColor(indicator.severity);

            return (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--papel)',
                  borderRadius: '6px',
                  border: `1px solid ${severityColor}`,
                  borderLeft: `4px solid ${severityColor}`,
                  display: 'flex',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    color: severityColor,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'flex-start',
                    paddingTop: '2px',
                  }}
                >
                  <SeverityIcon size={18} />
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: 'var(--grafito)',
                      }}
                    >
                      {indicator.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: severityColor,
                        textTransform: 'uppercase',
                        backgroundColor: 'rgba(0,0,0,0.03)',
                        padding: '2px 8px',
                        borderRadius: '3px',
                      }}
                    >
                      {indicator.severity}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: 'var(--grafito)',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Descripción:
                      </span>
                      <span style={{ color: 'var(--grafito)', opacity: 0.8 }}>
                        {indicator.description}
                      </span>
                    </div>

                    {indicator.evidence && (
                      <div>
                        <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                          Evidencia:
                        </span>
                        <span style={{ color: 'var(--grafito)', opacity: 0.8 }}>
                          {indicator.evidence}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--grafito)',
          opacity: 0.6,
          borderTop: '1px solid var(--border)',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Analizado por: {analyzedBy}</span>
        <span>{new Date(analyzedAt).toLocaleDateString('es-ES')}</span>
      </div>
    </div>
  );
};
