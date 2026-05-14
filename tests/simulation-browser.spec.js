const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const {
  ALL_ROUTES,
  EXPECTED_ROUTE_COUNT,
  ROOT,
  INDEX_FILE,
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
const FILE_INDEX_URL = `file:///${INDEX_FILE.replace(/\\/g, '/')}`;
const READOUT_REPORT_DIR = path.join(ROOT, 'plans', '260514-0617-simulation-readout-dedup-normalization', 'reports');

const FORBIDDEN_READOUT_ALIAS_PAIRS = [
  { route: 'ch1-2-3', labels: ['|F₁|', '|F1|'] },
  { route: 'ch1-3-1', labels: ['N', '|N|'] },
  { route: 'ch1-3-2', labels: ['Lực căng', '|T|'] },
  { route: 'ch1-3-7', labels: ['N dọc trục', '|N| dọc trục'] },
  { route: 'ch1-4-4', labels: ['ΣF', '|R| cân bằng'] },
  { route: 'ch3-7-1', labels: ['F', 'Lực F'] },
];

const INTENTIONAL_EQUALITIES = [
  { route: 'ch1-3-4', labels: ['R_A', 'R_B'] },
  { route: 'ch3-5-1', labels: ['m1', 'm2'] },
  { route: 'ch3-6-2', labels: ['p trước', 'p sau'] },
  { route: 'ch3-6-3', labels: ['p trước', 'p sau'] },
];
const OVERLAY_SHORT_LABEL_PATTERN = /^(?:[A-Z]|[A-Z]\d|O|IC|F|F1|F2|v|a|N|T|x|y|α)$/u;

function indexScriptOrder() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  return [...html.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
}

async function openContentRoute(page, route) {
  await page.goto(`${FILE_INDEX_URL}#${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(expected => window.location.hash.replace('#', '') === expected, route);
  await page.waitForSelector('.content-area');
  await page.waitForTimeout(90);
}

async function layoutMetrics(page) {
  return page.evaluate(() => {
    const rect = selector => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return {
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
      };
    };
    return {
      viewport: document.documentElement.clientWidth,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      content: rect('.content-area'),
      sim: rect('.content-area .sim-container.sim-lab'),
      topbar: rect('.topbar'),
    };
  });
}

async function simulationMountShellMetrics(page) {
  return page.evaluate(() => {
    const lab = document.querySelector('.content-area .sim-container.sim-lab');
    const parent = lab?.parentElement || null;
    const plainContainers = [...document.querySelectorAll('.content-area .sim-container')]
      .filter(node => !node.classList.contains('sim-lab'));
    return {
      labCount: document.querySelectorAll('.content-area .sim-container.sim-lab').length,
      plainContainerCount: plainContainers.length,
      parentIsPlainSimContainer: !!parent &&
        parent.classList.contains('sim-container') &&
        !parent.classList.contains('sim-lab'),
      parentClassName: parent?.className || '',
      parentBackground: parent ? getComputedStyle(parent).backgroundColor : '',
      parentPadding: parent ? getComputedStyle(parent).padding : '',
    };
  });
}

async function inspectorLayoutMetrics(page) {
  return page.locator('.sim-container.sim-lab').first().evaluate(lab => {
    const labBox = lab.getBoundingClientRect();
    const rect = selector => {
      const node = lab.querySelector(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return {
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
      };
    };
    const visible = selector => {
      const node = lab.querySelector(selector);
      if (!node) return false;
      const style = getComputedStyle(node);
      const box = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1;
    };
    return {
      viewport: document.documentElement.clientWidth,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      lab: {
        left: labBox.left,
        right: labBox.right,
        top: labBox.top,
        bottom: labBox.bottom,
        width: labBox.width,
        height: labBox.height,
      },
      scene: rect('.sim-lab-scene'),
      readouts: rect('.sim-readout-grid'),
      controls: rect('.sim-controls'),
      formula: rect('.sim-formula-panel'),
      hint: rect('.sim-lab-hint'),
      canvasRect: rect('.sim-lab-scene canvas'),
      visible: {
        readouts: visible('.sim-readout-grid'),
        controls: visible('.sim-controls'),
        formula: visible('.sim-formula-panel'),
        hint: visible('.sim-lab-hint'),
      },
      canvas: (() => {
        const canvas = lab.querySelector('.sim-lab-scene canvas');
        return canvas ? { width: canvas.width, height: canvas.height } : null;
      })(),
      styles: {
        display: getComputedStyle(lab).display,
        gridTemplateColumns: getComputedStyle(lab).gridTemplateColumns,
      },
    };
  });
}

async function readoutLayoutMetrics(page) {
  return page.locator('.sim-container.sim-lab').first().evaluate(lab => {
    const rectOf = node => {
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return {
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
      };
    };
    const grid = lab.querySelector('.sim-readout-grid');
    const cards = [...lab.querySelectorAll('.sim-readout-card')];
    const firstCard = cards[0];
    const label = firstCard?.querySelector('.sim-readout-label');
    const value = firstCard?.querySelector('.sim-readout-value');
    const first = {
      card: rectOf(firstCard),
      label: rectOf(label),
      value: rectOf(value),
    };
    const overflowFor = node => node ? Math.max(0, node.scrollWidth - node.clientWidth) : 0;
    const wrapsText = node => {
      if (!node) return false;
      const style = getComputedStyle(node);
      const lineHeight = parseFloat(style.lineHeight);
      if (!Number.isFinite(lineHeight) || lineHeight <= 0) return false;
      return node.getBoundingClientRect().height > lineHeight * 1.45;
    };
    return {
      viewport: document.documentElement.clientWidth,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      labOverflow: overflowFor(lab),
      gridOverflow: overflowFor(grid),
      maxCardOverflow: Math.max(0, ...cards.map(overflowFor)),
      wrappedTextCount: cards.reduce((total, card) => {
        const labelNode = card.querySelector('.sim-readout-label');
        const valueNode = card.querySelector('.sim-readout-value');
        return total + (wrapsText(labelNode) || wrapsText(valueNode) ? 1 : 0);
      }, 0),
      grid: rectOf(grid),
      first,
      cardHeights: cards.map(card => card.getBoundingClientRect().height),
      styles: {
        cardDisplay: firstCard ? getComputedStyle(firstCard).display : '',
        gridTemplateColumns: firstCard ? getComputedStyle(firstCard).gridTemplateColumns : '',
      },
    };
  });
}

function labelsPresent(cards, labels) {
  const present = new Set(cards.map(card => card.label));
  return labels.every(label => present.has(label));
}

function numberFromReadout(card) {
  const match = String(card?.value || '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

async function overlayContractSnapshot(page) {
  return page.locator('.sim-container.sim-lab').first().evaluate((lab, pattern) => {
    const formulaNodes = [...lab.querySelectorAll('.sim-lab-overlay .sim-overlay-formula')]
      .map(node => ({
        key: node.getAttribute('data-sim-overlay-key') || '',
        text: (node.textContent || '').trim().replace(/\s+/g, ' '),
      }));
    const shortLabelPattern = new RegExp(pattern.source, pattern.flags);
    const textNodes = [...lab.querySelectorAll('.sim-lab-overlay .sim-overlay-label, .sim-lab-overlay .sim-overlay-panel')]
      .map(node => ({
        key: node.getAttribute('data-sim-overlay-key') || '',
        text: (node.textContent || '').trim().replace(/\s+/g, ' '),
      }))
      .filter(item => item.text && !shortLabelPattern.test(item.text));
    return { formulaNodes, textNodes };
  }, {
    source: OVERLAY_SHORT_LABEL_PATTERN.source,
    flags: OVERLAY_SHORT_LABEL_PATTERN.flags,
  });
}

function classifyReadoutSnapshot(snapshot) {
  const duplicateAliases = FORBIDDEN_READOUT_ALIAS_PAIRS
    .filter(rule => rule.route === snapshot.routeId && labelsPresent(snapshot.readoutCards, rule.labels))
    .map(rule => rule.labels.join(' / '));
  const genericNoise = snapshot.readoutCards
    .filter(card => ['mode', 'alpha', 'time'].includes(card.kind) || ['mode', 'alpha', '_t'].includes(card.key))
    .map(card => card.label);
  const controlEchoes = snapshot.readoutCards
    .filter(card => card.kind !== 'time' && ['force', 'F', 'omega', 'rho', 'load', 'm', 'm1', 'm2'].includes(card.key))
    .map(card => card.label);
  return { duplicateAliases, genericNoise, controlEchoes };
}

function writeReadoutReport(kind, snapshots) {
  fs.mkdirSync(READOUT_REPORT_DIR, { recursive: true });
  const enriched = snapshots.map(snapshot => Object.assign({}, snapshot, {
    classification: classifyReadoutSnapshot(snapshot),
  }));
  fs.writeFileSync(
    path.join(READOUT_REPORT_DIR, `readout-baseline-${kind}.json`),
    `${JSON.stringify(enriched, null, 2)}\n`,
    'utf8'
  );
  const duplicates = enriched
    .filter(item => item.classification.duplicateAliases.length)
    .map(item => `| ${item.routeId} | ${item.classification.duplicateAliases.join(', ')} | ${item.readoutCards.map(card => `${card.label}=${card.value}`).join('; ')} |`);
  const lines = [
    `# Readout Baseline ${kind}`,
    '',
    `Generated: ${new Date().toISOString()}`,
    `Routes: ${enriched.length}`,
    '',
    '| Route | Duplicate aliases | Cards |',
    '|---|---|---|',
    ...(duplicates.length ? duplicates : ['| None | None | None |']),
    '',
    '## Intentional Equalities',
    '',
    '- ch1-3-4: R_A / R_B symmetry allowed.',
    '- ch3-5-1: m1 / m2 default equality allowed.',
    '- ch3-6-2, ch3-6-3: p trước / p sau conservation equality allowed.',
    '',
  ];
  fs.writeFileSync(path.join(READOUT_REPORT_DIR, `readout-baseline-${kind}.md`), `${lines.join('\n')}\n`, 'utf8');
}

async function topbarOverlaps(page) {
  return page.locator('.topbar').evaluate(topbar => {
    const visibleChildren = [...topbar.children].filter(child => {
      const style = getComputedStyle(child);
      const box = child.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1;
    });
    const overlaps = [];
    for (let i = 0; i < visibleChildren.length; i += 1) {
      for (let j = i + 1; j < visibleChildren.length; j += 1) {
        const a = visibleChildren[i].getBoundingClientRect();
        const b = visibleChildren[j].getBoundingClientRect();
        const horizontal = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const vertical = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (horizontal > 1 && vertical > 1) {
          overlaps.push(`${visibleChildren[i].className || visibleChildren[i].tagName}/${visibleChildren[j].className || visibleChildren[j].tagName}`);
        }
      }
    }
    return overlaps;
  });
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

test('overlay contract keeps formulas and dynamic values out of the canvas overlay @overlay-contract', async ({ page }) => {
  test.setTimeout(180000);
  const failures = [];
  for (const route of ALL_ROUTES) {
    await openRoute(page, route);
    const snapshot = await overlayContractSnapshot(page);
    snapshot.formulaNodes.forEach(item => {
      failures.push(`${route}: formula overlay ${item.key} "${item.text.slice(0, 80)}"`);
    });
    snapshot.textNodes.forEach(item => {
      failures.push(`${route}: non-short overlay text ${item.key} "${item.text.slice(0, 80)}"`);
    });
  }
  expect(failures).toEqual([]);
});

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

test('reading pages keep the narrow content measure without page overflow @responsive', async ({ page }) => {
  for (const viewport of [
    { width: 1366, height: 768, route: 'ch3-7-3' },
    { width: 768, height: 812, route: 'ch3-7-3' },
    { width: 390, height: 844, route: 'ch3-7-3' },
  ]) {
    await page.setViewportSize(viewport);
    await openContentRoute(page, viewport.route);
    const metrics = await layoutMetrics(page);
    expect(metrics.pageOverflow, `${viewport.route} page overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
    expect(metrics.content.width, `${viewport.route} content width at ${viewport.width}px`).toBeLessThanOrEqual(940);
    expect(metrics.sim, `${viewport.route} should not mount a simulation lab`).toBeNull();
  }
});

test('simulation pages use scoped wide layout without page overflow @responsive', async ({ page }) => {
  for (const route of ['ch1-2-3', 'ch2-5-2', 'ch3-6-2']) {
    await page.setViewportSize({ width: 1366, height: 768 });
    await openRoute(page, route);
    const desktop = await layoutMetrics(page);
    expect(desktop.pageOverflow, `${route} page overflow at 1366px`).toBeLessThanOrEqual(1);
    expect(desktop.content.width, `${route} reading shell width at 1366px`).toBeLessThanOrEqual(940);
    expect(desktop.sim.width, `${route} sim should be wider than reading content at 1366px`).toBeGreaterThan(desktop.content.width + 80);
    expect(desktop.sim.right, `${route} sim right edge at 1366px`).toBeLessThanOrEqual(desktop.viewport + 1);
    expect(desktop.sim.left, `${route} sim left edge at 1366px`).toBeGreaterThanOrEqual(0);

    await page.setViewportSize({ width: 768, height: 812 });
    await page.waitForTimeout(360);
    const tablet = await layoutMetrics(page);
    expect(tablet.pageOverflow, `${route} page overflow at 768px`).toBeLessThanOrEqual(1);
    expect(tablet.sim.width, `${route} sim should gain horizontal room at 768px`).toBeGreaterThan(tablet.content.width);
    expect(tablet.sim.width, `${route} sim width at 768px`).toBeLessThanOrEqual(tablet.viewport);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(360);
    const mobile = await layoutMetrics(page);
    expect(mobile.pageOverflow, `${route} page overflow at 390px`).toBeLessThanOrEqual(1);
    expect(mobile.sim.width, `${route} sim width at 390px`).toBeLessThanOrEqual(mobile.viewport);
  }
});

test('simulation mount point stays neutral outside the visual lab shell @responsive', async ({ page }) => {
  for (const route of ['ch1-2-3', 'ch2-5-2', 'ch3-6-2']) {
    await page.setViewportSize({ width: 1366, height: 768 });
    await openRoute(page, route);
    const metrics = await simulationMountShellMetrics(page);
    expect(metrics.labCount, `${route} should mount exactly one visual lab`).toBe(1);
    expect(metrics.plainContainerCount, `${route} should not leave plain .sim-container mount wrappers`).toBe(0);
    expect(metrics.parentIsPlainSimContainer, `${route} lab parent must be a neutral mount, got ${metrics.parentClassName}`).toBe(false);
    expect(metrics.parentBackground, `${route} lab parent should not paint a white sim container`).not.toBe('rgb(248, 249, 250)');
    expect(metrics.parentPadding, `${route} lab parent should not add sim-container padding`).not.toBe('16px');
  }
});

test('right inspector places readouts controls formula and hint beside scene on wide screens @responsive', async ({ page }) => {
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(viewport);
    await openRoute(page, 'ch2-5-2');
    const metrics = await inspectorLayoutMetrics(page);
    expect(metrics.pageOverflow, `page overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
    expect(metrics.canvas, `canvas logical size at ${viewport.width}px`).toEqual({ width: 760, height: 440 });
    expect(metrics.scene, `scene exists at ${viewport.width}px`).toBeTruthy();
    expect(metrics.canvasRect.width / metrics.canvasRect.height, `rendered canvas aspect at ${viewport.width}px`).toBeCloseTo(760 / 440, 1);
    expect(metrics.canvasRect.right, `canvas should stay inside scene horizontally at ${viewport.width}px`).toBeLessThanOrEqual(metrics.scene.right + 1);
    expect(metrics.canvasRect.bottom, `canvas should stay inside scene vertically at ${viewport.width}px`).toBeLessThanOrEqual(metrics.scene.bottom + 1);
    expect(metrics.styles.display, `lab uses layout grid at ${viewport.width}px`).toBe('grid');
    for (const key of ['readouts', 'controls', 'formula', 'hint']) {
      expect(metrics.visible[key], `${key} visible at ${viewport.width}px`).toBe(true);
      expect(metrics[key].left, `${key} should be right of scene at ${viewport.width}px`).toBeGreaterThanOrEqual(metrics.scene.right - 2);
      expect(metrics[key].right, `${key} should stay within lab at ${viewport.width}px`).toBeLessThanOrEqual(metrics.lab.right + 1);
    }
  }
});

test('right inspector falls back to stacked mobile layout without overflow @responsive', async ({ page }) => {
  for (const viewport of [
    { width: 768, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await openRoute(page, 'ch3-6-2');
    const metrics = await inspectorLayoutMetrics(page);
    expect(metrics.pageOverflow, `page overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
    expect(metrics.canvas, `canvas logical size at ${viewport.width}px`).toEqual({ width: 760, height: 440 });
    expect(metrics.canvasRect.width / metrics.canvasRect.height, `rendered canvas aspect at ${viewport.width}px`).toBeCloseTo(760 / 440, 1);
    expect(metrics.canvasRect.right, `canvas should stay inside scene horizontally at ${viewport.width}px`).toBeLessThanOrEqual(metrics.scene.right + 1);
    expect(metrics.canvasRect.bottom, `canvas should stay inside scene vertically at ${viewport.width}px`).toBeLessThanOrEqual(metrics.scene.bottom + 1);
    for (const key of ['readouts', 'controls', 'formula', 'hint']) {
      expect(metrics.visible[key], `${key} visible at ${viewport.width}px`).toBe(true);
      expect(metrics[key].top, `${key} should stack below scene at ${viewport.width}px`).toBeGreaterThan(metrics.scene.bottom - 2);
      expect(metrics[key].right, `${key} should stay inside lab at ${viewport.width}px`).toBeLessThanOrEqual(metrics.lab.right + 1);
    }
  }
});

test.describe('compact readout cards @compact-readout', () => {
  test('short desktop readout cards use compact one-row density', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await openRoute(page, 'ch1-1-3');
    const metrics = await readoutLayoutMetrics(page);
    expect(metrics.first.card, 'first readout card should exist').toBeTruthy();
    expect(metrics.first.label, 'first readout label should exist').toBeTruthy();
    expect(metrics.first.value, 'first readout value should exist').toBeTruthy();
    expect(metrics.styles.cardDisplay, 'card should use grid for label/value alignment').toBe('grid');
    expect(metrics.first.card.height, 'short readout card height should be compact').toBeLessThanOrEqual(52);

    const labelMid = (metrics.first.label.top + metrics.first.label.bottom) / 2;
    const valueMid = (metrics.first.value.top + metrics.first.value.bottom) / 2;
    expect(Math.abs(labelMid - valueMid), 'label/value vertical centers should align').toBeLessThanOrEqual(5);
    expect(metrics.first.value.left, 'value should sit to the right of the label on desktop').toBeGreaterThanOrEqual(metrics.first.label.right - 1);
    expect(metrics.pageOverflow, 'page overflow at desktop').toBeLessThanOrEqual(1);
    expect(metrics.labOverflow, 'lab overflow at desktop').toBeLessThanOrEqual(1);
    expect(metrics.gridOverflow, 'readout grid overflow at desktop').toBeLessThanOrEqual(1);
    expect(metrics.maxCardOverflow, 'readout card overflow at desktop').toBeLessThanOrEqual(1);
  });

  test('long and mobile readout cards wrap without horizontal overflow', async ({ page }) => {
    for (const viewport of [
      { width: 1024, height: 768, route: 'ch3-6-2' },
      { width: 768, height: 900, route: 'ch3-6-2' },
      { width: 390, height: 844, route: 'ch2-4-3' },
    ]) {
      await page.setViewportSize(viewport);
      await openRoute(page, viewport.route);
      await page.waitForTimeout(360);
      const metrics = await readoutLayoutMetrics(page);
      expect(metrics.cardHeights.length, `${viewport.route} has readout cards`).toBeGreaterThanOrEqual(3);
      expect(metrics.pageOverflow, `${viewport.route} page overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
      expect(metrics.labOverflow, `${viewport.route} lab overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
      expect(metrics.gridOverflow, `${viewport.route} readout grid overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
      expect(metrics.maxCardOverflow, `${viewport.route} card overflow at ${viewport.width}px`).toBeLessThanOrEqual(1);
      expect(metrics.first.label.height, `${viewport.route} first label visible at ${viewport.width}px`).toBeGreaterThan(8);
      expect(metrics.first.value.height, `${viewport.route} first value visible at ${viewport.width}px`).toBeGreaterThan(10);
      if (viewport.width <= 390) {
        expect(metrics.wrappedTextCount, `${viewport.route} should wrap at least one narrow value instead of overflowing`).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('simulation readout dedup normalization @readout-dedup', () => {
  test('readout dedup baseline captures all route cards', async ({ page }) => {
    test.setTimeout(180000);
    const snapshots = [];
    for (const route of ALL_ROUTES) {
      await openRoute(page, route);
      const state = await labState(page);
      snapshots.push({
        routeId: route,
        title: state.title,
        readoutCards: state.readoutCards.map(card => ({
          label: card.label,
          key: card.key,
          value: card.value,
          kind: card.kind,
        })),
      });
    }
    if (process.env.READOUT_BASELINE_KIND) writeReadoutReport(process.env.READOUT_BASELINE_KIND, snapshots);
    expect(snapshots).toHaveLength(EXPECTED_ROUTE_COUNT);
  });

  test('readout dedup forbidden duplicate aliases are absent', async ({ page }) => {
    for (const rule of FORBIDDEN_READOUT_ALIAS_PAIRS) {
      await openRoute(page, rule.route);
      const cards = (await labState(page)).readoutCards;
      expect(labelsPresent(cards, rule.labels), `${rule.route}: ${rule.labels.join(' / ')}`).toBe(false);
    }
  });

  test('readout dedup intentional equalities remain visible', async ({ page }) => {
    for (const rule of INTENTIONAL_EQUALITIES) {
      await openRoute(page, rule.route);
      const cards = (await labState(page)).readoutCards;
      expect(labelsPresent(cards, rule.labels), `${rule.route}: ${rule.labels.join(' / ')}`).toBe(true);
    }
  });

  test('readout dedup control and generic echoes are explicit or policy allowed', async ({ page }) => {
    const failures = [];
    for (const route of ALL_ROUTES) {
      await openRoute(page, route);
      const snapshot = await page.locator('.sim-container.sim-lab').first().evaluate(lab => {
        const scene = window.SimSceneRegistry?.get?.(lab.getAttribute('data-route-id')) || {};
        const generic = scene.appendGenericReadouts !== false;
        const policy = Object.assign({
          appendMode: generic,
          appendAlpha: generic,
          appendControls: true,
          appendTime: true,
        }, scene.readoutPolicy || {});
        const explicit = (scene.readouts || []).map(item => ({
          key: String(item.key || '').toLowerCase(),
          label: String(item.label || '').toLowerCase(),
        }));
        return {
          controls: (scene.controls || [])
            .filter(control => control && control.type === 'slider')
            .map(control => ({
              key: String(control.key || '').toLowerCase(),
              label: String(control.label || control.key || '').toLowerCase(),
            })),
          explicit,
          policy,
          cards: [...lab.querySelectorAll('.sim-readout-card')].map(card => ({
            key: String(card.dataset.readoutKey || '').toLowerCase(),
            label: String(card.querySelector('.sim-readout-label')?.textContent || '').trim().toLowerCase(),
          })),
        };
      });
      for (const control of snapshot.controls) {
        const cardEcho = snapshot.cards.some(card => card.key === control.key || card.label === control.label);
        const declared = snapshot.explicit.some(item => item.key === control.key || item.label === control.label);
        const genericAlpha = control.key === 'alpha' && snapshot.policy.appendAlpha &&
          snapshot.cards.some(card => card.key === 'alpha' && card.label !== control.label);
        if (genericAlpha) continue;
        if (cardEcho && !declared && !snapshot.policy.appendControls) {
          failures.push(`${route}: undeclared control echo ${control.label || control.key}`);
        }
      }
      for (const key of ['mode', 'alpha', '_t']) {
        const cardEcho = snapshot.cards.some(card => card.key === key);
        const declared = snapshot.explicit.some(item => item.key === key);
        const allowed = key === 'mode' ? snapshot.policy.appendMode : (key === 'alpha' ? snapshot.policy.appendAlpha : snapshot.policy.appendTime);
        if (cardEcho && !declared && !allowed) failures.push(`${route}: undeclared generic echo ${key}`);
      }
    }
    expect(failures).toEqual([]);
  });

  test('readout dedup ch2-1-3 separates normal acceleration and curvature radius', async ({ page }) => {
    await openRoute(page, 'ch2-1-3');
    const cards = (await labState(page)).readoutCards;
    const byLabel = label => cards.find(card => card.label === label);
    const at = byLabel('a_t');
    const an = byLabel('a_n');
    const rho = byLabel('ρ') || byLabel('rho') || byLabel('Bán kính cong');
    expect(at, 'a_t readout').toBeTruthy();
    expect(an, 'a_n readout').toBeTruthy();
    expect(rho, 'rho readout').toBeTruthy();
    expect(an.value).not.toBe(rho.value);
    expect(an.value).toMatch(/m\/s²/);
    expect(rho.value).toMatch(/m/);

    const anValue = numberFromReadout(an);
    const rhoValue = numberFromReadout(rho);
    expect(Number.isFinite(anValue), 'a_n numeric value').toBe(true);
    expect(Number.isFinite(rhoValue), 'rho numeric value').toBe(true);
    expect(anValue).not.toBeCloseTo(rhoValue, 1);
    const model = await page.locator('.sim-container.sim-lab').first().evaluate(lab => {
      const scene = window.SimSceneRegistry?.get?.(lab.getAttribute('data-route-id')) || {};
      const initial = scene.initialState || {};
      const speed = Number.isFinite(Number(initial.speed))
        ? Number(initial.speed)
        : Math.hypot(Number(initial.vx) || 0, Number(initial.vy) || 0);
      return { speed, rho: Number(initial.rho) };
    });
    expect(model.speed).toBeGreaterThan(0);
    expect(model.rho).toBeGreaterThan(0);
    expect(anValue).toBeCloseTo((model.speed * model.speed) / model.rho, 1);
  });

  test('readout dedup angular velocity readouts use angular units', async ({ page }) => {
    for (const route of ['ch2-2-2', 'ch2-3-2']) {
      await openRoute(page, route);
      const cards = (await labState(page)).readoutCards;
      const angular = cards.find(card => ['omega', 'omega2'].includes(card.key));
      expect(angular, `${route}: angular velocity readout`).toBeTruthy();
      expect(angular.value, `${route}: angular velocity unit`).toMatch(/rad\/s/);
      expect(angular.value, `${route}: no linear velocity unit`).not.toMatch(/m\/s/);
    }
  });
});

test('topbar controls do not overlap on tablet and mobile widths @responsive', async ({ page }) => {
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 768, height: 812 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await openContentRoute(page, 'ch1-6-2');
    const overlaps = await topbarOverlaps(page);
    const searchVisible = await page.locator('.topbar .search input').isVisible();
    const themeVisible = await page.locator('#themeBtn').isVisible();
    expect(overlaps, `topbar overlaps at ${viewport.width}px`).toEqual([]);
    expect(searchVisible, `search remains visible at ${viewport.width}px`).toBe(true);
    expect(themeVisible, `theme button remains visible at ${viewport.width}px`).toBe(true);
  }
});

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
