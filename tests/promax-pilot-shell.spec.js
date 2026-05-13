const { test, expect } = require('@playwright/test');
const { openRoute, labState, layoutOverflow } = require('./simulation-test-utils');

const PILOT_ROUTES = ['ch1-2-3', 'ch1-5-3', 'ch2-1-2', 'ch2-5-2', 'ch3-3-1', 'ch3-6-2'];
const GRAPH_ROUTES = [
  { route: 'ch2-1-2', text: /x\/v\/a|mẫu/ },
  { route: 'ch3-3-1', text: /năng lượng|E|mẫu/ },
  { route: 'ch3-6-2', text: /động lượng|trước|sau/ },
];

for (const route of PILOT_ROUTES) {
  test(`promax pilot keeps invariant metadata without extra controls for ${route} @promax`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openRoute(page, route);
    const lab = page.locator('.sim-container.sim-lab');
    await expect(lab).toHaveAttribute('data-promax-level', 'pilot');
    await expect(lab).toHaveAttribute('data-invariant-status', /pass|warn|fail/);
    await expect(lab).toHaveAttribute('data-diagnostics-visible', 'false');
    await expect(page.locator('.sim-promax-diagnostics button')).toHaveCount(0);
    await expect(page.locator('.sim-promax-mode button')).toHaveCount(0);
    await expect(page.locator('.sim-promax-invariant')).toBeHidden();
    await expect(page.locator('.sim-promax-readout')).toBeHidden();
    await expect(page.locator('.sim-promax-graph')).toBeHidden();
    await expect(page.locator('.sim-promax-challenge')).toBeHidden();
    expect(await layoutOverflow(page)).toBeLessThanOrEqual(1);
    expect((await labState(page)).visibleText).not.toContain('Thành phần');
    expect((await labState(page)).visibleText).not.toContain('Kiểm tra');
  });
}

for (const item of GRAPH_ROUTES) {
  test(`promax mini graph summary stays hidden for ${item.route} @promax`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openRoute(page, item.route);
    const graph = page.locator('.sim-promax-graph');
    await expect(graph).toBeHidden();
    await expect(graph).toHaveAttribute('data-graph-route', item.route);
    expect(await layoutOverflow(page)).toBeLessThanOrEqual(1);
  });
}
