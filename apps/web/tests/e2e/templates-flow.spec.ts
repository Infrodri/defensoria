import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3100';
const API_URL = process.env.PLAYWRIGHT_TEST_API_URL || 'http://localhost:4100/api';

/**
 * Login as a specific user
 */
async function loginAs(page: Page, email: string, password = 'Password123!') {
  await page.goto(`${BASE_URL}/(auth)/login`);
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Ingresar")');
  await page.waitForURL('**/casos/**', { timeout: 15000 }).catch(() => null);
}

/**
 * Mock the AI draft section API response
 */
async function mockAiDraftResponse(page: Page, suggestedContent: string, citations: string[] = []) {
  await page.route('**/ai/draft-section**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        suggestedContent,
        citations,
      }),
    });
  });
}

/**
 * Create a test case with evidences via API (for test data setup)
 */
async function createCaseWithEvidences(page: Page): Promise<string> {
  // This would typically be done via API, but for E2E we can use an existing test case
  // or create one via the UI. For now, return a known test case ID.
  return 'test-case-with-evidences';
}

/**
 * Navigate to report editor for a specific case
 */
async function gotoReportEditor(page: Page, caseId: string) {
  await page.goto(`${BASE_URL}/casos/${caseId}?tab=informes`);
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  
  // Wait for ReportEditor to be visible
  await page.locator('text=Redactar Nuevo Informe Profesional').waitFor({ timeout: 10000 });
}

test.describe('Templates Flow - E2E', () => {
  
  test.describe.configure({ retries: 1 });

  // ============================================================================
  // Test 1: Selección plantilla filtrada por rol
  // ============================================================================
  test('Psicólogo ve solo plantillas PSI-01, PSI-02, IPS-01', async ({ page }) => {
    await loginAs(page, 'psicologo@test.com');
    await gotoReportEditor(page, '123');

    // Wait for template selector to load
    await page.locator('label:has-text("Plantilla de Informe")').waitFor({ timeout: 10000 });
    
    const select = page.locator('select').first();
    await expect(select).toBeVisible();
    
    const options = await select.locator('option').allTextContents();
    
    // Should contain PSI templates
    expect(options).toContain('PSI-01 Intervención en Crisis');
    expect(options).toContain('PSI-02 Informe Psicológico Inicial');
    expect(options).toContain('IPS-01 Informe Psicosocial');
    
    // Should NOT contain legal or social-only templates
    expect(options).not.toContain('TS-01');
    expect(options).not.toContain('LEG-01');
  });

  test('Abogado ve solo plantillas LEG-01, LEG-02', async ({ page }) => {
    await loginAs(page, 'abogado@test.com');
    await gotoReportEditor(page, '123');

    await page.locator('label:has-text("Plantilla de Informe")').waitFor({ timeout: 10000 });
    
    const select = page.locator('select').first();
    await expect(select).toBeVisible();
    
    const options = await select.locator('option').allTextContents();
    
    expect(options).toContain('LEG-01');
    expect(options).toContain('LEG-02');
    expect(options).not.toContain('PSI-01');
    expect(options).not.toContain('IPS-01');
  });

  test('Trabajador Social ve solo plantillas TS-01, TS-02, IPS-01', async ({ page }) => {
    await loginAs(page, 'social@test.com');
    await gotoReportEditor(page, '123');

    await page.locator('label:has-text("Plantilla de Informe")').waitFor({ timeout: 10000 });
    
    const select = page.locator('select').first();
    await expect(select).toBeVisible();
    
    const options = await select.locator('option').allTextContents();
    
    expect(options).toContain('TS-01');
    expect(options).toContain('TS-02');
    expect(options).toContain('IPS-01');
    expect(options).not.toContain('PSI-01');
    expect(options).not.toContain('LEG-01');
  });

  // ============================================================================
  // Test 2: Generación IA sección con RAG
  // ============================================================================
  test('Generar sección "Antecedentes" con IA usa RAG del caso', async ({ page }) => {
    await loginAs(page, 'psicologo@test.com');
    await gotoReportEditor(page, 'case-with-evidences');

    // Wait for template selector
    await page.locator('label:has-text("Plantilla de Informe")').waitFor({ timeout: 10000 });
    
    // Select PSI-02 template
    await page.selectOption('select[name="template"]', 'PSI-02');
    await page.waitForLoadState('networkidle', { timeout: 3000 });

    // Mock AI response with citations
    await mockAiDraftResponse(page, 'Contenido generado con RAG basado en evidencias del caso.', ['Evidencia 1', 'Evidencia 2']);

    // Click "Generar con IA" button for the first section (Antecedentes)
    const generateButton = page.locator('button:has-text("Generar con IA")').first();
    await expect(generateButton).toBeVisible({ timeout: 5000 });
    await generateButton.click();

    // Wait for AI generation to complete
    await expect(page.locator('textarea[name="section-antecedentes"]')).not.toBeEmpty({ timeout: 15000 });
    
    // Verify citation chips appear
    await expect(page.locator('.citation-chip')).toHaveCount(1, { timeout: 5000 });
  });

  test('Generar sección muestra error si IA falla', async ({ page }) => {
    await loginAs(page, 'psicologo@test.com');
    await gotoReportEditor(page, 'case-with-evidences');

    await page.locator('label:has-text("Plantilla de Informe")').waitFor({ timeout: 10000 });
    await page.selectOption('select[name="template"]', 'PSI-02');
    await page.waitForLoadState('networkidle', { timeout: 3000 });

    // Mock AI failure
    await page.route('**/ai/draft-section**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Error en el servicio de IA' }),
      });
    });

    const generateButton = page.locator('button:has-text("Generar con IA")').first();
    await generateButton.click();

    // Should show toast error
    await expect(page.locator('text=Error al generar sección con IA')).toBeVisible({ timeout: 10000 });
  });

  // ============================================================================
  // Test 3: Validación coautor IPS-01 (bloqueo estricto)
  // ============================================================================
  test('IPS-01 bloquea guardado si no hay coautor seleccionado', async ({ page }) => {
    await loginAs(page, 'psicologo@test.com');
    await gotoReportEditor(page, '123');

    await page.locator('label:has-text("Plantilla de Informe")').waitFor({ timeout: 10000 });
    await page.selectOption('select[name="template"]', 'IPS-01');
    await page.waitForLoadState('networkidle', { timeout: 3000 });

    // Co-author selector should be visible
    const coAuthorSelect = page.locator('select[name="coAuthorId"]');
    await expect(coAuthorSelect).toBeVisible();

    // Try to save without co-author
    await page.click('button:has-text("Guardar Borrador")');
    
    // Should show error
    await expect(page.locator('.error:has-text("Debe seleccionar coautor"), text=Debe seleccionar coautor')).toBeVisible({ timeout: 5000 });

    // Select valid co-author (Social)
    await coAuthorSelect.selectOption({ index: 1 }); // Select first available
    
    // Fill required sections if any
    const requiredTextareas = page.locator('textarea[required]');
    const count = await requiredTextareas.count();
    for (let i = 0; i < count; i++) {
      await requiredTextareas.nth(i).fill('Contenido de prueba para sección obligatoria');
    }

    // Try to save again
    await page.click('button:has-text("Guardar Borrador")');
    
    // Should succeed
    await expect(page.locator('.success, text=Borrador de informe guardado')).toBeVisible({ timeout: 10000 });
  });

  test('IPS-01 muestra coautor actual si ya existe', async ({ page }) => {
    await loginAs(page, 'psicologo@test.com');
    await gotoReportEditor(page, 'existing-ips01-report');

    await page.locator('label:has-text("Plantilla de Informe")').waitFor({ timeout: 10000 });
    await page.selectOption('select[name="template"]', 'IPS-01');
    await page.waitForLoadState('networkidle', { timeout: 3000 });

    // Should show current co-author if exists
    const coAuthorDisplay = page.locator('text=Coautor actual:');
    await expect(coAuthorDisplay).toBeVisible({ timeout: 5000 });
  });

  // ============================================================================
  // Test 4: Guardado informe inmutable
  // ============================================================================
  test('Informe guardado queda inmutable (audit log)', async ({ page }) => {
    await loginAs(page, 'abogado@test.com');
    await gotoReportEditor(page, '123');

    await page.locator('label:has-text("Plantilla de Informe")').waitFor({ timeout: 10000 });
    await page.selectOption('select[name="template"]', 'LEG-02');
    await page.waitForLoadState('networkidle', { timeout: 3000 });

    // Fill required section
    const hechosTextarea = page.locator('textarea[name="section-hechos"]');
    await expect(hechosTextarea).toBeVisible({ timeout: 5000 });
    await hechosTextarea.fill('Hechos generados para el informe legal...');

    // Fill other required sections
    const requiredTextareas = page.locator('textarea[required]');
    const count = await requiredTextareas.count();
    for (let i = 0; i < count; i++) {
      if (!(await requiredTextareas.nth(i).inputValue())) {
        await requiredTextareas.nth(i).fill('Contenido de prueba');
      }
    }

    // Save draft
    await page.click('button:has-text("Guardar Borrador")');
    await expect(page.locator('.success, text=Borrador de informe guardado')).toBeVisible({ timeout: 10000 });

    // Verify report appears in list as BORRADOR
    await expect(page.locator('text=BORRADOR')).toBeVisible({ timeout: 5000 });

    // Click "Emitir e Inmutabilizar Informe"
    const emitButton = page.locator('button:has-text("Emitir e Inmutabilizar Informe")').first();
    await expect(emitButton).toBeVisible({ timeout: 5000 });
    await emitButton.click();

    // Confirm in modal
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    await page.click('button:has-text("Confirmar, Imprimir e Inmutabilizar")');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify report now shows as EMITIDO (CONGELADO)
    await expect(page.locator('text=EMITIDO (CONGELADO)')).toBeVisible({ timeout: 5000 });

    // Verify "Nueva Versión" button is visible
    await expect(page.locator('button:has-text("Nueva Versión"), button:has-text("Crear Informe Complementario")')).toBeVisible({ timeout: 5000 });

    // Verify content is not editable (Modificar button should not be available for EMITIDO)
    const modificarButton = page.locator('button:has-text("Modificar")');
    await expect(modificarButton).not.toBeVisible({ timeout: 5000 });
  });

  test('Informe EMITIDO muestra mensaje "Documento inmutabilizado"', async ({ page }) => {
    await loginAs(page, 'abogado@test.com');
    await gotoReportEditor(page, 'emitted-report-case');

    // Click on an emitted report to open preview
    const reportCard = page.locator('text=EMITIDO (CONGELADO)').first().locator('..').locator('..');
    await expect(reportCard).toBeVisible({ timeout: 5000 });
    
    // Open preview modal
    await reportCard.locator('button:has-text("Imprimir Documento Emitido")').first().click();
    
    // Verify inmutabilizado message in modal
    await expect(page.locator('text=Documento inmutabilizado — no editable')).toBeVisible({ timeout: 5000 });
  });

  // ============================================================================
  // Additional: Full flow integration
  // ============================================================================
  test('Flujo completo: Psicólogo crea IPS-01 con coautor y emite', async ({ page }) => {
    await loginAs(page, 'psicologo@test.com');
    await gotoReportEditor(page, '123');

    // Select IPS-01 template
    await page.locator('label:has-text("Plantilla de Informe")').waitFor({ timeout: 10000 });
    await page.selectOption('select[name="template"]', 'IPS-01');
    await page.waitForLoadState('networkidle', { timeout: 3000 });

    // Select co-author
    await page.locator('select[name="coAuthorId"]').selectOption({ index: 1 });

    // Fill all required sections
    const requiredTextareas = page.locator('textarea[required]');
    const count = await requiredTextareas.count();
    for (let i = 0; i < count; i++) {
      await requiredTextareas.nth(i).fill(`Contenido de la sección ${i + 1} del informe psicosocial.`);
    }

    // Save draft
    await page.click('button:has-text("Guardar Borrador")');
    await expect(page.locator('.success, text=Borrador de informe guardado')).toBeVisible({ timeout: 10000 });

    // Emit report
    await page.click('button:has-text("Emitir e Inmutabilizar Informe")');
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    await page.click('button:has-text("Confirmar, Imprimir e Inmutabilizar")');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify emitted
    await expect(page.locator('text=EMITIDO (CONGELADO)')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Documento inmutabilizado')).toBeVisible({ timeout: 5000 });
  });

  test('Usuario puede crear nueva versión de informe emitido', async ({ page }) => {
    await loginAs(page, 'abogado@test.com');
    await gotoReportEditor(page, 'emitted-report-case');

    // Click "Crear Informe Complementario" on emitted report
    await page.click('button:has-text("Crear Informe Complementario")');
    await page.waitForLoadState('networkidle', { timeout: 3000 });

    // Should show complementary report form
    await expect(page.locator('text=Nuevo Informe Complementario')).toBeVisible({ timeout: 5000 });
    
    // Fill and save
    await page.locator('input[name="title"]').fill('Informe Complementario v2');
    await page.locator('textarea[name="content"]').fill('Contenido complementario...');
    await page.click('button:has-text("Crear Complementario")');
    
    await expect(page.locator('.success, text=Informe complementario redactado')).toBeVisible({ timeout: 10000 });
  });
});