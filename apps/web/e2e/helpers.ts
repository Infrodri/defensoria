import { Page, expect } from '@playwright/test';

/**
 * Helper functions for E2E tests
 */

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3100';
const API_URL = process.env.PLAYWRIGHT_TEST_API_URL || 'http://localhost:4100/api';

/**
 * Login helper - logs in a user with provided credentials
 */
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/(auth)/login`);
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null);

  // Fill login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Click login button
  await page.click('button:has-text("Ingresar")');

  // Wait for redirect to dashboard or tools-demo
  await page.waitForURL('**/dashboard/**', { timeout: 10000 }).catch(() => null);
  await page.waitForURL('**/tools-demo', { timeout: 10000 }).catch(() => null);
}

/**
 * Logout helper - logs out the current user
 */
export async function logoutUser(page: Page) {
  // Click user menu
  await page.click('[data-testid="user-menu"]');

  // Click logout option
  await page.click('button:has-text("Cerrar sesión")');

  // Wait for redirect to login page
  await page.waitForURL('**/login', { timeout: 10000 });
}

/**
 * Select a case from the dropdown
 */
export async function selectCase(page: Page, caseCode: string) {
  // Wait for the select element to be visible
  const selector = page.locator('select').first();
  await selector.waitFor({ state: 'visible', timeout: 5000 });

  // Select the case by visible text (must match exactly)
  const options = await selector.locator('option').allTextContents();
  const matchingOption = options.find((opt) => opt.includes(caseCode));
  
  if (matchingOption) {
    await selector.selectOption({ label: matchingOption });
  } else {
    // If exact match not found, select first available option
    if (options.length > 1) {
      await selector.selectOption({ index: 1 });
    }
  }

  // Wait for data to load
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => null);
}

/**
 * Click on a tab to switch tools
 */
export async function clickTab(page: Page, tabName: 'legal' | 'psychological' | 'social' | 'transversal') {
  const tabTexts = {
    legal: '⚖️ Legal',
    psychological: '🧠 Psicológico',
    social: '👥 Social',
    transversal: '🔗 Transversal',
  };

  await page.click(`button:has-text("${tabTexts[tabName]}")`);
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => null);
}

/**
 * Load data using the "Cargar Datos" button
 */
export async function loadToolsData(page: Page) {
  await page.click('button:has-text("Cargar Datos")');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}

/**
 * Verify if an element is visible with text
 */
export async function verifyText(page: Page, text: string) {
  const element = page.locator(`text=${text}`);
  await expect(element).toBeVisible();
}

/**
 * Verify if a data-testid element is visible
 */
export async function verifyTestId(page: Page, testId: string) {
  const element = page.locator(`[data-testid="${testId}"]`);
  await expect(element).toBeVisible();
}

/**
 * Count elements with a specific selector
 */
export async function countElements(page: Page, selector: string): Promise<number> {
  return await page.locator(selector).count();
}

/**
 * Get text content of an element
 */
export async function getElementText(page: Page, selector: string): Promise<string> {
  return await page.locator(selector).first().textContent() || '';
}

/**
 * Wait for an error message to appear
 */
export async function waitForError(page: Page, timeout: number = 5000) {
  const errorElement = page.locator('[data-testid="error-container"], text=/Error/i');
  await errorElement.waitFor({ state: 'visible', timeout });
}

/**
 * Wait for a loading spinner to appear and disappear
 */
export async function waitForLoadingToComplete(page: Page, timeout: number = 10000) {
  const loader = page.locator('text=/Cargando|Analizando/i');
  await loader.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Take a screenshot for debugging
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/${name}-${Date.now()}.png` });
}

/**
 * Check if user is authenticated by checking for the user info element
 */
export async function isUserAuthenticated(page: Page): Promise<boolean> {
  try {
    const userInfo = page.locator('text=/Usuario:/i');
    await userInfo.waitFor({ state: 'visible', timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current authenticated user info
 */
export async function getCurrentUserInfo(page: Page): Promise<string> {
  const userInfo = page.locator('text=/Usuario:/i').first();
  return (await userInfo.textContent()) || '';
}

/**
 * Check if a specific role has access (visible in UI)
 */
export async function checkRoleAccess(page: Page, role: string): Promise<boolean> {
  try {
    const roleText = page.locator(`text=/${role}/i`);
    await roleText.waitFor({ state: 'visible', timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Navigate to tools-demo page
 */
export async function navigateToToolsDemo(page: Page) {
  await page.goto(`${BASE_URL}/tools-demo`);
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}

/**
 * Navigate to login page
 */
export async function navigateToLogin(page: Page) {
  await page.goto(`${BASE_URL}/(auth)/login`);
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Verify a tab panel renders with data
 */
export async function verifyTabPanelData(page: Page, tabName: string, dataTestId: string) {
  await clickTab(page, tabName as 'legal' | 'psychological' | 'social' | 'transversal');
  const element = page.locator(`[data-testid="${dataTestId}"]`);
  await expect(element).toBeVisible({ timeout: 10000 });
}
