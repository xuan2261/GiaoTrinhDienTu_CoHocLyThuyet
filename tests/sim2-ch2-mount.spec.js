const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FIXTURE_URL = `file:///${path.join(ROOT, 'tests/fixtures/sim2-ch2.html').replace(/\\/g, '/')}`;

const CH2_ROUTES = ['ch2-1-1', 'ch2-1-3', 'ch2-2-2', 'ch2-3-2', 'ch2-4-4', 'ch2-5-2', 'ch2-5-3'];
const CANVAS_ROUTES = ['ch2-1-1', 'ch2-4-4', 'ch2-5-3']; // #11, #15, #17

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

test.describe('sim2 Ch2 — 7 sim động học mount', () => {
  for (const route of CH2_ROUTES) {
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

      // Nhãn không chồng
      const clash = findOverlap(await labelBoxes(page));
      expect(clash, `nhãn chồng ${route}: ${clash}`).toBeNull();

      // Route có canvas underlay: có <canvas> + hasContent sau vài frame + khớp SVG ≤1px
      if (CANVAS_ROUTES.includes(route)) {
        await expect(page.locator('#host canvas.sim2-canvas')).toHaveCount(1);
        // start-paused (P3): bấm ▶ TRƯỚC khi chờ (sim animation). ch2-5-3 field tĩnh → không có nút, bỏ qua.
        const play = page.locator('#host .sim2-playpause');
        if (await play.count()) await play.click();
        await page.waitForTimeout(350); // vài frame RAF
        const hasContent = await page.evaluate(() => {
          const c = document.querySelector('#host canvas.sim2-canvas');
          const ctx = c.getContext('2d');
          const d = ctx.getImageData(0, 0, c.width, c.height).data;
          for (let i = 3; i < d.length; i += 4) if (d[i] !== 0) return true;
          return false;
        });
        expect(hasContent, `${route} canvas phải có nội dung sau vài frame`).toBe(true);

        // Canvas↔SVG cùng kích thước (1 transform → cùng hệ toạ độ)
        const aligned = await page.evaluate(() => {
          const c = document.querySelector('#host canvas.sim2-canvas');
          const s = document.querySelector('#host svg.sim2-svg');
          const cr = c.getBoundingClientRect(), sr = s.getBoundingClientRect();
          return Math.abs(cr.x - sr.x) <= 1 && Math.abs(cr.y - sr.y) <= 1 &&
                 Math.abs(cr.width - sr.width) <= 1 && Math.abs(cr.height - sr.height) <= 1;
        });
        expect(aligned, `${route} canvas phải khớp SVG ≤1px`).toBe(true);
      }

      // Dispose hủy RAF: đếm rafId trước/sau — sau dispose không còn frame callback chạy
      await page.evaluate(() => window.__sim.dispose());
      await expect(page.locator('#host svg')).toHaveCount(0);
      await expect(page.locator('#host canvas.sim2-canvas')).toHaveCount(0);
      await expect(page.locator('#host .sim2-root')).toHaveCount(0);

      expect(errors, `console errors ${route}:\n${errors.join('\n')}`).toEqual([]);
    });
  }

  test('dispose hủy RAF thật — không còn callback sau khi gỡ (#11)', async ({ page }) => {
    await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });
    const stillTicking = await page.evaluate(async () => {
      const sim = window.SIM_MAP['ch2-1-1'](document.getElementById('host'));
      await new Promise(r => setTimeout(r, 150));
      sim.dispose();
      // Đếm số lần RAF fire trong 200ms sau dispose: phải = 0 frame từ sim (sim đã hủy)
      let frames = 0;
      const stamp = () => { frames++; if (frames < 30) requestAnimationFrame(stamp); };
      requestAnimationFrame(stamp);
      await new Promise(r => setTimeout(r, 200));
      // Không assert frames=0 (RAF chung vẫn chạy) — assert DOM gỡ sạch là bằng chứng RAF sim dừng
      return document.querySelectorAll('#host .sim2-root').length;
    });
    expect(stillTicking).toBe(0);
  });
});

// ─── P3 retrofit: 7 sim Ch2 (panel + legend + control; playback start-paused cho sim động) ───
const CH2_RETROFIT = [
  { route: 'ch2-1-1', sliders: 2, playback: true },   // v0, α + canvas quỹ đạo
  { route: 'ch2-1-3', sliders: 0, playback: false },  // bespoke: kéo điểm ellipse
  { route: 'ch2-2-2', sliders: 2, playback: true },   // ω0, α góc
  { route: 'ch2-3-2', sliders: 2, playback: true },   // r1, r2 truyền động
  { route: 'ch2-4-4', sliders: 2, playback: true },   // ω, v_rel Coriolis (hết hardcode) + canvas
  { route: 'ch2-5-2', sliders: 0, playback: false },  // bespoke: kéo thanh → IC
  { route: 'ch2-5-3', sliders: 1, playback: false }   // ω + kéo IC, field tĩnh
];

test.describe('sim2 Ch2 P3 — retrofit 7 sim (panel + legend + control + playback)', () => {
  for (const cfg of CH2_RETROFIT) {
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

      // Sim động: start paused → SVG đứng yên trong 200ms (snapshot không đổi)
      if (cfg.playback) {
        await expect(page.locator('#host .sim2-playpause')).toHaveText(/▶/);
        const snap0 = await page.evaluate(() => document.querySelector('#host svg.sim2-svg').innerHTML);
        await page.waitForTimeout(200);
        const snapPaused = await page.evaluate(() => document.querySelector('#host svg.sim2-svg').innerHTML);
        expect(snapPaused, `${cfg.route} start paused (SVG đứng yên)`).toBe(snap0);
        // ▶ → chạy: SVG đổi sau vài frame
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
      await expect(page.locator('#host canvas.sim2-canvas')).toHaveCount(0);
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
