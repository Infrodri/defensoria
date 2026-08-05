# 🔐 GUÍA DEL ADMINISTRADOR - Herramientas Phase 2

## 🎯 TU RESPONSABILIDAD

Como **ADMINISTRADOR**, eres responsable de:
1. ✅ Verificar que todas las herramientas funcionen
2. ✅ Subir datos de ejemplo para testing
3. ✅ Aprobar herramientas como operativas
4. ✅ Capacitar a profesionales en el uso
5. ✅ Solucionar problemas técnicos

## 📊 PANEL DE VERIFICACIÓN

### Acceso al Panel
```
URL: /admin/tools-verification
O: Sidebar → Sistema → "Verificar Herramientas"
```

### Lo que verás:
- **6 servicios monitoreados**:
  - 🤖 Ollama (Inteligencia Artificial)
  - 🎤 Whisper (Transcripción de audio)
  - 📚 RAG (Base de conocimiento legal)
  - 🗄️ PostgreSQL (Base de datos)
  - 📝 Transcripciones (Audios procesados)
  - 📄 Knowledge Base (Documentos legales)

### Estados posibles:
- 🟢 **OK**: Servicio funcionando perfectamente
- 🟡 **DEGRADED**: Funciona pero con limitaciones
- 🔴 **ERROR**: No disponible, requiere atención

## 🧰 INVENTARIO DE HERRAMIENTAS (12 VISIBLES)

El hub está en **`/herramientas`** y muestra **12 herramientas visibles** para los roles profesionales (hay un 13.º `toolId`, Transcripción de Audio/Video, que no aparece en el hub):

- **Legales (3)**: Análisis de Discrepancias · Tipicidad Penal · Vencimientos Procesales
- **Psicológicas (4)**: Indicadores de Trauma · Escalas de Riesgo · Traducción Clínica · Análisis de Trauma
- **Sociales (3)**: Estructura Familiar · Evaluación Vulnerabilidad · Mapeo Ambiental
- **Transversales (2)**: Línea de Tiempo Unificada · Reporte Anonimizado

## 🤖 PANELES DE INTELIGENCIA ARTIFICIAL

- **Configuración IA** (`/panel/admin/ia`): configuración de los modelos de IA local (Ollama/Whisper), el modelo de lenguaje del Copiloto Jurídico y el modelo de visión para análisis de evidencias (default `gemma4-tasks:latest`). Exclusivo de ADMINISTRADOR.
- **Procesos IA** (`/panel/admin/ia-procesos`): monitoreo de las tareas de IA (en proceso, en cola, completadas) y reencolado de tareas fallidas.

## 🧪 RUTINA DE VERIFICACIÓN DIARIA

### Paso 1: Check Matutino (5 min)
```
1. Abrir: /admin/tools-verification
2. Verificar que todo esté 🟢 (verde)
3. Si hay 🟡 o 🔴, investigar causa
4. Ejecutar "Tests en Vivo" para confirmar
```

### Paso 2: Aprobar Herramientas (2 min)
```
Si todo está OK:
1. Click "Aprobar Herramientas" (botón verde)
2. Sistema registra aprobación con timestamp
3. Profesionales saben que pueden usar confiadamente
```

### Paso 3: Monitorear Estadísticas
```
Revisar números:
- Transcripciones completadas vs fallidas
- Análisis realizados por tipo
- Documentos legales indexados
```

## 📁 SUBIR DATOS DE EJEMPLO MANUALMENTE

### Caso 1: Subir Audio de Prueba

**Objetivo**: Crear transcripciones de ejemplo para que profesionales puedan probar

```
1. Ir a: /herramientas
2. Seleccionar un caso de prueba
3. Click "📁 Subir Entrevista"
4. Subir audio real o generado:
   - Duración: 2-5 minutos
   - Formato: .mp3 o .wav
   - Contenido: Simulación de entrevista con NNA
   - Ejemplo: "Mi nombre es Ana, tengo 12 años. El incidente ocurrió el lunes pasado cuando..."
5. Esperar transcripción completa ✅
6. Verificar que los análisis de las herramientas del caso quedan disponibles
```

**Audios de ejemplo recomendados**:
```
📎 Audio Legal: Testimonio con fechas y eventos específicos
📎 Audio Psicológico: Relato con emociones e indicadores de trauma  
📎 Audio Social: Descripción de familia, hogar, relaciones
📎 Audio Mixto: Combinación de todos los elementos
```

### Caso 2: Crear Transcripciones Manuales

**Si Whisper no está disponible**, puedes crear transcripciones directamente:

```SQL
-- Conectar a PostgreSQL
INSERT INTO transcriptions (
  id, "caseId", "evidenceId", text, status, language, confidence, "createdBy"
) VALUES (
  gen_random_uuid(),
  '[CASE-ID-AQUI]',
  'manual-example-001',
  'Ejemplo de transcripción manual: El NNA refiere que el incidente ocurrió el día lunes aproximadamente a las 15:00 horas. Menciona sentirse triste y confundido. Su familia está compuesta por mamá, papá y hermana menor.',
  'COMPLETADA',
  'es',
  0.95,
  '[TU-USER-ID]'
);
```

### Caso 3: Configurar Base de Conocimiento

**Subir documentos legales para mejorar análisis**:

```
1. Ir a: /panel/admin/conocimiento  
2. Subir PDFs relevantes:
   - Código Niña, Niño y Adolescente
   - Ley 348 (Violencia)
   - Procedimientos institucionales
   - Jurisprudencia relevante
3. Verificar indexación exitosa
4. Probar búsqueda semántica
```

## 🎓 CAPACITAR A PROFESIONALES

### Workshop Básico (45 min)

**Agenda sugerida**:
```
📋 Introducción (10 min)
- ¿Qué son las herramientas Phase 2?
- ¿Cómo ayudan en el trabajo diario?

📋 Demo en Vivo (20 min)  
- Mostrar upload de audio
- Generar análisis real
- Interpretar resultados

📋 Práctica Hands-On (15 min)
- Cada profesional prueba con caso ejemplo
- Resolver dudas en tiempo real
```

**Mensaje clave para profesionales**:
> "Las herramientas NO reemplazan tu criterio profesional. Son un apoyo para identificar elementos que podrías haber pasado por alto y estructurar mejor tus análisis."

### Casos de Entrenamiento

**Crea 3 casos tipo**:
```
📂 CASO A - Legal: Abuso sexual con inconsistencias temporales
📂 CASO B - Psicológico: Violencia familiar con indicadores de trauma
📂 CASO C - Social: Negligencia parental con factores de riesgo múltiples
```

## 🚨 SOLUCIÓN DE PROBLEMAS COMUNES

### Problema 1: Servicios en Rojo 🔴
```
Síntoma: Ollama, Whisper o RAG muestran ERROR
Solución:
1. Verificar que los servicios estén corriendo
2. Reiniciar servicios si es necesario
3. Contactar soporte técnico si persiste
```

### Problema 2: Transcripciones Fallan
```
Síntoma: Audio sube pero no se transcribe
Causa común: Whisper API caído o sobrecargado
Solución:
1. Verificar Whisper API: http://localhost:8000/docs
2. Reiniciar servicio Whisper
3. Usar transcripción manual como backup
```

### Problema 3: Análisis Vacíos
```
Síntoma: Herramientas no muestran resultados
Causa común: Base de conocimiento vacía o Ollama sin modelos
Solución:
1. Verificar documentos en /panel/admin/conocimiento
2. Verificar modelos Ollama disponibles
3. Re-indexar base de conocimiento si es necesario
```

### Problema 4: Usuarios No Pueden Acceder
```
Síntoma: "Access Denied" para profesionales
Causa: Roles mal configurados
Solución:
1. Verificar roles en /permisos
2. Asegurar que ABOGADO/PSICOLOGO/SOCIAL tengan acceso a herramientas
3. Re-loguear usuarios si es necesario
```

## 📊 REPORTES PARA DIRECCIÓN

### Reporte Semanal Sugerido
```
📈 Uso de Herramientas (Semana del XX-XX al XX-XX)

Transcripciones Procesadas: XX
- Exitosas: XX (XX%)
- Fallidas: XX (XX%)

Análisis por Disciplina:
- Legal: XX análisis
- Psicológico: XX análisis  
- Social: XX análisis
- Transversal: XX análisis

Usuarios Activos:
- ABOGADOS: XX
- PSICÓLOGOS: XX
- TRABAJADORES SOCIALES: XX

Incidencias:
- Críticas: XX (detalle...)
- Menores: XX

Estado de Servicios: 🟢 Operativo / 🟡 Con observaciones / 🔴 Requiere atención
```

## 🔄 MANTENIMIENTO PREVENTIVO

### Semanal:
- [ ] Verificar espacio en disco (transcripciones ocupan espacio)
- [ ] Revisar logs de errores
- [ ] Backup de base de datos

### Mensual:
- [ ] Actualizar modelos de IA si hay versiones nuevas
- [ ] Revisar y limpiar transcripciones muy antiguas
- [ ] Evaluar performance y optimizar si es necesario

### Trimestral:
- [ ] Capacitación de refuerzo a usuarios
- [ ] Evaluación de nuevas funcionalidades
- [ ] Reporte ejecutivo de adopción y resultados

## ✅ CHECKLIST DEL ADMINISTRADOR

### Activación Inicial:
- [ ] Todos los servicios verificados como 🟢 OK
- [ ] Al menos 3 casos de ejemplo creados con transcripciones
- [ ] Base de conocimiento con documentos legales clave
- [ ] Profesionales capacitados en uso básico
- [ ] Procedimiento de backup configurado

### Operación Diaria:
- [ ] Check matutino de servicios (5 min)
- [ ] Aprobación de herramientas si todo OK
- [ ] Revisión de incidencias reportadas por usuarios
- [ ] Soporte a usuarios que tengan dudas

### Excelencia Operativa:
- [ ] Reportes de uso regulares para dirección
- [ ] Mejora continua basada en feedback de usuarios
- [ ] Actualización de documentación según cambios
- [ ] Colaboración con equipo técnico para mejoras

---

**Recuerda**: Eres el guardián de la calidad. Los profesionales confían en que las herramientas funcionen correctamente para tomar decisiones importantes sobre casos de NNA. Tu rol es crucial para el éxito del sistema.