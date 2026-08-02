# 📋 INSTRUCCIÓN PARA AGENTE - Completar 6 Issues Restantes

**Fecha**: 1 de agosto de 2026  
**Branch**: feature/backend-tools-parallel  
**Objetivo**: Completar ISSUES #2, #3, #5, #6, #8, #7 (sin testing manual)  
**Autonomía**: 100% - No requiere aprobación entre cambios

---

## 📌 RESUMEN EJECUTIVO

Se requiere completar 6 issues de desarrollo identificados en testing manual:

| Issue | Tarea | Prioridad | Estimado | Estado |
|-------|-------|-----------|----------|--------|
| #2 | Catálogos: Tipos de caso parametrizables | ALTA | 2h | 80% |
| #3 | Audio: Grabación de entrevista inicial | ALTA | 8h | 0% |
| #5 | Permisos: Vista informes para SECRETARIA | MEDIA | 2h | 0% |
| #6 | Formato: Permitir M4A en evidencias | MEDIA | 1h | 0% |
| #8 | Agendamiento: Estados y confirmación | MEDIA | 5h | 0% |
| #7 | Docs: Bitácora de actuaciones | BAJA | 0.5h | 0% |

**Total**: 18.5 horas de trabajo de desarrollo

---

## 🔧 REQUISITOS PREVIOS

### Ya Completado ✅
- ISSUE #4 CRÍTICO: Asignación de profesionales
- ISSUE #1 ALTA: Denunciante vs tercero
- Backend compila sin errores
- DB sincronizada

### Ambiente Setup
```bash
cd c:\dev\defensoria
git checkout feature/backend-tools-parallel
# Backend corriendo: npm run dev (apps/api)
# Frontend corriendo: npm run dev (apps/web)
# DB: PostgreSQL en localhost:5435
```

---

## 📝 ISSUE #2 ALTA - Catálogos Tipos de Caso (Completar)

**Estado Actual**: 80% - Solo falta el frontend

### Backend ✅ (Completo)
- Modelos: SystemCatalog, CatalogItem
- Endpoints: GET /catalogs, POST /catalogs/:id/items, etc.
- Seed: Catalogos CASE_TYPES (listo, revisar ejecución)

### Frontend ⏳ (COMPLETAR)

#### Tarea 1: Reemplazar select hardcodeado
**Archivo**: `apps/web/app/(dashboard)/ingreso-caso/page.tsx` (si existe)  
O **crear nuevo**: `apps/web/app/(dashboard)/caso-nuevo/page.tsx`

**Cambio**:
```tsx
// ANTES: select hardcodeado
<select>
  <option value="DENUNCIA_VULNERACION">Denuncia por Vulneración</option>
  <option value="CONSUMO_SUSTANCIAS">Consumo de Sustancias</option>
  {/* hardcoded items */}
</select>

// DESPUÉS: cargar desde API
const { data: caseTypes } = useQuery({
  queryKey: ['catalogs', 'CASE_TYPES'],
  queryFn: () => fetchApi(`/catalogs/CASE_TYPES`)
});

<select>
  <option value="">Seleccionar tipo...</option>
  {caseTypes?.items?.map(item => (
    <option key={item.value} value={item.value}>
      {item.label}
    </option>
  ))}
</select>
```

#### Tarea 2: Crear endpoint para listar catálogos por código
**Archivo**: `apps/api/src/modules/catalogs/catalogs.controller.ts`

**Verificar que exista este endpoint**:
```typescript
@Get(':code')
async findOne(@Param('code') code: string) {
  return this.catalogsService.findOne(code);
}
```

Si no existe, agregarlo.

#### Tarea 3: Validar selector en casos existentes
- Buscar dónde se crea un caso (probablemente `/casos/nuevo` o modal)
- Reemplazar select hardcodeado de caseType por el dinámico

### Commit Message
```
feat(catalogs): consumir tipos de caso desde catálogos dinámicos

- Frontend: Selector dinámico poblado desde GET /catalogs/CASE_TYPES
- Eliminadas opciones hardcodeadas
- Integración completa con API de catálogos
- Validación de valores enum

Refs: ISSUE #2 ALTA
```

---

## 🎙️ ISSUE #3 ALTA - Grabación de Entrevista Inicial

### Backend

#### Tarea 1: Ampliar MIME types permitidos
**Archivo**: `apps/api/src/modules/evidences/evidences.service.ts`

**Agregar**:
```typescript
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

// En validación:
if (!ALLOWED_AUDIO_FORMATS.includes(file.mimetype) && 
    !ALLOWED_VIDEO_FORMATS.includes(file.mimetype)) {
  throw new BadRequestException(`Formato no permitido: ${file.mimetype}`);
}
```

#### Tarea 2: Componente grabador de audio
**Crear archivo**: `apps/web/components/audio-recorder.tsx`

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Download, Trash2 } from 'lucide-react';

export function AudioRecorder({ onRecordingComplete }: { onRecordingComplete: (blob: Blob) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/mp4' // o 'audio/webm;codecs=opus'
      });
      
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setRecordedBlob(blob);
        onRecordingComplete(blob);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setDuration(0);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('No se pudo acceder al micrófono. Verifica permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Timer para duración
  useEffect(() => {
    if (!isRecording) return;
    
    const interval = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="animate-pulse">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          )}
          <span className="font-mono text-sm">{formatTime(duration)}</span>
        </div>
        
        <div className="flex gap-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Mic size={16} /> Grabar
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <Square size={16} /> Detener
            </button>
          )}
        </div>
      </div>

      {recordedBlob && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Grabación: {(recordedBlob.size / 1024).toFixed(2)} KB
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const url = URL.createObjectURL(recordedBlob);
                const audio = new Audio(url);
                audio.play();
              }}
              className="flex items-center gap-1 text-sm px-2 py-1 border rounded hover:bg-gray-100"
            >
              <Play size={14} /> Reproducir
            </button>
            <button
              onClick={() => setRecordedBlob(null)}
              className="flex items-center gap-1 text-sm px-2 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50"
            >
              <Trash2 size={14} /> Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### Tarea 3: Integrar grabador en formulario de ingreso
**Archivo**: `apps/web/app/(dashboard)/ingreso-caso/page.tsx`

```tsx
import { AudioRecorder } from '@/components/audio-recorder';

// En el formulario:
const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);

// UI:
<div>
  <label>Grabar Primera Entrevista (opcional)</label>
  <AudioRecorder 
    onRecordingComplete={(blob) => setRecordedAudio(blob)}
  />
</div>

// Al enviar formulario:
if (recordedAudio) {
  const formData = new FormData();
  formData.append('file', recordedAudio, 'entrevista-inicial.m4a');
  formData.append('caseId', caseId);
  formData.append('type', 'AUDIO_RECORDING');
  formData.append('category', 'ENTREVISTA_INICIAL');
  
  await fetchApi('/evidences/upload', {
    method: 'POST',
    body: formData
  });
}
```

### Frontend ✅ (Componente AudioRecorder)

### Commit Message
```
feat(audio): implementar grabación de entrevista inicial

Backend:
- Ampliar MIME types permitidos (M4A, MP4, WAV, OGG)
- Validación de formatos audio/video

Frontend:
- Componente AudioRecorder con recorder API
- Botones: Grabar, Detener, Reproducir
- Timer de duración visible
- Integración en formulario de ingreso
- Upload a evidencias como ENTREVISTA_INICIAL

Refs: ISSUE #3 ALTA
```

---

## 🔐 ISSUE #5 MEDIA - Vista Informes para SECRETARIA

### Backend

**Archivo**: `apps/api/src/modules/reports/reports.service.ts`

**Agregar método**:
```typescript
async findByCaseIdForRole(caseId: string, userRole: Role) {
  if (userRole === Role.SECRETARIA) {
    // Solo retornar metadata, NO contenido
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
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  // Para otros roles: retornar completo
  return this.prisma.report.findMany({
    where: { caseId },
    orderBy: { createdAt: 'desc' }
  });
}
```

**Actualizar controller**:
```typescript
@Get('case/:caseId')
async findByCase(
  @Param('caseId') caseId: string,
  @CurrentUser() user: any
) {
  return this.reportsService.findByCaseIdForRole(caseId, user.role);
}
```

### Frontend

**Archivo**: `apps/web/app/(dashboard)/casos/[id]/page.tsx`

**Agregar vista diferenciada**:
```tsx
function ReportsSectionContent() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);

  if (user?.role === 'SECRETARIA') {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold">Informes Emitidos</h3>
        {reports.length === 0 ? (
          <p className="text-gray-500">Sin informes aún</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left">Fecha</th>
                <th className="text-left">Tipo</th>
                <th className="text-left">Profesional</th>
                <th className="text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>{r.type}</td>
                  <td>{r.author.firstName} {r.author.lastName}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${
                      r.isDraft ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      {r.isDraft ? 'Borrador' : 'Completo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // Para profesionales: mostrar vista completa (sin cambios)
  return <ReportsFullView reports={reports} />;
}
```

### Commit Message
```
fix(reports): restringir vista de informes para SECRETARIA

Backend:
- Nuevo método findByCaseIdForRole() que filtra por rol
- SECRETARIA: solo ve metadata (fecha, tipo, autor, estado)
- SECRETARIA: NO ve contenido ni recomendaciones
- Otros roles: vista completa sin cambios

Frontend:
- Tabla de resumen para SECRETARIA
- Vista completa para profesionales
- Badge de estado (Borrador/Completo)

Refs: ISSUE #5 MEDIA
```

---

## 📁 ISSUE #6 MEDIA - Permitir Formato M4A

**Estado**: Ya completado en ISSUE #3 (ampliar MIME types)

Solo necesita verificación:
- ✅ Backend acepta audio/x-m4a
- ✅ Frontend permite .m4a en input file
- ✅ Validación clara de formatos

### Commit Message
```
fix(evidences): permitir formato M4A en uploads de audio

- Ampliar MIME types a audio/x-m4a (iOS)
- Validación en backend y frontend
- Mensaje de error claro si formato no permitido
- Soporta: MP3, WAV, M4A, AAC, OGG

Refs: ISSUE #6 MEDIA
```

---

## 📅 ISSUE #8 MEDIA - Agendamiento con Estados

### Backend

#### Tarea 1: Agregar enum de estado a Appointment
**Archivo**: `packages/db/prisma/schema.prisma`

```prisma
enum AppointmentStatus {
  SOLICITADA      // Pendiente confirmación
  CONFIRMADA      // Confirmada por profesional
  REAGENDADA      // Fue reprogramada
  COMPLETADA      // Se realizó
  CANCELADA       // Cancelada
  NO_ASISTIO      // NNA no asistió
}

model Appointment {
  // ... campos existentes
  status  AppointmentStatus @default(SOLICITADA)
  // ... resto de campos
}
```

#### Tarea 2: Migración Prisma
```bash
cd packages/db
npx prisma migrate dev --name add_appointment_status
```

#### Tarea 3: Servicio de transiciones de estado
**Archivo**: `apps/api/src/modules/appointments/appointments.service.ts`

```typescript
async updateAppointmentStatus(
  appointmentId: string,
  newStatus: AppointmentStatus,
  reason?: string
) {
  const appointment = await this.prisma.appointment.findUnique({
    where: { id: appointmentId }
  });

  // Validar transición de estado permitida
  const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
    SOLICITADA: [CONFIRMADA, CANCELADA],
    CONFIRMADA: [REAGENDADA, COMPLETADA, CANCELADA, NO_ASISTIO],
    REAGENDADA: [CONFIRMADA, COMPLETADA, CANCELADA, NO_ASISTIO],
    COMPLETADA: [],
    CANCELADA: [],
    NO_ASISTIO: []
  };

  if (!validTransitions[appointment.status]?.includes(newStatus)) {
    throw new BadRequestException(
      `No se puede cambiar de ${appointment.status} a ${newStatus}`
    );
  }

  return this.prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: newStatus,
      updatedAt: new Date()
    }
  });
}
```

### Frontend

**Archivo**: `apps/web/components/appointment-status-badge.tsx`

```tsx
import { Badge } from './ui/badge';

const statusColors: Record<AppointmentStatus, string> = {
  SOLICITADA: 'bg-yellow-100 text-yellow-800',
  CONFIRMADA: 'bg-blue-100 text-blue-800',
  REAGENDADA: 'bg-purple-100 text-purple-800',
  COMPLETADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
  NO_ASISTIO: 'bg-gray-100 text-gray-800',
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge className={statusColors[status]}>{status}</Badge>;
}
```

**Integración en vista de citas**:
```tsx
{appointments.map(apt => (
  <div key={apt.id} className="border rounded p-3">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-semibold">{apt.title}</p>
        <p className="text-sm text-gray-600">{apt.scheduledAt}</p>
      </div>
      <div className="flex gap-2">
        <AppointmentStatusBadge status={apt.status} />
        {apt.status === 'SOLICITADA' && (
          <>
            <button
              onClick={() => updateStatus(apt.id, 'CONFIRMADA')}
              className="text-xs px-2 py-1 bg-green-500 text-white rounded"
            >
              Confirmar
            </button>
            <button
              onClick={() => updateStatus(apt.id, 'CANCELADA')}
              className="text-xs px-2 py-1 bg-red-500 text-white rounded"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  </div>
))}
```

### Commit Message
```
feat(appointments): agregar estados de cita y transiciones

Backend:
- Enum AppointmentStatus: SOLICITADA, CONFIRMADA, REAGENDADA, etc.
- Validación de transiciones de estado
- Método updateAppointmentStatus() con reglas de negocio

Frontend:
- Badge visual por estado con colores
- Botones de confirmación/cancelación para SOLICITADA
- Mostrar historial de cambios de estado

DB:
- Migración: 20260802_add_appointment_status

Refs: ISSUE #8 MEDIA
```

---

## 📖 ISSUE #7 BAJA - Documentar Bitácora

**Archivo**: `docs/guias-usuario/GUIA-SECRETARIA.md`

**Agregar sección**:
```markdown
## 📋 Bitácora de Actuaciones

La bitácora es un registro cronológico de todas las acciones realizadas en el expediente.

### Diferencia con ActionLog
- **ActionLog**: Cambios automáticos del sistema (fase, ruta, asignación)
- **Bitácora**: Actuaciones profesionales manuales (entrevistas, visitas, audiencias)

### Tipos de Actuaciones
- **Entrevista/Declaración**: Registrar reuniones y conversaciones
- **Visita Domiciliaria**: Visitas al domicilio del NNA
- **Audiencia**: Audiencias judiciales o conciliación
- **Derivación**: Derivación a otra institución
- **Seguimiento**: Actuaciones de seguimiento
- **Notificación**: Notificaciones cursadas
- **Otro**: Actuaciones no clasificadas

### Cómo Registrar
1. Abre el expediente → Tab "Bitácora / Actuaciones"
2. Click "+ Agregar Actuación"
3. Selecciona tipo
4. Completa título y descripción
5. Adjunta documentos si necesario
6. Guardar (genera timestamp automático)

### Ejemplo
**Tipo**: Entrevista/Declaración
**Título**: Entrevista inicial con la madre
**Contenido**: Se realizó entrevista con Sra. María Rojas sobre situación familiar...
```

Actualizar `GUIA-ABOGADO.md` y `GUIA-SOCIAL.md` de manera similar.

### Commit Message
```
docs(actuaciones): documentar bitácora de actuaciones

- Agregar sección completa en guías de usuario
- Explicar diferencia ActionLog vs Bitácora
- Tipos de actuaciones disponibles
- Pasos para registrar
- Ejemplos reales

Refs: ISSUE #7 BAJA
```

---

## ✅ PROCEDIMIENTO DE EJECUCIÓN

### Orden Recomendado
1. ✅ ISSUE #2 (30 min) - Completa rápido
2. ✅ ISSUE #6 (15 min) - Ya hecho con #3
3. ✅ ISSUE #7 (30 min) - Documentación
4. ✅ ISSUE #5 (2h) - Backend + Frontend
5. ✅ ISSUE #8 (5h) - Estados y transiciones
6. ✅ ISSUE #3 (8h) - Audio (más complejo)

### Por Cada Issue

```bash
# 1. Crear rama de feature
git checkout -b feature/issue-X

# 2. Implementar cambios
# ... editar archivos

# 3. Compilar y verificar
cd apps/api && npm run build
cd apps/web && npm run build

# 4. Migración DB (si aplica)
cd packages/db && npx prisma migrate dev

# 5. Commit específico
git add .
git commit -m "feat/fix(scope): descripción

Details..."

# 6. Merge a feature/backend-tools-parallel
git checkout feature/backend-tools-parallel
git merge feature/issue-X
```

### Commit Final Único (Opcional)
```bash
git log --oneline feature/backend-tools-parallel..HEAD | wc -l
# Si hay múltiples commits, hacer squash
git rebase -i feature/backend-tools-parallel
```

---

## 🎯 CHECKLIST DE COMPLETITUD

- [ ] ISSUE #2: Selector dinámico de tipos de caso
- [ ] ISSUE #3: Grabador de audio + M4A
- [ ] ISSUE #5: Vista restringida para SECRETARIA
- [ ] ISSUE #6: Formato M4A validado
- [ ] ISSUE #8: Estados de cita implementados
- [ ] ISSUE #7: Documentación de bitácora
- [ ] ✅ Backend compila (npm run build)
- [ ] ✅ DB migrada (prisma migrate)
- [ ] ✅ 6 commits realizados
- [ ] ✅ Merge a feature/backend-tools-parallel
- [ ] ⏳ Testing manual (por usuario)

---

## 📞 NOTAS IMPORTANTES

1. **No compilar Frontend**: Solo backend y DB
2. **No hacer Testing**: Usuario lo hace luego
3. **Commits limpios**: Un commit por issue
4. **Documentación**: Actualizar guías de usuario siempre
5. **DB Migraciones**: Crear migraciones de Prisma, no SQL directo

---

**Estado Final Esperado**:
- 6 issues resueltos
- Backend compila exitosamente
- DB sincronizada
- Documentación actualizada
- Listo para testing manual del usuario

