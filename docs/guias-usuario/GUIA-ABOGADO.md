# 👨‍⚖️ GUÍA DE USUARIO - ABOGADO

## 🎯 ROL Y RESPONSABILIDADES
Como **ABOGADO** en la Defensoría de la Niñez y Adolescencia, tu trabajo se centra en el aspecto **jurídico-legal** de los casos, garantizando que se cumplan todos los procedimientos legales y que los derechos de los NNA estén protegidos.

---

## ⚖️ RESPONSABILIDAD LEGAL PRINCIPAL

### **📜 EVALUACIÓN DE CONCILIABILIDAD (Arts. 24, 26, 27 - Ordenanza 136/03)**

**¿Qué es?**: Es tu responsabilidad evaluar si un caso puede resolverse mediante conciliación o debe ir a vía judicial.

**Marco Legal**: 
- **Art. 24**: PROHIBE conciliación en casos de maltrato o pérdida de autoridad paterna
- **Art. 26**: Casos NO penales DEBEN intentar conciliación primero
- **Art. 27**: Audiencias de conciliación deben registrarse y homologarse

**¿Cuándo evaluar?**:
- Después de revisar los hechos del caso
- Antes de decidir si ir a vía judicial
- Cuando el caso está en fase EVALUACION o superior

**Acceso**: `http://localhost:3100/casos/[id]/conciliacion`

#### **Proceso de Evaluación Automática**:

**El sistema analiza automáticamente según Art. 24**:
- ❌ **NO CONCILIABLE** si:
  - Hay maltrato al NNA
  - Involucra pérdida de autoridad paterna
  - Constituye delito tipificado
- ✅ **SÍ CONCILIABLE** si:
  - Es conflicto familiar no violento
  - No hay indicios de delito
  - No está en supuestos del Art. 24

**Resultado de la Evaluación**:
- Sistema cambia automáticamente la **ruta de intervención**:
  - CONCILIABLE → Ruta: **CONCILIACION**
  - NO CONCILIABLE → Ruta: **VIA_JUDICIAL**
- Genera registro auditable en ActionLog
- Actualiza historial de rutas de intervención

#### **Si el Caso ES CONCILIABLE**:

**1. Agendar Audiencia de Conciliación**:
- Fecha y hora de la audiencia
- Lugar (sala de audiencias)
- Sistema crea automáticamente:
  - Cita en calendario del caso
  - Notificaciones a las partes
  - Registro en el expediente

**2. Realizar Audiencia**:
- En la fecha programada
- Documentar desarrollo de la audiencia
- Negociar acuerdo entre las partes

**3. Registrar Resultado**:

**CON ACUERDO**:
- Redactar texto del acuerdo
- Firmas de las partes
- Sistema registra automáticamente
- **Pendiente**: Solicitar homologación judicial
- Caso pasa a seguimiento

**SIN ACUERDO**:
- Documentar motivos
- Sistema cambia automáticamente a **VIA_JUDICIAL**
- Proceder con denuncia/demanda

#### **Flujo Legal Correcto**:
```
Caso en EVALUACION
    ↓
ABOGADO evalúa conciliabilidad ← TU RESPONSABILIDAD
    ↓
    ├─ CONCILIABLE → Audiencia de conciliación
    │                 ├─ CON ACUERDO → Homologación → Seguimiento
    │                 └─ SIN ACUERDO → VIA_JUDICIAL
    │
    └─ NO CONCILIABLE → VIA_JUDICIAL (automático)
```

#### **⚠️ IMPORTANTE**:
- La prohibición de conciliar en maltrato es AUTOMÁTICA
- No se pueden agendar audiencias en casos no conciliables
- Todos los acuerdos deben ser homologados judicialmente
- El sistema garantiza cumplimiento del Art. 24

---

## 📋 ACCESO AL SISTEMA

### **URL Principal**: `http://localhost:3100/ingreso`
### **Credenciales**: Proporcionadas por JEFATURA
### **Panel Principal**: `http://localhost:3100/herramientas`

---

## 🔧 HERRAMIENTAS LEGALES DISPONIBLES

### 1. **📊 ANÁLISIS DE DISCREPANCIAS**
**¿Qué hace?**: Identifica inconsistencias en testimonios, documentos y evidencias del caso.

**¿Cuándo usar?**:
- Cuando hay testimonios contradictorios
- Al revisar declaraciones de testigos
- Antes de presentar el caso ante autoridad competente

**Pasos de uso**:
1. Selecciona el caso desde tu panel
2. Click en "Análisis de Discrepancias" 
3. El sistema analiza automáticamente:
   - Declaraciones registradas
   - Documentos del expediente
   - Testimonios de entrevistas
4. Revisa el informe generado
5. Usa los hallazgos para fortalecer el caso

**Resultado**: Informe detallado con discrepancias encontradas y sugerencias legales.

---

### 2. **⚖️ ANÁLISIS DE TIPICIDAD PENAL**
**¿Qué hace?**: Determina si los hechos constituyen delito según el Código Penal vigente.

**¿Cuándo usar?**:
- Al recibir un caso nuevo asignado
- Antes de derivar a Ministerio Público
- Para determinar acciones legales a seguir

**Pasos de uso**:
1. Accede desde "Herramientas Legales"
2. Selecciona "Tipicidad Penal"
3. El sistema analiza los hechos registrados
4. Revisa el análisis de elementos del tipo penal
5. Descarga el informe para el expediente

**Resultado**: Dictamen legal sobre tipificación del delito y acciones recomendadas.

---

### 3. **📅 CÁLCULO DE PLAZOS PROCESALES**
**¿Qué hace?**: Calcula automáticamente todos los plazos legales aplicables al caso.

**¿Cuándo usar?**:
- Al iniciar cualquier proceso legal
- Para hacer seguimiento de vencimientos
- Antes de presentar escritos o recursos

**Pasos de uso**:
1. Click en "Plazos Procesales"
2. Selecciona el tipo de proceso:
   - Proceso penal
   - Proceso civil (familia)
   - Proceso administrativo
3. El sistema calcula automáticamente:
   - Plazos de investigación
   - Términos para presentar escritos
   - Fechas límite de recursos
4. Agenda recordatorios automáticos

**Resultado**: Calendario con todos los plazos y alertas automáticas.

---

## 📝 FLUJO DE TRABAJO TÍPICO

### **1. RECEPCIÓN DE CASO ASIGNADO**
```
JEFATURA asigna caso → Notificación → Revisión inicial → Análisis legal
```

**Acciones inmediatas**:
1. Acceder a `http://localhost:3100/casos`
2. Buscar el caso asignado (aparece en "Mis Casos")
3. Revisar toda la documentación disponible
4. Leer informes de SECRETARIA y otros profesionales

### **2. ANÁLISIS LEGAL INICIAL**
**Tiempo estimado**: 2-3 horas

1. **Usar "Tipicidad Penal"** para evaluar si hay delito
2. **Usar "Plazos Procesales"** para establecer cronograma
3. **Usar "Discrepancias"** si hay múltiples declaraciones
4. Documentar hallazgos en el expediente

### **3. ACCIONES LEGALES**
Según el análisis inicial:

**Si HAY DELITO**:
- Preparar denuncia penal
- Coordinar con Ministerio Público
- Establecer medidas de protección

**Si NO hay delito**:
- Derivar a proceso civil/familiar
- Coordinar con juzgados de familia
- Enfocar en restitución de derechos

### **4. SEGUIMIENTO Y ACTUALIZACIÓN**
- Usar herramientas cada vez que haya nueva información
- Actualizar análisis cuando cambien los hechos
- Mantener el expediente actualizado
- Coordinar con PSICOLOGO y SOCIAL según necesidad

---

## 🚨 CASOS DE URGENCIA

### **Criterios de Urgencia Legal**:
- Riesgo inminente para el NNA
- Plazos procesales próximos a vencer
- Órdenes judiciales pendientes
- Medidas cautelares a implementar

### **Protocolo de Urgencia**:
1. **INMEDIATAMENTE**: Evaluar tipicidad penal
2. **EN 24 HORAS**: Presentar medidas de protección si corresponde
3. **EN 48 HORAS**: Coordinar con autoridades competentes
4. **EN 72 HORAS**: Actualizar expediente con todas las acciones

---

## 🔄 COORDINACIÓN CON OTROS PROFESIONALES

### **Con PSICOLOGO**:
- Solicitar evaluaciones psicológicas cuando sea necesario para el proceso legal
- Revisar informes de trauma para fortalecer el caso
- Coordinar testimonios especializados

### **Con TRABAJADOR SOCIAL**:
- Solicitar informes sociales del entorno familiar
- Coordinar visitas domiciliarias
- Evaluar redes de apoyo para medidas de protección

### **Con JEFATURA**:
- Reportar avances significativos
- Solicitar autorización para acciones especiales
- Coordinar derivaciones a otras instituciones

---

## 📊 INDICADORES DE ÉXITO

### **Métricas de tu trabajo**:
- ✅ **Tiempo de análisis inicial**: Máximo 5 días hábiles
- ✅ **Precisión legal**: 0 errores en tipificación
- ✅ **Cumplimiento de plazos**: 100% de plazos respetados
- ✅ **Coordinación**: Respuesta a otros profesionales en 24h

### **Reportes automáticos**:
El sistema genera automáticamente:
- Resumen semanal de casos trabajados
- Alertas de plazos próximos
- Estadísticas de tipos de caso atendidos

---

## ⚠️ IMPORTANTE - ASPECTOS ÉTICOS Y LEGALES

1. **Confidencialidad**: Toda información es estrictamente confidencial
2. **Interés Superior**: Siempre priorizar el bienestar del NNA
3. **Debido Proceso**: Respetar todos los procedimientos legales
4. **Coordinación**: Trabajar en equipo con otros profesionales
5. **Documentación**: Registrar todas las acciones realizadas

---

## 📞 CONTACTOS Y SOPORTE

- **Soporte Técnico**: Extensión 100
- **JEFATURA**: Para consultas sobre casos complejos
- **ADMINISTRADOR**: Para permisos y accesos al sistema

**¿Dudas sobre las herramientas?** Usa los tooltips (🛈) en cada herramienta para obtener ayuda contextual.


---

## 📖 **BITÁCORA DE ACTUACIONES - REGISTRO LEGAL**

La **bitácora** es tu registro oficial de todas las actuaciones jurídicas en el caso.

### **ACTUACIONES LEGALES A REGISTRAR**

```
📋 TIPOS COMUNES:

1. AUDIENCIAS JUDICIALES
   - Fecha y tribunal
   - Participantes presentes
   - Resoluciones/fallos
   - Próximas fechas

2. DILIGENCIAS LEGALES
   - Notificaciones cursadas
   - Presentación de escritos
   - Requerimientos a instituciones

3. SEGUIMIENTO LEGAL
   - Estado de procesos
   - Vencimiento de plazos
   - Recursos interpuestos

4. EVALUACIÓN CONCILIACIÓN
   - Aptitud para conciliación
   - Prohibiciones legales
   - Recomendaciones
```

### **CÓMO REGISTRAR**

1. Abre el caso → Tab "Bitácora"
2. Click "+ Agregar Actuación"
3. Selecciona: "AUDIENCIA" o tipo legal
4. Completa campos:
   - Fecha exacta
   - Tribunal/Institución
   - Resolución o acuerdo
   - Próximos pasos

### **REGLAS**

✅ Precisión legal - Cita leyes y artículos  
✅ Fechas exactas - Incluye hora si es relevante  
✅ Lenguaje formal - Redacción profesional  
✅ Sin interpretaciones - Solo hechos  
✅ Confidencial - Cumple con secreto profesional  

