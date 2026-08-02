# 🎨 PROMPT PARA FRONTEND - LEGAL TOOLS (Código Simple - Delegable)

**Objetivo**: Crear componentes React para Legal Tools  
**Complejidad**: BAJA (componentes simples, sin lógica compleja)  
**Delegable a**: Modelo barato (supervisado)  
**Estructura**: Copiar patrón de `components/cases/phase-rail.tsx`  

---

## 📋 REQUERIMIENTOS

### 1. CREAR 3 COMPONENTES EN `apps/web/components/legal-tools/`

```
apps/web/components/legal-tools/
├── discrepancy-analysis.tsx      ← Mostrar análisis de discrepancias
├── penal-typicality.tsx          ← Mostrar tipificación penal
├── processual-deadlines.tsx      ← Mostrar semáforo de plazos
└── legal-tools-panel.tsx         ← Panel integrado (opcional)
```

---

## 🎨 COMPONENTE 1: `discrepancy-analysis.tsx`

### Propósito
Mostrar análisis de discrepancias detectadas entre testimonios.

### Props Esperadas
```typescript
interface DiscrepancyAnalysisProps {
  caseId: string;
  analysisId: string;
  discrepancies: Array<{
    category: 'FECHA' | 'LUGAR' | 'NOMBRE_AGRESOR' | 'MECANICA';
    severity: 'BAJA' | 'MEDIA' | 'ALTA';
    currentStatement: string;
    previousStatement: string;
    implications: string;
    suggestedQuestion: string;
  }>;
  consistencyScore: number; // 0-100
  riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  recommendation: string;
  analyzedAt: string; // ISO date
  analyzedBy: string; // nombre del analista
}
```

### UI Layout (Replicar patrón `phase-rail.tsx`)
```
┌─────────────────────────────────────────────────────┐
│ Análisis de Discrepancias                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Puntaje de Consistencia: [████░░░░░] 85%         │
│                                                     │
│  ┌─ DISCREPANCIA 1: FECHA (Severidad: MEDIA)      │
│  │  Actual:  "El hecho ocurrió el 5 de agosto"    │
│  │  Anterior: "El hecho ocurrió el 6 de agosto"   │
│  │  Implicaciones: Podría afectar credibilidad    │
│  │  Recomendación: ¿Puede confirmar exactamente?  │
│  │                                                 │
│  ├─ DISCREPANCIA 2: LUGAR (Severidad: BAJA)      │
│  │  ...                                            │
│  └─ DISCREPANCIA 3: NOMBRE_AGRESOR (ALTA)         │
│     ...                                            │
│                                                     │
│  Recomendación General: Validar fechas exactas... │
│  Analista: [nombre] | Fecha: [ISO]                │
└─────────────────────────────────────────────────────┘
```

### Styling
- Card con borde `var(--border)`
- Discrepancias con colores por severidad:
  - BAJA: `var(--salvia)` (verde)
  - MEDIA: `var(--amarillo)` (amarillo)
  - ALTA: `var(--rojo)` (rojo)
- Progress bar para consistencyScore
- Typo: `fontSize: '0.875rem'` para contenido, `'0.75rem'` para labels

---

## 🎨 COMPONENTE 2: `penal-typicality.tsx`

### Propósito
Mostrar análisis de delitos potenciales y elementos probatorios.

### Props Esperadas
```typescript
interface PenalTypicalityProps {
  caseId: string;
  analysisId: string;
  potentialCrimes: Array<{
    criminalCode: string;           // "Art. 252 CP"
    crimeType: string;              // "Violencia Psicológica"
    likelihood: number;             // 0-100
    elementsPresent: string[];      // ["Amenazas", "Menosprecio"]
    elementsMissing: string[];      // ["Daño comprobado"]
    proofRequired: string[];        // ["Informe psicológico"]
    suggestedEvidence: string[];    // ["WhatsApp evidence"]
  }>;
  primaryCrime: string;
  secondaryCrimes: string[];
  evidenceGaps: string[];
  investigationPath: string;
  analyzedAt: string;
  analyzedBy: string;
}
```

### UI Layout
```
┌────────────────────────────────────────────────────┐
│ Análisis de Tipicidad Penal                        │
├────────────────────────────────────────────────────┤
│                                                    │
│ Delito Principal: Violencia Psicológica           │
│                                                    │
│ ┌─ Art. 252 CP - Violencia Psicológica (85%)     │
│ │  Elementos Presentes:  ✓ Amenazas               │
│ │                        ✓ Menosprecio            │
│ │  Elementos Faltantes:  ✗ Daño comprobado       │
│ │  Pruebas Necesarias:   • Informe psicológico   │
│ │  Evidencias Sugeridas: • WhatsApp evidence     │
│ │                                                 │
│ ├─ Art. 258 CP - Violencia Económica (45%)       │
│ │  ...                                            │
│ │                                                 │
│ └─ Art. 260 CP - Abuso Infantil (35%)           │
│    ...                                            │
│                                                    │
│ Brechas de Evidencia:                             │
│ • Informe psicológico forense                    │
│ • Declaración de testigos                        │
│                                                    │
│ Ruta de Investigación:                            │
│ Solicitar pericia psicológica especializada...   │
└────────────────────────────────────────────────────┘
```

### Styling
- Delito principal destacado (bold, color `var(--bosque-profundo)`)
- Cards para cada delito potencial con % likelihood
- Checkmarks (✓) para elementos presentes (verde)
- Xmarks (✗) para elementos faltantes (rojo)
- Bullets (•) para evidencia sugerida

---

## 🎨 COMPONENTE 3: `processual-deadlines.tsx`

### Propósito
Mostrar semáforo de vencimientos procesales (como `phase-rail.tsx` pero con urgencia).

### Props Esperadas
```typescript
interface ProcessualDeadlinesProps {
  caseId: string;
  deadlines: Array<{
    id: string;
    milestone: string;           // "Audiencia Preliminar"
    calculatedDate: string;      // ISO date
    daysRemaining: number;       // 5, 2, -3
    status: 'EN_TIEMPO' | 'PROXIMO' | 'VENCIDO';
    urgency: number;             // 0-100
    alertLevel: 'VERDE' | 'AMARILLO' | 'ROJO';
    relatedLaws: string[];       // ["Ley 548", "Art. 102"]
  }>;
}
```

### UI Layout (Estilo `phase-rail` vertical)
```
┌──────────────────────────────────────────────────┐
│ Semáforo de Plazos Procesales                    │
├──────────────────────────────────────────────────┤
│                                                  │
│ 🟢 Audiencia Preliminar                         │
│    Vencimiento: 5 Agosto 2026                   │
│    Días Restantes: 5 días                       │
│    Status: EN_TIEMPO ✓                          │
│    Normativa: Ley 548, Art. 102                 │
│    │                                             │
│ 🟡 Sentencia Judicial                           │
│    Vencimiento: 2 Agosto 2026                   │
│    Días Restantes: 2 días                       │
│    Status: PRÓXIMO ⚠️                           │
│    Normativa: Ley 548, Art. 110                 │
│    │                                             │
│ 🔴 Derivación a Fiscalía                        │
│    Vencimiento: 31 Julio 2026                   │
│    Días Restantes: -1 días ⏰ VENCIDO          │
│    Status: VENCIDO ❌                           │
│    Normativa: Código Penal                      │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Styling
- Círculo indicador de color según alertLevel:
  - VERDE: `var(--salvia)`
  - AMARILLO: `var(--amarillo)`
  - ROJO: `var(--rojo)`
- Connecting line (como `phase-rail.tsx`)
- Urgency bar (progress bar)
- Días negativos muestran emoji ⏰
- Status con emoji (✓ EN_TIEMPO, ⚠️ PRÓXIMO, ❌ VENCIDO)

---

## 📍 UBICACIÓN Y ESTRUCTURA

### Crear archivo:
```bash
apps/web/components/legal-tools/legal-tools-panel.tsx
```

### Integrador (combina los 3 componentes):
```typescript
'use client';

import React, { useState } from 'react';
import { DiscrepancyAnalysis } from './discrepancy-analysis';
import { PenalTypicality } from './penal-typicality';
import { ProcessualDeadlines } from './processual-deadlines';

export interface LegalToolsPanelProps {
  caseId: string;
  discrepancyData?: DiscrepancyAnalysisProps;
  typicalityData?: PenalTypicalityProps;
  deadlinesData?: ProcessualDeadlinesProps;
}

export function LegalToolsPanel({
  caseId,
  discrepancyData,
  typicalityData,
  deadlinesData,
}: LegalToolsPanelProps) {
  const [activeTab, setActiveTab] = useState<'discrepancy' | 'typicality' | 'deadlines'>('discrepancy');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        {['Discrepancias', 'Tipicidad Penal', 'Plazos'].map((label, i) => (
          <button
            key={label}
            onClick={() => setActiveTab(['discrepancy', 'typicality', 'deadlines'][i] as any)}
            style={{
              padding: '0.5rem 1rem',
              borderBottom: activeTab === ['discrepancy', 'typicality', 'deadlines'][i] 
                ? '2px solid var(--bosque-profundo)' 
                : 'none',
              color: activeTab === ['discrepancy', 'typicality', 'deadlines'][i] 
                ? 'var(--bosque-profundo)' 
                : 'var(--grafito)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontWeight: activeTab === ['discrepancy', 'typicality', 'deadlines'][i] ? 700 : 500,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div>
        {activeTab === 'discrepancy' && discrepancyData && (
          <DiscrepancyAnalysis {...discrepancyData} />
        )}
        {activeTab === 'typicality' && typicalityData && (
          <PenalTypicality {...typicalityData} />
        )}
        {activeTab === 'deadlines' && deadlinesData && (
          <ProcessualDeadlines {...deadlinesData} />
        )}
      </div>
    </div>
  );
}
```

---

## ✅ CHECKLIST PARA IMPLEMENTAR

```
Componente DiscrepancyAnalysis:
  [ ] Props interface correcta
  [ ] Card con padding/border
  [ ] Progress bar para consistencyScore
  [ ] Lista de discrepancias con colores por severidad
  [ ] Icons para categorías (Calendar, MapPin, User, Repeat)
  [ ] Recomendación final
  [ ] Footer con analista y fecha

Componente PenalTypicality:
  [ ] Props interface correcta
  [ ] Título con delito principal
  [ ] Cards para cada delito potencial
  [ ] % likelihood visualizado
  [ ] Checkmarks/Xmarks para elementos
  [ ] Lista de brechas de evidencia
  [ ] Ruta de investigación

Componente ProcessualDeadlines:
  [ ] Patrón vertical como phase-rail.tsx
  [ ] Círculos de color según alertLevel
  [ ] Connecting lines entre hitos
  [ ] Urgency bar
  [ ] Status con emoji
  [ ] Normativa relacionada

LegalToolsPanel:
  [ ] Tab navigation
  [ ] Cambio dinámico de contenido
  [ ] Styling consistente
  [ ] Props opcionales (si no hay data, muestra placeholder)
```

---

## 🎯 INSTRUCCIONES PARA DELEGADO

### Tareas Específicas
1. **Crear 3 archivos** en `apps/web/components/legal-tools/`
2. **Usar `phase-rail.tsx` como referencia** de styling y estructura
3. **NO hacer lógica compleja**: solo mostrar props → UI
4. **NO hacer llamadas API**: el componente recibe datos por props
5. **Usar variables CSS** (`var(--color)`) del tema existente
6. **TypeScript tipado** (interfaces claras)
7. **Client component**: `'use client'` al inicio

### Patrón a Seguir
```typescript
'use client';

import React from 'react';
import { IconName } from 'lucide-react';

interface ComponentProps {
  // Props claras
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  return (
    <div style={{ /* CSS inline simple */ }}>
      {/* Contenido */}
    </div>
  );
}
```

### Testing Manual
```bash
# Crear story de Storybook (opcional)
# O simplemente:
# 1. npm run dev (en apps/web)
# 2. Navegar a /casos/[id] y agregar <LegalToolsPanel> al layout
# 3. Pasarle props mock
# 4. Verificar rendering
```

---

## 💡 PUNTOS CLAVE

✅ **HACER**:
- Componentes presentacionales (solo UI)
- Replicar styling de `phase-rail.tsx`
- Props tipadas con TypeScript
- CSS inline consistente con tema
- Client components

❌ **NO HACER**:
- Lógica de negocio
- Llamadas API
- State management (hooks mínimos)
- Cambios de arquitectura
- Hardcoding de datos

---

## 📦 ENTREGA ESPERADA

```
apps/web/components/legal-tools/
├── discrepancy-analysis.tsx (200 líneas aprox)
├── penal-typicality.tsx (180 líneas aprox)
├── processual-deadlines.tsx (200 líneas aprox)
└── legal-tools-panel.tsx (120 líneas aprox)

Total: ~700 líneas (código simple, repetitivo, delegable)
```

---

**Este es código SIMPLE, REPETITIVO, SIN LÓGICA COMPLEJA.**  
**PERFECTO para delegar a modelo barato + supervisión.**
