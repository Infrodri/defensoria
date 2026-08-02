# 🧪 E2E Tests - Phase 2 Tools

Directorio de tests end-to-end para la Fase 2 de herramientas de análisis integrado.

---

## 📁 Estructura de Archivos

```
e2e/
├── phase2-tools.spec.ts    # Tests principales (15+ tests)
├── example.spec.ts         # Ejemplos de best practices
├── helpers.ts              # Funciones reutilizables
└── README.md              # Este archivo
```

---

## 📄 Archivos

### `phase2-tools.spec.ts`

**Archivo principal con todos los tests para Phase 2.**

Contenido:
- ✅ 3 tests de Autenticación & Login
- ✅ 5 tests de Página Demo
- ✅ 3 tests de Herramientas Legales
- ✅ 3 tests de Herramientas Psicológicas
- ✅ 3 tests de Herramientas Sociales
- ✅ 3 tests de Herramientas Transversales
- ✅ 3 tests de RBAC & Permisos
- ✅ 4 tests de Error Handling
- ✅ 2 tests de Integración Completa

**Total: 31 tests**

### `helpers.ts`

**Funciones reutilizables para simplificar tests.**

Funciones:
- `loginUser(page, email, password)` - Login
- `logoutUser(page)` - Logout
- `selectCase(page, caseCode)` - Seleccionar caso
- `clickTab(page, tabName)` - Cambiar pestaña
- `loadToolsData(page)` - Cargar datos
- `navigateToToolsDemo(page)` - Ir a tools-demo
- `waitForLoadingToComplete(page)` - Esperar carga
- `verifyText(page, text)` - Verificar texto
- `isUserAuthenticated(page)` - Verificar auth
- Y 10+ más...

### `example.spec.ts`

**Ejemplos de best practices y patrones de prueba.**

Ejemplos:
- Page navigation
- Network wait patterns
- Tab switching
- Multiple elements verification
- Screenshot on failure
- Error handling
- Data loading with retry
- API response interception

---

## 🚀 Cómo Ejecutar

### Todos los tests

```bash
npm run test:e2e
```

### Interface UI (Recomendado)

```bash
npm run test:e2e:ui
```

### Mode Debug

```bash
npm run test:e2e:debug
```

### Headed (Ver navegador)

```bash
npm run test:e2e:headed
```

### Archivo específico

```bash
npx playwright test e2e/phase2-tools.spec.ts
```

### Test específico

```bash
npx playwright test -g "Login válido"
```

---

## 🔐 Credenciales

```
Email: abogado@defensoria.gob.bo
Password: Password123!
Rol: ABOGADO
```

---

## 📊 Cobertura de Tests

### Autenticación
- ✅ Login válido
- ✅ Logout correcto
- ✅ Acceso denegado sin auth

### Página Demo
- ✅ Carga correctamente
- ✅ Dropdown de casos
- ✅ Selector de pestañas
- ✅ Botón cargar datos
- ✅ Manejo de errores

### Herramientas (4 módulos)
- ✅ Panel renderiza
- ✅ Datos se muestran
- ✅ API responde

### RBAC
- ✅ ABOGADO accede a Legal
- ✅ PSICOLOGO accede a Psychological
- ✅ SOCIAL accede a Social

### Error Handling
- ✅ Mensajes de error
- ✅ Retry funciona
- ✅ Loading spinner
- ✅ Timeout handling

### Integración
- ✅ Flujo completo
- ✅ Todos elementos presentes

---

## 🛠️ Escribir Nuevos Tests

### Template Básico

```typescript
import { test, expect } from '@playwright/test';
import { loginUser, navigateToToolsDemo } from './helpers';

test.describe('Mi Descripción', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, 'abogado@defensoria.gob.bo', 'Password123!');
  });

  test('Mi primer test', async ({ page }) => {
    // Arrange
    await navigateToToolsDemo(page);

    // Act
    await page.click('button:has-text("Cargar Datos")');

    // Assert
    await expect(page.locator('text=/Análisis/i')).toBeVisible();
  });
});
```

### Pattern: Page Object Model

```typescript
// helpers.ts
export async function clickLegalTab(page: Page) {
  await page.click('button:has-text("⚖️ Legal")');
}

export async function verifyLegalPanel(page: Page) {
  await expect(page.locator('text=/Análisis Legal/i')).toBeVisible();
}

// test.spec.ts
import { clickLegalTab, verifyLegalPanel } from './helpers';

test('Legal tab works', async ({ page }) => {
  await clickLegalTab(page);
  await verifyLegalPanel(page);
});
```

### Pattern: Data-Driven Tests

```typescript
const cases = ['CASO-2024-001', 'CASO-2024-002', 'CASO-2024-003'];

for (const caseCode of cases) {
  test(`Process ${caseCode}`, async ({ page }) => {
    await loginUser(page, 'abogado@defensoria.gob.bo', 'Password123!');
    await navigateToToolsDemo(page);
    await selectCase(page, caseCode);
    // ... test logic
  });
}
```

---

## ⚠️ Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3100
lsof -i :3100
kill -9 <PID>
```

### No Cases Available

```bash
# Seed database
npx prisma db seed
```

### Test Timeout

```bash
# Increase timeout
npm run test:e2e:debug

# Or edit playwright.config.ts:
timeout: 60000
```

### Element Not Found

```bash
# Debug with UI
npm run test:e2e:ui

# Use inspector to find selector
```

---

## 📚 Best Practices

### ✅ DO

- ✅ Use helper functions
- ✅ Make tests independent
- ✅ Use explicit waits
- ✅ Add meaningful assertions
- ✅ Handle errors gracefully
- ✅ Keep tests readable
- ✅ Use data-testid when needed

### ❌ DON'T

- ❌ Use arbitrary timeouts
- ❌ Make tests depend on order
- ❌ Skip error handling
- ❌ Hardcode selectors
- ❌ Test implementation details
- ❌ Make tests too long
- ❌ Use random data

---

## 🔗 Recursos

- [Playwright Docs](https://playwright.dev)
- [Test Patterns](https://playwright.dev/docs/test-advanced)
- [Locators](https://playwright.dev/docs/locators)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

## 📈 Reportes

### HTML Report

```bash
npm run test:e2e:report
```

### JSON Report

Ubicación: `test-results/results.json`

### JUnit XML

Ubicación: `test-results/results.xml`

---

## 🎯 Próximos Pasos

1. [ ] Ejecutar: `npm run test:e2e`
2. [ ] Verificar: Todos los tests PASS
3. [ ] Revisar: Reporte HTML
4. [ ] Documentar: Casos especiales encontrados

---

**Creado:** 2024-02-15
**Versión:** 1.0.0
**Status:** ✅ Ready for Production
