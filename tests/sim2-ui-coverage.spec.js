/**
 * P5 — Harness UI manifest-driven: MỌI route trong SIM2_ROUTE_MANIFEST phải có
 * panel lý thuyết + legend + readout sống + control (slider HOẶC drag handle) + dispose sạch.
 * Count đọc từ manifest (KHÔNG hardcode 25). Fixture chọn theo chapter.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const manifest = require('../js/sim2/sim2-route-manifest.js');
const fixtureFor = ch => `file:///${path.join(ROOT, `tests/fixtures/sim2-ch${ch}.html`).replace(/\\/g, '/')}`;

test.describe('sim2 — UI coverage 25 route (manifest-driven)', () => {
  for (const r of manifest) {
    test(`${r.id}: panel + legend + readout + control + dispose sạch`, async ({ page }) => {
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push(String(e)));

      await page.goto(fixtureFor(r.chapter), { waitUntil: 'domcontentloaded' });
      await page.evaluate(id => { window.__sim = window.SIM_MAP[id](document.getElementById('host')); }, r.id);

      // Theory panel: 1 panel + ≥1 công thức + ≥1 legend + readout sống không rỗng
      await expect(page.locator('#host .sim2-theory'), `${r.id} panel`).toHaveCount(1);
      expect(await page.locator('#host .sim2-formula').count(), `${r.id} ≥1 công thức`).toBeGreaterThanOrEqual(1);
      expect(await page.locator('#host .sim2-legend-item').count(), `${r.id} ≥1 legend`).toBeGreaterThanOrEqual(1);
      expect((await page.locator('#host .sim2-readout-live').innerText()).trim().length,
        `${r.id} readout sống không rỗng`).toBeGreaterThan(0);

      // Control: slider HOẶC playback HOẶC drag handle (mọi route phải tương tác được)
      const nSlider = await page.locator('#host .sim2-controls input[type=range]').count();
      const nPlay = await page.locator('#host .sim2-playback').count();
      const nHandle = await page.locator('#host .sim2-handle').count();
      expect(nSlider + nPlay + nHandle, `${r.id} phải có ≥1 control (slider/playback/handle)`).toBeGreaterThan(0);

      // Dispose sạch tuyệt đối
      await page.evaluate(() => window.__sim.dispose());
      await expect(page.locator('#host .sim2-root'), `${r.id} root gỡ`).toHaveCount(0);
      await expect(page.locator('#host .sim2-theory'), `${r.id} panel gỡ`).toHaveCount(0);
      await expect(page.locator('#host .sim2-controls'), `${r.id} controls gỡ`).toHaveCount(0);
      await expect(page.locator('#host .sim2-label'), `${r.id} label gỡ`).toHaveCount(0);

      expect(errors, `console errors ${r.id}:\n${errors.join('\n')}`).toEqual([]);
    });
  }
});
