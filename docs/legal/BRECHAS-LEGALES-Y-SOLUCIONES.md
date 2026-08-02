# 🚨 BRECHAS LEGALES Y SOLUCIONES - SISTEMA DNA SUCRE

**Fecha de análisis**: 2 de Agosto, 2026  
**Base legal**: Reglamento Municipal de Defensorías (Ordenanza Nº 136/03)  
**Estado**: Documento de trabajo - Requiere implementación

---

## 📊 RESUMEN EJECUTIVO

El sistema DNA Sucre está **bien alineado estructuralmente** con la ley, pero presenta **3 brechas importantes** que deben corregirse para cumplimiento legal completo:

| # | Brecha | Criticidad | Estado |
|---|--------|------------|--------|
| 1 | Rol que recibe denuncias | 🔴 ALTA | Pendiente corrección |
| 2 | Falta proceso de conciliación | 🔴 ALTA | Pendiente implementación |
| 3 | Base legal desactualizada (Ley 2026 vs Ley 548) | 🟡 MEDIA | Requiere verificación |
| 4 | Libro de denuncias | 🟢 BAJA | Probable cumplimiento |

---

## 🔴 BRECHA #1: QUIÉN RECIBE LA DENUNCIA (CRÍTICO)

### **Lo que dice la ley (Art. 25)**

> "Recepcionado el caso, la **Trabajadora social** dependiente de la Defensoría Municipales, debe elaborar una **ficha social**, para lo cual se entrevistará con el denunciante para así obtener datos sobre el hecho denunciado..."

### **Lo que hace el sistema actualmente**

- **SECRETARIA** recibe la denuncia
- **SECRETARIA** crea el caso y registra información inicial
- **TRABAJADOR SOCIAL** entra después, cuando el caso ya está asignado

### **Por qué es un problema**

La ley establece que la **primera evaluación profesional** debe hacerla una persona con formación en trabajo social, no personal administrativo. Esto garantiza:
- Correcta clasificación inicial del caso
- Identificación temprana de riesgos
- Aplicación de criterios profesionales desde el inicio

### **SOLUCIÓN PROPUESTA**

#### **Opción A: Flujo en 2 Etapas** (Recomendada)
```
1. SECRETARIA → Ingreso administrativo (datos básicos del NNA y denunciante)
   ↓
2. TRABAJADOR SOCIAL → Validación y elaboración de ficha social profesional
   ↓
3. JEFATURA → Asignación formal del caso
```

**Cambios en el sistema**:
- Estado nuevo: `PENDIENTE_FICHA_SOCIAL`
- La SECRETARIA crea el caso pero NO puede cerrarlo
- Notificación automática al TRABAJADOR SOCIAL disponible
- El TRABAJADOR SOCIAL completa la "Ficha Social" (nuevo formulario)
- Solo después de esta validación, el caso pasa a `PENDIENTE_ASIGNACIÓN`

#### **Opción B: Rol Híbrido** (Alternativa)
```
SECRETARIA con capacitación en Trabajo Social → Ingreso completo
```

**Requiere**:
- Capacitación formal del personal de SECRETARIA
- Certificación de competencias
- Respaldo legal de la jefatura

---

## 🔴 BRECHA #2: FALTA PROCESO DE CONCILIACIÓN (CRÍTICO)

### **Lo que dice la ley**

**Artículo 26**: Las Defensorías pueden "viabilizar la solución de un conflicto no sancionado por el Código Penal por la vía de la **conciliación**".

**Artículo 27**: Proceso de conciliación:
1. Equipo multidisciplinario evalúa
2. Convoca audiencia de conciliación
3. Se viabiliza acuerdo conciliatorio
4. Se precautelan intereses del NNA
5. **Homologación ante Juez** competente

**Artículo 24**: **NO procede conciliación** en:
- Casos de maltrato
- Suspensión o pérdida de autoridad paterna
- Casos con derechos contrapuestos

### **Lo que hace el sistema actualmente**

El sistema NO tiene:
- ❌ Módulo de conciliación
- ❌ Herramienta para agendar audiencias de conciliación
- ❌ Validación automática de "casos NO conciliables"
- ❌ Seguimiento de acuerdos conciliatorios
- ❌ Proceso de homologación judicial

### **Por qué es un problema**

La conciliación es una **vía legal obligatoria** para casos que:
- NO constituyen delito
- Pueden resolverse sin juicio
- Protegen los derechos del NNA

Sin esta funcionalidad, **todos los casos** van a la vía judicial, saturando al sistema y alargando tiempos de resolución.

### **SOLUCIÓN PROPUESTA**

#### **Implementar Módulo de Conciliación**

**Fase 1: Evaluación de Conciliabilidad** (Automática)
```typescript
// Después de la evaluación inicial del equipo
function esConciliable(caso) {
  // Casos que NO se pueden conciliar:
  if (caso.tipoViolencia === 'MALTRATO_FISICO') return false;
  if (caso.tipoViolencia === 'MALTRATO_PSICOLOGICO') return false;
  if (caso.tipoViolencia === 'ABUSO_SEXUAL') return false;
  if (caso.medida === 'SUSPENSION_AUTORIDAD_PATERNA') return false;
  if (caso.medida === 'PERDIDA_AUTORIDAD_PATERNA') return false;
  
  // Casos que SÍ se pueden conciliar:
  if (caso.tipoDelito === null || caso.tipoDelito === 'NINGUNO') {
    return true; // No hay delito tipificado
  }
  
  return false;
}
```

**Fase 2: Proceso de Conciliación**
```
1. Sistema identifica caso CONCILIABLE
   ↓
2. ABOGADO revisa y confirma viabilidad
   ↓
3. Sistema genera "Citación a Audiencia de Conciliación"
   ↓
4. Se agenda fecha (módulo de citas)
   ↓
5. Audiencia con:
   - Denunciante
   - Denunciado
   - Equipo multidisciplinario (Abogado, Social, Psicólogo)
   ↓
6. Si hay acuerdo:
   - Se documenta en el sistema
   - Se genera "Acuerdo Conciliatorio"
   - ABOGADO solicita homologación al Juez
   ↓
7. Seguimiento del cumplimiento del acuerdo
```

**Fase 3: Homologación Judicial**
```
Estado nuevo: PENDIENTE_HOMOLOGACION
- ABOGADO sube resolución judicial
- Si se homologa → Caso en SEGUIMIENTO_CONCILIACION
- Si se rechaza → Caso vuelve a VIA_JUDICIAL
```

#### **Cambios en el Sistema**

**Nuevos estados de caso**:
- `EVALUACION_CONCILIABILIDAD`
- `CONCILIABLE` / `NO_CONCILIABLE`
- `AUDIENCIA_CONCILIACION_AGENDADA`
- `ACUERDO_CONCILIATORIO_FIRMADO`
- `PENDIENTE_HOMOLOGACION`
- `SEGUIMIENTO_CONCILIACION`

**Nueva herramienta para ABOGADO**:
- "Evaluador de Conciliabilidad" (analiza el caso según criterios legales)
- "Generador de Acuerdos Conciliatorios"
- "Solicitud de Homologación Judicial"

**Nuevo flujo en `/herramientas`**:
- Pestaña "Conciliación" visible solo cuando el caso es conciliable
- Alertas rojas si se intenta conciliar un caso NO conciliable

---

## 🟡 BRECHA #3: BASE LEGAL DESACTUALIZADA

### **El problema**

El Reglamento Municipal (2003) cita:
- **Ley N° 2026** - Código Niño, Niña y Adolescente (1999) ← **DEROGADA**

La ley vigente es:
- **Ley N° 548** - Código Niña, Niño y Adolescente (2014) ← **VIGENTE**

### **Impacto en el sistema**

Si las herramientas de IA (especialmente "Tipicidad Penal") usan como base la Ley 2026 en lugar de la Ley 548:
- ❌ Los análisis podrían basarse en tipos penales que ya no existen
- ❌ Las recomendaciones legales podrían ser incorrectas
- ❌ Los plazos procesales podrían estar desactualizados

### **SOLUCIÓN PROPUESTA**

#### **Paso 1: Verificación Técnica**
```bash
# Revisar qué base legal usa el RAG del sistema
# Ubicación probable: apps/api/src/modules/knowledge/

1. Verificar documentos en la base de conocimiento
2. Confirmar si incluye Ley 548 (2014) o solo Ley 2026 (1999)
3. Revisar prompts del sistema en legal-tools.service.ts
```

#### **Paso 2: Actualización de Base de Conocimiento**

**Documentos a incluir**:
- ✅ Ley N° 548 - Código Niña, Niño y Adolescente (2014)
- ✅ D.S. 2377 - Reglamento de la Ley 548
- ✅ Ley N° 348 - Ley Integral para Garantizar a las Mujeres una Vida Libre de Violencia (2013)
- ⚠️ Mantener Reglamento Municipal 136/03 como referencia local

#### **Paso 3: Validación Legal**

Coordinar con un abogado especializado en:
1. Revisar los prompts de las herramientas legales
2. Confirmar que las referencias sean a la ley vigente
3. Actualizar el glosario legal del sistema

#### **Paso 4: Documentar**

Crear archivo: `docs/legal/LEYES-VIGENTES-REFERENCIAS.md`
```markdown
# Leyes aplicables al sistema DNA Sucre

## Marco Legal Nacional (VIGENTE)
- Ley N° 548 (2014) - Código Niña, Niño y Adolescente
- Ley N° 348 (2013) - Vida Libre de Violencia
- Ley N° 1678 (1995) - Ley de Violencia en la Familia (parcialmente vigente)

## Marco Legal Municipal (VIGENTE)
- Ordenanza N° 136/03 (2003) - Reglamento Municipal de Defensorías

## Leyes Derogadas (REFERENCIA HISTÓRICA)
- Ley N° 2026 (1999) - Código del Niño, Niña y Adolescente [DEROGADA por Ley 548]
```

---

## 🟢 BRECHA #4: LIBRO DE DENUNCIAS (MENOR)

### **Lo que dice la ley (Art. 25)**

> "Denuncias... deberán ser registradas en un **libro de recepción de denuncias**, especificando:
> - Número del caso denunciado
> - Fecha de la denuncia
> - Nombre del denunciante
> - Nombre del denunciado
> - Nombre del Niño, Niña o Adolescente
> - **Absoluta reserva** de los datos del NNA"

### **Lo que hace el sistema**

El expediente digital probablemente cumple con esto, pero no está explícito.

### **SOLUCIÓN PROPUESTA**

#### **Verificar que el modelo de datos incluya**:

```typescript
// Modelo Case en Prisma
model Case {
  // ✅ Ya tiene
  caseNumber: String
  createdAt: DateTime
  
  // ✅ Ya tiene (como relaciones)
  persons: Person[] // Incluye NNA, denunciante, denunciado
  
  // ⚠️ Verificar que tenga
  denunciante: Person? // Relación explícita
  denunciado: Person? // Relación explícita
  
  // ✅ Confidencialidad
  // Verificar que los endpoints protejan los datos del NNA
}
```

#### **Generar "Vista de Libro de Denuncias"**

Un reporte para auditorías que muestre:
- Todas las denuncias registradas en un período
- Datos básicos (sin violar confidencialidad del NNA)
- Numeración correlativa
- Estado de cada caso

Ubicación sugerida: `/panel/admin/libro-denuncias`

---

## 📋 PLAN DE IMPLEMENTACIÓN

### **FASE 1: CORRECCIONES CRÍTICAS** (2-3 semanas)

#### **Semana 1: Flujo de Ficha Social**
- [ ] Crear estado `PENDIENTE_FICHA_SOCIAL`
- [ ] Modificar rol SECRETARIA (ingreso básico solamente)
- [ ] Crear formulario "Ficha Social" para TRABAJADOR SOCIAL
- [ ] Implementar notificaciones automáticas
- [ ] Actualizar guías de usuario

#### **Semana 2-3: Módulo de Conciliación**
- [ ] Implementar evaluador de conciliabilidad
- [ ] Crear estados de conciliación
- [ ] Desarrollar flujo de audiencias
- [ ] Implementar generador de acuerdos
- [ ] Agregar proceso de homologación

### **FASE 2: VERIFICACIÓN LEGAL** (1 semana)

#### **Revisión de Base Legal**
- [ ] Auditar documentos en RAG
- [ ] Verificar referencias en código (Ley 2026 vs Ley 548)
- [ ] Actualizar base de conocimiento si es necesario
- [ ] Validar con abogado especializado

### **FASE 3: DOCUMENTACIÓN Y CAPACITACIÓN** (1 semana)

#### **Actualizar Documentación**
- [ ] Actualizar FLUJO-COMPLETO-CASO-REAL.md
- [ ] Actualizar guías por rol (SECRETARIA, SOCIAL, ABOGADO)
- [ ] Crear guía de conciliación
- [ ] Documentar cambios legales

#### **Capacitación**
- [ ] Taller para SECRETARIA (nuevo flujo)
- [ ] Taller para TRABAJADOR SOCIAL (ficha social)
- [ ] Taller para ABOGADO (conciliación)
- [ ] Taller para JEFATURA (supervisión)

---

## 🎯 CRITERIOS DE ÉXITO

Al completar estas correcciones, el sistema debe:

✅ **Cumplimiento Legal**
- Trabajador Social valida todos los casos antes de asignación
- Todos los casos no penales pasan por evaluación de conciliabilidad
- Referencias legales actualizadas a leyes vigentes

✅ **Trazabilidad**
- Auditoría completa de quién hizo qué en cada caso
- Libro de denuncias digital accesible para fiscalización
- Registro de todos los intentos de conciliación

✅ **Usabilidad**
- Flujos claros para cada rol
- Alertas automáticas de casos no conciliables
- Guías actualizadas y precisas

---

## 📞 CONTACTOS Y REFERENCIAS

**Para consultas legales**:
- Asesoría legal municipal
- Defensoría de la Niñez y Adolescencia - Sucre

**Documentos de referencia**:
- [`docs/legal/REGLAMENTO-MUNICIPAL-DEFENSORIAS-136-03.md`](./REGLAMENTO-MUNICIPAL-DEFENSORIAS-136-03.md)
- [`docs/guias-usuario/FLUJO-COMPLETO-CASO-REAL.md`](../guias-usuario/FLUJO-COMPLETO-CASO-REAL.md)

---

**Estado**: 🔴 Requiere acción inmediata  
**Prioridad**: ALTA  
**Impacto**: Cumplimiento legal y eficiencia operativa