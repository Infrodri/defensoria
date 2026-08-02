'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface Deadline {
  id: string;
  milestone: string;
  calculatedDate: string;
  daysRemaining: number;
  status: 'EN_TIEMPO' | 'PROXIMO' | 'VENCIDO';
  urgency: 'BAJA' | 'MEDIA' | 'ALTA';
  alertLevel: 'VERDE' | 'AMARILLO' | 'ROJO';
  relatedLaws: string[];
}

interface ProcessualDeadlinesProps {
  caseId: string;
  deadlines: Deadline[];
}

const getStatusIcon = (status: 'EN_TIEMPO' | 'PROXIMO' | 'VENCIDO') => {
  switch (status) {
    case 'EN_TIEMPO':
      return '✓';
    case 'PROXIMO':
      return '⚠️';
    case 'VENCIDO':
      return '❌';
  }
};

const getAlertColor = (alertLevel: 'VERDE' | 'AMARILLO' | 'ROJO') => {
  switch (alertLevel) {
    case 'VERDE':
      return 'var(--salvia)';
    case 'AMARILLO':
      return 'var(--amarillo)';
    case 'ROJO':
      return 'var(--rojo)';
  }
};

export const ProcessualDeadlines: React.FC<ProcessualDeadlinesProps> = ({ caseId, deadlines }) => {
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
          Plazos Procesales
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--grafito)',
          }}
        >
          Timeline de Hitos Legales
        </h3>
      </div>

      {/* Timeline */}
      {deadlines.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--grafito)',
            opacity: 0.6,
          }}
        >
          Sin plazos registrados
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            position: 'relative',
          }}
        >
          {deadlines.map((deadline, idx) => {
            const alertColor = getAlertColor(deadline.alertLevel);
            const statusIcon = getStatusIcon(deadline.status);
            const isLast = idx === deadlines.length - 1;

            return (
              <div
                key={deadline.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  position: 'relative',
                  paddingBottom: isLast ? '0' : '1.5rem',
                }}
              >
                {/* Connecting Line */}
                {!isLast && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '15px',
                      top: '40px',
                      width: '2px',
                      height: 'calc(100% + 0.5rem)',
                      backgroundColor: alertColor,
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Circle Badge */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: alertColor,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 2,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: `2px solid ${alertColor}`,
                  }}
                >
                  {statusIcon}
                </div>

                {/* Content */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    flex: 1,
                    paddingTop: '2px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: 'var(--grafito)',
                        }}
                      >
                        {deadline.milestone}
                      </h4>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--grafito)',
                          opacity: 0.7,
                        }}
                      >
                        {new Date(deadline.calculatedDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        alignItems: 'flex-end',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: alertColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {deadline.status === 'EN_TIEMPO' && 'En Tiempo'}
                        {deadline.status === 'PROXIMO' && 'Próximo'}
                        {deadline.status === 'VENCIDO' && 'Vencido'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--grafito)',
                          opacity: 0.6,
                        }}
                      >
                        {deadline.daysRemaining >= 0 ? `${deadline.daysRemaining} días` : 'Vencido'}
                      </span>
                    </div>
                  </div>

                  {/* Related Laws */}
                  {deadline.relatedLaws.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      {deadline.relatedLaws.map((law, lawIdx) => (
                        <span
                          key={lawIdx}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: 'var(--bosque-profundo)',
                            backgroundColor: 'rgba(73, 180, 142, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '3px',
                            border: `1px solid rgba(73, 180, 142, 0.3)`,
                          }}
                        >
                          {law}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
