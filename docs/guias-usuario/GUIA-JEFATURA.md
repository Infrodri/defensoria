# 👨‍💼 GUÍA DE USUARIO - JEFATURA

## 🎯 ROL Y RESPONSABILIDADES
Como **JEFATURA** (Jefe/a de Defensorías o Coordinador/a Distrital), tu trabajo se centra en la **supervisión general**, **asignación de casos**, **coordinación del equipo** y **seguimiento de indicadores** para garantizar la calidad y eficiencia del servicio de protección de derechos.

---

## ⚡ AUTOMATIZACIÓN DE FASES Y SUPERVISIÓN DE CASOS

### 1. **Asignación de Equipo**
- En la pestaña **Equipo** del caso (`/casos/[id]`), asigna a los profesionales responsables (Abogado/a, Psicólogo/a, Trabajador/a Social).
- La asignación **no cambia la fase del caso**: el expediente permanece en `DERIVACION` hasta que el/la Trabajador/a Social completa la **ficha social** (Art. 25, Ordenanza 136/03), que es lo que transiciona el caso a **`EVALUACION`**.

### 2. **Supervisión de Informes Iniciales y Avance a SEGUIMIENTO**
- En la pestaña **Resumen**, el widget `CaseFlowWidget` muestra en tiempo real qué profesionales ya emitieron su informe y cuáles están pendientes.
- Cuando los profesionales asignados emiten sus informes iniciales, el backend avanza automáticamente el expediente a **`SEGUIMIENTO`**.

### 3. **Monitoreo de Intervenciones (`InterventionStatusPanel`)**
- En la pestaña **Equipo**, Jefatura puede supervisar en tiempo real el plan de sesiones configurado por Psicología y Trabajo Social, así como el porcentaje circular de avance (`sesiones completadas / requeridas`).

---

## 🎛️ FUNCIONES PRINCIPALES

### **1. GESTIÓN DE CASOS**
- Supervisar ingreso de nuevos casos
- Asignar casos a profesionales del equipo
- Monitorear avance y cumplimiento de plazos
- Autorizar derivaciones interinstitucionales

### **2. COORDINACIÓN DE EQUIPO**
- Distribución equilibrada de carga laboral
- Supervisión técnica de profesionales
- Resolución de casos complejos
- Coordinación interdisciplinaria

### **3. SUPERVISIÓN DE HERRAMIENTAS**
- Acceso a las herramientas de todas las disciplinas (según la intención del frontend)
- Supervisión de uso apropiado por parte del equipo
- Validación de análisis complejos
- Autorización de acciones especiales

---

## 🔧 HERRAMIENTAS DISPONIBLES (12 VISIBLES EN EL HUB)

Como JEFATURA, el frontend (`role-access.ts`) te otorga **lectura y escritura sobre las 12 herramientas visibles** del hub `/herramientas` (3 legales, 4 psicológicas, 3 sociales y 2 transversales):

### **📊 HERRAMIENTAS LEGALES** (Supervisión de trabajo de ABOGADOS)
- ✅ Análisis de Discrepancias
- ✅ Tipicidad Penal
- ✅ Vencimientos Procesales

### **🧠 HERRAMIENTAS PSICOLÓGICAS** (Supervisión de trabajo de PSICÓLOGOS)
- ✅ Indicadores de Trauma
- ✅ Escalas de Riesgo
- ✅ Traducción Clínica
- ✅ Análisis de Trauma

### **🏠 HERRAMIENTAS SOCIALES** (Supervisión de trabajo de TRABAJADORES SOCIALES)
- ✅ Estructura Familiar
- ✅ Evaluación Vulnerabilidad
- ✅ Mapeo Ambiental

### **🔄 HERRAMIENTAS TRANSVERSALES** (Para coordinación general)
- ✅ Línea de Tiempo Unificada
- ✅ Reporte Anonimizado

> ⚠️ **Intención del frontend vs backend**: la UI muestra JEFATURA con permisos de lectura/escritura sobre estas herramientas, pero el **backend rechaza con `403`** los análisis de disciplina (legal, psicológica y social) porque exigen el rol de esa disciplina o `ADMINISTRADOR` (vía `@Roles` en los controllers). Es una desalineación conocida entre front y back, con bugfix de autorización planificado como follow-up — ante un `403`, deriva el análisis al profesional de la especialidad.

### 🗂️ MENÚ LATERAL (9 ÍTEMS)
El sidebar de JEFATURA muestra **9 ítems**: Panel General, Agenda y Citas, Expedientes, Inicio de caso, Inspecciones, Reportes, Balanceo de Equipo, Herramientas y Auditoría. No incluye los ítems de administración del sistema (Config IA, Base de Conocimiento, Catálogos, Mantenimiento, Permisos), reservados a ADMINISTRADOR.

---

## 📋 FLUJO DE TRABAJO TÍPICO

### **1. INICIO DE JORNADA**
**Tiempo estimado**: 30 minutos

1. **Revisar Dashboard**: `http://localhost:3100/panel`
   - Casos nuevos ingresados
   - Casos pendientes de asignación
   - Alertas de plazos próximos
   - Indicadores de carga laboral del equipo

2. **Revisar Agenda**: `http://localhost:3100/citas`
   - Reuniones de equipo programadas
   - Supervisiones individuales
   - Reuniones interinstitucionales

### **2. ASIGNACIÓN DE CASOS NUEVOS**
**Tiempo estimado**: 15-30 minutos por caso

**Proceso de asignación**:
1. Acceder a casos en fase `DERIVACION`
2. Evaluar complejidad y tipo de caso:
   - **Legal predominante** → Asignar a ABOGADO disponible
   - **Psicológico predominante** → Asignar a PSICÓLOGO disponible  
   - **Social predominante** → Asignar a TRABAJADOR SOCIAL disponible
   - **Casos complejos** → Asignar equipo multidisciplinario

3. **Considerar factores de asignación**:
   - Carga actual de cada profesional
   - Especialización y experiencia
   - Disponibilidad de tiempo
   - Ubicación geográfica del caso

4. **Establecer prioridades**:
   - Casos de urgencia: Asignación inmediata
   - Casos normales: Asignación en 24-48 horas

### **3. SUPERVISIÓN TÉCNICA**
**Tiempo estimado**: 1-2 horas diarias

**Supervisión semanal por profesional**:
1. Revisar casos asignados y su avance
2. Verificar uso apropiado de herramientas:
   - Acceder a `http://localhost:3100/herramientas`
   - Revisar análisis realizados por el equipo
   - Validar conclusiones y recomendaciones
3. Identificar necesidades de apoyo o capacitación
4. Resolver consultas técnicas complejas

### **4. COORDINACIÓN INTERINSTITUCIONAL**
**Casos que requieren autorización de JEFATURA**:
- Derivaciones a Ministerio Público
- Coordinaciones con juzgados
- Derivaciones a servicios de salud especializados
- Cambios de medidas de protección
- Casos que requieren recursos especiales

---

## 🚨 GESTIÓN DE CASOS DE URGENCIA

### **Protocolo de Urgencia para JEFATURA**:

**1. IDENTIFICACIÓN** (Inmediata):
- Recepción de alerta del sistema o profesional
- Evaluación inicial de riesgo
- Determinación de nivel de urgencia

**2. ACTIVACIÓN** (En 1 hora):
- Asignación inmediata de profesional disponible
- Autorización de recursos de emergencia
- Coordinación con servicios externos si es necesario

**3. SEGUIMIENTO** (Continuo):
- Monitoreo cada 4-6 horas las primeras 48 horas
- Evaluación de medidas implementadas
- Ajustes según evolución del caso

---

## 📊 INDICADORES DE GESTIÓN

### **Métricas de Supervisión**:

**Indicadores de Eficiencia**:
- ✅ **Tiempo promedio de asignación**: Meta < 24 horas
- ✅ **Casos resueltos por mes**: Por profesional y total
- ✅ **Cumplimiento de plazos**: Meta > 95%
- ✅ **Casos de urgencia**: Tiempo de respuesta < 4 horas

**Indicadores de Calidad**:
- ✅ **Uso de herramientas**: % de casos que usan herramientas apropiadas
- ✅ **Consistencia técnica**: Validación de análisis realizados
- ✅ **Coordinación interdisciplinaria**: % de casos con trabajo en equipo
- ✅ **Satisfacción de usuarios**: Evaluaciones de familias atendidas

### **Reportes Automáticos**:
El sistema genera automáticamente:
- **Reporte semanal**: Carga laboral por profesional
- **Reporte mensual**: Estadísticas generales de la oficina
- **Alertas en tiempo real**: Plazos próximos, casos de urgencia
- **Dashboard ejecutivo**: Indicadores clave actualizados

---

## 🔄 COORDINACIÓN CON EQUIPO

### **Reuniones de Equipo** (Semanales):
**Agenda tipo**:
1. Revisión de casos nuevos (30 min)
2. Análisis de casos complejos (45 min)
3. Coordinación de derivaciones (15 min)
4. Capacitación/actualización técnica (30 min)
5. Planificación semanal (15 min)

### **Supervisiones Individuales** (Quincenales):
**Con cada profesional**:
1. Revisión de carga de casos
2. Análisis de casos complejos específicos
3. Identificación de necesidades de apoyo
4. Retroalimentación sobre desempeño
5. Planificación de desarrollo profesional

---

## 🏛️ COORDINACIÓN INTERINSTITUCIONAL

### **Instituciones de Coordinación Frecuente**:

**Poder Judicial**:
- Juzgados de Familia
- Tribunales de Garantía
- Fiscalías especializadas

**Salud**:
- Hospitales pediátricos
- Servicios de salud mental
- Centros de atención primaria

**Educación**:
- Establecimientos educacionales
- Programas de reinserción escolar

**Otras Defensorías**:
- Coordinación entre oficinas
- Traspaso de casos por competencia

### **Protocolos de Derivación**:
1. **Evaluación técnica** del equipo profesional
2. **Autorización de JEFATURA** para derivación
3. **Coordinación formal** con institución receptora
4. **Seguimiento** de la derivación realizada
5. **Evaluación** de efectividad de la derivación

---

## ⚠️ ASPECTOS CRÍTICOS DE SUPERVISIÓN

### **Señales de Alerta en el Equipo**:
- Aumento de tiempos de respuesta
- Disminución en uso de herramientas del sistema
- Aumento de consultas técnicas básicas
- Casos sin avances en plazos establecidos
- Quejas o reclamos de usuarios

### **Acciones Correctivas**:
1. **Identificación temprana** del problema
2. **Análisis de causas** con el profesional involucrado
3. **Plan de mejora** específico y con plazos
4. **Seguimiento intensivo** hasta normalización
5. **Evaluación de resultado** de las medidas

---

## 📈 PLANIFICACIÓN Y PROYECCIÓN

### **Planificación Mensual**:
- Análisis de tendencias en tipos de caso
- Proyección de carga laboral
- Planificación de capacitaciones
- Evaluación de necesidades de recursos

### **Planificación Anual**:
- Establecimiento de metas institucionales
- Planificación de desarrollo del equipo
- Evaluación y mejora de procesos
- Coordinación con ADMINISTRADOR para recursos

---

## 📞 CONTACTOS CLAVE

### **Internos**:
- **ADMINISTRADOR**: Para recursos y permisos especiales
- **Equipo profesional**: Supervisión directa
- **Soporte Técnico**: Extensión 100

### **Externos**:
- **Tribunales**: Directorio integrado en el sistema
- **Fiscalías**: Contactos por zona de competencia
- **Servicios de Salud**: Directorio actualizado
- **Otras Defensorías**: Red de coordinación

---

## 🎯 OBJETIVOS ESTRATÉGICOS

### **Misión de la Jefatura**:
Garantizar un servicio de protección de derechos de calidad, oportuno y efectivo, coordinando eficientemente los recursos humanos y técnicos disponibles para el bienestar integral de los NNA atendidos.

### **Metas Permanentes**:
1. **100% de casos asignados** en tiempo oportuno
2. **Uso efectivo de herramientas** técnicas por parte del equipo
3. **Coordinación fluida** con instituciones de la red
4. **Mejora continua** de procesos y resultados
5. **Desarrollo profesional** constante del equipo

**¿Dudas sobre gestión o herramientas?** Como JEFATURA tienes acceso amplio a las herramientas del sistema y soporte prioritario. Ante un `403` en un análisis de disciplina, deriva el análisis al profesional de esa especialidad.