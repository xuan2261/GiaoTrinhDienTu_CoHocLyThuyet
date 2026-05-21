const { test, expect } = require('@playwright/test');
const { openRoute } = require('../simulation-test-utils');
const { DECUONG_SHELL_ROUTES } = require('../sim-review-2026-05-19-fixtures');

test.describe('sim review DeCuong shell mount', () => {
  for (const route of DECUONG_SHELL_ROUTES) {
    test(`${route} mounts exactly one DeCuong sim header without wrapper overlay`, async ({ page }) => {
      await openRoute(page, route);
      const shell = await page.locator('.content-area').evaluate(() => ({
        simHeaders: document.querySelectorAll('.content-area .sim-container.sim-lab .sim-header').length,
        plainSimContainers: [...document.querySelectorAll('.content-area .sim-container')]
          .filter(node => !node.classList.contains('sim-lab')).length,
        routeTitles: [...document.querySelectorAll('.content-area h1, .content-area h2, .content-area .sim-title')]
          .map(node => (node.textContent || '').trim())
          .filter(Boolean),
      }));
      // RED until P03 if a route fragment overlays old DeCuong header around the mounted lab.
      expect(shell.simHeaders).toBe(1);
      expect(shell.plainSimContainers).toBe(0);
      expect(shell.routeTitles.filter(text => text.includes(route)).length).toBe(1);
    });
  }
});
