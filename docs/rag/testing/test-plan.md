# Guía de Testing: Chunking por Artículo Legal

Esta guía te ayudará a verificar que el nuevo sistema de chunking por artículo legal funciona correctamente.

---

## Objetivo del Test

Verificar que cada artículo legal genera **UN SOLO CHUNK** con todo su contenido (parágrafos, incisos, etc.) sin cortes artificiales.

---

## Test 1: Markdown Pre-estructurado (Máxima Calidad)

### Paso 1: Preparar archivo de prueba

Crea un archivo `test-ley.md` con este contenido:

```markdown
# Ley de Prueba RAG

## Artículo 1.- (OBJETO)
El presente Código tiene por objeto reconocer, desarrollar y regular el ejercicio de los derechos de la niña, niño y adolescente, implementando un Sistema Plurinacional Integral de la Niña, Niño y Adolescente, con el fin de garantizar el ejercicio pleno de sus derechos para su desarrollo integral en la familia, la comunidad y la sociedad.

## Artículo 2.- (FINALIDAD)
La finalidad del presente Código tiene por objeto garantizar a la niña, niño y adolescente el ejercicio pleno y efectivo de sus derechos para su desarrollo integral mediante la correspondibilidad del Estado en todos sus niveles, las familias y la sociedad.

## Artículo 3.- (MARCO CONSTITUCIONAL Y ÁMBITO DE APLICACIÓN)
I. El presente Código se rige por las disposiciones de la Constitución Política del Estado.

II. Las disposiciones del presente Código son de orden público y de aplicación preferente a favor de todas las niñas, niños y adolescentes.

III. En caso de parejas casadas en unión libre, el menor uno debe tener menos de sesenta (60) años de edad a momento de la admisión de la demanda ante autoridad competente.
```

### Paso 2: Subir al sistema

1. Iniciar el backend:
   ```bash
   cd apps/api
   npm run dev
   ```

2. Obtener token de autenticación (como ADMINISTRADOR):
   ```bash
   curl -X POST http://localhost:4100/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@defensoria.gob.bo","password":"Admin123!"}'
   ```

3. Subir el Markdown:
   ```bash
   curl -X POST http://localhost:4100/api/knowledge/upload-markdown \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -F "file=@test-ley.md" \
     -F "title=Ley de Prueba RAG"
   ```

### Paso 3: Verificar chunks generados

1. Listar documentos:
   ```bash
   curl -X GET http://localhost:4100/api/knowledge/documents \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

2. Copiar el `id` del documento creado

3. Ver chunks del documento:
   ```bash
   curl -X GET http://localhost:4100/api/knowledge/documents/DOCUMENT_ID/chunks \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

### Paso 4: Verificar resultados esperados

**✅ CORRECTO**:
- Se generan exactamente **3 chunks** (uno por artículo)
- Cada chunk contiene el artículo completo
- El Artículo 3 incluye sus 3 parágrafos (I, II, III) en el mismo chunk
- Metadata de cada chunk incluye: `"type":"legal_article"`, `"article":"1"`, `"title":"OBJETO"`

**❌ INCORRECTO**:
- Se generan más de 3 chunks (indicaría que está cortando artículos)
- El Artículo 3 está dividido en chunks separados
- Chunks sin metadata o con metadata incorrecta

---

## Test 2: URL Web (Lexivox)

### Paso 1: Subir desde URL

```bash
curl -X POST http://localhost:4100/api/knowledge/upload-url \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ley N° 1371 - Test desde Lexivox",
    "url": "https://www.lexivox.org/norms/BO-L-N1371.html"
  }'
```

### Paso 2: Verificar detección automática

El sistema debe:
1. Descargar el HTML de Lexivox
2. Limpiar scripts y menús
3. **Detectar automáticamente** los artículos legales
4. Generar UN CHUNK POR ARTÍCULO

En los logs de NestJS deberías ver:
```
[KnowledgeService] Detectados 5 artículos legales en la URL
[KnowledgeService] URL extraída en 5 artículos. Procediendo a ingesta vectorial...
```

### Paso 3: Verificar chunks

Sigue el mismo proceso del Test 1 para ver los chunks.

**✅ CORRECTO**:
- Metadata incluye `"type":"legal_article_web"`
- Cada chunk corresponde a un artículo completo

**⚠️ FALLBACK**:
Si Lexivox tiene HTML mal estructurado, el sistema puede hacer fallback a chunking semántico:
```
[KnowledgeService] No se detectaron artículos, usando chunking semántico con overlap
```
Esto es normal para páginas muy mal formateadas.

---

## Test 3: PDF Directo

### Paso 1: Preparar PDF de prueba

Necesitas un PDF con texto seleccionable (NO escaneado) que contenga artículos legales.

### Paso 2: Subir PDF

```bash
curl -X POST http://localhost:4100/api/knowledge/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@ley-prueba.pdf" \
  -F "title=Ley de Prueba desde PDF"
```

### Paso 3: Verificar detección

El sistema intentará detectar artículos legales en el texto extraído del PDF.

**Mejor caso** (PDF limpio):
```
[KnowledgeService] Detectados 8 artículos legales en el PDF
[KnowledgeService] PDF extraído en 8 artículos. Procediendo a ingesta vectorial...
```

**Caso común** (PDF con ruido):
```
[KnowledgeService] No se detectaron artículos, usando chunking semántico con overlap
```

Si obtienes fallback con un PDF legal, **recomendación**: Convertir a Markdown para máxima calidad.

---

## Test 4: Verificación en Frontend

### Paso 1: Acceder al panel de administrador

1. Iniciar frontend:
   ```bash
   cd apps/web
   npm run dev
   ```

2. Abrir navegador: http://localhost:3100

3. Login como ADMINISTRADOR

4. Ir a `/panel/admin/conocimiento`

### Paso 2: Ver lista de documentos

Deberías ver los documentos de prueba con:
- Título
- Fecha de ingesta
- Cantidad de chunks

### Paso 3: Ver chunks de un documento

1. Hacer clic en el botón **"Ver Chunks"** de cualquier documento
2. Se abre modal con lista de chunks

### Paso 4: Verificar visualmente

**✅ CORRECTO**:
```
Chunk #1
ID: a8d247d6...
Artículo 1.- (OBJETO).
El presente Código tiene por objeto reconocer, desarrollar y regular...
Meta: {"type":"legal_article","article":"1","title":"OBJETO"}

Chunk #2
ID: 92a7ff7...
Artículo 2.- (FINALIDAD).
La finalidad del presente Código tiene por objeto garantizar...
Meta: {"type":"legal_article","article":"2","title":"FINALIDAD"}
```

**❌ INCORRECTO**:
```
Chunk #1: "Artículo 1.- (OBJETO). El presente Código tiene por objeto..."
Chunk #2: "...reconocer, desarrollar y regular el ejercicio de los derechos..."
```
Si ves esto, el chunking por artículo NO está funcionando.

---

## Test 5: Recuperación RAG (Prueba de consulta)

### Objetivo
Verificar que al consultar sobre un artículo específico, el sistema recupera el artículo **completo**.

### Paso 1: Ir al Copiloto IA

1. Navegar a `/panel/copilot`
2. Asegurarse de tener al menos un documento legal ingestado

### Paso 2: Hacer consulta específica

Escribir en el copiloto:
```
¿Qué dice el Artículo 1 del Código NNA sobre el objeto de la ley?
```

### Paso 3: Verificar respuesta

La respuesta debe:
1. Citar el artículo completo recuperado
2. No tener fragmentos cortados
3. Incluir todo el contenido del artículo

**✅ CORRECTO**:
```
Según el Artículo 1.- (OBJETO) del Código Niña, Niño y Adolescente:

"El presente Código tiene por objeto reconocer, desarrollar y regular el 
ejercicio de los derechos de la niña, niño y adolescente, implementando un 
Sistema Plurinacional Integral de la Niña, Niño y Adolescente, con el fin 
de garantizar el ejercicio pleno de sus derechos para su desarrollo integral 
en la familia, la comunidad y la sociedad."
```

**❌ INCORRECTO**:
```
Según el Artículo 1:
"El presente Código tiene por objeto reconocer, desarrollar y regular..."
[respuesta cortada o incompleta]
```

---

## Test 6: Artículo Largo (Verificar sin límite de tamaño)

### Objetivo
Verificar que artículos largos (>2000 caracteres) NO se dividen.

### Paso 1: Crear artículo largo de prueba

```markdown
## Artículo 84.- (ACOGIMIENTO FAMILIAR)

I. El acogimiento familiar es una medida de protección especial por la cual se otorga, mediante resolución administrativa o judicial, el cuidado temporal, crianza y protección de una niña, niño o adolescente privado de su medio familiar.

II. En caso de parejas casadas en unión libre, el menor uno debe tener menos de sesenta (60) años de edad a momento de la admisión de la demanda ante autoridad competente, salvo que existiera convivencia pre-adoptiva por un (1) año, sin perjuicio de que a través de informe bio-psico-social se recomiende la adopción, en un menor plazo.

III. Los requisitos para el acogimiento son:
   a) Certificado de preparación para madres o padres adoptivos.
   b) En caso de cumplimiento del inciso f), el Ministerio de Justicia y Transparencia Institucional elaborará los instrumentos de evaluación de cursos presenciales y a distancia sobre preparación para madres y padres adoptivos, que deberán ser evaluados periódicamente.
   c) En el caso de adopción Nacional, a efectos del cumplimiento del inciso g), se requerirá el Certificado de no tener antecedentes penales y el Certificado de No violencia o CENVI.

IV. [... agregar más parágrafos para llegar a >2000 caracteres ...]
```

### Paso 2: Subir y verificar

El Artículo 84 completo (con todos sus parágrafos) debe estar en **UN SOLO CHUNK**, sin importar que supere los 2000 caracteres.

---

## Checklist de Verificación

Use esta lista para confirmar que el sistema funciona correctamente:

- [ ] ✅ Markdown genera UN CHUNK POR ARTÍCULO
- [ ] ✅ URL Web detecta artículos automáticamente (si el HTML está estructurado)
- [ ] ✅ PDF intenta detectar artículos (fallback a semantic chunking si falla)
- [ ] ✅ Metadata incluye `type: "legal_article"`, `article: "N"`, `title: "TÍTULO"`
- [ ] ✅ Artículos largos NO se dividen (sin límite de tamaño)
- [ ] ✅ Parágrafos e incisos están incluidos en el chunk del artículo
- [ ] ✅ No hay cortes en medio de oraciones
- [ ] ✅ El copiloto recupera artículos completos al consultar
- [ ] ✅ El frontend muestra chunks correctamente en el visor

---

## Solución de Problemas

### Problema: "No se detectaron artículos legales"

**Causa**: El formato del texto no coincide con los patrones reconocidos.

**Solución**:
1. Verificar que el texto contiene "Artículo N.- (TÍTULO)"
2. Si es Markdown, asegurarse de usar `##` antes del artículo
3. Si es PDF/Web con formato extraño, convertir a Markdown manualmente

### Problema: "Chunks aún se cortan"

**Causa**: El código no se aplicó correctamente o hay un error en el parser.

**Solución**:
1. Verificar que el archivo `knowledge.service.ts` tiene los cambios
2. Reiniciar el servidor backend (`npm run dev`)
3. Revisar logs de NestJS para errores
4. Verificar que el documento tiene formato correcto

### Problema: "Metadata no incluye article/title"

**Causa**: El tipo de chunk no es `legal_article`.

**Solución**:
1. Si el metadata tiene `type: "web"` o `type: "pdf"`, significa que NO se detectaron artículos
2. Revisar el formato del documento
3. Usar Markdown para máxima confiabilidad

---

## Conclusión

Si todos los tests pasan, el sistema está funcionando correctamente y generará:

✅ **UN ARTÍCULO COMPLETO = UN CHUNK**  
✅ **Sin cortes artificiales**  
✅ **Mejor recuperación RAG**  
✅ **Metadata completa**

Si algún test falla, revisar los logs de NestJS y contactar al desarrollador con el error específico.
