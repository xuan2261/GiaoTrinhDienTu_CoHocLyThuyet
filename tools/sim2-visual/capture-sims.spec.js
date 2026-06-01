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

const ROOT = path.resolve(__dirname, '../..');
const manifest = require(path.join(ROOT, 'js/sim2/sim2-route-manifest.js'));
const { buildCapturePlan, artifactName } = require('./capture-plan.js');

const OUT_DIR = path.join(ROOT, 'plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals');
const fixtureFor = ch =>
  `file:///${path.join(ROOT, `tests/fixtures/sim2-ch${ch}.html`).replace(/\\/g, '/')}`;

const STEP_DEFAULTS = { N1: 60, N2: 120 };
// Per-sim override mốc frame (sim wrap sớm) — Claude điền sau khi soi (Phase 03).
const OVERRIDES = {};

const records = [];          // tích luỹ qua các test (workers:1) → ghi json ở afterAll
let plannedShotTotal = 0;

fs.mkdirSync(OUT_DIR, { recursive: true });

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

test.describe('sim2 visual capture — 25 route (manifest-driven, dev-only)', () => {
  for (const r of manifest) {
    test(`capture ${r.id}`, async ({ page }) => {
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push(String(e)));

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
        { stepDefaults: STEP_DEFAULTS, overrides: OVERRIDES });

      // Chụp TOÀN card (#host): viewport + theory panel + legend + control bar.
      // .sim2-root chỉ là vùng SVG → chụp riêng sẽ mất panel/control (bug eval lần trước).
      await expect(page.locator('#host .sim2-root'), `${r.id} .sim2-root tồn tại`).toHaveCount(1);
      const root = page.locator('#host');

      const images = [];
      let curFrame = 0;
      for (const shot of job.shots) {
        if (job.kind === 'dynamic') {
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
        await root.screenshot({ path: path.join(OUT_DIR, file) });
        images.push({ label: shot.label, src: file });
      }

      records.push({
        route: r.id, chapter: r.chapter, section: job.section,
        name: r.name, kind: job.kind, images
      });
      plannedShotTotal += job.shots.length;

      // Dispose sạch (không bắt buộc vì page fresh mỗi test, nhưng giữ pattern).
      await page.evaluate(() => { try { window.__sim && window.__sim.dispose(); } catch (e) {} });

      expect(errors, `console errors ${r.id}:\n${errors.join('\n')}`).toEqual([]);
    });
  }

  test.afterAll(() => {
    fs.writeFileSync(
      path.join(OUT_DIR, 'capture-manifest.json'),
      JSON.stringify(records, null, 2), 'utf8'
    );
    const totalImgs = records.reduce((a, x) => a + x.images.length, 0);
    // Kiểm nội bộ: đúng số ảnh đã lên kế hoạch cho ĐÚNG subset đã chạy (cho phép smoke từng chương).
    // Phủ-đủ-25-route verify ở build-contact-sheet.js (Phase 03) so capture-manifest ↔ route-manifest.
    expect(totalImgs, 'tổng ảnh === Σ shots theo plan').toBe(plannedShotTotal);
    expect(records.length, 'có ≥1 route được chụp').toBeGreaterThan(0);
  });
});
