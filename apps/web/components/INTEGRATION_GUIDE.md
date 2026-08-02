# Guía de Integración - Componentes React

## Cómo Usar los Componentes Creados

Esta guía explica cómo integrar los 11 componentes React en tu aplicación.

---

## 1. Importar los Componentes

### Opción A: Importar el Panel (Recomendado para la mayoría de casos)

```typescript
import { PsychologicalToolsPanel } from '@/components/psychological-tools';
import { SocialToolsPanel } from '@/components/social-tools';
import { TransversalToolsPanel } from '@/components/transversal-tools';
```

### Opción B: Importar Componentes Individuales

```typescript
import {
  TraumaIndicators,
  RiskScales,
  ClinicalTranslation,
} from '@/components/psychological-tools';

import {
  FamilyStructure,
  VulnerabilityAssessment,
} from '@/components/social-tools';

import {
  UnifiedTimeline,
  AnonymizedReport,
} from '@/components/transversal-tools';
```

---

## 2. Usar el Panel de Herramientas Psicológicas

```typescript
'use client';

import React from 'react';
import { PsychologicalToolsPanel } from '@/components/psychological-tools';

export default function CaseDetailPage({ caseId }: { caseId: string }) {
  // Obtener datos de tu API
  const traumaData = {
    analysisId: 'analysis-123',
    traumaLevel: 'ALTO',
    indicators: [
      {
        id: 'ind-1',
        name: 'Pesadillas recurrentes',
        severity: 'ALTA',
        description: 'El NNA reporta pesadillas diarias',
        evidence: 'Entrevista inicial',
      },
      // ... más indicadores
    ],
    overallScore: 78,
    recommendation: 'Se recomienda seguimiento psicológico inmediato',
    analyzedAt: new Date().toISOString(),
    analyzedBy: 'Dr. Juan Pérez',
  };

  return (
    <div>
      <h1>Caso #{caseId}</h1>
      <PsychologicalToolsPanel
        caseId={caseId}
        traumaIndicators={traumaData}
        // riskScales={riskScalesData}
        // clinicalTranslations={translationsData}
      />
    </div>
  );
}
```

---

## 3. Usar Componentes Individuales

### 3.1 TraumaIndicators

```typescript
<TraumaIndicators
  caseId={caseId}
  analysisId="analysis-123"
  traumaLevel="ALTO"
  indicators={indicatorsArray}
  overallScore={75}
  recommendation="Se recomienda intervención urgente"
  analyzedAt={new Date().toISOString()}
  analyzedBy="Psicólogo"
/>
```

### 3.2 RiskScales

```typescript
<RiskScales
  caseId={caseId}
  analysisId="analysis-123"
  scales={[
    {
      id: 'pcl',
      name: 'PCL-5 (Trastorno de Estrés Post-traumático)',
      score: 45,
      maxScore: 80,
      interpretation: 'ALTO',
      subscales: [
        { id: 'sub1', name: 'Re-experimentación', score: 15, maxScore: 20 },
        { id: 'sub2', name: 'Evitación', score: 14, maxScore: 16 },
        { id: 'sub3', name: 'Arousal', score: 16, maxScore: 24 },
      ],
    },
  ]}
  overallClinicalRisk="ALTO"
  analyzedAt={new Date().toISOString()}
  analyzedBy="Dr. Ana"
/>
```

### 3.3 FamilyStructure

```typescript
<FamilyStructure
  caseId={caseId}
  analysisId="analysis-456"
  nnaName="Carlos"
  nuclearFamily={[
    {
      id: 'm1',
      name: 'María',
      relationship: 'Madre',
      age: 38,
      livesWithNNA: true,
    },
    {
      id: 'm2',
      name: 'Juan',
      relationship: 'Padre',
      age: 40,
      livesWithNNA: false,
    },
  ]}
  familyDynamics="Familia con conflictividad media. Madre es cuidadora primaria."
  vulnerabilities={['Pobreza', 'Vivienda precaria', 'Bajo acceso a educación']}
  analyzedAt={new Date().toISOString()}
  analyzedBy="Trabajadora Social"
/>
```

### 3.4 VulnerabilityAssessment

```typescript
<VulnerabilityAssessment
  caseId={caseId}
  analysisId="analysis-456"
  vulnerabilityScore={72}
  vulnerabilityLevel="ALTO"
  riskFactors={[
    {
      id: 'rf1',
      name: 'Exposición a violencia doméstica',
      severity: 'ALTA',
      description: 'Presencia de conflictividad frecuente entre progenitores',
    },
  ]}
  supportPrograms={[
    { id: 'sp1', name: 'Programa Familias Fuertes', type: 'Intervención', availability: 'Disponible' },
  ]}
  recommendations="Se recomienda derivación urgente a servicios de protección"
  analyzedAt={new Date().toISOString()}
  analyzedBy="Coordinador"
/>
```

### 3.5 UnifiedTimeline

```typescript
<UnifiedTimeline
  caseId={caseId}
  events={[
    {
      id: 'evt1',
      date: '2024-01-15',
      title: 'Denuncia inicial',
      description: 'Se recibe denuncia por negligencia parental',
      type: 'legal',
      documentId: 'doc-001',
    },
    {
      id: 'evt2',
      date: '2024-01-20',
      title: 'Evaluación psicológica',
      description: 'Realización de evaluación inicial',
      type: 'psychological',
      metadata: { evaluador: 'Dr. López', resultado: 'Confirmado' },
    },
  ]}
  analyzedAt={new Date().toISOString()}
/>
```

### 3.6 AnonymizedReport

```typescript
<AnonymizedReport
  caseId={caseId}
  reportId="rep-001"
  reportContent="El menor Carlos M. G., identificado como...\n[Contenido anonimizado del reporte]"
  anonymizationRules={[
    { id: 'r1', original: 'Carlos Miguel García', replacement: '[NOMBRE_NNA]', occurrences: 5 },
    { id: 'r2', original: 'María García', replacement: '[NOMBRE_MADRE]', occurrences: 3 },
  ]}
  confidentialityLevel="ALTAMENTE_CONFIDENCIAL"
  generatedAt={new Date().toISOString()}
  generatedBy="Dr. Rodríguez"
/>
```

---

## 4. Estructura de Datos Esperada

### TraumaIndicators Data

```typescript
interface Indicator {
  id: string;
  name: string;
  severity: 'BAJA' | 'MEDIA' | 'ALTA';
  description: string;
  evidence?: string;
}

interface TraumaData {
  analysisId: string;
  traumaLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  indicators: Indicator[];
  overallScore: number; // 0-100
  recommendation: string;
  analyzedAt: string; // ISO date
  analyzedBy: string;
}
```

### RiskScales Data

```typescript
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

interface RiskScalesData {
  analysisId: string;
  scales: Scale[];
  overallClinicalRisk: 'BAJO' | 'MEDIO' | 'ALTO';
  analyzedAt: string;
  analyzedBy: string;
}
```

### FamilyStructure Data

```typescript
interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  livesWithNNA: boolean;
  socialVulnerabilities?: string[];
}

interface FamilyStructureData {
  analysisId: string;
  nnaName: string;
  nuclearFamily: FamilyMember[];
  extendedFamily?: FamilyMember[];
  familyDynamics: string;
  vulnerabilities: string[];
  analyzedAt: string;
  analyzedBy: string;
}
```

---

## 5. Integración con Layout Existente

### Dentro de una página de caso

```typescript
'use client';

import React from 'react';
import { PsychologicalToolsPanel, SocialToolsPanel, TransversalToolsPanel } from '@/components';

export default function CaseAnalysisPage({ params }: { params: { caseId: string } }) {
  const { caseId } = params;

  // Obtener datos del API
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    // fetch(`/api/cases/${caseId}/analysis`)
    //   .then(res => res.json())
    //   .then(setData);
  }, [caseId]);

  return (
    <main
      style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <h1>Análisis Integral del Caso</h1>

      {/* Herramientas Psicológicas */}
      <section style={{ marginBottom: '3rem' }}>
        <PsychologicalToolsPanel
          caseId={caseId}
          traumaIndicators={data?.psychological?.trauma}
          riskScales={data?.psychological?.scales}
          clinicalTranslations={data?.psychological?.translations}
        />
      </section>

      {/* Herramientas Sociales */}
      <section style={{ marginBottom: '3rem' }}>
        <SocialToolsPanel
          caseId={caseId}
          familyStructure={data?.social?.family}
          vulnerabilityAssessment={data?.social?.vulnerability}
        />
      </section>

      {/* Herramientas Transversales */}
      <section>
        <TransversalToolsPanel
          caseId={caseId}
          unifiedTimeline={data?.transversal?.timeline}
          anonymizedReport={data?.transversal?.report}
        />
      </section>
    </main>
  );
}
```

---

## 6. Manejo de Estados Vacíos

Todos los componentes panel tienen manejo integrado para datos vacíos:

```typescript
// Si no hay datos, muestra un placeholder
<PsychologicalToolsPanel
  caseId={caseId}
  // No pasar traumaIndicators, riskScales, clinicalTranslations
/>

// Output: "No hay análisis disponibles para este caso en este momento."
```

---

## 7. Personalización de Estilos

Los componentes usan CSS inline con variables CSS del tema. Para personalizar:

### En tu archivo de estilos global:

```css
:root {
  --salvia: #49b48e;
  --amarillo: #f4c430;
  --rojo: #e74c3c;
  --azul: #3498db;
  --grafito: #2c3e50;
  --papel: #f8f9fa;
  --border: #e1e8ed;
  --card: #ffffff;
  --bosque-profundo: #1a5a3f;
  --radius: 8px;
}
```

---

## 8. Renderizado Condicional

```typescript
{data?.psychological && (
  <PsychologicalToolsPanel
    caseId={caseId}
    traumaIndicators={data.psychological.trauma}
  />
)}

{data?.social && (
  <SocialToolsPanel
    caseId={caseId}
    familyStructure={data.social.family}
  />
)}
```

---

## 9. Patrón de Carga (Loading)

```typescript
import { Skeleton } from '@/components/common'; // Si tienes Skeleton

const [loading, setLoading] = React.useState(true);

React.useEffect(() => {
  fetch(`/api/cases/${caseId}/analysis`)
    .then(res => res.json())
    .then(data => {
      setData(data);
      setLoading(false);
    });
}, [caseId]);

return (
  <>
    {loading ? (
      <Skeleton width="100%" height={400} />
    ) : (
      <PsychologicalToolsPanel {...data} />
    )}
  </>
);
```

---

## 10. Tipos TypeScript Globales (Opcional)

Puedes crear un archivo de tipos global:

```typescript
// types/analysis.ts

export interface TraumaAnalysis {
  analysisId: string;
  traumaLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  indicators: Indicator[];
  overallScore: number;
  recommendation: string;
  analyzedAt: string;
  analyzedBy: string;
}

export interface CaseAnalysis {
  psychological?: {
    trauma?: TraumaAnalysis;
    scales?: RiskScalesAnalysis;
    translations?: ClinicalTranslationData;
  };
  social?: {
    family?: FamilyStructureData;
    vulnerability?: VulnerabilityData;
  };
  transversal?: {
    timeline?: TimelineData;
    report?: ReportData;
  };
}
```

---

## Próximos Pasos

1. **Conectar API endpoints** - Modificar fetch calls
2. **Agregar error boundaries** - Manejar errores
3. **Implementar lazy loading** - Si hay muchos eventos en timeline
4. **Crear historias Storybook** - Para documentación visual
5. **Testing** - Escribir tests unitarios con Jest/React Testing Library

---

## Soporte

Si encuentras problemas:

1. Verifica que los datos coincidan con las interfaces esperadas
2. Asegúrate de que todas las props requeridas estén presentes
3. Revisa la consola del navegador para errores TypeScript
4. Valida que los CSS variables del tema estén definidos

---

_Última actualización: 2024_
