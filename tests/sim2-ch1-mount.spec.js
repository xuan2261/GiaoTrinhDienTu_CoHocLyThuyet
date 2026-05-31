const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FIXTURE_URL = `file:///${path.join(ROOT, 'tests/fixtures/sim2-ch1.html').replace(/\\/g, '/')}`;

const CH1_ROUTES = [
  'ch1-1-3', 'ch1-1-4', 'ch1-1-5', 'ch1-1-6', 'ch1-2-3',
  'ch1-1-8', 'ch1-3-2', 'ch1-3-6', 'ch1-5-3', 'ch1-6-3'
];

/** Lấy bounding-box mọi .sim2-label trong host. */
async function labelBoxes(page) {
  return page.$$eval('#host .sim2-label', els =>
    els.map(el => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, text: el.textContent.trim() };
    })
  );
}

/** 2 hình chữ nhật giao nhau? (cho phép chạm mép, dùng margin nhỏ âm để tránh false-positive sát mép) */
function overlaps(a, b) {
  const m = 1; // cho phép cách ≥1px coi như không chồng
  return a.x < b.x + b.w - m && a.x + a.w - m > b.x &&
         a.y < b.y + b.h - m && a.y + a.h - m > b.y;
}

function findOverlap(boxes) {
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++)
      if (overlaps(boxes[i], boxes[j]))
        return `"${boxes[i].text}" ⟂ "${boxes[j].text}"`;
  return null;
}

test.describe('sim2 Ch1 — 10 sim tĩnh học mount', () => {
  for (const route of CH1_ROUTES) {
    test(`${route}: mount SVG, nhãn không chồng, dispose sạch, 0 error`, async ({ page }) => {
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push(String(e)));

      await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });

      const isFactory = await page.evaluate(
        r => typeof (window.SIM_MAP || {})[r] === 'function', route);
      expect(isFactory, `SIM_MAP['${route}'] phải là factory`).toBe(true);

      await page.evaluate(r => {
        window.__sim = window.SIM_MAP[r](document.getElementById('host'));
      }, route);

      await expect(page.locator('#host svg.sim2-svg')).toHaveCount(1);
      await expect(page.locator('#host .sim2-label').first()).toBeVisible();

      // Nhãn không chồng
      const boxes = await labelBoxes(page);
      const clash = findOverlap(boxes);
      expect(clash, `nhãn chồng nhau ở ${route}: ${clash}`).toBeNull();

      // Dispose sạch
      await page.evaluate(() => window.__sim.dispose());
      await expect(page.locator('#host svg')).toHaveCount(0);
      await expect(page.locator('#host .sim2-label')).toHaveCount(0);

      expect(errors, `console errors ${route}:\n${errors.join('\n')}`).toEqual([]);
    });
  }
});

// ─── P2 retrofit: 9 sim Ch1 còn lại đồng bộ component (panel + legend + control) ───
const CH1_RETROFIT = [
  { route: 'ch1-1-4', sliders: 1, handle: true },  // F + drag d
  { route: 'ch1-1-5', sliders: 0, handle: true },  // bespoke: kéo 2 lực
  { route: 'ch1-1-6', sliders: 1, handle: true },  // d ngẫu lực + drag
  { route: 'ch1-2-3', sliders: 0, handle: true },  // bespoke: kéo 2 vector đồng quy
  { route: 'ch1-1-8', sliders: 1, handle: true },  // P + drag vị trí
  { route: 'ch1-3-2', sliders: 1, handle: true },  // α + drag
  { route: 'ch1-3-6', sliders: 2, handle: true },  // a, P
  { route: 'ch1-5-3', sliders: 2, handle: true },  // β, μ
  { route: 'ch1-6-3', sliders: 0, handle: true }   // bespoke: kéo lỗ khoét
];

test.describe('sim2 Ch1 P2 — retrofit 9 sim (panel + legend + control)', () => {
  for (const cfg of CH1_RETROFIT) {
    test(`${cfg.route}: panel + legend + ${cfg.sliders} slider${cfg.handle ? ' + handle' : ''}; dispose sạch`, async ({ page }) => {
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push(String(e)));

      await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });
      await page.evaluate(r => { window.__sim = window.SIM_MAP[r](document.getElementById('host')); }, cfg.route);

      // Panel + legend luôn có
      await expect(page.locator('#host .sim2-theory')).toHaveCount(1);
      expect(await page.locator('#host .sim2-formula').count(),
        `${cfg.route} phải có ≥1 công thức`).toBeGreaterThanOrEqual(1);
      expect(await page.locator('#host .sim2-legend-item').count(),
        `${cfg.route} phải có ≥1 legend`).toBeGreaterThanOrEqual(1);
      // Readout sống có nội dung
      expect((await page.locator('#host .sim2-readout-live').innerText()).trim().length,
        `${cfg.route} readout sống không rỗng`).toBeGreaterThan(0);

      // Control: đúng số slider (nếu có) HOẶC drag handle
      await expect(page.locator('#host .sim2-controls input[type=range]'),
        `${cfg.route} số slider`).toHaveCount(cfg.sliders);
      if (cfg.handle) {
        expect(await page.locator('#host .sim2-handle').count(),
          `${cfg.route} phải có drag handle`).toBeGreaterThanOrEqual(1);
      }

      // dispose sạch tuyệt đối
      await page.evaluate(() => {
        const r = document.querySelector('#host .sim2-controls input[type=range]');
        window.__orphan = r;
        window.__sim.dispose();
      });
      await expect(page.locator('#host .sim2-root')).toHaveCount(0);
      await expect(page.locator('#host .sim2-theory')).toHaveCount(0);
      await expect(page.locator('#host .sim2-controls')).toHaveCount(0);
      await expect(page.locator('#host .sim2-label')).toHaveCount(0);
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
test.describe('sim2 Ch1 pilot — ch1-1-3 (control + panel + drag↔slider)', () => {
  test('ch1-1-3: 2 slider + panel + legend; slider→vector; drag→slider; dispose sạch', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));

    await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__sim = window.SIM_MAP['ch1-1-3'](document.getElementById('host')); });

    // Control: 2 slider (F, α), KHÔNG playback (sim tĩnh)
    await expect(page.locator('#host .sim2-controls')).toHaveCount(1);
    await expect(page.locator('#host .sim2-controls input[type=range]')).toHaveCount(2);
    await expect(page.locator('#host .sim2-playback')).toHaveCount(0);

    // Panel: formula + legend + readout sống
    await expect(page.locator('#host .sim2-theory')).toHaveCount(1);
    expect(await page.locator('#host .sim2-formula').count()).toBeGreaterThanOrEqual(2);
    expect(await page.locator('#host .sim2-legend-item').count()).toBeGreaterThanOrEqual(2);
    const rd0 = await page.locator('#host .sim2-readout-live').innerText();
    expect(rd0).toMatch(/F/);

    // slider→vector: set α=0 → Fy ≈ 0, Fx ≈ |F|; set α=90 → Fx ≈ 0
    await page.evaluate(() => {
      const a = document.querySelector('#host .sim2-controls input[data-id=alpha]');
      a.value = '0'; a.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const rdA0 = await page.locator('#host .sim2-readout-live').innerText();
    await page.evaluate(() => {
      const a = document.querySelector('#host .sim2-controls input[data-id=alpha]');
      a.value = '90'; a.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const rdA90 = await page.locator('#host .sim2-readout-live').innerText();
    expect(rdA0, 'readout phải đổi khi α đổi').not.toBe(rdA90);

    // drag→slider: kéo handle → slider α phản ánh lại (setValue không bắn input → không loop)
    await page.evaluate(() => {
      const a = document.querySelector('#host .sim2-controls input[data-id=alpha]');
      a.value = '45'; a.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const handle = page.locator('#host .sim2-handle').first();
    const hb = await handle.boundingBox();
    const svgBox = await page.locator('#host svg.sim2-svg').boundingBox();
    // kéo handle xuống thấp (gần trục x) → α giảm mạnh
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
    await page.mouse.down();
    await page.mouse.move(svgBox.x + svgBox.width * 0.85, svgBox.y + svgBox.height * 0.78, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(60);
    const alphaAfterDrag = await page.evaluate(() =>
      parseFloat(document.querySelector('#host .sim2-controls input[data-id=alpha]').value));
    expect(alphaAfterDrag, 'kéo handle xuống → slider α phải giảm khỏi 45').toBeLessThan(45);

    // dispose sạch: 0 root/controls/theory/label; bắn input sau dispose không nổ
    await page.evaluate(() => {
      window.__orphanSlider = document.querySelector('#host .sim2-controls input[data-id=F]');
      window.__sim.dispose();
    });
    await expect(page.locator('#host .sim2-root')).toHaveCount(0);
    await expect(page.locator('#host .sim2-controls')).toHaveCount(0);
    await expect(page.locator('#host .sim2-theory')).toHaveCount(0);
    await expect(page.locator('#host .sim2-label')).toHaveCount(0);
    await page.evaluate(() => {
      window.__orphanSlider.value = '60';
      window.__orphanSlider.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(errors, `console errors ch1-1-3 pilot:\n${errors.join('\n')}`).toEqual([]);
  });
});
