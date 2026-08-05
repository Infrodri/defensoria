# Resumen de la Plataforma de Gestión de Casos — Defensoría de la Niñez y Adolescencia (DNA)

**Fecha:** 4 de agosto de 2026
**Para quién es este documento:** Cualquier persona que quiera entender qué hace el sistema, cómo se trabaja en él y cómo se protege la información, sin necesidad de leer código ni documentación técnica.

---

## 1. Qué es la plataforma

La plataforma es el **sistema de gestión y acompañamiento de casos** de la **Defensoría de la Niñez y Adolescencia (DNA)** del municipio de Sucre, Bolivia. Reúne en una sola herramienta digital el trabajo de un **equipo interdisciplinario** —abogados/as, psicólogos/as y trabajadores/as sociales— para atender los casos en los que los derechos de niños, niñas y adolescentes (NNA) están en riesgo.

El sistema acompaña cada caso desde el primer momento en que una persona llega a la Defensoría a denunciar, hasta el cierre del expediente: permite **registrar la denuncia, evaluar la situación, intervenir, hacer seguimiento y archivar** cada caso con su historia completa. Lo hace bajo tres principios rectores:

- **"El caso pertenece al NNA. Los profesionales y las oficinas son temporales."** El expediente es permanente; los profesionales pueden cambiar de caso u oficina sin que se pierda nada de lo actuado.
- **Soberanía de datos.** Toda la información y toda la inteligencia artificial funcionan con servidores locales del municipio: los datos de los NNA **nunca salen de la institución** ni se envían a servicios externos.
- **Trazabilidad total.** Cada acción queda registrada (quién, cuándo y qué hizo) y los informes emitidos no pueden modificarse jamás.

La plataforma cubre el territorio de la Defensoría en los **9 distritos de Sucre** (la sede central y 8 distritos, urbanos y rurales), y permite trasladar casos entre oficinas sin duplicar información.

### Qué resuelve la plataforma

- **Coordinar equipos interdisciplinarios:** un mismo caso es trabajado en conjunto por abogados/as, psicólogos/as y trabajadores/as sociales, con información integrada.
- **Mantener un historial completo e inmutable:** cada expediente conserva toda su historia, sin ediciones ni borrados.
- **Gestionar evidencias sensibles con cadena de custodia:** audios, fotos y documentos protegidos y trazables.
- **Generar informes profesionales validados:** informes estructurados por disciplina, revisados por el profesional y emitidos de forma oficial.
- **Consultar el marco legal boliviano con IA local:** el asistente responde con fundamento en la Ley 548 (Código NNA), el Código Penal y la normativa municipal, sin conexión a internet.

---

## 2. Roles del sistema

El sistema tiene **7 roles**. Cada persona inicia sesión con su rol y ve solo lo que le corresponde.

| Rol | Qué hace, en una frase |
|-----|------------------------|
| **Administrador/a** | Gestiona todo el sistema: usuarios y permisos, oficinas, catálogos, servicios de inteligencia artificial, base de conocimiento y auditoría general. |
| **Jefatura** | Supervisa y coordina: asigna los equipos interdisciplinarios, monitorea el avance de los casos, autoriza derivaciones y revisa reportes de gestión. |
| **Secretaría** | Es el primer contacto: registra los casos nuevos en el sistema y gestiona la agenda de citas. |
| **Abogado/a** | Se encarga de lo jurídico: informes legales, evaluación de conciliación, plazos procesales, denuncias y escritos. |
| **Psicólogo/a** | Evalúa y acompaña el bienestar emocional del NNA: informes psicológicos, indicadores de trauma y escalas de riesgo. |
| **Trabajador/a Social** | Evalúa el entorno familiar y comunitario: ficha social, visitas domiciliarias, informes sociales y derivaciones a servicios. |
| **Referente/Tutor** | Familiar o tutor de un NNA. Accede por un portal externo (con PIN y código del caso) y solo puede **ver** el estado del caso, sus citas y documentos. |

**Alcance de acceso a los expedientes:**

| Rol | Qué expedientes puede ver |
|-----|---------------------------|
| Administrador/a | Todos, sin filtro. |
| Jefatura y Secretaría | Los casos de su oficina/distrito. |
| Abogado/a, Psicólogo/a, Trabajador/a Social | Solo los casos que les fueron **asignados** mientras estén asignados. |
| Referente/Tutor | Solo el expediente de su NNA, en modo lectura. |

---

## 3. El ciclo de vida de un caso

### 3.1. El inicio: la denuncia y el registro

Todo comienza cuando una persona —el propio NNA, un familiar, un tercero o una institución— presenta una denuncia en una oficina de la Defensoría. La persona que recibe el caso es la **Secretaría**, que lo registra en la pantalla **"Inicio de caso"** (15 a 30 minutos por caso).

Para registrar se necesita la información mínima:

- Nombre completo del NNA y su edad o fecha de nacimiento.
- Dirección actual donde vive.
- Descripción clara de lo que pasó.
- Datos de quien hace la denuncia (solo si es un tercero; es opcional).
- Si hay situación de riesgo inmediato (sí/no) y la urgencia.

El registro sigue este orden:

1. **Buscar si la persona ya existe.** El sistema primero busca al NNA por nombre, documento o fecha de nacimiento. Esto evita **casos duplicados**: si la persona ya está registrada, se la selecciona y se actualizan sus datos; si no existe, se la crea.
2. **Crear el caso.** Se elige el **tipo de caso** (7 tipos: denuncia por vulneración de derechos, consumo de sustancias, venta de alcohol a menores, vulneración del derecho a la educación, extravío/desaparición, NNA en conflicto con la ley, y fiscalización/inspección), la **prioridad** (normal, urgente o crítica), la oficina responsable y un relato de los hechos (qué pasó, cuándo, dónde, quiénes participaron y si hay daños visibles).
3. **Registrar al denunciante (opcional).** El denunciante solo se registra si la denuncia la presenta un **tercero** (madre, padre, vecino, institución). Si el propio NNA presenta la denuncia, no se registra a nadie. Hay protocolos especiales para menores que se autodenuncian ("menor autodenuncia") y para denuncias anónimas.
4. **Adjuntar documentos.** Denuncia escrita, documentos de identidad, informes médicos, fotografías de lesiones, informes del colegio, denuncias policiales, etc.
5. **Revisar y guardar.** Se confirma la información y el sistema genera automáticamente el **número de expediente único**, que se le entrega al denunciante como comprobante de ingreso.

Al terminar, el caso queda en la fase **DERIVACION**, disponible para que la Jefatura asigne el equipo profesional. Las citas no se agendan automáticamente al crear el caso; se gestionan manualmente en "Agenda y Citas".

> En casos urgentes (riesgo inmediato), la Secretaría marca el caso como URGENTE y contacta a la Jefatura de inmediato, sin esperar a completar el registro.

### 3.2. Las cinco fases del expediente

Cada caso recorre **5 fases**. El sistema registra automáticamente en qué fase está y qué dispara cada cambio.

| Fase | Qué significa |
|------|---------------|
| **DERIVACION** | El caso acaba de ingresar y espera la primera evaluación profesional. |
| **EVALUACION** | El equipo evalúa la situación: ficha social, entrevistas e informes iniciales. |
| **SEGUIMIENTO** | El equipo implementa el plan de intervención y monitorea la evolución del caso. |
| **JUDICIALIZACION** | El caso se trabaja ante la justicia (denuncia penal, demanda, medidas de protección). |
| **CIERRE** | La intervención concluye y el expediente queda completo y archivado. |

### 3.3. Qué dispara cada cambio de fase

El avance del caso **no depende de una persona que "mueva" la fase manualmente**: el sistema la actualiza solo cuando ocurren los hitos correctos.

1. **DERIVACION → EVALUACION**: cuando el **Trabajador/a Social completa la ficha social** (exigida por el Art. 25 de la Ordenanza Municipal 136/03). Es el primer paso de evaluación profesional, y **solo** este profesional puede completarla. La asignación de profesionales por Jefatura **no** cambia la fase: el caso permanece en DERIVACION hasta que la ficha social esté completa.
2. **Asignación del equipo**: la **Jefatura** asigna al equipo interdisciplinario en la pestaña "Equipo" del expediente. Según el tipo de caso se asigna a los tres profesionales o a un subconjunto (por ejemplo, en casos de abuso sexual son obligatorios abogado/a y psicólogo/a; en casos de negligencia es obligatorio el trabajador/a social). También se define quién es el **profesional principal** (quien coordina) y la **prioridad** del caso (normal, urgente o crítica). Cada profesional asignado ve una alerta con sus tareas pendientes.
3. **EVALUACION → SEGUIMIENTO**: cuando **todos los profesionales asignados emiten sus informes iniciales** (informe social, informe psicológico, informe jurídico). El sistema lo detecta y avanza el caso solo. En la pestaña "Resumen" del expediente, un panel muestra en tiempo real quién ya presentó su informe y quién falta.
4. **Durante SEGUIMIENTO**: el abogado/a evalúa si el caso es conciliable (ver 3.4). El psicólogo/a y el trabajador/a social definen su **plan de sesiones o intervenciones** (por ejemplo, 6 sesiones de acompañamiento), y con cada informe de sesión registrado el sistema suma avance. Cuando un profesional completa el 100 % de sus sesiones planificadas, su intervención se marca como **finalizada** automáticamente.
5. **JUDICIALIZACION**: si el caso sigue la **vía judicial** (denuncia, demanda o medidas de protección), se trabaja junto al proceso judicial y se registra todo en el expediente.
6. **CIERRE**: cuando la intervención concluye, el expediente queda cerrado con su historia completa.

### 3.4. Conciliación o vía judicial

Es una decisión clave que toma el **abogado/a** durante la evaluación (con apoyo automático del sistema, según los Arts. 24, 26 y 27 de la normativa municipal):

- **NO es conciliable** — y el sistema lo prohíbe automáticamente — cuando hay **maltrato al NNA**, pérdida de autoridad paterna o un delito tipificado.
- **Sí es conciliable** cuando es un conflicto familiar no violento y las partes están dispuestas a dialogar.

Si el caso es conciliable, se agenda una **audiencia de conciliación** en la sala de audiencias de la Defensoría (el sistema crea la cita, notifica a las partes y registra todo en el expediente). Si hay acuerdo, se redacta el acta con las firmas de las partes y queda pendiente la **homologación judicial**; si no hay acuerdo, el sistema cambia el caso a la vía judicial automáticamente.

### 3.5. El expediente es permanente

Aunque cambien los profesionales (por ejemplo, llega un nuevo psicólogo/a al caso), el nuevo profesional accede a **todos** los informes, transcripciones, resultados de herramientas y la cronología completa, y puede continuar el trabajo desde donde quedó. El número de expediente nunca cambia.

### 3.6. Agenda, citas e inspecciones

- **Agenda y Citas:** cada caso puede tener citas vinculadas (entrevistas, sesiones, audiencias de conciliación, supervisiones). Las gestiona la Secretaría y la Jefatura; las audiencias de conciliación crean su cita automáticamente.
- **Inspecciones (fiscalización):** el sistema también registra las **inspecciones a establecimientos** (una de las tareas de la Defensoría, y un tipo de caso en sí mismo: FISCALIZACION). Disponible para los roles operativos y de supervisión.

### 3.7. Situaciones especiales al inicio del caso

El registro cubre también situaciones que requieren un trato particular:

- **Caso urgente (riesgo inmediato):** se marca como URGENTE, se avisa de inmediato a la Jefatura y el caso se prioriza en la asignación.
- **NNA que llega solo, sin adulto:** se registra igual, se anota "menor autodenuncia" como denunciante, se avisa de inmediato al trabajador/a social y no se deja solo al NNA hasta que llegue un profesional.
- **Denuncia anónima:** se registra el caso con los datos que la persona sí aportó y se anota "denuncia anónima"; no se insiste en datos personales si la persona se niega a darlos.
- **Casos que involucran funcionarios públicos:** se registran con normalidad, con una nota que lo indica, y se notifica de inmediato a la Jefatura, manteniendo máxima reserva.

### 3.8. Un ejemplo de principio a fin

Para ver cómo encaja todo, un caso típico podría seguir este camino:

1. **Lunes:** una madre denuncia en la Defensoría que su hijo de 8 años llega de la escuela con moretones. La **Secretaría** registra el caso ("Inicio de caso"), marca tipo de caso "Denuncia por vulneración", prioridad URGENTE, y adjunta la fotografía de las lesiones y el informe del colegio. El caso nace en **DERIVACION** con su número de expediente.
2. **Martes:** el **Trabajador/a Social** entrevista a la familia y completa la **ficha social** (Art. 25). El sistema pasa el caso a **EVALUACION** y avisa a la Jefatura.
3. **Miércoles:** la **Jefatura** asigna al equipo: abogado/a y psicólogo/a (obligatorios por tratarse de un posible maltrato) y trabajador/a social. Define al trabajador/a social como profesional principal.
4. **En las semanas siguientes:** el **Psicólogo/a** evalúa al niño, define un plan de 6 sesiones, emite su informe psicológico inicial. El **Trabajador/a Social** hace la visita domiciliaria, usa las herramientas sociales y emite su informe social. El **Abogado/a** usa la tipicidad penal y los plazos procesales, y evalúa la conciliabilidad.
5. **Como hay indicios de maltrato, el sistema prohíbe la conciliación** (Art. 24): el caso sigue la **vía judicial**. El abogado/a prepara la denuncia y coordina con el Ministerio Público. El caso avanza a **JUDICIALIZACION**.
6. **Mientras tanto**, el psicólogo/a completa sus sesiones y el trabajador/a social da seguimiento al cumplimiento de las medidas; cada sesión se registra con su informe y avanza el plan de intervención.
7. **Meses después**, la intervención concluye y la Jefatura cierra el caso (**CIERRE**). El expediente queda completo: denuncia, ficha social, informes, transcripciones, análisis y todo el historial de actuaciones.

En todo este recorrido, cada paso quedó registrado (quién, cuándo y qué hizo), y ningún informe emitido ni evidencia cargada pudo ser alterada.

---

## 4. Qué hace cada rol en la práctica

### Secretaría
- **Pantallas principales:** Panel General, Agenda y Citas, Inicio de caso, Inspecciones y Expedientes.
- **Acciones clave:** registrar casos nuevos, buscar personas existentes, adjuntar documentos, gestionar citas y registrar inspecciones. No tiene acceso a las herramientas de análisis especializado.
- **En el expediente:** puede ver la bitácora de actuaciones, pero no registra actuaciones (su tarea es administrativa).

### Jefatura
- **Pantallas principales:** Panel General, Expedientes, Inicio de caso, Inspecciones, Reportes, Balanceo de Equipo, Herramientas, Auditoría y Agenda.
- **Acciones clave:** asignar el equipo interdisciplinario en la pestaña "Equipo", supervisar en tiempo real quién ya emitió sus informes y el avance de los planes de sesiones, reasignar casos cuando hace falta, autorizar derivaciones interinstitucionales (Ministerio Público, juzgados, servicios de salud) y revisar reportes de gestión e indicadores.
- **Supervisión de calidad:** revisar el uso adecuado de las herramientas por parte del equipo, validar análisis complejos y detectar necesidades de apoyo o capacitación. Puede consultar los resultados de las herramientas de todas las disciplinas; los análisis especializados los ejecuta el profesional de cada disciplina.
- **Gestión de urgencias:** en casos urgentes activa la asignación inmediata y hace seguimiento intensivo durante las primeras 48 horas.

### Abogado/a
- **Pantallas principales:** Panel General, Mis Casos, Herramientas Legales, Inspecciones y Copiloto IA.
- **Acciones clave:** emitir el informe jurídico, evaluar la conciliabilidad del caso, agendar y conducir audiencias de conciliación, preparar denuncias, demandas y medidas de protección, controlar plazos procesales y coordinar con el Ministerio Público y los juzgados.
- **Flujo típico:** al recibir un caso asignado, revisa la documentación, usa las herramientas legales (tipicidad, plazos, discrepancias), decide el camino (conciliación o vía judicial) y registra sus actuaciones en la bitácora (audiencias judiciales, diligencias, escritos presentados).

### Psicólogo/a
- **Pantallas principales:** Panel General, Mis Casos, Herramientas Psicológicas, Indicadores de Riesgo y Copiloto IA.
- **Acciones clave:** realizar la evaluación psicológica adaptada a la edad del NNA (observación y entrevista a cuidadores en niños pequeños; entrevista directa en adolescentes), definir su plan de sesiones, emitir el informe psicológico inicial y un informe por cada sesión de seguimiento, y usar las herramientas clínicas (indicadores de trauma, escalas de riesgo, traducción clínica, análisis de trauma).
- **Flujo típico:** tras la asignación, planifica y realiza la primera evaluación, integra los resultados de las herramientas, redacta el informe (con versiones adaptadas para la familia y para la autoridad judicial si hace falta) y coordina con el resto del equipo.

### Trabajador/a Social
- **Pantallas principales:** Panel General, Mis Casos, Herramientas Sociales, Directorio de Derivación y Copiloto IA.
- **Acciones clave:** completar la **ficha social** (obligatoria; habilita la fase de evaluación), realizar visitas domiciliarias y entrevistas familiares, emitir el informe social y los informes de seguimiento, definir su plan de intervenciones y gestionar derivaciones a servicios de salud, educación y programas sociales.
- **Flujo típico:** recibe el caso en fase DERIVACION, realiza la entrevista familiar y la visita domiciliaria, completa la ficha social (48-72 horas del ingreso), usa las herramientas sociales (estructura familiar, vulnerabilidad, mapeo ambiental) y coordina las derivaciones. Re-evalúa la vulnerabilidad periódicamente según el nivel (cada 30, 60 o 90 días).

### Administrador/a
- **Pantallas principales:** todo lo operativo (Panel General, Expedientes, Inicio de caso, Inspecciones, Reportes, Balanceo de Equipo) más la gestión institucional y del sistema: Personal y Permisos, Oficinas y Distritos, Auditoría Total, Herramientas, Verificar Herramientas, Configuración IA, Base de Conocimiento, Disciplinas, Catálogos, Usuarios del Sistema, Mantenimiento y Procesos IA.
- **Acciones clave:** crear usuarios y asignar roles, verificar diariamente que los servicios funcionen (estado verde/amarillo/rojo), aprobar las herramientas para su uso, cargar la base de conocimiento legal (leyes, reglamentos, jurisprudencia), configurar los modelos de IA, monitorear las tareas de IA, resolver problemas técnicos y elaborar reportes de uso para la dirección.

### Referente/Tutor
- **Portal externo** (no es parte de la operación interna): con su PIN y el código del caso puede ver el **estado del caso, sus citas y los documentos** compartidos. Es solo lectura: no puede modificar nada.

### Cómo se coordina el equipo interdisciplinario

Los profesionales trabajan sobre el **mismo expediente**, y el sistema les facilita coordinarse:

- **Solicitudes cruzadas:** el abogado/a solicita la evaluación psicológica al psicólogo/a cuando el caso lo requiere; el psicólogo/a y el trabajador/a social comparten la evaluación de las dinámicas familiares; el abogado/a pide el informe social del entorno para fundamentar medidas de protección.
- **Informes que alimentan el proceso judicial:** los informes psicológicos y sociales se incorporan a los procesos legales (testimonio especializado, evaluación de idoneidad de cuidadores, contexto familiar para el juez).
- **Visibilidad del avance:** todos ven en el expediente qué hizo cada uno y qué falta, sin necesidad de reuniones para ponerse al día.
- **Jefatura como puente:** coordina derivaciones interinstitucionales (Ministerio Público, juzgados, servicios de salud), autoriza acciones especiales y resuelve casos complejos.

---

## 5. Un recorrido por las pantallas principales

Para ubicarse en el sistema, estas son las pantallas que se ven con más frecuencia:

| Pantalla | Para qué sirve |
|----------|----------------|
| **Panel General** | El tablero de inicio: casos nuevos, casos pendientes de asignación, alertas de plazos próximos e indicadores de carga del equipo. |
| **Mis Casos / Expedientes** | La lista de casos (los propios para los profesionales; los de la oficina para Secretaría y Jefatura). Se puede filtrar por fase o tipo de caso. |
| **Expediente del caso** | La ficha completa del caso, organizada en pestañas (ver abajo). |
| **Inicio de caso** | El formulario para registrar una denuncia nueva (la "ingesta" del expediente). |
| **Agenda y Citas** | El calendario institucional con las citas de los casos y reuniones. |
| **Herramientas** | El hub con las 12 herramientas de análisis agrupadas por área (legal, psicológica, social, transversal). |
| **Reportes** | Estadísticas de casos por tipo, indicadores de gestión por profesional y análisis de tendencias, para autoridades y dirección. |
| **Auditoría** | El registro de todo lo que pasó en el sistema: quién hizo qué y cuándo (Jefatura ve su oficina; Administrador ve todo). |
| **Inspecciones** | El registro de fiscalizaciones a establecimientos. |
| **Copiloto IA** | El asistente de redacción con IA local, por disciplina. |
| **Portal del Tutor** | El acceso externo del Referente/Tutor para seguir el caso de su NNA. |

### Las pestañas del expediente

Cada caso se trabaja desde una ficha con pestañas:

- **Resumen:** el estado del caso, la fase actual y un panel que muestra quién ya presentó sus informes y quién falta.
- **Equipo:** los profesionales asignados, el profesional principal, el plan de sesiones de psicología y trabajo social con su porcentaje de avance, y la asignación/reasignación por Jefatura.
- **Informes:** redacción, revisión y emisión de los informes (social, psicológico, jurídico) y de los informes por sesión. Aquí se usa el generador de borradores con IA.
- **Evidencias:** los archivos del caso (audios, fotos, documentos) con su procesamiento automático y sus transcripciones.
- **Bitácora / Actuaciones:** el registro manual cronológico de las actuaciones profesionales (entrevistas, visitas, audiencias, derivaciones).
- **Conciliación:** la evaluación de conciliabilidad del abogado/a y el registro de las audiencias de conciliación.

---

## 6. Herramientas del sistema

El **Hub de Herramientas** ("Herramientas" en el menú) ofrece **12 herramientas visibles** de análisis para los profesionales. Existe además una **13.ª herramienta** —la transcripción de audio/video— que no aparece como tarjeta en el hub, pero se usa directamente desde la galería de evidencias del caso.

Las herramientas funcionan de tres maneras:

- **Cálculo exacto (sin IA):** operan con fórmulas matemáticas y procesales precisas, sin margen de error ni "alucinaciones".
- **Análisis asistido por IA local:** combinan la evidencia del propio expediente con la base de conocimiento legal institucional (modelos locales, sin internet).
- **Procesamiento automático:** convierten los archivos subidos (audios, fotos, PDFs) en texto e información aprovechable.

> Las herramientas **no reemplazan el criterio profesional**: son un apoyo para identificar elementos que podrían pasarse por alto y para estructurar mejor los análisis.

### Área legal (3 herramientas)

| Herramienta | Para qué sirve |
|-------------|----------------|
| **Análisis de Discrepancias** | Compara las declaraciones y testimonios del caso para detectar contradicciones, omisiones o inconsistencias (por ejemplo, una versión que no coincide con las fechas de otra), y genera un cuadro comparativo útil para la fundamentación legal. |
| **Tipicidad Penal** | Analiza los hechos registrados y sugiere la calificación jurídica inicial, citando los artículos aplicables de la Ley 548 (Código NNA) y del Código Penal boliviano. |
| **Vencimientos Procesales** | Calcula con precisión los plazos legales (por ejemplo, 24 horas para comunicar un acogimiento circunstancial al juez) y genera alertas automáticas en la agenda. Es cálculo exacto, sin IA. |

### Área psicológica (4 herramientas)

| Herramienta | Para qué sirve |
|-------------|----------------|
| **Indicadores de Trauma** | Examina las transcripciones de entrevistas y sesiones para extraer síntomas emocionales, conductuales y somáticos relevantes, y los clasifica con su nivel de severidad. |
| **Escalas de Riesgo** | Pre-completa borradores de escalas estandarizadas (ACES, PHQ-9, PTSD-8) a partir de los antecedentes del expediente; el psicólogo/a valida y ajusta cada ítem antes de guardar. |
| **Traducción Clínica** | Convierte apuntes informales de la sesión en redacción técnica para informes periciales, o traduce el lenguaje técnico a un formato comprensible para familias y autoridades (forense, educativo o familiar). |
| **Análisis de Trauma** | Compara la evolución del estado psicológico del NNA entre la primera evaluación y las sesiones de seguimiento (por ejemplo, reducción de episodios de ansiedad y mejoras en el sueño). |

### Área social (3 herramientas)

| Herramienta | Para qué sirve |
|-------------|----------------|
| **Estructura Familiar** | Construye el familiograma: el mapa visual de la familia, sus relaciones, roles de cuidado y redes de apoyo o fuentes de riesgo (por ejemplo, clasificar a un familiar como red protectora o factor de riesgo). |
| **Evaluación Vulnerabilidad** | Calcula un índice de vulnerabilidad social a partir de las condiciones económicas, de vivienda, escolaridad y salud (por ejemplo, hacinamiento crítico e ingreso bajo dan un índice alto). Es cálculo exacto, sin IA. |
| **Mapeo Ambiental** | Identifica factores de riesgo y de protección en el barrio, la escuela y la comunidad que rodea al NNA (servicios disponibles, alumbrado, espacios seguros, expendios de alcohol cercanos, etc.). |

### Herramientas transversales (2)

| Herramienta | Para qué sirve |
|-------------|----------------|
| **Línea de Tiempo Unificada** | Muestra en orden cronológico todas las actuaciones, evidencias, entrevistas e informes del expediente, y ayuda a detectar vacíos temporales. |
| **Reporte Anonimizado** | Detecta y elimina datos identificables (nombres, direcciones, números de documento) de un informe para poder compartirlo con terceros, investigación o estadísticas sin violar la confidencialidad. |

### Evidencias y transcripción (la 13.ª herramienta y el procesamiento automático)

| Herramienta | Para qué sirve |
|-------------|----------------|
| **Transcripción de Audio/Video (Whisper)** | Convierte las grabaciones subidas como evidencia a texto, para leer la entrevista o sesión completa ("Ver Transcripción" en la galería de evidencias). |
| **Procesamiento automático de evidencias** | Apenas se sube un archivo, el sistema lo procesa solo: los audios se transcriben, las fotos se analizan (se lee el texto visible —manuscritos, capturas de chat, certificados— y se describe el entorno), y los PDFs se indexan. El texto queda disponible para informes y herramientas sin volver a procesar. |

### Informes con asistencia de IA

| Herramienta | Para qué sirve |
|-------------|----------------|
| **Generador de borradores de informes** | En la pestaña "Informes" del caso, la IA redacta un borrador completo del informe jurídico, psicológico o social usando la información del expediente y la legislación aplicable. El profesional lo revisa, lo corrige y lo emite oficialmente. |

### Asistencia y administración de IA

| Herramienta | Para qué sirve |
|-------------|----------------|
| **Copiloto IA** | Asistente de redacción con IA local, según la disciplina: Copiloto Jurídico (escritos y fundamentación legal), Copiloto Psicológico (informes y evaluación de riesgo) y Copiloto Social (informes, fichas familiares y planes de intervención). |
| **Análisis de Imágenes (Visión IA)** | Procesa las fotografías de las evidencias: lectura del texto visible y análisis pericial del entorno. El modelo de visión es configurable. |
| **Procesos IA** | Panel exclusivo del Administrador para monitorear la cola de tareas de IA (transcripciones y análisis de imágenes): estado, posición en cola, reintentos y cancelaciones. |
| **Configuración IA** | Panel exclusivo del Administrador para elegir los modelos locales de IA: texto, embeddings, Whisper y visión. |

### Quién puede usar cada grupo de herramientas

| Rol | Herramientas visibles |
|-----|-----------------------|
| Administrador/a | Las 12 del hub (todas las áreas). |
| Jefatura | Las 12 visibles; los análisis especializados de cada disciplina los ejecuta el profesional correspondiente. |
| Abogado/a | Legales (3) + transversales (2) = 5. |
| Psicólogo/a | Psicológicas (4) + transversales (2) = 6. |
| Trabajador/a Social | Sociales (3) + transversales (2) = 5. |
| Secretaría | Ninguna (no tiene acceso al hub de herramientas). |

---

## 7. Cómo se protegen los datos

La plataforma maneja información muy sensible de NNA, por eso la protección es una parte central del diseño:

- **Evidencias inmutables.** Los archivos cargados como evidencia (audios, fotos, documentos) **no se pueden borrar ni modificar**: quedan bajo cadena de custodia.
- **Informes emitidos que no cambian.** Al hacer clic en "Emitir Informe", el documento queda firmado y congelado. Si más adelante se necesita aclarar algo, se crea un **informe complementario** (v2, v3...) vinculado al original, nunca se altera el emitido.
- **Token de seguridad para información sensible.** Para ver evidencias o informes altamente sensibles, el profesional debe volver a ingresar su contraseña; el acceso dura 15 minutos y cada uso queda registrado.
- **Registro de todo (auditoría).** Cada acción queda anotada: quién la hizo, cuándo y qué herramienta usó. La **bitácora de actuaciones** (registro manual de los profesionales: entrevistas, visitas, audiencias, derivaciones, seguimientos y notificaciones) se suma al registro automático del sistema. Ninguno de los dos puede editarse después de guardado, y la bitácora sigue reglas claras: registrar hechos observables, no interpretaciones; ser específico; mantener la confidencialidad.
- **IA 100 % local.** Los modelos de inteligencia artificial corren en servidores del municipio. Los datos de los NNA **no salen de la institución**.
- **Acceso por rol y por caso.** Cada persona ve únicamente lo que le corresponde: su oficina o sus casos asignados. Nadie tiene acceso a casos fuera de su alcance.

---

## 8. Glosario rápido

| Término | Qué significa |
|---------|---------------|
| **NNA** | Niña, niño o adolescente. |
| **Expediente** | El archivo digital completo de un caso, que es permanente y no se pierde aunque cambien los profesionales. |
| **Fase** | Etapa del ciclo de vida del caso: derivación, evaluación, seguimiento, judicialización y cierre. |
| **Actuación** | Cada acción profesional registrada en la bitácora (entrevista, visita domiciliaria, audiencia, derivación, etc.). |
| **Informe** | Documento profesional emitido (social, psicológico o jurídico). Una vez emitido, no se puede modificar. |
| **Informe complementario** | Versión nueva (v2, v3) que se crea cuando hace falta aclarar o ampliar un informe ya emitido. |
| **Evidencia** | Archivo adjunto al expediente (audio, foto, documento) que queda protegido e inmutable. |
| **Ficha social** | Primera evaluación profesional del caso, a cargo del Trabajador/a Social. Su completado habilita la fase de evaluación. |
| **Conciliación** | Intento de resolver el caso por acuerdo entre las partes en la Defensoría. El sistema la prohíbe automáticamente en casos de maltrato. |
| **Vía judicial** | Camino del caso cuando se presenta ante la justicia (denuncia penal, demanda, medidas de protección). |
| **RAG** | Técnica con la que el asistente de IA busca información en los documentos legales institucionales para responder y redactar con fundamento. |
| **Copiloto IA** | Asistente de redacción con IA local, especializado por disciplina (jurídico, psicológico, social). |

---

## Para profundizar

Este resumen se elaboró a partir de la documentación de usuario del proyecto, verificada contra el funcionamiento real del sistema. Si necesitás más detalle sobre tu tarea diaria, existe una guía específica por rol (Secretaría, Jefatura, Abogado/a, Psicólogo/a, Trabajador/a Social y Administrador/a) y una guía completa del flujo del caso, todas en español dentro de la carpeta de documentación del proyecto.
