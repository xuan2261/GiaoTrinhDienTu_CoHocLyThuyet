/**
 * capture-sims.spec.js — DEV-ONLY: mount từng route trên fixture, phân loại runtime
 * (.sim2-playback → dynamic), chụp ảnh thật vùng .sim2-root theo plan (Phase 01),
 * lưu PNG + capture-manifest.json cho contact-sheet (Phase 03).
 *
 * KHÔNG nằm trong release (config riêng playwright.visual.config.cjs).
 * Chạy: npm run test:sim:visual:capture
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '../..');
const manifest = require(path.join(ROOT, 'js/sim2/sim2-route-manifest.js'));
const { buildCapturePlan, artifactName } = require('./capture-plan.js');
const { validateCapture } = require('./validate-capture.js');
const { SIM2: SIM2_TARGETS } = require(path.join(ROOT, 'tools/sim-probe/probe-targets.js'));
const { fatalConsoleMessage } = require('../sim-validation/browser-console-policy.js');

// 5 route bespoke-drag (0 slider) → frame drag-far. Selector từ route-map (mọi route .sim2-handle).
const DRAG_ROUTES = ['ch1-1-5', 'ch1-2-3', 'ch1-6-3', 'ch2-1-3', 'ch2-5-2'];

/**
 * interactionTargets cho buildCapturePlan: 16 slider (probe-targets SIM2, control chính =
 * targets[0]) + 5 drag (.sim2-handle). lo/hi clamp local-monotonic giữ nguyên từ probe-targets.
 */
function buildInteractionTargets() {
  const it = {};
  for (const id of Object.keys(SIM2_TARGETS)) {
    const t = SIM2_TARGETS[id][0];
    it[id] = { kind: 'slider', control: t.control, lo: t.lo != null ? t.lo : null, hi: t.hi != null ? t.hi : null };
  }
  for (const id of DRAG_ROUTES) it[id] = { kind: 'drag', selector: '.sim2-handle' };
  return it;
}
const INTERACTION_TARGETS = buildInteractionTargets();

const OUT_DIR = path.join(ROOT, 'plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals');
const fixtureFor = ch =>
  `file:///${path.join(ROOT, `tests/fixtures/sim2-ch${ch}.html`).replace(/\\/g, '/')}`;

const STEP_DEFAULTS = { N1: 60, N2: 120 };
// Per-sim override mốc frame (sim wrap sớm) — Claude điền sau khi soi (Phase 03).
const OVERRIDES = {};
const CAPTURE_RUN_ID = crypto.randomUUID();
const RUN_DIR = path.join(OUT_DIR, 'runs', CAPTURE_RUN_ID);

const records = [];          // tích luỹ qua các test (workers:1) → ghi json ở afterAll
let plannedShotTotal = 0;
fs.mkdirSync(RUN_DIR, { recursive: true });

/** Click nút step n lần trong 1 round-trip (deterministic, nhanh). */
async function stepN(page, n) {
  if (n <= 0) return;
  await page.evaluate((count) => {
    const btn = document.querySelector('#host .sim2-step');
    if (!btn) return;
    for (let i = 0; i < count; i++) btn.click();
  }, n);
}

/** Chờ k nhịp requestAnimationFrame (cho readout sống / sim tự animate settle). */
async function waitRaf(page, k) {
  await page.evaluate((n) => new Promise((resolve) => {
    let i = 0;
    (function tick() {
      if (++i >= n) return resolve();
      requestAnimationFrame(tick);
    })();
  }), k);
}

/** Set slider value + bắn 'input' (kích hoạt onInput → render). Trả false nếu không tìm thấy. */
async function setSlider(page, id, value) {
  return page.evaluate(({ sid, v }) => {
    const el = document.querySelector(`#host input[data-id="${sid}"]`);
    if (!el) return false;
    el.value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }, { sid: id, v: value });
}

/** Đọc {min,max} + value hiện tại của slider. null nếu không có. */
async function sliderRange(page, id) {
  return page.evaluate((sid) => {
    const el = document.querySelector(`#host input[data-id="${sid}"]`);
    if (!el) return null;
    return { min: parseFloat(el.min), max: parseFloat(el.max), value: parseFloat(el.value) };
  }, id);
}

/** Biên XA init nhất (clamp lo/hi nếu có): init>=mid ? lo??min : hi??max (red-team #4). */
function farTarget(range, lo, hi) {
  const mid = (range.min + range.max) / 2;
  return range.value >= mid ? (lo != null ? lo : range.min) : (hi != null ? hi : range.max);
}

/** Click .sim2-reset nếu có (đưa playback về t=0, stop). Trả true nếu đã click. */
async function resetPlayback(page) {
  return page.evaluate(() => {
    const r = document.querySelector('#host .sim2-reset');
    if (r) { r.click(); return true; }
    return false;
  });
}

/**
 * Poll readout panel ổn định: chụp signature toàn bộ readout-value 2 lần liên tiếp giống
 * nhau (feedback có thể ở readout-số, không chỉ scene). Fallback waitRaf(4) nếu không ổn định.
 */
async function pollReadoutStable(page, tries) {
  const sig = () => page.evaluate(() =>
    Array.from(document.querySelectorAll('#host .sim2-readout-value')).map(e => e.textContent).join('|'));
  let prev = await sig();
  for (let i = 0; i < (tries || 6); i++) {
    await waitRaf(page, 2);
    const cur = await sig();
    if (cur === prev) return;
    prev = cur;
  }
  await waitRaf(page, 4);
}

/** Kéo handle đầu tiên một đoạn xác định trong vùng SVG (tái dùng logic probe-runner). */
async function dragHandle(page, selector) {
  const handle = page.locator(`#host ${selector}`).first();
  if (await handle.count() === 0) return false;
  const hb = await handle.boundingBox();
  const sb = await page.locator('#host .sim2-root').boundingBox();
  if (!hb || !sb) return false;
  const sx = hb.x + hb.width / 2, sy = hb.y + hb.height / 2;
  let dx = sb.width * 0.28;
  if (sx + dx > sb.x + sb.width - 12) dx = -dx;
  let ex = sx + dx;
  let ey = sy - sb.height * 0.12;
  ex = Math.max(sb.x + 12, Math.min(sb.x + sb.width - 12, ex));
  ey = Math.max(sb.y + 12, Math.min(sb.y + sb.height - 12, ey));
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(ex, ey, { steps: 10 });
  await page.mouse.up();
  await waitRaf(page, 2);
  return true;
}

test.describe('sim2 visual capture — 25 route (manifest-driven, dev-only)', () => {
  for (const r of manifest) {
    test(`capture ${r.id}`, async ({ page }) => {
      const errors = [];
      page.on('console', m => { const fatal = fatalConsoleMessage(m.type(), m.text()); if (fatal) errors.push(fatal); });
      page.on('pageerror', e => errors.push(`pageerror: ${String(e)}`));
      await page.goto(fixtureFor(r.chapter), { waitUntil: 'domcontentloaded' });
      // Fixture chỉ nạp katex.css → thiếu rule .sim2-legend/stage/theory của app.
      // Inject app stylesheet (dev-only) để chụp ĐÚNG diện mạo runtime thật (legend có
      // chấm màu, panel side-by-side). KHÔNG sửa fixture chia sẻ với mount-test.
      await page.addStyleTag({ path: path.join(ROOT, 'css/style.css') });
      // Nới host TRƯỚC mount: card thật = stage(viewport+panel cạnh) + control bar dưới.
      // Fixture mặc định 520×380 sẽ clip panel/control → chụp thiếu tầng trình bày.
      await page.evaluate(() => {
        // Fixture không khai data-theme → :root lấy token DARK (--tx:#e8ecf1 gần trắng).
        // Card thật luôn render trên nền sáng (.sim2-viewport/.sim2-theory hardcode #fdfdfb;
        // app light-theme tx=#1a1a2e). Ép light để tiêu đề card (color:var(--tx)) đậm,
        // đọc rõ trên host nền trắng → ảnh eval khớp diện mạo runtime, hết "chữ trắng trên trắng".
        document.documentElement.setAttribute('data-theme', 'light');
        const h = document.getElementById('host');
        h.style.width = '960px'; h.style.height = 'auto';
        h.style.minHeight = '560px'; h.style.padding = '16px';
        h.style.background = '#fff'; h.style.boxSizing = 'border-box';
      });
      await page.evaluate(id => { window.__sim = window.SIM_MAP[id](document.getElementById('host')); }, r.id);

      // Phân loại runtime: có playback bar → dynamic.
      const isDynamic = (await page.locator('#host .sim2-playback').count()) > 0;
      const [job] = buildCapturePlan([r], { [r.id]: isDynamic ? 'dynamic' : 'static' },
        { stepDefaults: STEP_DEFAULTS, overrides: OVERRIDES, interactionTargets: INTERACTION_TARGETS });

      // Chụp TOÀN card (#host): viewport + theory panel + legend + control bar.
      // .sim2-root chỉ là vùng SVG → chụp riêng sẽ mất panel/control (bug eval lần trước).
      await expect(page.locator('#host .sim2-root'), `${r.id} .sim2-root tồn tại`).toHaveCount(1);
      const root = page.locator('#host');

      const images = [];
      let curFrame = 0;
      for (const shot of job.shots) {
        if (shot.kind === 'slider' || shot.kind === 'drag') {
          // Interaction-far: set control tới biên XA init rồi chụp. Nhánh này đặt TRƯỚC
          // nhánh dynamic (red-team #2) — shot frame-null KHÔNG được rơi vào logic step.
          // Dynamic eligible: reset playback (t=0, stop) TRƯỚC khi set control (ràng buộc #7).
          if (job.kind === 'dynamic') { await resetPlayback(page); await waitRaf(page, 1); }
          if (shot.kind === 'slider') {
            const range = await sliderRange(page, shot.control);
            if (!range) throw new Error(`${r.id} slider-far control not found: ${shot.control}`);
            const changed = await setSlider(page, shot.control, farTarget(range, shot.lo, shot.hi));
            if (!changed) throw new Error(`${r.id} slider-far control could not be driven: ${shot.control}`);
            await pollReadoutStable(page, 6);
          } else {
            const ok = await dragHandle(page, shot.selector);
            if (!ok) throw new Error(`${r.id} drag-far handle not found: ${shot.selector}`);
          }
        } else if (job.kind === 'dynamic') {
          if (shot.frame != null && shot.frame > curFrame) {
            await stepN(page, shot.frame - curFrame);
            curFrame = shot.frame;
          }
          // Ép 1 paint frame commit sau step (sim đã stop() → KHÔNG advance, chỉ paint).
          await waitRaf(page, 1);
        } else if (shot.label === 'live') {
          await waitRaf(page, 2);   // static: để readout sống / animate nhẹ settle
        }
        const file = artifactName({ route: r.id, label: shot.label });
        const png = await root.screenshot({ path: path.join(RUN_DIR, file) });
        images.push({ label: shot.label, file, src: `runs/${CAPTURE_RUN_ID}/${file}`, bytes: png.length, sha256: crypto.createHash('sha256').update(png).digest('hex') });
      }
      records.push({
        runId: CAPTURE_RUN_ID, route: r.id, chapter: r.chapter, section: job.section,
        name: r.name, kind: job.kind, expectedShots: job.shots.map(shot => shot.label), images,
        pageErrors: errors.slice()
      });
      plannedShotTotal += job.shots.length;

      await page.evaluate(() => {
        if (!window.__sim || typeof window.__sim.dispose !== 'function') throw new Error('simulation missing dispose');
        window.__sim.dispose();
      });

      expect(errors, `console errors ${r.id}:\n${errors.join('\n')}`).toEqual([]);
    });
  }

  test.afterAll(() => {
    const payload = {
      runId: CAPTURE_RUN_ID,
      generatedAt: new Date().toISOString(),
      artifactDir: `runs/${CAPTURE_RUN_ID}`,
      routes: records
    };
    validateCapture(payload, Date.now(), OUT_DIR);
    fs.writeFileSync(
      path.join(OUT_DIR, 'capture-manifest.json'),
      JSON.stringify(payload, null, 2), 'utf8'
    );
    const totalImgs = records.reduce((a, x) => a + x.images.length, 0);
    expect(totalImgs, 'tổng ảnh === Σ shots theo plan').toBe(plannedShotTotal);
    expect(records.length, 'capture phải phủ đúng manifest').toBe(manifest.length);
  });
});
