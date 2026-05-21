/**
 * Phase 09 backlog — tier-2 visual evolution baseline.
 *
 * No-dependency fallback for the pixelmatch plan. Captures downsampled canvas
 * signatures at engine t=0,1,2,3 and compares current t=3 against the reviewed
 * baseline. It catches "animation off" and large visual drift without adding
 * PNG/pixelmatch dependencies.
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const utils = require('./canvas-evolution-utils');
const {
  VISUAL_EVOLUTION_ROUTES,
  toleranceFor,
} = require('./sim-canvas-pixelmatch-config');

const ROOT = path.resolve(__dirname, '..');
const BASELINE_PATH = path.join(
  ROOT,
  'qa-verification',
  'visual-evolution-baseline',
  'per-route-visual-evolution-baseline.json'
);
const RESULTS_PATH = path.join(
  ROOT,
  'qa-verification',
  'visual-evolution-baseline',
  'visual-evolution-results.json'
);
const UPDATE_BASELINE_MODE = process.env.SIM_UPDATE_VISUAL_BASELINE === '1';
const ACCEPT_DRIFT = process.env.SIM_ACCEPT_VISUAL_BASELINE_DRIFT === '1';

test.describe.configure({ mode: 'serial' });

test.describe('Tier-2 visual evolution baseline', () => {
  test('animated routes evolve within tolerance and match reviewed baseline', async ({ page }) => {
    test.setTimeout(4 * 60 * 1000);

    const baseline = readBaseline();
    const results = {
      generated: new Date().toISOString().slice(0, 10),
      fallback: 'getImageData-downsample',
      routes: {},
    };
    const failures = [];

    await page.goto(utils.FILE_INDEX_URL(ROOT), { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.loadPage === 'function', null, { timeout: 8000 });

    for (const routeId of VISUAL_EVOLUTION_ROUTES) {
      const tolerance = toleranceFor(routeId);
      const routeResult = await captureRouteFrames(page, routeId, tolerance.sampleStep);
      results.routes[routeId] = summarizeRoute(routeResult);

      const evolvePct = diffPct(routeResult.frames.t0, routeResult.frames.t3, tolerance.colorThreshold);
      if (evolvePct < tolerance.lowerPct || evolvePct > tolerance.upperPct) {
        failures.push(
          `${routeId}: t0→t3 evolvePct=${evolvePct.toFixed(4)} outside `
          + `[${tolerance.lowerPct},${tolerance.upperPct}]`
        );
      }

      const baselineRoute = baseline.routes && baseline.routes[routeId];
      if (!baselineRoute) {
        if (!UPDATE_BASELINE_MODE) failures.push(`${routeId}: missing baseline entry`);
        continue;
      }
      const driftPct = diffPct(routeResult.frames.t3, baselineRoute.frames.t3, tolerance.colorThreshold);
      results.routes[routeId].driftPct = Number(driftPct.toFixed(5));
      if (driftPct > tolerance.baselineDriftPct && !ACCEPT_DRIFT) {
        failures.push(
          `${routeId}: t3 baseline drift=${driftPct.toFixed(4)} > ${tolerance.baselineDriftPct}`
        );
      }
    }

    fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2) + '\n');

    expect(Object.keys(results.routes)).toHaveLength(VISUAL_EVOLUTION_ROUTES.length);
    if (failures.length) {
      throw new Error('Tier-2 visual evolution baseline failed:\n  - ' + failures.join('\n  - '));
    }
  });
});

function readBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    if (UPDATE_BASELINE_MODE) return { routes: {} };
    throw new Error(`Missing visual evolution baseline: ${BASELINE_PATH}. Run tools/update-visual-evolution-baseline.js`);
  }
  return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
}

async function captureRouteFrames(page, routeId, sampleStep) {
  await page.evaluate(id => window.loadPage(id), routeId);
  const mounted = await utils.waitForCanvasMounted(page, 8000);
  if (!mounted.ok) throw new Error(`${routeId}: canvas did not mount`);
  await page.waitForTimeout(140);

  const frames = { t0: await captureSignature(page, sampleStep) };
  const playInfo = await utils.clickPlay(page);
  if (!playInfo.clicked && !playInfo.alreadyRunning) {
    throw new Error(`${routeId}: expected Play button for visual evolution capture`);
  }

  for (const target of [1, 2, 3]) {
    const reached = await utils.waitForEngineTime(page, target, { timeoutMs: 5000 });
    if (reached === null) throw new Error(`${routeId}: engine time did not reach ${target}s`);
    frames[`t${target}`] = await captureSignature(page, sampleStep);
  }

  await pauseIfRunning(page);
  return { routeId, frames };
}

async function captureSignature(page, sampleStep) {
  return page.evaluate(step => {
    const canvas = document.querySelector('#content-area canvas');
    if (!canvas) return { error: 'no-canvas' };
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const samples = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (y * width + x) * 4;
        samples.push(data[idx], data[idx + 1], data[idx + 2], data[idx + 3]);
      }
    }
    return { width, height, step, samples };
  }, sampleStep);
}

function summarizeRoute(routeResult) {
  const summary = { frameCount: 4, frames: {} };
  for (const key of ['t0', 't1', 't2', 't3']) {
    const frame = routeResult.frames[key];
    summary.frames[key] = {
      width: frame.width,
      height: frame.height,
      step: frame.step,
      samples: frame.samples,
    };
  }
  return summary;
}

function diffPct(a, b, threshold) {
  if (!a || !b || !Array.isArray(a.samples) || !Array.isArray(b.samples)) return 1;
  if (a.width !== b.width || a.height !== b.height || a.step !== b.step) return 1;
  const len = Math.min(a.samples.length, b.samples.length);
  let changed = 0;
  let total = 0;
  for (let i = 0; i < len; i += 4) {
    const dr = Math.abs(a.samples[i] - b.samples[i]);
    const dg = Math.abs(a.samples[i + 1] - b.samples[i + 1]);
    const db = Math.abs(a.samples[i + 2] - b.samples[i + 2]);
    const da = Math.abs(a.samples[i + 3] - b.samples[i + 3]);
    if (dr + dg + db + da > threshold) changed++;
    total++;
  }
  return total ? changed / total : 1;
}

async function pauseIfRunning(page) {
  await page.evaluate(() => {
    const button = document.querySelector('#content-area [data-sim-play]');
    if (button && (button.textContent || '').includes('Dừng')) button.click();
  });
}
