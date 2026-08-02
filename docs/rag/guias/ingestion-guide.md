# Guía de Ingesta de Conocimiento Jurídico — Base RAG Plano A

Esta guía documenta las **3 opciones disponibles** para ingestar documentos legales a la base de conocimiento del sistema de IA (Plano A — Base Jurídica Pública).

---

## Opciones de Ingesta (Ordenadas por calidad)

### 🥇 Opción 1: Markdown Pre-estructurado (RECOMENDADO para documentos críticos)

**Ventajas**:
- ✅ Máxima calidad y precisión
- ✅ Control total sobre estructura jerárquica
- ✅ Sin errores de fragmentación
- ✅ Respeta la estructura legal (Artículos, Parágrafos, Incisos)

**Cuándo usarlo**:
- Código Niña, Niño y Adolescente (Ley 548)
- Constitución Política del Estado
- Leyes y decretos supremos críticos
- Documentos con estructura legal compleja

**Proceso**:

1. **Convertir PDF a Markdown manualmente** (fuera del sistema):
   ```bash
   # Opción A: Usando herramientas online
   - https://pdf2md.morethan.io/
   - https://www.convertapi.com/pdf-to-md
   
   # Opción B: Usando herramientas locales (si tienes Python)
   pip install pymupdf4llm
   pymupdf4llm PDF_FILE.pdf -o OUTPUT.md
   ```

2. **Estructurar el Markdown correctamente**:
   ```markdown
   # Ley N° 548 — Código Niña, Niño y Adolescente
   
   ## Artículo 1º.- (Objeto)
   La presente Ley tiene por objeto modificar la Ley N° 548 de 17 de julio de 2014...
   
   ## Artículo 2º.- (Modificaciones e Incorporaciones)
   
   ### Parágrafo I
   Se modifica el Artículo 84 de la Ley Nº 548...
   
   ### Parágrafo II
   En caso de parejas casadas en unión libre...
   ```

3. **Subir al sistema**:
   - Ir a `/panel/admin/conocimiento`
   - Seleccionar pestaña **"Subir Markdown"**
   - Arrastrar el archivo `.md` o hacer clic para seleccionar
   - Ingresar el título oficial del documento
   - Hacer clic en **"Procesar y Vectorizar"**

**Resultado esperado**:
- Chunks perfectamente alineados con la estructura legal
- Sin cortes en medio de oraciones
- Overlap automático entre fragmentos (150 caracteres)
- Metadata completa (sección, nivel jerárquico)

---

### 🥈 Opción 2: URL Web Estructurada (RECOMENDADO para Lexivox y sitios oficiales)

**Ventajas**:
- ✅ Rápido y automático
- ✅ HTML suele tener mejor estructura que PDF
- ✅ Sin necesidad de conversión manual
- ✅ Funciona bien con Lexivox.org

**Cuándo usarlo**:
- Leyes publicadas en Lexivox (https://www.lexivox.org/)
- Sitios oficiales con HTML estructurado
- Documentos que ya están en formato web

**Proceso**:

1. **Ir al panel de administración**:
   - Navegar a `/panel/admin/conocimiento`
   - Seleccionar pestaña **"Extraer desde URL"**

2. **Ingresar datos**:
   ```
   Título: Ley N° 1371 de 6 de marzo de 2021 — Modificaciones Código NNA
   URL: https://www.lexivox.org/norms/BO-L-N1371.html
   ```

3. **Hacer clic en "Procesar y Vectorizar"**

**Resultado esperado**:
- El sistema descarga el HTML
- Limpia scripts, menús y elementos no semánticos
- Divide en chunks con overlap
- Vectoriza e indexa

**⚠️ Limitaciones**:
- La calidad depende de la estructura del HTML original
- Sitios con mucho JavaScript pueden no funcionar bien
- Menús y headers deben ser removidos manualmente si quedan

---

### 🥉 Opción 3: PDF Directo (Última opción, solo si no hay alternativa)

**Ventajas**:
- ✅ Acepta archivos PDF directamente
- ✅ No requiere conversión previa

**Desventajas**:
- ❌ Calidad variable dependiendo del PDF
- ❌ PDFs escaneados (imágenes) NO funcionan
- ❌ Puede tener problemas con encabezados y pies de página
- ❌ Fragmentación menos precisa que Markdown

**Cuándo usarlo**:
- Documentos PDF con texto seleccionable (no escaneados)
- Cuando no hay URL alternativa ni tiempo para convertir a Markdown
- Documentos simples sin estructura legal compleja

**Proceso**:

1. **Verificar que el PDF tiene texto seleccionable**:
   - Abrir el PDF y tratar de seleccionar texto con el mouse
   - Si no puedes seleccionar texto, es una imagen y NO funcionará

2. **Subir al sistema**:
   - Ir a `/panel/admin/conocimiento`
   - Seleccionar pestaña **"Subir PDF"**
   - Arrastrar el archivo `.pdf`
   - Ingresar título oficial
   - Hacer clic en **"Procesar y Vectorizar"**

**⚠️ Advertencias**:
- El sistema intentará limpiar el texto pero puede haber artefactos
- Encabezados y pies de página pueden contaminar los chunks
- Revise los fragmentos generados en el visor de chunks

---

## Comparación de Calidad

| Método | Calidad | Velocidad | Control | Recomendado para |
|--------|---------|-----------|---------|------------------|
| Markdown | ⭐⭐⭐⭐⭐ | 🐢 Lento | ✅ Total | Leyes críticas (Ley 548, CPE) |
| URL Web | ⭐⭐⭐⭐ | 🚀 Rápido | ⚠️ Limitado | Lexivox, sitios oficiales |
| PDF Directo | ⭐⭐⭐ | 🏃 Medio | ❌ Ninguno | Documentos simples, últimos recursos |

---

## Verificación Post-Ingesta

Después de ingestar cualquier documento, **SIEMPRE verificar**:

1. **Ver lista de documentos**:
   - Ir a `/panel/admin/conocimiento`
   - Verificar que el documento aparece en la lista

2. **Revisar fragmentos generados**:
   - Hacer clic en el botón **"Ver Chunks"** del documento
   - Revisar que los fragmentos tengan sentido completo
   - Verificar que no haya cortes en medio de oraciones
   - Verificar que el overlap esté funcionando

3. **Probar recuperación RAG**:
   - Ir al Copiloto IA (`/panel/copilot`)
   - Hacer una pregunta relacionada con el documento ingestado
   - Verificar que el sistema recupere los fragmentos correctos

**Ejemplo de fragmentos correctos**:

✅ **CORRECTO** (Chunk #7):
```
Artículo 1º.- (Objeto) La presente Ley tiene por objeto modificar la Ley Nº 548 
de 17 de julio de 2014, "Código Niña, Niño y Adolescente", modificada por la 
Ley Nº 1168 de 12 de abril de 2019, de Abreviación Procesal para Garantizar 
la Restitución del Derecho Humano a la Familia de las Niñas, Niños y Adolescentes.
```

✅ **CORRECTO con Overlap** (Chunk #8):
```
...Restitución del Derecho Humano a la Familia de las Niñas, Niños y Adolescentes.

Artículo 2º.- (Modificaciones e Incorporaciones) Se modifica el Artículo 84 de 
la Ley Nº 548 de 17 de julio de 2014, "Código Niña, Niño y Adolescente"...
```

❌ **INCORRECTO** (fragmentación rota):
```
modificada por la Ley N°
```

---

## Solución de Problemas

### Problema: "El PDF no contiene texto legible"
**Causa**: El PDF es una imagen escaneada, no tiene texto seleccionable.
**Solución**: 
1. Usar OCR (Tesseract, Adobe Acrobat) para convertir a texto
2. O buscar versión del documento en Lexivox (URL)

### Problema: "Chunks cortados en medio de oraciones"
**Causa**: PDF con estructura compleja o muchos saltos de línea artificiales.
**Solución**: Convertir manualmente a Markdown (Opción 1) para máxima calidad.

### Problema: "Error 500 de Ollama al procesar"
**Causa**: El modelo de embeddings está saturado o no está corriendo.
**Solución**: 
1. Verificar que Ollama esté corriendo: `curl http://localhost:11434/api/tags`
2. Reiniciar Ollama: `docker restart ollama-container`
3. Reducir tamaño de chunks en el código (contactar al desarrollador)

### Problema: "Fragmentos tienen contenido duplicado"
**Causa**: El overlap está funcionando correctamente (es intencional).
**Explicación**: Los últimos 150 caracteres de cada chunk se repiten en el siguiente 
para preservar contexto. Esto es correcto y mejora la recuperación RAG.

---

## Recomendaciones Finales

1. **Para documentos críticos** (Ley 548, CPE): Siempre usar Markdown (Opción 1)
2. **Para leyes en Lexivox**: Usar URL Web (Opción 2)
3. **Para documentos varios**: Probar URL primero, luego PDF si no hay alternativa
4. **Revisar siempre los chunks** antes de considerar el documento listo
5. **Desactivar documentos derogados**: Usar el botón de "Desactivar" en lugar de eliminar

---

## Referencias Técnicas

- **ADR-023**: Arquitectura IA Local Soberana
- **ADR-024**: Estrategia de Ingesta RAG (HTML vs PDF)
- **ADR-025**: Estrategia PDF a Markdown y Chunking Semántico
- **Código fuente**: `apps/api/src/modules/knowledge/knowledge.service.ts`
