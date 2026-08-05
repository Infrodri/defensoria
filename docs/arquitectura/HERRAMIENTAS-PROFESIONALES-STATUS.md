# Estado de Herramientas de Apoyo para Profesionales

**Evaluación**: ¿Están implementadas las herramientas de grabación, transcripción, consultas y generación de reportes?

**Fecha**: 2026-08-01  
**Basado en**: Análisis del código backend real

---

## ✅ IMPLEMENTADO (Listo para usar)

### 1. GRABACIÓN DE AUDIO/VIDEO (Evidences Module)

**Status**: ✅ **FUNCIONAL** 

**Ubicación**: `apps/api/src/modules/evidences/`

**Funcionalidad**:
```typescript
// Upload de archivos de audio/video
POST /evidences/upload
{
  "caseId": "uuid",
  "file": <binary>,           // MP3, MP4, PDF, PNG, JPEG, DOCX
  "isSensitive": true/false,  // Marca datos sensibles
  "description": "string"     // Notas del archivo
}

Respuesta:
{
  "id": "uuid",
  "fileName": "entrevista-nna.mp3",
  "mimeType": "audio/mpeg",
  "fileSize": 5242880,
  "storagePath": "cases/{caseId}/timestamp_entrevista-nna.mp3",
  "fileHash": "sha256-hash",   // ← Integridad probatoria
  "isSensitive": true,
  "uploadedBy": { ... },
  "createdAt": "2026-08-01T10:00:00Z"
}
```

**Características**:
- ✅ Upload a MinIO (S3-compatible)
- ✅ Hash SHA-256 para cadena de custodia
- ✅ Soporte: MP3, MP4, PDF, PNG, JPEG, DOCX (hasta 50MB)
- ✅ Marcado de sensibilidad
- ✅ Historial de quien subió, cuándo

**Tipos MIME soportados**:
```
- audio/mpeg (MP3)
- video/mp4 (MP4)
- application/pdf (PDF)
- image/jpeg (JPG)
- image/png (PNG)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX)
```

**Acceso en UI**: 
- Endpoint: `GET /evidences/case/:caseId` → Listar archivos
- Download: `GET /evidences/:id/download`

---

### 2. TRANSCRIPCIÓN DE AUDIO (Whisper - Configurado)

**Status**: ⚠️ **CONFIGURADO, SIN ENDPOINTS** 

**Ubicación**: `apps/api/src/modules/ai-config/`

**Funcionalidad**:
```typescript
// Configuración de Whisper (solo lectura/actualización de settings)
GET /ai-config
{
  "textModel": "qwen2.5:7b",
  "embeddingModel": "nomic-embed-text",
  "whisperEndpoint": "http://localhost:8000/v1/audio/transcriptions",
  "whisperModel": "whisper-1"
}

PATCH /ai-config
{
  "textModel": "nuevohostname",
  "whisperEndpoint": "http://nuevo-endpoint:8000/v1/audio/transcriptions",
  "whisperModel": "whisper-1"
}
```

**Estado Actual**:
- ✅ Whisper está **configurado** (endpoint + modelo)
- ❌ **NO hay endpoint para transcribir** archivos
- ❌ La transcripción **no está conectada al upload de audio**

**Lo que falta**:
```typescript
// Este endpoint NO EXISTE aún:
POST /knowledge/transcribe
{
  "evidenceId": "uuid",  // Archivo de audio subido
  "caseId": "uuid"
}

Respuesta esperada:
{
  "transcriptionId": "uuid",
  "text": "Transcripción del audio...",
  "status": "COMPLETADA",
  "duration": "00:15:30",
  "confidence": 0.95
}
```

---

### 3. BASE DE CONOCIMIENTO LEGAL (RAG - Búsqueda)

**Status**: ⚠️ **PARCIAL - Ingesta SÍ, Búsqueda NO** 

**Ubicación**: `apps/api/src/modules/knowledge/`

**Qué FUNCIONA**:
```typescript
// Ingestar documentos legales
POST /knowledge/upload (PDF)
POST /knowledge/upload-url (URL)
POST /knowledge/upload-markdown (Markdown)

// Listar documentos indexados
GET /knowledge/documents
GET /knowledge/documents/:id/chunks

// Administrar documentos
PATCH /knowledge/documents/:id/toggle-status (Activar/Desactivar)
DELETE /knowledge/documents/:id (Eliminar permanentemente)

// Validar antes de ingestar
POST /knowledge/validate-markdown
```

**Lo que FALTA**:
```typescript
// Este endpoint NO EXISTE:
POST /knowledge/search
{
  "query": "requisitos para tutela",
  "caseId": "uuid",
  "limit": 5
}

Respuesta esperada:
{
  "results": [
    {
      "chunkId": "uuid",
      "documentTitle": "Ley 548 - Código NNA",
      "content": "Artículo X: ...",
      "relevance": 0.92,
      "metadata": { "article": "25", "section": "Derechos" }
    }
  ]
}
```

**Base de datos**:
- ✅ PostgreSQL + pgvector (extensión para búsqueda vectorial)
- ✅ Tabla `legal_documents` + `legal_chunks` con embeddings
- ❌ NO hay lógica de búsqueda semántica (similarity search)

**Modelos disponibles**:
- Embeddings: `nomic-embed-text` (Ollama local)
- LLM: `qwen2.5:7b` (Ollama local)

---

### 4. GENERADOR DE BORRADORES (Copiloto IA)

**Status**: ✅ **FUNCIONAL** 

**Ubicación**: `apps/api/src/modules/ai-assistant/`

**Funcionalidad**:

#### A. Redacción de Documentos Legales
```typescript
POST /ai/draft-legal-document
{
  "context": "Hechos del expediente: El NNA fue encontrado en situación de calle..."
}

Respuesta:
{
  "draft": "SUMA\n\nAnteEl Honorable Juzgado de la Niñez y Adolescencia,\n\n..."
}
```

**Características**:
- ✅ Genera escritos legales en formato jurídico boliviano
- ✅ Usa Ollama local (no nube)
- ✅ Sistema prompt especializado en Ley 548
- ✅ Genera borador marcado como IA (requiere revisión)

#### B. Análisis de Riesgos
```typescript
POST /ai/analyze-risk
{
  "narrative": "El NNA reporta abusos intrafamiliares..."
}

Respuesta:
{
  "analysis": "Indicadores identificados:\n- Abuso emocional\n- Negligencia\n- ..."
}
```

**Características**:
- ✅ Extrae factores de riesgo del relato
- ✅ NO da diagnósticos clínicos (solo identifica riesgos)
- ✅ Sugiere evaluación urgente si aplica

**Acceso en Frontend**: `/copilot`
- ABOGADO: "Copiloto Jurídico (IA Local)" → Redactar escritos legales
- PSICOLOGO: "Copiloto Psicológico (IA Local)" → Redactar informes psicológicos
- SOCIAL: "Copiloto Social (IA Local)" → Redactar informes sociales

---

### 5. GESTIÓN DE INFORMES PROFESIONALES

**Status**: ✅ **FUNCIONAL** 

**Ubicación**: `apps/api/src/modules/reports/`

**Funcionalidad**:
```typescript
// Crear informe
POST /reports
{
  "caseId": "uuid",
  "disciplineReportTypeId": "uuid",  // UUID de DisciplineReportType; la categoría (INFORME_JURIDICO, INFORME_PSICOLOGICO, INFORME_SOCIAL, etc.) viene de esa tabla
  "title": "Informe Inicial",
  "content": "Contenido del informe...",
  "riskAssessment": "BAJO | MEDIO | ALTO"  // Solo para psicológico
}

// Emitir (congelar) informe
POST /reports/:id/emit

// Crear informe complementario (v2, v3) sobre informe emitido
POST /reports/:id/complementary
{
  "title": "Información Complementaria",
  "content": "Datos adicionales..."
}
```

**Características**:
- ✅ ABOGADO: Crea informes jurídicos (solo ABOGADO)
- ✅ PSICOLOGO: Crea informes psicológicos (solo PSICOLOGO)
- ✅ SOCIAL: Crea informes sociales (solo SOCIAL)
- ✅ Emitir = congelar (no puede volver a editarse)
- ✅ Crear complementarios sobre informes emitidos
- ✅ Evaluación psicológica actualiza nivel de riesgo del caso

**Estados**:
```
BORRADOR → (editable) → EMITIDO → (congelado)
                      ↓
                  COMPLEMENTARIO (nuevo informe sobre emitido)
```

---

### 6. GESTIÓN DE CITAS/ENTREVISTAS

**Status**: ✅ **FUNCIONAL** 

**Ubicación**: `apps/api/src/modules/appointments/`

**Funcionalidad**:
```typescript
// Crear cita
POST /appointments
{
  "caseId": "uuid",
  "title": "Entrevista de admisión",
  "appointmentType": "ENTREVISTA | REUNION_EQUIPO | CITA_EXTERNA",
  "scheduledAt": "2026-08-05T10:00:00Z",
  "endAt": "2026-08-05T10:30:00Z",
  "location": "Oficina DNA Sucre",
  "description": "Entrevista con NNA y tutor"
}

// Listar citas (filtrado por rol)
GET /appointments?office=uuid&onlyMine=true
```

**Características**:
- ✅ Crear citas vinculadas a expedientes
- ✅ Tipos: Entrevista, reunión de equipo, cita externa
- ✅ Filtrado por oficina y usuario
- ✅ Reasignación entre profesionales

**Lo que FALTA**:
- ❌ NO hay integración con grabación (no puedes vincular audio a cita)
- ❌ NO hay registro de "cita completada" con notas

---

### 7. PLANTILLAS DE DOCUMENTOS

**Status**: ⚠️ **BÁSICO, SIN INTEGRACIÓN** 

**Ubicación**: `apps/api/src/modules/templates/`

**Funcionalidad**:
```typescript
// Listar plantillas disponibles
GET /templates

// Obtener contenido de plantilla
GET /templates/:id

// Crear desde plantilla (en frontend)
```

**Estado Actual**:
- ✅ Existen plantillas
- ❌ NO está integrado con generador de reportes
- ❌ NO está conectado a copiloto IA

---

## ⚠️ FALTA IMPLEMENTAR (Crítico)

### 1. ENDPOINT DE BÚSQUEDA EN CONOCIMIENTO (CRÍTICO)

**Necesario**: Consultar la base legal desde el expediente

```typescript
// Debe crearse:
POST /knowledge/search-semantic
{
  "query": "tutela legal requisitos",
  "caseId": "uuid",
  "topK": 5
}

// Implementación:
// 1. Generar embedding del query con Ollama
// 2. Buscar en pgvector por similitud
// 3. Retornar chunks ordenados por relevancia
```

### 2. ENDPOINT DE TRANSCRIPCIÓN (CRÍTICO)

**Necesario**: Transcribir archivos de audio de las entrevistas

```typescript
// Debe crearse:
POST /knowledge/transcribe
{
  "evidenceId": "uuid-of-mp3-file"
}

// Implementación:
// 1. Obtener archivo de MinIO
// 2. Enviar a Whisper (configurado en ai-config)
// 3. Guardar transcripción en tabla nueva: Transcription
// 4. Vincular a Evidence + Case
```

### 3. INTEGRACIÓN: CITA → GRABACIÓN → TRANSCRIPCIÓN

**Necesario**: Flujo completo de entrevista

```
1. Crear cita (appointment)
   ↓
2. Grabar entrevista (upload MP3 a evidences)
   ↓
3. Transcribir audio (POST /knowledge/transcribe)
   ↓
4. Consultar ley (POST /knowledge/search-semantic "tutela")
   ↓
5. Generar borrador (POST /ai/draft-legal-document)
   ↓
6. Emitir informe (POST /reports/:id/emit)
```

**Tabla faltante**: `Transcription`
```typescript
{
  id: UUID,
  caseId: UUID,
  evidenceId: UUID,              // Vinculada a audio
  text: TEXT,                    // Transcripción
  duration: VARCHAR,             // "00:15:30"
  confidence: FLOAT,             // 0.95
  language: VARCHAR,             // "es"
  status: ENUM("PENDIENTE", "COMPLETADA", "ERROR"),
  createdAt: TIMESTAMP,
  updatedBy: UUID,
}
```

### 4. REGISTRO DE SESIÓN (Mejor práctica)

**Necesario**: Documentar quién participó en qué cita

```typescript
// Tabla: AppointmentParticipant
{
  id: UUID,
  appointmentId: UUID,
  personId: UUID,                // NNA, denunciante, tutor
  roleInSession: ENUM("PARTICIPANTE", "FACILITADOR", "OBSERVADOR"),
  notes: TEXT,
  createdAt: TIMESTAMP,
}
```

---

## 📊 MATRIZ DE ESTADO

| Herramienta | Módulo | Backend | Endpoints | Integración | Frontend |
|-------------|--------|---------|-----------|-------------|----------|
| **Grabación Audio** | evidences | ✅ | POST /upload | ❌ (aislado) | ✅ |
| **Transcripción** | ai-config | ⚠️ Config | ❌ FALTA | ❌ No integraba | ❌ |
| **Búsqueda Legal** | knowledge | ✅ (ingesta) | ❌ FALTA | ❌ No integrada | ❌ |
| **Generador Borradores** | ai-assistant | ✅ | ✅ | ⚠️ (standalone) | ✅ |
| **Análisis Riesgos** | ai-assistant | ✅ | ✅ | ⚠️ (standalone) | ❓ |
| **Informes** | reports | ✅ | ✅ | ✅ (con casos) | ❓ |
| **Citas** | appointments | ✅ | ✅ | ❌ (sin audio) | ✅ |
| **Plantillas** | templates | ✅ | ✅ | ❌ | ❌ |

---

## 🎯 PRIORIDAD DE IMPLEMENTACIÓN

### Fase 1: CRÍTICA (Desbloquea flujo completo)
1. ✅ [Aquí] Endpoint búsqueda semántica en conocimiento legal
2. ✅ [Aquí] Endpoint transcripción de audio con Whisper
3. ✅ [Aquí] Tabla Transcription en DB

### Fase 2: IMPORTANTE (Conectar herramientas)
4. Vincular transcripción → knowledge (para búsqueda posterior)
5. Crear endpoint: `POST /cases/:id/workflow` (flujo completo)
6. Integrar plantillas con reportes

### Fase 3: MEJORA (Experiencia de usuario)
7. UI para búsqueda en transcripción
8. Seguimiento de sesiones (quién participó)
9. Caché de búsquedas frecuentes

---

## 🔧 IMPLEMENTACIÓN RÁPIDA

### Opción A: Agregar Búsqueda (30 minutos)

**Archivo**: `apps/api/src/modules/knowledge/knowledge.service.ts`

```typescript
async searchSemantic(query: string, topK: number = 5) {
  // 1. Generar embedding del query
  const queryEmbedding = await this.embeddings.getEmbedding(query);
  const queryVector = `[${queryEmbedding.join(',')}]`;

  // 2. Búsqueda por similitud en pgvector
  const results = await this.prisma.$queryRaw`
    SELECT 
      id, 
      content, 
      metadata,
      1 - (embedding <=> ${queryVector}::vector) as similarity
    FROM legal_chunks
    WHERE 1 - (embedding <=> ${queryVector}::vector) > 0.3
    ORDER BY similarity DESC
    LIMIT ${topK}
  `;

  return results;
}
```

**Endpoint**:
```typescript
@Post('search')
@Roles(Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL, Role.ADMINISTRADOR, Role.JEFATURA)
async search(@Body('query') query: string, @Body('topK') topK: number = 5) {
  return this.knowledgeService.searchSemantic(query, topK);
}
```

### Opción B: Agregar Transcripción (1 hora)

**Tabla**: `apps/api/prisma/schema.prisma`

```prisma
model Transcription {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseId    String   @db.Uuid
  case      Case     @relation(fields: [caseId], references: [id], onDelete: Cascade)
  
  evidenceId String  @db.Uuid
  evidence   Evidence @relation(fields: [evidenceId], references: [id], onDelete: Cascade)
  
  text       String   @db.Text
  duration   String?
  confidence Float?   @default(0.95)
  language   String   @default("es")
  status     TranscriptionStatus @default(PENDIENTE)
  
  createdAt  DateTime @default(now())
  createdBy  String   @db.Uuid
  creator    User     @relation(fields: [createdBy], references: [id])
  
  @@index([caseId])
  @@index([evidenceId])
}

enum TranscriptionStatus {
  PENDIENTE
  COMPLETADA
  ERROR
}
```

**Servicio**:
```typescript
async transcribeAudio(evidenceId: string, userId: string) {
  const evidence = await this.prisma.evidence.findUnique({
    where: { id: evidenceId },
  });

  if (!evidence || !['audio/mpeg', 'video/mp4'].includes(evidence.mimeType)) {
    throw new BadRequestException('Evidencia debe ser MP3 o MP4');
  }

  // 1. Descargar archivo de MinIO
  const audioBuffer = await this.minioService.getFileBuffer(evidence.storagePath);

  // 2. Llamar a Whisper (configurado en ai-config)
  const config = await this.aiConfigService.getConfig();
  const formData = new FormData();
  formData.append('file', new Blob([audioBuffer]), 'audio.mp3');
  formData.append('model', config.whisperModel);

  const response = await fetch(config.whisperEndpoint, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  // 3. Guardar transcripción
  return this.prisma.transcription.create({
    data: {
      caseId: evidence.caseId,
      evidenceId,
      text: data.text,
      duration: '00:00:00', // Calcular si está disponible
      confidence: 0.95,
      language: 'es',
      status: 'COMPLETADA',
      createdBy: userId,
    },
  });
}
```

---

## 📋 PRÓXIMOS PASOS

**Para ti (usuario)**:
1. Decide si implementar Búsqueda, Transcripción, o ambos
2. Estima el tiempo (30 min - 1 hora)
3. Crea tickets para cada fase

**Para agentes**:
1. Lee este documento
2. Si implementas búsqueda → actualiza `agentes-ia/INSTRUCCIONES-AGENTES.md`
3. Si implementas transcripción → actualiza tabla de módulos

---

**Última actualización**: 2026-08-01  
**Generado por**: Kiro Agente Senior  
**Basado en**: Análisis del código backend real

