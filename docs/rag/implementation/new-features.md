# Guía de Nuevas Funcionalidades RAG

Este documento describe las 3 nuevas funcionalidades implementadas para mejorar el sistema de ingesta RAG.

---

## 1. Script de Migración de Documentos Existentes

### Descripción
Script automatizado que re-procesa documentos ya ingestados aplicando el nuevo algoritmo de chunking por artículo legal.

### Ubicación
- Código: `apps/api/src/scripts/migrate-knowledge-chunks.ts`
- Scripts npm: Agregados a `apps/api/package.json`

### Uso

#### Migrar TODOS los documentos (Simulación)
```bash
cd apps/api
npm run migrate:knowledge:dry-run
```

Esto mostrará:
- Cuántos artículos se detectan en cada documento
- Cuántos chunks tiene actualmente vs. cuántos tendrá después
- Porcentaje de reducción de chunks
- **NO realiza cambios** (solo simula)

#### Migrar TODOS los documentos (Real)
```bash
npm run migrate:knowledge
```

El script pedirá confirmación antes de aplicar cambios.

**Para bypass de confirmación** (en CI/CD):
```bash
AUTO_CONFIRM=true npm run migrate:knowledge
```

#### Migrar UN solo documento
```bash
npm run migrate:knowledge -- --document-id=abc123-def456-...
```

#### Migrar con output detallado
```bash
npm run migrate:knowledge:verbose
```

### Ejemplo de Output

```
╔═══════════════════════════════════════════════════════════════╗
║  Script de Migración: Chunking por Artículo Legal            ║
╚═══════════════════════════════════════════════════════════════╝

⚙️  Opciones:
   Dry Run: ❌ NO (aplicará cambios)
   Verbose: ✅
   Alcance: TODOS los documentos

📚 Documentos a procesar: 3

🔄 Procesando documento: abc123-def456-...
📄 Documento: "Ley N° 1371 - Modificaciones Código NNA"
📦 Chunks actuales: 201

✅ Detectados 5 artículos legales
📊 Análisis de mejora:
   Chunks actuales: 201
   Chunks nuevos: 5
   ✅ Reducción de 97% en cantidad de chunks
   ✅ Mejor calidad: UN ARTÍCULO = UN CHUNK

⚡ ¿Proceder con la migración? (y/n)
y

🚀 Iniciando migración...
   🗑️  Chunks antiguos eliminados
   ✅ Artículo 1 procesado
   ✅ Artículo 2 procesado
   ...

✅ Migración completada exitosamente
   📦 Nuevos chunks: 5

╔═══════════════════════════════════════════════════════════════╗
║  Resumen de Migración                                         ║
╚═══════════════════════════════════════════════════════════════╝

📊 Estadísticas:
   Total documentos: 3
   ✅ Exitosos: 2
   ⚠️  Omitidos (no legales): 1
   ❌ Fallidos: 0

📦 Chunks:
   Antes: 450
   Después: 15
   Reducción: 96%
```

### Flujo Interno

1. **Lectura**: Lee el documento actual y sus chunks
2. **Reconstrucción**: Une todos los chunks para reconstruir el texto original
3. **Detección**: Intenta detectar artículos legales
4. **Análisis**: Compara estructura actual vs. nueva
5. **Confirmación**: Pide confirmación al usuario (si no es dry-run)
6. **Migración**:
   - Desactiva el documento temporalmente
   - Elimina chunks antiguos
   - Genera embeddings para cada artículo
   - Inserta nuevos chunks con metadata mejorada
   - Reactiva el documento

### Casos de Uso

**Caso 1**: Documento legal bien detectado
```
📄 Ley 548 - Código NNA
Antes: 144 chunks (fragmentación por tamaño)
Después: 302 chunks (un artículo = un chunk)
✅ Migrar (mejor calidad)
```

**Caso 2**: Documento no legal
```
📄 Manual de Procedimientos DNA
⚠️  No se detectaron artículos legales
Estado: OMITIDO (no migrar)
```

**Caso 3**: Documento ya optimizado
```
📄 Ley 1371 (ya migrada)
Antes: 5 chunks
Después: 5 chunks
ℹ️  Ya está optimizado (pero se puede re-migrar para actualizar metadata)
```

---

## 2. Validación Automática de Markdown

### Descripción
Endpoint y servicio que valida el formato de un documento Markdown antes de ingestarlo, detectando errores y generando un preview de los chunks resultantes.

### Ubicación
- Backend: `apps/api/src/modules/knowledge/knowledge.service.ts` (método `validateMarkdown`)
- DTO: `apps/api/src/modules/knowledge/dto/validate-markdown.dto.ts`
- Endpoint: `POST /api/knowledge/validate-markdown`

### Uso

#### Desde el API
```bash
curl -X POST http://localhost:4100/api/knowledge/validate-markdown \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# Ley de Prueba\n\n## Artículo 1.- (OBJETO)\nContenido del artículo..."
  }'
```

#### Desde el Frontend
```typescript
const response = await fetch('/api/knowledge/validate-markdown', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ content: markdownText })
});

const result = await response.json();
```

### Respuesta

```json
{
  "isValid": true,
  "errors": [],
  "warnings": [
    "Artículo 84 es muy largo (5200 caracteres). Considera dividirlo manualmente si es necesario."
  ],
  "articlesDetected": 5,
  "preview": [
    {
      "articleNumber": "1",
      "articleTitle": "OBJETO",
      "contentPreview": "Artículo 1.- (OBJETO)\nEl presente Código tiene por objeto...",
      "estimatedChunkSize": 450
    },
    {
      "articleNumber": "2",
      "articleTitle": "FINALIDAD",
      "contentPreview": "Artículo 2.- (FINALIDAD)\nLa finalidad del presente...",
      "estimatedChunkSize": 380
    }
  ],
  "statistics": {
    "totalCharacters": 5234,
    "totalLines": 145,
    "estimatedChunks": 5,
    "averageChunkSize": 1046,
    "hasPreambule": false
  }
}
```

### Validaciones Realizadas

1. **Contenido vacío**: Verifica que haya contenido
2. **Longitud mínima**: Al menos 100 caracteres
3. **Detección de artículos**: Busca patrones "Artículo N.- (TÍTULO)"
4. **Artículos muy largos**: Advierte si superan 5000 caracteres
5. **Artículos muy cortos**: Advierte si tienen menos de 100 caracteres
6. **Numeración consecutiva**: Detecta saltos en la numeración
7. **Formato de headers**: Verifica uso de `##` antes de artículos

### Tipos de Mensajes

**Errores (bloquean ingesta)**:
- Contenido vacío
- Contenido muy corto (< 100 caracteres)

**Advertencias (no bloquean)**:
- No se detectaron artículos legales
- Artículos muy largos/cortos
- Numeración no consecutiva
- Falta de headers Markdown

---

## 3. Preview Visual en el Frontend

### Descripción
Componente React que permite validar y previsualizar un documento Markdown antes de ingestarlo, mostrando cómo se dividirá en chunks.

### Ubicación
- Componente: `apps/web/components/knowledge/markdown-preview-validator.tsx`

### Uso en el Frontend

```tsx
import { MarkdownPreviewValidator } from '@/components/knowledge/markdown-preview-validator';

export default function UploadPage() {
  const handleValidMarkdown = async (content: string, validationResult: any) => {
    // Aquí va la lógica de ingesta
    console.log('Markdown válido, procediendo con ingesta...');
    
    const formData = new FormData();
    const blob = new Blob([content], { type: 'text/markdown' });
    formData.append('file', blob, 'documento.md');
    formData.append('title', 'Mi Documento Legal');
    
    const response = await fetch('/api/knowledge/upload-markdown', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    // Manejar respuesta...
  };

  return (
    <div>
      <h1>Subir Documento Legal</h1>
      <MarkdownPreviewValidator onValidMarkdown={handleValidMarkdown} />
    </div>
  );
}
```

### Características del Componente

#### Tab 1: Editor
- Textarea grande para pegar o escribir Markdown
- Botón "Cargar Ejemplo" con plantilla de ley
- Botón "Limpiar" para borrar contenido
- Contador de caracteres y líneas en tiempo real
- Botón "Validar y Preview"

#### Tab 2: Preview (después de validar)
- **Cards de Estado**:
  - Estado general (Válido/Inválido)
  - Cantidad de artículos detectados
  - Chunks estimados

- **Alertas**:
  - Errores en rojo (bloquean ingesta)
  - Advertencias en amarillo (no bloquean)

- **Preview de Chunks**:
  - Lista de todos los chunks que se generarán
  - Número de artículo y título
  - Preview del contenido (primeros 200 caracteres)
  - Badge con tamaño estimado en caracteres

- **Estadísticas del Documento**:
  - Total caracteres
  - Total líneas
  - Tamaño promedio de chunk
  - Tiene preámbulo (sí/no)

- **Botones de Acción**:
  - "Volver a Editar" → Regresa al tab de editor
  - "Confirmar e Ingestar" → Procede con la ingesta (deshabilitado si hay errores)

### Screenshots de Ejemplo

**Editor**:
```
┌────────────────────────────────────────────┐
│ [Cargar Ejemplo] [Limpiar]                 │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ # Ley N° 548                        │   │
│ │                                     │   │
│ │ ## Artículo 1.- (OBJETO)           │   │
│ │ El presente Código tiene por       │   │
│ │ objeto...                          │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ 1,234 caracteres • 45 líneas                │
│                         [Validar y Preview] │
└────────────────────────────────────────────┘
```

**Preview**:
```
┌──────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────┐ ┌──────────┐ │
│ │ Estado   │ │ Artículos    │ │ Chunks   │ │
│ │ ✓ Válido │ │ 5 detectados │ │ 5        │ │
│ └──────────┘ └──────────────┘ └──────────┘ │
│                                              │
│ ⚠️  Advertencias:                            │
│ • Artículo 84 es muy largo (5200 caracteres)│
│                                              │
│ Preview de Chunks:                           │
│ ┌──────────────────────────────────────┐   │
│ │ Chunk #1: Artículo 1     [450 chars] │   │
│ │ OBJETO                               │   │
│ │ ┌──────────────────────────────────┐ │   │
│ │ │ Artículo 1.- (OBJETO)            │ │   │
│ │ │ El presente Código tiene por...  │ │   │
│ │ └──────────────────────────────────┘ │   │
│ └──────────────────────────────────────┘   │
│                                              │
│           [Volver a Editar] [Confirmar ✓]   │
└──────────────────────────────────────────────┘
```

---

## Integración Completa: Flujo de Trabajo

### Escenario 1: Ingesta de Ley Nueva (Desde Cero)

1. **Preparación**:
   - Convertir PDF a Markdown manualmente (https://pdf2md.morethan.io/)
   - Formatear según plantilla (`docs/guides/PLANTILLA-LEY-MARKDOWN.md`)

2. **Validación (Frontend)**:
   - Abrir `/panel/admin/conocimiento`
   - Pegar Markdown en el validador
   - Click en "Validar y Preview"
   - Revisar preview de chunks
   - Corregir advertencias si es necesario

3. **Ingesta**:
   - Click en "Confirmar e Ingestar"
   - Sistema genera embeddings
   - UN ARTÍCULO = UN CHUNK

4. **Verificación**:
   - Ver lista de documentos
   - Click en "Ver Chunks"
   - Confirmar metadata correcta

### Escenario 2: Migración de Documento Existente

1. **Análisis**:
   ```bash
   npm run migrate:knowledge:dry-run
   ```
   - Ver cuánto se puede mejorar

2. **Backup** (opcional pero recomendado):
   ```bash
   pg_dump -h localhost -p 5435 -U postgres -d defensoria -t legal_chunks > backup.sql
   ```

3. **Migración**:
   ```bash
   npm run migrate:knowledge
   ```
   - Confirmar cuando se pida

4. **Verificación**:
   - Probar consultas RAG en el copiloto
   - Verificar que recupera artículos completos

### Escenario 3: Corrección de Markdown Inválido

1. **Validación inicial**:
   - Pegar Markdown en validador
   - Obtener errores/advertencias

2. **Corrección**:
   - Si no detecta artículos → Agregar `##` antes de cada artículo
   - Si numeración incorrecta → Revisar que no falten artículos
   - Si artículos muy cortos → Verificar contenido completo

3. **Re-validación**:
   - Validar nuevamente
   - Confirmar que los errores desaparecieron

4. **Ingesta**:
   - Proceder con confianza

---

## FAQ

**P: ¿Puedo migrar documentos sin confirmar?**  
R: Sí, usa `AUTO_CONFIRM=true npm run migrate:knowledge`

**P: ¿Qué pasa si la migración falla a mitad de camino?**  
R: El script intenta reactivar el documento. Si falla, manualmente:
```sql
UPDATE legal_documents SET "isActive" = true WHERE id = 'abc123...';
```

**P: ¿El validador funciona sin backend?**  
R: No, requiere el endpoint `/api/knowledge/validate-markdown` corriendo.

**P: ¿Puedo usar el validador desde CLI?**  
R: Sí, usa `curl` con el endpoint directamente.

**P: ¿La migración elimina documentos?**  
R: No, solo elimina y regenera los chunks. El documento base permanece.

---

## Referencias

- ADR-025: Estrategia PDF a Markdown
- Plantilla Legal Markdown: `docs/guides/PLANTILLA-LEY-MARKDOWN.md`
- Guía de Testing: `docs/TEST-CHUNKING-LEGAL.md`
- Código migración: `apps/api/src/scripts/migrate-knowledge-chunks.ts`
- Código validador backend: `apps/api/src/modules/knowledge/knowledge.service.ts`
- Componente frontend: `apps/web/components/knowledge/markdown-preview-validator.tsx`
