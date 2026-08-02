# Guía Rápida para Agentes Nuevos

**Tiempo**: 10 minutos para entender el sistema.

---

## 1️⃣ ¿Qué es el Sistema DNA?

Sistema de **gestión de casos** para la **Defensoría del Pueblo - Bolivia**.

**En 1 frase**: Plataforma para que abogados, psicólogos y trabajadores sociales colaboren en expedientes de Niñas, Niños y Adolescentes (NNA).

**Stack**:
- Backend: NestJS (TypeScript)
- Frontend: Next.js (TypeScript + React)
- DB: PostgreSQL + pgvector (para IA local)
- IA: Ollama (modelos locales, no nube)

---

## 2️⃣ Los 7 Roles

```
┌─ ADMINISTRADOR       → Control total del sistema
├─ JEFATURA            → Supervisa una oficina distrital
├─ SECRETARIA          → Gestiona agenda y expedientes
├─ ABOGADO             → Profesional jurídico (con IA)
├─ PSICOLOGO           → Profesional psicológico (con IA)
├─ SOCIAL              → Trabajador/a social (con IA)
└─ REFERENTE_TUTOR     → Tutor legal (portal de lectura)
```

**Lo importante**:
- Cada rol ve DIFERENTES ítems en el sidebar
- Cada rol tiene DIFERENTES permisos en el backend
- El role viene del **JWT** (backend valida)

---

## 3️⃣ Cómo Sincronizar Frontend con Backend

### ❌ NUNCA hagas esto:
```typescript
const ROLES = ['ADMINISTRADOR', 'JEFATURA'];  // ← NO
if (ROLES.includes(user.role)) { ... }
```

### ✅ SIEMPRE haz esto:
```typescript
if (user?.role !== 'ADMINISTRADOR') {  // ← SÍ
  return <AccesoRestringido />;
}
```

**Por qué**: El role viene del backend (JWT). Si cambias permisos en backend, frontend lo respeta automáticamente.

---

## 4️⃣ Los 3 Documentos Principales

| Documento | Tiempo | Contiene |
|-----------|--------|----------|
| **arquitectura/ROLES-Y-PERMISOS-RESUMEN.md** | 5 min | Resumen ejecutivo: qué hace cada rol |
| **agentes-ia/INSTRUCCIONES-AGENTES.md** | 15 min | Detalles técnicos: endpoints, DTOs, flujos |
| **testing/VERIFICACION-SINCRONIZACION.md** | 10 min | Checklist: cómo validar cambios |

---

## 5️⃣ Flujo: "Necesito agregar un nuevo permiso"

### Ejemplo: JEFATURA debe ver BASE DE CONOCIMIENTO

### Paso 1: Backend - Agregar @Roles

**Archivo**: `apps/api/src/modules/knowledge/knowledge.controller.ts`

```typescript
@Get('documents')
@Roles(Role.ADMINISTRADOR, Role.JEFATURA)  // ← AGREGAR JEFATURA
@ApiOperation({ summary: 'Listar documentos' })
async getDocuments() { ... }
```

### Paso 2: Frontend - Agregar ícono al sidebar

**Archivo**: `apps/web/components/layout/sidebar.tsx`

```typescript
const NAV_ITEMS_BY_ROLE = {
  JEFATURA: [
    { label: 'Panel General', href: '/panel', icon: LayoutDashboard },
    { label: 'Base de Conocimiento', href: '/panel/admin/conocimiento', icon: Database },  // ← AGREGAR
    // ...
  ]
}
```

### Paso 3: Verificar compilación

```bash
cd apps/api && npx tsc --noEmit
cd apps/web && npx tsc --noEmit --skipLibCheck
```

### Paso 4: Testing manual

```
1. Login como JEFATURA
2. Verificar que sidebar muestra "Base de Conocimiento"
3. Click en ícono → debe ir a /panel/admin/conocimiento
4. Verificar que puede ver documentos (GET /knowledge/documents retorna 200)
```

---

## 6️⃣ Las 5 Reglas de Acceso a Expedientes

```
a) ADMINISTRADOR      → Ve TODOS (sin filtro)

b) JEFATURA           → Ve casos de su OFICINA
   SECRETARIA         (WHERE currentOfficeId = user.officeId)

c) ABOGADO            → Ve SOLO casos donde está ASIGNADO activamente
   PSICOLOGO          (WHERE caseTeamHistory.userId = user.id AND endDate = null)
   SOCIAL

d) REFERENTE_TUTOR    → Ve SOLO su expediente
   (portal)           (WHERE caseCode = user.caseCode AND isPortal = true)

e) Otros              → DENEGADO
```

---

## 7️⃣ Transferencia de Expedientes

### A. Reasignar un profesional de un caso

```bash
curl -X POST http://localhost:4100/api/cases/{caseId}/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "uuid-new-professional",
    "role": "ABOGADO",
    "reason": "Cambio de equipo"
  }'
```

**Resultado**: 
- El profesional nuevo lo ve en su lista
- El anterior ya NO lo ve

### B. Transferir TODOS los casos de un profesional

```bash
curl -X POST http://localhost:4100/api/cases/admin/mass-transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -d '{
    "fromUserId": "uuid-old",
    "toUserId": "uuid-new",
    "reason": "Jubilación"
  }'
```

**Nota**: Solo ADMINISTRADOR puede hacer esto.

---

## 8️⃣ Protecciones Implementadas

| Nivel | Qué hace |
|-------|----------|
| **1. Guards** | `@Roles(ADMINISTRADOR)` en el endpoint → Si no tienes rol, 403 |
| **2. Access Control** | `CaseAccessService` → Si no tienes acceso al caso, 403 |
| **3. Auditoría** | Cada acción se registra en tabla `audit_log` (inmutable) |
| **4. RLS** | Row Level Security a nivel PostgreSQL |

---

## 9️⃣ Palabras Clave del Proyecto

| Término | Significa |
|---------|-----------|
| **Expediente** | El caso del NNA (contiene todas las pruebas, informes, etc.) |
| **NNA** | Niña, Niño o Adolescente (la persona centro del caso) |
| **RAG** | Retrieval-Augmented Generation (IA que usa base legal local) |
| **Ollama** | Motor de IA local (no usa nube) |
| **Copiloto IA** | Asistente para redactar documentos (solo para profesionales) |
| **caseTeamHistory** | Tabla que registra quién trabajó en el caso (con fechas) |
| **Phase** | Fase del caso (DERIVACION, EVALUACION, SEGUIMIENTO, etc.) |
| **currentOfficeId** | Oficina distrital donde está el caso ahora |

---

## 🔟 Checklist: Antes de Entregar Código

- [ ] Verificación TypeScript sin errores (`npx tsc --noEmit`)
- [ ] El rol existe en `packages/shared/src/index.ts`
- [ ] El endpoint tiene `@Roles()` correspondiente
- [ ] Frontend usa `user.role` (no arrays locales)
- [ ] Probé con rol que SÍ tiene acceso (funciona)
- [ ] Probé con rol que NO tiene acceso (muestra AccesoRestringido)
- [ ] Commiteé: `git commit -m "feat: descripción de cambio"`

---

## 🆘 Cuando No Sabes Qué Hacer

**Paso 1**: Lee el documento relevante en esta tabla:

| Pregunta | Lee |
|----------|-----|
| ¿Qué rol puede hacer esto? | arquitectura/ROLES-Y-PERMISOS-RESUMEN.md |
| ¿Cómo es el flujo técnico? | agentes-ia/INSTRUCCIONES-AGENTES.md |
| ¿Cómo verifico mi cambio? | testing/VERIFICACION-SINCRONIZACION.md |
| ¿Cómo es el sistema? | 01-CONTEXTO-PROYECTO.md |
| ¿Cómo es la BD? | modelo-datos/schema-v0.md |

**Paso 2**: Si aún no sabes, busca en el código:

```bash
# ¿Qué permisos tiene JEFATURA?
grep -r "JEFATURA" apps/api/src/modules/*/\*.controller.ts

# ¿Cómo es CaseAccessService?
cat apps/api/src/common/case-access/case-access.service.ts

# ¿Qué endpoints tienen @Roles?
grep -r "@Roles" apps/api/src --include="*.ts" | head -20
```

---

## 📚 Próximos Pasos

1. **Lee arquitectura/ROLES-Y-PERMISOS-RESUMEN.md** (5 min)
2. **Lee agentes-ia/INSTRUCCIONES-AGENTES.md** (15 min)
3. **Mira los 3 documentos principales en el INDEX**
4. **Ejecuta testing/VERIFICACION-SINCRONIZACION.md** si haces cambios

---

**Última actualización**: 2026-08-01  
**Creado por**: Kiro Agente Senior  
**Próxima lectura**: arquitectura/ROLES-Y-PERMISOS-RESUMEN.md


