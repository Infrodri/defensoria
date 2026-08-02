# 🤖 INSTRUCCIONES PARA AGENTE DE TESTING

## 📋 MISIÓN
Hacer que las herramientas funcionen completamente para el ADMINISTRADOR sin requerir transcripciones reales. Debe poder usar datos de ejemplo/seed para testing.

## 🎯 OBJETIVO
El ADMINISTRADOR debe poder:
1. Entrar a `/tools-demo`
2. Seleccionar un caso
3. Ver análisis REAL (no vacío) en las 4 herramientas sin subir audio

## 📊 ESTADO ACTUAL (PROBLEMAS DETECTADOS)
```
❌ Error: transcriptionId must be a UUID (400)
❌ Error: transcriptionId should not be empty (400)  
❌ Error: Payload Too Large (413) en audio upload
❌ Herramientas muestran "No hay análisis disponibles"
```

## 🔧 TAREAS ESPECÍFICAS

### Tarea 1: Hacer transcriptionId Opcional
**Archivo**: `apps/api/src/modules/legal-tools/legal-tools.service.ts`
- Modificar `analyzeDiscrepancies()` para que si no hay `transcriptionId`, use datos de seed
- Aplicar mismo cambio a psychological, social, transversal

### Tarea 2: Usar Datos Seed si No Hay Transcripción
**Archivos**: Todos los servicios de herramientas
- Si no existe transcripción, retornar análisis de ejemplo (no error)
- Usar los datos que ya están en seed Phase 2

### Tarea 3: Aumentar Límite de Upload
**Archivo**: `apps/api/src/main.ts` o middleware
- Cambiar límite de payload de audio a 50MB
- Configurar multer para archivos grandes

### Tarea 4: Frontend - Manejar Casos sin Transcripción
**Archivo**: `apps/web/app/(dashboard)/tools-demo/page.tsx`
- Si no hay `transcriptionId`, enviar `null` o no enviar el campo
- Mostrar mensaje "Usando datos de ejemplo" si no hay transcripción

## 📁 ARCHIVOS A MODIFICAR

### Backend
- `apps/api/src/modules/legal-tools/legal-tools.service.ts`
- `apps/api/src/modules/psychological-tools/psychological-tools.service.ts`
- `apps/api/src/modules/social-tools/social-tools.service.ts`
- `apps/api/src/modules/transversal-tools/transversal-tools.service.ts`
- `apps/api/src/main.ts` (payload limit)

### Frontend
- `apps/web/app/(dashboard)/tools-demo/page.tsx`

## 🧪 CRITERIO DE ÉXITO
1. **ADMINISTRADOR** entra a `/tools-demo`
2. Selecciona cualquier caso (ej: CASO-001)
3. Hace clic en "Cargar Datos" SIN subir audio
4. Ve análisis real en los 4 tabs:
   - ⚖️ Legal: Discrepancias
   - 🧠 Psicológico: Indicadores
   - 👥 Social: Mapa familiar
   - 🔗 Transversal: Timeline

## 🚨 IMPORTANTE
- NO romper la funcionalidad existente de upload de audio
- Si hay transcripción real, usarla; si no, usar seed data
- Mantener la validación de roles y permisos
- Compilar sin errores: API + Web

## 📝 ENTREGABLES
1. Código funcional
2. Testing manual exitoso
3. Git commit con mensaje descriptivo
4. Reporte de qué se cambió exactamente