# INSTRUCCIONES PARA AGENTES — Sistema DNA Sucre v2
**Versión**: 2.0 | **Fecha**: 2026-08-01 | **Orquestador**: Kiro Senior

> ⚠️ **IMPORTANTE**: Lee primero `docs/INSTRUCCIONES-AGENTES-v2.md` (nueva versión basada en código real)
> Este archivo contiene tareas de configuración inicial. Para tareas futuras, usa v2.

> Documento generado con análisis previo del código real. Cada tarea incluye
> el archivo exacto a modificar, el código completo a insertar y los pasos
> de verificación. Leer `docs/01-CONTEXTO-PROYECTO.md` antes de comenzar.

---

## MAPEO DE CARGOS FUNCIONALES → ROLES TÉCNICOS

Los 9 cargos que maneja la institución se mapean a 7 roles técnicos del sistema.
**No se modifica el schema de Prisma ni el enum Role.**

| Cargo Funcional Institucional | Rol Técnico en Sistema | Nota |
|-------------------------------|----------------------|------|
| Secretaria de Desarrollo GAM | `ADMINISTRADOR` | Cargo político más alto |
| Directora DNA Sucre | `ADMINISTRADOR` | Puede haber N directores |
| Jefe/a de Defensorías | `JEFATURA` | Gestión operativa distrital |
| Coordinadora/or Distrital | `JEFATURA` | Mismo rol, distintos distritos |
| Abogado/a | `ABOGADO` | Profesional jurídico |
| Psicólogo/a | `PSICOLOGO` | Profesional psicológico |
| Trabajadora/or Social | `SOCIAL` | Profesional social |
| Secretaria/o | `SECRETARIA` | Ingesta y agenda |
| Auxiliar Administrativo | `SECRETARIA` | Sin rol propio en schema |

> **Regla de negocio clave**: El expediente es único e inmutable.
> Los profesionales asignados pueden cambiar (CaseTeamHistory) pero todo
> lo generado dentro del expediente queda registrado permanentemente.

---

## ÍNDICE DE TAREAS

| ID | Prioridad | Título | Archivo Principal |
|----|-----------|--------|-------------------|
| [TASK-01](#task-01) | 🔴 CRÍTICA | Corregir sidebar todos los roles + agregar REFERENTE_TUTOR | `sidebar.tsx` |
| [TASK-02](#task-02) | 🔴 CRÍTICA | Crear componente AccesoRestringido y aplicar guards en páginas admin | Múltiples `page.tsx` |
| [TASK-03](#task-03) | 🟠 ALTA | Copiloto multi-disciplina con guard por rol | `copilot/page.tsx` |
| [TASK-04](#task-04) | 🟠 ALTA | Crear página Disciplinas e Instrumentos | `panel/admin/disciplinas/page.tsx` |
| [TASK-05](#task-05) | 🟡 MEDIA | Agrupación visual sidebar ADMINISTRADOR | `sidebar.tsx` |

**Orden de ejecución recomendado**: TASK-02 → TASK-01 → TASK-03 → TASK-04 → TASK-05


---

## TASK-01
### Corregir sidebar — todos los roles + REFERENTE_TUTOR
**Prioridad**: 🔴 CRÍTICA
**Archivo**: `apps/web/components/layout/sidebar.tsx`
**Impacto**: Roles ven ítems incorrectos. JEFATURA tiene acceso a Config IA y Permisos
(solo ADMINISTRADOR). PSICOLOGO y SOCIAL carecen del Copiloto. REFERENTE_TUTOR
no tiene entrada y queda sin menú.

### Contexto de negocio
- `JEFATURA` = Jefe/a de Defensorías y Coordinadora/or. Supervisa operación,
  NO configura sistema.
- `ADMINISTRADOR` = Secretaria de Desarrollo + Directora. Control total.
- `REFERENTE_TUTOR` = tutor legal del NNA. Portal limitado: solo ve estado del
  expediente de su pupilo. El `layout.tsx` actual redirige a `/ingreso` si no
  hay usuario; para REFERENTE_TUTOR redirigir a `/portal` (ruta separada).
  **Por ahora: agregar entrada mínima al sidebar para evitar pantalla en blanco.**

### Paso 1 — Actualizar imports de lucide-react

Reemplazar el bloque `import { ... } from 'lucide-react'` existente con:

```typescript
import {
  LayoutDashboard,
  FileText,
  UserPlus,
  Users,
  Calendar,
  ShieldCheck,
  LogOut,
  Shield,
  Building2,
  BrainCircuit,
  Database,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
```

> `Key` se elimina definitivamente: ningún array lo usará tras estos cambios.
> `BookOpen` es nuevo (ítem Disciplinas). `ExternalLink` para el portal tutor.


### Paso 2 — Reemplazar el objeto `NAV_ITEMS_BY_ROLE` completo

Localizar la constante `const NAV_ITEMS_BY_ROLE` y reemplazar TODO el objeto:

```typescript
const NAV_ITEMS_BY_ROLE: Record<string, NavItem[]> = {
  // ─── ADMINISTRADOR ───────────────────────────────────────────────
  // Cargos: Secretaria de Desarrollo GAM / Directora DNA Sucre
  ADMINISTRADOR: [
    { label: 'Panel General',        href: '/panel',                     icon: LayoutDashboard },
    { label: 'Agenda y Citas',       href: '/citas',                     icon: Calendar },
    { label: 'Expedientes',          href: '/casos',                     icon: FileText },
    { label: 'Ingesta de Caso',      href: '/ingesta-caso',              icon: UserPlus },
    { label: 'Inspecciones',         href: '/inspecciones',              icon: ShieldCheck },
    { label: 'Reportes GAM',         href: '/reportes',                  icon: FileText },
    { label: 'Balanceo de Equipo',   href: '/equipo',                    icon: Users },
    { label: 'Personal & Permisos',  href: '/permisos',                  icon: Users },
    { label: 'Oficinas y Distritos', href: '/oficinas',                  icon: Building2 },
    { label: 'Auditoría Total',      href: '/auditoria',                 icon: ShieldCheck },
    { label: 'Configuración IA',     href: '/panel/admin/ia',            icon: BrainCircuit },
    { label: 'Base de Conocimiento', href: '/panel/admin/conocimiento',  icon: Database },
    { label: 'Disciplinas',          href: '/panel/admin/disciplinas',   icon: BookOpen },
    { label: 'Catálogos',            href: '/panel/admin/catalogos',     icon: Building2 },
    { label: 'Mantenimiento',        href: '/panel/admin/mantenimiento', icon: Shield },
  ],

  // ─── JEFATURA ────────────────────────────────────────────────────
  // Cargos: Jefe/a de Defensorías / Coordinadora/or Distrital
  // NO tiene: Config IA, Base Conocimiento, Catálogos, Mantenimiento, Permisos
  JEFATURA: [
    { label: 'Panel General',        href: '/panel',          icon: LayoutDashboard },
    { label: 'Agenda y Citas',       href: '/citas',          icon: Calendar },
    { label: 'Expedientes',          href: '/casos',          icon: FileText },
    { label: 'Ingesta de Caso',      href: '/ingesta-caso',   icon: UserPlus },
    { label: 'Inspecciones',         href: '/inspecciones',   icon: ShieldCheck },
    { label: 'Reportes GAM',         href: '/reportes',       icon: FileText },
    { label: 'Balanceo de Equipo',   href: '/equipo',         icon: Users },
    { label: 'Auditoría',            href: '/auditoria',      icon: ShieldCheck },
  ],

  // ─── SECRETARIA ──────────────────────────────────────────────────
  // Cargos: Secretaria/o / Auxiliar Administrativo
  SECRETARIA: [
    { label: 'Panel General',   href: '/panel',        icon: LayoutDashboard },
    { label: 'Agenda y Citas',  href: '/citas',        icon: Calendar },
    { label: 'Ingesta de Caso', href: '/ingesta-caso', icon: UserPlus },
    { label: 'Inspecciones',    href: '/inspecciones', icon: ShieldCheck },
    { label: 'Expedientes',     href: '/casos',        icon: FileText },
  ],

  // ─── ABOGADO ─────────────────────────────────────────────────────
  ABOGADO: [
    { label: 'Panel General',        href: '/panel',        icon: LayoutDashboard },
    { label: 'Agenda y Citas',       href: '/citas',        icon: Calendar },
    { label: 'Mis Casos Asignados',  href: '/casos',        icon: FileText },
    { label: 'Inspecciones',         href: '/inspecciones', icon: ShieldCheck },
    { label: 'Copiloto IA',          href: '/copilot',      icon: BrainCircuit },
  ],

  // ─── PSICOLOGO ───────────────────────────────────────────────────
  PSICOLOGO: [
    { label: 'Panel General',         href: '/panel',   icon: LayoutDashboard },
    { label: 'Agenda y Citas',        href: '/citas',   icon: Calendar },
    { label: 'Mis Casos Asignados',   href: '/casos',   icon: FileText },
    { label: 'Indicadores de Riesgo', href: '/riesgo',  icon: ShieldCheck },
    { label: 'Copiloto IA',           href: '/copilot', icon: BrainCircuit },
  ],

  // ─── SOCIAL ──────────────────────────────────────────────────────
  SOCIAL: [
    { label: 'Panel General',         href: '/panel',      icon: LayoutDashboard },
    { label: 'Agenda y Citas',        href: '/citas',      icon: Calendar },
    { label: 'Mis Casos Asignados',   href: '/casos',      icon: FileText },
    { label: 'Directorio Derivación', href: '/derivacion', icon: Users },
    { label: 'Copiloto IA',           href: '/copilot',    icon: BrainCircuit },
  ],

  // ─── REFERENTE_TUTOR ─────────────────────────────────────────────
  // Tutor legal del NNA. Vista mínima: solo el expediente asignado.
  // El portal completo está en /portal (ruta separada del dashboard).
  REFERENTE_TUTOR: [
    { label: 'Estado del Caso',    href: '/casos',    icon: FileText },
    { label: 'Mis Citas',          href: '/citas',    icon: Calendar },
    { label: 'Portal del Tutor',   href: '/portal',   icon: ExternalLink },
  ],
};
```


### Paso 3 — Actualizar el fallback del componente `Sidebar`

Dentro de `export function Sidebar()`, localizar la línea:
```typescript
const role = user?.role || 'JEFATURA';
```
Y reemplazar por:
```typescript
const role = user?.role || 'SECRETARIA';
```
> El fallback `JEFATURA` era incorrecto. Si no hay sesión, el layout redirige a
> `/ingreso` antes de que el sidebar se renderice. `SECRETARIA` es el rol de
> menor privilegio en el sistema, más seguro como fallback defensivo.

### Verificación TASK-01
1. Compilar: `cd apps/web && npx tsc --noEmit --skipLibCheck` → 0 errores.
2. Login con `jefatura@defensoria.gob.bo` → sidebar NO muestra Config IA, NO muestra Permisos.
3. Login con `psicologo@defensoria.gob.bo` → sidebar muestra **Copiloto IA**.
4. Login con `social@defensoria.gob.bo` → sidebar muestra **Copiloto IA**.
5. Login con `admin@defensoria.gob.bo` → sidebar muestra **Disciplinas** y 15 ítems totales.

---


## TASK-02
### Guards de rol en páginas de administración
**Prioridad**: 🔴 CRÍTICA
**Archivos**: 6 `page.tsx` en el dashboard + 1 componente compartido ya creado
**Impacto**: Cualquier usuario autenticado puede navegar a `/permisos` o
`/panel/admin/*` cambiando la URL manualmente.

### Contexto de negocio
- El `layout.tsx` del dashboard solo verifica que el usuario esté autenticado
  (`user !== null`). NO verifica el rol.
- El componente `AccesoRestringido` **ya existe** en
  `apps/web/components/common/acceso-restringido.tsx` pero **no se usa en ninguna
  página todavía**. Solo hay que importarlo.
- `auditoria/page.tsx` ya tiene un guard inline con `ShieldAlert` directo —
  **no tocarlo**, ya funciona.
- `oficinas/page.tsx` muestra la lista a todos los roles pero solo habilita
  el botón "Editar" al ADMINISTRADOR — **esto es correcto por diseño**
  (todos pueden ver qué oficinas existen).

### Páginas que necesitan guard completo (bloquean la página entera)

#### A. `apps/web/app/(dashboard)/permisos/page.tsx`

⚠️ Este archivo **ya tiene** `import { useAuth }` y `const { user: currentUser } = useAuth()`.
NO repetir esas líneas. Solo agregar:

**1. Al tope del archivo**, después de los imports existentes:
```typescript
import { AccesoRestringido } from '@/components/common/acceso-restringido';
```

**2. Dentro del componente `PermisosPage`**, justo después de la línea
`const { user: currentUser } = useAuth();`:
```typescript
if (currentUser?.role !== 'ADMINISTRADOR') {
  return (
    <AccesoRestringido mensaje="La gestión de personal, roles y la matriz RBAC son exclusivas del Administrador General (Secretaria de Desarrollo / Directora DNA)." />
  );
}
```


#### B. `apps/web/app/(dashboard)/panel/admin/ia/page.tsx`

⚠️ Este archivo **NO tiene** `useAuth` importado. Agregar dos cosas:

**1. Al tope del archivo**, después de los imports existentes:
```typescript
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
```

**2. Primera línea dentro del cuerpo de `AiConfigPage()`**, antes de cualquier
`useState`:
```typescript
const { user } = useAuth();
if (user?.role !== 'ADMINISTRADOR') {
  return (
    <AccesoRestringido mensaje="La configuración de los modelos de IA local (Ollama/Whisper) es exclusiva del Administrador General." />
  );
}
```

#### C. `apps/web/app/(dashboard)/panel/admin/conocimiento/page.tsx`

⚠️ Este archivo **NO tiene** `useAuth`. Agregar:

**1. Al tope del archivo**:
```typescript
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
```

**2. Primera línea dentro del cuerpo de `KnowledgeUploadPage()`**, antes de cualquier `useState`:
```typescript
const { user } = useAuth();
if (user?.role !== 'ADMINISTRADOR') {
  return (
    <AccesoRestringido mensaje="La gestión de la base de conocimiento jurídico (RAG) es exclusiva del Administrador General." />
  );
}
```

#### D. `apps/web/app/(dashboard)/panel/admin/catalogos/page.tsx`

⚠️ Este archivo **NO tiene** `useAuth`. Agregar:

**1. Al tope del archivo**:
```typescript
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
```

**2. Primera línea dentro de `CatalogsAdminPage()`**, antes de cualquier `useState`:
```typescript
const { user } = useAuth();
if (user?.role !== 'ADMINISTRADOR') {
  return (
    <AccesoRestringido mensaje="La administración de catálogos dinámicos del sistema es exclusiva del Administrador General." />
  );
}
```

#### E. `apps/web/app/(dashboard)/panel/admin/mantenimiento/page.tsx`

⚠️ Este archivo **NO tiene** `useAuth`. Agregar:

**1. Al tope del archivo**:
```typescript
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
```

**2. Primera línea dentro de `MaintenanceAdminPage()`**, antes de cualquier `useState`:
```typescript
const { user } = useAuth();
if (user?.role !== 'ADMINISTRADOR') {
  return (
    <AccesoRestringido mensaje="El módulo de respaldo (pg_dump) y transferencia masiva de expedientes es exclusivo del Administrador General." />
  );
}
```

### Verificación TASK-02
- Login con `jefatura@defensoria.gob.bo` → navegar a `/permisos` por URL →
  muestra **Acceso Restringido**, no la tabla de usuarios.
- Login con `jefatura@defensoria.gob.bo` → navegar a `/panel/admin/ia` →
  muestra **Acceso Restringido**.
- Login con `admin@defensoria.gob.bo` → todas las páginas anteriores cargan
  normalmente.
- `/auditoria` sigue funcionando para ADMINISTRADOR y JEFATURA (no tocar ese archivo).

---


## TASK-03
### Copiloto IA multi-disciplina con guard por rol
**Prioridad**: 🟠 ALTA
**Archivo**: `apps/web/app/(dashboard)/copilot/page.tsx`
**Impacto**: El copiloto dice "Copiloto Jurídico" en todos los roles.
Psicólogos y Trabajadoras Sociales deben ver lenguaje de su disciplina.
ADMINISTRADOR y JEFATURA no deben acceder (no son profesionales de campo).

### Contexto de negocio
- ADR-023 establece que el Copiloto asiste a Abogados, Psicólogos y TSOCIAL.
- El endpoint `/api/ai/draft-legal-document` ya existe y funciona.
  El backend acepta el campo `context` en el body. **No cambiar el backend**.
- La diferenciación es solo de UI: título, descripción, placeholder y botón
  cambian según el rol del profesional logueado.

### Reemplazar `copilot/page.tsx` completo con:

```typescript
'use client';

import React, { useState } from 'react';
import { Bot, Copy } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';

// Configuración por disciplina — no cambiar sin alinearlo con el backend
const DISCIPLINE_CONFIG = {
  ABOGADO: {
    titulo: 'Copiloto Jurídico (IA Local)',
    descripcion: 'Asistencia para la redacción de escritos, memoriales y fundamentación legal en el marco de la Ley 548.',
    placeholder: 'Describa los hechos del expediente para redactar un escrito o memorial legal...',
    boton: 'Redactar Escrito Legal',
    subtitulo: 'Borrador Legal Generado',
  },
  PSICOLOGO: {
    titulo: 'Copiloto Psicológico (IA Local)',
    descripcion: 'Asistencia para la redacción de informes psicológicos y evaluación de indicadores de riesgo del NNA.',
    placeholder: 'Describa las observaciones del NNA, contexto familiar y hallazgos para redactar el informe psicológico...',
    boton: 'Redactar Informe Psicológico',
    subtitulo: 'Borrador de Informe Psicológico',
  },
  SOCIAL: {
    titulo: 'Copiloto Social (IA Local)',
    descripcion: 'Asistencia para la redacción de informes sociales, fichas familiares y planes de intervención social.',
    placeholder: 'Describa la situación familiar, condiciones socioeconómicas y red de apoyo del NNA...',
    boton: 'Redactar Informe Social',
    subtitulo: 'Borrador de Informe Social',
  },
} as const;

const ROLES_CON_ACCESO = ['ABOGADO', 'PSICOLOGO', 'SOCIAL'] as const;

export default function CopilotPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  // Guard: solo profesionales de campo
  if (user && !ROLES_CON_ACCESO.includes(user.role as any)) {
    return (
      <AccesoRestringido mensaje="El Copiloto IA está disponible para los profesionales del equipo interdisciplinario: Abogado/a, Psicólogo/a y Trabajador/a Social." />
    );
  }

  const config = DISCIPLINE_CONFIG[user?.role as keyof typeof DISCIPLINE_CONFIG]
    ?? DISCIPLINE_CONFIG.ABOGADO;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetchApi('/ai/draft-legal-document', {
        method: 'POST',
        body: JSON.stringify({ context: query }),
      });
      setDraft(res.draft);
      toast.success('Borrador generado exitosamente.');
    } catch (err: any) {
      toast.error('Error al generar borrador', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
          {config.titulo}
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          {config.descripcion}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)', marginBottom: '1rem' }}>
            Consulta / Contexto del Expediente
          </h3>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={8}
              placeholder={config.placeholder}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bosque-profundo)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Bot size={18} /> {loading ? 'Generando con IA Local...' : config.boton}
            </button>
          </form>
        </div>

        <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--bosque-profundo)' }}>
              {config.subtitulo}
            </h3>
            {draft && (
              <button
                onClick={() => { navigator.clipboard.writeText(draft); toast.success('Copiado al portapapeles'); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Copy size={16} /> Copiar
              </button>
            )}
          </div>
          {draft ? (
            <pre style={{ padding: '1rem', backgroundColor: 'var(--papel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto' }}>
              {draft}
            </pre>
          ) : (
            <div style={{ opacity: 0.6, fontStyle: 'italic', textAlign: 'center', paddingTop: '4rem' }}>
              El borrador generado por Ollama aparecerá aquí.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Verificación TASK-03
- Login `psicologo@defensoria.gob.bo` → `/copilot` → título: "Copiloto Psicológico".
- Login `social@defensoria.gob.bo` → `/copilot` → título: "Copiloto Social".
- Login `abogado@defensoria.gob.bo` → `/copilot` → título: "Copiloto Jurídico".
- Login `jefatura@defensoria.gob.bo` → `/copilot` → pantalla **Acceso Restringido**.
- Login `admin@defensoria.gob.bo` → `/copilot` → pantalla **Acceso Restringido**.

---


## TASK-04
### Crear página de Disciplinas e Instrumentos
**Prioridad**: 🟠 ALTA
**Archivo a crear**: `apps/web/app/(dashboard)/panel/admin/disciplinas/page.tsx`
**Impacto**: El backend `DisciplinesModule` e `InstrumentsModule` ya existen
y tienen endpoints funcionales, pero no hay UI para gestionarlos.

### Contexto de negocio
Las **disciplinas** definen qué tipos de informe puede generar cada profesional:
- `ABOGADO` → `INFORME_JURIDICO`
- `PSICOLOGO` → `INFORME_PSICOLOGICO`, `INFORME_PSICOSOCIAL`
- `SOCIAL` → `INFORME_SOCIAL`, `INFORME_PSICOSOCIAL`

Esta configuración es la base de la lógica de negocio: el Administrador
define qué herramientas tiene cada disciplina. Cambiar esto sin entender el
impacto puede romper la generación de informes.

Los **instrumentos** son escalas o formularios estructurados que el profesional
usa en el expediente (ej. Escala SDQ, Genograma).

### Endpoints del backend disponibles
```
GET  /api/disciplines           → lista todas las disciplinas
POST /api/disciplines           → crear disciplina (ADMINISTRADOR)
PATCH /api/disciplines/:id      → actualizar disciplina (ADMINISTRADOR)

GET  /api/instruments           → lista todos los instrumentos
POST /api/instruments           → crear instrumento (ADMINISTRADOR)
```

### Crear el archivo completo:

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';
import { BookOpen, Layers, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Discipline {
  id: string;
  name: string;
  code: string;
  description?: string;
  reportTypes: { id: string; name: string; code: string }[];
}

interface Instrument {
  id: string;
  name: string;
  description?: string;
  disciplineId?: string;
  discipline?: { name: string };
}

const ROLE_COLOR: Record<string, string> = {
  ABOGADO:   'oklch(0.94 0.04 220)',
  PSICOLOGO: 'oklch(0.94 0.04 65)',
  SOCIAL:    'oklch(0.94 0.04 140)',
};

const REPORT_TYPE_LABEL: Record<string, string> = {
  INFORME_JURIDICO:    'Jurídico',
  INFORME_PSICOLOGICO: 'Psicológico',
  INFORME_PSICOSOCIAL: 'Psicosocial',
  INFORME_SOCIAL:      'Social',
};

export default function DisciplinasPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'disciplinas' | 'instrumentos'>('disciplinas');
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);

  if (user?.role !== 'ADMINISTRADOR') {
    return (
      <AccesoRestringido mensaje="La configuración de disciplinas profesionales e instrumentos es exclusiva del Administrador General." />
    );
  }

  useEffect(() => {
    Promise.all([
      fetchApi('/disciplines'),
      fetchApi('/instruments'),
    ])
      .then(([disc, inst]) => {
        setDisciplines(Array.isArray(disc) ? disc : []);
        setInstruments(Array.isArray(inst) ? inst : []);
      })
      .catch((err) => toast.error('Error al cargar datos', { description: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const tabStyle = (active: boolean) => ({
    padding: '0.75rem 1.25rem',
    border: 'none',
    borderBottom: active ? '3px solid var(--bosque-profundo)' : '3px solid transparent',
    backgroundColor: 'transparent',
    fontWeight: active ? 700 : 500,
    color: active ? 'var(--bosque-profundo)' : 'var(--grafito)',
    cursor: 'pointer',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '0.5rem',
  });

  return (
    <div style={{ maxWidth: '1100px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--bosque-profundo)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen size={32} color="var(--tierra-calida)" /> Disciplinas e Instrumentos
        </h1>
        <p style={{ color: 'var(--grafito)', opacity: 0.8, marginTop: '0.25rem' }}>
          Configuración de las especialidades profesionales y sus herramientas de evaluación por expediente.
        </p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button onClick={() => setActiveTab('disciplinas')} style={tabStyle(activeTab === 'disciplinas')}>
          <BookOpen size={18} /> Disciplinas Profesionales ({disciplines.length})
        </button>
        <button onClick={() => setActiveTab('instrumentos')} style={tabStyle(activeTab === 'instrumentos')}>
          <Layers size={18} /> Instrumentos de Evaluación ({instruments.length})
        </button>
      </div>

      {loading ? (
        <p style={{ opacity: 0.6 }}>Cargando configuración de disciplinas...</p>
      ) : activeTab === 'disciplinas' ? (
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--papel)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Disciplina</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Código Rol</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Tipos de Informe Habilitados</th>
              </tr>
            </thead>
            <tbody>
              {disciplines.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                    No hay disciplinas configuradas. El seed las crea automáticamente.
                  </td>
                </tr>
              ) : disciplines.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>{d.name}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '12px', backgroundColor: ROLE_COLOR[d.code] || 'var(--papel)', color: 'var(--bosque-profundo)' }}>
                      {d.code}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {d.reportTypes?.map((rt) => (
                        <span key={rt.id} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '8px', backgroundColor: 'oklch(0.94 0.03 175)', color: 'var(--bosque-profundo)' }}>
                          {REPORT_TYPE_LABEL[rt.code] || rt.name}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--papel)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Instrumento</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Disciplina</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'left' }}>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {instruments.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                    No hay instrumentos registrados.
                  </td>
                </tr>
              ) : instruments.map((i) => (
                <tr key={i.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>{i.name}</td>
                  <td style={{ padding: '0.875rem 1.25rem', opacity: 0.8 }}>{i.discipline?.name || '—'}</td>
                  <td style={{ padding: '0.875rem 1.25rem', opacity: 0.7 }}>{i.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

### Verificación TASK-04
- Login `admin@defensoria.gob.bo` → click en "Disciplinas" en sidebar →
  carga la página sin errores.
- Tab "Disciplinas": muestra las disciplinas del seed (si el seed las crea).
- Tab "Instrumentos": muestra tabla (puede estar vacía si el seed no tiene).
- Login con cualquier otro rol → navegar a `/panel/admin/disciplinas` por URL →
  muestra **Acceso Restringido**.

---


## TASK-05
### Agrupación visual del sidebar para ADMINISTRADOR
**Prioridad**: 🟡 MEDIA
**Archivo**: `apps/web/components/layout/sidebar.tsx`
**Impacto**: El Admin tiene 15 ítems en lista plana, difícil de escanear.
Esta tarea es **solo visual** — no cambia rutas ni lógica de negocio.

**Prerequisito**: TASK-01 debe estar completa.

### Paso 1 — Agregar la interface `NavGroup` debajo de `NavItem`

Después de la interface `NavItem` existente, agregar:
```typescript
interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}
```

### Paso 2 — Agregar la constante `NAV_GROUPS_ADMINISTRADOR`

Agregar después de `NAV_ITEMS_BY_ROLE`:
```typescript
const NAV_GROUPS_ADMINISTRADOR: NavGroup[] = [
  {
    groupLabel: 'Operación',
    items: [
      { label: 'Panel General',       href: '/panel',        icon: LayoutDashboard },
      { label: 'Agenda y Citas',      href: '/citas',        icon: Calendar },
      { label: 'Expedientes',         href: '/casos',        icon: FileText },
      { label: 'Ingesta de Caso',     href: '/ingesta-caso', icon: UserPlus },
      { label: 'Inspecciones',        href: '/inspecciones', icon: ShieldCheck },
      { label: 'Reportes GAM',        href: '/reportes',     icon: FileText },
      { label: 'Balanceo de Equipo',  href: '/equipo',       icon: Users },
    ],
  },
  {
    groupLabel: 'Gestión Institucional',
    items: [
      { label: 'Personal & Permisos',  href: '/permisos',    icon: Users },
      { label: 'Oficinas y Distritos', href: '/oficinas',    icon: Building2 },
      { label: 'Auditoría Total',      href: '/auditoria',   icon: ShieldCheck },
    ],
  },
  {
    groupLabel: 'Sistema',
    items: [
      { label: 'Configuración IA',     href: '/panel/admin/ia',            icon: BrainCircuit },
      { label: 'Base de Conocimiento', href: '/panel/admin/conocimiento',  icon: Database },
      { label: 'Disciplinas',          href: '/panel/admin/disciplinas',   icon: BookOpen },
      { label: 'Catálogos',            href: '/panel/admin/catalogos',     icon: Building2 },
      { label: 'Mantenimiento',        href: '/panel/admin/mantenimiento', icon: Shield },
    ],
  },
];
```

### Paso 3 — Actualizar el render dentro de `export function Sidebar()`

Dentro de la función `Sidebar`, localizar el bloque donde está `const navItems` y
reemplazar desde `const role = ...` hasta el cierre del `<nav>`:

```typescript
const role = user?.role || 'SECRETARIA';
const isAdmin = role === 'ADMINISTRADOR';
const navItems = NAV_ITEMS_BY_ROLE[role] || NAV_ITEMS_BY_ROLE.SECRETARIA;

// Helper para renderizar un ítem (evita duplicar JSX)
const renderItem = (item: NavItem) => {
  const Icon = item.icon;
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      key={item.href}
      href={item.href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.625rem 0.875rem',
        borderRadius: 'var(--radius)',
        fontSize: '0.875rem',
        fontWeight: isActive ? 600 : 400,
        backgroundColor: isActive ? 'oklch(0.45 0.06 175)' : 'transparent',
        color: isActive ? 'white' : 'oklch(0.90 0 0)',
        textDecoration: 'none',
      }}
    >
      <Icon size={18} color={isActive ? 'var(--tierra-calida)' : 'currentColor'} />
      <span>{item.label}</span>
    </Link>
  );
};
```

Luego, dentro del JSX del `<nav>`, reemplazar el `.map` actual por:

```tsx
<nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
  {isAdmin
    ? NAV_GROUPS_ADMINISTRADOR.map((group) => (
        <div key={group.groupLabel} style={{ marginBottom: '0.25rem' }}>
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'oklch(0.65 0.04 175)',
            padding: '0.75rem 0.875rem 0.375rem',
          }}>
            {group.groupLabel}
          </div>
          {group.items.map(renderItem)}
        </div>
      ))
    : navItems.map(renderItem)
  }
</nav>
```

### Restricciones importantes
- **No cambiar** colores, width ni padding del sidebar.
- **No cambiar** los arrays de otros roles.
- **No cambiar** la lógica de `isActive`.
- Si TypeScript se queja por `key` duplicado en `renderItem`, cambiar la
  `key` en el `Link` a `key={item.href + group.groupLabel}` dentro del mapeo
  del admin.

### Verificación TASK-05
- Login admin → sidebar muestra 3 secciones con encabezados en gris pequeño.
- Login jefatura → sidebar sigue siendo lista plana sin cambios.
- Compilar: `npx tsc --noEmit --skipLibCheck` → 0 errores.

---


---

## CHECKLIST DE VERIFICACIÓN FINAL — ORQUESTADOR

### Verificación de sidebar por rol

| Rol | Debe ver | NO debe ver |
|-----|----------|-------------|
| ADMINISTRADOR | Panel, Citas, Expedientes, Ingesta, Inspecciones, Reportes, Equipo, Personal&Permisos, Oficinas, Auditoría, Config IA, Base Conocimiento, Disciplinas, Catálogos, Mantenimiento | nada prohibido |
| JEFATURA | Panel, Citas, Expedientes, Ingesta, Inspecciones, Reportes, Equipo, Auditoría | Config IA ❌, Base Conocimiento ❌, Permisos ❌, Catálogos ❌ |
| SECRETARIA | Panel, Citas, Ingesta, Inspecciones, Expedientes | sin cambios |
| ABOGADO | Panel, Citas, Mis Casos, Inspecciones, Copiloto IA (BrainCircuit) | ShieldCheck en Copiloto ❌ |
| PSICOLOGO | Panel, Citas, Mis Casos, Indicadores de Riesgo, Copiloto IA | faltaba Copiloto IA |
| SOCIAL | Panel, Citas, Mis Casos, Directorio Derivación, Copiloto IA | faltaba Copiloto IA |
| REFERENTE_TUTOR | Estado del Caso, Mis Citas, Portal del Tutor | no tiene acceso a admin |

### Verificación de guards

| URL | Roles que acceden | Roles que ven AccesoRestringido |
|-----|-------------------|---------------------------------|
| `/permisos` | ADMINISTRADOR | Todos los demás |
| `/panel/admin/ia` | ADMINISTRADOR | Todos los demás |
| `/panel/admin/conocimiento` | ADMINISTRADOR | Todos los demás |
| `/panel/admin/catalogos` | ADMINISTRADOR | Todos los demás |
| `/panel/admin/mantenimiento` | ADMINISTRADOR | Todos los demás |
| `/panel/admin/disciplinas` | ADMINISTRADOR | Todos los demás |
| `/copilot` | ABOGADO, PSICOLOGO, SOCIAL | ADMINISTRADOR, JEFATURA, SECRETARIA, REFERENTE_TUTOR |
| `/auditoria` | ADMINISTRADOR, JEFATURA | Todos los demás (**ya funciona — no tocar**) |
| `/oficinas` | Todos (solo ven), ADMINISTRADOR edita | sin guard de página (correcto) |

### Verificación del copiloto

| Rol | Título en pantalla | Texto del botón |
|-----|--------------------|-----------------|
| ABOGADO | "Copiloto Jurídico (IA Local)" | "Redactar Escrito Legal" |
| PSICOLOGO | "Copiloto Psicológico (IA Local)" | "Redactar Informe Psicológico" |
| SOCIAL | "Copiloto Social (IA Local)" | "Redactar Informe Social" |

### Compilación obligatoria antes de cerrar

```bash
# Desde la raíz del monorepo:
cd apps/web && npx tsc --noEmit --skipLibCheck
```
→ Debe devolver 0 errores. Si hay errores de tipo, corregirlos antes de marcar
la tarea como completada.

---

## CONTEXTO TÉCNICO PARA AGENTES

### Credenciales de prueba (seed `packages/db/prisma/seed.ts`)

| Email | Contraseña | Rol | Cargo funcional |
|-------|-----------|-----|-----------------|
| `admin@defensoria.gob.bo` | `Password123!` | ADMINISTRADOR | Administrador General |
| `jefatura@defensoria.gob.bo` | `Password123!` | JEFATURA | Jefa de Defensorías |
| `secretaria@defensoria.gob.bo` | `Password123!` | SECRETARIA | Secretaria Central |
| `abogado@defensoria.gob.bo` | `Password123!` | ABOGADO | Abogado Central |
| `psicologo@defensoria.gob.bo` | `Password123!` | PSICOLOGO | Psicóloga Central |
| `social@defensoria.gob.bo` | `Password123!` | SOCIAL | Trabajador Social Central |

### Imports estándar del proyecto

```typescript
// Autenticación — disponible en todas las páginas del dashboard
import { useAuth } from '@/lib/auth-context';
// Retorna: { user: UserProfile | null, token, isLoading, login, logout }
// user.role es string union: 'ADMINISTRADOR' | 'JEFATURA' | 'ABOGADO' | 'PSICOLOGO' | 'SOCIAL' | 'SECRETARIA' | 'REFERENTE_TUTOR'

// Llamadas a la API (maneja token automáticamente)
import { fetchApi } from '@/lib/api';

// Notificaciones toast
import { toast } from 'sonner';

// Guard reutilizable (ya existe en el proyecto)
import { AccesoRestringido } from '@/components/common/acceso-restringido';
```

### Tokens CSS del proyecto (`apps/web/app/globals.css`)

```css
var(--bosque-profundo)  /* oklch(0.35 0.06 175) — color primario, headers */
var(--salvia)           /* oklch(0.60 0.05 165) — color secundario */
var(--tierra-calida)    /* oklch(0.62 0.12 65)  — color acento */
var(--papel)            /* oklch(0.97 0.01 90)  — fondo claro */
var(--grafito)          /* oklch(0.25 0.01 80)  — texto */
var(--card)             /* oklch(1 0 0)          — blanco, tarjetas */
var(--border)           /* oklch(0.88 0.01 90)  — borde suave */
var(--radius)           /* 0.5rem */
var(--riesgo-alto)      /* oklch(0.52 0.18 28)  — rojo riesgo */
var(--riesgo-medio)     /* oklch(0.72 0.14 80)  — amarillo riesgo */
var(--riesgo-bajo)      /* oklch(0.60 0.05 165) — verde riesgo */
```

### Reglas de negocio que NO se pueden romper

1. **Expediente único e inmutable**: Nunca eliminar registros de `cases`, `reports`,
   `action_logs` o `evidence`. Solo archivar (phase: CIERRE).
2. **Profesionales pueden rotar**: El equipo de un expediente (`CaseTeamHistory`)
   puede cambiar, pero todo lo generado por un profesional anterior permanece.
3. **Informes por disciplina**: Solo el profesional de la disciplina correspondiente
   puede crear/editar su informe. La lectura cruzada requiere token de seguridad.
4. **Auditoría append-only**: No hay botón de eliminación en `/auditoria`.
   Los guards solo deben mostrar/ocultar la página, nunca modificar los logs.
5. **REFERENTE_TUTOR**: Vista de solo lectura. No puede crear ni modificar nada.
   Su portal completo está en `/portal` (ruta separada, fuera del dashboard admin).

---

*Generado por Kiro Orquestador — 2026-08-01 — Basado en análisis del código real*
*Verificado contra: sidebar.tsx, auth-context.tsx, seed.ts, access-control.md, admin-master-plan.md*
