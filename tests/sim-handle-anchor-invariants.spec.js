// Browser-level invariants for the simulation correctness/realism overhaul.
// RED on master HEAD; each suite turns GREEN after its referenced phase.
//
// Run: npx playwright test tests/sim-handle-anchor-invariants.spec.js
// Tags (in test names): @rc1-handle-anchor @rc4-spring-base @rc5-overlay-suppressed
//                        @rc2-preset-gallery @rc2-impulse-flash @rc2-trail
//                        @a11y-aria-label @a11y-keyboard-drag @a11y-live-region

const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('url');
const path = require('path');

const fx = require('./sim-correctness-realism-fixtures');
const { INDEX_FILE } = require('./simulation-test-utils');

const FILE_INDEX_URL = pathToFileURL(INDEX_FILE).href;

async function openSimRoute(page, routeId) {
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(err.message));
  await page.goto(`${FILE_INDEX_URL}#${routeId}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(expected => window.location.hash.replace('#', '') === expected, routeId);
  await page.waitForSelector('.sim-container.sim-lab canvas, .sim-viewport-v2 svg.sim-svg-v2', { timeout: 10000 });
  await page.waitForTimeout(120);
  return consoleErrors;
}

async function readLabAttrs(page) {
  return page.locator('.sim-container.sim-lab').first().evaluate(lab => ({
    handleIds: String(lab.getAttribute('data-handle-ids') || '')
      .split(',').map(s => s.trim()).filter(Boolean),
    structuralMarks: String(lab.getAttribute('data-structural-marks') || '')
      .split('|').map(s => s.trim()).filter(Boolean),
  }));
}

async function readHandlePoints(page) {
  return page.locator('.sim-container.sim-lab canvas').first().evaluate(canvas => {
    const layer = canvas.__simInteractionLayer;
    const handles = layer && layer.handles ? layer.handles() : [];
    return handles.map(h => ({ id: h.id, point: h.point ? { x: h.point.x, y: h.point.y } : null }));
  });
}

// ---------- @rc1-handle-anchor: Phase 02 ---------------------------------
for (const route of fx.RC1_ROUTES) {
  test(`@rc1-handle-anchor ${route} has route-owned handle (Phase 02)`, async ({ page }) => {
    await openSimRoute(page, route);
    const { handleIds } = await readLabAttrs(page);
    expect(handleIds.length, `${route}: must declare at least one handle`).toBeGreaterThan(0);
    // RED: ch1-1-3, ch1-2-1, ch1-1-8 currently fall through to legacy fallback.
    expect(handleIds, `${route}: must not use legacy-primary fallback handle`)
      .not.toContain('legacy-primary');
    expect(handleIds, `${route}: must not use legacy-vector fallback handle`)
      .not.toContain('legacy-vector');
  });
}

// ---------- @rc4-spring-base: Phase 03 -----------------------------------
for (const route of fx.RC4_ROUTES) {
  test(`@rc4-spring-base ${route} spring/cable shares mass anchor (Phase 03)`, async ({ page }) => {
    await openSimRoute(page, route);
    const { structuralMarks } = await readLabAttrs(page);
    // RED: master emits spring + body marks separately with no shared anchor mark.
    // GREEN after Phase 03: a `springAnchor` or `anchor` mark co-locates with body.
    const hasSpring = structuralMarks.some(m => m.startsWith('spring:'));
    const hasAnchorLink = structuralMarks.some(m => /^(springAnchor|anchor):/.test(m));
    if (hasSpring) {
      expect(hasAnchorLink, `${route}: spring routes must emit anchor link mark`).toBe(true);
    }
  });
}

// ---------- @rc5-overlay-suppressed: Phase 04 ----------------------------
const RC5_ROUTES_TO_CHECK = ['ch1-1-4', 'ch1-2-3', 'ch1-2-1', 'ch2-4-1', 'ch3-3-1'];
for (const route of RC5_ROUTES_TO_CHECK) {
  test(`@rc5-overlay-suppressed ${route} declared labels not suppressed (Phase 04)`, async ({ page }) => {
    await openSimRoute(page, route);
    const { structuralMarks } = await readLabAttrs(page);
    const suppressed = structuralMarks.filter(m => m.startsWith('domLabelSuppressed:'));
    // RED: M_O / F_x / v_a-style labels are suppressed by narrow whitelist.
    // GREEN after Phase 04: Phase 04 broadens whitelist; declared labels render.
    expect(suppressed.length,
      `${route}: declared labels suppressed by whitelist: ${suppressed.join(' | ')}`
    ).toBe(0);
  });
}

// ---------- @rc2-preset-gallery: Phase 08 --------------------------------
for (const route of fx.RC2_PRESET_ROUTES) {
  test(`@rc2-preset-gallery ${route} renders preset buttons (Phase 08)`, async ({ page }) => {
    await openSimRoute(page, route);
    const presetCount = await page.locator('.sim-container.sim-lab .sim-preset-button, .sim-container.sim-lab [data-preset]').count();
    // RED: ch1-2-3 / ch1-1-3 / ch1-2-1 currently expose 0 preset controls.
    expect(presetCount, `${route}: must render at least one preset control`).toBeGreaterThan(0);
  });
}

// ---------- @rc2-no-autocycle: anti-regression (must STAY GREEN) ---------
test('@rc2-no-autocycle ch1-2-3 does not auto-cycle presets (anti-regression)', async ({ page }) => {
  await openSimRoute(page, 'ch1-2-3');
  const before = await page.locator('.sim-container.sim-lab').first().evaluate(lab => lab.dataset.activePreset || '');
  await page.waitForTimeout(2200);
  const after = await page.locator('.sim-container.sim-lab').first().evaluate(lab => lab.dataset.activePreset || '');
  expect(after, 'preset must not change without user input').toBe(before);
});

// ---------- @rc2-impulse-flash + Newton 3: Phase 08 ----------------------
test('@rc2-impulse-flash ch3-6-2 emits two opposite impulse arrows (Phase 08)', async ({ page }) => {
  await openSimRoute(page, 'ch3-6-2');
  // Drive the simulation to a collision: trigger play if there is a play button.
  const playBtn = page.locator('.sim-container.sim-lab [data-action="play"], .sim-container.sim-lab button:has-text("Chạy")').first();
  if (await playBtn.count() > 0) await playBtn.click({ trial: false }).catch(() => {});
  await page.waitForTimeout(1600);
  const { structuralMarks } = await readLabAttrs(page);
  const impulseArrows = structuralMarks.filter(m => /^(impulseArrow|impulseFlash):/.test(m));
  expect(impulseArrows.length,
    `ch3-6-2: collision must emit impulseArrow marks (Newton 3 invariant); got ${impulseArrows.length}`
  ).toBeGreaterThanOrEqual(2);
  // No spark/particle marks per plan decision (decoration would mislead Newton 3).
  const sparkMarks = structuralMarks.filter(m => /^(spark|particle):/.test(m));
  expect(sparkMarks.length, 'ch3-6-2: must not emit spark/particle decoration marks').toBe(0);
});

// ---------- @rc2-trail: Phase 08 -----------------------------------------
for (const route of fx.RC2_TRAIL_ROUTES) {
  test(`@rc2-trail ${route} renders motion trail (Phase 08)`, async ({ page }) => {
    await openSimRoute(page, route);
    await page.waitForTimeout(800);
    const { structuralMarks } = await readLabAttrs(page);
    const hasTrail = structuralMarks.some(m => /^(trail|trailDot|trailSegment):/.test(m));
    expect(hasTrail, `${route}: must emit trail marks`).toBe(true);
  });
}

// ---------- @a11y-aria-label: Phase 08b ----------------------------------
for (const route of fx.A11Y_ARIA_ROUTES) {
  test(`@a11y-aria-label ${route} exposes ARIA handle overlay (Phase 08b)`, async ({ page }) => {
    await openSimRoute(page, route);
    const ariaButtons = await page.locator('.sim-container.sim-lab .sim-handle-a11y[role="button"]').count();
    // RED: master has zero `.sim-handle-a11y` overlays.
    expect(ariaButtons, `${route}: must expose at least one ARIA handle button`).toBeGreaterThan(0);
  });
}

// ---------- @a11y-keyboard-drag: Phase 08b -------------------------------
test('@a11y-keyboard-drag ch1-2-3 handle responds to arrow keys (Phase 08b)', async ({ page }) => {
  await openSimRoute(page, 'ch1-2-3');
  const handle = page.locator('.sim-container.sim-lab .sim-handle-a11y[role="button"]').first();
  if (await handle.count() === 0) {
    // Expected RED on master.
    expect(false, 'no ARIA handle on master; expected GREEN after Phase 08b').toBe(true);
    return;
  }
  await handle.focus();
  const before = (await readHandlePoints(page))[0]?.point;
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  const after = (await readHandlePoints(page))[0]?.point;
  expect(after && before && (after.x !== before.x || after.y !== before.y),
    'arrow keys must move handle').toBe(true);
});

// ---------- @a11y-live-region: Phase 08b ---------------------------------
test('@a11y-live-region ch1-2-3 has aria-live polite region (Phase 08b)', async ({ page }) => {
  await openSimRoute(page, 'ch1-2-3');
  const liveRegion = await page.locator('.sim-container.sim-lab [aria-live="polite"], .sim-container.sim-lab .sim-aria-live').count();
  // RED: master has zero aria-live regions in the lab.
  expect(liveRegion, 'lab must expose at least one aria-live="polite" region').toBeGreaterThan(0);
});

// ---------- @a11y-reduced-motion: Phase 08b ------------------------------
test('@a11y-reduced-motion ch3-3-1 honors prefers-reduced-motion (Phase 08b)', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await openSimRoute(page, 'ch3-3-1');
  await page.waitForTimeout(600);
  const animating = await page.locator('.sim-container.sim-lab canvas').first().evaluate(canvas => {
    const layer = canvas.__simInteractionLayer;
    return !!(layer && layer.isAnimating && layer.isAnimating());
  });
  // RED: spring autoplays regardless of prefers-reduced-motion.
  expect(animating, 'spring must NOT autoplay when prefers-reduced-motion is set').toBe(false);
  await context.close();
});
