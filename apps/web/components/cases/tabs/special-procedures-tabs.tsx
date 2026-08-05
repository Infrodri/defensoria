'use client';

import React, { useState } from 'react';
import { ViolenceDigitalTab } from './violence-digital-tab';
import { TrabajoNNATSTab } from './trabajo-nnats-tab';
import { SituacionCalleTab } from './situacion-calle-tab';
import { ViolenciaSexualILETab } from './violencia-sexual-ile-tab';
import { TravelPermissionTab } from './travel-permission-tab';
import { ProtectionMeasuresTab } from './protection-measures-tab';
import { ConciliationTab } from './conciliation-tab';

type TabKey =
  | 'violencia-digital'
  | 'nnats'
  | 'situacion-calle'
  | 'violencia-sexual'
  | 'permiso-viaje'
  | 'medidas-proteccion'
  | 'conciliacion';

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'violencia-digital', label: 'Violencia Digital', emoji: '💻' },
  { key: 'nnats', label: 'Trabajo Adolescente (NNATS)', emoji: '🔧' },
  { key: 'situacion-calle', label: 'Situación de Calle', emoji: '🏙️' },
  { key: 'violencia-sexual', label: 'Violencia Sexual / ILE', emoji: '🛡️' },
  { key: 'permiso-viaje', label: 'Permisos de Viaje', emoji: '✈️' },
  { key: 'medidas-proteccion', label: 'Medidas de Protección', emoji: '🛟' },
  { key: 'conciliacion', label: 'Conciliación', emoji: '🤝' },
];

interface Props {
  caseId: string;
  userRole: string;
}

/**
 * Pestañas de trámites especiales del expediente (Fase 3). Cada pestaña
 * consume los endpoints de Fase 2 vía fetchApi. El guardado usa POST (crear)
 * o PATCH (actualizar) con los paths exactos de los controllers NestJS.
 */
export function SpecialProceduresTabs({ caseId, userRole }: Props) {
  const [active, setActive] = useState<TabKey>('violencia-digital');

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: '0.375rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            style={{
              padding: '0.6rem 0.875rem',
              border: 'none',
              borderBottom: active === t.key ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
              backgroundColor: 'transparent',
              fontWeight: active === t.key ? 700 : 500,
              color: active === t.key ? 'var(--bosque-profundo)' : 'var(--grafito)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              whiteSpace: 'nowrap',
            }}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {active === 'violencia-digital' && <ViolenceDigitalTab caseId={caseId} userRole={userRole} />}
      {active === 'nnats' && <TrabajoNNATSTab caseId={caseId} userRole={userRole} />}
      {active === 'situacion-calle' && <SituacionCalleTab caseId={caseId} userRole={userRole} />}
      {active === 'violencia-sexual' && <ViolenciaSexualILETab caseId={caseId} userRole={userRole} />}
      {active === 'permiso-viaje' && <TravelPermissionTab caseId={caseId} userRole={userRole} />}
      {active === 'medidas-proteccion' && <ProtectionMeasuresTab caseId={caseId} userRole={userRole} />}
      {active === 'conciliacion' && <ConciliationTab caseId={caseId} userRole={userRole} />}
    </div>
  );
}
