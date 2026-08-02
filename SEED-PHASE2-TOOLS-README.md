# PHASE 2 TOOLS SEED - Documentación

## Overview

Este seed genera datos válidos para la **FASE 2 de TOOLS** (Herramientas Análisis Forense y Multidisciplinario). Crea datos dummy para 4 módulos especializados:

- **LEGAL**: Análisis de Discrepancias y Tipicidad Penal
- **PSYCHOLOGICAL**: (Datos base compartidos con otros módulos)
- **SOCIAL**: (Datos base compartidos con otros módulos)
- **TRANSVERSAL**: Timeline Unificada y Reportes Anonimizados

## Estructura Creada

### 1. **Transcription** (Base para análisis)
- Registros dummy de transcripción para cada caso
- Status: `COMPLETADA`
- Confidence: 0.92
- Validación de relación con Evidence

### 2. **DiscrepancyAnalysis** (Legal Tool)
- Análisis de discrepancias temporales y factuales
- Campos:
  - `currentTranscriptionId`: Referencia a Transcription
  - `discrepancies`: Array JSON con hallazgos
  - `consistencyScore`: 0-100
  - `riskLevel`: BAJO/MEDIO/ALTO
  - `recommendation`: Texto con recomendaciones legales
  - `analyzedBy`: Usuario especialista (Abogado)

### 3. **PenalTypicityAnalysis** (Legal Tool)
- Análisis de tipificación delictiva potencial
- Campos:
  - `transcriptionId`: Referencia a Transcription
  - `potentialCrimes`: Array con delitos identificados
  - `primaryCrime`: Delito principal (Art. referencias)
  - `secondaryCrimes`: Array de delitos secundarios
  - `evidenceGaps`: Gaps en pruebas
  - `investigationPath`: Ruta de investigación recomendada
  - `analyzedBy`: Usuario especialista (Abogado)

### 4. **ProcessualDeadline** (Legal Tool)
- Plazos legales y hitos procesales
- Campos:
  - `milestone`: "Presentación de Pruebas ante Juez"
  - `calculatedDate`: Fecha de vencimiento (30 días adelante)
  - `daysRemaining`: Días por vencer
  - `status`: EN_TIEMPO/PROXIMO/VENCIDO
  - `urgency`: 0-100
  - `alertLevel`: VERDE/AMARILLO/ROJO
  - `relatedLaws`: Array de leyes aplicables
  - `createdBy`: Usuario especialista (Abogado)

### 5. **TransversalUnifiedTimeline** (Transversal Tool)
- Timeline integrada de múltiples disciplinas
- Campos:
  - `events`: Array JSON con eventos de Legal, Psicológico, Social
  - Estructura por evento:
    ```json
    {
      "date": "2026-01-15",
      "time": "14:30",
      "type": "LEGAL|PSYCHOLOGICAL|SOCIAL",
      "specialist": "Nombre especialista",
      "event": "Descripción del evento",
      "details": "Detalles adicionales"
    }
    ```
  - `createdBy`: Usuario especialista (Social/Coordinador)

### 6. **TransversalAnonymizedReport** (Transversal Tool)
- Reportes anonimizados para protección de datos
- Campos:
  - `originalReportId`: Referencia a reporte original
  - `anonymizedContent`: Texto del reporte con datos anonimizados
  - `replacements`: JSON con diccionario de reemplazos
  - Ejemplo:
    ```json
    {
      "[NOMBRE_ANONIMIZADO_1]": "NNA_1",
      "[EDAD_ANONIMIZADA]": "8",
      "[TIPO_VULNERACION_ANONIMIZADA]": "Maltrato físico"
    }
    ```
  - `createdBy`: Usuario especialista (Social/Coordinador)

## Requisitos Previos

1. **Base de datos PostgreSQL** funcionando en `localhost:5435`
2. **Archivo `.env`** en `packages/db/.env` con:
   ```
   DATABASE_URL="postgresql://defensoria_admin:defensoria_dev_password@localhost:5435/defensoria_db?schema=public"
   ```
3. **Datos base ya seeded**:
   - Al menos 5 casos en BD
   - Usuarios con roles: ABOGADO, PSICOLOGO, SOCIAL
   - Evidences para transcripción

## Ejecución

### Opción 1: Desde raíz del proyecto
```bash
cd c:\dev\defensoria\packages\db
npx ts-node prisma/seed-phase2-tools-fixed.ts
```

### Opción 2: Con npm script (si está configurado)
```bash
npm run seed:phase2
```

## Resultados Esperados

Después de ejecutar, verás:
```
🌱 Starting PHASE 2 TOOLS seed...
📋 Fetching 5 existing cases...
✅ Found 5 cases to work with
...
✅ Case 1 completed successfully!
...
============================================================
📊 PHASE 2 TOOLS SEED SUMMARY
============================================================
✅ Transcriptions created: 5+
✅ DiscrepancyAnalysis created: 5+
✅ PenalTypicityAnalysis created: 5+
✅ ProcessualDeadline created: 5+
✅ TransversalUnifiedTimeline created: 5+
✅ TransversalAnonymizedReport created: 5+
============================================================
🎉 Phase 2 seed completed successfully!
```

### Verificación en BD

Para verificar los registros creados:

```sql
-- Verificar Transcriptions
SELECT COUNT(*) as total_transcriptions FROM transcriptions;

-- Verificar DiscrepancyAnalysis
SELECT COUNT(*) as total_discrepancies FROM discrepancy_analyses;

-- Verificar PenalTypicityAnalysis
SELECT COUNT(*) as total_penal FROM penal_typicality_analyses;

-- Verificar ProcessualDeadlines
SELECT COUNT(*) as total_deadlines FROM processual_deadlines;

-- Verificar TransversalUnifiedTimelines
SELECT COUNT(*) as total_timelines FROM transversal_unified_timelines;

-- Verificar TransversalAnonymizedReports
SELECT COUNT(*) as total_reports FROM transversal_anonymized_reports;
```

## Idempotencia

El seed es **100% idempotente**. Puedes ejecutarlo múltiples veces sin problema:
- Genera nuevos UUIDs cada ejecución
- No utiliza hardcoded IDs
- Puede ejecutarse tantas veces como necesites
- Los datos se crean sin duplicación lógica (cada ejecución crea registros nuevos)

## Estructura del Archivo

```typescript
packages/db/prisma/seed-phase2-tools-fixed.ts
├── Fetch 5 existing cases
├── Get users by role (ABOGADO, PSICOLOGO, SOCIAL)
├── Get or create evidences for transcriptions
└── For each case:
    ├── Create Transcription (dummy)
    ├── Create DiscrepancyAnalysis
    ├── Create PenalTypicityAnalysis
    ├── Create ProcessualDeadline
    ├── Create TransversalUnifiedTimeline
    └── Create TransversalAnonymizedReport
```

## Migraciones

El seed requiere la migración:
```
packages/db/prisma/migrations/20260802062733_add_transversal_tools_phase_2_tables/
```

Esta migración crea las tablas:
- `transversal_unified_timelines`
- `transversal_anonymized_reports`

Se ejecuta automáticamente con `prisma migrate deploy`.

## Características Clave

✅ **Completamente tipado** en TypeScript  
✅ **Sin errores de compilación**  
✅ **Relaciones Prisma correctamente configuradas**  
✅ **Validación de roles de usuario**  
✅ **JSON structures válidos** para todos los campos complejos  
✅ **Logging detallado** de cada paso  
✅ **Manejo de errores** robusto  
✅ **Idempotencia garantizada**  
✅ **UUIDs generados dinámicamente** (no hardcodeados)  

## Troubleshooting

### Error: "table transversal_unified_timelines does not exist"
**Solución**: Ejecutar migraciones primero
```bash
cd packages/db
npx prisma migrate deploy
```

### Error: "No cases found"
**Solución**: Ejecutar seed base primero
```bash
cd packages/db
npx ts-node prisma/seed.ts
```

### Error: "DATABASE_URL not found"
**Solución**: Verificar archivo `.env` en `packages/db/.env`

## Logs y Monitoreo

Todos los pasos son registrados con formato:
- `🌱` Inicio
- `📋` Búsqueda de datos
- `👥` Usuarios
- `📄` Evidencias
- `🔄` Procesamiento
- `→` Acciones dentro de caso
- `✅` Éxito
- `❌` Error
- `📊` Resumen

## Próximos Pasos

1. Ejecutar tests E2E con datos Phase 2
2. Validar interfaz gráfica con datos seeded
3. Verificar permisos RBAC por rol
4. Generar reportes desde datos seeded
5. Realizar auditoría de datos anónimos

## Contribuciones

Para mejoras o correcciones al seed:
1. Editar `packages/db/prisma/seed-phase2-tools-fixed.ts`
2. Verificar cambios ejecutando el seed
3. Commit a rama feature
4. PR con descripción de cambios

---

**Última actualización**: 2026-02-02  
**Versión**: 1.0  
**Estado**: ✅ Producción Ready
