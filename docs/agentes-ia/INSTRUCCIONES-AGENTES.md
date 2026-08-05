# INSTRUCCIONES COMPLETAS PARA AGENTES — Sistema DNA v2
**Versión**: 2.0 | **Fecha**: 2026-08-01 | **Fuente**: Análisis de código backend NestJS real  
**Principio fundamental**: TODO está extraído del código, NINGÚN dato hardcodeado.

---

## 📋 ÍNDICE EJECUTIVO

Este documento describe:
1. Los **7 roles** del sistema y sus permisos reales según `@Roles()` en controladores
2. Los **23 módulos backend** y qué endpoints cada rol puede llamar
3. El flujo de **transferencia de expedientes** (individual y masiva)
4. Las **reglas de acceso** a expedientes según rol
5. Los **DTOs y validaciones** que cada endpoint requiere
6. Cómo sincronizar **frontend y backend** sin hardcoding

---

## 🔐 PARTE 1: ROLES Y PERMISOS DEL SISTEMA

### Definición de Roles (source: packages/shared/src/index.ts)

```typescript
enum Role {
  ADMINISTRADOR = 'ADMINISTRADOR',    // Control total del sistema
  JEFATURA = 'JEFATURA',              // Supervisión operativa por oficina
  ABOGADO = 'ABOGADO',                // Profesional jurídico
  PSICOLOGO = 'PSICOLOGO',            // Profesional psicológico
  SOCIAL = 'SOCIAL',                  // Profesional social
  SECRETARIA = 'SECRETARIA',          // Gestión administrativa
  REFERENTE_TUTOR = 'REFERENTE_TUTOR' // Tutor legal (portal separado)
}
```

**Implementación técnica**: 
- Definición central en `packages/shared/src/index.ts` (ÚNICA FUENTE DE VERDAD)
- Guards: `RolesGuard` + decorador `@Roles()` en cada controlador
- Verificación: `RolesGuard.canActivate()` compara `user.role` contra `@Roles()` del endpoint
- Si falta rol requerido → `ForbiddenException: Tu rol (X) no tiene permisos para esta acción`

---

## 👥 PARTE 2: MATRIZ COMPLETA DE PERMISOS POR MÓDULO

*Formato: `MÉTODO /ruta [Roles Requeridos] - Descripción`*

### Módulo: USERS (Gestión de Funcionarios)
**Guards**: JwtAuthGuard, RolesGuard  
**Base Roles**: ADMINISTRADOR, JEFATURA

| Endpoint | Método | Roles | DTO Requerido | Descripción |
|----------|--------|-------|---------------|-------------|
| /users | GET | ADMIN, JEFE | — | Listar todos los funcionarios del sistema |
| /users/:id | GET | ADMIN, JEFE | — | Obtener detalle de funcionario y casos asignados |
| /users | POST | ADMIN, JEFE | CreateUserDto | Registrar nuevo funcionario (email, nombre, rol, officeId) |
| /users/:id | PATCH | ADMIN, JEFE | UpdateUserDto | Actualizar funcionario (rol, distrito, estado) |
| /users/:id/reset-password | POST | ADMIN, JEFE | password? | Restablecer contraseña (genera temporal si no se proporciona) |

**DTOs**:
```typescript
// CreateUserDto
{
  email: string;           // Único en el sistema
  firstName: string;
  lastName: string;
  role: Role;              // Una de las 7 opciones
  officeId: string;        // UUID de oficina (si no es ADMINISTRADOR)
  password?: string;       // Temporal si no se proporciona
}

// UpdateUserDto
{
  role?: Role;             // Cambiar rol
  officeId?: string;       // Cambiar oficina
  status?: 'ACTIVE' | 'INACTIVE';
}
```

---

### Módulo: CASES (Gestión de Expedientes)
**Guards**: JwtAuthGuard, RolesGuard  
**Access Control**: Implementado en `CaseAccessService`

| Endpoint | Método | Roles | DTO Requerido | Descripción |
|----------|--------|-------|---------------|-------------|
| /cases | POST | SECRETARIA, JEFE, ADMIN | CreateCaseDto | Registrar nuevo expediente |
| /cases | GET | Todos (filtrado) | — | Listar expedientes (filtrado por rol/asignación) |
| /cases/analytics | GET | Todos | — | Métricas agregadas sin datos nominales |
| /cases/:id | GET | (ver CaseAccessService) | — | Detalle expediente con historial |
| /cases/:id/assign | POST | JEFE, SECRETARIA, ADMIN | AssignTeamDto | Asignar profesional al equipo |
| /cases/:id/generate-pin | POST | JEFE, SECRETARIA, ADMIN | — | Generar PIN de acceso para tutor |
| /cases/admin/mass-transfer | POST | ADMIN únicamente | { fromUserId, toUserId, reason } | Reasignar masivamente expedientes |

**DTOs**:
```typescript
// CreateCaseDto
{
  caseType: CaseType;              // DENUNCIA_VULNERACION, CONSUMO_SUSTANCIAS, etc.
  nnaId: string;                   // UUID de la persona (NNA titular)
  complainantId?: string;          // UUID del denunciante (opcional)
  accusedId?: string;              // UUID del denunciado (opcional)
  intakeNarrative: string;         // Relato inicial del caso
}

// AssignTeamDto
{
  userId: string;                  // UUID del profesional
  role: Role;                       // ABOGADO, PSICOLOGO o SOCIAL
  reason: string;                  // Motivo de la asignación
}
```

**CaseAccessService - Reglas de Acceso** (source: case-access.service.ts):

| Regla | Rol | Condición | Acceso |
|-------|-----|-----------|--------|
| a | ADMINISTRADOR | — | ✅ Total (todos los expedientes) |
| b | JEFATURA, SECRETARIA | currentOfficeId == user.officeId | ✅ Expedientes de su oficina |
| b | JEFATURA, SECRETARIA | currentOfficeId != user.officeId | ❌ Denegado |
| c | ABOGADO, PSICOLOGO, SOCIAL | caseTeamHistory.userId == user.id && endDate == null | ✅ Casos asignados activos |
| c | ABOGADO, PSICOLOGO, SOCIAL | Sin asignación activa | ❌ Denegado |
| d | REFERENTE_TUTOR (portal) | caseCode == user.caseCode && isPortal == true | ✅ Solo su expediente |
| e | Cualquier otro | — | ❌ Denegado por defecto |

**Comportamiento de findAll() por rol**:
- **ADMINISTRADOR**: Todos los casos, todas las oficinas
- **JEFATURA/SECRETARIA**: Solo casos de su `officeId`
- **ABOGADO/PSICOLOGO/SOCIAL**: Solo casos donde tienen `caseTeamHistory.endDate == null` (membresía activa)
- **REFERENTE_TUTOR**: No llama findAll (acceso portal únicamente a su caso)

---

### Módulo: AUTH (Autenticación)
**Guards**: Público (login) o JwtAuthGuard (perfil)

| Endpoint | Método | Roles | DTO | Descripción |
|----------|--------|-------|-----|-------------|
| /auth/login | POST | Público | LoginDto | Autenticación con email+contraseña, retorna JWT + user { id, role, officeId, email } |
| /auth/me | GET | JWT requerido | — | Obtener perfil del usuario autenticado |
| /auth/refresh | POST | JWT requerido | — | Refrescar token (si implement. existe) |

**LoginDto**:
```typescript
{
  email: string;
  password: string;
}
```

**Response /auth/login**:
```typescript
{
  access_token: string;           // JWT con payload: { id, email, role, officeId }
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;                  // ADMINISTRADOR, JEFATURA, etc.
    officeId: string | null;     // null para ADMINISTRADOR
  }
}
```

---

### Módulo: REPORTS (Informes Disciplinares)
**Guards**: JwtAuthGuard, RolesGuard  
**Acceso implícito**: Solo profesionales en equipo del caso

| Endpoint | Método | Roles | DTO | Descripción |
|----------|--------|-------|-----|-------------|
| /reports | POST | ABOGADO, PSICOLOGO, SOCIAL | CreateReportDto | Crear informe (requiere ser parte del equipo del caso) |
| /reports/:id | GET | JWT + acceso a caso | — | Obtener detalle informe |
| /reports/:id/emit | POST | Creador del informe | EmitReportDto | Emitir informe oficial (genera documento final) |
| /reports/:id/complementary | POST | Creador del informe | { title, content } | Crear informe complementario (v2, v3) sobre informe emitido |

**Notas importantes**:
- Solo el profesional que creó el informe puede emitirlo
- El informe está vinculado a `caseId` y `disciplineReportTypeId` (la categoría del informe viene de la tabla `DisciplineReportType`)
- Acceso al informe requiere acceso al caso (via `CaseAccessService`)

---

### Módulo: APPOINTMENTS (Citas y Agenda)
**Guards**: JwtAuthGuard, RolesGuard  
**Acceso**: Todos los roles con cuenta en el sistema

| Endpoint | Método | Rol Implícito | DTO | Descripción |
|----------|--------|--------|-----|-------------|
| /appointments | POST | JWT | CreateAppointmentDto | Crear cita (pertenece a un caso) |
| /appointments | GET | JWT | — | Listar citas del usuario (propias y asignadas) |
| /appointments/:id/reassign | POST | JWT | { userId, reason } | Reasignar cita a otro profesional |

---

### Módulo: EVIDENCES (Pruebas y Cadena de Custodia)
**Guards**: JwtAuthGuard, RolesGuard  
**Acceso**: Profesionales asignados al caso

| Endpoint | Método | Rol | DTO | Descripción |
|----------|--------|-----|-----|-------------|
| /evidences | POST | JWT (case access required) | CreateEvidenceDto | Registrar prueba (vinculada a caso) |
| /evidences/:id | GET | JWT (case access required) | — | Obtener detalle evidencia con cadena de custodia |

---

### Módulo: INSPECTIONS (Inspecciones en Terreno)
**Guards**: JwtAuthGuard, RolesGuard  
**Acceso**: Profesionales asignados

| Endpoint | Método | Rol | DTO | Descripción |
|----------|--------|-----|-----|-------------|
| /inspections | POST | JWT | CreateInspectionDto | Registrar inspección |
| /inspections | GET | JWT | — | Listar inspecciones del usuario |

---

### Módulo: KNOWLEDGE (Base de Conocimiento RAG)
**Guards**: JwtAuthGuard, RolesGuard  
**Base Roles**: Mostly ADMINISTRADOR

| Endpoint | Método | Roles | DTO | Descripción |
|----------|--------|-------|-----|-------------|
| /knowledge/upload | POST | ADMIN | FormData: file (PDF) + title | Procesar PDF e inyectar a RAG |
| /knowledge/upload-url | POST | ADMIN | { title, url } | Procesar URL y ingesta |
| /knowledge/upload-markdown | POST | ADMIN | FormData: file (.md) + title | Procesar Markdown (máxima calidad) |
| /knowledge/documents | GET | ADMIN, JEFE | — | Listar documentos indexados |
| /knowledge/documents/:id/chunks | GET | ADMIN, JEFE | — | Ver fragmentos de un documento |
| /knowledge/documents/:id/toggle-status | PATCH | ADMIN | — | Activar/Desactivar (dar de baja leyes derogadas) |
| /knowledge/documents/:id | DELETE | ADMIN | — | Eliminar permanentemente (documento + chunks + embeddings) |
| /knowledge/validate-markdown | POST | ADMIN, JEFE | { content: string } | Validar Markdown antes de ingesta (preview) |

---

### Módulo: AI-ASSISTANT (Copiloto IA)
**Guards**: JwtAuthGuard, RolesGuard  
**Base Roles**: ABOGADO, PSICOLOGO, SOCIAL

| Endpoint | Método | Roles | DTO | Descripción |
|----------|--------|-------|-----|-------------|
| /ai/draft-legal-document | POST | ABOGADO, PSICOLOGO, SOCIAL | { context: string } | Generar borrador (usa Ollama local + RAG) |

---

### Módulo: AI-CONFIG (Configuración de Modelos Locales)
**Guards**: JwtAuthGuard, RolesGuard  
**Base Roles**: ADMINISTRADOR únicamente

| Endpoint | Método | Roles | DTO | Descripción |
|----------|--------|-------|-----|-------------|
| /ai-config | GET | ADMIN | — | Obtener configuración de Ollama/Whisper |
| /ai-config | PATCH | ADMIN | { modelName, baseUrl, etc. } | Actualizar configuración |

---

### Módulo: AUDIT (Auditoría Append-Only)
**Guards**: JwtAuthGuard, RolesGuard  
**Base Roles**: ADMINISTRADOR, JEFATURA

| Endpoint | Método | Roles | DTO | Descripción |
|----------|--------|-------|-----|-------------|
| /audit | GET | ADMIN, JEFE | — | Listar log de auditoría (filtrado por oficina si JEFATURA) |
| /audit | POST | Interno (no llamar) | — | Registrado automáticamente por interceptor |

**Importante**: Auditoría es **APPEND-ONLY**, nunca UPDATE/DELETE. Cada acción del usuario se registra en `audit_log` automáticamente.

---

### Módulo: ACTION-LOGS (Bitácora de Acciones por Caso)
**Guards**: JwtAuthGuard, RolesGuard

| Endpoint | Método | Roles | DTO | Descripción |
|----------|--------|-------|-----|-------------|
| /action-logs | GET | JWT | — | Listar acciones del caso |
| /action-logs | POST | JWT | { caseId, description, type } | Registrar nueva acción |
| /action-logs/:id/sign | POST | JWT | { signature: string } | Firmar y suscribir acción |

---

### Módulo: DISCIPLINES (Disciplinas Profesionales)
**Guards**: JwtAuthGuard, RolesGuard  
**Base Roles**: ADMINISTRADOR, JEFATURA (lectura)

| Endpoint | Método | Roles | DTO | Descripción |
|----------|--------|-------|-----|-------------|
| /disciplines | GET | Todos | — | Listar disciplinas disponibles (ABOGADO, PSICOLOGO, SOCIAL) |
| /disciplines/:id | GET | Todos | — | Detalle disciplina con tipos de informe |

**Data**: Seeded automáticamente, no modificable vía API (son constantes del negocio)

---

### Módulo: INSTRUMENTS (Escalas y Formularios de Evaluación)
**Guards**: JwtAuthGuard, RolesGuard

| Endpoint | Método | Roles | DTO | Descripción |
|----------|--------|-------|-----|-------------|
| /instruments | GET | Todos | — | Listar instrumentos disponibles (SDQ, Genograma, etc.) |
| /instruments/:id | GET | Todos | — | Detalle instrumento |

---

### Módulo: CATALOGS (Catálogos Dinámicos del Sistema)
**Guards**: JwtAuthGuard, RolesGuard  
**Base Roles**: ADMINISTRADOR

| Endpoint | Método | Roles | DTO | Descripción |
|----------|--------|-------|-----|-------------|
| /catalogs | GET | Todos | — | Listar catálogos (tipos de caso, fases, etc.) |
| /catalogs/:type | GET | Todos | — | Obtener valores de un catálogo específico |
| /catalogs/:type | POST | ADMIN | { name, code, value } | Crear nuevo valor en catálogo |

---

### Módulo: OFFICES (Oficinas y Distritos)
**Guards**: JwtAuthGuard, RolesGuard  
**Base Roles**: ADMINISTRADOR

| Endpoint | Método | Roles | DTO | Descripción |
|----------|--------|-------|-----|-------------|
| /offices | GET | Todos | — | Listar todas las oficinas |
| /offices/:id | GET | Todos | — | Detalle oficina |
| /offices | POST | ADMIN | { name, districtCode, officeCode } | Crear oficina |
| /offices/:id | PATCH | ADMIN | { name, active, etc. } | Actualizar oficina |

---


## 🔄 PARTE 3: FLUJO DE TRANSFERENCIA DE EXPEDIENTES

### A. Transferencia Individual (Reasignación de Profesional)

**Cuándo**: Un profesional (Abogado, Psicólogo, Social) se asigna a un caso o se reasigna

**Quién puede**: JEFATURA, SECRETARIA, ADMINISTRADOR

**Endpoint**: `POST /cases/:id/assign`

**Flujo técnico** (source: `cases.service.ts::assignTeam()`):

```
1. Validar que el caso existe
   ├─ Si no existe → BadRequestException

2. Iniciar transacción Prisma
   ├─ findMany: caseTeamHistory donde { caseId = id, role = dto.role, endDate = null }
   ├─ updateMany: cerrar asignación anterior (set endDate = NOW)
   ├─ create: nueva entrada en caseTeamHistory con:
   │  ├─ caseId
   │  ├─ userId (del profesional nuevo)
   │  ├─ role (ABOGADO, PSICOLOGO, SOCIAL)
   │  ├─ reason (motivo de la reasignación)
   │  ├─ assignedBy (userId del que hizo la reasignación)
   │  └─ startDate = NOW
   └─ Commit transacción

3. Responder con caseTeamHistory.create() resultado
   └─ Registra automáticamente en audit_log (por AuditInterceptor)
```

**Importante**:
- La membresía anterior se **cierra** (endDate ≠ null), no se elimina
- La nueva asignación se **abre** (endDate = null)
- Historial completo queda en `caseTeamHistory` para auditoría
- El caso sigue con `currentPhase` y `currentInterventionPath` igual (no cambian)

**DTO enviado**:
```typescript
{
  userId: string;       // UUID del profesional nuevo
  role: Role;           // ABOGADO, PSICOLOGO, SOCIAL
  reason: string;       // "Rotación programada", "Cambio de jurisdicción", etc.
}
```

**Respuesta exitosa**:
```json
{
  "id": "uuid",
  "caseId": "uuid",
  "userId": "uuid-new-professional",
  "role": "ABOGADO",
  "reason": "Rotación programada",
  "startDate": "2026-08-01T10:30:00Z",
  "endDate": null,
  "assignedBy": "uuid-admin"
}
```

---

### B. Reasignación Masiva (Mass Transfer - ADMINISTRADOR únicamente)

**Cuándo**: Se necesita transferir todos los casos de un profesional a otro  
*Ej: Cambio de distrital, jubilación, incapacidad*

**Quién puede**: ADMINISTRADOR únicamente (sin excepciones)

**Endpoint**: `POST /cases/admin/mass-transfer`

**Flujo técnico** (source: `cases.service.ts::massTransfer()`):

```
1. Validar usuarios
   ├─ Verificar que fromUserId existe
   ├─ Verificar que toUserId existe
   └─ Si no → BadRequestException

2. Buscar TODOS los casos del usuario origen
   ├─ caseTeamHistory donde { userId = fromUserId, endDate = null }
   └─ Obtener lista de caseIds

3. Para CADA caso encontrado:
   ├─ Iniciar transacción Prisma
   ├─ Cerrar asignación anterior
   │  └─ UPDATE caseTeamHistory SET endDate = NOW WHERE caseId = X, userId = fromUserId, endDate = null
   ├─ Abrir asignación nueva
   │  └─ INSERT INTO caseTeamHistory (caseId, userId=toUserId, role, startDate=NOW, assignedBy=admin)
   ├─ Registrar en audit_log
   └─ Commit

4. Retornar objeto con:
   ├─ totalCasesTransferred: número
   ├─ casesDetails: array de { caseId, caseCode, transferredAt }
   └─ timestamp
```

**DTO enviado**:
```typescript
{
  fromUserId: string;   // UUID del profesional que se va
  toUserId: string;     // UUID del profesional que recibe
  reason: string;       // "Jubilación del profesional X", "Reestructuración distrital", etc.
}
```

**Respuesta exitosa**:
```json
{
  "totalCasesTransferred": 12,
  "casesDetails": [
    {
      "caseId": "uuid1",
      "caseCode": "DNA-2026-0001",
      "previousAssignee": { "id": "uuid-old", "name": "Juan Pérez" },
      "newAssignee": { "id": "uuid-new", "name": "María García" },
      "transferredAt": "2026-08-01T10:30:00Z"
    },
    ...
  ],
  "transferredBy": { "id": "uuid-admin", "name": "Administrador" },
  "reason": "Reestructuración"
}
```

---

### C. Transferencia de Oficina (Casos a otra jurisdicción)

**Cuándo**: Un expediente se deriva a otra oficina distrital  
*Ej: Caso de La Paz se atiende en Sucre*

**Endpoint**: (Revisar si existe en `cases.service.ts`) - Probablemente `POST /cases/:id/transfer-office`

**Flujo esperado**:
```
1. Validar caso y oficina destino
2. Registrar en caseOfficeHistory con:
   ├─ caseId
   ├─ officeId (destino)
   ├─ reason (motivo de la derivación)
   └─ transferredBy (UUID del que hizo la transferencia)
3. Actualizar case.currentOfficeId = officeId destino
4. Aplicar RLS (Row Level Security) para que solo oficina destino lo vea
```

---

## 📊 PARTE 4: MATRIZ DE PERMISOS POR ROL (RESUMEN EJECUTIVO)

### ROL: ADMINISTRADOR
**Cargos**: Secretaria de Desarrollo GAM, Directora DNA

**Módulos con acceso total**:
- ✅ USERS: Crear, editar, resetear contraseñas
- ✅ CASES: Ver todos (sin filtro), crear, reasignar, mass-transfer
- ✅ KNOWLEDGE: Ingesta (PDF, URL, Markdown), listar documentos, eliminar, toggle status
- ✅ AI-CONFIG: Configurar Ollama y Whisper locales
- ✅ OFFICES: Crear, editar, listar
- ✅ CATALOGS: CRUD en catálogos dinámicos
- ✅ AUDIT: Ver logs completos sin filtro
- ✅ DISCIPLINES: Lectura (ADMINISTRADOR no edita - son constantes del negocio)
- ✅ APPOINTMENTS: Crear, reasignar
- ✅ REPORTS: Ver todos los informes
- ✅ EVIDENCES: Ver todas

**Módulos sin acceso**:
- ❌ COPILOTO IA: No es profesional de campo

**Búsqueda por rol en frontend**: 
```typescript
if (user?.role === 'ADMINISTRADOR') {
  // Mostrar sidebar con 15 ítems + agrupación en 3 secciones
  // Tabs: Disciplinas, Instrumentos, Config IA, Base Conocimiento, Catálogos, Mantenimiento, Permisos
}
```

---

### ROL: JEFATURA
**Cargos**: Jefe/a de Defensorías, Coordinador/a Distrital

**Módulos con acceso**:
- ✅ CASES: Ver casos de su oficina únicamente
- ✅ USERS: Listar funcionarios (ADMINISTRADOR puede crear, JEFATURA solo lee)
- ✅ APPOINTMENTS: Crear, reasignar
- ✅ AUDIT: Ver logs de su oficina únicamente
- ✅ KNOWLEDGE: Listar documentos (NO crear, NO editar)
- ✅ DISCIPLINES: Lectura únicamente
- ✅ INSTRUMENTS: Lectura únicamente

**Módulos sin acceso**:
- ❌ USERS: Create/Update (solo ADMINISTRADOR)
- ❌ AI-CONFIG: No configura modelos
- ❌ KNOWLEDGE: No ingesta documentos
- ❌ CATALOGS: No modifica catálogos
- ❌ OFFICES: No crea oficinas
- ❌ COPILOTO IA: No es profesional de campo

**Filtrado automático en CASES**:
```typescript
// findAll en backend filtra automáticamente:
WHERE currentOfficeId = user.officeId
```

**Búsqueda por rol en frontend**:
```typescript
if (user?.role === 'JEFATURA') {
  // Mostrar sidebar con 8 ítems (sin admin panels)
  // Tabs accesibles: Panel General, Expedientes, Citas, etc.
  // NO mostrar: Config IA, Base Conocimiento, Catálogos, Mantenimiento, Permisos
}
```

---

### ROL: SECRETARIA
**Cargos**: Secretaria/o, Auxiliar Administrativo

**Módulos con acceso**:
- ✅ CASES: Ver casos de su oficina, crear expedientes
- ✅ APPOINTMENTS: Crear, editar citas
- ✅ USERS: Lectura únicamente
- ✅ DISCIPLINES: Lectura

**Módulos sin acceso**:
- ❌ Todos los admin panels (Config IA, Base Conocimiento, Catálogos, Mantenimiento, Permisos, AUDIT)

**Búsqueda por rol en frontend**:
```typescript
if (user?.role === 'SECRETARIA') {
  // Sidebar: Panel, Citas, Ingesta, Inspecciones, Expedientes (5 ítems)
  // NO acceso a admin areas
}
```

---

### ROL: ABOGADO
**Cargo**: Profesional jurídico

**Módulos con acceso**:
- ✅ CASES: Ver casos donde `caseTeamHistory.endDate = null` (membresía activa)
- ✅ APPOINTMENTS: Crear, reasignar
- ✅ REPORTS: Crear (jurídico), emitir, complementar
- ✅ EVIDENCES: Registrar, ver
- ✅ COPILOTO IA: Usar (redacción de escritos legales)
- ✅ KNOWLEDGE: Lectura (acceso a base legal)

**Módulos sin acceso**:
- ❌ USERS: No gestiona funcionarios
- ❌ Todos los admin panels

**Filtrado automático en CASES**:
```typescript
// findAll en backend filtra:
WHERE caseTeamHistory.userId = user.id AND caseTeamHistory.endDate = null
```

**Búsqueda por rol en frontend**:
```typescript
if (user?.role === 'ABOGADO') {
  // Sidebar: Panel, Citas, Mis Casos, Inspecciones, Copiloto IA (5 ítems)
  // Copiloto muestra: "Copiloto Jurídico (IA Local)"
}
```

---

### ROL: PSICOLOGO
**Cargo**: Profesional psicológico

**Módulos con acceso**:
- ✅ CASES: Ver casos donde membresía activa
- ✅ APPOINTMENTS: Crear, reasignar
- ✅ REPORTS: Crear (psicológico), emitir, complementar
- ✅ EVIDENCES: Registrar, ver
- ✅ COPILOTO IA: Usar (redacción de informes psicológicos)
- ✅ KNOWLEDGE: Lectura

**Búsqueda por rol en frontend**:
```typescript
if (user?.role === 'PSICOLOGO') {
  // Sidebar: Panel, Citas, Mis Casos, Indicadores de Riesgo, Copiloto IA (5 ítems)
  // Copiloto muestra: "Copiloto Psicológico (IA Local)"
}
```

---

### ROL: SOCIAL
**Cargo**: Profesional de trabajo social

**Módulos con acceso**:
- ✅ CASES: Ver casos donde membresía activa
- ✅ APPOINTMENTS: Crear, reasignar
- ✅ REPORTS: Crear (social), emitir, complementar
- ✅ EVIDENCES: Registrar, ver
- ✅ COPILOTO IA: Usar (redacción de informes sociales)
- ✅ KNOWLEDGE: Lectura

**Búsqueda por rol en frontend**:
```typescript
if (user?.role === 'SOCIAL') {
  // Sidebar: Panel, Citas, Mis Casos, Directorio Derivación, Copiloto IA (5 ítems)
  // Copiloto muestra: "Copiloto Social (IA Local)"
}
```

---

### ROL: REFERENTE_TUTOR
**Cargo**: Tutor legal del NNA

**Módulos con acceso**:
- ✅ PORTAL (ruta separada): Acceso único a su expediente asignado
- ✅ CASES: Lectura del caso usando `caseCode` (no UUID)
- ✅ APPOINTMENTS: Ver citas de su expediente

**Módulos sin acceso**:
- ❌ Dashboard administrativo
- ❌ Crear información
- ❌ Editar

**Verificación especial** (source: `case-access.service.ts`):
```typescript
if (user.isPortal === true && user.caseCode === case.caseCode) {
  // Acceso concedido (lectura)
} else {
  // Denegado
}
```

**Búsqueda por rol en frontend**:
```typescript
if (user?.role === 'REFERENTE_TUTOR') {
  // NO mostrar layout.tsx del dashboard
  // Redirigir a /portal (ruta separada)
  // Sidebar diferente: Estado del Caso, Mis Citas, Portal del Tutor
}
```

---


## 🔌 PARTE 5: SINCRONIZACIÓN FRONTEND-BACKEND (SIN HARDCODING)

### Principio Fundamental
**El frontend NUNCA debe contener listas hardcodeadas de roles, permisos o módulos.**  
**TODO debe venir del backend o estar sincronizado dinámicamente.**

### Implementación: Guards Dinámicos en Frontend

#### A. Guard de Rol en Página Administrativo

**Patrón**:
```typescript
'use client';

import { useAuth } from '@/lib/auth-context';
import { AccesoRestringido } from '@/components/common/acceso-restringido';

export default function AdminPage() {
  const { user } = useAuth();

  // ❌ NO HACER:
  // if (!['ADMINISTRADOR'].includes(user?.role)) { ... }

  // ✅ HACER (SIN HARDCODING):
  if (user?.role !== 'ADMINISTRADOR') {
    return (
      <AccesoRestringido 
        mensaje="La gestión de la base de conocimiento jurídico (RAG) es exclusiva del Administrador General." 
      />
    );
  }

  // Resto del componente...
}
```

**Ventaja**: El rol 'ADMINISTRADOR' viene del backend en `user.role` (del JWT).  
No es un string mágico, es la FUENTE DE VERDAD del backend.

---

#### B. Menú Dinámico del Sidebar

**Problema**: Tener arrays hardcodeados como `NAV_ITEMS_BY_ROLE` crea:
- Desincronización si se agregan roles en backend
- Imposibilidad de agregar/quitar ítems sin redeploy frontend
- UI muestra lo que no debe (si permisos cambian en backend)

**Solución 1: Hardcoding Controlado** (Actual - Aceptable porque roles son **constantes de negocio**)

```typescript
// apps/web/components/layout/sidebar.tsx
const NAV_ITEMS_BY_ROLE: Record<string, NavItem[]> = {
  ADMINISTRADOR: [
    { label: 'Panel General', href: '/panel', icon: LayoutDashboard },
    { label: 'Base de Conocimiento', href: '/panel/admin/conocimiento', icon: Database },
    ...
  ],
  ABOGADO: [
    { label: 'Panel General', href: '/panel', icon: LayoutDashboard },
    { label: 'Copiloto IA', href: '/copilot', icon: BrainCircuit },
    ...
  ],
  ...
};
```

**Justificación**: 
- Los 7 roles son **constantes de dominio** (`enum Role` en `packages/shared`)
- Los cambios de roles son raros y requieren redeploy de ambos sistemas
- El mapeo roles→menú es **lógica UI**, no datos

**Solución 2: Dinámico desde Backend** (Opcional para futuro)

```typescript
// Si hay mucha variabilidad, agregar endpoint:
GET /users/me/sidebar-items
→ Retorna array de NavItems según role + permisos dinámicos
→ Frontend renderiza array recibido

// Ventaja: Zero redeploy de frontend para agregar ítems
// Desventaja: Latencia extra, complejidad
```

---

#### C. Permisos Dinámicos en Botones/Acciones

**Patrón**: Basarse en respuesta del backend, no en rol local

```typescript
// ❌ MAL:
{user?.role === 'ADMINISTRADOR' && (
  <button onClick={() => deleteDocument()}>Eliminar</button>
)}

// ✅ BIEN:
// 1. Intentar la acción
// 2. Si backend retorna 403 Forbidden, mostrar error
// 3. Usar error del backend para desabilitar UI

const [canDelete, setCanDelete] = useState(true);

useEffect(() => {
  // Verificar permiso consultando backend
  checkPermission('documents:delete').then(setCanDelete);
}, []);

{canDelete && (
  <button onClick={deleteDocument}>Eliminar</button>
)}

// Alternativa más simple: Try + Catch
async function deleteDocument() {
  try {
    await fetchApi(`/documents/${id}`, { method: 'DELETE' });
    toast.success('Documento eliminado');
  } catch (err) {
    if (err.status === 403) {
      toast.error('No tienes permisos para eliminar documentos');
    } else {
      toast.error(err.message);
    }
  }
}
```

---

### Implementación: useAuth Hook (Fuente de Verdad)

**Ubicación**: `apps/web/lib/auth-context.tsx`

```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;              // ← Viene del backend (JWT)
  officeId?: string;       // ← Viene del backend (JWT)
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return { user, token, isLoading, login, logout };
}
```

**Garantías**:
- `user.role` **siempre** es string válido de `enum Role` (backend no envía valores inválidos)
- `user.officeId` es null si `user.role === 'ADMINISTRADOR'`
- El token JWT contiene la verdad validada por backend

---

## ✅ PARTE 6: CHECKLIST DE VALIDACIÓN PARA AGENTES

### Antes de Modificar Código Frontend

- [ ] Verifiqué que el rol existe en `packages/shared/src/index.ts` enum Role
- [ ] Verifiqué que el endpoint requiere ese rol en backend (`@Roles()` decorator)
- [ ] Verifiqué que `CaseAccessService` permite el acceso si es módulo CASES
- [ ] No hay strings mágicos de rol (usar `user.role === 'X'`, no arrays locales)
- [ ] Si creo guard: verifico que el endpoint backend tiene `@Roles()` correspondiente
- [ ] Si muestro dato sensitive: verifico que solo se muestra al rol correcto
- [ ] Si elimino something: verifico que backend soporta DELETE en ese endpoint
- [ ] Compilé sin errores: `npx tsc --noEmit --skipLibCheck`

### Antes de Modificar Código Backend

- [ ] Verifiqué que el rol existe en enum Role
- [ ] Si creo nuevo endpoint: agregué `@Roles()` con roles apropiados
- [ ] Si es módulo CASES: verifiqué que `CaseAccessService` filtra correctamente
- [ ] Verifiqué que DTOs validan entrada con class-validator
- [ ] Verifiqué que `AuditInterceptor` registra la acción
- [ ] Verifiqué que respuesta es consistente con otros endpoints del módulo
- [ ] Corrí `npx tsc --noEmit` en apps/api
- [ ] Probé con curl o Postman con token de cada rol

### Antes de Crear Frontend Page

- [ ] Leí documentación de modulo backend (qué endpoints existen)
- [ ] Verifiqué permisos: ¿cuál es `@Roles()` en el endpoint?
- [ ] Agregué guard: `if (user?.role !== 'REQUIRED_ROLE') return <AccesoRestringido />`
- [ ] Probé con token de rol que NO tiene acceso (verificar 403)
- [ ] Probé con token de rol que sí tiene acceso (verificar funcionamiento)

---

## 📚 PARTE 7: REFERENCIAS RÁPIDAS

### Dónde encontrar cada cosa

| Necesito... | Busco en... | Archivo |
|-------------|------------|---------|
| Definición de roles | Enum | `packages/shared/src/index.ts` |
| Permisos de endpoint X | Decorador @Roles | `apps/api/src/modules/*/[module].controller.ts` |
| Lógica de acceso a caso | Service | `apps/api/src/common/case-access/case-access.service.ts` |
| Transferencia de caso | Service | `apps/api/src/modules/cases/cases.service.ts` |
| Guard de rol en frontend | Hook | `apps/web/lib/auth-context.tsx` |
| Componente de acceso restringido | Componente | `apps/web/components/common/acceso-restringido.tsx` |
| Sidebar multi-rol | Componente | `apps/web/components/layout/sidebar.tsx` |

### Comandos útiles

```bash
# Verificar compilación backend
cd apps/api && npx tsc --noEmit

# Verificar compilación frontend
cd apps/web && npx tsc --noEmit --skipLibCheck

# Ver roles disponibles en shared
grep -A 10 "enum Role" packages/shared/src/index.ts

# Buscar todos los @Roles en backend
grep -r "@Roles" apps/api/src/modules/*/

# Ver endpoints de un módulo
grep -E "^  @(Get|Post|Patch|Delete)" apps/api/src/modules/MODULO/MODULO.controller.ts
```

---

## 🎯 PARTE 8: INFORME PSICOSOCIAL - ARQUITECTURA DE COAUTORÍA

> **IMPORTANTE**: NO existe un rol `PSICOSOCIAL` en el enum `Role`. El informe psicosocial se modela con la **categoría** `INFORME_PSICOSOCIAL` del enum `ReportCategory` y se emite con **autor + coautor** de las disciplinas complementarias (PSICOLOGO + SOCIAL) vía `coAuthorId`. No agregar roles nuevos al sistema.

### Escenario: Emitir un informe psicosocial (equipo PSICOLOGO + SOCIAL)

### Paso 1: La categoría, no un rol

**Archivo**: `packages/shared/src/index.ts`
```typescript
export enum ReportCategory {
  INFORME_SOCIAL = 'INFORME_SOCIAL',
  INFORME_PSICOLOGICO = 'INFORME_PSICOLOGICO',
  INFORME_PSICOSOCIAL = 'INFORME_PSICOSOCIAL',
  INFORME_JURIDICO = 'INFORME_JURIDICO',
  INFORME_SESION_SEGUIMIENTO = 'INFORME_SESION_SEGUIMIENTO',
  INFORME_FINAL_CONCILIACION = 'INFORME_FINAL_CONCILIACION',
  INFORME_COMPLEMENTARIO = 'INFORME_COMPLEMENTARIO',
}
```

La categoría del informe se resuelve a través de la tabla `DisciplineReportType` (FK `disciplineReportTypeId` en `Report`), no por el rol del usuario.

### Paso 2: Crear el informe con el tipo de disciplina

**Archivo**: `apps/api/src/modules/reports/reports.service.ts` — `CreateReportDto`
```typescript
export interface CreateReportDto {
  caseId: string;
  disciplineReportTypeId: string;  // UUID de DisciplineReportType cuya category = INFORME_PSICOSOCIAL
  title: string;
  content: string;
  riskAssessment?: RiskLevel;
}
```

El autor crea el borrador con `status: BORRADOR`; su rol se valida contra la categoría en `checkReportRolePermission` (un `PSICOLOGO` o `SOCIAL` puede redactar un informe psicosocial).

### Paso 3: Emisión con coautor obligatorio

Al emitir (`POST /reports/:id/emit`), si la categoría es `INFORME_PSICOSOCIAL` se exige `report.coAuthorId`:

```typescript
if (report.disciplineReportType?.category === ReportCategory.INFORME_PSICOSOCIAL) {
  if (!report.coAuthorId) {
    throw new BadRequestException('Informe psicosocial requiere coautor de la disciplina complementaria');
  }
  // El conjunto { author.role, coAuthor.role } debe ser EXACTAMENTE { PSICOLOGO, SOCIAL }
}
```

- Sin `coAuthorId`, la emisión falla con error.
- ⚠️ Hoy la validación existe, pero ningún flujo operativo de asignación de coautor está implementado en producción (solo tests escriben `coAuthorId`). Si se implementa la asignación, debe escribirse `coAuthorId` antes de la emisión.

### Paso 4: Complementos sobre informes emitidos

**Archivo**: `apps/api/src/modules/reports/reports.controller.ts`
```typescript
@Post(':id/complementary')  // Crea informe complementario (v2, v3) sobre un informe EMITIDO
```

- El complemento reutiliza la `disciplineReportTypeId` del informe padre, incrementa `version` y enlaza `parentReportId`.
- El rol del autor se valida igual que en `create`.

### Paso 5: Verificación

```bash
# Confirmar que NO existe rol PSICOSOCIAL en el enum Role
grep -n "PSICOSOCIAL" packages/shared/src/index.ts   # solo aparece en ReportCategory

# Confirmar el endpoint complementario
grep -n "complementary" apps/api/src/modules/reports/reports.controller.ts
```

> **Regla**: para agregar capacidades psicosociales NO se agregan roles nuevos; se usa la categoría `INFORME_PSICOSOCIAL` y el par autor (PSICOLOGO) + coautor (SOCIAL) vía `coAuthorId`.

---

## 📞 CONTACTO Y SOPORTE

**Si encuentras inconsistencias** entre este documento y el código:
1. El código es la verdad (siempre)
2. Este documento debe actualizarse (es documentación)
3. Reporta en: `docs/agentes-ia/INSTRUCCIONES-AGENTES.md` (este archivo)

**Última actualización**: 2026-08-01  
**Generado por**: Kiro Agente Senior  
**Basado en**: Análisis exhaustivo del código NestJS + Next.js real

