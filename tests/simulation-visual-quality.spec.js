const { test, expect } = require('@playwright/test');

const {
  ALL_ROUTES,
  EXPECTED_ROUTE_COUNT,
  MOUNTABLE_ROUTES,
  EXPECTED_MOUNTABLE_ROUTE_COUNT,
  openRoute,
  labState,
  canvasStats,
  setTheme,
  layoutOverflow,
} = require('./simulation-test-utils');

const DETACHED_DEFAULT_COORDINATE = '(190; 255)';

async function contrastSnapshot(page) {
  return page.locator('.sim-container.sim-lab').first().evaluate(lab => {
    function rgb(value) {
      const match = String(value).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return match ? match.slice(1, 4).map(Number) : [0, 0, 0];
    }
    function luminance(color) {
      return rgb(color).map(channel => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    }
    function contrast(fg, bg) {
      const a = luminance(fg);
      const b = luminance(bg);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    }
    const style = node => getComputedStyle(node);
    const card = lab.querySelector('.sim-readout-card');
    const value = lab.querySelector('.sim-readout-value');
    const title = lab.querySelector('.sim-title');
    return {
      titleContrast: contrast(style(title).color, style(lab).backgroundColor),
      valueContrast: contrast(style(value).color, style(card).backgroundColor),
    };
  });
}

test(`visual route discovery uses ${EXPECTED_ROUTE_COUNT} canonical manifest routes @visual-quality`, async () => {
  expect(ALL_ROUTES).toHaveLength(EXPECTED_ROUTE_COUNT);
  expect(new Set(ALL_ROUTES).size).toBe(EXPECTED_ROUTE_COUNT);
});

test(`all ${EXPECTED_MOUNTABLE_ROUTE_COUNT} mountable route canvases are nonblank, bounded, and route-owned @visual-all`, async ({ page }) => {
  test.setTimeout(180000);
  const failures = [];
  for (const route of MOUNTABLE_ROUTES) {
    await openRoute(page, route);
    await setTheme(page, 'light');
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await page.waitForTimeout(100);
    const state = await labState(page);
    const metrics = await canvasStats(page);
    if (metrics.ink <= 300) failures.push(`${route}: blank/low ink`);
    if (Math.max(metrics.edge.left, metrics.edge.right, metrics.edge.top, metrics.edge.bottom) > 140) {
      failures.push(`${route}: excessive edge ink ${JSON.stringify(metrics.edge)}`);
    }
    if (!state.handleIds.length) failures.push(`${route}: missing route-owned handle`);
    if (state.handleIds.includes('legacy-primary')) failures.push(`${route}: legacy-primary handle`);
    if (state.rendererId.startsWith('missing-renderer')) failures.push(`${route}: missing renderer`);
    if (state.behaviorId.startsWith('legacy:')) failures.push(`${route}: legacy behavior`);
    if (state.visibleText.includes('Cảnh dự phòng')) failures.push(`${route}: fallback scene text`);
    if ((route.startsWith('ch2-') || route.startsWith('ch3-')) && state.visibleText.includes(DETACHED_DEFAULT_COORDINATE)) {
      failures.push(`${route}: detached default coordinate`);
    }
  }
  expect(failures).toEqual([]);
});

test(`renderer, behavior, and scene identities are unique across ${EXPECTED_MOUNTABLE_ROUTE_COUNT} mountable routes @renderer-contract @scene-identity`, async ({ page }) => {
  test.setTimeout(180000);
  const seenRendererIds = new Map();
  const seenBehaviorIds = new Map();
  const seenStructures = new Map();
  const failures = [];
  for (const route of MOUNTABLE_ROUTES) {
    await openRoute(page, route);
    const state = await labState(page);
    if (state.routeId !== route) failures.push(`${route}: route metadata mismatch`);
    if (!state.rendererId) failures.push(`${route}: missing rendererId`);
    if (!state.behaviorId) failures.push(`${route}: missing behaviorId`);
    if (state.structuralMarks.length < 4) failures.push(`${route}: insufficient structural marks`);
    if (state.structuralMarks.some(mark => mark.startsWith('frame:'))) failures.push(`${route}: common frame mark leaked`);
    if (seenRendererIds.has(state.rendererId)) failures.push(`${route}: duplicate rendererId with ${seenRendererIds.get(state.rendererId)}`);
    if (seenBehaviorIds.has(state.behaviorId)) failures.push(`${route}: duplicate behaviorId with ${seenBehaviorIds.get(state.behaviorId)}`);
    const structure = state.structuralMarks.join('|');
    if (seenStructures.has(structure)) failures.push(`${route}: duplicate structure with ${seenStructures.get(structure)}`);
    seenRendererIds.set(state.rendererId, route);
    seenBehaviorIds.set(state.behaviorId, route);
    seenStructures.set(structure, route);
  }
  expect(failures).toEqual([]);
});

test('all routes keep readable dark/light shell and no responsive overflow @theme-all', async ({ page }) => {
  test.setTimeout(180000);
  const failures = [];
  for (const route of MOUNTABLE_ROUTES) {
    await openRoute(page, route);
    for (const theme of ['dark', 'light']) {
      await setTheme(page, theme);
      const contrast = await contrastSnapshot(page);
      if (contrast.titleContrast < 3) failures.push(`${route} ${theme}: low title contrast`);
      if (contrast.valueContrast < 3) failures.push(`${route} ${theme}: low readout contrast`);
      if (await layoutOverflow(page) > 1) failures.push(`${route} ${theme}: horizontal overflow`);
    }
  }
  expect(failures).toEqual([]);
});
