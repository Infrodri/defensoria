# Análisis de Brechas: Roles, Menús y Módulos por Disciplina

**Fecha**: 2026-08-01  
**Propósito**: Documento de trabajo para identificar qué está implementado, qué falta y qué hay que corregir en la capa de presentación y RBAC del sistema.

---

## ESTADO ACTUAL — LO QUE YA EXISTE

### ✅ Backend (todos los módulos disponibles)
El API tiene 26 módulos activos y respondiendo. Ver `apps/api/src/modules/`.

### ✅ Sidebar — Menú actual por rol
El archivo `apps/web/components/layout/sidebar.tsx` ya define `NAV_ITEMS_BY_ROLE` con ítems por rol. Estado actual:

| Rol | Ítems de menú actuales |
|-----|----------------------|
| ADMINISTRADOR | Panel, Citas, Oficinas, Usuarios/Permisos, Config IA, Base Conocimiento, Catálogos, Mantenimiento, Expedientes, Ingesta, Inspecciones, Reportes GAM, Balanceo Equipo, Auditoría |
| JEFATURA | Panel, Citas, Config IA, Base Conocimiento, Expedientes, Ingesta, Inspecciones, Reportes, Balanceo Equipo, Auditoría, Permisos |
| SECRETARIA | Panel, Citas, Ingesta, Inspecciones, Expedientes |
| ABOGADO | Panel, Citas, Mis Casos, Inspecciones, Copilot Jurídico |
| PSICOLOGO | Panel, Citas, Mis Casos, Indicadores de Riesgo |
| SOCIAL | Panel, Citas, Mis Casos, Directorio de Derivación |

---

## BRECHAS DETECTADAS

### BRECHA 1 — ADMINISTRADOR: Menú desorganizado y rutas sin implementar

**Problema**: El menú del Admin tiene 14 ítems mezclados sin agrupación visual. Varias rutas apuntan a sub-rutas de `/panel/admin/` que pueden no tener página propia con guards de rol.

**Ítems que deben tener páginas propias confirmadas**:
- `/panel/admin/ia` — Config IA
- `/panel/admin/conocimiento` — Base RAG
- `/panel/admin/catalogos` — Catálogos dinámicos
- `/panel/admin/mantenimiento` — Backup

**Acción requerida**: Verificar que cada ruta tiene `page.tsx` y que el layout del dashboard aplica guard de rol `ADMINISTRADOR`.

---

### BRECHA 2 — ADMINISTRADOR: Falta la sección "Usuarios" separada de "Permisos"

**Problema actual**: El ítem del menú dice `Usuarios y Permisos` y apunta a `/permisos`. Esto mezcla dos funciones distintas:

- **Usuarios** (`/usuarios`) → CRUD de funcionarios: crear, editar, desactivar cuentas, asignar rol y distrito
- **Permisos** (`/permisos`) → Matriz RBAC dinámica: qué puede hacer cada rol en cada módulo

Son dos pantallas diferentes que deben ir separadas.

**Acción requerida**: Separar en dos ítems del sidebar para ADMINISTRADOR:
```
{ label: 'Gestión de Personal', href: '/usuarios', icon: Users }
{ label: 'Matriz de Permisos', href: '/permisos', icon: Key }
```
Y verificar que `/usuarios` tiene su `page.tsx` con guard `ADMINISTRADOR`.

---

### BRECHA 3 — JEFATURA: Tiene acceso a Config IA y Base Conocimiento que no le corresponde

**Problema**: Según `docs/admin-master-plan.md` sección 7:
> "El Administrador General es el **único** rol con acceso a la parametrización de los motores de IA locales"

Pero en `sidebar.tsx` JEFATURA tiene:
- `{ label: 'Configuración IA', href: '/panel/admin/ia' }`
- `{ label: 'Base Conocimiento', href: '/panel/admin/conocimiento' }`

**Acción requerida**: Eliminar esos dos ítems del menú de JEFATURA. Solo ADMINISTRADOR debe verlos.

---

### BRECHA 4 — JEFATURA: Tiene acceso a "Permisos" cuando no debe gestionar la matriz RBAC

**Problema**: `sidebar.tsx` incluye `{ label: 'Permisos', href: '/permisos' }` para JEFATURA.  
Según `docs/security/access-control.md`:
```
Manage Dynamic Modules & RBAC | ✅ (CRUD Total) ADMINISTRADOR | ❌ JEFATURA
```

**Acción requerida**: Eliminar el ítem `/permisos` del menú de JEFATURA.

---

### BRECHA 5 — ABOGADO: Falta el Copiloto IA con acceso correcto

**Problema**: El abogado tiene `Copilot Jurídico` apuntando a `/copilot`, pero el icono asignado es `ShieldCheck` (candado de seguridad) en vez de un ícono de IA. Además, no existe ítem equivalente para PSICOLOGO ni SOCIAL, que según el ADR-023 también deben acceder al copiloto.

**Según ADR-023**:
> "El Copiloto asiste a los profesionales: **Abogados, Psicólogos, Trabajadores Sociales**"

**Acción requerida**: 
- Añadir `Copiloto IA` al menú de PSICOLOGO y SOCIAL
- Corregir el icono del abogado a `BrainCircuit`

---

### BRECHA 6 — PSICOLOGO: Falta el módulo de informes psicológicos explícito en el menú

**Problema**: PSICOLOGO tiene solo `Mis Casos` e `Indicadores de Riesgo`. No tiene un acceso directo a "Mis Informes" aunque el backend `ReportsModule` ya lo soporta.

**Lo que debe ver un Psicólogo al entrar**:
- Sus casos asignados (ya está)
- Crear/ver sus informes psicológicos (accesible desde detalle de caso, pero debería tener atajos)
- Indicadores de riesgo (ya está)
- Copiloto IA (falta)
- Agenda (ya está)

---

### BRECHA 7 — SOCIAL: Falta el módulo de informes sociales explícito en el menú

**Problema**: SOCIAL tiene solo `Mis Casos` y `Directorio de Derivación`. No tiene acceso directo a sus informes.

**Lo que debe ver un Trabajador Social**:
- Sus casos asignados (ya está)
- Crear/ver sus informes sociales (accesible desde caso, pero sin atajo)
- Directorio de derivación (ya está)
- Copiloto IA (falta)
- Agenda (ya está)

---

### BRECHA 8 — SECRETARIA: Puede ver Inspecciones cuando no corresponde plenamente

**Según `docs/admin-master-plan.md` tabla RBAC**:
```
Inspecciones | ADMINISTRADOR: CRUD | JEFATURA: ✅ | ABOGADO: ✅ | PSICOLOGO: ❌ | SOCIAL: ❌ | SECRETARIA: ✅
```
Secretaria puede ver inspecciones. Esto es correcto. No es brecha, confirmar que está bien.

---

### BRECHA 9 — Disciplinas y herramientas: el concepto no está en el menú

**Problema central**: El sistema tiene el módulo `DisciplinesModule` en el backend pero **no se expone en ningún menú de ningún rol**. Las disciplinas en el sistema son:

| Disciplina (Rol) | Tipo de Informe que genera | Herramientas específicas |
|-----------------|---------------------------|-------------------------|
| **ABOGADO** | `INFORME_JURIDICO` | Copiloto Jurídico, Plantillas legales, Escritos |
| **PSICOLOGO** | `INFORME_PSICOLOGICO`, `INFORME_PSICOSOCIAL` | Indicadores de riesgo, Evaluación psicológica |
| **SOCIAL** | `INFORME_SOCIAL`, `INFORME_PSICOSOCIAL` | Ficha social, Directorio de derivación |

**El módulo `DisciplinesModule`** permite al Administrador configurar:
- Qué tipos de informe puede generar cada disciplina
- Plantillas e Instrumentos por disciplina

**Acción requerida**: Agregar acceso a `/panel/admin/disciplinas` en el menú del ADMINISTRADOR para configurar disciplinas e instrumentos.

---

## INSTRUCCIONES DE TRABAJO — ORDENADAS POR PRIORIDAD

---

### TAREA 1 (CRÍTICA) — Corregir el sidebar para ADMINISTRADOR
**Archivo**: `apps/web/components/layout/sidebar.tsx`

Reemplazar el bloque `ADMINISTRADOR` con esta estructura ordenada en grupos lógicos:

```
GRUPO: Administración del Sistema
  → Panel General           /panel
  → Agenda y Citas          /citas
  → Gestión de Personal     /usuarios          ← SEPARAR de Permisos
  → Matriz de Permisos      /permisos

GRUPO: Gestión Territorial
  → Oficinas y Distritos    /oficinas
  → Inspecciones            /inspecciones
  → Balanceo de Equipo      /equipo

GRUPO: Expedientes
  → Expedientes             /casos
  → Ingesta de Caso         /ingesta-caso
  → Reportes GAM            /reportes

GRUPO: Inteligencia y Configuración
  → Config IA               /panel/admin/ia
  → Base Conocimiento       /panel/admin/conocimiento
  → Catálogos               /panel/admin/catalogos
  → Disciplinas             /panel/admin/disciplinas   ← NUEVO
  → Mantenimiento & Backup  /panel/admin/mantenimiento

GRUPO: Auditoría
  → Auditoría Total         /auditoria
```

---

### TAREA 2 (CRÍTICA) — Corregir el sidebar para JEFATURA
**Archivo**: `apps/web/components/layout/sidebar.tsx`

Quitar `Config IA`, `Base Conocimiento` y `Permisos`. Quedar:

```
→ Panel General           /panel
→ Agenda y Citas          /citas
→ Expedientes             /casos
→ Ingesta de Caso         /ingesta-caso
→ Inspecciones            /inspecciones
→ Balanceo de Equipo      /equipo
→ Reportes GAM            /reportes
→ Auditoría               /auditoria
```

---

### TAREA 3 (ALTA) — Corregir y completar menús de profesionales

**ABOGADO**:
```
→ Panel General           /panel
→ Agenda y Citas          /citas
→ Mis Casos Asignados     /casos
→ Inspecciones            /inspecciones
→ Copiloto IA             /copilot          ← Cambiar icono a BrainCircuit
```

**PSICOLOGO**:
```
→ Panel General           /panel
→ Agenda y Citas          /citas
→ Mis Casos Asignados     /casos
→ Indicadores de Riesgo   /riesgo
→ Copiloto IA             /copilot          ← AÑADIR
```

**SOCIAL**:
```
→ Panel General           /panel
→ Agenda y Citas          /citas
→ Mis Casos Asignados     /casos
→ Directorio Derivación   /derivacion
→ Copiloto IA             /copilot          ← AÑADIR
```

---

### TAREA 4 (ALTA) — Crear página `/usuarios` para ADMINISTRADOR
**Archivo a crear**: `apps/web/app/(dashboard)/usuarios/page.tsx`

Esta página ya tiene backend (`UsersModule` en `/api/users`). Necesita frontend con:
- Tabla paginada de funcionarios con filtros: Distrito, Rol, Estado
- Botón "Nuevo Funcionario" → modal/formulario
- Acciones por fila: Editar perfil, Cambiar rol, Resetear contraseña, Desactivar

---

### TAREA 5 (ALTA) — Verificar que las rutas admin tienen guards de rol
**Archivos a verificar**:
- `apps/web/app/(dashboard)/layout.tsx` — debe tener guard que redirige si no está autenticado
- `apps/web/app/(dashboard)/usuarios/page.tsx` — debe verificar `role === 'ADMINISTRADOR'`
- `apps/web/app/(dashboard)/permisos/page.tsx` — debe verificar `role === 'ADMINISTRADOR'`
- `apps/web/app/(dashboard)/auditoria/page.tsx` — debe verificar `role === 'ADMINISTRADOR' || 'JEFATURA'`

**Patrón a usar** (ya existe en el proyecto):
```typescript
const { user } = useAuth();
if (user?.role !== 'ADMINISTRADOR') redirect('/panel');
```

---

### TAREA 6 (MEDIA) — Crear página `/panel/admin/disciplinas`
**Archivo a crear**: `apps/web/app/(dashboard)/panel/admin/disciplinas/page.tsx`

Esta página conecta con `DisciplinesModule` (`/api/disciplines`) e `InstrumentsModule` (`/api/instruments`) que ya existen en el backend.

Debe mostrar:
- Lista de disciplinas configuradas (ABOGADO, PSICOLOGO, SOCIAL)
- Por cada disciplina: qué tipos de informe puede generar
- Gestión de plantillas e instrumentos por disciplina

---

### TAREA 7 (MEDIA) — Agrupar visualmente los ítems del sidebar

El sidebar actual renderiza una lista plana. Con 14 ítems para el Admin resulta difícil de usar.

**Modificar** `sidebar.tsx` para soportar grupos con separador y encabezado:

```typescript
interface NavGroup {
  label?: string;       // encabezado del grupo (opcional)
  items: NavItem[];
}

const NAV_GROUPS_BY_ROLE: Record<string, NavGroup[]> = {
  ADMINISTRADOR: [
    {
      label: 'Sistema',
      items: [
        { label: 'Panel General', href: '/panel', icon: LayoutDashboard },
        { label: 'Agenda y Citas', href: '/citas', icon: Calendar },
      ]
    },
    {
      label: 'Personas y Permisos',
      items: [
        { label: 'Gestión de Personal', href: '/usuarios', icon: Users },
        { label: 'Matriz de Permisos', href: '/permisos', icon: Key },
      ]
    },
    // ... etc
  ]
}
```

---

## RESUMEN EJECUTIVO DE CAMBIOS

| # | Tarea | Archivo principal | Prioridad |
|---|-------|-------------------|-----------|
| 1 | Corregir sidebar ADMINISTRADOR (separar usuarios/permisos, agregar disciplinas) | `sidebar.tsx` | 🔴 Crítica |
| 2 | Corregir sidebar JEFATURA (quitar Config IA, Base Conocimiento, Permisos) | `sidebar.tsx` | 🔴 Crítica |
| 3 | Completar menús de ABOGADO, PSICOLOGO, SOCIAL (agregar copiloto) | `sidebar.tsx` | 🟠 Alta |
| 4 | Crear página `/usuarios` con CRUD de funcionarios | `usuarios/page.tsx` | 🟠 Alta |
| 5 | Verificar guards de rol en rutas protegidas | `layout.tsx` + pages | 🟠 Alta |
| 6 | Crear página `/panel/admin/disciplinas` | `disciplinas/page.tsx` | 🟡 Media |
| 7 | Agrupar sidebar con secciones visuales | `sidebar.tsx` | 🟡 Media |

---

## REFERENCIA RÁPIDA — QUIÉN VE QUÉ

### ADMINISTRADOR — Ve todo
```
Sistema, Territorial, Expedientes, IA/Config, Auditoría
```

### JEFATURA — Ve operación completa, sin configuración del sistema
```
Panel, Citas, Expedientes, Ingesta, Inspecciones, Equipo, Reportes, Auditoría
```

### SECRETARIA — Ve solo operación administrativa
```
Panel, Citas, Ingesta, Inspecciones, Expedientes
```

### ABOGADO — Ve solo su trabajo jurídico
```
Panel, Citas, Mis Casos, Inspecciones, Copiloto IA
```

### PSICOLOGO — Ve solo su trabajo psicológico
```
Panel, Citas, Mis Casos, Indicadores de Riesgo, Copiloto IA
```

### SOCIAL — Ve solo su trabajo social
```
Panel, Citas, Mis Casos, Directorio de Derivación, Copiloto IA
```

---

## RELACIÓN DISCIPLINA → HERRAMIENTAS → INFORMES

| Rol / Disciplina | Herramientas exclusivas | Informes que puede crear |
|-----------------|------------------------|--------------------------|
| **ABOGADO** | Copiloto Jurídico, Plantillas legales | `INFORME_JURIDICO` |
| **PSICOLOGO** | Indicadores de Riesgo, Evaluación psicológica | `INFORME_PSICOLOGICO`, `INFORME_PSICOSOCIAL` |
| **SOCIAL** | Directorio de Derivación, Ficha social | `INFORME_SOCIAL`, `INFORME_PSICOSOCIAL` |
| **JEFATURA** | Visión 360°, asignación de equipo | Lectura de todos (con Token) |
| **ADMINISTRADOR** | Config IA, Matriz RBAC, Distritos | Lectura de todos |
| **SECRETARIA** | Agenda, Ingesta | Sin informes clínicos |

**Nota sobre `INFORME_PSICOSOCIAL`**: Puede ser generado por PSICOLOGO y SOCIAL en conjunto. La autoría es del profesional que lo redacta. El sistema lo permite desde el `ReportsModule`.

---

## DATO IMPORTANTE PARA IMPLEMENTACIÓN

El backend ya tiene todo. Lo que falta es **solo frontend**:

1. `GET /api/users` → Página `/usuarios` (tabla de funcionarios)
2. `GET /api/disciplines` → Página `/panel/admin/disciplinas` (config disciplinas)
3. `GET /api/instruments` → dentro de `/panel/admin/disciplinas`
4. Los guards de rol existen en el backend. En el frontend deben agregarse checks en los `page.tsx` correspondientes.
