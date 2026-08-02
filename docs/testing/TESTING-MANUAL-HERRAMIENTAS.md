# 🧪 TESTING MANUAL - Herramientas Phase 2 + Admin Panel

## ✅ STATUS: LISTO PARA TESTING

---

## 📋 CHECKLIST PREVIO

Antes de testear, verifica:
- [ ] API corriendo: `npm run start:dev` (puerto 4100)
- [ ] Web corriendo: `npm run dev` (puerto 3000)
- [ ] Ollama corriendo: `http://localhost:11434`
- [ ] Whisper API corriendo: `http://localhost:8000`
- [ ] PostgreSQL disponible

---

## 🧑 TEST 1: Usuario Normal Usando Herramientas

### Paso 1: Loguear como Abogado/Psicólogo/Social
```
URL: http://localhost:3000/login
Usuario: abogado@defensoria.bo (o cualquier usuario no-admin)
Verificar: Que logues exitosamente
```

### Paso 2: Navegar a Herramientas
```
Opción A: URL directo: http://localhost:3000/tools-demo
Opción B: Sidebar → "Herramientas Legales" (para abogados)
Resultado esperado: Panel carga con selector de casos
```

### Paso 3: Seleccionar un Caso
```
Acción: Click en dropdown "Caso a Analizar"
Verificar: Se listan casos disponibles
Resultado: Selecciona cualquier caso (ej: CASO-001)
```

### Paso 4: Subir Audio
```
Acción: Busca el botón "📁 Subir Entrevista" (debe estar VERDE)
Verificar: 
  ✅ El botón existe
  ✅ El botón no está deshabilitado
Resultado esperado: Se abre selector de archivo
```

### Paso 5: Seleccionar Archivo Audio
```
Acción: 
  - Click en selector
  - Selecciona cualquier archivo .mp3 o .wav
  (Si no tienes, crea uno dummy de 1 segundo)
Verificar:
  ✅ El archivo se selecciona
Resultado: Comienza la subida y transcripción
```

### Paso 6: Verificar Transcripción
```
Espera a que se complete
Verificar status:
  ⏳ "Transcribiendo audio..."
  ✅ "✅ Transcripción completada exitosamente"
  
Si falla (rojo):
  ❌ "Error en la transcripción: ..."
  → Verifica que Whisper esté corriendo
```

### Paso 7: Click "Cargar Datos"
```
Acción: Click en botón "🔄 Cargar Datos"
Verificar:
  ✅ Spinner mostrando "Analizando caso..."
Resultado esperado: Se cargan análisis en tiempo real
```

### Paso 8: Ver Resultados
```
Haz click en cada tab:
  ⚖️ Legal
  🧠 Psicológico
  👥 Social
  🔗 Transversal
  
Verificar:
  ✅ Cada tab muestra análisis
  ✅ No hay errores en consola
  ✅ Los datos se ven reales (no mocks vacíos)
```

### Resultado Final
```
✅ PASO SI: Usuario puede subir audio y ver análisis real
❌ PASO FALLA SI: 
  - El botón no aparece
  - Error en transcripción
  - Análisis no carga
```

---

## 🔐 TEST 2: Admin Verificando Herramientas

### Paso 1: Loguear como ADMINISTRADOR
```
URL: http://localhost:3000/login
Usuario: admin@defensoria.bo
Verificar: Logues como ADMINISTRADOR
```

### Paso 2: Navegar a Panel de Verificación
```
Opción A: URL directo: http://localhost:3000/admin/tools-verification
Opción B: Sidebar → Sistema → "Verificar Herramientas"

Verificar:
  ✅ El menú "Verificar Herramientas" existe en Sistema
  ✅ Link está activo (no 404)
```

### Paso 3: Panel Carga y Muestra Health Checks
```
Verificar que aparecen 6 cards:
  ✅ Ollama
  ✅ Whisper API
  ✅ RAG Service
  ✅ PostgreSQL Database
  ✅ Transcriptions
  ✅ Knowledge Base
  
Color esperado:
  🟢 Verde (OK) si el servicio está disponible
  🟡 Amarillo (DEGRADED) si funciona limitado
  🔴 Rojo (ERROR) si no está disponible
```

### Paso 4: Verificar Status General
```
Arriba debe decir:
  Estado General: 🟢 HEALTHY (si todos están OK)
  O: 🟡 DEGRADED (si alguno falla)
  O: 🔴 DOWN (si hay errores críticos)
  
Verificar timestamp está actualizado
```

### Paso 5: Click "Ejecutar Tests"
```
Acción: Click en botón azul "🧪 Ejecutar Tests en Vivo"
Espera a que complete...

Verificar:
  ✅ Muestra "Ejecutando tests..."
  ✅ Después muestra resultados
  ✅ Resumen: "5/5 tests pasados (100%)" o similar
```

### Paso 6: Ver Resultados de Tests
```
Verificar que muestra:
  ✅ health_status: PASSED
  ✅ ollama_status: PASSED
  ✅ rag_status: PASSED
  ✅ whisper_status: PASSED
  ✅ transcriptions_status: PASSED
  
Si alguno falla:
  ❌ Ver el mensaje de error y diagnosticar
```

### Paso 7: Aprobar Herramientas
```
Si todo está OK (estado HEALTHY):
  Acción: Click en botón VERDE "✅ Aprobar Herramientas"
  
Si hay errores:
  El botón estará deshabilitado (gris)
  Necesitas arreglar los servicios primero

Verificar:
  ✅ Muestra "✅ Herramientas aprobadas exitosamente"
  ✅ Timestamp de aprobación
```

### Resultado Final
```
✅ PASO SI: 
  - Panel carga
  - Muestra health checks
  - Tests ejecutan
  - Botón de aprobación funciona

❌ PASO FALLA SI:
  - Panel no carga (404)
  - Error en health checks
  - Tests no ejecutan
  - No aparece botón de aprobación
```

---

## 🔒 TEST 3: Verificar Acceso por Rol

### Test 3a: Usuario NO-ADMIN intenta acceder
```
Loguear como: ABOGADO (no-admin)
URL: http://localhost:3000/admin/tools-verification
Resultado esperado:
  🔒 Mensaje: "Acceso Denegado"
  🔒 Tu rol: ABOGADO
  (No puede acceder)
```

### Test 3b: Menu item solo para ADMIN
```
Loguear como ABOGADO
Sidebar → Sistema
Verificar:
  ✅ "Verificar Herramientas" NO aparece
  ❌ Si aparece: ERROR - Acceso mal configurado
```

### Resultado Final
```
✅ PASO SI: Solo ADMINISTRADOR puede ver y acceder
❌ PASO FALLA SI: Otros roles ven el panel
```

---

## 📊 TEST 4: Estadísticas

### Paso 1: Admin ve estadísticas
```
En panel de verificación, debe mostrar:
  📊 Estadísticas:
    • Transcripciones Completadas: X/Y (Z%)
    • Análisis Realizados: N
    • Documentos en KB: M
```

### Paso 2: Verificar números sensatos
```
Transcripciones Completadas:
  ✅ El numerador ≤ denominador
  ✅ Porcentaje está entre 0-100%
  
Análisis Realizados:
  ✅ Es un número positivo (>= 0)
  
Documentos en KB:
  ✅ Es un número positivo
```

### Resultado Final
```
✅ PASO SI: Las estadísticas son coherentes
❌ PASO FALLA SI: Números negativos, NaN, o sin sentido
```

---

## 🐛 TEST 5: Diagnóstico de Problemas

### Si el botón "Subir Entrevista" NO aparece:
```
1. Verifica que NO eres ADMINISTRADOR
   (admin solo usa /tools-demo sin upload)
   
2. Abre Console (F12)
   → Busca errores rojo
   → Copia y reporta
   
3. Verifica que la URL es: /tools-demo
   (no /dashboard/tools-demo ni otra)
   
4. Recarga la página: Ctrl+Shift+R
```

### Si "Verificar Herramientas" NO aparece en sidebar:
```
1. Verifica que ERES ADMINISTRADOR
   (debe mostrar tu rol en sidebar)
   
2. En Sidebar → Sistema
   (¿ves "Configuración IA", "Base de Conocimiento", etc.?)
   
3. Si no ves nada: reload de página: Ctrl+Shift+R
   
4. Si sigue sin aparecer:
   a) Abre Console (F12)
   b) Copia errores
   c) Reporta
```

### Si la transcripción falla:
```
Error: "Error en la transcripción: Whisper API sin respuesta"
→ Whisper no está corriendo
  Solución: npm start whisper (en otra terminal)

Error: "Error en la transcripción: caseId inválido"
→ El caseId no existe
  Solución: Selecciona otro caso del dropdown

Error: "Error en la transcripción: Archivo no válido"
→ El archivo no es audio (.mp3, .wav, etc.)
  Solución: Selecciona un archivo audio válido
```

### Si el panel de admin no carga:
```
Error: "Acceso Denegado - Solo admins"
→ No eres ADMINISTRADOR
  Solución: Logúeate como admin

Error: "Error checking tools health"
→ Algún servicio está caído
  Verificar:
  ✅ Ollama: curl http://localhost:11434/api/tags
  ✅ Whisper: curl http://localhost:8000/docs
  ✅ PostgreSQL: psql -d defensoria
```

---

## 📝 CHECKLIST FINAL

| Item | Status | Notas |
|------|--------|-------|
| Usuario puede subir audio | ✅/❌ | |
| Transcripción funciona | ✅/❌ | |
| Análisis carga | ✅/❌ | |
| Admin ve panel | ✅/❌ | |
| Health checks muestran | ✅/❌ | |
| Tests ejecutan | ✅/❌ | |
| Botón aprobación existe | ✅/❌ | |
| Acceso por rol | ✅/❌ | |
| Sin errores en console | ✅/❌ | |
| Compilaciones OK | ✅/❌ | |

---

## 📞 REPORTAR PROBLEMAS

Si algo no funciona:

1. **Abre Console** (F12 en navegador)
2. **Copia errores** que aparecen en rojo
3. **Reporta**:
   - URL donde ocurre
   - Rol del usuario
   - Error exacto
   - Pasos para reproducir

---

## ✅ TESTING COMPLETADO

Si todos los items del checklist están ✅, las herramientas están **LISTAS PARA PRODUCCIÓN**.

**Éxito**: 🎉 Las herramientas Phase 2 funcionan correctamente
