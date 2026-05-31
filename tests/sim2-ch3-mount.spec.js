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
      await expect(page.locator('#host svg')).toHaveCount(1);
      await expect(page.locator('#host .sim2-label').first()).toBeVisible();

      const clash = findOverlap(await labelBoxes(page));
      expect(clash, `nhãn chồng ${route}: ${clash}`).toBeNull();

      // ch3-2-2: graph KHÔNG rỗng sau vài frame (defect cũ graph trống)
      if (route === 'ch3-2-2') {
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
