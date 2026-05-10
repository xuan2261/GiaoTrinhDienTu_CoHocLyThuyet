const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const {
  ALL_ROUTES,
  EXPECTED_ROUTE_COUNT,
  ROOT,
  ROUTE_GROUPS,
  canvasStats,
  openRoute,
  labState,
  setTheme,
  layoutOverflow,
  startStaticServer,
} = require('./simulation-test-utils');

const REPRESENTATIVE_ROUTES = ['ch1-2-3', 'ch1-5-3', 'ch2-1-1', 'ch2-5-2', 'ch3-3-1', 'ch3-6-2'];
const LEGACY_UI_TEXT_PATTERN = /\b(Simulation lab|Legacy scene|fallback|body\/force|generic handle|undefined)\b/i;

function indexScriptOrder() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  return [...html.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
}

test('manifest lists the canonical 58 DeCuong-style simulation routes @route-mount', async () => {
  expect(ALL_ROUTES).toHaveLength(EXPECTED_ROUTE_COUNT);
  expect(new Set(ALL_ROUTES).size).toBe(EXPECTED_ROUTE_COUNT);
  expect(ROUTE_GROUPS.ch1).toHaveLength(25);
  expect(ROUTE_GROUPS.ch2).toHaveLength(15);
  expect(ROUTE_GROUPS.ch3).toHaveLength(18);
});

test('runtime exposes required simulation globals and canonical route map @baseline', async ({ page }) => {
  await openRoute(page, 'ch1-2-3');
  const runtime = await page.evaluate(() => ({
    manifestRoutes: Object.keys(window.SIM_ROUTE_MANIFEST || {}).sort(),
    simMapRoutes: Object.keys(window.SIM_MAP || {}).filter(route => /^ch\d+-\d+-\d+$/.test(route)).sort(),
    globals: [
      'SimCore',
      'SimMath',
      'SimRender',
      'SimInteractions',
      'SimLabUI',
      'SimProfessionalLab',
      'SimRouteRenderers',
      'SimRouteBehaviors',
    ].filter(name => Boolean(window[name])),
  }));
  expect(runtime.manifestRoutes).toEqual(ALL_ROUTES);
  expect(runtime.simMapRoutes).toEqual(expect.arrayContaining(ALL_ROUTES));
  expect(runtime.globals).toHaveLength(8);
});

test('index script order preserves current registry-backed lab runtime @baseline', async () => {
  const scripts = indexScriptOrder();
  const pos = name => scripts.indexOf(name);
  expect(pos('js/sim-lab-ui.js')).toBeGreaterThan(pos('js/sim-interactions.js'));
  expect(pos('js/sim-route-renderer-registry.js')).toBeLessThan(pos('js/sim-professional-lab.js'));
  expect(pos('js/sim-professional-lab.js')).toBeLessThan(pos('js/sim-statics.js'));
  expect(pos('js/sim-route-manifest.js')).toBeLessThan(pos('js/simulations.js'));
  expect(pos('js/sims/ch1/statics-routes.js')).toBeLessThan(pos('js/simulations.js'));
  expect(pos('js/sims/ch2/kinematics-routes.js')).toBeLessThan(pos('js/simulations.js'));
  expect(pos('js/sims/ch3/dynamics-routes.js')).toBeLessThan(pos('js/simulations.js'));
});

test('current DeCuong helpers are available without speculative V2 assumptions @baseline', async ({ page }) => {
  await openRoute(page, 'ch3-3-1');
  const capabilities = await page.evaluate(() => ({
    visual: ['metalGradient', 'concretePattern', 'emitEnergyBurst']
      .filter(name => typeof window.SimVisualHelpers[name] === 'function'),
    primitives: ['body', 'spring', 'realisticGround', 'domMath']
      .filter(name => typeof window.SimRouteRendererPrimitives[name] === 'function'),
    interactions: ['createInteractionLayer', 'addVectorHandle', 'addBodyDrag', 'addGraphCursor']
      .filter(name => typeof window.SimInteractions[name] === 'function'),
  }));
  expect(capabilities.visual).toHaveLength(3);
  expect(capabilities.primitives).toHaveLength(4);
  expect(capabilities.interactions).toHaveLength(4);
});

for (const route of ALL_ROUTES) {
  test(`file route mounts DeCuong lab ${route} @route-mount`, async ({ page }) => {
    await openRoute(page, route);
    const state = await labState(page);
    expect(state.routeId).toBe(route);
    expect(state.title).toContain(route);
    expect(state.rendererId).not.toMatch(/^missing-renderer/);
    expect(state.behaviorId).not.toMatch(/^legacy:/);
    expect(state.formula.length).toBeGreaterThan(3);
    expect(state.hint.length).toBeGreaterThan(10);
    expect(state.readoutCards.length).toBeGreaterThanOrEqual(3);
    expect(state.readoutCards.every(card => card.label && card.value)).toBe(true);
  });
}

test('shared shell exposes DeCuong slots and theme-specific colors @sim-shell-theme', async ({ page }) => {
  await openRoute(page, 'ch1-2-3');
  const lab = page.locator('.sim-container.sim-lab');
  await expect(lab).toBeVisible();
  await expect(lab).toHaveAttribute('role', 'region');
  await expect(lab).toHaveAttribute('aria-label', /Mô phỏng ch1-2-3/);
  await expect(page.locator('.sim-header .sim-title')).toContainText('ch1-2-3');
  await expect(page.locator('.sim-lab-route-chip')).toHaveText('ch1-2-3');
  await expect(page.locator('.sim-lab-route-chip')).toHaveAttribute('aria-label', /ch1-2-3/);
  await expect(page.locator('.sim-lab-status')).toContainText(/tương tác|đã tạm dừng|đang chạy/);
  await expect(page.locator('.sim-lab-status')).toHaveAttribute('aria-live', 'polite');
  const canvas = page.locator('.sim-lab-scene canvas');
  await expect(canvas).toBeVisible();
  const hintId = await canvas.getAttribute('aria-describedby');
  expect(hintId).toBeTruthy();
  await expect(page.locator(`#${hintId}`)).toHaveClass(/sim-lab-hint/);
  await expect(page.locator('.sim-controls')).toBeVisible();
  await expect(page.locator('.sim-readout-grid')).toBeVisible();
  await expect(page.locator('.sim-sr-readout')).toHaveAttribute('role', 'status');
  await expect(page.locator('.sim-sr-readout')).toHaveAttribute('aria-live', 'polite');
  await expect(page.locator('.sim-sr-readout')).toHaveAttribute('aria-atomic', 'true');
  await expect(page.locator('.sim-formula-panel')).toBeVisible();
  await expect(page.locator('.sim-lab-hint')).toBeVisible();
  const readoutKinds = (await labState(page)).readoutCards.map(card => card.kind);
  expect(readoutKinds.some(kind => kind && kind !== 'default')).toBe(true);

  async function colorSnapshot() {
    return page.locator('.sim-container.sim-lab').evaluate(lab => ({
      lab: getComputedStyle(lab).backgroundColor,
      scene: getComputedStyle(lab.querySelector('.sim-lab-scene')).backgroundColor,
      card: getComputedStyle(lab.querySelector('.sim-readout-card')).backgroundColor,
      title: getComputedStyle(lab.querySelector('.sim-title')).color,
    }));
  }
  await setTheme(page, 'dark');
  const dark = await colorSnapshot();
  await setTheme(page, 'light');
  const light = await colorSnapshot();
  expect(dark.lab).not.toBe(light.lab);
  expect(dark.scene).not.toBe(light.scene);
  expect(dark.card).not.toBe(light.card);
  expect(dark.title).not.toBe(light.title);
});

test('chapter accents and handle-action hints are visible in the shared shell @sim-shell-theme', async ({ page }) => {
  const samples = [
    { route: 'ch1-2-3', handle: 'F2' },
    { route: 'ch2-1-1', handle: 'M' },
    { route: 'ch3-3-1', handle: 'm' },
  ];
  const colors = [];
  for (const sample of samples) {
    await openRoute(page, sample.route);
    const state = await labState(page);
    expect(state.hint).toContain('Kéo');
    expect(state.hint).toContain(sample.handle);
    colors.push(await page.locator('.sim-container.sim-lab').evaluate(lab => ({
      border: getComputedStyle(lab).borderLeftColor,
      chip: getComputedStyle(lab.querySelector('.sim-lab-route-chip')).color,
    })));
  }
  expect(new Set(colors.map(item => item.border)).size).toBe(3);
  expect(new Set(colors.map(item => item.chip)).size).toBe(3);
});

for (const width of [375, 768, 1280]) {
  test(`representative shell has no horizontal overflow at ${width}px @responsive`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    for (const route of REPRESENTATIVE_ROUTES) {
      await openRoute(page, route);
      expect(await layoutOverflow(page), `${route} overflow at ${width}px`).toBeLessThanOrEqual(1);
    }
  });
}

test('visible simulation shell text avoids legacy English UI leaks @localization', async ({ page }) => {
  test.setTimeout(120000);
  const leaks = [];
  for (const route of ALL_ROUTES) {
    await openRoute(page, route);
    const text = (await labState(page)).visibleText;
    const match = text.match(LEGACY_UI_TEXT_PATTERN);
    if (match) leaks.push(`${route}: ${match[0]}`);
  }
  expect(leaks).toEqual([]);
});

test('controlled formula/hint text and canvas size survive responsive resize @responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openRoute(page, 'ch3-6-2');
  const state = await labState(page);
  expect(state.formula).toContain('p');
  expect(state.hint).toContain('bảng thông số');
  expect(state.visibleText).not.toMatch(/<script|onclick=|Legacy scene/i);
  const mobile = await canvasStats(page);
  await page.setViewportSize({ width: 1280, height: 812 });
  await page.waitForTimeout(100);
  const desktop = await canvasStats(page);
  expect(desktop.width).toBe(mobile.width);
  expect(desktop.height).toBe(mobile.height);
  expect(desktop.variants).toBeGreaterThan(2);
});

test.describe('static server smoke @baseline', () => {
  let server;
  let port;

  test.beforeAll(async () => {
    const started = await startStaticServer();
    server = started.server;
    port = started.port;
  });

  test.afterAll(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
  });

  for (const route of REPRESENTATIVE_ROUTES) {
    test(`server route mounts ${route}`, async ({ page }) => {
      await openRoute(page, route, { url: `http://127.0.0.1:${port}/index.html#${route}` });
    });
  }
});
