# 📋 FLUJO COMPLETO - CASO REAL PASO A PASO

## 🎯 OBJETIVO
Guía completa para registrar y trabajar un caso real desde la denuncia inicial hasta el cierre, utilizando todas las herramientas de la plataforma según corresponde a cada rol.

---

## 📊 FLUJO GENERAL

```
AFECTADO → SECRETARIA → DERIVACIÓN → PROFESIONALES → HERRAMIENTAS → EXPEDIENTE
    ↓           ↓            ↓             ↓              ↓             ↓
 Denuncia   Ingreso     Asignación    Trabajo       Análisis    Informes
            Inicial    Profesional   Específico   Especializados  Finales
```

---

## 1️⃣ **FASE 1: PRESENTACIÓN DE DENUNCIA**

### **Quién**: Afectado, familiar, tercero, institución
### **Dónde**: Oficina de la Defensoría
### **Qué documenta**: 
- Datos básicos del NNA
- Descripción inicial de los hechos
- Datos del denunciante
- Urgencia del caso

### **Información Mínima Requerida:**
```
✅ Nombre completo del NNA
✅ Edad/Fecha nacimiento
✅ Dirección actual
✅ Descripción de los hechos
✅ Datos del denunciante
✅ Fecha y hora del incidente
⚠️  Situación de riesgo inmediato (SÍ/NO)
```

---

## 2️⃣ **FASE 2: INGRESO POR SECRETARIA**

### **Rol**: SECRETARIA
### **URL**: `http://localhost:3100/ingreso`
### **Tiempo estimado**: 15-30 minutos

### **PASOS DETALLADOS:**

#### **Paso 2.1: Crear Persona (NNA)**
1. Click en **"Inicio de caso"**
2. Buscar si la persona ya existe en el sistema
3. Si NO existe:
   - Click **"Crear Nueva Persona"**
   - Llenar datos básicos:
     ```
     - Nombres y Apellidos
     - Documento de Identidad (si tiene)
     - Fecha de Nacimiento
     - Sexo
     - Dirección actual
     - Teléfono de contacto
     ```
4. Si SÍ existe: Seleccionar de la lista

#### **Paso 2.2: Crear Caso**
1. Click **"Crear Nuevo Caso"**
2. Llenar información inicial:
   ```
   - Tipo de caso: [VIOLENCIA/NEGLIGENCIA/ABUSO/ABANDONO/OTRO]
   - Descripción inicial de hechos (narrativa básica)
   - Oficina responsable
   - Fecha de ingreso (automática)
   ```
3. **Sistema Crea Caso Automáticamente:**
   - Asigna número de expediente único
   - Asigna oficina según jurisdicción
   - **Estado inicial: "DERIVACION"** (Fase DERIVACION)
   - Ruta de intervención: "GESTION_ADMINISTRATIVA"

#### **Paso 2.3: Documentación Adicional**
1. Adjuntar documentos si los hay:
   - Denuncia escrita
   - Documentos de identidad
   - Informes médicos
   - Fotografías (evidencia)
2. Registrar información del denunciante
3. **GUARDAR CASO**

### **⚠️ IMPORTANTE - ASIGNACIÓN Y AUTOMATIZACIÓN DE FASE:**
```
🔴 SECRETARIA realiza el INGRESO BÁSICO del expediente
🟢 JEFATURA asigna el Equipo Interdisciplinario en la pestaña "Equipo" del expediente
📋 Al asignar al menos un profesional activo, el sistema avanza automáticamente el caso a fase "EVALUACION"
```

### **RESULTADO FASE 2:**
```
✅ Caso creado con número único de expediente
✅ NNA y partes registradas en el sistema  
✅ Fase inicial: "DERIVACION"
✅ Documentos de prueba o respaldos adjuntados
⏳ Esperando asignación de equipo por JEFATURA
```

---

## 3️⃣ **FASE 3: ASIGNACIÓN DE EQUIPO Y FASE EVALUACIÓN**

### **Rol**: JEFATURA o ADMINISTRADOR
### **URL**: `http://localhost:3100/casos/[id]` (Tab *Equipo*)
### **Tiempo estimado**: 5-10 minutos por caso

### **PASOS DETALLADOS:**

#### **Paso 3.1: Asignación de Profesionales**
1. Acceder al expediente del caso y seleccionar la pestaña **"Equipo"**.
2. Click en **"Asignar Profesionales"**.
3. Seleccionar los profesionales del equipo interdisciplinario:
   - **Abogado responsable** (Área Legal)
   - **Psicólogo responsable** (Área Psicológica)  
   - **Trabajador Social responsable** (Área Social)
4. Guardar la asignación.

#### **Paso 3.2: Transición Automática de Fase**
1. El backend verifica la incorporación del equipo.
2. **El estado del caso avanza automáticamente de `DERIVACION` a `EVALUACION`.**
3. En la pestaña **"Resumen"**, el widget de línea de tiempo `CaseFlowWidget` muestra el estado actualizado y destaca las tareas pendientes por disciplina.

---

## 3️⃣-B **FASE 3B: INFORMES DE EVALUACIÓN Y SEGUIMIENTO AUTOMÁTICO**

### **Rol**: ABOGADO, PSICÓLOGO, TRABAJADOR SOCIAL
### **URL**: `http://localhost:3100/casos/[id]` (Tab *Informes*)

#### **Paso 3B.1: Notificación de Tareas Pendientes**
- Al ingresar al caso, cada profesional asignado ve una alerta destacada en el **`CaseFlowWidget`** (Tab *Resumen*):
  - *"Tu informe inicial aún no fue presentado. El caso no puede avanzar a la fase de Seguimiento."*
- Un botón directo en la alerta redirige al tab **"Informes Profesionales"**.

#### **Paso 3B.2: Emisión e Inmutabilidad de Informes**
1. Cada profesional redacta y emite su informe correspondiente:
   - Trabajador Social: `INFORME_SOCIAL`
   - Psicólogo: `INFORME_PSICOLOGICO`
   - Abogado: `INFORME_JURIDICO`
2. Al pulsar **"Emitir Informe"**, el documento queda firmado e inmutable.

#### **Paso 3B.3: Transición Automática a Seguimiento**
1. Cuando todos los profesionales activos del equipo presentan sus informes de evaluación inicial, el sistema transiciona el expediente **automáticamente de `EVALUACION` a `SEGUIMIENTO`**.
2. Se habilita en la pestaña **"Equipo"** el panel de avance en tiempo real **`InterventionStatusPanel`**.

---

## 3️⃣-C **FASE 3C: PLANIFICACIÓN Y SEGUIMIENTO DE INTERVENCIONES**

### **Rol**: PSICÓLOGO, TRABAJADOR SOCIAL
### **URL**: `http://localhost:3100/casos/[id]` (Tab *Equipo*)

#### **Paso 3C.1: Definición del Plan de Sesiones**
1. En la pestaña **"Equipo"**, ubicar la tarjeta del profesional.
2. Click en **"Definir sesiones"** (o "Actualizar sesiones").
3. Ingresar la cantidad de sesiones planificadas (ej. 6 sesiones de terapia/acompañamiento).
4. Guardar. El sistema registra el plan mediante `POST /cases/:id/sessions-plan`.

#### **Paso 3C.2: Control del Progreso de Sesiones**
1. Con cada informe de sesión registrado (`INFORME_SESION_SEGUIMIENTO`), el sistema incrementa las sesiones completadas.
2. El anillo circular en **`InterventionStatusPanel`** actualiza visualmente el porcentaje de progreso (`completadas / requeridas`).
3. Al alcanzar el 100% de sesiones planificadas, el sistema marca el badge **"Intervención finalizada"** para ese profesional.


#### **Paso 3.1: Revisión de Caso Nuevo**
1. Ir a **"Casos"** → Filtrar por fase **"EVALUACION"**
2. Click en el caso con ficha social completada
3. Revisar información completa:
   - Tipo de caso
   - Ficha social (análisis del Trabajador Social)
   - Nivel de riesgo identificado
   - Descripción de hechos
   - Ubicación geográfica

#### **Paso 3.2: Decisión de Asignación**
**Según tipo de caso, asignar profesionales:**

```
🔴 CASOS DE ABUSO SEXUAL:
   → ABOGADO (obligatorio)
   → PSICOLOGO (obligatorio)  
   → TRABAJADOR_SOCIAL (opcional)

🟡 CASOS DE VIOLENCIA FÍSICA:
   → ABOGADO (obligatorio)
   → TRABAJADOR_SOCIAL (obligatorio)
   → PSICOLOGO (si hay indicios de trauma)

🟢 CASOS DE NEGLIGENCIA:
   → TRABAJADOR_SOCIAL (obligatorio)
   → PSICOLOGO (opcional)
   → ABOGADO (si requiere medidas legales)

🔵 CASOS COMPLEJOS/MIXTOS:
   → EQUIPO COMPLETO (los 3 profesionales)
```

#### **Paso 3.3: Asignación en el Sistema**
1. Click **"Asignar Profesionales"**
2. Seleccionar de listas desplegables:
   - **Abogado responsable** (si aplica)
   - **Psicólogo responsable** (si aplica)  
   - **Trabajador Social responsable** (si aplica)
3. Definir **Profesional Principal** (quien coordina)
4. Establecer **Prioridad del Caso**: [URGENTE/ALTA/MEDIA/BAJA]
5. **CONFIRMAR ASIGNACIÓN**

### **RESULTADO FASE 3:**
```
✅ Profesionales asignados según tipo de caso
✅ Estado: "EN_PROCESO" 
✅ Notificaciones enviadas a profesionales
✅ Caso visible en agenda de cada profesional
```

---

## 4️⃣ **FASE 4A: TRABAJO DEL ABOGADO**

### **Rol**: ABOGADO
### **URL**: `http://localhost:3100/casos` (sus casos asignados)
### **Herramientas**: `/herramientas` → Módulo Legal

### **PASOS DETALLADOS:**

#### **Paso 4A.1: Primera Revisión Legal**
1. Acceder al caso desde **"Mis Casos"**
2. Revisar documentación inicial
3. Determinar acciones legales necesarias:
   - ¿Requiere denuncia penal?
   - ¿Necesita medidas de protección?
   - ¿Hay responsabilidad civil?

#### **Paso 4A.2: Entrevista Legal (si necesaria)**
1. Programar cita con NNA/familia
2. Realizar entrevista enfocada en:
   - Hechos legalmente relevantes
   - Cronología precisa
   - Testigos
   - Evidencias disponibles
3. **GRABAR AUDIO** de la entrevista (con consentimiento)

#### **Paso 4A.3: Usar Herramientas Legales**
**URL**: `http://localhost:3100/herramientas`

##### **4A.3.1: Análisis de Discrepancias**
1. Click en **"⚖️ Herramientas Legales"**
2. Seleccionar **"Análisis de Discrepancias"**
3. Subir transcripción de entrevista
4. **Sistema analiza automáticamente:**
   - Inconsistencias temporales
   - Contradicciones factuales
   - Vacíos informativos
5. **Resultado**: Lista de preguntas de aclaración

##### **4A.3.2: Tipicidad Penal**
1. Usar transcripción o resumen de hechos
2. **Sistema analiza** qué figuras penales aplican:
   - Tipos penales específicos
   - Agravantes/Atenuantes
   - Competencia territorial
3. **Resultado**: Fundamentación legal para denuncia

##### **4A.3.3: Vencimientos Procesales**
1. Ingresar fechas clave del caso
2. **Sistema calcula** todos los plazos:
   - Plazos de denuncia
   - Términos procesales
   - Vencimientos críticos
3. **Resultado**: Calendario de seguimiento

#### **Paso 4A.4: Evaluar Conciliabilidad (Art. 24, 26, 27)**
**Marco Legal**: Reglamento Municipal de Defensorías, Ordenanza 136/03

##### **¿Cuándo evaluar?**
- Después de analizar los hechos legalmente
- Antes de decidir si ir a vía judicial
- En casos NO penales o de conflicto familiar

##### **Pasos para Evaluación:**
1. En el caso, click **"Evaluar Conciliabilidad"**
2. **Sistema analiza automáticamente** según Art. 24:
   ```
   ❌ NO CONCILIABLE SI:
      - Hay maltrato al NNA
      - Involucra pérdida de autoridad paterna
      - Constituye delito tipificado
   
   ✅ SÍ CONCILIABLE SI:
      - Es conflicto familiar no violento
      - No hay indicios de delito
      - Partes están dispuestas a dialogar
   ```
3. **Sistema cambia automáticamente** la ruta de intervención:
   - Si **CONCILIABLE** → Ruta: "CONCILIACION"
   - Si **NO CONCILIABLE** → Ruta: "VIA_JUDICIAL"

##### **Si el caso ES conciliable:**
1. Click **"Agendar Audiencia de Conciliación"**
2. Completar:
   ```
   - Fecha y hora de audiencia
   - Lugar (sala de audiencias de la Defensoría)
   - Partes convocadas
   ```
3. **Sistema crea automáticamente:**
   - Cita en calendario
   - Notificaciones a las partes
   - Registro en el expediente

##### **Realizar Audiencia de Conciliación:**
1. En la fecha programada, click en la cita
2. Durante la audiencia, documentar:
   - Asistencia de las partes
   - Desarrollo de la audiencia
   - Puntos de acuerdo/desacuerdo
3. Al finalizar, registrar resultado:
   ```
   ✅ ACUERDO ALCANZADO:
      - Redactar texto del acuerdo
      - Firmas de las partes
      - El caso continúa en seguimiento
      - Pendiente: Homologación judicial (si corresponde)
   
   ❌ SIN ACUERDO:
      - Documentar motivos
      - Sistema cambia automáticamente a "VIA_JUDICIAL"
      - Proceder con denuncia/demanda
   ```

##### **Homologación Judicial (si hubo acuerdo):**
1. Preparar solicitud de homologación
2. Presentar ante juez competente
3. Una vez homologado:
   - Registrar en el sistema
   - El caso pasa a fase "SEGUIMIENTO"

### **⚠️ GARANTÍA LEGAL - CONCILIACIÓN:**
```
✅ Cumple Arts. 24, 26, 27: Proceso de conciliación implementado
✅ Prohibición automática de conciliación en casos de maltrato
✅ Registro completo del proceso y resultado
✅ Trazabilidad de acuerdos y homologación
```

#### **Paso 4A.5: Generar Documentos Legales**
1. Basado en análisis de herramientas
2. Crear documentos según corresponda:
   - Denuncia penal
   - Solicitud de medidas de protección
   - Demanda civil (si aplica)
   - Informes legales

#### **Paso 4A.5: Generar Documentos Legales**
1. Basado en análisis de herramientas y evaluación de conciliabilidad
2. Crear documentos según corresponda:
   - **Si conciliable**: Convocatoria a audiencia, acta de acuerdo
   - **Si judicial**: Denuncia penal, solicitud de medidas, demanda civil
   - Informes legales
   - Solicitudes a autoridades

#### **Paso 4A.6: Coordinación con Otros Profesionales**
- **CON PSICÓLOGO**: Solicitar evaluación si hay trauma
- **CON TRABAJADOR SOCIAL**: Evaluación del entorno familiar
- **CON JEFATURA**: Reportar avances y solicitar autorizaciones

### **ENTREGABLES DEL ABOGADO:**
```
✅ Evaluación de conciliabilidad (obligatoria)
✅ Informe legal del caso
✅ Actas de conciliación (si aplica) o documentos legales judiciales
✅ Análisis de viabilidad de acciones
✅ Cronograma de procesos legales
✅ Recomendaciones de medidas de protección
```

---

## 4️⃣ **FASE 4B: TRABAJO DEL PSICÓLOGO**

### **Rol**: PSICOLOGO  
### **URL**: `http://localhost:3100/casos` (sus casos asignados)
### **Herramientas**: `/herramientas` → Módulo Psicológico

### **PASOS DETALLADOS:**

#### **Paso 4B.1: Evaluación Psicológica Inicial**
1. Revisar caso y antecedentes
2. Planificar evaluación según edad del NNA:
   - **0-3 años**: Observación + entrevista a cuidadores
   - **4-12 años**: Técnicas lúdicas + entrevista
   - **13+ años**: Entrevista directa + instrumentos
3. Programar sesiones de evaluación

#### **Paso 4B.2: Evaluación Clínica**
1. **Primera Sesión**: Rapport y evaluación general
2. **Segunda Sesión**: Evaluación específica del trauma
3. **Tercera Sesión**: Aplicación de instrumentos (si necesaria)
4. **GRABAR SESIONES** (con consentimiento y protocolos)

#### **Paso 4B.3: Usar Herramientas Psicológicas**
**URL**: `http://localhost:3100/herramientas`

##### **4B.3.1: Indicadores de Trauma**
1. Click **"🧠 Herramientas Psicológicas"**
2. Seleccionar **"Indicadores de Trauma"**
3. Subir transcripción de sesiones
4. **Sistema identifica:**
   - Indicadores de TEPT
   - Síntomas disociativos
   - Alteraciones emocionales
   - Indicadores de trauma complejo
5. **Resultado**: Perfil de trauma con severidad

##### **4B.3.2: Escalas de Riesgo**
1. Seleccionar escala apropiada:
   - **ACES** (Experiencias Adversas en la Infancia)
   - **PHQ-9** (Depresión adolescente)
   - **PTSD-8** (Trauma específico)
2. Sistema pre-llena ítems basado en sesiones
3. Psicólogo ajusta y completa manualmente
4. **Resultado**: Puntajes estandarizados

##### **4B.3.3: Traducción Clínica**
1. Ingresar notas clínicas técnicas
2. Seleccionar audiencia destino:
   - **Forense**: Para tribunales
   - **Educativo**: Para colegios
   - **Familiar**: Para padres/cuidadores
3. **Sistema traduce** terminología
4. **Resultado**: Informe comprensible para audiencia específica

#### **Paso 4B.4: Plan de Intervención**
1. Basado en evaluación y herramientas:
   - **Diagnóstico clínico** (si aplica)
   - **Objetivos terapéuticos**
   - **Modalidad de intervención** (individual/familiar/grupal)
   - **Duración estimada**
   - **Técnicas específicas**

#### **Paso 4B.5: Coordinación Interdisciplinaria**
- **CON ABOGADO**: Entregar evaluaciones para procesos legales
- **CON TRABAJADOR SOCIAL**: Coordinar intervención familiar
- **CON JEFATURA**: Reportar riesgo y necesidades especiales

### **ENTREGABLES DEL PSICÓLOGO:**
```
✅ Informe de evaluación psicológica
✅ Diagnóstico clínico (si aplica)
✅ Plan de intervención terapéutica
✅ Informes forenses (si requeridos)
✅ Recomendaciones de seguimiento
```

---

## 4️⃣ **FASE 4C: TRABAJO DEL TRABAJADOR SOCIAL**

### **Rol**: SOCIAL (Trabajador Social)
### **URL**: `http://localhost:3100/casos` (sus casos asignados)  
### **Herramientas**: `/herramientas` → Módulo Social

### **PASOS DETALLADOS:**

#### **Paso 4C.1: Evaluación Social del Entorno**
1. **Visita Domiciliaria** (obligatoria)
2. **Entrevista Familiar** completa
3. **Evaluación del Contexto:**
   - Condiciones de vivienda
   - Dinámicas familiares
   - Redes de apoyo
   - Recursos económicos
   - Factores de riesgo ambientales

#### **Paso 4C.2: Entrevistas Especializadas**
1. **Con el NNA** (apropiado para edad)
2. **Con cuidadores principales**
3. **Con familiares cercanos**
4. **Con referentes comunitarios** (si aplica)
5. **DOCUMENTAR TODO** en informes de visita

#### **Paso 4C.3: Usar Herramientas Sociales**
**URL**: `http://localhost:3100/herramientas`

##### **4C.3.1: Estructura Familiar (Familiograma)**
1. Click **"👥 Herramientas Sociales"**
2. Seleccionar **"Estructura Familiar"**
3. Ingresar información de entrevistas familiares
4. **Sistema genera:**
   - Familiograma visual
   - Mapa de relaciones
   - Identificación de conflictos
   - Recursos familiares disponibles
5. **Resultado**: Visualización completa de dinámicas

##### **4C.3.2: Evaluación de Vulnerabilidad**
1. Completar factores sociales del caso:
   - **Económicos**: Ingresos, empleo, vivienda
   - **Educativos**: Escolarización, rendimiento
   - **Sociales**: Redes de apoyo, integración comunitaria
   - **Culturales**: Pertenencia étnica, idioma
2. **Sistema calcula** índice de vulnerabilidad
3. **Resultado**: Score de riesgo + recomendaciones

##### **4C.3.3: Mapeo Ambiental**
1. Ingresar información del entorno del NNA:
   - **Barrio/Comunidad**: Servicios disponibles
   - **Escuela**: Condiciones educativas
   - **Salud**: Acceso a servicios médicos
   - **Recreación**: Espacios seguros disponibles
2. **Sistema mapea** factores protectores y de riesgo
3. **Resultado**: Plan de intervención contextualizado

#### **Paso 4C.4: Plan de Intervención Social**
1. **Objetivos a corto plazo** (1-3 meses)
2. **Objetivos a mediano plazo** (3-6 meses)  
3. **Intervenciones específicas:**
   - Fortalecimiento familiar
   - Gestión de recursos
   - Derivaciones institucionales
   - Seguimiento comunitario

#### **Paso 4C.5: Gestión de Recursos**
- **Derivaciones** a servicios especializados
- **Gestión de subsidios** o ayudas económicas
- **Coordinación** con otras instituciones
- **Seguimiento** de cumplimiento de acuerdos

### **ENTREGABLES DEL TRABAJADOR SOCIAL:**
```
✅ Informe social completo
✅ Familiograma y análisis familiar
✅ Evaluación de vulnerabilidad
✅ Plan de intervención social
✅ Gestión de recursos y derivaciones
```

---

## 5️⃣ **FASE 5: HERRAMIENTAS TRANSVERSALES**

### **Rol**: CUALQUIER PROFESIONAL del caso
### **URL**: `http://localhost:3100/herramientas` → Módulo Transversal
### **Cuándo usar**: Durante todo el proceso según necesidad

### **HERRAMIENTAS DISPONIBLES:**

#### **5.1: Línea de Tiempo Unificada**
**Quién la usa**: Cualquier profesional, especialmente útil para Jefatura
**Cuándo**: Casos complejos con múltiples eventos

1. **Sistema recopila automáticamente** eventos de:
   - Informes legales (fechas de hechos, procesos)
   - Sesiones psicológicas (cronología del trauma)
   - Visitas sociales (cambios en el entorno)
2. **Genera línea temporal** integrada
3. **Detecta vacíos** y inconsistencias temporales
4. **Resultado**: Visión cronológica completa del caso

#### **5.2: Reporte Anonimizado**
**Quién la usa**: Cualquier profesional
**Cuándo**: Para compartir información con terceros, investigación, estadísticas

1. Seleccionar informe o documento a anonimizar
2. **Sistema detecta automáticamente:**
   - Nombres propios
   - Direcciones
   - Números de documento
   - Datos identificables específicos
3. **Aplica anonimización** segura
4. **Resultado**: Documento listo para compartir sin riesgos

---

## 6️⃣ **FASE 6: SUPERVISIÓN Y COORDINACIÓN**

### **Rol**: JEFATURA y ADMINISTRADOR
### **URL**: Multiple páginas según función

### **FUNCIONES DE SUPERVISIÓN:**

#### **6.1: Autorización de Accesos**
**URL**: `http://localhost:3100/admin/tools-verification`

- **Aprobar herramientas** antes del uso productivo
- **Monitorear estado** de servicios de IA
- **Autorizar accesos especiales** a casos sensibles
- **Revisar logs** de uso de herramientas

#### **6.2: Gestión de Casos**
**URL**: `http://localhost:3100/casos` (vista completa)

- **Reasignación** de profesionales si es necesario
- **Autorización** de recursos especiales
- **Coordinación** entre equipos
- **Seguimiento** de plazos y vencimientos

#### **6.3: Reportes Gerenciales**
**URL**: `http://localhost:3100/reportes`

- **Estadísticas** de casos por tipo
- **Indicadores** de gestión por profesional
- **Reportes** para autoridades superiores
- **Análisis** de tendencias y patrones

---

## 7️⃣ **FASE 7: MANTENIMIENTO DE EXPEDIENTE**

### **PRINCIPIO CLAVE**: El expediente es permanente, los profesionales pueden cambiar

### **GARANTÍAS DEL SISTEMA:**

#### **7.1: Integridad del Expediente**
```
✅ El número de expediente NUNCA cambia
✅ Todos los informes quedan vinculados al caso
✅ El historial completo se mantiene
✅ Los documentos generados son permanentes
```

#### **7.2: Cambio de Profesionales**
**Escenario**: Un psicólogo se va, llega otro psicólogo nuevo

1. **JEFATURA/ADMIN** reasigna el caso:
   - Quita al profesional anterior
   - Asigna al nuevo profesional
2. **El nuevo profesional accede** a:
   - ✅ Todos los informes anteriores
   - ✅ Transcripciones previas
   - ✅ Resultados de herramientas ya aplicadas
   - ✅ Cronología completa del caso
3. **Puede continuar** desde donde quedó:
   - Usar herramientas con información existente
   - Generar nuevos informes que se suman
   - Mantener continuidad terapéutica/marco-legal/social

#### **7.3: Trazabilidad Completa**
```
📋 CADA ACCIÓN SE REGISTRA:
   - Quién hizo qué
   - Cuándo se hizo
   - Qué herramienta se usó
   - Qué resultados se obtuvieron
   - Quién autorizó qué acceso
```

---

## 🎯 **RESUMEN EJECUTIVO**

### **FLUJO GARANTIZADO (ACTUALIZADO CON CUMPLIMIENTO LEGAL):**
1. **SECRETARIA** → Ingresa caso básico en `/ingreso` (fase DERIVACION)
2. **TRABAJADOR SOCIAL** → Completa ficha social profesional (Art. 25) → Avanza a fase EVALUACION
3. **JEFATURA** → Asigna profesionales según tipo de caso
4. **ABOGADO** → Evalúa conciliabilidad (Arts. 24, 26, 27):
   - Si CONCILIABLE → Audiencia de conciliación
   - Si NO CONCILIABLE → Vía judicial
5. **PROFESIONALES** → Cada uno usa sus herramientas específicas en `/herramientas`
6. **HERRAMIENTAS** → Generan análisis especializados automáticamente
7. **COORDINACIÓN** → Sistema mantiene información integrada
8. **EXPEDIENTE** → Permanente e íntegro independiente de cambios de personal

### **ROLES Y ACCESOS GARANTIZADOS:**
- **SECRETARIA**: Solo ingreso básico de casos (NO ficha social)
- **SOCIAL**: Ficha social obligatoria + herramientas sociales + casos asignados
- **ABOGADO**: Evaluación de conciliabilidad + herramientas legales + casos asignados
- **PSICOLOGO**: Herramientas psicológicas + casos asignados  
- **JEFATURA**: TODO + supervisión + reasignaciones
- **ADMINISTRADOR**: TODO + configuraciones + autorizaciones

### **CUMPLIMIENTO LEGAL GARANTIZADO:**
- ✅ **Art. 25**: Trabajador Social elabora ficha social (NO Secretaria)
- ✅ **Arts. 24, 26, 27**: Proceso de conciliación implementado
- ✅ **Art. 24**: Prohibición automática de conciliación en maltrato
- ✅ Separación de roles administrativos vs profesionales
- ✅ Trazabilidad completa de decisiones y evaluaciones

### **INTEGRIDAD GARANTIZADA:**
- ✅ Un caso = Un expediente permanente
- ✅ Cambio de profesionales NO afecta el expediente
- ✅ Informes y herramientas quedan vinculados al caso
- ✅ Acceso completo al historial para nuevos profesionales
- ✅ Trazabilidad total de todas las acciones
- ✅ Flujo legal auditado y conforme a normativa municipal

---

**¿ESTAMOS EN SINTONÍA CON ESTE FLUJO COMPLETO?** 🎯
