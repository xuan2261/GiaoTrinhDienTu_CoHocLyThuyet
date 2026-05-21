const { test, expect } = require('@playwright/test');
const { openRoute } = require('../simulation-test-utils');
const { EMPTY_PANEL_ROUTES, AUTOPLAY_PREVIEW_ROUTES } = require('../sim-review-2026-05-19-fixtures');

test.describe('sim review empty panel hints', () => {
  for (const route of EMPTY_PANEL_ROUTES) {
    test(`${route} starts with non-empty inspector hint`, async ({ page }) => {
      await openRoute(page, route);
      const hint = await page.locator('.sim-lab-hint').first().innerText();
      // RED until P06 for routes whose right inspector has no useful default guidance.
      expect(hint.trim().length, `${route} hint`).toBeGreaterThan(24);
    });
  }

  for (const route of AUTOPLAY_PREVIEW_ROUTES) {
    test(`${route} declares preview-pause autoplay metadata`, async ({ page }) => {
      await openRoute(page, route);
      const autoplay = await page.locator('.sim-container.sim-lab').first().evaluate(lab => {
        const scene = window.SimSceneRegistry?.get?.(lab.getAttribute('data-route-id'));
        return scene?.autoplay || null;
      });
      // RED until P06: empty dynamic scenes should preview briefly, then pause.
      expect(autoplay).toMatchObject({ mode: 'preview-pause' });
      expect(autoplay.frames).toBeGreaterThan(0);
    });
  }
});
