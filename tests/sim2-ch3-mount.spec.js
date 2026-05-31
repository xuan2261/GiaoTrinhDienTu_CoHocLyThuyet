const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FIXTURE_URL = `file:///${path.join(ROOT, 'tests/fixtures/sim2-ch3.html').replace(/\\/g, '/')}`;

const CH3_ROUTES = ['ch3-2-2', 'ch3-2-3', 'ch3-1-3', 'ch3-3-1', 'ch3-5-2', 'ch3-5-3', 'ch3-5-4', 'ch3-6-2'];
const CANVAS_ROUTES = ['ch3-6-2']; // #25 vết va chạm

function overlaps(a, b) {
  const m = 1;
  return a.x < b.x + b.w - m && a.x + a.w - m > b.x &&
         a.y < b.y + b.h - m && a.y + a.h - m > b.y;
}
function findOverlap(boxes) {
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++)
      if (overlaps(boxes[i], boxes[j])) return `"${boxes[i].text}" ⟂ "${boxes[j].text}"`;
  return null;
}
async function labelBoxes(page) {
  return page.$$eval('#host .sim2-label', els => els.map(el => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, text: el.textContent.trim() };
  }));
}

test.describe('sim2 Ch3 — 8 sim động lực học mount', () => {
  for (const route of CH3_ROUTES) {
    test(`${route}: mount, nhãn không chồng, dispose hủy RAF, 0 error`, async ({ page }) => {
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push(String(e)));

      await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });
      const isFactory = await page.evaluate(r => typeof (window.SIM_MAP || {})[r] === 'function', route);
      expect(isFactory, `SIM_MAP['${route}'] factory`).toBe(true);

      await page.evaluate(r => { window.__sim = window.SIM_MAP[r](document.getElementById('host')); }, route);
      await expect(page.locator('#host svg.sim2-svg')).toHaveCount(1);
      await expect(page.locator('#host .sim2-label').first()).toBeVisible();

      const clash = findOverlap(await labelBoxes(page));
      expect(clash, `nhãn chồng ${route}: ${clash}`).toBeNull();

      // ch3-2-2: graph KHÔNG rỗng sau vài frame (defect cũ graph trống)
      if (route === 'ch3-2-2') {
        // start-paused (P4): bấm ▶ TRƯỚC khi chờ rồi mới assert graph (giữ ngưỡng >2 điểm)
        const play = page.locator('#host .sim2-playpause');
        if (await play.count()) await play.click();
        await page.waitForTimeout(400);
        const graphPts = await page.evaluate(() => {
          const poly = document.querySelector('#host .sim2-graph');
          if (!poly) return 0;
          const p = poly.getAttribute('points') || '';
          return p.trim().split(/\s+/).filter(Boolean).length;
        });
        expect(graphPts, 'ch3-2-2 graph phải có điểm sau khi chạy').toBeGreaterThan(2);
      }

      // #25 canvas underlay
      if (CANVAS_ROUTES.includes(route)) {
        await expect(page.locator('#host canvas.sim2-canvas')).toHaveCount(1);
        // start-paused (P1): bấm ▶ TRƯỚC khi chờ → canvas mới có vết (không nới assertion trail)
        const play = page.locator('#host .sim2-playpause');
        if (await play.count()) await play.click();
        await page.waitForTimeout(400);
        const hasContent = await page.evaluate(() => {
          const c = document.querySelector('#host canvas.sim2-canvas');
          const ctx = c.getContext('2d');
          const d = ctx.getImageData(0, 0, c.width, c.height).data;
          for (let i = 3; i < d.length; i += 4) if (d[i] !== 0) return true;
          return false;
        });
        expect(hasContent, `${route} canvas phải có nội dung`).toBe(true);
        const aligned = await page.evaluate(() => {
          const c = document.querySelector('#host canvas.sim2-canvas');
          const s = document.querySelector('#host svg.sim2-svg');
          const cr = c.getBoundingClientRect(), sr = s.getBoundingClientRect();
          return Math.abs(cr.x - sr.x) <= 1 && Math.abs(cr.y - sr.y) <= 1 &&
                 Math.abs(cr.width - sr.width) <= 1 && Math.abs(cr.height - sr.height) <= 1;
        });
        expect(aligned, `${route} canvas khớp SVG ≤1px`).toBe(true);
      }

      await page.evaluate(() => window.__sim.dispose());
      await expect(page.locator('#host svg')).toHaveCount(0);
      await expect(page.locator('#host .sim2-root')).toHaveCount(0);

      expect(errors, `console errors ${route}:\n${errors.join('\n')}`).toEqual([]);
    });
  }
});

// ─── Pilot P1: ch3-6-2 playback + slider e/m₁/m₂ + panel + reset ───
test.describe('sim2 Ch3 pilot — ch3-6-2 (playback + slider + panel)', () => {
  // Đọc cx vật thể đầu tiên (b1) — ch3-6-2 không có handle nên circle đầu là vật va chạm.
  const bodyCx = () =>
    document.querySelector('#host svg circle').getAttribute('cx');

  test('ch3-6-2: start paused; ▶ chạy; ⏸ dừng RAF; ↺ reset; 3 slider + panel; dispose sạch', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));

    await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__sim = window.SIM_MAP['ch3-6-2'](document.getElementById('host')); });

    // Control: 3 slider (e, m1, m2) + playback 3 nút
    await expect(page.locator('#host .sim2-controls input[type=range]')).toHaveCount(3);
    await expect(page.locator('#host .sim2-playback button')).toHaveCount(3);
    await expect(page.locator('#host .sim2-playpause')).toHaveText(/▶/);

    // Panel: formula + legend (m₁, m₂) + readout sống
    await expect(page.locator('#host .sim2-theory')).toHaveCount(1);
    expect(await page.locator('#host .sim2-formula').count()).toBeGreaterThanOrEqual(1);
    expect(await page.locator('#host .sim2-legend-item').count()).toBeGreaterThanOrEqual(2);

    // Start paused: cx KHÔNG đổi sau 250ms khi chưa bấm ▶
    const cxPaused0 = await page.evaluate(bodyCx);
    await page.waitForTimeout(250);
    const cxPaused1 = await page.evaluate(bodyCx);
    expect(cxPaused1, 'start paused: vật không di chuyển trước khi bấm ▶').toBe(cxPaused0);

    // ▶ → chạy: cx đổi, nút thành ⏸
    await page.locator('#host .sim2-playpause').click();
    await expect(page.locator('#host .sim2-playpause')).toHaveText(/⏸/);
    await page.waitForTimeout(250);
    const cxRun = await page.evaluate(bodyCx);
    expect(cxRun, '▶ phải làm vật di chuyển').not.toBe(cxPaused0);

    // ⏸ → dừng RAF: cx freeze sau 250ms
    await page.locator('#host .sim2-playpause').click();
    await expect(page.locator('#host .sim2-playpause')).toHaveText(/▶/);
    const cxPause = await page.evaluate(bodyCx);
    await page.waitForTimeout(250);
    const cxPauseAfter = await page.evaluate(bodyCx);
    expect(cxPauseAfter, '⏸ phải dừng RAF (cx đứng yên)').toBe(cxPause);

    // ↺ reset → về trạng thái đầu (cx về vị trí ban đầu)
    await page.locator('#host .sim2-reset').click();
    await page.waitForTimeout(30);
    const cxReset = await page.evaluate(bodyCx);
    expect(Math.abs(parseFloat(cxReset) - parseFloat(cxPaused0)), '↺ phải đưa vật về vị trí đầu').toBeLessThan(1);

    // slider e → output cập nhật (đổi tham số va chạm)
    await page.evaluate(() => {
      const e = document.querySelector('#host .sim2-controls input[data-id=e]');
      e.value = '0.2'; e.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(await page.locator('#host .sim2-controls input[data-id=e]').inputValue()).toBe('0.2');

    // dispose sạch: 0 root/controls/theory/canvas; bắn input sau dispose không nổ
    await page.evaluate(() => {
      window.__orphanSlider = document.querySelector('#host .sim2-controls input[data-id=e]');
      window.__sim.dispose();
    });
    await expect(page.locator('#host .sim2-root')).toHaveCount(0);
    await expect(page.locator('#host .sim2-controls')).toHaveCount(0);
    await expect(page.locator('#host .sim2-theory')).toHaveCount(0);
    await expect(page.locator('#host canvas.sim2-canvas')).toHaveCount(0);
    await page.evaluate(() => {
      window.__orphanSlider.value = '0.9';
      window.__orphanSlider.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(errors, `console errors ch3-6-2 pilot:\n${errors.join('\n')}`).toEqual([]);
  });
});

// ─── P4 retrofit: 7 sim Ch3 còn lại (panel + legend + control; playback start-paused cho sim động) ───
const CH3_RETROFIT = [
  { route: 'ch3-2-2', sliders: 2, playback: true },   // F, m + graph v(t)
  { route: 'ch3-2-3', sliders: 1, playback: false },  // F (lực–phản lực) + drag
  { route: 'ch3-1-3', sliders: 1, playback: false },  // a toa (HQC) + drag
  { route: 'ch3-3-1', sliders: 2, playback: true },   // k, m (ODE RK4) + graph x(t)
  { route: 'ch3-5-2', sliders: 2, playback: false },  // F, t (động lượng) + drag
  { route: 'ch3-5-3', sliders: 1, playback: true },   // r (bảo toàn mô men) + quay
  { route: 'ch3-5-4', sliders: 1, playback: false }   // F (động năng) + drag
];

test.describe('sim2 Ch3 P4 — retrofit 7 sim (panel + legend + control + playback)', () => {
  for (const cfg of CH3_RETROFIT) {
    test(`${cfg.route}: panel + legend + ${cfg.sliders} slider${cfg.playback ? ' + playback' : ''}; dispose sạch`, async ({ page }) => {
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push(String(e)));

      await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });
      await page.evaluate(r => { window.__sim = window.SIM_MAP[r](document.getElementById('host')); }, cfg.route);

      // Panel + legend luôn có
      await expect(page.locator('#host .sim2-theory')).toHaveCount(1);
      expect(await page.locator('#host .sim2-formula').count(),
        `${cfg.route} ≥1 công thức`).toBeGreaterThanOrEqual(1);
      expect(await page.locator('#host .sim2-legend-item').count(),
        `${cfg.route} ≥1 legend`).toBeGreaterThanOrEqual(1);
      expect((await page.locator('#host .sim2-readout-live').innerText()).trim().length,
        `${cfg.route} readout sống không rỗng`).toBeGreaterThan(0);

      // Slider + playback đúng cấu hình
      await expect(page.locator('#host .sim2-controls input[type=range]'),
        `${cfg.route} số slider`).toHaveCount(cfg.sliders);
      await expect(page.locator('#host .sim2-playback'),
        `${cfg.route} playback`).toHaveCount(cfg.playback ? 1 : 0);

      // Sim động: start paused → SVG đứng yên 200ms; ▶ → SVG đổi
      if (cfg.playback) {
        await expect(page.locator('#host .sim2-playpause')).toHaveText(/▶/);
        const snap0 = await page.evaluate(() => document.querySelector('#host svg.sim2-svg').innerHTML);
        await page.waitForTimeout(200);
        const snapPaused = await page.evaluate(() => document.querySelector('#host svg.sim2-svg').innerHTML);
        expect(snapPaused, `${cfg.route} start paused (SVG đứng yên)`).toBe(snap0);
        await page.locator('#host .sim2-playpause').click();
        await page.waitForTimeout(200);
        const snapRun = await page.evaluate(() => document.querySelector('#host svg.sim2-svg').innerHTML);
        expect(snapRun, `${cfg.route} ▶ làm sim chạy (SVG đổi)`).not.toBe(snap0);
      }

      // dispose sạch tuyệt đối
      await page.evaluate(() => {
        window.__orphan = document.querySelector('#host .sim2-controls input[type=range]');
        window.__sim.dispose();
      });
      await expect(page.locator('#host .sim2-root')).toHaveCount(0);
      await expect(page.locator('#host .sim2-theory')).toHaveCount(0);
      await expect(page.locator('#host .sim2-controls')).toHaveCount(0);
      if (cfg.sliders > 0) {
        await page.evaluate(() => {
          if (window.__orphan) {
            window.__orphan.value = '1';
            window.__orphan.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      }

      expect(errors, `console errors ${cfg.route}:\n${errors.join('\n')}`).toEqual([]);
    });
  }
});
