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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        gap: orientation === 'vertical' ? '1.5rem' : '1rem',
        padding: '1.25rem',
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--salvia)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: orientation === 'vertical' ? '0.5rem' : '0' }}>
        Riel de Fase Processal
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: orientation === 'vertical' ? 'column' : 'row',
          gap: '1rem',
          alignItems: orientation === 'vertical' ? 'flex-start' : 'center',
        }}
      >
        {PHASES_CONFIG.map((phase, idx) => {
          const Icon = phase.icon;
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

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
                opacity: isCompleted || isCurrent ? 1 : 0.4,
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
                  flexShrink: 0,
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
