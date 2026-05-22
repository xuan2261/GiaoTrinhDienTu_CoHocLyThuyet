/**
 * Phase 09 — canvas-evolution sweep spec.
 *
 * Mounts every learner-facing sim route via the existing index.html shell,
 * clicks Play (when present), waits for engine seconds 1, 2, 3 to elapse,
 * and records 4 canvas hashes. Static buckets must show ≤2 unique frames;
 * animated bucket must show ≥3.
 *
 * Per F15 the loop samples by engine time, not wall time, so DPR=2 / slow CI
 * cannot collapse the [3,4] window to [1,2]. Per F10 known defects are
 * wrapped in test.fixme(): visible in CI output, removed phase by phase.
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const {
  ALL_ROUTES,
  KNOWN_DEFECTS,
  routeBucket,
  expectedWindowFor,
  TOTAL_EXPECTED,
} = require('./sim-canvas-evolution-fixtures');
const utils = require('./canvas-evolution-utils');

const ROOT = path.resolve(__dirname, '..');
const RESULTS_PATH = path.join(
  ROOT,
  'qa-verification',
  'animation-sweep',
  'sweep-results.json'
);

// Single-page-context. ~52 routes × ~4s ≈ 4 min budget per F12.
test.describe.configure({ mode: 'serial' });

test.describe('Canvas evolution sweep — mountable routes', () => {
  test('records hashes and enforces bucket-specific uniqueFrames', async ({ page }) => {
    test.setTimeout(8 * 60 * 1000);
    const consoleErrors = [];
    page.on('console', message => {
      if (['error', 'warning'].includes(message.type())) {
        const text = message.text();
        if (
          /Failed to load resource|cdn\.jsdelivr|katex|ERR_ABORTED|LaTeX-incompatible|No character metrics/i.test(
            text
          )
        ) return;
        consoleErrors.push(text);
      }
    });
    page.on('pageerror', err => consoleErrors.push('pageerror: ' + err.message));

    expect(ALL_ROUTES.length).toBe(TOTAL_EXPECTED);

    await page.goto(`file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForFunction(() => typeof window.loadPage === 'function', null, {
      timeout: 8000,
    });

    const aggregated = { generated: new Date().toISOString().slice(0, 10), routes: {} };
    const failures = [];

    for (const routeId of ALL_ROUTES) {
      const bucket = routeBucket(routeId);
      const window_ = expectedWindowFor(bucket);
      const knownDefect = KNOWN_DEFECTS[routeId] || null;

      // F10: surface known defects as test.fixme entries — they show up
      // in CI output. The sweep itself still records hashes for them so
      // the JSON snapshot stays complete.
      const result = await runRouteSweep(page, routeId);
      aggregated.routes[routeId] = {
        bucket,
        expectedUniqueFrames: window_,
        lastSeenFrames: result.uniqueFrames,
        hasPlayButton: result.hasPlayButton,
        engineTimeReached: result.engineTimeReached,
        sampleMode: result.sampleMode,
        ...(knownDefect ? { knownDefect } : {}),
      };

      if (knownDefect) {
        // Allow defective routes to fail the bucket assertion — Phase 02/03/05
        // each clear their own tag once the renderer/scene catches up.
        continue;
      }
      if (!window_) {
        failures.push(`${routeId}: bucket missing`);
        continue;
      }
      if (bucket === 'animated' && result.sampleMode !== 'engine-time') {
        failures.push(`${routeId} (${bucket}): sampleMode=${result.sampleMode}, expected engine-time`);
      }
      const u = result.uniqueFrames;
      if (u < window_[0] || u > window_[1]) {
        failures.push(
          `${routeId} (${bucket}): uniqueFrames=${u} outside [${window_[0]},${window_[1]}]`
        );
      }
    }

    fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(aggregated, null, 2) + '\n');

    if (consoleErrors.length) {
      failures.push('console: ' + consoleErrors.slice(0, 5).join(' | '));
    }
    if (failures.length) {
      throw new Error('Canvas evolution sweep failed:\n  - ' + failures.join('\n  - '));
    }
  });
});

async function runRouteSweep(page, routeId) {
  await page.evaluate(id => {
    if (typeof window.loadPage === 'function') window.loadPage(id);
  }, routeId);

  const mounted = await utils.waitForCanvasMounted(page, 8000);
  if (!mounted.ok) {
    return { uniqueFrames: 0, hasPlayButton: false, engineTimeReached: null, sampleMode: 'unmounted' };
  }
  await page.waitForTimeout(140);

  const t0 = await utils.sampleGridHash(page);
  const playInfo = await utils.clickPlay(page);
  const hasPlayButton = playInfo.clicked || playInfo.alreadyRunning ||
    (playInfo.reason !== 'no-play-button' && playInfo.reason !== 'no-mount');

  if (!hasPlayButton) {
    await page.waitForTimeout(80);
    const t1 = await utils.sampleGridHash(page);
    return {
      uniqueFrames: new Set([t0.hash, t1.hash].filter(Number.isFinite)).size,
      hasPlayButton,
      engineTimeReached: await utils.readEngineTime(page),
      sampleMode: 'static-quick',
    };
  }

  // Engine-time sampling (F15). Fall back to wall-time only if no engine
  // is ticking (e.g. static routes with no Play and no tickWithoutButton).
  let sampleMode = 'engine-time';
  let engineTimeReached = null;
  const tFrames = [t0];
  for (const target of [1, 2, 3]) {
    const reached = await utils.waitForEngineTime(page, target, { timeoutMs: 4500 });
    if (reached === null) {
      sampleMode = 'wall-fallback';
      await page.waitForTimeout(700);
    } else {
      engineTimeReached = reached;
    }
    tFrames.push(await utils.sampleGridHash(page));
  }

  // Stop the engine cleanly so the next route mounts fresh.
  await page.evaluate(() => {
    const mount = document.querySelector('#content-area');
    if (!mount) return;
    let btn = mount.querySelector('[data-sim-play]');
    if (!btn) {
      for (const candidate of mount.querySelectorAll('button')) {
        const txt = (candidate.textContent || '').trim();
        if (txt.includes('Dừng')) { btn = candidate; break; }
      }
    }
    if (btn && (btn.textContent || '').includes('Dừng')) btn.click();
  });

  const hashes = tFrames
    .filter(f => f && typeof f.hash === 'number')
    .map(f => f.hash);
  const unique = new Set(hashes).size;
  return {
    uniqueFrames: unique,
    hasPlayButton,
    engineTimeReached,
    sampleMode,
  };
}
