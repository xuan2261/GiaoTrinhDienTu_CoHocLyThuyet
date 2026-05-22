const { test, expect } = require('@playwright/test');
const { MOUNTABLE_ROUTES, openRoute, relevantConsoleErrors } = require('./simulation-test-utils');

/**
 * Phase 05: Mass QA Audit
 * Verifies all V2 routes load without crashes, 404s, or visual glitches.
 */
test.describe('V2 Mass Conversion Audit', () => {
  
  for (const routeId of MOUNTABLE_ROUTES) {
    test(`route ${routeId} should load without console errors`, async ({ page }) => {
      const consoleMessages = [];
      page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
          consoleMessages.push(text);
        }
      });

      await openRoute(page, routeId);
      
      // Wait for simulation container to appear (legacy shell or V2 viewport)
      await expect(page.locator('.sim-container.sim-lab, .sim-viewport-v2').first()).toBeVisible({ timeout: 5000 });
      
      const filteredErrors = relevantConsoleErrors(consoleMessages);
      if (filteredErrors.length > 0) {
        throw new Error(`Console errors found in ${routeId}:\n${filteredErrors.join('\n')}`);
      }
      
      // Basic sanity check: ensure visual root is present
      await expect(page.locator('.sim-container.sim-lab canvas, svg.sim-svg-v2, .sim-viewport-v2 h2').first()).toBeVisible();
    });
  }
});
