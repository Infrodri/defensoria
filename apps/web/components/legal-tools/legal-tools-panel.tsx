'use client';

import React, { useState } from 'react';
import { DiscrepancyAnalysis } from './discrepancy-analysis';
import { PenalTypicality } from './penal-typicality';
import { ProcessualDeadlines } from './processual-deadlines';

interface Discrepancy {
  category: string;
  severity: 'BAJA' | 'MEDIA' | 'ALTA';
  currentStatement: string;
  previousStatement: string;
  implications: string;
  suggestedQuestion: string;
}

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

type TabType = 'discrepancies' | 'typicality' | 'deadlines';

interface LegalToolsPanelProps {
  caseId: string;
  discrepancyAnalysis?: {
    analysisId: string;
    discrepancies: Discrepancy[];
    consistencyScore: number;
    riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
    recommendation: string;
    analyzedAt: string;
    analyzedBy: string;
  };
  penalTypicality?: {
    analysisId: string;
    potentialCrimes: Crime[];
    primaryCrime: Crime;
    secondaryCrimes: Crime[];
    evidenceGaps: string[];
    investigationPath: string;
    analyzedAt: string;
    analyzedBy: string;
  };
  processualDeadlines?: {
    deadlines: Deadline[];
  };
}

export const LegalToolsPanel: React.FC<LegalToolsPanelProps> = ({
  caseId,
  discrepancyAnalysis,
  penalTypicality,
  processualDeadlines,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('discrepancies');

  const tabs: Array<{ id: TabType; label: string; available: boolean }> = [
    { id: 'discrepancies', label: 'Discrepancias', available: !!discrepancyAnalysis },
    { id: 'typicality', label: 'Tipicidad Penal', available: !!penalTypicality },
    { id: 'deadlines', label: 'Plazos Procesales', available: !!processualDeadlines },
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
          Herramientas Legales
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
          Herramientas Legales
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--grafito)',
          }}
        >
          Análisis Legal del Caso
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
        {activeTab === 'discrepancies' && discrepancyAnalysis && (
          <DiscrepancyAnalysis
            caseId={caseId}
            analysisId={discrepancyAnalysis.analysisId}
            discrepancies={discrepancyAnalysis.discrepancies}
            consistencyScore={discrepancyAnalysis.consistencyScore}
            riskLevel={discrepancyAnalysis.riskLevel}
            recommendation={discrepancyAnalysis.recommendation}
            analyzedAt={discrepancyAnalysis.analyzedAt}
            analyzedBy={discrepancyAnalysis.analyzedBy}
          />
        )}

        {activeTab === 'typicality' && penalTypicality && (
          <PenalTypicality
            caseId={caseId}
            analysisId={penalTypicality.analysisId}
            potentialCrimes={penalTypicality.potentialCrimes}
            primaryCrime={penalTypicality.primaryCrime}
            secondaryCrimes={penalTypicality.secondaryCrimes}
            evidenceGaps={penalTypicality.evidenceGaps}
            investigationPath={penalTypicality.investigationPath}
            analyzedAt={penalTypicality.analyzedAt}
            analyzedBy={penalTypicality.analyzedBy}
          />
        )}

        {activeTab === 'deadlines' && processualDeadlines && (
          <ProcessualDeadlines caseId={caseId} deadlines={processualDeadlines.deadlines} />
        )}
      </div>
    </div>
  );
};
