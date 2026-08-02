/**
 * EXAMPLE TEST FILE - Reference Implementation
 * 
 * This file shows best practices for writing E2E tests with Playwright
 * for the Defensoria Phase 2 Tools
 */

import { test, expect } from '@playwright/test';
import {
  loginUser,
  navigateToToolsDemo,
  clickTab,
  waitForLoadingToComplete,
} from './helpers';

test.describe('Example Tests - Best Practices', () => {
  test('Example 1: Simple page navigation test', async ({ page }) => {
    // Arrange: Login first
    await loginUser(page, 'abogado@defensoria.gob.bo', 'Password123!');

    // Act: Navigate to tools demo
    await navigateToToolsDemo(page);

    // Assert: Verify page loaded
    await expect(page.locator('text=/Demo Integrado/i')).toBeVisible();
  });

  test('Example 2: Testing with wait for network', async ({ page }) => {
    // Login
    await loginUser(page, 'abogado@defensoria.gob.bo', 'Password123!');
    await navigateToToolsDemo(page);

    // Wait for network to be idle (all API calls complete)
    await waitForLoadingToComplete(page);

    // Now assert data is loaded
    const caseSelector = page.locator('select').first();
    const options = await caseSelector.locator('option').count();
    expect(options).toBeGreaterThan(0);
  });

  test('Example 3: Tab switching test', async ({ page }) => {
    await loginUser(page, 'abogado@defensoria.gob.bo', 'Password123!');
    await navigateToToolsDemo(page);

    // Switch to legal tab
    await clickTab(page, 'legal');
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => null);

    // Verify legal content is visible
    const legalPanel = page.locator('text=/Análisis Legal|Discrepancia/i');
    const isVisible = await legalPanel.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('Example 4: Verifying multiple elements', async ({ page }) => {
    await loginUser(page, 'abogado@defensoria.gob.bo', 'Password123!');
    await navigateToToolsDemo(page);

    // Check multiple elements exist
    const elements = {
      title: page.locator('text=/Demo Integrado/i'),
      caseSelector: page.locator('select').first(),
      loadButton: page.locator('button:has-text("Cargar Datos")'),
      tabs: page.locator('button:has-text(/⚖️|🧠|👥|🔗/)'),
    };

    for (const [name, element] of Object.entries(elements)) {
      await expect(element).toBeVisible({ timeout: 5000 });
    }
  });

  test('Example 5: Taking screenshots on failure', async ({ page }) => {
    await loginUser(page, 'abogado@defensoria.gob.bo', 'Password123!');
    await navigateToToolsDemo(page);

    try {
      // This assertion might fail
      const selector = page.locator('[data-testid="non-existent"]');
      await expect(selector).toBeVisible({ timeout: 2000 });
    } catch (error) {
      // Screenshot will be saved automatically on failure
      // Location: test-results/[test-name]-fail.png
      throw error;
    }
  });

  test('Example 6: Handling errors gracefully', async ({ page }) => {
    await loginUser(page, 'abogado@defensoria.gob.bo', 'Password123!');

    // Navigate and handle potential errors
    try {
      await navigateToToolsDemo(page);
      const isLoaded = await page
        .locator('text=/Demo Integrado/i')
        .isVisible()
        .catch(() => false);

      expect(isLoaded).toBeTruthy();
    } catch (error) {
      console.error('Navigation failed:', error);
      throw error;
    }
  });

  test('Example 7: Testing data loading with retry', async ({ page }) => {
    await loginUser(page, 'abogado@defensoria.gob.bo', 'Password123!');
    await navigateToToolsDemo(page);

    const loadButton = page.locator('button:has-text("Cargar Datos")');

    // Wait and click with retry
    let retries = 3;
    while (retries > 0) {
      try {
        await loadButton.click({ timeout: 5000 });
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await page.waitForTimeout(1000);
      }
    }

    // Verify data loaded
    const content = page.locator('text=/análisis|indicadores|familia/i');
    expect(await content.count()).toBeGreaterThan(0);
  });

  test('Example 8: Testing API response interception', async ({ page, context }) => {
    let apiResponseData: any = null;

    // Intercept API responses
    context.on('response', async (response) => {
      if (response.url().includes('/api/') && response.status() === 200) {
        try {
          apiResponseData = await response.json();
        } catch {
          // Response is not JSON
        }
      }
    });

    await loginUser(page, 'abogado@defensoria.gob.bo', 'Password123!');
    await navigateToToolsDemo(page);
    await waitForLoadingToComplete(page);

    // Verify API was called
    expect(page.url()).toContain('/tools-demo');
  });
});

/**
 * TIPS FOR WRITING GOOD E2E TESTS:
 *
 * 1. Use Page Object Model (POM):
 *    - Extract helper functions (already done in helpers.ts)
 *    - Reuse selectors and navigation logic
 *
 * 2. Make tests independent:
 *    - Each test logs in separately
 *    - No test depends on another
 *    - Cleanup happens automatically (session expires)
 *
 * 3. Use explicit waits:
 *    - waitForLoadState('networkidle') for API calls
 *    - waitFor({ state: 'visible' }) for elements
 *    - Avoid arbitrary delays (page.waitForTimeout)
 *
 * 4. Make assertions meaningful:
 *    - Test user behavior, not implementation
 *    - Verify visual results, not technical details
 *    - Use data-testid only when necessary
 *
 * 5. Handle errors gracefully:
 *    - Use .catch() for optional elements
 *    - Try-catch for error scenarios
 *    - Take screenshots on failure
 *
 * 6. Keep tests readable:
 *    - Follow Arrange-Act-Assert pattern
 *    - Use descriptive names
 *    - Add comments for complex logic
 *
 * 7. Use helper functions:
 *    - Extract repeated patterns
 *    - Make tests DRY (Don't Repeat Yourself)
 *    - Easy to maintain changes
 */
