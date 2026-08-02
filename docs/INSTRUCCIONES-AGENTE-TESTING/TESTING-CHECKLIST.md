# ✅ CHECKLIST DE TESTING - HERRAMIENTAS

## 🎯 OBJETIVO
Verificar que las herramientas funcionan perfectamente para ADMINISTRADOR tanto con datos de ejemplo como con transcripciones reales.

## 📋 PRE-REQUISITOS
- [ ] API corriendo: `npm run start:dev` (puerto 4100)
- [ ] Web corriendo: `npm run dev` (puerto 3000)  
- [ ] Usuario ADMINISTRADOR disponible
- [ ] Al menos 1 caso en la base de datos

## 🧪 TEST SUITE 1: DATOS DE EJEMPLO (SIN AUDIO)

### Test 1.1: Login y Acceso
- [ ] Abrir: `http://localhost:3000/login`
- [ ] Loguear como: `admin@defensoria.bo`
- [ ] Verificar rol: debe mostrar "ADMINISTRADOR"
- [ ] Ir a: `/tools-demo` (directo o desde sidebar)

### Test 1.2: Selección de Caso
- [ ] Ver dropdown "Caso a Analizar"
- [ ] Debe listar casos disponibles (ej: CASO-001)
- [ ] Seleccionar cualquier caso
- [ ] Verificar que se selecciona correctamente

### Test 1.3: Cargar Datos sin Audio
- [ ] **NO** subir audio (saltar este paso)
- [ ] Hacer clic en botón "🔄 Cargar Datos"
- [ ] Debe mostrar spinner "Analizando caso..."
- [ ] Debe completar SIN errores 400/500

### Test 1.4: Verificar Análisis de Ejemplo
- [ ] **Legal Tab**: Debe mostrar análisis de discrepancias de ejemplo
- [ ] **Psicológico Tab**: Debe mostrar indicadores de trauma de ejemplo  
- [ ] **Social Tab**: Debe mostrar mapa familiar de ejemplo
- [ ] **Transversal Tab**: Debe mostrar timeline de ejemplo
- [ ] **Verificar**: Datos NO deben estar vacíos
- [ ] **Verificar**: Debe decir "Análisis de ejemplo" en algún lugar

### Test 1.5: Console Sin Errores
- [ ] Abrir DevTools (F12) → Console
- [ ] NO debe haber errores rojos 400/500
- [ ] Puede haber warnings (amarillo) pero no errors (rojo)

## 🧪 TEST SUITE 2: DATOS REALES (CON AUDIO)

### Test 2.1: Subir Audio Pequeño
- [ ] Conseguir archivo audio < 5MB (.mp3 o .wav)
- [ ] Hacer clic en "📁 Subir Entrevista"
- [ ] Seleccionar el archivo audio
- [ ] Debe iniciar upload SIN error 413 "Payload Too Large"

### Test 2.2: Verificar Transcripción
- [ ] Debe mostrar "⏳ Transcribiendo audio..."
- [ ] Esperar a completar
- [ ] Debe mostrar "✅ Transcripción completada"
- [ ] Puede mostrar preview del texto transcrito

### Test 2.3: Cargar Análisis Real
- [ ] Hacer clic en "🔄 Cargar Datos"
- [ ] Debe mostrar spinner
- [ ] Debe completar exitosamente

### Test 2.4: Verificar Análisis Real
- [ ] **Legal Tab**: Análisis basado en transcripción real
- [ ] **Psicológico Tab**: Indicadores basados en transcripción
- [ ] **Social Tab**: Mapa basado en transcripción  
- [ ] **Transversal Tab**: Timeline basado en transcripción
- [ ] **Verificar**: Datos diferentes a los de ejemplo
- [ ] **Verificar**: NO dice "Análisis de ejemplo"

## 🧪 TEST SUITE 3: ROLES Y PERMISOS

### Test 3.1: Otros Roles También Funcionan
- [ ] Loguear como JEFATURA
- [ ] Ir a `/tools-demo`
- [ ] Hacer clic "Cargar Datos" sin audio
- [ ] ✅ Debe funcionar (datos de ejemplo)

### Test 3.2: Acceso a Panel Admin Protegido
- [ ] Como JEFATURA, intentar: `/admin/tools-verification`
- [ ] ❌ Debe decir "Acceso Denegado"
- [ ] Como ADMINISTRADOR, acceder: `/admin/tools-verification`
- [ ] ✅ Debe funcionar (mostrar panel)

## 🧪 TEST SUITE 4: CASOS EDGE

### Test 4.1: Archivo Audio Muy Grande
- [ ] Intentar subir archivo > 10MB
- [ ] Si falla con 413, está bien (esperado)
- [ ] Si funciona, mejor aún

### Test 4.2: Sin Casos Disponibles
- [ ] Si no hay casos en DB
- [ ] Debe mostrar "No hay casos disponibles"
- [ ] NO debe crashear

### Test 4.3: Refresh de Página
- [ ] En `/tools-demo`, recargar página (F5)
- [ ] Debe mantener el usuario logueado
- [ ] Debe funcionar normalmente

## 🧪 TEST SUITE 5: COMPILACIÓN

### Test 5.1: Build Backend
```bash
cd apps/api
npm run build
```
- [ ] Debe terminar con exit code 0
- [ ] NO debe haber errores de TypeScript

### Test 5.2: Build Frontend  
```bash
cd apps/web
npx tsc --noEmit --skipLibCheck
```
- [ ] Debe terminar con exit code 0  
- [ ] NO debe haber errores de TypeScript

## 📊 REPORTE DE RESULTADOS

### ✅ CASOS QUE PASAN
- [ ] Test 1: Datos de ejemplo funcionan
- [ ] Test 2: Audio upload funciona  
- [ ] Test 3: Roles funcionan correctamente
- [ ] Test 4: Casos edge manejados
- [ ] Test 5: Compilación exitosa

### ❌ CASOS QUE FALLAN (reportar detalles)
- [ ] ________________________
- [ ] ________________________  
- [ ] ________________________

### 📝 NOTAS ADICIONALES
```
(Cualquier observación importante)
```

## 🎉 CRITERIO DE ÉXITO FINAL

**✅ ÉXITO SI:**
- Administrador puede usar herramientas SIN subir audio (datos ejemplo)
- Administrador puede usar herramientas CON audio (datos reales)
- Otros roles pueden usar herramientas normalmente
- No hay errores 400/413/500 en console
- Compilaciones son exitosas

**❌ REQUIERE ARREGLOS SI:**
- Cualquier test falla
- Errores en console  
- Compilación falla
- Herramientas muestran datos vacíos