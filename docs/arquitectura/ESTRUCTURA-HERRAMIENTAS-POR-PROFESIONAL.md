# 📋 ESTRUCTURA DE HERRAMIENTAS POR PROFESIONAL

**Análisis:** Dónde están las herramientas y a quién le corresponde cada una.

---

## 🏛️ ESTRUCTURA ACTUAL DE MÓDULOS

### Backend (apps/api/src/modules)

```
├── legal-tools/                    # ⚖️ PARA: ABOGADO, JEFATURA
│   ├── legal-tools.controller.ts
│   ├── legal-tools.service.ts
│   └── legal-tools.module.ts
│
├── psychological-tools/            # 🧠 PARA: PSICOLOGO, ABOGADO, JEFATURA
│   ├── psychological-tools.controller.ts
│   ├── psychological-tools.service.ts
│   └── psychological-tools.module.ts
│
├── social-tools/                   # 👥 PARA: SOCIAL, ABOGADO, JEFATURA
│   ├── social-tools.controller.ts
│   ├── social-tools.service.ts
│   └── social-tools.module.ts
│
└── transversal-tools/              # 🔗 PARA: TODOS (Abogado, Psicólogo, Social, Jefatura)
    ├── transversal-tools.controller.ts
    ├── transversal-tools.service.ts
    └── transversal-tools.module.ts
```

### Frontend (apps/web/components)

```
├── legal-tools/                    # 4 componentes
│   ├── LegalToolsPanel.tsx         # Wrapper principal
│   ├── DiscrepancyAnalysis.tsx     # Analizar discrepancias
│   ├── PenalTypicality.tsx         # Tipicidad penal
│   └── ProcessualDeadlines.tsx     # Vencimientos procesales
│
├── psychological-tools/            # 4 componentes
│   ├── PsychologicalToolsPanel.tsx # Wrapper principal
│   ├── TraumaIndicators.tsx        # Indicadores de trauma
│   ├── RiskScales.tsx              # Escalas de riesgo
│   └── ClinicalTranslation.tsx     # Traducción clínica
│
├── social-tools/                   # 3 componentes
│   ├── SocialToolsPanel.tsx        # Wrapper principal
│   ├── FamilyStructure.tsx         # Estructura familiar
│   └── VulnerabilityAssessment.tsx # Evaluación vulnerabilidad
│
└── transversal-tools/              # 3 componentes
    ├── TransversalToolsPanel.tsx   # Wrapper principal
    ├── UnifiedTimeline.tsx         # Línea de tiempo
    └── AnonymizedReport.tsx        # Reporte anonimizado
```

---

## 👥 PERFILES Y HERRAMIENTAS ASIGNADAS

### 1️⃣ ABOGADO (Área Legal)

**Email:** abogado@defensoria.gob.bo
**Rol:** ABOGADO

#### Herramientas Disponibles:
```
✅ LEGAL TOOLS (todas)
   ├─ Análisis de Discrepancias
   ├─ Tipicidad Penal
   └─ Vencimientos Procesales

✅ PSYCHOLOGICAL TOOLS (lectura - para consulta)
   ├─ Indicadores de Trauma (ver)
   ├─ Escalas de Riesgo (ver)
   └─ Traducción Clínica (ver)

✅ SOCIAL TOOLS (lectura - para contexto)
   ├─ Estructura Familiar (ver)
   └─ Evaluación Vulnerabilidad (ver)

✅ TRANSVERSAL TOOLS (todas)
   ├─ Línea de Tiempo Unificada
   └─ Reporte Anonimizado
```

#### Menú Esperado:
```
Panel ABOGADO
├─ ⚖️ Herramientas Legales (Principal)
│  ├─ Análisis de Discrepancias
│  ├─ Tipicidad Penal
│  └─ Plazos Procesales
├─ 🧠 Consulta Psicológica (Referencia)
├─ 👥 Contexto Social (Referencia)
└─ 🔗 Línea de Tiempo (Consulta)
```

---

### 2️⃣ PSICOLOGO (Psicología)

**Email:** psicologo@defensoria.gob.bo
**Rol:** PSICOLOGO

#### Herramientas Disponibles:
```
✅ PSYCHOLOGICAL TOOLS (todas - edición)
   ├─ Indicadores de Trauma (crear/editar)
   ├─ Escalas de Riesgo (crear/editar)
   ├─ Traducción Clínica (crear/editar)
   └─ Análisis de Trauma (crear/editar)

✅ LEGAL TOOLS (lectura - para contexto)
   ├─ Análisis de Discrepancias (ver)
   ├─ Tipicidad Penal (ver)
   └─ Vencimientos Procesales (ver)

✅ SOCIAL TOOLS (lectura - para contexto)
   ├─ Estructura Familiar (ver)
   └─ Evaluación Vulnerabilidad (ver)

✅ TRANSVERSAL TOOLS (todas)
   ├─ Línea de Tiempo Unificada
   └─ Reporte Anonimizado
```

#### Menú Esperado:
```
Panel PSICÓLOGO
├─ 🧠 Herramientas Psicológicas (Principal)
│  ├─ Indicadores de Trauma
│  ├─ Escalas de Riesgo
│  ├─ Traducción Clínica
│  └─ Análisis de Trauma
├─ ⚖️ Contexto Legal (Referencia)
├─ 👥 Estructura Familiar (Referencia)
└─ 🔗 Línea de Tiempo (Consulta)
```

---

### 3️⃣ SOCIAL (Trabajo Social)

**Email:** social@defensoria.gob.bo
**Rol:** SOCIAL

#### Herramientas Disponibles:
```
✅ SOCIAL TOOLS (todas - edición)
   ├─ Estructura Familiar (crear/editar)
   ├─ Evaluación Vulnerabilidad (crear/editar)
   └─ Mapeo Ambiental (crear/editar)

✅ PSYCHOLOGICAL TOOLS (lectura - para contexto)
   ├─ Indicadores de Trauma (ver)
   ├─ Escalas de Riesgo (ver)
   └─ Traducción Clínica (ver)

✅ LEGAL TOOLS (lectura - para contexto)
   ├─ Análisis de Discrepancias (ver)
   ├─ Tipicidad Penal (ver)
   └─ Vencimientos Procesales (ver)

✅ TRANSVERSAL TOOLS (todas)
   ├─ Línea de Tiempo Unificada
   └─ Reporte Anonimizado
```

#### Menú Esperado:
```
Panel TRABAJADOR SOCIAL
├─ 👥 Herramientas Sociales (Principal)
│  ├─ Estructura Familiar
│  ├─ Evaluación Vulnerabilidad
│  └─ Mapeo Ambiental
├─ 🧠 Análisis Psicológico (Referencia)
├─ ⚖️ Contexto Legal (Referencia)
└─ 🔗 Línea de Tiempo (Consulta)
```

---

### 4️⃣ JEFATURA (Jefe de Oficina)

**Email:** jefe@defensoria.gob.bo
**Rol:** JEFATURA

#### Herramientas Disponibles:
```
✅ LEGAL TOOLS (todas)
   ├─ Análisis de Discrepancias
   ├─ Tipicidad Penal
   └─ Vencimientos Procesales

✅ PSYCHOLOGICAL TOOLS (todas)
   ├─ Indicadores de Trauma
   ├─ Escalas de Riesgo
   ├─ Traducción Clínica
   └─ Análisis de Trauma

✅ SOCIAL TOOLS (todas)
   ├─ Estructura Familiar
   ├─ Evaluación Vulnerabilidad
   └─ Mapeo Ambiental

✅ TRANSVERSAL TOOLS (todas)
   ├─ Línea de Tiempo Unificada
   └─ Reporte Anonimizado
```

#### Menú Esperado:
```
Panel JEFATURA
├─ 📊 Dashboard General
│  ├─ Resumen de todos los equipos
│  └─ Métricas integradas
├─ ⚖️ Herramientas Legales (Completas)
├─ 🧠 Herramientas Psicológicas (Completas)
├─ 👥 Herramientas Sociales (Completas)
└─ 🔗 Línea de Tiempo (Completa)
```

---

## 🔐 MATRIZ DE PERMISOS

| Herramienta | ABOGADO | PSICOLOGO | SOCIAL | JEFATURA |
|-------------|---------|-----------|--------|----------|
| **Legal - Discrepancias** | 🟢 RW | 🔵 R | 🔵 R | 🟢 RW |
| **Legal - Tipicidad** | 🟢 RW | 🔵 R | 🔵 R | 🟢 RW |
| **Legal - Plazos** | 🟢 RW | 🔵 R | 🔵 R | 🟢 RW |
| **Psych - Indicadores** | 🔵 R | 🟢 RW | 🔵 R | 🟢 RW |
| **Psych - Escalas** | 🔵 R | 🟢 RW | 🔵 R | 🟢 RW |
| **Psych - Traducción** | 🔵 R | 🟢 RW | 🔵 R | 🟢 RW |
| **Social - Familia** | 🔵 R | 🔵 R | 🟢 RW | 🟢 RW |
| **Social - Vulnerabilidad** | 🔵 R | 🔵 R | 🟢 RW | 🟢 RW |
| **Transversal - Timeline** | 🟢 RW | 🟢 RW | 🟢 RW | 🟢 RW |
| **Transversal - Anonimizar** | 🟢 RW | 🟢 RW | 🟢 RW | 🟢 RW |

**Leyenda:**
- 🟢 RW = Lectura + Escritura (Acceso Total)
- 🔵 R = Solo Lectura (Referencia)
- ⚪ — = Sin Acceso

---

## ❌ PROBLEMAS IDENTIFICADOS

### 1. Menús No Diferenciados por Rol

**Problema:** Actualmente todos ven todas las herramientas en `/tools-demo`

**Ubicación:** 
```
apps/web/app/(dashboard)/tools-demo/page.tsx
```

**Debe:**
- Mostrar solo herramientas según rol
- Diferente orden de tabs por profesional
- Permisos de edición según rol

### 2. Sin Guardias en Frontend

**Problema:** No hay protección en componentes para permisos

**Debe:**
- Hook `useRoleAccess()` para verificar permisos
- Componentes `<ProtectedTool>` que validen acceso
- Ocultar botones de editar para roles sin permisos

### 3. Sin Guardias en Backend

**Problema:** Endpoints no validan permisos de rol

**Ubicación:**
```
apps/api/src/modules/*/controllers/*.controller.ts
```

**Debe:**
- Guards RolesGuard en endpoints
- @Roles() decorador especificando quién puede acceder
- Validar permisos en servicios

### 4. AI Copilot Sin Restricciones

**Problema:** IA puede acceder a datos de todos los módulos sin validar rol

**Ubicación:**
```
apps/web/components/ai/ai-copilot.tsx
apps/api/src/modules/ai-assistant/
```

**Debe:**
- Validar rol del usuario antes de generar respuesta
- Ocultar información sensible según rol
- Limitar contexto que recibe la IA

---

## 🔧 ESTRUCTURA DE COMPONENTES RECOMENDADA

### Para Controlar Acceso

```typescript
// apps/web/lib/role-access.ts
export const TOOL_PERMISSIONS = {
  legal_discrepancies: ['ABOGADO', 'JEFATURA'],
  legal_typicality: ['ABOGADO', 'JEFATURA'],
  legal_deadlines: ['ABOGADO', 'JEFATURA'],
  
  psychological_indicators: ['PSICOLOGO', 'JEFATURA'],
  psychological_scales: ['PSICOLOGO', 'JEFATURA'],
  psychological_translation: ['PSICOLOGO', 'JEFATURA'],
  
  social_family: ['SOCIAL', 'JEFATURA'],
  social_vulnerability: ['SOCIAL', 'JEFATURA'],
  
  transversal_timeline: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA'],
  transversal_anonymize: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA'],
};

export function useRoleAccess(toolId: string) {
  const { user } = useAuth();
  const allowedRoles = TOOL_PERMISSIONS[toolId];
  return allowedRoles.includes(user?.role);
}
```

### Componente Protegido

```typescript
// apps/web/components/common/ProtectedTool.tsx
interface ProtectedToolProps {
  toolId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedTool({ toolId, children, fallback }: ProtectedToolProps) {
  const hasAccess = useRoleAccess(toolId);
  
  if (!hasAccess) {
    return fallback || (
      <div style={{ color: 'red', padding: '1rem' }}>
        No tienes permiso para acceder a esta herramienta
      </div>
    );
  }
  
  return <>{children}</>;
}
```

### Página Demo por Rol

```typescript
// apps/web/app/(dashboard)/tools-demo/page.tsx
export default function ToolsDemoPage() {
  const { user } = useAuth();
  
  // Menú dinámico según rol
  const getMenuForRole = (role: string) => {
    if (role === 'ABOGADO') return ['legal', 'psychological', 'social', 'transversal'];
    if (role === 'PSICOLOGO') return ['psychological', 'legal', 'social', 'transversal'];
    if (role === 'SOCIAL') return ['social', 'psychological', 'legal', 'transversal'];
    if (role === 'JEFATURA') return ['legal', 'psychological', 'social', 'transversal'];
    return [];
  };
  
  const menuTabs = getMenuForRole(user?.role);
  
  return (
    <div>
      {/* Mostrar solo tabs permitidos en orden de rol */}
      {menuTabs.map(tab => <Tab key={tab} name={tab} />)}
    </div>
  );
}
```

---

## 📝 RESUMEN DE CAMBIOS NECESARIOS

| Archivo | Cambio | Prioridad |
|---------|--------|-----------|
| `tools-demo/page.tsx` | Menú dinámico por rol | 🔴 ALTA |
| `api-client.ts` | Filtrar herramientas por rol | 🔴 ALTA |
| `common/ProtectedTool.tsx` | Crear componente | 🔴 ALTA |
| `*-tools.controller.ts` | Agregar @Roles() guards | 🟡 MEDIA |
| `ai-copilot.tsx` | Validar rol antes de generar | 🟡 MEDIA |
| `role-access.ts` | Centralizar permisos | 🟡 MEDIA |

---

## 📖 Próximo Paso

**Necesito que adjuntes la imagen** del error con la solicitud a la IA para poder:
1. Identificar el problema exacto
2. Crear funcionalidad de edición de respuestas
3. Permitir reenvío de solicitudes editadas

**Imagen esperada:** Screenshot del error al solicitar algo a la IA

