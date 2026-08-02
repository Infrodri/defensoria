# 📚 SCRIPTS REFERENCE

Referencia de todos los scripts disponibles para testing y desarrollo.

---

## 🧪 E2E Testing Scripts

### `npm run test:e2e`
Ejecuta todos los E2E tests en modo headless (sin mostrar navegador).

```bash
cd apps/web
npm run test:e2e
```

**Uso:** Automatización, CI/CD, validación completa
**Salida:** Reporte en terminal + HTML
**Tiempo:** ~2-3 minutos
**Browsers:** Chromium + Firefox

---

### `npm run test:e2e:ui` ⭐ RECOMENDADO
Ejecuta tests con interface visual interactiva.

```bash
cd apps/web
npm run test:e2e:ui
```

**Uso:** Desarrollo, debugging, inspección visual
**Ventajas:**
- Ver tests en tiempo real
- Ejecutar paso a paso
- Inspeccionar elementos del DOM
- Pausar/reanudar tests
- Revisar screenshots

**Mejor para:** Desarrollo y troubleshooting

---

### `npm run test:e2e:debug`
Abre Playwright Inspector para debugging avanzado.

```bash
cd apps/web
npm run test:e2e:debug
```

**Uso:** Debugging detallado, investigación
**Características:**
- Inspector de elementos
- Evaluador de JavaScript
- Step-by-step execution
- Watch de locators
- Network inspection

**Mejor para:** Resolver problemas complejos

---

### `npm run test:e2e:headed`
Ejecuta tests con navegador visible.

```bash
cd apps/web
npm run test:e2e:headed
```

**Uso:** Visualización de acciones
**Ventajas:**
- Ver qué hace el test
- Debugging visual
- Validación rápida

**Mejor para:** Verificación rápida

---

### `npm run test:e2e:report`
Abre el reporte HTML de tests anteriores.

```bash
cd apps/web
npm run test:e2e:report
```

**Uso:** Revisar resultados
**Muestra:**
- Tests pasados/fallidos
- Screenshots de fallos
- Videos (si aplica)
- Trace de errores
- Timings

**Nota:** Ejecuta primero `npm run test:e2e` para generar reporte

---

## 📦 Build & Development Scripts

### `npm run dev`
Inicia servidor de desarrollo de Next.js en puerto 3100.

```bash
cd apps/web
npm run dev
```

**Puerto:** 3100
**Modo:** Development (con hot reload)
**Requerido para:** Tests E2E

---

### `npm run build`
Crea build de producción.

```bash
cd apps/web
npm run build
```

**Salida:** `.next/` directorio optimizado
**Usos:** Antes de deploy, validación de build

---

### `npm run start`
Inicia servidor en modo producción.

```bash
cd apps/web
npm run start
```

**Puerto:** 3100
**Uso:** Después de `npm run build`

---

### `npm run lint`
Ejecuta linter (ESLint).

```bash
cd apps/web
npm run lint
```

**Revisa:** Código style, best practices
**Usos:** Validación de código

---

## 🔧 Backend Scripts (apps/api)

### `npm run start:dev`
Inicia API en modo desarrollo.

```bash
cd apps/api
npm run start:dev
```

**Puerto:** 4000
**Modo:** Development (con hot reload)
**Requerido para:** Tests E2E

---

### `npm run build`
Crea build de producción.

```bash
cd apps/api
npm run build
```

---

## 💾 Database Scripts

### `npx prisma db seed`
Carga datos de prueba en la base de datos.

```bash
cd apps/web  # O raíz
npx prisma db seed
```

**Carga:**
- 30+ registros de referencia
- 5 casos de prueba completos
- Usuarios pre-creados
- Permisos configurados

**Requerido para:** Tests E2E

---

### `npx prisma migrate reset`
⚠️ **CUIDADO:** Borra toda la BD y la recrea.

```bash
npx prisma migrate reset
```

**Incluye:**
- Eliminación de esquema
- Recreación de esquema
- Seed automático

**Uso:** Solo en desarrollo

---

### `npx prisma studio`
Abre interfaz gráfica para la BD.

```bash
npx prisma studio
```

**Acceso:** http://localhost:5555
**Uso:** Ver/editar datos manualmente

---

## 🧹 Limpieza

### Limpiar reportes E2E
```bash
rm -rf playwright-report/
rm -rf test-results/
rm -rf blob-report/
```

### Limpiar build
```bash
cd apps/web
rm -rf .next/
rm -rf dist/
```

---

## 📊 Workflow Típico

### Para Testing
```bash
# Terminal 1 - Backend
cd apps/api
npm run start:dev

# Terminal 2 - Frontend  
cd apps/web
npm run dev

# Terminal 3 - Tests (en otra ventana)
cd apps/web
npm run test:e2e:ui
```

### Para Desarrollo
```bash
# Terminal 1 - Backend
cd apps/api
npm run start:dev

# Terminal 2 - Frontend
cd apps/web
npm run dev

# Luego abrir navegador:
# http://localhost:3100
```

### Para Verificación Pre-Commit
```bash
npm run lint
npm run build
npm run test:e2e
```

---

## 🎯 Comando por Caso de Uso

### "Quiero ejecutar todos los tests"
```bash
npm run test:e2e
```

### "Quiero ver los tests ejecutándose"
```bash
npm run test:e2e:ui
```

### "Un test falla, necesito debuggear"
```bash
npm run test:e2e:debug
```

### "Quiero ver el reporte de tests anteriores"
```bash
npm run test:e2e:report
```

### "Quiero ejecutar un test específico"
```bash
npx playwright test -g "nombre del test"
```

### "Necesito resetear todo (BD, datos, etc)"
```bash
npx prisma migrate reset
npx prisma db seed
npm run test:e2e
```

### "Quiero inspeccionar la BD manualmente"
```bash
npx prisma studio
# Luego: http://localhost:5555
```

### "Necesito ver qué hace un test paso a paso"
```bash
npm run test:e2e:headed
```

---

## ⚙️ Configuración

### Variables de Entorno (Opcional)

```bash
# .env.local o en terminal
export PLAYWRIGHT_TEST_BASE_URL=http://localhost:3100
export PLAYWRIGHT_TEST_API_URL=http://localhost:4000/api
export CI=false  # true para CI environments
```

### Modificar Configuración

- **Playwright config:** `apps/web/playwright.config.ts`
- **Next.js config:** `apps/web/next.config.ts`
- **API config:** `apps/api/src/main.ts`

---

## 📈 Parallelización

### Ejecutar con X workers
```bash
npx playwright test --workers=4
```

### Controlar paralelización
En `playwright.config.ts`:
```typescript
workers: process.env.CI ? 1 : 4,
```

---

## 🔍 Verbosidad

### Modo verbose
```bash
npx playwright test --verbose
```

### Con trace
```bash
npx playwright test --trace=on
```

---

## 🚀 CI/CD

### GitHub Actions style
```bash
CI=true npm run test:e2e
```

Esto:
- Desactiva reutilización de servidor
- Ejecuta con 1 worker
- Habilita retries
- Genera reportes

---

## 📝 Notas

- Siempre ejecutar backend ANTES de tests
- Ejecutar `npm run build` antes de push
- Siempre hacer `npm run lint` antes de commit
- Para atajos, agregar a `~/.bashrc` o `~/.zshrc`

---

**Última actualización:** 2024-02-15
**Versión:** 1.0.0
