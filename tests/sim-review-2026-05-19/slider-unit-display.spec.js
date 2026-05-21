const { test, expect } = require('@playwright/test');
const { openRoute } = require('../simulation-test-utils');
const { S1_SLIDER_UNIT_ROUTES } = require('../sim-review-2026-05-19-fixtures');

test.describe('sim review 2026-05-19 slider unit display', () => {
  for (const route of S1_SLIDER_UNIT_ROUTES) {
    test(`${route} slider UI does not expose pixel units`, async ({ page }) => {
      await openRoute(page, route);
      const controls = await page.locator('.sim-controls').first().innerText();
      // RED until P04: learner-facing controls must use physical units, never px.
      expect(controls, `${route} controls`).not.toMatch(/px\b/i);
    });
  }
});
