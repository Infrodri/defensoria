'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Subscale {
  id: string;
  name: string;
  score: number;
  maxScore: number;
}

interface Scale {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  interpretation: 'BAJO' | 'MEDIO' | 'ALTO';
  subscales?: Subscale[];
}

interface RiskScalesProps {
  caseId: string;
  analysisId: string;
  scales: Scale[];
  overallClinicalRisk: 'BAJO' | 'MEDIO' | 'ALTO';
  analyzedAt: string;
  analyzedBy: string;
}

const getInterpretationColor = (interpretation: 'BAJO' | 'MEDIO' | 'ALTO') => {
  switch (interpretation) {
    case 'BAJO':
      return 'var(--salvia)';
    case 'MEDIO':
      return 'var(--amarillo)';
    case 'ALTO':
      return 'var(--rojo)';
  }
};

export const RiskScales: React.FC<RiskScalesProps> = ({
  caseId,
  analysisId,
  scales,
  overallClinicalRisk,
  analyzedAt,
  analyzedBy,
}) => {
  const [expandedScales, setExpandedScales] = useState<Set<string>>(new Set());

  const toggleScale = (scaleId: string) => {
    const newExpanded = new Set(expandedScales);
    if (newExpanded.has(scaleId)) {
      newExpanded.delete(scaleId);
    } else {
      newExpanded.add(scaleId);
    }
    setExpandedScales(newExpanded);
  };

  const riskColor =
    overallClinicalRisk === 'BAJO'
      ? 'var(--salvia)'
      : overallClinicalRisk === 'MEDIO'
        ? 'var(--amarillo)'
        : 'var(--rojo)';

  const getScorePercentage = (score: number, maxScore: number) => Math.round((score / maxScore) * 100);

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
          Escalas de Riesgo Clínico
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--grafito)',
          }}
        >
          Evaluación Multidimensional
        </h3>
      </div>

      {/* Overall Risk */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--papel)',
          borderRadius: '6px',
          border: `1px solid ${riskColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--grafito)',
          }}
        >
          Riesgo Clínico General
        </span>
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: riskColor,
            textTransform: 'uppercase',
            backgroundColor: 'rgba(0,0,0,0.03)',
            padding: '4px 12px',
            borderRadius: '4px',
          }}
        >
          {overallClinicalRisk}
        </span>
      </div>

      {/* Scales Grid */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {scales.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--grafito)',
              opacity: 0.6,
            }}
          >
            Sin escalas disponibles
          </div>
        ) : (
          scales.map((scale) => {
            const percentage = getScorePercentage(scale.score, scale.maxScore);
            const color = getInterpretationColor(scale.interpretation);
            const isExpanded = expandedScales.has(scale.id);

            return (
              <div
                key={scale.id}
                style={{
                  border: `1px solid var(--border)`,
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--papel)',
                }}
              >
                {/* Scale Header */}
                <button
                  onClick={() => toggleScale(scale.id)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      alignItems: 'flex-start',
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: 'var(--grafito)',
                        }}
                      >
                        {scale.name}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: color,
                          }}
                        >
                          {scale.score}/{scale.maxScore}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: color,
                            textTransform: 'uppercase',
                            backgroundColor: 'rgba(0,0,0,0.03)',
                            padding: '2px 8px',
                            borderRadius: '3px',
                          }}
                        >
                          {scale.interpretation}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${percentage}%`,
                          backgroundColor: color,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  <ChevronDown
                    size={20}
                    style={{
                      color: 'var(--grafito)',
                      opacity: 0.6,
                      marginLeft: '1rem',
                      flexShrink: 0,
                      transition: 'transform 0.2s ease',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {/* Subscales */}
                {isExpanded && scale.subscales && scale.subscales.length > 0 && (
                  <div
                    style={{
                      padding: '1rem',
                      borderTop: '1px solid var(--border)',
                      backgroundColor: 'rgba(0, 0, 0, 0.01)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    {scale.subscales.map((subscale) => {
                      const subPercentage = getScorePercentage(subscale.score, subscale.maxScore);
                      return (
                        <div
                          key={subscale.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                color: 'var(--grafito)',
                              }}
                            >
                              {subscale.name}
                            </span>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--grafito)',
                                opacity: 0.7,
                              }}
                            >
                              {subscale.score}/{subscale.maxScore}
                            </span>
                          </div>

                          <div
                            style={{
                              width: '100%',
                              height: '5px',
                              backgroundColor: 'rgba(0, 0, 0, 0.08)',
                              borderRadius: '2px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${subPercentage}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
