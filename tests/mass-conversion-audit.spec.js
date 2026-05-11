const { test, expect } = require('@playwright/test');
const { ALL_ROUTES, openRoute, relevantConsoleErrors } = require('./simulation-test-utils');

/**
 * Phase 05: Mass QA Audit
 * Verifies all V2 routes load without crashes, 404s, or visual glitches.
 */
test.describe('V2 Mass Conversion Audit', () => {
  
  for (const routeId of ALL_ROUTES) {
    test(`route ${routeId} should load without console errors`, async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
          consoleMessages.push(text);
        }
      });

      await openRoute(page, routeId, { url: `http://127.0.0.1:8080/index.html#${routeId}` });
      
      // Wait for simulation container to appear
      await expect(page.locator('.sim-viewport-v2')).toBeVisible({ timeout: 5000 });
      
      const filteredErrors = relevantConsoleErrors(consoleMessages);
      if (filteredErrors.length > 0) {
        throw new Error(`Console errors found in ${routeId}:\n${filteredErrors.join('\n')}`);
      }
      
      // Basic sanity check: ensure canvas is present
      await expect(page.locator('svg.sim-svg-v2, canvas, .sim-viewport-v2 h2').first()).toBeVisible();
    });
  }
});
