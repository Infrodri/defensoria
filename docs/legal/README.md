# 📖 DOCUMENTACIÓN LEGAL - DNA SUCRE

Marco legal y normativo que fundamenta el funcionamiento de las Defensorías de la Niñez y Adolescencia del Gobierno Municipal de Sucre.

---

## 📂 CONTENIDO

### 📜 **Documentos Normativos**

- **[REGLAMENTO-MUNICIPAL-DEFENSORIAS-136-03.md](./REGLAMENTO-MUNICIPAL-DEFENSORIAS-136-03.md)**
  - Ordenanza Municipal Nº 136/03 (2003)
  - Regula funcionamiento de las Defensorías
  - Define roles, atribuciones y procedimientos
  - Base legal del sistema DNA Sucre

### 🚨 **Análisis de Cumplimiento**

- **[BRECHAS-LEGALES-Y-SOLUCIONES.md](./BRECHAS-LEGALES-Y-SOLUCIONES.md)**
  - Identificación de 4 brechas legales
  - Análisis de impacto y criticidad
  - Soluciones propuestas con plan de implementación
  - **LECTURA OBLIGATORIA para PM y equipo técnico**

### 🔧 **Guía de Implementación**

- **[IMPLEMENTACION-TECNICA-BRECHAS.md](./IMPLEMENTACION-TECNICA-BRECHAS.md)**
  - Guía técnica paso a paso
  - Cambios en modelos de datos (Prisma)
  - Código de servicios y controladores
  - Tests de verificación
  - **Para desarrolladores**

---

## 🎯 ACCESO RÁPIDO

### **¿Eres Project Manager o Jefatura?**
➡️ Lee: [`BRECHAS-LEGALES-Y-SOLUCIONES.md`](./BRECHAS-LEGALES-Y-SOLUCIONES.md)

### **¿Eres Desarrollador?**
➡️ Lee: [`IMPLEMENTACION-TECNICA-BRECHAS.md`](./IMPLEMENTACION-TECNICA-BRECHAS.md)

### **¿Necesitas consultar el reglamento?**
➡️ Lee: [`REGLAMENTO-MUNICIPAL-DEFENSORIAS-136-03.md`](./REGLAMENTO-MUNICIPAL-DEFENSORIAS-136-03.md)

---

## 📊 RESUMEN DE BRECHAS IDENTIFICADAS

| # | Brecha | Criticidad | Estado |
|---|--------|------------|--------|
| **1** | **Rol que recibe denuncias** | 🔴 ALTA | Pendiente |
| **2** | **Falta módulo de conciliación** | 🔴 ALTA | Pendiente |
| **3** | **Base legal desactualizada** | 🟡 MEDIA | Verificar |
| **4** | **Libro de denuncias** | 🟢 BAJA | Probable OK |

### **Impacto Global**
- ⚠️ **2 brechas críticas** requieren corrección inmediata
- ⏱️ **Tiempo estimado**: 6 semanas de desarrollo
- 💼 **Responsable**: Equipo técnico + validación legal

---

## 🔗 MARCO LEGAL APLICABLE

### **Leyes Nacionales VIGENTES**

#### **Ley N° 548 (2014)** 
**Código Niña, Niño y Adolescente**
- Ley actual que regula protección integral de NNA
- Reemplazó a la Ley N° 2026 (1999)
- **Estado**: ✅ VIGENTE

#### **Ley N° 348 (2013)**
**Ley Integral para Garantizar a las Mujeres una Vida Libre de Violencia**
- Protección contra violencia de género
- Aplica a casos donde la madre es víctima
- **Estado**: ✅ VIGENTE

#### **D.S. N° 2377 (2015)**
**Reglamento de la Ley N° 548**
- Reglamentación del Código NNA
- **Estado**: ✅ VIGENTE

### **Normativa Municipal VIGENTE**

#### **Ordenanza N° 136/03 (2003)**
**Reglamento Municipal de Defensorías**
- Base legal del sistema DNA Sucre
- Define competencias municipales
- **Estado**: ✅ VIGENTE (requiere actualización de referencias)

### **Leyes DEROGADAS** (Solo referencia histórica)

#### **Ley N° 2026 (1999)**
**Código del Niño, Niña y Adolescente**
- **Estado**: ❌ DEROGADA (reemplazada por Ley 548)
- ⚠️ **IMPORTANTE**: Verificar que el sistema use Ley 548, no Ley 2026

---

## 📋 ARTÍCULOS CLAVE DEL REGLAMENTO

### **Definición de Roles** (Art. 11)

La Defensoría está integrada por:
- **Trabajadora Social** (profesional)
- **Psicólogo** (profesional)
- **Abogado** (profesional)
- Personal administrativo

### **Atribuciones** (Art. 8)

15 atribuciones específicas, destacando:
1. Presentar denuncias ante autoridades
2. Disponer medidas de protección
3. Intervenir como promotores legales
4. Brindar orientación interdisciplinaria
5. Promover conciliación (cuando sea legal)

### **Proceso de Denuncia** (Art. 25)

> "La **Trabajadora Social** debe elaborar una ficha social"

### **Conciliación** (Arts. 24, 26, 27)

- **Procede** cuando NO hay delito
- **NO procede** en casos de:
  - Maltrato
  - Suspensión/pérdida de autoridad paterna
- Requiere audiencia con equipo multidisciplinario
- Acuerdos deben homologarse ante Juez

### **Confidencialidad** (Art. 25)

> "Mantenerse **absoluta reserva** los datos del NNA"

---

## 🔍 CÓMO USAR ESTA DOCUMENTACIÓN

### **Para validar decisiones de diseño**

Ejemplo: "¿Qué rol debe aprobar una acción?"
1. Consultar Art. 8 (Atribuciones)
2. Verificar competencias específicas
3. Implementar según lo establecido

### **Para entender el flujo de casos**

1. Leer BRECHAS-LEGALES-Y-SOLUCIONES.md (sección de flujos)
2. Contrastar con FLUJO-COMPLETO-CASO-REAL.md
3. Identificar puntos de mejora

### **Para implementar nuevas funcionalidades**

1. Verificar que la funcionalidad esté permitida por la ley
2. Consultar artículos específicos
3. Seguir procedimientos establecidos
4. Implementar según IMPLEMENTACION-TECNICA-BRECHAS.md

---

## ⚖️ PRINCIPIOS LEGALES FUNDAMENTALES

### **Interés Superior del NNA**
Todas las decisiones deben priorizar el bienestar del niño, niña o adolescente.

### **Interdisciplinariedad**
El trabajo debe ser coordinado entre Trabajador Social, Psicólogo y Abogado.

### **Confidencialidad**
Absoluta reserva de datos del NNA en todos los registros.

### **Debido Proceso**
Respetar procedimientos legales establecidos, especialmente plazos y notificaciones.

### **No Re-victimización**
Evitar exponer al NNA a procesos repetitivos innecesarios.

---

## 📞 CONTACTOS Y REFERENCIAS

### **Consultas Legales**
- Asesoría Legal Municipal
- Defensoría de la Niñez y Adolescencia - Sucre
- Servicios Legales Integrados (SLIM)

### **Documentos Relacionados**
- [`docs/guias-usuario/`](../guias-usuario/) - Guías operativas por rol
- [`docs/arquitectura/`](../arquitectura/) - Decisiones de diseño
- [`packages/db/prisma/schema.prisma`](../../packages/db/prisma/schema.prisma) - Modelo de datos

---

## 🚀 PRÓXIMOS PASOS

### **Para Implementación Inmediata**

1. **Revisar brechas críticas** (1-2 días)
   - Leer BRECHAS-LEGALES-Y-SOLUCIONES.md completo
   - Priorizar Brecha #1 y #2

2. **Planificar desarrollo** (1 semana)
   - Asignar recursos
   - Estimar tiempos realistas
   - Coordinar con equipo legal

3. **Implementar correcciones** (6 semanas)
   - Seguir IMPLEMENTACION-TECNICA-BRECHAS.md
   - Testing continuo
   - Validación legal en cada fase

4. **Capacitar al equipo** (1 semana)
   - Nuevos flujos
   - Nuevas herramientas
   - Aspectos legales

### **Para Mejora Continua**

- Revisar normativa cada 6 meses
- Actualizar documentación cuando cambien leyes
- Mantener alineación con jurisprudencia vigente

---

**Última actualización**: 2 de Agosto, 2026  
**Responsable**: Equipo Legal + Equipo Técnico DNA Sucre