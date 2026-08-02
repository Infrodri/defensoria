# 📋 TEMPLATE DE REPORTE - AGENTE EJECUTOR

## 🎯 OBJETIVO
Este template define EXACTAMENTE cómo el agente ejecutor debe reportar sus hallazgos, fixes y resultados de testing.

---

## 📊 ESTRUCTURA DEL REPORTE

### **HEADER - Información General**
```markdown
# 🤖 REPORTE DE EJECUCIÓN - [FASE]

**Fecha**: [YYYY-MM-DD HH:mm]
**Agente**: [Nombre/ID del agente]
**Fase**: [FASE 1: Implementar Fixes | FASE 2: Testing]
**Estado**: [✅ COMPLETADO | ⏳ EN PROGRESO | ❌ BLOQUEADO]
**Tiempo Total**: [Xh Ym]
```

---

## 🔍 FASE 1 - REPORTE DE FIXES IMPLEMENTADOS

### **1. RESUMEN EJECUTIVO**
```markdown
## 📌 RESUMEN EJECUTIVO

**Fixes Completados**: X/Y
**Archivos Modificados**: Z archivos
**Compilación**: ✅ Exitosa | ❌ Con errores
**Tests Unitarios**: ✅ Pasan | ⚠️ Algunos fallan | ❌ Fallan
**Bloqueadores**: [SÍ/NO] - [Descripción si hay]

**Hallazgos Importantes**:
1. [Hallazgo crítico 1]
2. [Hallazgo crítico 2]
```

### **2. FIXES IMPLEMENTADOS (Detalle)**

Para cada fix, usar este formato:

```markdown
### ✅ FIX #1: [Título del Fix]

**Archivo**: `ruta/completa/al/archivo.ts`

**Problema Original**:
- Descripción del bug/issue
- Error específico (código, mensaje)
- Causa raíz identificada

**Solución Implementada**:
```typescript
// ANTES:
[código original relevante]

// DESPUÉS:
[código modificado]
```

**Validación**:
- ✅ Compila sin errores
- ✅ Tests unitarios pasan (si aplica)
- ✅ Verificado manualmente (si aplica)

**Archivos Relacionados Modificados**:
- `archivo1.ts` (líneas X-Y)
- `archivo2.ts` (líneas A-B)

**Notas**:
- [Cualquier consideración especial]
- [Efectos secundarios o dependencias]
```

### **3. HALLAZGOS NO ESPERADOS**

```markdown
## 🚨 HALLAZGOS NO ESPERADOS

### Hallazgo #1: [Título]
**Severidad**: 🔴 CRÍTICO | 🟡 MEDIO | 🟢 BAJO
**Tipo**: BUG | MEJORA | DEUDA TÉCNICA | CONFIGURACIÓN

**Descripción**:
[Descripción clara del hallazgo]

**Evidencia**:
```bash
[Logs, errores, outputs relevantes]
```

**Impacto**:
- [En qué afecta]
- [Componentes/funcionalidades impactadas]

**Recomendación**:
- [Qué se debería hacer]
- [Prioridad sugerida]

**Estado**:
- [ ] Pendiente
- [ ] Arreglado en este ciclo
- [ ] Documentado para siguiente fase
```

### **4. ARCHIVOS MODIFICADOS**

```markdown
## 📝 ARCHIVOS MODIFICADOS

### Backend (API)
1. `apps/api/src/modules/legal-tools/dto/analyze-discrepancies.dto.ts`
   - Líneas modificadas: 7-10
   - Cambio: Agregado `@IsOptional()` a `transcriptionId`

2. `apps/api/src/modules/legal-tools/legal-tools.service.ts`
   - Líneas modificadas: 35-80
   - Cambio: Agregada lógica de fallback con `generateExampleAnalysis()`

[... continuar con todos los archivos]

### Frontend (Web)
[Si aplica]

### Total: X archivos modificados
```

### **5. COMPILACIÓN Y TESTS**

```markdown
## 🧪 COMPILACIÓN Y TESTS

### Compilación TypeScript
```bash
$ npm run build
[output completo o resumen]

✅ EXIT CODE: 0
⏱️  Tiempo: Xs
```

### Tests Unitarios
```bash
$ npm run test
[output completo o resumen]

RESULTADO:
✅ Tests pasados: X
⚠️  Tests con warnings: Y
❌ Tests fallidos: Z

TESTS FALLIDOS (si hay):
- [Nombre del test]: [Razón del fallo]
- [Es preexistente? SÍ/NO]
```

### Tests de Integración
[Si aplica]
```

---

## 🧪 FASE 2 - REPORTE DE TESTING

### **1. RESUMEN DE TESTING**

```markdown
## 📊 RESUMEN DE TESTING

**Test Suites Ejecutadas**: X/Y
**Casos de Prueba Totales**: A
**Casos Exitosos**: B (XX%)
**Casos Fallidos**: C (XX%)
**Casos Bloqueados**: D (XX%)

**Ambientes Probados**:
- ✅ API en puerto 4100
- ✅ Web en puerto 3000
- ✅ PostgreSQL conectado
- ⚠️  Whisper API [estado]
- ⚠️  Ollama [estado]

**Credenciales Usadas**:
- Usuario: [username]
- Rol: [ADMINISTRADOR/ABOGADO/etc]
```

### **2. TEST SUITE #1: Sin Audio (Datos Ejemplo)**

```markdown
## 📋 TEST SUITE #1: Sin Audio (Datos Ejemplo)

**Objetivo**: Verificar que herramientas funcionan sin transcripción usando datos de ejemplo

### Caso 1.1: Login como ADMINISTRADOR
**Estado**: ✅ PASS | ❌ FAIL | ⚠️ PARCIAL

**Pasos Ejecutados**:
1. Login con credenciales ADMINISTRADOR
   - ✅ Redirección correcta a dashboard
   - ✅ Token JWT obtenido

2. Navegación a `/tools-demo`
   - ✅ Página carga sin errores
   - ⚠️  [Descripción de warning si hay]

**Resultado**: ✅ EXITOSO

**Evidencia**:
[Screenshot o log relevante]

**Tiempo**: Xs

---

### Caso 1.2: Seleccionar Caso
**Estado**: ✅ PASS | ❌ FAIL

**Pasos Ejecutados**:
1. Abrir selector de casos
   - ✅ Lista de casos carga correctamente
   - ✅ Casos ordenados por fecha

2. Seleccionar caso "CASO-2024-001"
   - ✅ Caso seleccionado
   - ✅ Información básica visible

**Resultado**: ✅ EXITOSO

---

### Caso 1.3: Cargar Herramientas SIN Audio
**Estado**: ❌ FAIL

**Pasos Ejecutados**:
1. Click botón "Cargar Datos" (sin subir audio)
   - ❌ Error 400: "transcriptionId must be a UUID"

**ERROR ENCONTRADO**:
```json
{
  "statusCode": 400,
  "message": "transcriptionId must be a UUID",
  "error": "Bad Request"
}
```

**Endpoint**: `POST /api/legal-tools/discrepancies/analyze`

**Request Body**:
```json
{
  "caseId": "uuid-del-caso",
  "transcriptionId": undefined  // ← PROBLEMA
}
```

**Causa Raíz**:
- DTO no tiene `@IsOptional()` en `transcriptionId`
- Frontend envía `undefined` cuando no hay audio

**Recomendación**:
- Implementar fix según `PROMPT-AGENTE.md`

**Resultado**: ❌ FALLO BLOQUEANTE

---

[Continuar con todos los casos...]
```

### **3. TEST SUITE #2: Con Audio (Datos Reales)**

```markdown
## 📋 TEST SUITE #2: Con Audio (Datos Reales)

[Mismo formato que Suite #1]
```

### **4. MATRIZ DE RESULTADOS**

```markdown
## 📊 MATRIZ DE RESULTADOS

| Suite | Caso | Descripción | Resultado | Tiempo | Bloqueante |
|-------|------|-------------|-----------|--------|------------|
| 1 | 1.1 | Login ADMIN | ✅ PASS | 2s | NO |
| 1 | 1.2 | Seleccionar Caso | ✅ PASS | 1s | NO |
| 1 | 1.3 | Cargar sin audio | ❌ FAIL | 5s | SÍ |
| 1 | 1.4 | Verificar Legal | ❌ SKIP | - | SÍ |
| 1 | 1.5 | Verificar Psico | ❌ SKIP | - | SÍ |
| ... | ... | ... | ... | ... | ... |

**Resumen**:
- ✅ Exitosos: X (XX%)
- ❌ Fallidos: Y (YY%)
- ⚠️ Parciales: Z (ZZ%)
- ⏭️ Saltados: W (WW%)
```

---

## 📦 GIT COMMIT REPORT

```markdown
## 🔀 GIT COMMIT REPORT

### Commits Creados

**Commit #1**: Fix transcriptionId optional in DTOs
```bash
git log --oneline -1
[hash] fix(tools): make transcriptionId optional in all tool DTOs
```

**Archivos en commit**:
- apps/api/src/modules/legal-tools/dto/analyze-discrepancies.dto.ts
- apps/api/src/modules/psychological-tools/dto/extract-indicators.dto.ts
- apps/api/src/modules/social-tools/dto/generate-family-map.dto.ts

**Diff Stats**:
```bash
3 files changed, 12 insertions(+), 3 deletions(-)
```

---

**Commit #2**: Add fallback example data in tools services
[... mismo formato]

---

### Branch Status
```bash
$ git status
On branch feature/tools-fixes
Your branch is ahead of 'main' by 3 commits.

Changes committed: X files
Untracked files: Y files
```

### Push Status
- [ ] Pendiente push
- [x] Pushed to remote
- [ ] PR creado: #[número]
```

---

## 🚦 DECISIONES Y BLOQUEADORES

```markdown
## 🚦 DECISIONES TOMADAS

### Decisión #1: [Título]
**Contexto**: [Por qué surgió la necesidad]
**Opciones Consideradas**:
1. Opción A: [descripción]
2. Opción B: [descripción]

**Decisión**: Opción [X]
**Razón**: [Por qué se eligió]
**Impacto**: [Consecuencias]

---

## 🚧 BLOQUEADORES ACTUALES

### Bloqueador #1: [Título]
**Tipo**: TÉCNICO | DEPENDENCIA | CONFIGURACIÓN | ACCESO
**Severidad**: 🔴 CRÍTICO | 🟡 MEDIO | 🟢 BAJO

**Descripción**:
[Qué está bloqueando el progreso]

**Dependencia**:
- Requiere: [Qué se necesita]
- Responsable: [Quién puede resolverlo]

**Workaround Posible**:
- [ ] No hay workaround
- [x] [Descripción del workaround temporal]

**Impacto en Timeline**:
- Tiempo perdido: Xh
- Afecta: [Qué casos/suites]
```

---

## 📈 SIGUIENTE PASO RECOMENDADO

```markdown
## 🎯 SIGUIENTE PASO RECOMENDADO

**Para el Orquestador (Kiro)**:
[Qué necesitas que Kiro haga o decida]

**Para el Usuario (PM)**:
[Qué necesitas que el usuario confirme o proporcione]

**Para Mí (Agente)**:
[Qué haré una vez desbloqueado]

**Prioridad**: 🔴 URGENTE | 🟡 ALTA | 🟢 NORMAL

**Estimación**: Xh para completar
```

---

## 📎 ANEXOS

```markdown
## 📎 ANEXOS

### Anexo A: Logs Completos
[Archivo adjunto o link]

### Anexo B: Screenshots
1. [Descripción]: [link o archivo]
2. [Descripción]: [link o archivo]

### Anexo C: Archivos de Configuración
[Configs relevantes si cambiaron]

### Anexo D: Scripts Ejecutados
```bash
[Scripts custom que se usaron]
```
```

---

## ✅ CHECKLIST FINAL

```markdown
## ✅ CHECKLIST FINAL

Antes de entregar reporte, verificar:

- [ ] Todos los hallazgos documentados con evidencia
- [ ] Archivos modificados listados completamente
- [ ] Commits creados con mensajes descriptivos
- [ ] Compilación exitosa verificada
- [ ] Tests ejecutados y resultados documentados
- [ ] Bloqueadores claramente identificados
- [ ] Siguiente paso recomendado incluido
- [ ] Tiempo total registrado
- [ ] Anexos adjuntos si necesarios
```

---

## 📋 EJEMPLO COMPLETO

Ver archivo: `REPORTE-EJEMPLO.md` para un ejemplo completo de cómo llenar este template.

---

## 🔔 NOTAS IMPORTANTES

1. **Ser específico**: No decir "hubo un error", sino "Error 400 en línea X del archivo Y"
2. **Evidencia siempre**: Logs, screenshots, diffs cuando sea relevante
3. **Distinguir**: Problemas nuevos vs. preexistentes
4. **Impacto claro**: Cómo afecta a funcionalidad/testing
5. **Próximos pasos**: Siempre terminar con recomendación clara

---

**Este template es la ÚNICA forma de reportar. Seguir estructura exactamente.** ✅