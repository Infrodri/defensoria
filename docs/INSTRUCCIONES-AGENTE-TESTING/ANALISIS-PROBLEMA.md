# 🔍 ANÁLISIS DEL PROBLEMA ACTUAL

## 📊 DIAGNÓSTICO

### 🚨 Errores en Console
```
❌ POST /api/legal-tools/discrepancies/analyze → 400 Bad Request
   Error: transcriptionId must be a UUID

❌ POST /api/psychological-tools/indicators/extract → 400 Bad Request  
   Error: transcriptionId should not be empty,transcriptionId must be a UUID

❌ POST /api/social-tools/familymap/generate → 400 Bad Request
   Error: transcriptionId should not be empty,transcriptionId must be a UUID

❌ POST /api/knowledge/transcribe → 413 Payload Too Large
```

## 🔍 CAUSA RAÍZ

### Problema 1: TranscriptionId Requerido
**Ubicación**: `apps/api/src/modules/legal-tools/legal-tools.service.ts`
```typescript
// Línea ~30
let transcription = await this.prisma.transcription.findUnique({
  where: { id: dto.transcriptionId }, // ← Falla si transcriptionId es undefined/null
});

if (!transcription) {
  throw new NotFoundException(
    'Transcripción no encontrada. Por favor, sube un audio de la entrevista primero.',
  ); // ← Error que ve el usuario
}
```

### Problema 2: Frontend Envía transcriptionId Vacío
**Ubicación**: `apps/web/app/(dashboard)/tools-demo/page.tsx`
```typescript
// Línea ~310
let txId = transcriptionId; // ← Puede ser ""

// Si no existe, intentar obtenerlo del caso
if (!txId) {
  // Busca en caseDetail pero puede seguir siendo undefined
}

// Envía al backend:
const result = await analyzeLegalDiscrepancies({
  caseId: selectedCaseId,
  transcriptionId: txId, // ← Puede ser undefined/""
});
```

### Problema 3: DTO Validation
**Ubicación**: `apps/api/src/modules/legal-tools/dto/analyze-discrepancies.dto.ts`
```typescript
export class AnalyzeDiscrepanciesDto {
  @IsUUID() // ← Falla si es undefined/null/""
  transcriptionId: string; // ← Requerido, no opcional
}
```

### Problema 4: Payload Size Limit
**Ubicación**: No configurado límite para archivos grandes
```
Default NestJS limit: ~1MB
Audio files: Pueden ser 5-50MB
Resultado: 413 Payload Too Large
```

## 💡 SOLUCIÓN REQUERIDA

### Fix 1: Hacer transcriptionId Opcional en DTO
```typescript
export class AnalyzeDiscrepanciesDto {
  @IsOptional()
  @IsUUID()
  transcriptionId?: string; // ← Opcional
  
  @IsUUID()
  caseId: string; // ← Mantener requerido
}
```

### Fix 2: Lógica de Fallback en Service
```typescript
async analyzeDiscrepancies(dto: AnalyzeDiscrepanciesDto, userId: string) {
  // Si no hay transcriptionId, usar datos de seed
  if (!dto.transcriptionId) {
    return this.getExampleAnalysis(dto.caseId);
  }
  
  // Si hay transcriptionId, usar flujo normal
  const transcription = await this.prisma.transcription.findUnique({
    where: { id: dto.transcriptionId },
  });
  // ... resto del código actual
}

private getExampleAnalysis(caseId: string) {
  // Retornar análisis de ejemplo basado en seed data
  return {
    analysisId: `analysis-${caseId}-${Date.now()}`,
    discrepancies: [/* datos de ejemplo */],
    overallConsistencyScore: 75,
    recommendation: "Análisis de ejemplo - sube audio para análisis real",
    // ...
  };
}
```

### Fix 3: Configurar Payload Limit
**Archivo**: `apps/api/src/main.ts`
```typescript
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Aumentar límites para audio upload
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  
  // ... resto del código
}
```

### Fix 4: Frontend Handle Gracefully
```typescript
// En tools-demo/page.tsx
const loadToolsData = async () => {
  // ...
  
  // HERRAMIENTAS LEGALES
  try {
    const payload = { caseId: selectedCaseId };
    if (txId && txId.length > 0) {
      payload.transcriptionId = txId;
    }
    // No enviar transcriptionId si está vacío
    
    const result = await analyzeLegalDiscrepancies(payload);
    newToolsData.legal = result;
  } catch (err) {
    // ...
  }
}
```

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [ ] DTO: Hacer `transcriptionId` opcional
- [ ] Service: Agregar lógica de fallback a datos de ejemplo  
- [ ] Service: Método `getExampleAnalysis()` 
- [ ] Main.ts: Configurar payload limit 50MB
- [ ] Frontend: No enviar `transcriptionId` si está vacío
- [ ] Testing: Verificar que funciona sin audio
- [ ] Testing: Verificar que sigue funcionando con audio

## 🎯 RESULTADO ESPERADO

**ANTES**:
```
Usuario → Selecciona caso → Click "Cargar Datos" 
       → ERROR 400 (transcriptionId required)
       → No ve análisis
```

**DESPUÉS**:
```
Usuario → Selecciona caso → Click "Cargar Datos"
       → SUCCESS 200 (usa datos de ejemplo)
       → Ve análisis de ejemplo en 4 herramientas
       
Usuario → Sube audio → Click "Cargar Datos"  
       → SUCCESS 200 (usa análisis real)
       → Ve análisis real basado en transcripción
```