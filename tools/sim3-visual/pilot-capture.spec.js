const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { renderContactSheet } = require('../sim2-visual/contact-sheet.js');
const { targetsFor } = require('../sim-probe/probe-targets.js');
const sim2Manifest = require('../../js/sim2/sim2-route-manifest.js');
const sim3Manifest = require('../../js/sim3/sim3-route-manifest.js');
const { validateSim3Capture } = require('./validate-capture.js');
const { fatalConsoleMessage } = require('../sim-validation/browser-console-policy.js');

/** Set slider value + bắn 'input'. false nếu không tìm thấy. */
async function setSlider(page, id, value) {
  return page.evaluate(({ sid, v }) => {
    const el = document.querySelector(`#host input[data-id="${sid}"]`);
    if (!el) return false;
    el.value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }, { sid: id, v: value });
}

async function sliderRange(page, id) {
  return page.evaluate((sid) => {
    const el = document.querySelector(`#host input[data-id="${sid}"]`);
    if (!el) return null;
    return { min: parseFloat(el.min), max: parseFloat(el.max), value: parseFloat(el.value) };
  }, id);
}

/** Biên XA init nhất (clamp lo/hi): init>=mid ? lo??min : hi??max (red-team #4). */
function farTarget(range, lo, hi) {
  const mid = (range.min + range.max) / 2;
  return range.value >= mid ? (lo != null ? lo : range.min) : (hi != null ? hi : range.max);
}

async function waitRaf(page, k) {
  await page.evaluate((n) => new Promise((resolve) => {
    let i = 0;
    (function tick() { if (++i >= n) return resolve(); requestAnimationFrame(tick); })();
  }), k);
}

/** Đọc 1 field số trong __SIM3_DEBUG__[id] theo đường dẫn "a.b.c". null nếu thiếu. */
async function readSim3Field(page, id, fieldPath) {
  return page.evaluate(({ rid, fp }) => {
    const dbg = window.__SIM3_DEBUG__ && window.__SIM3_DEBUG__[rid];
    if (!dbg) return null;
    let cur = dbg;
    for (const p of String(fp).split('.')) { if (cur == null) return null; cur = cur[p]; }
    return typeof cur === 'number' ? cur : null;
  }, { rid: id, fp: fieldPath });
}

/** Poll field 3D ổn định (settle bất đồng bộ) — 2 lần đọc giống nhau, fallback waitRaf(6). */
async function pollSim3FieldStable(page, id, fieldPath, tries) {
  let prev = await readSim3Field(page, id, fieldPath);
  for (let i = 0; i < (tries || 8); i++) {
    await waitRaf(page, 2);
    const cur = await readSim3Field(page, id, fieldPath);
    if (cur != null && cur === prev) return;
    prev = cur;
  }
  await waitRaf(page, 6);
}

const ROOT = path.resolve(__dirname, '../..');
const OUT_DIR = process.env.SIM3_VISUAL_OUT_DIR
  ? path.resolve(process.env.SIM3_VISUAL_OUT_DIR)
  : path.join(ROOT, 'plans/260605-sim3-visual-quality-upgrade-tdd/visuals/final');
const TARGET_ROUTES = new Set(['ch1-1-5', 'ch2-3-2', 'ch3-6-2']);
const STEPS = { 'ch2-2-2': 8, 'ch2-3-2': 8, 'ch2-4-4': 16, 'ch3-5-3': 8, 'ch3-6-2': 112 };
const cases = sim3Manifest.map(route => {
  const base = sim2Manifest.find(candidate => candidate.id === route.baseRouteId);
  return {
    id: route.id, chapter: route.chapter, section: route.id.replace(new RegExp(`^ch${route.chapter}-`), '').replace(/-/g, '.'),
    fixture: `sim2-ch${route.chapter}.html`, name: base.name, steps: STEPS[route.id] || 0,
    phase: route.id === 'ch3-6-2' ? 'after' : undefined
  };
});
const SIM3_CAPTURE_RUN_ID = crypto.randomUUID();
const RUN_DIR = path.join(OUT_DIR, 'runs', SIM3_CAPTURE_RUN_ID);

const records = [];

function fixtureUrl(name) {
  return `file:///${path.join(ROOT, `tests/fixtures/${name}`).replace(/\\/g, '/')}`;
}

test.describe('sim3 pilot visual capture', () => {
  test.beforeAll(() => fs.mkdirSync(RUN_DIR, { recursive: true }));
  test.afterAll(() => {
    const payload = {
      runId: SIM3_CAPTURE_RUN_ID,
      generatedAt: new Date().toISOString(),
      artifactDir: `runs/${SIM3_CAPTURE_RUN_ID}`,
      routes: records
    };
    validateSim3Capture(payload, Date.now(), OUT_DIR);
    fs.writeFileSync(path.join(OUT_DIR, 'capture-manifest.json'), JSON.stringify(payload, null, 2), 'utf8');
    fs.writeFileSync(path.join(OUT_DIR, 'contact-sheet.html'), renderContactSheet(records), 'utf8');
  });

  for (const cfg of cases) {
    test(`capture ${cfg.id} 3D`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(`pageerror: ${String(error)}`));
      page.on('console', message => { const fatal = fatalConsoleMessage(message.type(), message.text()); if (fatal) pageErrors.push(fatal); });
      await page.goto(fixtureUrl(cfg.fixture), { waitUntil: 'domcontentloaded' });
      await page.addStyleTag({ path: path.join(ROOT, 'css/style.css') });
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        const h = document.getElementById('host');
        h.style.width = '960px';
        h.style.height = 'auto';
        h.style.minHeight = '560px';
        h.style.padding = '16px';
        h.style.background = '#fff';
      });
      await page.evaluate(id => { window.__sim = window.SIM_MAP[id](document.getElementById('host')); }, cfg.id);
      await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
      await expect(page.locator('#host canvas.sim3-canvas')).toBeVisible();
      await page.evaluate(n => {
        const step = document.querySelector('#host .sim2-step');
        for (let i = 0; i < n && step; i++) step.click();
      }, cfg.steps);
      if (cfg.phase === 'after') {
        await expect.poll(async () => page.evaluate(id => window.__SIM3_DEBUG__ && window.__SIM3_DEBUG__[id] && window.__SIM3_DEBUG__[id].phaseCue, cfg.id), {
          timeout: 1000
        }).toBe('after');
      }
      const file = `${cfg.id}-sim3.png`;
      const png = await page.locator('#host').screenshot({ path: path.join(RUN_DIR, file) });
      const images = [{ label: 'final audit', file, src: `runs/${SIM3_CAPTURE_RUN_ID}/${file}`, bytes: png.length, sha256: crypto.createHash('sha256').update(png).digest('hex') }];
      const audit = await page.evaluate(id => {
        const host = document.getElementById('host');
        const labels = Array.from(host.querySelectorAll('.sim3-label')).filter(el => getComputedStyle(el).display !== 'none');
        const boxes = labels.map(el => {
          const r = el.getBoundingClientRect();
          return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        });
        let overlaps = 0;
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i], b = boxes[j];
            if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) overlaps++;
          }
        }
        const metrics = window.__SIM3_DEBUG__ && window.__SIM3_DEBUG__[id] && window.__SIM3_DEBUG__[id].visualMetrics || {};
        return { overlaps, visibleLabelCount: labels.length, metrics };
      }, cfg.id);
      const measuredMargin = audit.metrics.projectedMarginPx;
      const safeCrop = typeof measuredMargin === 'number' ? measuredMargin >= 24 : null;
      const routeFlags = [];
      if (cfg.id === 'ch1-1-5') {
        const ratio = audit.metrics.resultantDominanceRatio;
        routeFlags.push(
          { severity: ratio >= 1.05 && ratio <= 1.25 ? 'ok' : 'high', note: `R-ratio=${Number(ratio || 0).toFixed(2)}` },
          { severity: audit.metrics.resultantCueRole === 'functional-resultant-not-decoration' ? 'ok' : 'high', note: `R-role=${audit.metrics.resultantCueRole || 'missing'}` },
          { severity: audit.metrics.resultantDecorativeRisk === 'low' ? 'ok' : 'high', note: `R-decorative=${audit.metrics.resultantDecorativeRisk || 'missing'}` }
        );
      }
      if (cfg.id === 'ch3-6-2') {
        routeFlags.push(
          { severity: audit.metrics.noGhostTrail === true ? 'ok' : 'high', note: `noGhostTrail=${audit.metrics.noGhostTrail === true}` },
          { severity: audit.metrics.ghostCount === 0 ? 'ok' : 'high', note: `ghostCount=${Number(audit.metrics.ghostCount || 0)}` },
          { severity: audit.metrics.trailDotCountMax === 0 ? 'ok' : 'high', note: `trailDots=${Number(audit.metrics.trailDotCountMax || 0)}` }
        );
      }
      if (cfg.id === 'ch2-3-2') {
        routeFlags.push(
          { severity: audit.metrics.beltLabelSemanticTarget === 'belt-span' ? 'ok' : 'high', note: `beltLabel=${audit.metrics.beltLabelSemanticTarget || 'missing'}` },
          { severity: audit.metrics.beltLabelSpanCoverage >= 0.55 ? 'ok' : 'high', note: `beltSpan=${Number(audit.metrics.beltLabelSpanCoverage || 0).toFixed(2)}` },
          { severity: audit.metrics.labelFaceCoverageMax <= 0.05 ? 'ok' : 'high', note: `faceCover=${Number(audit.metrics.labelFaceCoverageMax || 0).toFixed(2)}` }
        );
      }

      // Sim3 slider-far (đường bespoke): route có #sim3 target → set slider biên XA init, chụp
      // frame 3D sau settle. Chỉ chụp khi WebGL canvas hiện (fallback-2d → state 3D vô nghĩa, bỏ).
      const tg3 = targetsFor(cfg.id + '#sim3');
      const canvasVisible = await page.locator('#host canvas.sim3-canvas').isVisible().catch(() => false);
      if (tg3 && canvasVisible) {
        const t = tg3.targets[0];
        // Reset playback (t=0, stop) TRƯỚC set control → frame không trộn step tích luỹ.
        await page.evaluate(() => { const r = document.querySelector('#host .sim2-reset'); if (r) r.click(); });
        await waitRaf(page, 2);
        const range = await sliderRange(page, t.control);
        if (!range) throw new Error(`${cfg.id} slider-far control not found: ${t.control}`);
        const changed = await setSlider(page, t.control, farTarget(range, t.lo, t.hi));
        if (!changed) throw new Error(`${cfg.id} slider-far control could not be driven: ${t.control}`);
        await pollSim3FieldStable(page, cfg.id, t.field, 8);
        const farFile = `${cfg.id}-sim3__slider-far.png`;
        const farPng = await page.locator('#host').screenshot({ path: path.join(RUN_DIR, farFile) });
        images.push({ label: 'slider-far', file: farFile, src: `runs/${SIM3_CAPTURE_RUN_ID}/${farFile}`, bytes: farPng.length, sha256: crypto.createHash('sha256').update(farPng).digest('hex') });
      }

      records.push({
        runId: SIM3_CAPTURE_RUN_ID,
        route: cfg.id,
        chapter: cfg.chapter,
        section: cfg.section,
        name: cfg.name,
        kind: TARGET_ROUTES.has(cfg.id) ? 'target-polish' : 'sim3',
        expectedShots: images.map(image => image.label),
        images,
        pageErrors: pageErrors.slice(),
        flags: [
          { severity: audit.overlaps === 0 ? 'ok' : 'high', note: `overlap=${audit.overlaps}` },
          { severity: safeCrop === true ? 'ok' : 'low', note: safeCrop == null ? 'safeCrop=not-measured' : `safeCrop=${safeCrop} margin=${measuredMargin}px` },
          ...(TARGET_ROUTES.has(cfg.id) ? [
            { severity: audit.metrics.physicalMeaningCue ? 'ok' : 'high', note: `cue=${audit.metrics.physicalMeaningCue || 'missing'}` },
            { severity: audit.metrics.primarySceneFillRatio >= 0.35 ? 'ok' : 'low', note: `fill=${Number(audit.metrics.primarySceneFillRatio || 0).toFixed(2)}` },
            { severity: audit.visibleLabelCount <= 3 ? 'ok' : 'low', note: `labels=${audit.visibleLabelCount}` },
            ...routeFlags
          ] : []),
          { severity: TARGET_ROUTES.has(cfg.id) ? 'ok' : 'low', note: TARGET_ROUTES.has(cfg.id) ? 'polished-target' : 'reference' }
        ]
      });
      expect(pageErrors, `browser warnings/errors ${cfg.id}`).toEqual([]);
      await page.evaluate(() => window.__sim.dispose());
    });
  }
});
