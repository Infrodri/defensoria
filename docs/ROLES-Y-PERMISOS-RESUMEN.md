# Resumen Ejecutivo: Roles y Permisos del Sistema DNA

**Objetivo**: Guía rápida para entender quién puede hacer qué en el sistema.  
**Audiencia**: Agentes IA, desarrolladores, administradores.

---

## 🔐 Los 7 Roles del Sistema

```
┌─────────────────────────────────────────────────────────┐
│ ADMINISTRADOR (Nivel 1: Control Total)                  │
├─────────────────────────────────────────────────────────┤
│ • Ver TODOS los expedientes (sin filtro)                │
│ • Gestionar usuarios y permisos                         │
│ • Configurar IA local (Ollama, Whisper)                │
│ • Administrar base de conocimiento (RAG)                │
│ • Administrar catálogos, disciplinas, instrumentos      │
│ • Realizar transferencias masivas de casos              │
│ • Ver auditoría sin filtro                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ JEFATURA (Nivel 2: Supervisión de Oficina)              │
├─────────────────────────────────────────────────────────┤
│ • Ver expedientes de su oficina únicamente              │
│ • Asignar/reasignar profesionales a casos              │
│ • Crear expedientes                                     │
│ • Ver auditoría de su oficina únicamente                │
│ • Lectura: Base de conocimiento, disciplinas            │
│ • NO puede: Configurar IA, editar catálogos, etc.     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SECRETARIA (Nivel 3: Administrativa)                    │
├─────────────────────────────────────────────────────────┤
│ • Ver expedientes de su oficina                         │
│ • Crear expedientes nuevos                              │
│ • Gestionar agenda y citas                              │
│ • Crear inspecciones                                    │
│ • NO acceso a: Admin panels, copiloto IA               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ABOGADO (Nivel 4: Profesional Jurídico)                 │
├─────────────────────────────────────────────────────────┤
│ • Ver SOLO casos donde esté asignado activamente        │
│ • Crear/emitir informes jurídicos                       │
│ • Registrar pruebas y evidencias                        │
│ • Usar Copiloto IA: Redacción de escritos legales      │
│ • Gestionar citas de sus casos                          │
│ • NO puede: Ver casos de otros, admin panels           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PSICOLOGO (Nivel 4: Profesional Psicológico)            │
├─────────────────────────────────────────────────────────┤
│ • Ver SOLO casos donde esté asignado activamente        │
│ • Crear/emitir informes psicológicos                    │
│ • Registrar pruebas y evidencias                        │
│ • Usar Copiloto IA: Redacción de informes psicológicos │
│ • Evaluar indicadores de riesgo                         │
│ • NO puede: Ver casos de otros, admin panels           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SOCIAL (Nivel 4: Profesional Social)                    │
├─────────────────────────────────────────────────────────┤
│ • Ver SOLO casos donde esté asignado activamente        │
│ • Crear/emitir informes sociales                        │
│ • Registrar pruebas y evidencias                        │
│ • Usar Copiloto IA: Redacción de informes sociales     │
│ • Gestionar directorio de derivación                    │
│ • NO puede: Ver casos de otros, admin panels           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ REFERENTE_TUTOR (Nivel 5: Portal Solo Lectura)          │
├─────────────────────────────────────────────────────────┤
│ • Ver SOLO el expediente de su pupilo (caseCode match)  │
│ • Acceso vía portal separado (/portal, no dashboard)    │
│ • Lectura únicamente (sin crear, editar, eliminar)      │
│ • Ver citas y documentos del caso                       │
│ • Autenticación: PIN + caseCode (no email+password)    │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Matriz de Acceso a Expedientes

**Reglas implementadas en `CaseAccessService`**:

| Rol | Puede ver | Filtro |
|-----|-----------|--------|
| **ADMINISTRADOR** | Todos los casos | SIN FILTRO (todos) |
| **JEFATURA** | Casos de su oficina | WHERE `currentOfficeId = user.officeId` |
| **SECRETARIA** | Casos de su oficina | WHERE `currentOfficeId = user.officeId` |
| **ABOGADO** | Solo casos asignados | WHERE `caseTeamHistory.userId = user.id AND endDate = null` |
| **PSICOLOGO** | Solo casos asignados | WHERE `caseTeamHistory.userId = user.id AND endDate = null` |
| **SOCIAL** | Solo casos asignados | WHERE `caseTeamHistory.userId = user.id AND endDate = null` |
| **REFERENTE_TUTOR** | Solo su expediente | WHERE `caseCode = user.caseCode AND isPortal = true` |

**Nota**: "Asignado activamente" = `caseTeamHistory.endDate = null` (no cerrado)

---

## 🔄 Flujos de Transferencia de Expedientes

### 1. Reasignación Individual
```
JEFATURA/SECRETARIA/ADMIN ejecuta:
  POST /cases/{caseId}/assign
  {
    "userId": "uuid-new-professional",
    "role": "ABOGADO",
    "reason": "Cambio de equipo"
  }

Backend:
  ✓ Cierra asignación anterior (endDate = NOW)
  ✓ Abre asignación nueva (startDate = NOW)
  ✓ Registra en caseTeamHistory (historial inmutable)
  ✓ Registra en audit_log

Resultado: El profesional nuevo ve el caso en su lista
           El profesional anterior ya NO lo ve
```

### 2. Transferencia Masiva
```
ADMIN ÚNICAMENTE ejecuta:
  POST /cases/admin/mass-transfer
  {
    "fromUserId": "uuid-professional-old",
    "toUserId": "uuid-professional-new",
    "reason": "Jubilación del profesional"
  }

Backend:
  ✓ Busca TODOS los casos donde fromUserId tiene endDate = null
  ✓ Para cada caso:
    - Cierra asignación antigua
    - Abre asignación nueva
    - Registra en historial
  ✓ Retorna reporte con cantidad y detalles

Resultado: Todos los casos transferidos en transacción atómica
```

### 3. Transferencia de Oficina
```
Cuando un expediente se mueve a otra jurisdicción:

  POST /cases/{caseId}/transfer-office
  {
    "targetOfficeId": "uuid-new-office",
    "reason": "Derivación legal a distrito X"
  }

Backend:
  ✓ Actualiza case.currentOfficeId = targetOfficeId
  ✓ Registra en caseOfficeHistory (historial de movimientos)
  ✓ Aplica RLS (Row Level Security)

Resultado: JEFATURA de nueva oficina ahora ve el caso
           JEFATURA de oficina anterior ya NO lo ve
```

---

## 🛡️ Protecciones Implementadas

### Nivel 1: Guards en Controladores
```typescript
@Roles(Role.ADMINISTRADOR, Role.JEFATURA)
// Solo estos roles pueden llamar este endpoint
// Si rol no está en lista → 403 Forbidden
```

### Nivel 2: Verificación de Acceso a Caso
```typescript
// ANTES de retornar dato del caso:
await caseAccessService.assertUserHasAccess(caseId, user);
// Si acceso denegado → 403 Forbidden
```

### Nivel 3: Auditoría Append-Only
```
Cada acción se registra automáticamente:
- Quién (userId)
- Qué (acción: create, update, delete, read)
- Cuándo (timestamp)
- Dónde (caseId, officeId)
- Resultado (success/error)

Tabla: audit_log (SOLO INSERT, nunca UPDATE/DELETE)
```

### Nivel 4: RLS (Row Level Security)
```sql
-- PostgreSQL nivel
SELECT * FROM case
WHERE CURRENT_USER_ID = ANY(allowed_office_ids)
```

---

## 📋 Módulos y Sus Permisos

| Módulo | ADMIN | JEFE | SECRETARIA | ABOGADO | PSICOLOGO | SOCIAL |
|--------|-------|------|-----------|---------|-----------|--------|
| **USERS** (gestionar funcionarios) | ✅ | ⚠️ (lectura) | ❌ | ❌ | ❌ | ❌ |
| **CASES** (ver/crear expedientes) | ✅ | ✅ | ✅ | ✅* | ✅* | ✅* |
| **REPORTS** (crear informes) | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **APPOINTMENTS** (citas) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **EVIDENCES** (pruebas) | ❌ | ❌ | ❌ | ✅* | ✅* | ✅* |
| **INSPECTIONS** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **KNOWLEDGE** (RAG) | ✅ (crear) | ⚠️ (lectura) | ❌ | ⚠️ (lectura) | ⚠️ (lectura) | ⚠️ (lectura) |
| **AI-CONFIG** (Ollama) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **COPILOTO IA** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **AUDIT** | ✅ (sin filtro) | ✅ (su oficina) | ❌ | ❌ | ❌ | ❌ |
| **DISCIPLINES** | ⚠️ (lectura) | ⚠️ (lectura) | ⚠️ (lectura) | ⚠️ (lectura) | ⚠️ (lectura) | ⚠️ (lectura) |

**Leyenda**:
- ✅ = Acceso total (CRUD)
- ⚠️ = Acceso limitado (lectura o filtrado)
- ❌ = Sin acceso
- \* = Solo si está asignado activamente al caso

---

## 🧭 Sidebar por Rol

```
ADMINISTRADOR (15 ítems en 3 secciones):
├─ Operación:
│  ├─ Panel General
│  ├─ Agenda y Citas
│  ├─ Expedientes
│  ├─ Ingesta de Caso
│  ├─ Inspecciones
│  ├─ Reportes GAM
│  └─ Balanceo de Equipo
├─ Gestión Institucional:
│  ├─ Personal & Permisos
│  ├─ Oficinas y Distritos
│  └─ Auditoría Total
└─ Sistema:
   ├─ Configuración IA
   ├─ Base de Conocimiento
   ├─ Disciplinas
   ├─ Catálogos
   └─ Mantenimiento

JEFATURA (8 ítems):
├─ Panel General
├─ Agenda y Citas
├─ Expedientes
├─ Ingesta de Caso
├─ Inspecciones
├─ Reportes GAM
├─ Balanceo de Equipo
└─ Auditoría

SECRETARIA (5 ítems):
├─ Panel General
├─ Agenda y Citas
├─ Ingesta de Caso
├─ Inspecciones
└─ Expedientes

ABOGADO (5 ítems):
├─ Panel General
├─ Agenda y Citas
├─ Mis Casos Asignados
├─ Inspecciones
└─ Copiloto IA

PSICOLOGO (5 ítems):
├─ Panel General
├─ Agenda y Citas
├─ Mis Casos Asignados
├─ Indicadores de Riesgo
└─ Copiloto IA

SOCIAL (5 ítems):
├─ Panel General
├─ Agenda y Citas
├─ Mis Casos Asignados
├─ Directorio Derivación
└─ Copiloto IA

REFERENTE_TUTOR (3 ítems):
├─ Estado del Caso
├─ Mis Citas
└─ Portal del Tutor
```

---

## 🚀 Cómo Sincronizar Frontend con Backend

### ❌ NO HACER (Hardcoding)
```typescript
const ALLOWED_ROLES = ['ADMINISTRADOR', 'JEFATURA'];
if (!ALLOWED_ROLES.includes(user?.role)) { ... }
```

### ✅ HACER (Dinámico del Backend)
```typescript
// El role viene del JWT (backend validó)
if (user?.role !== 'ADMINISTRADOR') {
  return <AccesoRestringido />;
}
```

**Razón**: Si cambias @Roles en backend, frontend automáticamente lo respeta (sin redeploy).

---

## 📞 Referencia Rápida

**Archivo | Contiene**
- `packages/shared/src/index.ts` → Enums Role, CaseType, Phase, etc.
- `apps/api/src/modules/*/[module].controller.ts` → @Roles en cada endpoint
- `apps/api/src/common/case-access/case-access.service.ts` → Lógica de acceso
- `apps/web/components/layout/sidebar.tsx` → Menú por rol
- `apps/web/lib/auth-context.tsx` → Hook useAuth() (user.role)
- `docs/INSTRUCCIONES-AGENTES-v2.md` → Guía detallada completa

**Comandos**:
```bash
# Ver roles
grep "enum Role" packages/shared/src/index.ts -A 10

# Ver permisos de un módulo
grep "@Roles" apps/api/src/modules/MODULO/*.controller.ts

# Ver guards en frontend
grep -r "AccesoRestringido" apps/web/app --include="*.tsx"
```

---

**Última actualización**: 2026-08-01  
**Próximo nivel**: Lee `docs/INSTRUCCIONES-AGENTES-v2.md` para detalles técnicos
