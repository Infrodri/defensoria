'use client';

import React, { useState } from 'react';
import { UnifiedTimeline } from './unified-timeline';
import { AnonymizedReport } from './anonymized-report';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'legal' | 'psychological' | 'social' | 'system';
  documentId?: string;
  metadata?: Record<string, string>;
}

interface AnonymizationRule {
  id: string;
  original: string;
  replacement: string;
  occurrences: number;
}

type TabType = 'timeline' | 'report';

interface TransversalToolsPanelProps {
  caseId: string;
  unifiedTimeline?: {
    events: TimelineEvent[];
    analyzedAt?: string;
  };
  anonymizedReport?: {
    reportId: string;
    reportContent: string;
    anonymizationRules: AnonymizationRule[];
    confidentialityLevel: 'PÚBLICO' | 'CONFIDENCIAL' | 'ALTAMENTE_CONFIDENCIAL';
    generatedAt: string;
    generatedBy: string;
  };
}

export const TransversalToolsPanel: React.FC<TransversalToolsPanelProps> = ({
  caseId,
  unifiedTimeline,
  anonymizedReport,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('timeline');

  const tabs: Array<{ id: TabType; label: string; available: boolean }> = [
    { id: 'timeline', label: 'Línea de Tiempo', available: !!unifiedTimeline },
    { id: 'report', label: 'Reporte Anonimizado', available: !!anonymizedReport },
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
          Herramientas Transversales
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
          Herramientas Transversales
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--grafito)',
          }}
        >
          Análisis Integrado del Caso
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
        {activeTab === 'timeline' && unifiedTimeline && (
          <UnifiedTimeline
            caseId={caseId}
            events={unifiedTimeline.events}
            analyzedAt={unifiedTimeline.analyzedAt}
          />
        )}

        {activeTab === 'report' && anonymizedReport && (
          <AnonymizedReport
            caseId={caseId}
            reportId={anonymizedReport.reportId}
            reportContent={anonymizedReport.reportContent}
            anonymizationRules={anonymizedReport.anonymizationRules}
            confidentialityLevel={anonymizedReport.confidentialityLevel}
            generatedAt={anonymizedReport.generatedAt}
            generatedBy={anonymizedReport.generatedBy}
          />
        )}
      </div>
    </div>
  );
};
