'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface CrimeElement {
  element: string;
  present: boolean;
  evidence?: string;
}

interface Crime {
  id: string;
  name: string;
  likelihood: number;
  elements: CrimeElement[];
  requiredProof: string[];
}

interface PenalTypicalityProps {
  caseId: string;
  analysisId: string;
  typicalCrimes: Crime[];
  primaryCrime: Crime;
  secondaryCrimes: Crime[];
  evidenceGaps: string[];
  investigationPath: string;
  analyzedAt: string;
  analyzedBy: string;
}

export const PenalTypicality: React.FC<PenalTypicalityProps> = ({
  caseId,
  analysisId,
  typicalCrimes,
  primaryCrime,
  secondaryCrimes,
  evidenceGaps,
  investigationPath,
  analyzedAt,
  analyzedBy,
}) => {
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
          Análisis de Tipicidad Penal
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--grafito)',
          }}
        >
          {primaryCrime.name}
        </h3>
      </div>

      {/* Primary Crime Card */}
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: 'rgba(73, 180, 142, 0.1)',
          borderRadius: '8px',
          border: `2px solid var(--salvia)`,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
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
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--grafito)',
            }}
          >
            Delito Principal
          </span>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--salvia)',
              backgroundColor: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              border: `1px solid var(--salvia)`,
            }}
          >
            {primaryCrime.likelihood}% certeza
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {primaryCrime.elements.map((elem, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              {elem.present ? (
                <CheckCircle2 size={18} style={{ color: 'var(--salvia)', flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <XCircle size={18} style={{ color: 'var(--rojo)', flexShrink: 0, marginTop: '2px' }} />
              )}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--grafito)',
                  }}
                >
                  {elem.element}
                </span>
                {elem.evidence && (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--grafito)',
                      opacity: 0.7,
                    }}
                  >
                    {elem.evidence}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
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
            Pruebas Requeridas:
          </span>
          <ul
            style={{
              margin: 0,
              paddingLeft: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            {primaryCrime.requiredProof.map((proof, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--grafito)',
                }}
              >
                {proof}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Secondary Crimes */}
      {secondaryCrimes.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--grafito)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Delitos Secundarios
          </span>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
            }}
          >
            {secondaryCrimes.map((crime) => (
              <div
                key={crime.id}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--papel)',
                  borderRadius: '6px',
                  border: `1px solid var(--border)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
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
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--grafito)',
                    }}
                  >
                    {crime.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--amarillo)',
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      padding: '2px 8px',
                      borderRadius: '3px',
                    }}
                  >
                    {crime.likelihood}%
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {crime.elements.slice(0, 3).map((elem, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                      }}
                    >
                      {elem.present ? (
                        <CheckCircle2 size={14} style={{ color: 'var(--salvia)', flexShrink: 0 }} />
                      ) : (
                        <XCircle size={14} style={{ color: 'var(--rojo)', flexShrink: 0 }} />
                      )}
                      <span style={{ color: 'var(--grafito)' }}>{elem.element}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Gaps */}
      {evidenceGaps.length > 0 && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(244, 67, 54, 0.08)',
            borderLeft: `4px solid var(--rojo)`,
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={20} style={{ color: 'var(--rojo)', flexShrink: 0 }} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
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
                Brechas de Evidencia
              </span>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                }}
              >
                {evidenceGaps.map((gap, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--grafito)',
                    }}
                  >
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Investigation Path */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--papel)',
          borderRadius: '6px',
          border: `1px solid var(--border)`,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--grafito)',
          }}
        >
          Ruta de Investigación Recomendada
        </span>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--grafito)',
            lineHeight: 1.6,
          }}
        >
          {investigationPath}
        </p>
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
