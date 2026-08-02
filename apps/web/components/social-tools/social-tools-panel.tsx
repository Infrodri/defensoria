'use client';

import React, { useState } from 'react';
import { FamilyStructure } from './family-structure';
import { VulnerabilityAssessment } from './vulnerability-assessment';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  livesWithNNA: boolean;
  socialVulnerabilities?: string[];
}

interface RiskFactor {
  id: string;
  name: string;
  severity: 'BAJA' | 'MEDIA' | 'ALTA';
  description: string;
}

interface SupportProgram {
  id: string;
  name: string;
  type: string;
  availability: string;
}

type TabType = 'family' | 'vulnerability';

interface SocialToolsPanelProps {
  caseId: string;
  familyStructure?: {
    analysisId: string;
    nnaName: string;
    nuclearFamily: FamilyMember[];
    extendedFamily?: FamilyMember[];
    familyDynamics: string;
    vulnerabilities: string[];
    analyzedAt: string;
    analyzedBy: string;
  };
  vulnerabilityAssessment?: {
    analysisId: string;
    vulnerabilityScore: number;
    vulnerabilityLevel: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRÍTICO';
    riskFactors: RiskFactor[];
    supportPrograms: SupportProgram[];
    recommendations: string;
    analyzedAt: string;
    analyzedBy: string;
  };
}

export const SocialToolsPanel: React.FC<SocialToolsPanelProps> = ({
  caseId,
  familyStructure,
  vulnerabilityAssessment,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('family');

  const tabs: Array<{ id: TabType; label: string; available: boolean }> = [
    { id: 'family', label: 'Estructura Familiar', available: !!familyStructure },
    { id: 'vulnerability', label: 'Evaluación de Vulnerabilidad', available: !!vulnerabilityAssessment },
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
          Herramientas Sociales
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
          Herramientas Sociales
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--grafito)',
          }}
        >
          Análisis Social del Caso
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
        {activeTab === 'family' && familyStructure && (
          <FamilyStructure
            caseId={caseId}
            analysisId={familyStructure.analysisId}
            nnaName={familyStructure.nnaName}
            nuclearFamily={familyStructure.nuclearFamily}
            extendedFamily={familyStructure.extendedFamily}
            familyDynamics={familyStructure.familyDynamics}
            vulnerabilities={familyStructure.vulnerabilities}
            analyzedAt={familyStructure.analyzedAt}
            analyzedBy={familyStructure.analyzedBy}
          />
        )}

        {activeTab === 'vulnerability' && vulnerabilityAssessment && (
          <VulnerabilityAssessment
            caseId={caseId}
            analysisId={vulnerabilityAssessment.analysisId}
            vulnerabilityScore={vulnerabilityAssessment.vulnerabilityScore}
            vulnerabilityLevel={vulnerabilityAssessment.vulnerabilityLevel}
            riskFactors={vulnerabilityAssessment.riskFactors}
            supportPrograms={vulnerabilityAssessment.supportPrograms}
            recommendations={vulnerabilityAssessment.recommendations}
            analyzedAt={vulnerabilityAssessment.analyzedAt}
            analyzedBy={vulnerabilityAssessment.analyzedBy}
          />
        )}
      </div>
    </div>
  );
};
