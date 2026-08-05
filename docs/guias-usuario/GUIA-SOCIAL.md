# 👨‍👩‍👧‍👦 GUÍA DE USUARIO - TRABAJADOR SOCIAL

## 🎯 ROL Y RESPONSABILIDADES
Como **TRABAJADOR SOCIAL** en la Defensoría de la Niñez y Adolescencia, tu trabajo se centra en la **evaluación sociofamiliar**, análisis del entorno del NNA, identificación de redes de apoyo y coordinación de recursos comunitarios para garantizar la protección integral.

---

## 📂 ESTRUCTURA DEL EXPEDIENTE Y SEGUIMIENTO EN TIEMPO REAL

### 1. **Pestaña Resumen (`/casos/[id]`) — Control de Flujo**
- **`CaseFlowWidget`**: Muestra la fase actual del caso (`DERIVACION` → `EVALUACION` → `SEGUIMIENTO` → `JUDICIALIZACION` → `CIERRE`).
- **Alerta Personal**: Si el caso está en fase `EVALUACION` y aún no presentaste tu `INFORME_SOCIAL`, el widget mostrará un aviso destacado con enlace directo a la pestaña **Informes**.

### 2. **Pestaña Equipo (`/casos/[id]`) — Plan y Control de Intervenciones**
- **`InterventionStatusPanel`**: 
  - Define tu plan de acompañamiento y visitas familiares mediante la opción **"Definir sesiones"** (ej. 4 a 6 intervenciones requeridas).
  - Anillo circular animado con el porcentaje de avance (`intervenciones completadas / requeridas`).
  - Al completar el total de visitas/intervenciones registradas en tus informes de seguimiento (`INFORME_SESION_SEGUIMIENTO`), el sistema marcará automáticamente la intervención como finalizada.

### 3. **Pestaña Informes (`/casos/[id]`) — Emisión de Informes**
- Emisión inmutable del `INFORME_SOCIAL` de evaluación inicial.
- Emisión de `INFORME_SESION_SEGUIMIENTO` tras cada visita o intervención efectuada.

### 4. **Módulo de Herramientas Sociales (`/herramientas/social`)**
- Tres herramientas sociales reales: **Estructura Familiar**, **Evaluación Vulnerabilidad** y **Mapeo Ambiental** (además de las transversales Línea de Tiempo Unificada y Reporte Anonimizado). Acceso directo desde el menú lateral en **Herramientas → Social**.

---

## 🎯 RESPONSABILIDAD LEGAL PRINCIPAL

### **📋 FICHA SOCIAL PROFESIONAL (Art. 25, Ordenanza 136/03)**

**¿Qué es?**: La ficha social es tu responsabilidad legal como profesional de trabajo social. Es el primer paso de evaluación profesional después del ingreso administrativo por SECRETARIA.

**Marco Legal**: Según el Art. 25 de la Ordenanza Municipal 136/03, el **Trabajador Social** es responsable de elaborar la "ficha social" del caso, realizando la primera evaluación profesional del NNA y su entorno.

**¿Cuándo realizar?**:
- Cuando un caso nuevo llega en fase **DERIVACION**
- Dentro de las primeras 48-72 horas del ingreso
- Antes de que JEFATURA asigne el equipo interdisciplinario completo

**Acceso**: `http://localhost:3100/casos/[id]/ficha-social`

#### **Contenido de la Ficha Social**:

**Sección 1: Datos de la Entrevista**
- Fecha y lugar de la entrevista profesional
- Profesional responsable (automático)

**Sección 2: Descripción del Hecho**
- Descripción detallada desde la perspectiva social
- Lugar y fecha del incidente (si se conoce)
- Testigos presenciales identificados

**Sección 3: Evaluación Social**
- Estructura familiar (composición, relaciones, dinámicas)
- Situación socioeconómica (ingresos, empleo, vivienda)
- ⚠️ **Evaluación de peligro inmediato para el NNA**
- Nivel de peligro: BAJO / MEDIO / ALTO

**Sección 4: Observaciones Profesionales**
- Análisis desde el trabajo social
- Factores de riesgo y protección identificados
- Recomendaciones iniciales

#### **Proceso de Completado**:

1. **Revisar caso**: Ver información básica ingresada por SECRETARIA
2. **Realizar entrevista**: Con el NNA y/o familia según corresponda
3. **Completar ficha**: Llenar las 4 secciones en el sistema
4. **Guardar borrador** (opcional): Si necesitas más información
5. **Completar y Enviar**: Acción final que:
   - Marca la ficha como completada e inmutable
   - Avanza el caso automáticamente a fase **EVALUACION**
   - Genera registro auditable en ActionLog
   - Notifica a JEFATURA que el caso está listo para asignación de equipo

#### **Flujo Legal Correcto**:
```
SECRETARIA (ingreso básico)
    ↓
Caso en fase DERIVACION
    ↓
TRABAJADOR SOCIAL (ficha social profesional) ← TU RESPONSABILIDAD
    ↓
Caso avanza a EVALUACION
    ↓
JEFATURA (asignación de equipo interdisciplinario)
```

#### **⚠️ IMPORTANTE**:
- Solo tú puedes completar la ficha social (validación de rol)
- Una vez completada, NO se puede modificar (registro inmutable)
- El caso NO avanza sin tu validación profesional
- Esta separación de roles garantiza cumplimiento legal

---

## 🏠 HERRAMIENTAS SOCIALES DISPONIBLES

### 1. **👨‍👩‍👧‍👦 ESTRUCTURA FAMILIAR**
**¿Qué hace?**: Genera el familiograma (diagrama visual de la estructura familiar), las relaciones y las dinámicas identificadas.

**¿Cuándo usar?**:
- En la primera evaluación sociofamiliar
- Al identificar nuevos miembros de la familia extendida
- Para presentaciones en reuniones de equipo
- Antes de realizar visitas domiciliarias

**Pasos de uso**:
1. Accede a "Herramientas Sociales"
2. Selecciona "Estructura Familiar"
3. El sistema analiza automáticamente:
   - Información registrada sobre familiares
   - Relaciones identificadas en entrevistas
   - Roles y dinámicas documentadas
4. Revisa el mapa generado
5. Personaliza agregando información adicional
6. Exporta para incluir en informes

**Resultado**: Diagrama visual completo de la familia con análisis de fortalezas y factores de riesgo.

---

### 2. **⚠️ EVALUACIÓN VULNERABILIDAD**
**¿Qué hace?**: Evalúa múltiples factores de riesgo social para determinar el nivel de vulnerabilidad del NNA y su familia.

**¿Cuándo usar?**:
- Para priorizar casos según urgencia social
- Al determinar tipo y nivel de intervención necesaria
- Para justificar asignación de recursos
- En seguimientos periódicos de casos activos

**Factores evaluados**:
- Situación socioeconómica
- Estructura y funcionamiento familiar
- Redes de apoyo disponibles
- Acceso a servicios básicos
- Factores de riesgo del entorno
- Recursos y fortalezas identificadas

**Pasos de uso**:
1. Click en "Evaluación Vulnerabilidad"
2. El sistema integra automáticamente:
   - Datos socioeconómicos registrados
   - Información de visitas domiciliarias
   - Evaluaciones familiares previas
3. Completa información faltante si es necesaria
4. Revisa el cálculo de vulnerabilidad
5. Genera recomendaciones de intervención

**Resultado**: Índice de vulnerabilidad con categorización (Bajo/Medio/Alto/Crítico) y plan de intervención sugerido.

---

### 3. **🗺️ MAPEO AMBIENTAL**
**¿Qué hace?**: Identifica y analiza factores del entorno comunitario que afectan al NNA (riesgos y recursos).

**¿Cuándo usar?**:
- Para evaluaciones integrales del entorno
- Al planificar derivaciones a servicios comunitarios
- Para identificar factores de riesgo ambientales
- En casos donde el entorno es factor relevante

**Componentes analizados**:
- Servicios de salud disponibles
- Instituciones educativas
- Centros de recreación y cultura
- Factores de riesgo del barrio/zona
- Organizaciones comunitarias
- Transporte y accesibilidad

**Pasos de uso**:
1. Selecciona "Mapeo Ambiental"
2. Ingresa la dirección del NNA
3. El sistema identifica automáticamente:
   - Servicios disponibles en el área
   - Factores de riesgo conocidos
   - Recursos comunitarios existentes
4. Complementa con tu evaluación directa
5. Prioriza recursos según necesidades del caso

**Resultado**: Mapa visual del entorno con análisis de oportunidades y amenazas para el NNA.

---

## 📝 FLUJO DE TRABAJO TÍPICO

### **1. RECEPCIÓN DE CASO ASIGNADO**
```
JEFATURA asigna caso → Revisión de expediente → Planificación de evaluación → Primera entrevista familiar
```

**Acciones inmediatas**:
1. Revisar información en `http://localhost:3100/casos`
2. Leer informes previos de SECRETARIA, ABOGADO y PSICÓLOGO
3. Identificar composición familiar conocida
4. Planificar estrategia de evaluación social

### **2. PRIMERA EVALUACIÓN SOCIOFAMILIAR**
**Tiempo estimado**: 2-3 sesiones (4-6 horas total)

**Sesión 1**: Entrevista familiar inicial
1. Entrevista con cuidadores principales
2. Identificar estructura y dinámicas familiares
3. Evaluar situación socioeconómica
4. Identificar redes de apoyo existentes

**Sesión 2**: Visita domiciliaria
1. Evaluar condiciones de vivienda
2. Observar interacciones familiares en entorno natural
3. Identificar recursos y limitaciones del hogar
4. **Usar "Mapeo Ambiental"** para evaluar entorno comunitario

**Sesión 3**: Análisis y síntesis
1. **Usar "Estructura Familiar"** para visualizar estructura y relaciones
2. **Usar "Evaluación Vulnerabilidad"** para evaluar riesgo integral
3. Integrar toda la información recopilada
4. Formular plan de intervención inicial

### **3. ELABORACIÓN DE INFORME SOCIAL**
**Tiempo estimado**: 3-4 horas

**Estructura del informe**:
1. **Situación Sociofamiliar**: Integrar mapa familiar y análisis
2. **Evaluación del Entorno**: Incluir mapeo ambiental
3. **Análisis de Vulnerabilidad**: Presentar índice y factores
4. **Recursos y Fortalezas**: Identificar elementos positivos
5. **Recomendaciones**: Plan de intervención específico
6. **Derivaciones**: Servicios comunitarios sugeridos

### **4. IMPLEMENTACIÓN Y SEGUIMIENTO**
- Coordinar derivaciones a servicios identificados
- Realizar visitas de seguimiento según cronograma
- Re-evaluar vulnerabilidad cada 60-90 días
- Actualizar el familiograma (Estructura Familiar) cuando cambien las circunstancias

---

## 🚨 CASOS DE URGENCIA SOCIAL

### **Indicadores de Riesgo Social Inmediato**:
- Condiciones de habitabilidad extremas
- Ausencia de cuidadores responsables
- Situación de calle o inestabilidad habitacional
- Falta de acceso a servicios básicos (salud, educación)
- Violencia doméstica activa

### **Protocolo de Urgencia**:
1. **INMEDIATAMENTE**: Evaluar con "Evaluación Vulnerabilidad"
2. **EN 4 HORAS**: Realizar visita domiciliaria de urgencia
3. **EN 24 HORAS**: Coordinar medidas de protección social
4. **EN 48 HORAS**: Activar red de servicios de emergencia
5. **EN 72 HORAS**: Establecer plan de seguimiento intensivo

---

## 🔄 COORDINACIÓN CON OTROS PROFESIONALES

### **Con ABOGADO**:
- Proporcionar informes sociales para procesos legales
- Evaluar idoneidad de cuidadores alternativos
- Documentar factores sociales relevantes para medidas legales

### **Con PSICÓLOGO**:
- Compartir evaluación de dinámicas familiares
- Coordinar intervenciones integrales
- Evaluar factores sociales que afectan salud mental del NNA

### **Con JEFATURA**:
- Reportar casos de riesgo social elevado
- Solicitar recursos adicionales para intervención
- Coordinar derivaciones interinstitucionales

---

## 🏘️ RED DE SERVICIOS Y DERIVACIONES

### **Servicios de Salud**:
- Centros de salud familiar
- Hospitales pediátricos
- Servicios de salud mental
- Programas de rehabilitación

### **Servicios Educativos**:
- Instituciones educativas regulares
- Programas de educación especial
- Centros de apoyo escolar
- Programas de reinserción educativa

### **Servicios Sociales**:
- Programas de apoyo económico
- Servicios de cuidado infantil
- Programas habitacionales
- Organizaciones de protección social

### **Servicios Comunitarios**:
- Centros comunitarios
- Programas deportivos y culturales
- Organizaciones religiosas
- Grupos de apoyo familiar

---

## 📊 INDICADORES DE ÉXITO

### **Métricas de tu trabajo**:
- ✅ **Tiempo de evaluación inicial**: Máximo 10 días hábiles
- ✅ **Efectividad de derivaciones**: % de servicios que efectivamente atienden al NNA
- ✅ **Mejoramiento de vulnerabilidad**: Reducción del índice en seguimientos
- ✅ **Adherencia familiar**: % de familias que participan activamente en intervenciones

### **Reportes automáticos**:
- Estadísticas de vulnerabilidad por zona geográfica
- Efectividad de servicios comunitarios derivados
- Evolución de indicadores sociales en casos de seguimiento

---

## 🏠 CONSIDERACIONES ESPECIALES PARA VISITAS DOMICILIARIAS

### **Preparación**:
1. Revisar información previa del caso
2. Coordinar con la familia (excepto en casos de urgencia)
3. Preparar materiales de evaluación
4. Considerar factores de seguridad del entorno

### **Durante la visita**:
1. Observar condiciones físicas de la vivienda
2. Evaluar dinámicas familiares en ambiente natural
3. Identificar recursos y limitaciones del hogar
4. Documentar observaciones objetivamente
5. Mantener actitud profesional y empática

### **Posterior a la visita**:
1. Registrar observaciones inmediatamente
2. Actualizar herramientas del sistema con nueva información
3. Planificar acciones de seguimiento
4. Coordinar derivaciones identificadas

---

## ⚠️ IMPORTANTE - ASPECTOS ÉTICOS

1. **Respeto Cultural**: Valorar diversidad de estructuras familiares
2. **No Discriminación**: Evitar juicios sobre estilos de vida diferentes
3. **Privacidad**: Respetar intimidad familiar durante visitas
4. **Autodeterminación**: Promover participación activa de la familia
5. **Recursos**: Optimizar uso de servicios disponibles

---

## 📈 HERRAMIENTAS DE MONITOREO Y SEGUIMIENTO

### **Indicadores de seguimiento**:
- Evolución del índice de vulnerabilidad
- Participación en servicios derivados
- Cambios en la estructura familiar
- Mejoras en condiciones habitacionales
- Fortalecimiento de redes de apoyo

### **Frecuencia de re-evaluación**:
- **Casos de alta vulnerabilidad**: Cada 30 días
- **Casos de vulnerabilidad media**: Cada 60 días
- **Casos de baja vulnerabilidad**: Cada 90 días

---

## 📞 CONTACTOS Y SOPORTE

- **Soporte Técnico**: Extensión 100
- **JEFATURA**: Para casos complejos y derivaciones especiales
- **Directorio de Servicios**: Integrado en el sistema
- **ADMINISTRADOR**: Para permisos y accesos

**¿Dudas sobre las herramientas?** Usa los tooltips (🛈) en cada herramienta para obtener orientación específica sobre evaluación social.


---

## 📖 **BITÁCORA DE ACTUACIONES - PERSPECTIVA SOCIAL**

La **bitácora** es tu registro oficial de todas las intervenciones sociales en el caso.

### **ACTUACIONES SOCIALES A REGISTRAR**

```
📋 TIPOS COMUNES:

1. ENTREVISTAS
   - Con NNA, familia, cuidadores
   - Temas tratados
   - Observaciones del entrevistado
   - Dinámicas relacionales

2. VISITAS DOMICILIARIAS
   - Condiciones del hogar
   - Relaciones intrafamiliares
   - Riesgos observados
   - Recursos disponibles

3. SEGUIMIENTO
   - Cumplimiento de recomendaciones
   - Evolución familiar
   - Cambios conductuales
   - Necesidades emergentes

4. INTERVENCIONES COMUNITARIAS
   - Contactos con instituciones
   - Derivaciones realizadas
   - Articulación con recursos
   - Acompañamiento

5. GESTIÓN DE RIESGOS
   - Riesgos identificados
   - Acciones de contención
   - Activación de protocolos
   - Medidas implementadas
```

### **CÓMO REGISTRAR**

1. Abre el caso → Tab "Bitácora"
2. Click "+ Agregar Actuación"
3. Selecciona tipo: "ENTREVISTA", "VISITA_DOMICILIARIA", "SEGUIMIENTO"
4. Completa campos:
   - Fecha y lugar
   - Participantes
   - Observaciones detalladas
   - Recomendaciones

### **OBSERVACIONES IMPORTANTES**

```
✅ DESCRIBE COMPORTAMIENTOS OBSERVABLES
   NO: "El NNA está traumatizado"
   SÍ: "El NNA evita contacto visual, llora al mencionar
       su padre, manifiesta ansiedad al cambio de tema"

✅ CONTEXTUALIZAS LAS DINÁMICAS
   NO: "La familia está rota"
   SÍ: "La familia enfrenta conflictos sobre autoridad.
       Padre ausente, madre asume rol central, hijos
       cuestionan límites establecidos"

✅ IDENTIFICAS FORTALEZAS
   "A pesar de dificultades económicas, familia mantiene
   valores de solidaridad. Hermana mayor apoya tareas
   escolares. Abuela proporciona cuidado diario"
```

### **REGLAS**

✅ Confiabilidad - Datos verificables  
✅ Contextualización - Considerando circunstancias  
✅ Fortalezas - No solo riesgos  
✅ Propositivo - Orientado a soluciones  
✅ Confidencial - Máxima protección de datos  

