# Plantilla para Documentos Legales en Markdown

Esta plantilla muestra el formato correcto para que el sistema detecte automáticamente artículos legales y genere **UN CHUNK POR ARTÍCULO**.

---

## Resultado Esperado

Al ingestar un documento con este formato, el sistema generará:

```
✅ Chunk #1: Artículo 1.- (OBJETO) - Completo
✅ Chunk #2: Artículo 2.- (FINALIDAD) - Completo
✅ Chunk #3: Artículo 3.- (MARCO CONSTITUCIONAL) - Completo
```

**SIN** cortes en medio de oraciones, **SIN** límite de tamaño por artículo.

---

## Formato Básico (Recomendado)

```markdown
# Ley N° 548 — Código Niña, Niño y Adolescente

## Artículo 1.- (OBJETO)
El presente Código tiene por objeto reconocer, desarrollar y regular el ejercicio de los derechos de la niña, niño y adolescente, implementando un Sistema Plurinacional Integral de la Niña, Niño y Adolescente, con el fin de garantizar el ejercicio pleno de sus derechos para su desarrollo integral en la familia, la comunidad y la sociedad.

## Artículo 2.- (FINALIDAD)
La finalidad del presente Código tiene por objeto garantizar a la niña, niño y adolescente el ejercicio pleno y efectivo de sus derechos para su desarrollo integral mediante la correspondibilidad del Estado en todos sus niveles, las familias y la sociedad.

## Artículo 3.- (MARCO CONSTITUCIONAL Y ÁMBITO DE APLICACIÓN)
I. El presente Código se rige por las disposiciones del presente Código son de orden público y de aplicación preferente a favor de todas las niñas, niños y adolescentes.

II. En caso de parejas casadas en unión libre, el menor uno debe tener menos de sesenta (60) años de edad a momento de la admisión de la demanda ante autoridad competente.
```

---

## Formato Alternativo (Con Símbolos)

El sistema también reconoce símbolos de grado (° y º):

```markdown
## Artículo 1°.- (OBJETO)
El presente Código tiene por objeto...

## Artículo 2º.- (FINALIDAD)
La finalidad del presente Código...
```

---

## Formato con Parágrafos e Incisos

Para artículos con estructura compleja, incluir todo en el mismo chunk:

```markdown
## Artículo 84.- (ACOGIMIENTO FAMILIAR)

I. El acogimiento familiar es una medida de protección especial por la cual se otorga, mediante resolución administrativa o judicial, el cuidado temporal, crianza y protección de una niña, niño o adolescente privado de su medio familiar.

II. En caso de parejas casadas en unión libre, el menor uno debe tener menos de sesenta (60) años de edad a momento de la admisión de la demanda ante autoridad competente.

III. Los requisitos para el acogimiento son:
   a) Certificado de preparación para madres o padres adoptivos.
   b) En caso de cumplimiento del inciso f), el Ministerio de Justicia y Transparencia Institucional elaborará los instrumentos de evaluación de cursos presenciales y a distancia sobre preparación para madres y padres adoptivos, que deberán ser evaluados periódicamente.
   c) En el caso de adopción Nacional, si efectos del cumplimiento del inciso g), se requerirá el Certificado de no tener antecedentes penales y el Certificado de no violencia.
```

**Resultado**: Todo el artículo 84 (con sus 3 parágrafos y todos los incisos) será **UN SOLO CHUNK**.

---

## Formato Simplificado (Sin Headers)

Si no quieres usar headers de Markdown, el sistema también detecta este formato:

```
Artículo 1.- (OBJETO)
El presente Código tiene por objeto reconocer, desarrollar y regular el ejercicio de los derechos de la niña, niño y adolescente...

Artículo 2.- (FINALIDAD)
La finalidad del presente Código tiene por objeto garantizar a la niña, niño y adolescente el ejercicio pleno y efectivo de sus derechos...
```

---

## Patrones Reconocidos por el Sistema

El parser detecta automáticamente estos patrones:

| Patrón | Ejemplo | ¿Funciona? |
|--------|---------|------------|
| `Artículo N.-` | Artículo 1.- (OBJETO) | ✅ |
| `Artículo N°.-` | Artículo 1°.- (OBJETO) | ✅ |
| `Artículo Nº.-` | Artículo 1º.- (OBJETO) | ✅ |
| `ARTÍCULO N.-` | ARTÍCULO 1.- (OBJETO) | ✅ |
| `Art. N.-` | Art. 1.- (OBJETO) | ✅ |
| `## Artículo N.-` | ## Artículo 1.- (OBJETO) | ✅ (recomendado) |

---

## Ejemplo Completo: Ley N° 1371

Aquí un ejemplo completo de cómo debe verse una ley completa:

```markdown
# Ley N° 1371 de 6 de marzo de 2021

**Ley de Modificaciones a la Ley N° 548, Código Niña, Niño y Adolescente**

## Artículo 1.- (OBJETO)
La presente Ley tiene por objeto modificar la Ley N° 548 de 17 de julio de 2014, "Código Niña, Niño y Adolescente", modificada por la Ley N° 1168 de 12 de abril de 2019, de Abreviación Procesal para Garantizar la Restitución del Derecho Humano a la Familia de las Niñas, Niños y Adolescentes, con la modificación de los incisos b) y h) del Parágrafo VI y la incorporación de los Parágrafos VI y VII, con el propósito de garantizar el cumplimiento del derecho a la familia de las niñas, niños y adolescentes; con la modificación del Artículo 183 e incorporación del Artículo 186 bis, reconociendo la importancia del entorno familiar para el desarrollo integral de las niñas, niños y adolescentes.

## Artículo 2.- (MODIFICACIONES E INCORPORACIONES)

Se modifica el Artículo 84 de la Ley N° 548 de 17 de julio de 2014, "Código Niña, Niño y Adolescente", modificada por la Ley N° 1168 de 12 de abril de 2019, de Abreviación Procesal para Garantizar la Restitución del Derecho Humano a la Familia de las Niñas, Niños y Adolescentes, con la modificación de los incisos b) y h) del Parágrafo VI e incorporación de los Parágrafos VI y VII.

### Parágrafo I

"b) En caso de parejas casadas en unión libre, el menor uno debe tener menos de sesenta (60) años de edad a momento de la admisión de la demanda ante autoridad competente, salvo que existiera convivencia pre-adoptiva por un (1) año, sin perjuicio de que a través de informe bio-psico-social se recomiende la adopción, en un menor plazo."

### Parágrafo II

"h) Certificado de preparación para madres o padres adoptivos. VI. A efectos del cumplimiento del inciso f), el Ministerio de Justicia y Transparencia Institucional elaborará los instrumentos de evaluación de cursos presenciales y a distancia sobre preparación para madres y padres adoptivos, que deberán ser evaluados periódicamente. VII. En el caso de adopción Nacional, si efectos del cumplimiento del inciso g), se requerirá el Certificado de no tener antecedentes penales y el Certificado de No violencia o CENVI."

## Artículo 3.- (DEROGACIONES Y ABROGACIONES)

Se derogan todas las disposiciones contrarias a la presente Ley.

## Disposición Final

ÚNICA.- La presente Ley entrará en vigencia a partir de su publicación.
```

---

## Conversión de PDF a Markdown

### Opción 1: Herramienta Online (Recomendado)
1. Ir a https://pdf2md.morethan.io/
2. Subir tu PDF
3. Descargar el `.md` generado
4. **IMPORTANTE**: Revisar y limpiar manualmente:
   - Agregar `##` antes de cada artículo
   - Eliminar encabezados y pies de página
   - Corregir saltos de línea incorrectos

### Opción 2: Herramienta Local (Python)
```bash
# Instalar
pip install pymupdf4llm

# Convertir
pymupdf4llm archivo.pdf -o archivo.md
```

### Opción 3: Manual (Máxima Calidad)
Para leyes críticas como la Ley 548:
1. Copiar texto del PDF
2. Pegar en un editor de texto
3. Formatear manualmente siguiendo esta plantilla
4. Agregar `##` antes de cada artículo

---

## Verificación del Formato

Antes de subir el Markdown, verifica que:

✅ Cada artículo empieza con `## Artículo N.- (TÍTULO)`  
✅ Los parágrafos e incisos están dentro del artículo (NO separados)  
✅ No hay encabezados ni pies de página del PDF  
✅ No hay saltos de línea cada 2-3 palabras (error común de PDFs)  
✅ Las abreviaciones están correctas (Art., Inc., Ley N°)  

---

## Resultado Esperado en el Sistema

Después de subir el Markdown correctamente formateado:

**Vista de Chunks**:
```
Chunk #1
ID: a8d247d6...
Artículo 1.- (OBJETO).
El presente Código tiene por objeto reconocer, desarrollar y regular el 
ejercicio de los derechos de la niña, niño y adolescente, implementando un 
Sistema Plurinacional Integral de la Niña, Niño y Adolescente...
Meta: {"type":"legal_article","article":"1","title":"OBJETO"}

Chunk #2
ID: 92a7ff7...
Artículo 2.- (FINALIDAD).
La finalidad del presente Código tiene por objeto garantizar a la niña, 
niño y adolescente el ejercicio pleno y efectivo de sus derechos...
Meta: {"type":"legal_article","article":"2","title":"FINALIDAD"}
```

✅ **Artículos completos**  
✅ **Sin cortes en medio de oraciones**  
✅ **Metadata completa con número y título**  
✅ **Sin límite de tamaño** (un artículo largo genera un chunk largo)  

---

## Preguntas Frecuentes

**P: ¿Qué pasa si un artículo es muy largo (3000+ caracteres)?**  
R: Se mantiene completo en un solo chunk. El modelo de embeddings (`nomic-embed-text`) puede manejar hasta ~8000 tokens sin problemas.

**P: ¿Puedo incluir el preámbulo de la ley?**  
R: Sí, agrégalo antes del primer artículo. El sistema lo detectará automáticamente como "Chunk #0 - Preámbulo".

**P: ¿Funcionará con decretos supremos y resoluciones?**  
R: Sí, siempre que sigan el patrón "Artículo N.- (TÍTULO)". Si tienen otra estructura (ej: "Artículo Primero"), contacta al desarrollador para agregar el patrón.

**P: ¿Qué pasa si uso PDFs directamente?**  
R: El sistema intentará detectar artículos automáticamente, pero la calidad será menor que con Markdown. Recomendamos Markdown para documentos críticos.

---

## Referencias

- **ADR-025**: Estrategia PDF a Markdown
- **Guía de Ingesta**: `docs/guides/knowledge-base-ingestion-guide.md`
- **Código fuente**: `apps/api/src/modules/knowledge/knowledge.service.ts`
