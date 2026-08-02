'use client';

import React, { useState } from 'react';
import { TraumaIndicators } from './trauma-indicators';
import { RiskScales } from './risk-scales';
import { ClinicalTranslation } from './clinical-translation';

interface Indicator {
  id: string;
  name: string;
  severity: 'BAJA' | 'MEDIA' | 'ALTA';
  description: string;
  evidence?: string;
}

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

interface TranslationPair {
  id: string;
  original: string;
  translated: string;
  keyTerms?: string[];
}

type TabType = 'trauma' | 'scales' | 'translation';

interface PsychologicalToolsPanelProps {
  caseId: string;
  traumaIndicators?: {
    analysisId: string;
    traumaLevel: 'BAJO' | 'MEDIO' | 'ALTO';
    indicators: Indicator[];
    overallScore: number;
    recommendation: string;
    analyzedAt: string;
    analyzedBy: string;
  };
  riskScales?: {
    analysisId: string;
    scales: Scale[];
    overallClinicalRisk: 'BAJO' | 'MEDIO' | 'ALTO';
    analyzedAt: string;
    analyzedBy: string;
  };
  clinicalTranslations?: {
    translations: TranslationPair[];
  };
}

export const PsychologicalToolsPanel: React.FC<PsychologicalToolsPanelProps> = ({
  caseId,
  traumaIndicators,
  riskScales,
  clinicalTranslations,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('trauma');

  const tabs: Array<{ id: TabType; label: string; available: boolean }> = [
    { id: 'trauma', label: 'Indicadores de Trauma', available: !!traumaIndicators },
    { id: 'scales', label: 'Escalas de Riesgo', available: !!riskScales },
    { id: 'translation', label: 'Traducción Clínica', available: !!clinicalTranslations },
  ];

  const availableTabs = tabs.filter((tab) => tab.available);

  // If no data available, show placeholder
  if (availableTabs.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem',
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          width: '100%',
          boxSizing: 'border-box',
          textAlign: 'center',
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
          Herramientas Psicológicas
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            color: 'var(--grafito)',
            opacity: 0.6,
          }}
        >
          No hay análisis disponibles para este caso en este momento.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
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
          Herramientas Psicológicas
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--grafito)',
          }}
        >
          Análisis Psicológico del Caso
        </h2>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--border)',
          overflowX: 'auto',
        }}
      >
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--salvia)' : 'var(--grafito)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid var(--salvia)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              opacity: activeTab === tab.id ? 1 : 0.6,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'trauma' && traumaIndicators && (
          <TraumaIndicators
            caseId={caseId}
            analysisId={traumaIndicators.analysisId}
            traumaLevel={traumaIndicators.traumaLevel}
            indicators={traumaIndicators.indicators}
            overallScore={traumaIndicators.overallScore}
            recommendation={traumaIndicators.recommendation}
            analyzedAt={traumaIndicators.analyzedAt}
            analyzedBy={traumaIndicators.analyzedBy}
          />
        )}

        {activeTab === 'scales' && riskScales && (
          <RiskScales
            caseId={caseId}
            analysisId={riskScales.analysisId}
            scales={riskScales.scales}
            overallClinicalRisk={riskScales.overallClinicalRisk}
            analyzedAt={riskScales.analyzedAt}
            analyzedBy={riskScales.analyzedBy}
          />
        )}

        {activeTab === 'translation' && clinicalTranslations && (
          <ClinicalTranslation
            caseId={caseId}
            translations={clinicalTranslations.translations}
          />
        )}
      </div>
    </div>
  );
};
