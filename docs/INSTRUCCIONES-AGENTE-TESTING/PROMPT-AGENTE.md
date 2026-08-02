# 🤖 PROMPT PARA AGENTE EJECUTOR

## ✅ **AUTORIZACIÓN CONFIRMADA - PROCEDER INMEDIATAMENTE**

## CONTEXTO
Eres un agente especializado en arreglar herramientas de análisis marco-legal/psicológico/social. El sistema actual falla porque requiere transcripciones de audio que no siempre existen.

**STATUS**: Implementar fixes + ejecutar testing completo

## OBJETIVO
Hacer que las herramientas funcionen SIN requerir transcripciones reales. Si no hay transcripción, usar datos de ejemplo. Si hay transcripción, usar análisis real.

## PROBLEMA ACTUAL
```bash
❌ Error: transcriptionId must be a UUID (400)
❌ Error: transcriptionId should not be empty (400)  
❌ Error: Payload Too Large (413) en upload de audio
❌ Herramientas no muestran datos (pantalla vacía)
```

## TAREAS ESPECÍFICAS

### 1. Arreglar Backend - DTOs Opcionales
Modifica estos archivos para hacer `transcriptionId` opcional:
- `apps/api/src/modules/legal-tools/dto/analyze-discrepancies.dto.ts`
- `apps/api/src/modules/psychological-tools/dto/extract-indicators.dto.ts`  
- `apps/api/src/modules/social-tools/dto/generate-family-map.dto.ts`

**Cambio requerido:**
```typescript
// ANTES:
@IsUUID()
transcriptionId: string;

// DESPUÉS:  
@IsOptional()
@IsUUID()
transcriptionId?: string;
```

### 2. Arreglar Backend - Services con Fallback
Modifica estos archivos para usar datos de ejemplo si no hay transcripción:
- `apps/api/src/modules/legal-tools/legal-tools.service.ts`
- `apps/api/src/modules/psychological-tools/psychological-tools.service.ts`
- `apps/api/src/modules/social-tools/social-tools.service.ts`
- `apps/api/src/modules/transversal-tools/transversal-tools.service.ts`

**Lógica requerida:**
```typescript
async analyzeDiscrepancies(dto: AnalyzeDiscrepanciesDto, userId: string) {
  // Validar acceso al caso (mantener)
  
  // SI NO HAY transcriptionId, usar datos de ejemplo
  if (!dto.transcriptionId) {
    return this.generateExampleAnalysis(dto.caseId);
  }
  
  // SI HAY transcriptionId, flujo normal actual
  const transcription = await this.prisma.transcription.findUnique({
    where: { id: dto.transcriptionId },
  });
  
  // ... resto del código actual
}

private generateExampleAnalysis(caseId: string) {
  return {
    analysisId: `example-${caseId}-${Date.now()}`,
    discrepancies: [
      {
        id: '1',
        category: 'Temporal',
        severity: 'MEDIA',
        discrepancy: 'Diferencia en fechas mencionadas',
        implication: 'Posible confusión temporal',
        suggestedQuestion: '¿Puede confirmar la fecha exacta del incidente?'
      }
    ],
    overallConsistencyScore: 75,
    recommendation: 'Análisis de ejemplo - Para análisis real, sube una transcripción de audio',
    analyzedAt: new Date().toISOString(),
    analyzedBy: 'Sistema (Ejemplo)'
  };
}
```

### 3. Arreglar Límite de Payload
Modifica `apps/api/src/main.ts` para permitir archivos grandes:

```typescript
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // AGREGAR estas líneas:
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  
  // ... resto del código actual
}
```

### 4. Arreglar Frontend - No Enviar transcriptionId Vacío
Modifica `apps/web/app/(dashboard)/tools-demo/page.tsx`:

```typescript
// En loadToolsData(), cambiar de:
const result = await analyzeLegalDiscrepancies({
  caseId: selectedCaseId,
  transcriptionId: txId, // ← Puede ser undefined
});

// A:
const payload: any = { caseId: selectedCaseId };
if (txId && txId.trim().length > 0) {
  payload.transcriptionId = txId;
}
const result = await analyzeLegalDiscrepancies(payload);
```

### 5. Arreglar Error de Estilo (React)
En `apps/web/app/(dashboard)/tools-demo/page.tsx`, en los tabs, cambia:

```typescript
// ANTES:
style={{
  ...styles.tab,
  ...(activeTab === tab ? styles.tabActive : {}),
}}

// DESPUÉS:
style={{
  ...styles.tab,
  ...(activeTab === tab ? {
    color: 'var(--salvia)',
    borderBottomColor: 'var(--salvia)',
  } : {}),
}}
```

## CRITERIOS DE ÉXITO

### Test 1: Sin Audio (Datos de Ejemplo)
```
1. Loguear como ADMINISTRADOR
2. Ir a /tools-demo  
3. Seleccionar un caso
4. Click "Cargar Datos" (SIN subir audio)
5. ✅ Debe ver análisis de ejemplo en las 4 herramientas
6. ✅ No debe haber errores 400/413
```

### Test 2: Con Audio (Datos Reales)
```
1. Subir un archivo .mp3 pequeño (< 5MB)
2. Esperar transcripción
3. Click "Cargar Datos"  
4. ✅ Debe ver análisis real basado en transcripción
5. ✅ Upload debe funcionar sin error 413
```

### Test 3: Compilación
```
✅ API: npm run build → SUCCESS
✅ Web: npx tsc --noEmit → SUCCESS  
✅ Sin errores de TypeScript
```

## ENTREGABLES
1. **Código modificado** en los archivos especificados
2. **Testing manual** exitoso (ambos casos)
3. **Git commit** con mensaje descriptivo
4. **Reporte completo** siguiendo `TEMPLATE-REPORTE.md`

## FORMATO DE REPORTE OBLIGATORIO

⚠️ **IMPORTANTE**: El reporte DEBE seguir exactamente el formato de `TEMPLATE-REPORTE.md`

**Archivos de referencia**:
- 📋 `TEMPLATE-REPORTE.md` ← Estructura obligatoria del reporte
- 📄 `REPORTE-EJEMPLO.md` ← Ejemplo completo de cómo llenar el template

**Qué incluir en el reporte**:
- ✅ Resumen ejecutivo con métricas claras
- ✅ Detalle de cada fix implementado (código antes/después)
- ✅ Hallazgos no esperados con evidencia
- ✅ Lista completa de archivos modificados
- ✅ Resultados de compilación y tests
- ✅ Matriz de resultados de testing
- ✅ Bloqueadores identificados
- ✅ Siguiente paso recomendado

**Formato de entrega**:
Crear archivo: `REPORTE-EJECUCION-[FECHA].md` en la carpeta `INSTRUCCIONES-AGENTE-TESTING/`

## NOTAS IMPORTANTES
- **NO** romper funcionalidad existente de transcripción real
- **MANTENER** toda la validación de roles y permisos
- **USAR** datos de ejemplo realistas (no vacíos)
- **COMPILAR** sin errores antes de entregar
- **NO** cambiar la UI, solo la lógica de backend/frontend
