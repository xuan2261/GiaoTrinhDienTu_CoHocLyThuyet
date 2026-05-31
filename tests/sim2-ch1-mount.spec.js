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

      await expect(page.locator('#host svg')).toHaveCount(1);
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
