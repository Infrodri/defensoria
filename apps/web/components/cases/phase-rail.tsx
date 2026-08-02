'use client';

import React from 'react';
import { Phase } from '@defensoria/shared';
import { Compass, Search, Clock, Scale, CheckCircle2 } from 'lucide-react';

interface PhaseRailProps {
  currentPhase: Phase;
  orientation?: 'vertical' | 'horizontal';
}

const PHASES_CONFIG = [
  { key: Phase.DERIVACION, label: 'Derivación / Recepción', icon: Compass },
  { key: Phase.EVALUACION, label: 'Evaluación Interdisciplinaria', icon: Search },
  { key: Phase.SEGUIMIENTO, label: 'Plan de Acompañamiento', icon: Clock },
  { key: Phase.JUDICIALIZACION, label: 'Vía Judicial (Si aplica)', icon: Scale },
  { key: Phase.CIERRE, label: 'Cierre de Caso', icon: CheckCircle2 },
];

export function PhaseRail({ currentPhase, orientation = 'vertical' }: PhaseRailProps) {
  const currentIndex = PHASES_CONFIG.findIndex((p) => p.key === currentPhase);

  if (orientation === 'horizontal') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1.25rem 1rem',
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
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
          Riel de Fase Procesal
        </div>

        {/* Stepper Rail Track */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            width: '100%',
            overflowX: 'auto',
            paddingTop: '0.25rem',
            paddingBottom: '0.5rem',
            gap: '0.5rem',
          }}
        >
          {PHASES_CONFIG.map((phase, idx) => {
            const Icon = phase.icon;
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isLast = idx === PHASES_CONFIG.length - 1;

            let badgeBg = 'var(--papel)';
            let badgeColor = 'var(--grafito)';
            let borderColor = 'var(--border)';

            if (isCurrent) {
              badgeBg = 'var(--bosque-profundo)';
              badgeColor = 'white';
              borderColor = 'var(--bosque-profundo)';
            } else if (isCompleted) {
              badgeBg = 'var(--salvia)';
              badgeColor = 'white';
              borderColor = 'var(--salvia)';
            }

            return (
              <div
                key={phase.key}
                style={{
                  display: 'flex',
                  flex: 1,
                  alignItems: 'center',
                  minWidth: '85px',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    zIndex: 2,
                  }}
                >
                  {/* Circle Icon Badge */}
                  <div
                    style={{
                      width: isCurrent ? '36px' : '32px',
                      height: isCurrent ? '36px' : '32px',
                      borderRadius: '50%',
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${borderColor}`,
                      boxShadow: isCurrent ? '0 0 0 4px oklch(0.25 0.08 165 / 0.15)' : 'none',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={isCurrent ? 18 : 15} />
                  </div>

                  {/* Step Label */}
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? 'var(--bosque-profundo)' : 'var(--grafito)',
                      textAlign: 'center',
                      lineHeight: 1.25,
                      opacity: isCompleted || isCurrent ? 1 : 0.5,
                      maxWidth: '90px',
                    }}
                  >
                    {phase.label}
                  </span>
                </div>

                {/* Connecting Track Line */}
                {!isLast && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: 'calc(50% + 18px)',
                      right: 'calc(-50% + 18px)',
                      height: '3px',
                      backgroundColor: idx < currentIndex ? 'var(--salvia)' : 'var(--border)',
                      zIndex: 1,
                      transition: 'background-color 0.3s ease',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical Orientation
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.25rem',
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        width: '100%',
        boxSizing: 'border-box',
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
        Riel de Fase Procesal
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
        {PHASES_CONFIG.map((phase, idx) => {
          const Icon = phase.icon;
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isLast = idx === PHASES_CONFIG.length - 1;

          let badgeBg = 'var(--papel)';
          let badgeColor = 'var(--grafito)';
          let borderColor = 'var(--border)';

          if (isCurrent) {
            badgeBg = 'var(--bosque-profundo)';
            badgeColor = 'white';
            borderColor = 'var(--bosque-profundo)';
          } else if (isCompleted) {
            badgeBg = 'var(--salvia)';
            badgeColor = 'white';
            borderColor = 'var(--salvia)';
          }

          return (
            <div
              key={phase.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                opacity: isCompleted || isCurrent ? 1 : 0.45,
                position: 'relative',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: badgeBg,
                  color: badgeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${borderColor}`,
                  boxShadow: isCurrent ? '0 0 0 4px oklch(0.25 0.08 165 / 0.15)' : 'none',
                  flexShrink: 0,
                  zIndex: 2,
                }}
              >
                <Icon size={16} />
              </div>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--bosque-profundo)' : 'var(--grafito)',
                }}
              >
                {phase.label}
              </span>

              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    top: '32px',
                    left: '15px',
                    width: '2px',
                    height: 'calc(100% + 0.5rem)',
                    backgroundColor: idx < currentIndex ? 'var(--salvia)' : 'var(--border)',
                    zIndex: 1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


