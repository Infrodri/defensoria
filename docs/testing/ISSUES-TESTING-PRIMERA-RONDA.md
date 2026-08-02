# 🐛 ISSUES ENCONTRADOS - PRIMERA RONDA DE TESTING

**Fecha**: 1 de agosto de 2026  
**Tester**: Usuario (testing visual en entorno real)  
**Branch**: feature/backend-tools-parallel  
**Resultado**: ❌ PRIMERA PRUEBA FALLIDA - Necesidad de varios cambios

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Issues | Prioridad |
|-----------|--------|-----------|
| **Formulario Ingreso de Caso** | 3 | 🔴 ALTA |
| **Equipo Interdisciplinario** | 2 | 🔴 CRÍTICA |
| **Informes Profesionales** | 1 | 🟡 MEDIA |
| **Evidencias** | 1 | 🟡 MEDIA |
| **Bitácora de Actuaciones** | 1 | 🟢 BAJA |
| **Agenda de Citas** | 1 | 🟡 MEDIA |

**Total Issues**: 9  
**Issues Críticos**: 2  
**Issues Bloqueantes**: 1 (Error 500 en asignación)

---

## 🔴 ISSUE #1: DENUNCIANTE vs TERCERO (CRÍTICO)

### **Problema Identificado**
El formulario actual NO diferencia entre:
- **Denunciante = NNA** (el mismo NNA denuncia)
- **Denunciante = Tercero** (madre, padre, docente, vecino, etc.)

### **Datos de Ejemplo Proporcionados**
```
NNA:
- Nombres: Camila Fernanda
- Apellidos: Rojas Quispe
- Fecha Nacimiento: 14/03/2014 (11 años)
- Sexo: Femenino
- Dirección: Calle Bolívar #245, Barrio San Roque
- Ciudad: Sucre
- Teléfono: 71234501
- Documento: CI 0045123
```

### **Solución Requerida**

#### **A. Agregar Checkbox en Formulario**
```
[ ] ¿La denuncia es presentada por un tercero?

SI checkbox = false (default):
  - Denunciante = NNA (datos ya capturados arriba)
  - No mostrar sección adicional

SI checkbox = true:
  - Mostrar sección "Datos del Denunciante"
  - Campos:
    * Nombres completos
    * CI / Documento
    * Relación con el NNA (madre, padre, tío, docente, vecino, otro)
    * Teléfono de contacto
    * Dirección (opcional)
```

#### **B. Integración SEGIP (FUTURO)**
**Fase 1** (ahora): Formulario manual completo  
**Fase 2** (futuro): Al ingresar CI → autocompletar desde SEGIP

**Nota**: SEGIP requiere:
- Convenio institucional firmado
- Credenciales API
- Homologación de servicio web

#### **C. Cambios en Schema Prisma**
```prisma
model Case {
  // ... campos existentes
  
  // Denunciante
  isThirdPartyComplainant Boolean @default(false)
  complainantFullName     String?
  complainantDocumentId   String?
  complainantRelation     String?  // MADRE, PADRE, TIO, DOCENTE, VECINO, OTRO
  complainantPhone        String?
  complainantAddress      String?
}
```

#### **D. Validaciones**
- Si `isThirdPartyComplainant = true` → campos de denunciante OBLIGATORIOS
- Si `isThirdPartyComplainant = false` → campos de denunciante NULL

---

## 🔴 ISSUE #2: TIPOS DE CASO NO PARAMETRIZABLES (ALTA)

### **Problema Identificado**
Los "Tipos de Caso" están hardcodeados en el código. ADMIN/JEFATURA necesita poder:
- Agregar nuevos tipos de caso
- Modificar tipos existentes
- Activar/desactivar tipos
- Ordenar por frecuencia de uso

**Ejemplo Actual** (hardcoded):
- "Denuncia por Vulneración de Derechos"
- "Extravío / Desaparición"
- etc.

### **Solución Requerida**

#### **A. Módulo de Catálogos** (YA EXISTE PARCIALMENTE)
Ubicación: `apps/api/src/modules/catalogs/`

**Ampliar para incluir**:
```typescript
// Tipos de catálogos
enum CatalogType {
  CASE_TYPE          // Tipos de caso ← NUEVO
  RISK_LEVEL         // Niveles de riesgo (existente)
  INTERVENTION_TYPE  // Tipos de intervención (existente)
  // ... otros
}
```

#### **B. Tabla de Items de Catálogo**
```prisma
model CatalogItem {
  id          String   @id @default(uuid())
  catalogType String   // "CASE_TYPE"
  code        String   // "VULNERACION_DERECHOS"
  label       String   // "Denuncia por Vulneración de Derechos"
  description String?
  isActive    Boolean  @default(true)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedBy   String?
  
  @@unique([catalogType, code])
  @@index([catalogType, isActive])
}
```

#### **C. Panel de Administración**
Ruta: `/panel/admin/catalogos/tipos-caso`

**Funcionalidades**:
- ✅ Listar tipos de caso activos
- ✅ Crear nuevo tipo
- ✅ Editar tipo existente
- ✅ Activar/Desactivar (soft delete)
- ✅ Reordenar (drag & drop o flechas)
- ✅ Búsqueda y filtros

#### **D. Consumo en Formulario**
```typescript
// Frontend: apps/web/app/(dashboard)/ingreso-caso/page.tsx
const { data: caseTypes } = useCatalog('CASE_TYPE');

// Renderizar select dinámico
<select>
  {caseTypes?.map(type => (
    <option key={type.id} value={type.code}>
      {type.label}
    </option>
  ))}
</select>
```

---

## 🔴 ISSUE #3: GRABAR ENTREVISTA INICIAL (ALTA)

### **Problema Identificado**
En el formulario de ingreso, se necesita la opción de:
1. **Redactar** la narrativa (ya existe)
2. **Grabar audio** de la primera intervención/entrevista

### **Solución Requerida**

#### **A. Agregar Botón en Narrativa Inicial**
```
┌─────────────────────────────────────────────┐
│ Narrativa Inicial / Hechos de la Denuncia  │
├─────────────────────────────────────────────┤
│                                             │
│ [Textarea para redactar...]                 │
│                                             │
├─────────────────────────────────────────────┤
│ [🎙️ Grabar Primera Entrevista]              │
│ [ ] Adjuntar grabación como evidencia       │
└─────────────────────────────────────────────┘
```

#### **B. Flujo de Grabación**
```
1. Click en "🎙️ Grabar Primera Entrevista"
2. Solicitar permisos de micrófono (browser)
3. Iniciar grabación (mostrar timer)
4. Pausar/Reanudar (opcional)
5. Detener grabación
6. Reproducir preview
7. [Descartar] o [Guardar]
8. Si se marca checkbox "Adjuntar como evidencia":
   → Automáticamente crear registro en tabla Evidence
   → Tipo: AUDIO_RECORDING
   → Categoría: ENTREVISTA_INICIAL
```

#### **C. Backend: Servicio de Transcripción**
Ya existe parcialmente: `apps/api/src/modules/knowledge/transcription.service.ts`

**Ampliar para**:
- Aceptar formato `.m4a` (audio iPhone/Android)
- Transcribir audio a texto (usar Whisper local o API)
- Almacenar:
  * Audio original en `uploads/evidencias/audio/`
  * Transcripción en campo `transcription` de Evidence

#### **D. Schema de Evidence**
```prisma
model Evidence {
  // ... campos existentes
  
  // Para audios
  audioFormat      String?      // "m4a", "mp3", "wav"
  audioDurationSec Int?         // Duración en segundos
  transcription    String?      // Texto transcrito automáticamente
  transcriptionAt  DateTime?    // Cuándo se transcribió
  isInterviewAudio Boolean @default(false) // Si es audio de entrevista
}
```

---

## 🔴 ISSUE #4: ERROR 500 AL ASIGNAR PROFESIONAL (BLOQUEANTE)

### **Problema Identificado**
**Captura 3**: Al intentar asignar un profesional al equipo interdisciplinario:

```
Error HTTP 403 (Forbidden) en consola
Error HTTP 500 (Internal Server Error) en:
POST /api/cases/d8520757-01a0-4e3f-b525-64d2b4c86fe4/assign
```

### **Diagnóstico Probable**

#### **A. Error 403 - Forbidden**
Posibles causas:
1. Guard de roles rechaza la operación
2. Usuario actual no tiene permisos de JEFATURA
3. JWT malformado o expirado

#### **B. Error 500 - Internal Server Error**
Posibles causas:
1. Campo `professionalId` vacío o inválido (campo de texto vacío en imagen 3)
2. Foreign key constraint falla (usuario no existe)
3. Validación DTO falla
4. Query Prisma tiene error de sintaxis

### **Solución Requerida**

#### **A. Verificar Guard de Roles**
Archivo: `apps/api/src/modules/cases/cases.controller.ts`

```typescript
@Post(':id/assign')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.JEFATURA, Role.ADMINISTRADOR) // ← Verificar estos roles
async assignProfessional(
  @Param('id') caseId: string,
  @Body() dto: AssignProfessionalDto,
) {
  // ...
}
```

#### **B. Selector de Profesionales Vacío**
**Problema en imagen 3**: El campo "Profesional Asignado" aparece vacío (ID del profesional)

**Solución**:
```typescript
// Frontend debe cargar lista de profesionales por rol
const { data: professionals } = useQuery({
  queryKey: ['professionals', selectedRole],
  queryFn: () => fetchApi(`/api/users?role=${selectedRole}&isActive=true`)
});

// Renderizar select poblado
<select>
  <option value="">Seleccionar profesional...</option>
  {professionals?.map(user => (
    <option key={user.id} value={user.id}>
      {user.firstName} {user.lastName} - {user.email}
    </option>
  ))}
</select>
```

#### **C. DTO de Validación**
```typescript
// apps/api/src/modules/cases/dto/assign-professional.dto.ts
export class AssignProfessionalDto {
  @IsUUID()
  @IsNotEmpty()
  professionalId: string;  // ← Asegurar que NO sea vacío
  
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
  
  @IsString()
  @IsOptional()
  reason?: string;
}
```

#### **D. Endpoint para Obtener Profesionales**
```typescript
// apps/api/src/modules/users/users.controller.ts
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.JEFATURA, Role.ADMINISTRADOR)
async findByRole(
  @Query('role') role?: string,
  @Query('isActive') isActive?: string,
) {
  return this.usersService.findByRole({
    role: role as Role,
    isActive: isActive === 'true'
  });
}
```

---

## 🟡 ISSUE #5: SECRETARIA PUEDE VER INFORMES COMPLETOS (MEDIA)

### **Problema Identificado**
**Captura 4**: SECRETARIA tiene acceso a "Informes Profesionales" con opción de redactar informes completos.

**Debería**:
- Ver LISTA de informes (quién, cuándo, tipo)
- NO ver contenido del informe
- NO poder redactar informes (es función de SOCIAL, PSICOLOGO, ABOGADO)

### **Solución Requerida**

#### **A. Vista Diferenciada por Rol**
```typescript
// Frontend: apps/web/app/(dashboard)/casos/[id]/informes/page.tsx

if (currentUser.role === 'SECRETARIA' || currentUser.role === 'JEFATURA') {
  // Solo mostrar resumen
  return (
    <ReportsSummaryView reports={reports} />
  );
} else if (isProfessionalRole(currentUser.role)) {
  // Mostrar vista completa con redacción
  return (
    <ReportsFullView reports={reports} canCreate={true} />
  );
}
```

#### **B. Resumen para SECRETARIA**
```tsx
<div>
  <h3>Informes Profesionales Emitidos</h3>
  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Tipo</th>
        <th>Profesional</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      {reports.map(report => (
        <tr>
          <td>{formatDate(report.createdAt)}</td>
          <td>{report.type}</td>
          <td>{report.author.firstName} {report.author.lastName}</td>
          <td>
            <Badge color={report.isDraft ? 'yellow' : 'green'}>
              {report.isDraft ? 'Borrador' : 'Completo'}
            </Badge>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

#### **C. Backend: Filter por Rol**
```typescript
// apps/api/src/modules/reports/reports.service.ts
async findByCaseId(caseId: string, requestingUser: User) {
  if (requestingUser.role === Role.SECRETARIA) {
    // Solo retornar metadata, NO content
    return this.prisma.report.findMany({
      where: { caseId },
      select: {
        id: true,
        type: true,
        isDraft: true,
        createdAt: true,
        author: {
          select: { firstName: true, lastName: true, role: true }
        },
        // NO incluir: content, recommendations, findings
      }
    });
  }
  
  // Para otros roles: retornar completo
  return this.prisma.report.findMany({ where: { caseId } });
}
```

---

## 🟡 ISSUE #6: FORMATO M4A NO PERMITIDO EN EVIDENCIAS (MEDIA)

### **Problema Identificado**
Al intentar subir audio grabado en formato `.m4a` (estándar iPhone/Android):
- Sistema rechaza el archivo
- No hay mensaje claro de error

### **Solución Requerida**

#### **A. Ampliar Tipos MIME Permitidos**
```typescript
// apps/api/src/modules/evidences/evidences.service.ts
const ALLOWED_AUDIO_FORMATS = [
  'audio/mpeg',        // .mp3
  'audio/wav',         // .wav
  'audio/x-m4a',       // .m4a (iOS)
  'audio/mp4',         // .m4a (Android)
  'audio/aac',         // .aac
  'audio/ogg',         // .ogg
];

const ALLOWED_VIDEO_FORMATS = [
  'video/mp4',         // .mp4
  'video/quicktime',   // .mov (iOS)
  'video/x-msvideo',   // .avi
];
```

#### **B. Validación en Frontend**
```typescript
// apps/web/components/evidence-upload.tsx
const ACCEPTED_FILES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  'application/pdf': ['.pdf'],
  'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg'],
  'video/*': ['.mp4', '.mov', '.avi']
};

<input
  type="file"
  accept={Object.keys(ACCEPTED_FILES).join(',')}
  onChange={handleFileUpload}
/>
```

#### **C. Mensaje de Error Claro**
```typescript
if (!isAllowedFormat(file.type)) {
  toast.error(
    `Formato no permitido: ${file.type}\n` +
    `Formatos aceptados: JPG, PNG, PDF, MP3, M4A, MP4`
  );
  return;
}
```

#### **D. Backend: Validación Robusta**
```typescript
// apps/api/src/common/pipes/file-validation.pipe.ts
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    const allowedMimes = [
      ...ALLOWED_AUDIO_FORMATS,
      ...ALLOWED_VIDEO_FORMATS,
      ...ALLOWED_IMAGE_FORMATS,
      ...ALLOWED_DOCUMENT_FORMATS,
    ];
    
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Formato no permitido: ${file.mimetype}`
      );
    }
    
    return file;
  }
}
```

---

## 🟢 ISSUE #7: BITÁCORA DE ACTUACIONES - ACLARACIÓN (BAJA)

### **Problema Identificado**
**Captura 5**: Usuario pregunta sobre el propósito de "Bitácora / Actuaciones"

### **Respuesta**

La **Bitácora de Actuaciones** es un registro cronológico de TODAS las acciones realizadas en el expediente:

#### **Tipos de Actuaciones**
1. **Entrevista / Declaración**: Registro de entrevistas realizadas
2. **Visita Domiciliaria**: Visitas a domicilio del NNA
3. **Audiencia**: Audiencias judiciales o conciliación
4. **Derivación**: Cuando se deriva a otra institución
5. **Seguimiento**: Actuaciones de seguimiento del caso
6. **Notificación**: Notificaciones enviadas/recibidas
7. **Otro**: Otras actuaciones no clasificadas

#### **Diferencia con ActionLog**
- **ActionLog**: Registro AUTOMÁTICO de cambios en el sistema (fase, ruta, asignación)
- **Bitácora**: Registro MANUAL de actuaciones profesionales

#### **Uso Correcto**
```
Ejemplo 1:
Tipo: Entrevista / Declaración
Título: Entrevista inicial con la madre
Contenido: Se realizó entrevista con la Sra. María Rojas...

Ejemplo 2:
Tipo: Visita Domiciliaria
Título: Primera visita al domicilio
Contenido: Se realizó visita al domicilio ubicado en...

Ejemplo 3:
Tipo: Derivación
Título: Derivación a SLIM municipal
Contenido: Se derivó el caso a SLIM para acompañamiento legal...
```

---

## 🟡 ISSUE #8: AGENDA DE CITAS - DELEGACIÓN Y CONFIRMACIÓN (MEDIA)

### **Problema Identificado**
**Captura 7**: La agenda permite programar citas directamente sin:
1. Consultar disponibilidad del profesional
2. Confirmar con el profesional asignado
3. Validar que el profesional tenga disponibilidad

### **Solución Requerida**

#### **A. Flujo Mejorado de Agendamiento**

**Opción 1: Agendamiento Directo** (actual)
- JEFATURA/SECRETARIA puede agendar directamente
- Profesional recibe notificación
- Profesional puede aceptar/rechazar/reprogramar

**Opción 2: Solicitud de Cita** (nuevo flujo)
```
1. SECRETARIA solicita cita
2. Sistema busca profesional con menor carga
3. Profesional recibe solicitud
4. Profesional propone horario
5. Sistema notifica a SECRETARIA
6. SECRETARIA confirma
7. Cita agendada
```

#### **B. Estados de Cita**
```prisma
enum AppointmentStatus {
  SOLICITADA      // Cita solicitada, pendiente confirmación
  CONFIRMADA      // Confirmada por profesional
  REAGENDADA      // Fue reprogramada
  COMPLETADA      // Se realizó
  CANCELADA       // Cancelada
  NO_ASISTIO      // NNA no asistió
}
```

#### **C. Vista de Disponibilidad**
```tsx
// Mostrar calendario con disponibilidad del profesional
<CalendarView>
  {professionals.map(prof => (
    <ProfessionalAvailability
      professional={prof}
      appointments={prof.appointments}
      workingHours={prof.workingHours}
    />
  ))}
</CalendarView>
```

#### **D. Notificaciones**
```typescript
// Cuando se agenda una cita
await notificationService.send({
  to: professionalId,
  type: 'NEW_APPOINTMENT',
  title: 'Nueva cita asignada',
  body: `Se te asignó cita con ${nnaName} para ${date}`,
  actions: [
    { label: 'Ver Detalles', url: `/casos/${caseId}/citas` },
    { label: 'Reagendar', url: `/casos/${caseId}/citas/${appointmentId}/reschedule` }
  ]
});
```

---

## ✅ POSITIVOS IDENTIFICADOS

### **Línea de Tiempo** (Captura 6)
> "la linea de tiempo esta perfecto"

✅ **Funcionamiento correcto**:
- Cronología consolidada de eventos
- Registro de evidencias adjuntadas
- Apertura de expediente visible
- Formato claro y legible

---

## 📋 PLAN DE CORRECCIÓN

### **Prioridad 1 - CRÍTICA** (Bloqueantes)
1. ✅ **ISSUE #4**: Corregir error 500 en asignación de profesionales
   - Tiempo estimado: 2 horas
   - Requiere: Debug backend, fix DTO, poblar selector

### **Prioridad 2 - ALTA** (Funcionalidades core faltantes)
2. ✅ **ISSUE #1**: Implementar denunciante vs tercero
   - Tiempo estimado: 4 horas
   - Requiere: Schema, frontend, validaciones

3. ✅ **ISSUE #2**: Módulo de tipos de caso parametrizables
   - Tiempo estimado: 6 horas
   - Requiere: Catálogos, panel admin, endpoints

4. ✅ **ISSUE #3**: Grabación de entrevista inicial
   - Tiempo estimado: 8 horas
   - Requiere: Componente grabador, upload audio, transcripción

### **Prioridad 3 - MEDIA** (Mejoras UX/Permisos)
5. ✅ **ISSUE #5**: Restringir vista de informes para SECRETARIA
   - Tiempo estimado: 2 horas
   - Requiere: Filtros por rol, vistas diferenciadas

6. ✅ **ISSUE #6**: Permitir formato M4A en evidencias
   - Tiempo estimado: 1 hora
   - Requiere: Ampliar MIME types, validaciones

7. ✅ **ISSUE #8**: Mejorar flujo de agendamiento
   - Tiempo estimado: 5 horas
   - Requiere: Estados de cita, notificaciones, vista de disponibilidad

### **Prioridad 4 - BAJA** (Documentación)
8. ✅ **ISSUE #7**: Documentar bitácora de actuaciones
   - Tiempo estimado: 30 min
   - Requiere: Agregar a guías de usuario

---

## 📈 ESTIMACIÓN TOTAL

| Prioridad | Issues | Tiempo Estimado |
|-----------|--------|-----------------|
| Crítica | 1 | 2 horas |
| Alta | 3 | 18 horas |
| Media | 3 | 8 horas |
| Baja | 1 | 0.5 horas |
| **TOTAL** | **8** | **28.5 horas** |

**Distribución en sprints**:
- **Sprint 1** (Crítico + Alta): 20 horas (~3 días)
- **Sprint 2** (Media): 8 horas (~1 día)
- **Sprint 3** (Baja + Refinamiento): 0.5 horas

---

## 🎯 DECISIÓN REQUERIDA

**¿Cómo deseas proceder?**

**Opción A**: Corregir TODO antes de continuar con ficha social/conciliación  
**Opción B**: Corregir solo bloqueantes (ISSUE #4) y continuar testing de ficha/conciliación  
**Opción C**: Delegamos correcciones a agente especializado mientras tú sigues testing  

---

**FIN DEL DOCUMENTO DE ISSUES**
