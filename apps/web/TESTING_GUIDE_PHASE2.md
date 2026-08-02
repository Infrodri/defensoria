# 📋 TESTING GUIDE - PHASE 2 TOOLS

Guía completa para ejecutar y verificar la suite de E2E tests para las herramientas de Fase 2.

---

## 📌 TABLA DE CONTENIDOS

1. [Setup & Ejecución](#setup--ejecución)
2. [Credenciales de Prueba](#credenciales-de-prueba)
3. [Datos de Prueba](#datos-de-prueba)
4. [Verificación Manual](#verificación-manual)
5. [Verificación Automatizada](#verificación-automatizada)
6. [URLs y Endpoints](#urls-y-endpoints)
7. [Troubleshooting](#troubleshooting)
8. [Checklist de Entrega](#checklist-de-entrega)

---

## 🚀 SETUP & EJECUCIÓN

### Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Base de datos Prisma configurada
- Puerto 3100 disponible (Frontend)
- Puerto 4000 disponible (API)

### Instalación de Playwright

Playwright ya está instalado como devDependency. Para actualizar o reinstalar:

```bash
npm install @playwright/test --save-dev
```

### Instalación de Navegadores

```bash
npx playwright install
```

### Verificar Instalación

```bash
npx playwright --version
```

---

## ▶️ CÓMO EJECUTAR TESTS

### 1. Ejecutar Todos los Tests

```bash
cd apps/web
npm run test:e2e
```

### 2. Ejecutar Tests en Modo UI (Recomendado)

```bash
npm run test:e2e:ui
```

Esto abre una interfaz visual donde puedes:
- Ver cada test ejecutándose en tiempo real
- Pausar y reanudar tests
- Ver screenshots de cada paso
- Revisar errores con el inspector

### 3. Ejecutar Tests en Modo Debug

```bash
npm run test:e2e:debug
```

Permite:
- Ejecutar paso a paso
- Inspeccionar elementos
- Ver el estado del DOM en cada paso

### 4. Ejecutar Tests en Modo Headed (Con Navegador Visible)

```bash
npm run test:e2e:headed
```

### 5. Ejecutar un Archivo de Test Específico

```bash
npx playwright test e2e/phase2-tools.spec.ts
```

### 6. Ejecutar un Test Específico por Nombre

```bash
npx playwright test -g "Login válido con credenciales correctas"
```

### 7. Ver Reporte HTML

```bash
npm run test:e2e:report
```

---

## 🔐 CREDENCIALES DE PRUEBA

### Usuarios de Testing

| Rol | Email | Contraseña | Acceso |
|-----|-------|-----------|---------|
| **Abogado** | `abogado@defensoria.gob.bo` | `Password123!` | Legal Tools, Transversal |
| **Psicólogo** | `psicologo@defensoria.gob.bo` | `Password123!` | Psychological Tools |
| **Trabajador Social** | `social@defensoria.gob.bo` | `Password123!` | Social Tools |
| **Jefe de Oficina** | `jefe@defensoria.gob.bo` | `Password123!` | Todos (Admin) |

### Credenciales de Acceso

- **Usuario Principal**: `abogado@defensoria.gob.bo`
- **Contraseña**: `Password123!`
- **Rol**: ABOGADO
- **Permisos**: Acceso a Legal Tools, Psychological Tools, Social Tools, Transversal Tools

### Roles y Permisos

| Rol | Legal | Psych | Social | Trans | Admin |
|-----|-------|-------|--------|-------|-------|
| ABOGADO | ✅ | ✅ | ✅ | ✅ | ❌ |
| PSICOLOGO | ✅ | ✅ | ✅ | ✅ | ❌ |
| SOCIAL | ✅ | ✅ | ✅ | ✅ | ❌ |
| JEFE | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 📊 DATOS DE PRUEBA

### Base de Datos Seeded

La base de datos contiene:

- **30+ registros** en tablas de referencia
- **5 casos completos** con datos integrados
- **Usuarios pre-creados** con roles específicos
- **Permisos configurados** por rol

### 5 Casos para Testing

| Código | Nombre | Estado | Tipo | Creado |
|--------|--------|--------|------|---------|
| `CASO-2024-001` | Carlos García López | Abierto | Negligencia | 2024-01-15 |
| `CASO-2024-002` | María Rodríguez Santos | Abierto | Abuso | 2024-01-18 |
| `CASO-2024-003` | Juan Pérez Flores | En Análisis | Abandono | 2024-01-20 |
| `CASO-2024-004` | Ana Martínez López | Cerrado | Vulnerabilidad | 2024-01-22 |
| `CASO-2024-005` | Luis González Díaz | Abierto | Negligencia | 2024-01-25 |

### Registros Seeded (30+)

**Tablas con Datos:**

- `Discipline` - Tipos de disciplinas (15 registros)
- `ReportTemplate` - Plantillas de reportes (8 registros)
- `Case` - Casos de ejemplo (5 registros)
- `LegalAnalysis` - Análisis legales (5 registros)
- `PsychologicalAnalysis` - Análisis psicológicos (5 registros)
- `SocialAnalysis` - Análisis sociales (5 registros)

### Cómo Regenerar Datos

Si necesitas resetear los datos:

```bash
# Resetear base de datos
cd packages/db
npx prisma migrate reset

# O generar seed solo
npx prisma db seed
```

---

## 🔍 VERIFICACIÓN MANUAL

Sigue estos pasos para verificar la funcionalidad manualmente:

### Paso 1: Iniciar Servicios

**Terminal 1 - API Backend:**
```bash
cd apps/api
npm run start:dev
# Deberías ver: "Server running on http://localhost:4000"
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
# Deberías ver: "ready - started server on 0.0.0.0:3100"
```

### Paso 2: Acceder a Aplicación

1. Abre navegador: `http://localhost:3100`
2. Deberías ver la página de login

### Paso 3: Login

1. Email: `abogado@defensoria.gob.bo`
2. Contraseña: `Password123!`
3. Click en "Ingresar"
4. Verifica que te redirige al dashboard

### Paso 4: Navegar a Tools Demo

1. URL: `http://localhost:3100/tools-demo`
2. Deberías ver:
   - Título: "📊 Demo Integrado de Herramientas"
   - Usuario logeado en la esquina
   - Selector de casos
   - 4 pestañas (Legal, Psicológico, Social, Transversal)
   - Botón "Cargar Datos"

### Paso 5: Probar Legal Tools

1. Pestaña: "⚖️ Legal"
2. Selecciona un caso
3. Click "Cargar Datos"
4. Deberías ver:
   - Título: "Análisis de Discrepancias"
   - Lista de discrepancias
   - Score de consistencia
   - Severidades (BAJA, MEDIA, ALTA)

**Elementos a validar:**
- [ ] Panel legal renderizado
- [ ] Datos de discrepancias visibles
- [ ] Colores por severidad
- [ ] Score de consistencia mostrado

### Paso 6: Probar Psychological Tools

1. Pestaña: "🧠 Psicológico"
2. Deberías ver:
   - Título: "Análisis Psicológico"
   - Indicadores de trauma
   - Escalas de riesgo
   - Puntuaciones

**Elementos a validar:**
- [ ] Panel psicológico renderizado
- [ ] Indicadores listados
- [ ] Iconos por severidad
- [ ] Escalas con colores

### Paso 7: Probar Social Tools

1. Pestaña: "👥 Social"
2. Deberías ver:
   - Título: "Análisis Social"
   - Estructura familiar
   - Miembros de familia
   - Vulnerabilidades

**Elementos a validar:**
- [ ] Panel social renderizado
- [ ] Familia mostrada
- [ ] Relaciones indicadas
- [ ] Vulnerabilidades listadas

### Paso 8: Probar Transversal Tools

1. Pestaña: "🔗 Transversal"
2. Deberías ver:
   - Título: "Timeline Unificada"
   - Eventos cronológicos
   - Tipos de evento (Legal, Psicológico, Social)
   - Fechas y descripciones

**Elementos a validar:**
- [ ] Timeline renderizada
- [ ] Eventos en orden
- [ ] Colores por tipo
- [ ] Fechas correctas

### Paso 9: Verificar Swagger

1. URL: `http://localhost:4000/api/docs`
2. Verifica que todos los endpoints están documentados
3. Prueba cada endpoint manualmente si es necesario

### Paso 10: Logout

1. Click en menú de usuario
2. Click "Cerrar sesión"
3. Verifica que redirige a login

---

## 🤖 VERIFICACIÓN AUTOMATIZADA

### Ejecutar Suite Completa

```bash
cd apps/web
npm run test:e2e
```

### Esperado: 15+ Tests PASS

```
Running 15 tests using 1 worker

[1/15] Autenticación & Login > Login válido... ✅
[2/15] Autenticación & Login > Logout correcto... ✅
[3/15] Autenticación & Login > Acceso denegado... ✅
[4/15] Página Demo > Página carga correctamente... ✅
[5/15] Página Demo > Dropdown de casos... ✅
[6/15] Página Demo > Selector de pestaña... ✅
[7/15] Página Demo > Botón Cargar Datos... ✅
[8/15] Herramientas Legales > Panel renderiza... ✅
[9/15] Herramientas Legales > Datos discrepancias... ✅
[10/15] Herramientas Legales > API responde... ✅
[11/15] Herramientas Psicológicas > Panel renderiza... ✅
[12/15] Herramientas Psicológicas > Indicadores... ✅
[13/15] Herramientas Psicológicas > API responde... ✅
[14/15] Herramientas Sociales > Panel renderiza... ✅
[15/15] Herramientas Sociales > Estructura... ✅

15 passed (2m 30s)
```

### Generación de Reportes

**Reporte HTML (Automático):**
```bash
npm run test:e2e:report
```

Abrirá automáticamente: `playwright-report/index.html`

**Reporte JSON:**
- Ubicación: `test-results/results.json`
- Útil para CI/CD

**Screenshots en Caso de Fallo:**
- Ubicación: `test-results/` (si hay fallos)
- Automático para tests fallidos

### Debugging de Tests

Para debuggear un test específico:

```bash
npx playwright test -g "nombre del test" --debug
```

Esto abre el Playwright Inspector donde puedes:
- Ver el código del test
- Ejecutar paso a paso
- Inspeccionar elementos del DOM
- Ver logs y errores

### Modo UI para Desarrollo

```bash
npm run test:e2e:ui
```

Interfaz visual con:
- Vista previa del navegador
- Código del test en tiempo real
- Selector de elementos
- Historial de pasos

---

## 🔗 URLs Y ENDPOINTS

### URLs Base

| Servicio | URL | Puerto |
|----------|-----|--------|
| **Frontend** | `http://localhost:3100` | 3100 |
| **Backend API** | `http://localhost:4000/api` | 4000 |
| **Swagger** | `http://localhost:4000/api/docs` | 4000 |

### Páginas Frontend

| Página | URL | Descripción |
|--------|-----|-------------|
| Login | `/login` o `/(auth)/login` | Página de autenticación |
| Dashboard | `/dashboard/panel` | Panel principal |
| Casos | `/dashboard/casos` | Listado de casos |
| Tools Demo | `/tools-demo` | Demostración de herramientas (NUEVA) |

### API Endpoints Phase 2

#### Legal Tools (`/legal-tools`)

```
GET    /legal-tools/discrepancies/analyze          - Analizar discrepancias
GET    /legal-tools/penal-typicality/analyze       - Tipicidad penal
GET    /legal-tools/processual-deadlines/calculate - Plazos procesales
```

#### Psychological Tools (`/psychological-tools`)

```
GET    /psychological-tools/indicators/extract     - Extraer indicadores
GET    /psychological-tools/risk-scales/prefill    - Escalas de riesgo
GET    /psychological-tools/clinical-translation   - Traducción clínica
```

#### Social Tools (`/social-tools`)

```
GET    /social-tools/familymap/generate            - Generar mapa familiar
GET    /social-tools/vulnerability/calculate       - Calcular vulnerabilidad
GET    /social-tools/environmental/map             - Mapear ambiental
```

#### Transversal Tools (`/transversal-tools`)

```
GET    /transversal-tools/timeline/unified         - Timeline unificada
GET    /transversal-tools/anonymize/generate       - Generar reporte anónimo
```

### Swagger Documentation

Accede a la documentación interactiva:

```
http://localhost:4000/api/docs
```

Aquí puedes:
- Ver todos los endpoints
- Probar endpoints manualmente
- Ver esquemas de respuesta
- Copiar ejemplos de curl

---

## 🔧 TROUBLESHOOTING

### ❌ Error: "Port 3100 is already in use"

**Solución:**

```bash
# Encontrar proceso usando puerto 3100
lsof -i :3100

# Matar el proceso
kill -9 <PID>

# O usar puerto diferente
npm run dev -- -p 3101
```

### ❌ Error: "Cannot find module @defensoria/shared"

**Solución:**

```bash
# Instalar dependencias monorepo
npm install -w "apps/web"

# O desde raíz
npm install
npm run build
```

### ❌ Error: "Database connection refused"

**Solución:**

```bash
# Verificar que la BD está corriendo
# Si usas PostgreSQL:
psql -U postgres

# Generar seed data
npx prisma db seed

# Resetear BD (CUIDADO: borra datos)
npx prisma migrate reset
```

### ❌ Error: "No cases available" en dropdown

**Solución:**

```bash
# Verificar que hay casos en BD
npx prisma studio

# Navegar a tabla "Case"
# Si está vacía, regenerar seed:
cd packages/db
npx prisma db seed
```

### ❌ Test Timeout: "Waiting for locator timed out"

**Solución:**

```bash
# Aumentar timeout en playwright.config.ts
timeout: 60000 // Cambiar de 30000 a 60000

# O ejecutar con más verbosidad
npm run test:e2e:debug

# Verificar que servicios están corriendo
# Terminal 1: cd apps/api && npm run start:dev
# Terminal 2: cd apps/web && npm run dev
```

### ❌ Error: "No such file or directory: 'e2e/phase2-tools.spec.ts'"

**Solución:**

```bash
# Verificar que estás en el directorio correcto
cd apps/web

# Crear directorio e2e si no existe
mkdir -p e2e

# Verificar archivo
ls -la e2e/phase2-tools.spec.ts
```

### ❌ Error: "Cross-site request forgery token invalid"

**Solución:**

```bash
# Limpiar cookies del navegador en tests
# Agregado en playwright.config.ts:
use: {
  contextOptions: {
    ignoreHTTPSErrors: true,
  },
}
```

### ❌ Error: "Credenciales inválidas"

**Solución:**

```bash
# Verificar usuario en BD
npx prisma studio
# Tab: "User"
# Buscar: abogado@defensoria.gob.bo

# Si no existe, crear usuario
# O regenerar seed:
npx prisma db seed
```

### ❌ Error: "element not found: button >> text=/Ingresar/i"

**Solución:**

```bash
# El selector del botón cambió
# Editar helpers.ts con el selector correcto
# Ejecutar en debug mode:
npm run test:e2e:debug -g "Login válido"

# Usar el inspector de Playwright para encontrar selector
```

### ⚠️ Tests se ejecutan lentamente

**Solución:**

```bash
# Aumentar workers (ejecución paralela)
# En playwright.config.ts:
workers: 4 // Cambiar según CPU cores

# O ejecutar:
npx playwright test --workers=4

# Verificar que no hay procesos pesados
ps aux | grep node
```

### ⚠️ Screenshot no se genera en fallo

**Solución:**

```bash
# Crear directorio test-results
mkdir -p test-results

# Verificar permisos
ls -la test-results

# Forzar screenshot
npm run test:e2e:headed
# Verá el fallo en pantalla
```

---

## ✅ CHECKLIST DE ENTREGA

### Build & Compilación

- [ ] Backend build SUCCESS
  ```bash
  cd apps/api && npm run build
  ```

- [ ] Frontend build SUCCESS
  ```bash
  cd apps/web && npm run build
  ```

- [ ] TypeScript: 0 errors
  ```bash
  cd apps/web && npx tsc --noEmit --skipLibCheck
  ```

### Base de Datos

- [ ] BD con seed data
  ```bash
  npx prisma db seed
  ```

- [ ] Casos disponibles en dropdown
- [ ] 5+ casos para testing
- [ ] 30+ registros en tablas

### E2E Tests

- [ ] E2E tests PASS 10+
  ```bash
  npm run test:e2e
  ```

- [ ] Todos los 15+ tests passing
- [ ] Sin timeouts o retries excesivos
- [ ] Reporte HTML generado

### API Endpoints

- [ ] `/legal-tools/discrepancies/analyze` responde
- [ ] `/psychological-tools/indicators/extract` responde
- [ ] `/social-tools/familymap/generate` responde
- [ ] `/transversal-tools/timeline/unified` responde
- [ ] Swagger documentación completa

### Frontend

- [ ] `/tools-demo` page carga
- [ ] 4 pestañas funcionan
- [ ] Selector de casos funciona
- [ ] Botón "Cargar Datos" funciona

### RBAC

- [ ] Usuario ABOGADO accede a Legal Tools
- [ ] Usuario PSICOLOGO accede a Psychological Tools
- [ ] Usuario SOCIAL accede a Social Tools
- [ ] Permisos funcionan correctamente

### Manual Testing

- [ ] ✅ Iniciar API: `npm run start:dev` (apps/api)
- [ ] ✅ Iniciar Frontend: `npm run dev` (apps/web)
- [ ] ✅ Acceder a `/tools-demo`
- [ ] ✅ Login con credenciales
- [ ] ✅ Seleccionar caso
- [ ] ✅ Cargar datos
- [ ] ✅ Ver Legal Tools
- [ ] ✅ Ver Psychological Tools
- [ ] ✅ Ver Social Tools
- [ ] ✅ Ver Transversal Tools
- [ ] ✅ Verificar Swagger: `http://localhost:4000/api/docs`

### Documentación

- [ ] ✅ README actualizado
- [ ] ✅ TESTING_GUIDE_PHASE2.md completo
- [ ] ✅ Comentarios en código
- [ ] ✅ Data-testid en componentes

---

## 📞 SOPORTE

Si tienes problemas:

1. Revisa [Troubleshooting](#troubleshooting)
2. Ejecuta en debug mode: `npm run test:e2e:debug`
3. Revisa logs en terminal
4. Consulta Playwright docs: https://playwright.dev

---

## 📝 NOTAS ADICIONALES

### Ejecución en CI/CD

Para ejecutar en ambiente de CI:

```bash
# GitHub Actions, GitLab CI, etc.
CI=true npm run test:e2e
```

Esto:
- Desactiva reutilización de servidor
- Ejecuta con 1 worker
- Genera reportes
- Retira 2 veces en fallo

### Estructura de Archivos

```
apps/web/
├── e2e/
│   ├── phase2-tools.spec.ts   # Tests principales
│   └── helpers.ts              # Funciones reutilizables
├── playwright.config.ts         # Configuración
├── playwright-report/           # Reportes (generado)
└── test-results/               # Resultados JSON/XML (generado)
```

### Mejor Práctica: Tests Independientes

Cada test es independiente:
- Setup propio (login, navigate)
- No depende de otros tests
- Cleanup automático (logout)
- Puede ejecutarse en cualquier orden

### Debugging Tips

```bash
# Ver qué selectors existen
npm run test:e2e:ui

# Usar console.log en tests
test('Mi test', async ({ page }) => {
  console.log('URL actual:', page.url());
  console.log('HTML:', await page.content());
});

# Ejecutar con más verbosidad
npx playwright test --verbose

# Ver trace de video
npm run test:e2e:report
```

---

**Última actualización:** 2024-02-15
**Versión:** 1.0.0
**Estado:** ✅ Producción Ready

