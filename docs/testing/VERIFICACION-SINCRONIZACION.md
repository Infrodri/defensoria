# CHECKLIST: Verificación de Sincronización Backend-Frontend

**Propósito**: Asegurar que los roles, permisos y módulos están sincronizados.  
**Ejecutar**: Cada vez que se agregue un rol, módulo o permiso.

---

## ✅ VERIFICACIÓN 1: Roles Definidos

### Backend - Enum Role
**Archivo**: `packages/shared/src/index.ts`

```bash
# Buscar la definición
grep -A 10 "^export enum Role" packages/shared/src/index.ts
```

**Esperado**: 7 roles exactos
```
ADMINISTRADOR
JEFATURA
ABOGADO
PSICOLOGO
SOCIAL
SECRETARIA
REFERENTE_TUTOR
```

**Validación**: 
- [ ] Cada rol tiene exactamente un decorador @Roles que lo referencia
- [ ] No hay roles duplicados
- [ ] No hay typos (PSICOLOG vs PSICOLOGO)

---

## ✅ VERIFICACIÓN 2: @Roles en Cada Controlador

### Procedimiento

Para cada módulo en `apps/api/src/modules/*/[module].controller.ts`:

```bash
# 1. Listar todos los módulos
ls apps/api/src/modules/

# 2. Para cada módulo, verificar @Roles en endpoints principales:
grep -B 2 "@Get\|@Post\|@Patch\|@Delete" apps/api/src/modules/MODULO/MODULO.controller.ts
```

### Tabla de Validación

| Módulo | Endpoint | @Roles | ✓ |
|--------|----------|--------|---|
| USERS | GET /users | ADMIN, JEFE | ? |
| USERS | POST /users | ADMIN, JEFE | ? |
| CASES | POST /cases | SECRETARIA, JEFE, ADMIN | ? |
| CASES | GET /cases | (filtrado automático) | ? |
| KNOWLEDGE | POST /upload | ADMIN | ? |
| AI-CONFIG | PATCH /ai-config | ADMIN | ? |
| REPORTS | POST /reports | (implícito - acceso caso requerido) | ? |

**Validación**: 
- [ ] Todos los endpoints @Roles están documentados en agentes-ia/INSTRUCCIONES-AGENTES.md
- [ ] No hay @Roles inconsistentes (ej: un POST requiere ADMIN pero GET permite SECRETARIA sin motivo)

---

## ✅ VERIFICACIÓN 3: CaseAccessService Rules

**Archivo**: `apps/api/src/common/case-access/case-access.service.ts`

```bash
# Verificar que assert UserHasAccess tiene 5 reglas
grep -n "// Regla" apps/api/src/common/case-access/case-access.service.ts
```

**Esperado**: Exactamente 5 reglas
```
Regla a: ADMINISTRADOR → acceso total
Regla b: JEFATURA/SECRETARIA → acceso por officeId
Regla c: ABOGADO/PSICOLOGO/SOCIAL → acceso por caseTeamHistory.endDate = null
Regla d: REFERENTE_TUTOR (portal) → acceso por caseCode
Regla e: Deny by default
```

**Validación**:
- [ ] Las 5 reglas están implementadas
- [ ] No hay excepciones especiales ad-hoc
- [ ] Cada regla está comentada y clara

---

## ✅ VERIFICACIÓN 4: Sidebar Sincronizado

**Archivo**: `apps/web/components/layout/sidebar.tsx`

```bash
# Verificar que NAV_ITEMS_BY_ROLE tiene entrada para cada rol
grep "^  [A-Z_]*: \[" apps/web/components/layout/sidebar.tsx
```

**Esperado**: 7 entradas
```
ADMINISTRADOR: [...]
JEFATURA: [...]
ABOGADO: [...]
PSICOLOGO: [...]
SOCIAL: [...]
SECRETARIA: [...]
REFERENTE_TUTOR: [...]
```

**Validación**:
- [ ] Cada rol del enum tiene entrada en NAV_ITEMS_BY_ROLE
- [ ] No hay roles extras (typos)
- [ ] Fallback es SECRETARIA (rol de menor privilegio)

---

## ✅ VERIFICACIÓN 5: Guards en Páginas Admin

**Buscar**: Todas las páginas con `@Roles(ADMINISTRADOR)`

```bash
# Listar archivos que requieren guards
find apps/web/app -name "page.tsx" | xargs grep -l "AccesoRestringido" 2>/dev/null
```

**Esperado**: Mínimo 5 archivos
- /panel/admin/ia/page.tsx
- /panel/admin/conocimiento/page.tsx
- /panel/admin/catalogos/page.tsx
- /panel/admin/mantenimiento/page.tsx
- /panel/admin/disciplinas/page.tsx
- /permisos/page.tsx

**Validación para cada archivo**:
```bash
# Ejemplo: verificar que /panel/admin/ia/page.tsx tiene guard
grep -A 5 "const { user }" apps/web/app/\(dashboard\)/panel/admin/ia/page.tsx | \
  grep -E "user\?.role !== 'ADMINISTRADOR'"
```

**Esperado**: Línea encontrada
```
if (user?.role !== 'ADMINISTRADOR') {
  return <AccesoRestringido mensaje="..." />;
}
```

**Validación**:
- [ ] Cada página admin tiene guard de rol al inicio
- [ ] El guard verifica role correcto
- [ ] AccesoRestringido se muestra con mensaje claro

---

## ✅ VERIFICACIÓN 6: DTOs Sincronizados

**Archivo**: `apps/api/src/modules/*/dto/`

```bash
# Listar todos los DTOs
find apps/api/src/modules -name "*.dto.ts"
```

**Validación**: Para cada DTO crítico:
- [ ] CreateCaseDto tiene `caseType: CaseType` (enum from shared)
- [ ] CreateUserDto tiene `role: Role` (enum from shared)
- [ ] AssignTeamDto tiene `role: Role` (enum from shared)
- [ ] CreateReportDto tiene `reportType: ReportType` (si existe)

**Verificación de validación**:
```bash
# Buscar class-validator decoradores
grep -r "@IsEnum\|@IsString\|@IsNotEmpty" apps/api/src/modules/*/dto/
```

**Esperado**: Decoradores presentes en campos críticos

---

## ✅ VERIFICACIÓN 7: Enums Compartidos

**Archivo**: `packages/shared/src/index.ts`

Todos estos enums deben estar definidos y exportados:

- [ ] Role
- [ ] CaseType
- [ ] Phase
- [ ] InterventionPath
- [ ] RiskLevel
- [ ] RoleInCase
- [ ] Gender
- [ ] DocumentType

**Validación**:
```bash
# Verificar que todos se exportan
grep "^export enum" packages/shared/src/index.ts
```

---

## ✅ VERIFICACIÓN 8: Copiloto Sincronizado

**Frontend**: `apps/web/app/(dashboard)/copilot/page.tsx`

```typescript
const DISCIPLINE_CONFIG = {
  ABOGADO: { titulo: '...Jurídico...', ... },
  PSICOLOGO: { titulo: '...Psicológico...', ... },
  SOCIAL: { titulo: '...Social...', ... },
}

const ROLES_CON_ACCESO = ['ABOGADO', 'PSICOLOGO', 'SOCIAL']
```

**Validación**:
- [ ] Exactamente 3 disciplinas en DISCIPLINE_CONFIG
- [ ] ROLES_CON_ACCESO tiene exactamente 3 roles
- [ ] Guard bloquea ADMINISTRADOR y JEFATURA
- [ ] Guard retorna AccesoRestringido con mensaje claro

---

## ✅ VERIFICACIÓN 9: Compilación

```bash
# Backend
cd apps/api
npx tsc --noEmit

# Frontend
cd apps/web
npx tsc --noEmit --skipLibCheck
```

**Esperado**: 
- [ ] 0 errores en backend
- [ ] 0 errores en frontend
- [ ] Build completa sin warnings

---

## ✅ VERIFICACIÓN 10: Testing Manual

### Test 1: Login con cada rol

```bash
# Para cada rol, intentar login
curl -X POST http://localhost:4100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ROLE@defensoria.gob.bo",
    "password": "Password123!"
  }'
```

**Roles a testear**:
- admin@defensoria.gob.bo → ADMINISTRADOR
- jefatura@defensoria.gob.bo → JEFATURA
- abogado@defensoria.gob.bo → ABOGADO
- psicologo@defensoria.gob.bo → PSICOLOGO
- social@defensoria.gob.bo → SOCIAL
- secretaria@defensoria.gob.bo → SECRETARIA

**Esperado**: Cada login retorna user con role correcto

### Test 2: Verificar sidebar por rol

1. Login como ADMINISTRADOR
   - [ ] Sidebar muestra 15 ítems en 3 secciones (Operación, Institucional, Sistema)

2. Login como JEFATURA
   - [ ] Sidebar muestra 8 ítems sin agrupación
   - [ ] NO muestra "Config IA", "Base Conocimiento", "Permisos"

3. Login como SECRETARIA
   - [ ] Sidebar muestra 5 ítems (Panel, Citas, Ingesta, Inspecciones, Expedientes)

4. Login como ABOGADO
   - [ ] Sidebar muestra "Copiloto IA" (último ítem)
   - [ ] Click en Copiloto → "Copiloto Jurídico (IA Local)"

5. Login como PSICOLOGO
   - [ ] Sidebar muestra "Copiloto IA"
   - [ ] Click en Copiloto → "Copiloto Psicológico (IA Local)"

### Test 3: Verificar acceso restringido

```bash
# Token de JEFATURA intentando acceder a /permisos
curl http://localhost:3100/permisos \
  -H "Authorization: Bearer ${TOKEN_JEFATURA}"
```

**Esperado**: Página muestra "Acceso Restringido"

### Test 4: Transferencia de expediente

```bash
# Admin transferir caso de abogado1 a abogado2
curl -X POST http://localhost:4100/api/cases/admin/mass-transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN_ADMIN}" \
  -d '{
    "fromUserId": "uuid-abogado1",
    "toUserId": "uuid-abogado2",
    "reason": "Cambio de jurisdicción"
  }'
```

**Esperado**: 
- [ ] Respuesta 200 OK
- [ ] totalCasesTransferred > 0
- [ ] casesDetails contiene array de transferencias

---

## 📝 Formulario de Validación Final

Completar esto después de ejecutar todos los checks:

```markdown
## Validación Completada

- [ ] Todos los roles están definidos en packages/shared
- [ ] @Roles está presente en todos los endpoints críticos
- [ ] CaseAccessService tiene 5 reglas de acceso
- [ ] Sidebar tiene entrada para cada rol
- [ ] Guards en páginas admin están implementados
- [ ] DTOs tienen validación y enums correctos
- [ ] Enums compartidos están sincronizados
- [ ] Copiloto tiene configuración multi-disciplina
- [ ] Compilación sin errores (backend y frontend)
- [ ] Tests manuales pasaron

**Fecha de validación**: ___________
**Ejecutado por**: ___________
**Resultado**: ☐ PASS ☐ FAIL

**Notas**:
_________________________________________
```

---

**Este documento debe ejecutarse cada vez que se agregue un rol, módulo o permiso nuevo.**  
**Última actualización**: 2026-08-01

