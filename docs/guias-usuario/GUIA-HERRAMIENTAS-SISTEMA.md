# 🛠️ GUÍA DE HERRAMIENTAS DEL SISTEMA - DEFENSORÍA NNA

Esta guía detalla cada una de las herramientas del sistema de gestión de casos de la Defensoría de la Niñez y Adolescencia (DNA). Explica su **propósito**, **modo de uso** y un **ejemplo práctico de aplicación real**.

---

## 📌 CLASIFICACIÓN DE HERRAMIENTAS

El **Hub de Herramientas** (`/herramientas`) muestra **12 herramientas visibles** para los profesionales (SECRETARIA no tiene acceso a herramientas de análisis). El sistema define además una **13.ª herramienta** (Transcripción de Audio/Video, `transversal_transcription`) que no aparece en el hub.

Las herramientas del sistema se dividen en 3 categorías de ejecución:
1. **Determinísticas (Código TypeScript Puro)**: Cálculos matemáticos y procesales exactos. No usan IA, garantizando 0% de error o alucinación.
2. **Generación Asistida por IA Local (RAG Doble)**: Analizan la evidencia exclusiva del expediente combinada con la base de conocimiento legal institucional usando Ollama local.
3. **Pipeline Multimodal**: Procesan automáticamente audios, imágenes y documentos adjuntos al expediente.

---

## ⚖️ 1. HERRAMIENTAS DEL ÁREA LEGAL

### 1.1. Análisis de Discrepancias (Discrepancy Analysis)
- **Tipo**: IA Generativa + RAG del Expediente.
- **Para qué es**: Compara la narrativa del articulado/denunciante con las declaraciones del denunciado o testimonios para identificar contradicciones, omisiones o inconsistencias clave.
- **Cómo se usa**:
  1. Ingresar al expediente y abrir la pestaña **Herramientas Legales**.
  2. Seleccionar "Análisis de Discrepancias".
  3. El sistema selecciona de forma **automática** las evidencias y transcripciones cargadas en ese expediente. Presionar **Analizar Discrepancias con IA**.
- **Ejemplo Práctico**:
  - *Entrada*: Denuncia de la madre (afirma violencia física sistemática en el hogar) vs. Declaración del progenitor (afirma haber estado fuera del país en la fecha del hecho).
  - *Resultado*: La herramienta detecta 2 inconsistencias temporales con marcas de tiempo en las transcripciones de audio y genera un cuadro comparativo para la fundamentación legal.

---

### 1.2. Tipicidad Penal y Encuadre Legal (Typicality Analysis)
- **Tipo**: IA Generativa + RAG Legal (Ley 548 / Código Penal).
- **Para qué es**: Analiza los hechos registrados y sugiere la calificación jurídica inicial, citando los artículos aplicables de la Ley N° 548 (Código Niña, Niño y Adolescente) y el Código Penal boliviano.
- **Cómo se usa**:
  1. En el módulo legal del caso, seleccionar "Tipicidad Penal".
  2. El sistema autodetecta la tipología del caso y las evidencias del expediente. Presionar **Ejecutar análisis**.
  3. Revisar los artículos sugeridos, los elementos constitutivos del tipo y las observaciones procesales.
- **Ejemplo Práctico**:
  - *Entrada*: Relato de violencia física grave sufrida por un estudiante dentro de un establecimiento educativo.
  - *Resultado*: La herramienta sugiere encuadre bajo el **Art. 153 de la Ley 548** (Violencia entre pares en ámbito escolar) en concurso con el **Art. 271 del Código Penal** (Lesiones graves), citando el procedimiento especial de protección inmediata.

---

### 1.3. Vencimientos y Plazos Procesales (Deadlines Tracker)
- **Tipo**: ⚙️ **Determinística (TypeScript Puro - Sin IA)**.
- **Para qué es**: Calcula con precisión matemática los plazos legales imperativos establecidos por la Ley 548 y Ley 1168 (ej. 24 horas para comunicar acogimiento circunstancial, 10 días para informe pericial), generando alertas automáticas en la agenda institucional.
- **Cómo se usa**:
  1. Se activa automáticamente al registrar un Acogimiento Circunstancial o una Medida de Protección.
  2. El abogado también puede ingresar manualmente la fecha/hora de notificación para recalcular la fecha límite.
- **Ejemplo Práctico**:
  - *Entrada*: Registro de Acogimiento Circunstancial el **03/08/2026 a las 10:00 AM**.
  - *Resultado*: La herramienta fija en el calendario de la DNA y en la barra de alertas el vencimiento fatal para el **04/08/2026 a las 10:00 AM** (plazo legal de 24 horas para remisión al Juez Público de Niñez y Adolescencia).

---

## 🧠 2. HERRAMIENTAS DEL ÁREA PSICOLÓGICA

### 2.1. Extracción de Indicadores de Trauma (Extract Indicators)
- **Tipo**: IA Generativa + RAG de Transcripciones Clínicas.
- **Para qué es**: Examina las transcripciones de entrevistas clínicas y sesiones de evaluación para extraer sintomatología emocional, conductual y somática relevante.
- **Cómo se usa**:
  1. En el panel de Psicología del caso, seleccionar "Extracción de Indicadores".
  2. Elegir las sesiones transcritas por Whisper a analizar.
  3. Presionar **Extraer Indicadores**.
- **Ejemplo Práctico**:
  - *Entrada*: Transcripción de audio de 45 minutos de la primera entrevista psicológica con una NNA de 7 años.
  - *Resultado*: La herramienta extrae e categoriza:
    - *Conductuales*: Enuresis secundaria, retraimiento social.
    - *Emocionales*: Sobrereacción de temor ante figuras de autoridad masculinas, ansiedad paroxística.
    - *Somáticos*: Trastorno del sueño, cefaleas tensionales.

---

### 2.2. Pre-llenado de Escalas de Riesgo (ACES / PHQ-9)
- **Tipo**: IA Generativa + RAG del Expediente.
- **Para qué es**: Pre-completa borradores de escalas estandarizadas de valoración psicológica (ACES, PHQ-9, PTSD-8) analizando los antecedentes cargados en el expediente.
- **Cómo se usa**:
  1. Abrir la herramienta "Escalas de Riesgo" dentro del caso.
  2. Seleccionar la escala deseada (ACES o PHQ-9).
  3. Presionar **Auto-completar Borrador con RAG**. El psicólogo valida o modifica cada ítem antes de guardar.
- **Ejemplo Práctico**:
  - *Entrada*: Expediente con testimonios de amenazas recientes del presunto agresor.
  - *Resultado*: La herramienta sugiere puntuación **ALTA** en el ítem *Amenazas recientes de violencia física*, citando el fragmento de la transcripción que respalda dicha calificación.

---

### 2.3. Traducción a Lenguaje Clínico y Forense (Clinical Translation)
- **Tipo**: IA Generativa (LLM especializado).
- **Para qué es**: Convierte apuntes informales o notas crudas tomadas durante la sesión psicológica en redacción técnica estandarizada para informes periciales judiciales.
- **Cómo se usa**:
  1. Pegar el borrador o notas rápidas de la sesión en el campo de texto.
  2. Presionar **Traducir a Lenguaje Clínico/Forense**.
- **Ejemplo Práctico**:
  - *Apunte informal*: *"El niño llora mucho cuando escucha gritos, se asusta feo y se esconde debajo de las mesas o camas"*.
  - *Resultado traducido*: *"El evaluado presenta respuesta neurovegetativa de sobreresalto, labilidad emocional manifestada en llanto paroxístico y conductas defensivas de evitación activa ante estímulos auditivos de alta intensidad"*.

---

### 2.4. Análisis de Evolución y Afectación (Trauma Analysis)
- **Tipo**: IA Generativa + RAG Longitudinal.
- **Para qué es**: Compara la evolución del estado psicológico del NNA a través del tiempo, comparando la primera sesión de ingesta con las sesiones de seguimiento posteriores.
- **Cómo se usa**:
  1. Seleccionar el rango de sesiones registradas en el expediente.
  2. Presionar **Analizar Evolución**.
- **Ejemplo Práctico**:
  - *Entrada*: Informes y transcripciones de las Sesiones 1, 4 y 8.
  - *Resultado*: Reporte comparativo indicando una reducción del 60% en los episodios de ansiedad aguda y el restablecimiento progresivo de patrones de sueño regulados.

---

## 👥 3. HERRAMIENTAS DEL ÁREA SOCIAL

### 3.1. Estructura Familiar (Familiograma)
- **Tipo**: IA Generativa + Análisis Estructural.
- **Para qué es**: Mapea la composición del hogar, relaciones interfamiliares, roles de cuidado y la identificación de redes de apoyo o fuentes de riesgo dentro del entorno familiar.
- **Cómo se usa**:
  1. En el módulo de Trabajo Social, abrir la herramienta **Estructura Familiar**.
  2. Ingresar los datos de la entrevista familiar; la herramienta construye el familiograma y analiza la narrativa del informe social.
- **Ejemplo Práctico**:
  - *Entrada*: Datos de convivencia del informe de visita domiciliaria.
  - *Resultado*: Esquema estructurado clasificando a la *Abuela Materna* como Red de Apoyo Primaria (Protectora) y al *Tío Paterno* como Factor de Riesgo.

---

### 3.2. Evaluación de Vulnerabilidad (Vulnerability Assessment)
- **Tipo**: ⚙️ **Determinística (TypeScript Puro - Sin IA)**.
- **Para qué es**: Evalúa de manera matemática y objetiva las condiciones socioeconómicas, de vivienda y de acceso a derechos, calculando un índice de vulnerabilidad estandarizado.
- **Cómo se usa**:
  1. Completar el formulario con los datos de la visita (ingresos, hacinamiento, escolaridad, salud).
  2. La herramienta calcula el puntaje exacto de forma instantánea.
- **Ejemplo Práctico**:
  - *Entrada*: 5 personas en 1 habitación (Hacinamiento crítico), ingreso económico menor al Salario Mínimo Nacional, NNA desescolarizado.
  - *Resultado*: **Índice de Vulnerabilidad Social: 0.88 / 1.00 (Riesgo Social Alto)**.

---

### 3.3. Mapeo Ambiental y Territorial (Environmental Mapping)
- **Tipo**: IA Generativa + RAG Comunitario.
- **Para qué es**: Identifica factores de riesgo y protección en el barrio, escuela y comunidad que rodea al NNA.
- **Cómo se usa**:
  1. Cargar las notas de la inspección de campo o entrevista comunitaria.
  2. Presionar **Generar Mapeo Territorial**.
- **Ejemplo Práctico**:
  - *Entrada*: Ficha de entorno comunitario.
  - *Resultado*:
    - *Factores de Riesgo Ambientales*: Zona periurbana desprovista de alumbrado público, presencia de expendios clandestinos de alcohol a 50m.
    - *Factores de Protección*: Centro de Salud a 200m y módulo policial distrital a 3 cuadras.

---

## 📑 4. EMISIÓN DE INFORMES OFICIALES CON RAG DOBLE

### 4.1. Generador de Borradores de Informes (Legal, Psicológico, Social)
- **Tipo**: IA Generativa + **Doble RAG (Expediente + Base Legal Institucional)**.
- **Para qué es**: Redacta borradores de informes técnicos institucionales completos y estructurados para que el profesional los revise, edite y emita oficialmente.
- **Cómo se usa**:
  1. Ir a la pestaña **Informes** en la ficha del caso.
  2. Seleccionar el tipo de informe (*Informe Jurídico*, *Informe Psicológico* o *Informe Social*).
  3. Hacer clic en **✨ Generar Borrador con IA (Ollama)**.
  4. La IA lee automáticamente la narrativa, todas las evidencias procesadas de **ese expediente exclusivo** y la legislación aplicable.
  5. El profesional revisa el borrador en la pantalla, realiza las modificaciones pertinentes y presiona **Emitir e Inmutabilizar**.
- **Ejemplo Práctico**:
  - *Caso*: Expediente `DNA-2026-0042` con 2 audios transcritos y 1 foto descrita por visión.
  - *Resultado*: La IA redacta un informe de 4 páginas con encabezado oficial del GAM Sucre, antecedentes extraídos del expediente, encuadre bajo Ley 548, síntesis de evidencia y sugerencia de dictamen. El informe queda listo para firma.

---

## 📷 5. PIPELINE DE EVIDENCIAS Y RAG MULTIMODAL

### 5.1. Procesamiento Automático de Evidencias (Whisper + Vision OCR + PDF)
- **Tipo**: Procesamiento Multimodal Inmediato en Segundo Plano (Asíncrono).
- **Para qué es**: Convierte de forma automática e inmediata cualquier archivo subido al expediente en texto e índices de búsqueda RAG asociados al `caseId`. Al generar informes o herramientas, el sistema consulta directamente los datos pre-procesados, evitando sobrecargar o congelar la plataforma.
- **Cómo se usa**:
  1. Subir archivos en la pestaña **Evidencias** (Audios MP3/WAV/M4A/MP4, Fotos JPG/PNG, Documentos PDF).
  2. El sistema guarda la evidencia y dispara inmediatamente el pipeline de extracción en segundo plano.
- **Modo de Funcionamiento por tipo de archivo**:
  - **Audios/Videos**: Transcritos íntegramente con **Whisper local**. El texto transcrito se indexa en `case_chunks`.
  - **Fotografías / Imágenes**: Procesadas con **Ollama Vision** (modelo de visión configurable desde el panel de administración; valor por defecto `gemma4-tasks:latest`, no un modelo fijo) en 2 pasos:
    1. *OCR / Extracción de texto*: Transcribe todo texto visible en la imagen (manuscritos, cartas, capturas de pantalla de chats de WhatsApp, certificados, letreros).
    2. *Análisis pericial visual*: Registra objetivamente el entorno, objetos y posibles marcas o indicadores de violencia.
  - **Documentos PDF / DOCX**: Extraídos con `pdf-parse` y fragmentados en bloques indexados en `case_chunks`.

---

## 🔒 6. HERRAMIENTAS TRANSVERSALES Y DE SEGURIDAD

### 6.1. Línea de Tiempo del Expediente (Timeline)
- **Para qué es**: Muestra en orden cronológico inverso todas las actuaciones, denuncias, evidencias cargadas, entrevistas realizadas e informes emitidos en el expediente.

### 6.2. Reporte Anonimizado (Anonymize)
- **Para qué es**: Detecta y elimina datos identificables (nombres propios, direcciones, números de documento, datos específicos) de informes y documentos para compartirlos con terceros, investigación o estadísticas sin violar la confidencialidad del NNA.
- **Cómo se usa**:
  1. Seleccionar el informe o documento a anonimizar.
  2. Presionar **Generar Reporte Anonimizado**.
  3. Descargar el documento listo para compartir.

### 6.3. Transcripción de Audio/Video (Whisper)
- **Para qué es**: Convierte grabaciones de audio/video subidas como evidencia a texto usando Whisper IA. El resultado se ve en "Ver Transcripción" en la galería de evidencias (estado `PENDIENTE` → `COMPLETADA`).
- **Nota**: Está definida en el sistema como herramienta transversal (`transversal_transcription`), pero **no se muestra en el hub** de herramientas (13 toolIds / 12 visibles).

### 6.4. Inmutabilización de Documentos Emitidos
- **Para qué es**: Al hacer clic en **Emitir e Inmutabilizar**, el informe cambia su estado a `EMITIDO` y congela su contenido. Nunca más puede ser modificado o alterado, garantizando la cadena de custodia y validez legal. Si se requieren aclaraciones posteriores, el sistema obliga a crear un *Informe Complementario (v2, v3)* vinculado al original.

### 6.5. Token de Seguridad Documental
- **Para qué es**: Re-autentica al profesional mediante su contraseña antes de visualizar evidencias o informes altamente sensibles de NNA, otorgando un token JWT temporal de 15 minutos. Cada uso queda registrado en la bitácora de auditoría inmutable (`audit_log`).

---

## 🤖 7. ASISTENCIA IA Y ADMINISTRACIÓN DE IA

### 7.1. Copiloto IA (`/copilot`)
- **Para qué es**: Asistente de redacción con IA local por disciplina para los profesionales del equipo interdisciplinario:
  - **Copiloto Jurídico** (ABOGADO): redacción de escritos, memoriales y fundamentación legal (Ley 548).
  - **Copiloto Psicológico** (PSICOLOGO): redacción de informes psicológicos y evaluación de indicadores de riesgo.
  - **Copiloto Social** (SOCIAL): redacción de informes sociales, fichas familiares y planes de intervención.
- **Cómo se usa**: Describir los hechos/observaciones del expediente, presionar el botón de generación y revisar el borrador resultante.

### 7.2. Análisis de Imágenes (Visión IA)
- **Para qué es**: Procesa las fotografías e imágenes subidas como evidencia en dos pasos: OCR/extracción de texto visible (manuscritos, capturas de WhatsApp, certificados) y análisis pericial visual del entorno. El modelo de visión es **configurable** desde la Configuración de IA (valor por defecto `gemma4-tasks:latest`).

### 7.3. Procesos IA (`/panel/admin/ia-procesos`)
- **Para qué es**: Panel exclusivo del **Administrador** para monitorear la cola de tareas de IA (transcripciones de audio y análisis de imágenes): estado de cada tarea (`PENDIENTE` → `PROCESANDO` → `COMPLETADA` / `ERROR`), posición en cola y estado del worker. Permite reintentar o cancelar tareas.

### 7.4. Configuración IA (`/panel/admin/ia`)
- **Para qué es**: Panel exclusivo del **Administrador** para configurar los modelos de IA local (Ollama/Whisper): modelo de texto, modelo de embeddings, endpoint y modelo de Whisper, y **modelo de visión** (`AI_MODEL_VISION`, valor por defecto `gemma4-tasks:latest`).
