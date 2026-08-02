# 👩‍💼 GUÍA PARA SECRETARIA - Ingreso de Casos

## 🎯 TU FUNCIÓN PRINCIPAL
Eres el **primer contacto** en el sistema. Tu trabajo es registrar correctamente los casos nuevos para que los profesionales puedan trabajar con información completa y organizada.

---

## ⚡ ACCESO RÁPIDO
- **URL Principal**: `http://localhost:3100/ingreso`
- **Tu menú**: Solo verás "Inicio de caso" y funciones básicas
- **Tiempo promedio por caso**: 15-30 minutos

---

## 📋 PASO A PASO - INGRESO DE CASO NUEVO

### **ANTES DE EMPEZAR - INFORMACIÓN MÍNIMA**
Asegúrate de tener:
```
✅ Nombre completo del NNA (Niño, Niña, Adolescente)
✅ Edad o fecha de nacimiento
✅ Dirección actual donde vive
✅ Descripción clara de lo que pasó
✅ Datos de quien hace la denuncia
✅ ¿Es urgente? (riesgo inmediato SÍ/NO)
```

---

### **PASO 1: BUSCAR SI LA PERSONA YA EXISTE**

1. **Entra a**: `http://localhost:3100/ingreso`
2. **Click en**: "Buscar Persona Existente"
3. **Busca por**:
   - Nombre completo
   - Número de documento (si tiene)
   - Fecha de nacimiento aproximada

#### **SI LA PERSONA YA EXISTE:**
- ✅ Selecciónala de la lista
- ✅ Verifica que los datos estén actualizados
- ✅ Actualiza dirección si cambió
- ⏭️ **Pasa directo al PASO 3**

#### **SI LA PERSONA NO EXISTE:**
- ➡️ **Continúa al PASO 2**

---

### **PASO 2: CREAR NUEVA PERSONA (NNA)**

1. **Click**: "Crear Nueva Persona"
2. **Llenar campos obligatorios**:

```
📝 DATOS BÁSICOS:
   Nombres: [Primer y segundo nombre]
   Apellidos: [Apellido paterno y materno]
   Fecha Nacimiento: [DD/MM/YYYY]
   Sexo: [Masculino/Femenino]
   
📍 UBICACIÓN:
   Dirección actual: [Dirección completa donde vive ahora]
   Barrio/Zona: [Nombre del barrio]
   Ciudad: [Ciudad]
   
📞 CONTACTO:
   Teléfono principal: [Número de contacto]
   Teléfono alternativo: [Si hay otro número]
   
📄 DOCUMENTOS (si tiene):
   Tipo documento: [CI/Certificado Nacimiento/Pasaporte]
   Número: [Número del documento]
```

3. **Click**: "Guardar Persona"

---

### **PASO 3: CREAR EL CASO**

1. **Click**: "Crear Nuevo Caso para [Nombre del NNA]"
2. **Llenar información del caso**:

```
🏷️ CLASIFICACIÓN:
   Tipo de caso: 
   ◉ VIOLENCIA FÍSICA
   ◉ VIOLENCIA SEXUAL  
   ◉ VIOLENCIA PSICOLÓGICA
   ◉ NEGLIGENCIA/ABANDONO
   ◉ TRABAJO INFANTIL
   ◉ CONFLICTO FAMILIAR
   ◉ OTRO (especificar)
   
🔥 URGENCIA:
   ◉ URGENTE (riesgo inmediato - menos de 24h)
   ◉ ALTA (requiere atención en 48h)
   ◉ MEDIA (requiere atención en 1 semana)
   ◉ BAJA (seguimiento regular)
   
📍 UBICACIÓN:
   Oficina responsable: [Tu oficina]
   Jurisdicción: [Automático según dirección]
```

3. **Descripción de los hechos**:
```
📝 RELATO INICIAL (mínimo 3 líneas):
   - ¿Qué pasó? (describir los hechos)
   - ¿Cuándo pasó? (fecha/período)
   - ¿Dónde pasó? (lugar específico)
   - ¿Quién estuvo involucrado? (agresor, testigos)
   - ¿Hay heridas o daños visibles?
   
⚠️ SITUACIÓN ACTUAL:
   - ¿Dónde está el NNA ahora?
   - ¿Está seguro/a?
   - ¿Necesita atención médica inmediata?
```

---

### **PASO 4: DATOS DEL DENUNCIANTE**

```
👤 PERSONA QUE DENUNCIA:
   Nombre completo: [Nombres y apellidos]
   Relación con NNA: [Madre/Padre/Familiar/Vecino/Institución/Otro]
   Teléfono: [Número principal]
   Email: [Si tiene]
   Dirección: [Solo si es diferente al NNA]
   
📄 DOCUMENTO:
   Tipo: [CI/Pasaporte]
   Número: [Número de documento]
   
💼 SI ES INSTITUCIÓN:
   Nombre institución: [Colegio/Hospital/ONG/etc]
   Persona responsable: [Nombre del funcionario]
   Cargo: [Director/Trabajadora Social/Médico/etc]
```

---

### **PASO 5: DOCUMENTOS ADJUNTOS**

**Si hay documentos físicos o digitales**:

1. **Click**: "Adjuntar Documentos"
2. **Tipos de documentos comunes**:
   ```
   📄 DOCUMENTOS BÁSICOS:
   ◉ Denuncia escrita (si la hay)
   ◉ Fotocopia CI del NNA
   ◉ Certificado de nacimiento
   
   🏥 DOCUMENTOS MÉDICOS:
   ◉ Parte médico
   ◉ Certificado médico legal
   ◉ Fotografías de lesiones
   
   🏫 DOCUMENTOS EDUCATIVOS:
   ◉ Informe del colegio
   ◉ Comunicaciones de la escuela
   
   👮 DOCUMENTOS LEGALES:
   ◉ Denuncia policial (si existe)
   ◉ Medidas de protección existentes
   ```

3. **Para cada documento**:
   - Escanear o fotografiar
   - Nombrar claramente: "CI_NombreNNA_fecha"
   - Subir al sistema

---

### **PASO 6: REVISIÓN Y GUARDADO**

#### **CHECKLIST ANTES DE GUARDAR:**
```
✅ Datos del NNA completos y correctos
✅ Tipo de caso seleccionado apropiadamente  
✅ Urgencia evaluada correctamente
✅ Descripción de hechos clara y detallada
✅ Datos del denunciante completos
✅ Documentos adjuntados (si los hay)
✅ Teléfonos de contacto verificados
```

#### **GUARDADO FINAL:**
1. **Click**: "Revisar Información"
2. **Verificar**: Todos los datos en la pantalla de resumen
3. **Click**: "Confirmar y Crear Caso"
4. **Sistema genera**: Número de expediente automático
5. **Anota**: El número de expediente para dárselo al denunciante

---

## 📋 **DESPUÉS DEL INGRESO**

### **QUÉ PASA AUTOMÁTICAMENTE:**
```
✅ Sistema asigna número de expediente único
✅ Estado del caso: "PENDIENTE_ASIGNACIÓN"
✅ Notificación automática a Jefatura
✅ Caso aparece en lista de casos nuevos
```

### **QUÉ DEBES ENTREGAR AL DENUNCIANTE:**
```
📋 COMPROBANTE DE INGRESO:
   - Número de expediente
   - Fecha de ingreso  
   - Oficina responsable
   - Teléfono de seguimiento
   - Nombre de la secretaria (tuyo)
   
📞 INFORMACIÓN DE SEGUIMIENTO:
   "Su caso ha sido registrado con el número [EXPEDIENTE].
   En las próximas 48-72 horas será asignado a profesionales
   especializados. Puede llamar al [TELÉFONO] para consultas."
```

---

## ⚠️ **SITUACIONES ESPECIALES**

### **CASO URGENTE (Riesgo Inmediato)**
```
🚨 PROTOCOLO URGENCIA:
1. Marcar como "URGENTE" en el sistema
2. Llamar INMEDIATAMENTE a Jefatura: [teléfono]
3. No esperar - reportar por teléfono mientras cargas
4. Si es fuera de horario: contactar guardia de emergencia
```

### **NNA que viene solo (sin adulto)**
```
👶 PROTOCOLO MENOR SOLO:
1. ✅ Registrar igual en el sistema
2. ✅ En "denunciante" poner: "MENOR AUTODENUNCIA"  
3. ✅ Notificar inmediatamente a trabajador social
4. ✅ No dejar solo al NNA hasta que llegue profesional
```

### **Denunciante anónimo**
```
🕵️ PROTOCOLO ANÓNIMO:
1. ✅ Registrar el caso igual
2. ✅ En denunciante: "DENUNCIA ANÓNIMA"
3. ✅ Anotar toda la información que sí dieron
4. ✅ No insistir en datos personales si se niegan
```

### **Casos que involucran funcionarios públicos**
```
🏛️ PROTOCOLO FUNCIONARIO PÚBLICO:
1. ✅ Registrar normal en sistema
2. ✅ Agregar nota: "INVOLUCRA FUNCIONARIO PÚBLICO"
3. ✅ Notificar INMEDIATAMENTE a Jefatura
4. ✅ NO comentar con otros sobre el caso
```

---

## 🔧 **PROBLEMAS COMUNES Y SOLUCIONES**

### **"El sistema está lento"**
```
🐌 SOLUCIÓN:
- Cerrar pestañas innecesarias del navegador
- Guardar frecuentemente mientras cargas
- Si se cuelga: F5 para refrescar (los datos se mantienen)
```

### **"No puedo subir un documento"**
```
📎 SOLUCIÓN:
- Verificar que el archivo sea menor a 10MB
- Formatos aceptados: PDF, JPG, PNG, DOC
- Si es muy grande: comprimirlo o dividirlo
```

### **"No encuentro la persona en el sistema"**
```
🔍 SOLUCIÓN:
- Probar con solo el primer nombre
- Probar con solo el apellido paterno
- Buscar por fecha de nacimiento aproximada
- Si no aparece: crear como nueva persona
```

### **"La dirección no se encuentra"**
```
📍 SOLUCIÓN:
- Escribir a mano la dirección más cercana
- Agregar en observaciones la referencia exacta
- Contactar a Jefatura para actualizar el catálogo
```

---

## 📞 **CONTACTOS DE EMERGENCIA**

```
🆘 JEFATURA: [número directo]
   - Casos urgentes
   - Dudas sobre clasificación
   - Problemas técnicos graves

💻 SOPORTE TÉCNICO: [número IT]
   - Sistema no funciona
   - Problemas de acceso
   - Errores técnicos

👮 EMERGENCIAS: 911
   - Riesgo de vida inmediato
   - Violencia en curso
   - Amenazas directas
```

---

## ✅ **CHECKLIST DIARIO**

### **AL COMENZAR LA JORNADA:**
```
✅ Verificar que el sistema funcione
✅ Revisar casos pendientes de completar
✅ Verificar que tenga formularios físicos
✅ Preparar escáner y materiales
```

### **DURANTE LA JORNADA:**
```
✅ Guardar cada caso antes de empezar el siguiente
✅ Hacer backup de documentos importantes
✅ Revisar casos que quedaron "en borrador"
✅ Mantener confidencialidad en todo momento
```

### **AL FINALIZAR LA JORNADA:**
```
✅ Completar todos los casos iniciados
✅ Verificar que no hay casos sin guardar
✅ Reportar casos urgentes pendientes
✅ Cerrar sesión correctamente
```

---

## 🎯 **RECORDATORIO FINAL**

**TU TRABAJO ES FUNDAMENTAL** 💪

```
✅ Eres el primer filtro del sistema
✅ De tu precisión depende todo el proceso posterior  
✅ Los profesionales confían en tu información
✅ Cada dato que registras puede ser crucial para el NNA
✅ Tu rapidez en casos urgentes puede salvar vidas
```

**PRINCIPIOS CLAVE:**
- ✅ **Confidencialidad TOTAL** - No comentar casos con nadie no autorizado
- ✅ **Precisión** - Datos correctos desde el inicio
- ✅ **Rapidez en urgencias** - Priorizar casos de riesgo
- ✅ **Empatía** - Tratar con calidez a denunciantes
- ✅ **Profesionalismo** - Mantener la calma siempre

---

## 📖 **BITÁCORA DE ACTUACIONES - REGISTRO DE ACCIONES**

### **¿QUÉ ES LA BITÁCORA?**

La **bitácora** es un registro cronológico (de fecha y hora) de todas las acciones profesionales que ocurren en un caso. Es diferente del **ActionLog** automático del sistema.

```
📝 DEFINICIÓN:
  Bitácora = Registro MANUAL de lo que hacen profesionales
  ActionLog = Registro AUTOMÁTICO de cambios del sistema
```

### **QUIÉN REGISTRA LA BITÁCORA**

| Rol | Registra | Puede Ver |
|-----|----------|-----------|
| SECRETARIA | NO (solo lee) | SÍ - todas |
| ABOGADO | SÍ | SÍ - todas |
| PSICÓLOGO | SÍ | SÍ - todas |
| TRABAJADOR SOCIAL | SÍ | SÍ - todas |
| JEFATURA | SÍ | SÍ - todas |

### **TIPOS DE ACTUACIONES QUE SE REGISTRAN**

```
1️⃣ ENTREVISTA/DECLARACIÓN
   Ejemplo: "Entrevista inicial con madre"
   Incluir: participantes, temas, observaciones

2️⃣ VISITA DOMICILIARIA
   Ejemplo: "Visita al domicilio - Barrio San Roque"
   Incluir: dirección, condiciones, personas encontradas

3️⃣ AUDIENCIA
   Ejemplo: "Audiencia judicial - Tribunal 3"
   Incluir: fecha, tribunal, participantes, resolución

4️⃣ DERIVACIÓN
   Ejemplo: "Derivación a Defensoría Especializada"
   Incluir: institución, motivo, contacto

5️⃣ SEGUIMIENTO
   Ejemplo: "Seguimiento telefónico - Madre llamó"
   Incluir: resultado, próximo seguimiento

6️⃣ NOTIFICACIÓN
   Ejemplo: "Notificación enviada a denunciante"
   Incluir: medio (postal/correo), fecha de entrega

7️⃣ OTRO
   Cualquier actuación profesional importante
```

### **CÓMO REGISTRAR UNA ACTUACIÓN**

#### **PASO 1: Acceder a la bitácora**
```
1. Abre el expediente (ver detalles del caso)
2. Tab "Bitácora" o "Actuaciones"
3. Click "+ Agregar Actuación"
```

#### **PASO 2: Completar formulario**
```
📋 CAMPOS A LLENAR:
   
   Tipo de Actuación: [Dropdown]
   ▼ Entrevista/Declaración
   ▼ Visita Domiciliaria
   ▼ Audiencia
   ▼ Derivación
   ▼ Seguimiento
   ▼ Notificación
   ▼ Otro
   
   Título/Asunto: [Línea corta]
   "Entrevista inicial con la madre"
   
   Fecha de Actuación: [DD/MM/YYYY]
   (puede ser hoy o anterior)
   
   Descripción Detallada: [Párrafo largo]
   "Se realizó entrevista con Sra. María Rojas el día...
   Se discutieron los siguientes temas..."
   
   Observaciones Importantes: [Notas adicionales]
   "Madre mostró preocupación por seguridad del NNA..."
   
   Profesionales Participantes:
   ▢ Yo
   ▢ [Otros nombres]
   
   Documento Adjunto: [Opcional - subir PDF/JPG]
```

#### **PASO 3: Guardar**
```
Click: "Guardar Actuación"
✅ Sistema registra automáticamente:
   - Hora exacta del registro
   - Profesional que lo registró
   - Número de actuación
```

### **DIFERENCIA: Bitácora vs ActionLog**

```
📊 TABLA COMPARATIVA:

┌─────────────────┬──────────────┬─────────────────┐
│ CARACTERÍSTICA  │   BITÁCORA   │    ACTION LOG   │
├─────────────────┼──────────────┼─────────────────┤
│ Registra...     │ Acciones del │ Cambios del     │
│                 │ profesional  │ sistema         │
│ Ejemplo         │ Entrevista   │ Cambio de fase  │
│ Quién registra  │ Manual       │ Automático      │
│ Quién la ve     │ Todos       │ Todos          │
│ Se puede editar │ NO (válida) │ NO (auditoría) │
│ Privacidad      │ Siempre     │ Siempre         │
└─────────────────┴──────────────┴─────────────────┘
```

### **EJEMPLO PRÁCTICO COMPLETO**

#### **Caso Real:**
```
🏠 VISITA DOMICILIARIA - 15 de julio 2026

Tipo: Visita Domiciliaria
Fecha: 15/07/2026
Profesional: Trabajador Social - Juan García
Participantes: Nna "Carlos" (14 años), madre

DESCRIPCIÓN DETALLADA:
"Se realizó visita domiciliaria al domicilio ubicado
en Calle Bolivia #245, barrio San Roque. Se encontró
al NNA (Carlos) en casa, junto a su madre Sra. Rocío
López. El estado general del domicilio es ordenado y
limpio. Se evidencia cama individual con colchón en
buen estado. Refrigerador funcional con alimentos.

Se conversó con el NNA quien manifestó estar
estudiando en el colegio sin problemas. Madre
reporta que ha habido mejora en el comportamiento
del adolescente. La relación entre ambos se ve
positiva.

RIESGOS OBSERVADOS: Ninguno en el momento
RECOMENDACIONES: Continuar seguimiento mensual

PRÓXIMA CITA: 15 de agosto 2026 a las 10:00"
```

### **REGLAS IMPORTANTES**

```
⚠️ AL REGISTRAR BITÁCORA:

1. ✅ SER ESPECÍFICO - no escribir "se hizo el trabajo"
2. ✅ RESPETAR CONFIDENCIALIDAD - no contar detalles íntimos
3. ✅ ANOTAR HECHOS OBSERVABLES - no interpretaciones
4. ✅ FECHAR CORRECTAMENTE - puede ser fecha pasada
5. ✅ COMPLETAR AL DÍA - idealmente el mismo día
6. ✅ ESCRIBIR CON CLARIDAD - otros deben entender
7. ✅ NO EDITABLES - una vez guardada, es definitiva
8. ✅ PROFESIONALISMO - lenguaje formal y neutro
```

### **ERRORES COMUNES**

```
❌ INCORRECTO:
"Visitamos a la familia. Todo bien. Sin problemas."
(muy vago, no hay detalles)

✅ CORRECTO:
"Visita domiciliaria al domicilio de Calle X #123.
Encontrado NNA en casa, en condiciones de higiene
aceptables. Madre reporta cumplimiento de escuela.
Sin riesgos observados. Próximo seguimiento: ..."

---

❌ INCORRECTO:
"La madre se ve sospechosa. Probablemente maltrate
al hijo aunque no lo diga."
(opinión, no hecho observable)

✅ CORRECTO:
"Se observó al NNA con cicatrices en brazo izquierdo.
Madre lo calienta diariamente. Se refiere inquietud
a profesional de psicología para evaluación."
(observación factual)

---

❌ INCORRECTO:
"Se mandó carta a institución XYZ el 15 de julio"
(pero registras el 20 de julio)

✅ CORRECTO:
"Se mandó carta a institución XYZ el 15 de julio.
Registrado: 20 de julio (retrasado por ausencia)"
(aclaración de fecha de hecho vs. fecha de registro)
```

---

**LA BITÁCORA ES EL CORAZÓN DEL EXPEDIENTE** ❤️

Juntos todos los registros cuentan la historia completa del caso.
¡Mantenla actualizada y precisa!

---

**¿DUDAS? Contacta a Jefatura. ¡Tu trabajo es valioso!** 🌟
