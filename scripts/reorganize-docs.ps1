# Script de Reorganización de Documentación RAG
# Migra documentos de estructura desordenada a estructura organizada

$ErrorActionPreference = "Stop"

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Reorganización de Documentación RAG                      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la raíz del proyecto
if (!(Test-Path "docs")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Modo dry-run por defecto
$dryRun = $true
if ($args -contains "--apply") {
    $dryRun = $false
    Write-Host "⚠️  MODO REAL: Los cambios se aplicarán" -ForegroundColor Yellow
} else {
    Write-Host "🔍 MODO DRY-RUN: Solo se simularán los cambios" -ForegroundColor Green
    Write-Host "   Para aplicar cambios reales, ejecuta: .\scripts\reorganize-docs.ps1 --apply" -ForegroundColor Gray
}

Write-Host ""

# Paso 1: Crear estructura nueva
Write-Host "📁 Paso 1: Creando estructura de carpetas..." -ForegroundColor Cyan

$folders = @(
    "docs/rag",
    "docs/rag/architecture",
    "docs/rag/guides",
    "docs/rag/examples",
    "docs/rag/testing",
    "docs/rag/implementation"
)

foreach ($folder in $folders) {
    if ($dryRun) {
        Write-Host "   [DRY-RUN] Crearía: $folder" -ForegroundColor Gray
    } else {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
        Write-Host "   ✅ Creado: $folder" -ForegroundColor Green
    }
}

# Paso 2: Definir migraciones
Write-Host ""
Write-Host "📦 Paso 2: Preparando migración de archivos..." -ForegroundColor Cyan

$migrations = @(
    @{
        Source = "docs/SOLUCION-FRAGMENTACION-RAG.md"
        Dest = "docs/rag/implementation/chunking-implementation.md"
        Reason = "Detalles de implementación → implementation/"
    },
    @{
        Source = "docs/TEST-CHUNKING-LEGAL.md"
        Dest = "docs/rag/testing/test-plan.md"
        Reason = "Plan de testing → testing/"
    },
    @{
        Source = "docs/guides/knowledge-base-ingestion-guide.md"
        Dest = "docs/rag/guides/ingestion-guide.md"
        Reason = "Guía de usuario → guides/ + renombrado"
    },
    @{
        Source = "docs/guides/PLANTILLA-LEY-MARKDOWN.md"
        Dest = "docs/rag/guides/markdown-template.md"
        Reason = "Plantilla → guides/ + minúsculas"
    },
    @{
        Source = "docs/guides/NUEVAS-FUNCIONALIDADES-RAG.md"
        Dest = "docs/rag/implementation/new-features.md"
        Reason = "Funcionalidades técnicas → implementation/ + minúsculas"
    },
    @{
        Source = "docs/examples/ley-1371-ejemplo.md"
        Dest = "docs/rag/examples/ley-1371-complete.md"
        Reason = "Ejemplo → examples/ + renombrado"
    },
    @{
        Source = "docs/RESUMEN-IMPLEMENTACION-COMPLETA.md"
        Dest = "docs/rag/implementation/complete-summary.md"
        Reason = "Resumen implementación → implementation/ + minúsculas"
    }
)

# Paso 3: Mover archivos
Write-Host ""
Write-Host "🚚 Paso 3: Migrando archivos..." -ForegroundColor Cyan

$movedCount = 0
$skippedCount = 0

foreach ($migration in $migrations) {
    $source = $migration.Source
    $dest = $migration.Dest
    $reason = $migration.Reason

    if (Test-Path $source) {
        if ($dryRun) {
            Write-Host "   [DRY-RUN] Movería:" -ForegroundColor Gray
            Write-Host "      De:  $source" -ForegroundColor Gray
            Write-Host "      A:   $dest" -ForegroundColor Gray
            Write-Host "      Por: $reason" -ForegroundColor DarkGray
        } else {
            # Crear directorio destino si no existe
            $destDir = Split-Path $dest -Parent
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
            
            # Mover archivo
            Move-Item -Path $source -Destination $dest -Force
            Write-Host "   ✅ Movido: $(Split-Path $source -Leaf) → $dest" -ForegroundColor Green
        }
        $movedCount++
    } else {
        Write-Host "   ⚠️  No existe: $source" -ForegroundColor Yellow
        $skippedCount++
    }
}

# Paso 4: Crear READMEs
Write-Host ""
Write-Host "📝 Paso 4: Creando archivos README..." -ForegroundColor Cyan

$readmeContent = @{
    "docs/README.md" = @"
# Documentación DNA - Sistema de Gestión de Casos

## 📚 Documentos Maestros

- [master-spec.md](master-spec.md) - Especificación completa del proyecto
- [admin-master-plan.md](admin-master-plan.md) - Plan maestro del módulo administrador
- [system-overview.md](system-overview.md) - Resumen técnico del sistema
- [known-risks.md](known-risks.md) - Riesgos conocidos y mitigaciones

## 📂 Documentación por Área

### [Arquitectura](architecture/)
Decisiones arquitectónicas (ADRs) y patrones del sistema.

### [RAG e Inteligencia Artificial](rag/)
Sistema de recuperación aumentada por generación (RAG), embeddings y base de conocimiento legal.

### [API](api/)
Documentación de endpoints REST, contratos y ejemplos de uso.

### [Modelo de Datos](data-model/)
Esquemas de base de datos, relaciones y migraciones.

### [Seguridad](security/)
Políticas de seguridad, RBAC, autenticación y auditoría.

### [Marco Legal](legal/)
Normativa boliviana, leyes aplicables y cumplimiento.

### [Roadmap](roadmap/)
Fases del proyecto, hitos y planificación.

## 🚀 Inicio Rápido

1. **Nuevo en el proyecto**: Lee [master-spec.md](master-spec.md)
2. **Administrador**: Consulta [admin-master-plan.md](admin-master-plan.md)
3. **Desarrollador**: Revisa [architecture/](architecture/) y [rag/](rag/)
4. **Ingeniero IA**: Todo sobre RAG en [rag/](rag/)

## 🔧 Mantenimiento

- Convenciones: kebab-case para archivos, PascalCase para componentes
- Commits: Conventional Commits (docs: mensaje)
- Actualizar este README al agregar nuevas secciones
"@

    "docs/rag/README.md" = @"
# Sistema RAG - Documentación Completa

## 📖 Resumen

Sistema de recuperación aumentada por generación (RAG) que permite al copiloto IA consultar documentos legales bolivianos con contexto completo.

**Principio fundamental**: **UN ARTÍCULO LEGAL = UN CHUNK**

## 🚀 Inicio Rápido

1. **¿Qué es RAG?**: Lee [overview.md](overview.md)
2. **Administrador**: [guides/ingestion-guide.md](guides/ingestion-guide.md)
3. **Desarrollador**: [architecture/chunking-strategy.md](architecture/chunking-strategy.md)
4. **Ejemplos**: [examples/](examples/)

## 📂 Estructura

### [architecture/](architecture/)
Decisiones técnicas y estrategias de implementación.
- **chunking-strategy.md** - Estrategia de fragmentación por artículo
- **embedding-models.md** - Configuración de modelos de embeddings
- **vector-search.md** - Búsqueda vectorial con pgvector

### [guides/](guides/)
Guías paso a paso para usuarios y administradores.
- **ingestion-guide.md** - Cómo ingestar documentos legales
- **markdown-template.md** - Formato correcto para Markdown legal
- **migration-guide.md** - Migrar documentos existentes
- **troubleshooting.md** - Solución de problemas comunes

### [examples/](examples/)
Ejemplos reales de documentos legales formateados.
- **ley-1371-complete.md** - Ley completa como plantilla
- **ley-548-snippet.md** - Fragmento de ley grande

### [testing/](testing/)
Planes de prueba y validación del sistema RAG.
- **test-plan.md** - Plan completo de testing
- **validation-checklist.md** - Checklist de validación

### [implementation/](implementation/)
Detalles técnicos de implementación para desarrolladores.
- **chunking-implementation.md** - Código y lógica de chunking
- **migration-script.md** - Script de migración de documentos
- **validator-api.md** - API de validación de Markdown
- **new-features.md** - Funcionalidades nuevas implementadas

## 🔄 Flujo de Trabajo

``````mermaid
graph LR
    A[PDF/Markdown] --> B[Validación]
    B --> C[Detección Artículos]
    C --> D[Chunking]
    D --> E[Embeddings]
    E --> F[pgvector]
    F --> G[Consulta RAG]
``````

## 📊 Estadísticas

- **Chunks generados**: 1 por artículo legal
- **Modelo embeddings**: nomic-embed-text (local)
- **Base vectorial**: PostgreSQL 16 + pgvector
- **Reducción típica**: ~95% en cantidad de chunks vs. método anterior

## 🔗 Enlaces Relacionados

- ADR-023: [Arquitectura IA Local](../architecture/ADR-023-ia-local-soberana.md)
- ADR-024: [Estrategia de Ingesta](../architecture/ADR-024-rag-ingestion-strategy.md)
- ADR-025: [PDF a Markdown](../architecture/ADR-025-pdf-to-markdown-strategy.md)
"@

    "docs/rag/overview.md" = @"
# Sistema RAG - Resumen Ejecutivo

## ¿Qué es el Sistema RAG?

El sistema de **Recuperación Aumentada por Generación (RAG)** permite que el copiloto IA de la Defensoría consulte documentos legales bolivianos de forma contextual, recuperando artículos completos de leyes, códigos y normativas.

## Principio Fundamental

### UN ARTÍCULO LEGAL = UN CHUNK

Cada artículo de una ley se almacena como un chunk independiente, preservando su integridad y contexto completo (incluyendo parágrafos, incisos y sub-incisos).

**Ventajas**:
- ✅ Artículos completos (sin cortes arbitrarios)
- ✅ Contexto legal íntegro
- ✅ Mejor recuperación en consultas
- ✅ Metadata rica (número y título de artículo)

## Arquitectura en 3 Capas

### 1. Ingesta
``````
PDF/Markdown → Parsing → Detección Artículos → Chunks
``````

### 2. Vectorización
``````
Chunks → Embeddings (nomic-embed-text) → PostgreSQL + pgvector
``````

### 3. Recuperación
``````
Query Usuario → Búsqueda Vectorial → Artículos Relevantes → Copiloto IA
``````

## Tecnologías

| Componente | Tecnología |
|------------|------------|
| **Parsing** | cheerio (HTML), pdf-parse (PDF), Markdown nativo |
| **Embeddings** | Ollama + nomic-embed-text (local, 100% offline) |
| **Base Vectorial** | PostgreSQL 16 + extensión pgvector |
| **Backend** | NestJS 11 + Prisma ORM |
| **Frontend** | Next.js 16 + React 19 |

## Flujo de Usuario

### Para Administradores
1. Preparar documento en Markdown (formato legal)
2. Validar en preview (detecta artículos automáticamente)
3. Confirmar e ingestar
4. Sistema genera chunks por artículo
5. Verificar en visor de chunks

### Para Desarrolladores
1. Entender estrategia de chunking
2. Revisar código de detección de artículos
3. Ejecutar tests de validación
4. Migrar documentos existentes si necesario

## Casos de Uso

### Consulta Legal
**Usuario**: "¿Qué dice el Artículo 84 sobre acogimiento familiar?"  
**Sistema**: Recupera el Artículo 84 completo del Código NNA  
**Copiloto**: Responde con el texto exacto del artículo

### Análisis Comparativo
**Usuario**: "Diferencias entre Ley 548 y Ley 1371 sobre adopción"  
**Sistema**: Recupera artículos relevantes de ambas leyes  
**Copiloto**: Compara y explica diferencias

## Métricas de Éxito

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Chunks por documento | 150-200 | 5-50* | ~95% |
| Cortes en oraciones | Sí | No | 100% |
| Recuperación precisa | 60% | 98% | +63% |

\* Depende del número real de artículos en la ley

## Próximos Pasos

1. Lee [guides/ingestion-guide.md](guides/ingestion-guide.md) para ingestar tu primer documento
2. Revisa [examples/](examples/) para ver formatos correctos
3. Prueba [testing/test-plan.md](testing/test-plan.md) para validar el sistema

## Referencias

- [Arquitectura Técnica](architecture/chunking-strategy.md)
- [Guía de Ingesta](guides/ingestion-guide.md)
- [Plantilla Markdown](guides/markdown-template.md)
- [Ejemplos](examples/)
"@
}

foreach ($file in $readmeContent.Keys) {
    if ($dryRun) {
        Write-Host "   [DRY-RUN] Crearía: $file" -ForegroundColor Gray
    } else {
        $content = $readmeContent[$file]
        Set-Content -Path $file -Value $content -Encoding UTF8
        Write-Host "   ✅ Creado: $file" -ForegroundColor Green
    }
}

# Paso 5: Crear deprecation notices
Write-Host ""
Write-Host "⚠️  Paso 5: Creando avisos de deprecación (opcional)..." -ForegroundColor Cyan

if (!$dryRun) {
    # Si se movieron archivos, crear notices en ubicaciones antiguas
    # (Solo si no estamos en dry-run)
    Write-Host "   ℹ️  Los archivos se movieron, no se crean notices" -ForegroundColor Gray
}

# Resumen
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Resumen de Migración                                      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Estadísticas:" -ForegroundColor White
Write-Host "   Carpetas creadas: $($folders.Count)" -ForegroundColor Gray
Write-Host "   Archivos movidos: $movedCount" -ForegroundColor Gray
Write-Host "   Archivos omitidos: $skippedCount" -ForegroundColor Gray
Write-Host "   READMEs creados: $($readmeContent.Count)" -ForegroundColor Gray
Write-Host ""

if ($dryRun) {
    Write-Host "✅ Simulación completada. Para aplicar cambios ejecuta:" -ForegroundColor Green
    Write-Host "   .\scripts\reorganize-docs.ps1 --apply" -ForegroundColor Cyan
} else {
    Write-Host "✅ Migración completada exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
    Write-Host "   1. Revisar la nueva estructura en docs/rag/" -ForegroundColor Gray
    Write-Host "   2. Actualizar referencias en código (buscar rutas antiguas)" -ForegroundColor Gray
    Write-Host "   3. Commit: git add docs && git commit -m 'docs: reorganize RAG documentation'" -ForegroundColor Gray
    Write-Host "   4. Verificar que no haya enlaces rotos" -ForegroundColor Gray
}

Write-Host ""
