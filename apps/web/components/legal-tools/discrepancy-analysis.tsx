'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface Discrepancy {
  category: string;
  severity: 'BAJA' | 'MEDIA' | 'ALTA';
  currentStatement: string;
  previousStatement: string;
  implications: string;
  suggestedQuestion: string;
}

interface DiscrepancyAnalysisProps {
  caseId: string;
  analysisId: string;
  discrepancies: Discrepancy[];
  consistencyScore: number;
  riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
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

export const DiscrepancyAnalysis: React.FC<DiscrepancyAnalysisProps> = ({
  caseId,
  analysisId,
  discrepancies,
  consistencyScore,
  riskLevel,
  recommendation,
  analyzedAt,
  analyzedBy,
}) => {
  const riskLevelColor = riskLevel === 'BAJO' ? 'var(--salvia)' : riskLevel === 'MEDIO' ? 'var(--amarillo)' : 'var(--rojo)';

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
          Análisis de Discrepancias
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--grafito)',
          }}
        >
          Consistencia Narrativa: {consistencyScore}%
        </h3>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--grafito)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Score de Consistencia</span>
          <span style={{ color: riskLevelColor, fontWeight: 700 }}>{riskLevel}</span>
        </div>

        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'var(--papel)',
            borderRadius: '4px',
            overflow: 'hidden',
            border: `1px solid var(--border)`,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${consistencyScore}%`,
              backgroundColor: riskLevelColor,
              transition: 'width 0.3s ease',
            }}
          />
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

      {/* Discrepancies List */}
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
          Discrepancias Encontradas: {discrepancies.length}
        </div>

        {discrepancies.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--grafito)',
              opacity: 0.6,
            }}
          >
            Sin discrepancias detectadas
          </div>
        ) : (
          discrepancies.map((discrepancy, idx) => {
            const SeverityIcon = getSeverityIcon(discrepancy.severity);
            const severityColor = getSeverityColor(discrepancy.severity);

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
                      {discrepancy.category}
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
                      {discrepancy.severity}
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
                        Declaración Actual:
                      </span>
                      <span style={{ color: 'var(--grafito)', opacity: 0.8 }}>
                        {discrepancy.currentStatement}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Declaración Anterior:
                      </span>
                      <span style={{ color: 'var(--grafito)', opacity: 0.8 }}>
                        {discrepancy.previousStatement}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Implicaciones:
                      </span>
                      <span style={{ color: severityColor, fontWeight: 500 }}>
                        {discrepancy.implications}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Pregunta Sugerida:
                      </span>
                      <span style={{ color: 'var(--bosque-profundo)', fontStyle: 'italic' }}>
                        "{discrepancy.suggestedQuestion}"
                      </span>
                    </div>
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
