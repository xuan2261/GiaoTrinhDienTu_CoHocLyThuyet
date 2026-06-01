const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_URL = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

// Tích hợp thật qua index.html: route Ch1 phải mount sim, đổi route phải dispose sạch.
test.describe('sim2 Ch1 — tích hợp index.html (mount + dispose đổi route)', () => {
  test('ch1-1-3 mount qua loader, đổi sang route content-only thì dispose sạch', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));

    // Mount route có sim
    await page.goto(`${INDEX_URL}#ch1-1-3`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.location.hash.replace('#', '') === 'ch1-1-3');
    await page.waitForSelector('#content-area [data-sim-mount-route="ch1-1-3"] svg', { timeout: 10000 });
    await expect(page.locator('#content-area [data-sim-mount-route="ch1-1-3"] svg')).toHaveCount(1);
    await expect(page.locator('#content-area .sim2-label').first()).toBeVisible();

    // Khung khoanh vùng: card .sim-mount + header thẻ duy nhất + viewport host + root nền sáng
    await expect(page.locator('#content-area .sim-mount[data-sim-mount-route="ch1-1-3"]')).toHaveCount(1);
    await expect(page.locator('#content-area .sim2-header')).toHaveCount(0);
    await expect(page.locator('#content-area .sim2-card-header')).toHaveCount(1);
    const headerText = await page.locator('#content-area .sim2-card-header').innerText();
    expect(headerText).toContain('Véc tơ lực');
    await expect(page.locator('#content-area .sim2-viewport-host .sim2-root svg')).toHaveCount(1);
    // viewport có nền sáng (khác nền trang) → SVG nét tối luôn rõ ở mọi theme
    const rootBg = await page.evaluate(() => {
      const el = document.querySelector('#content-area .sim2-root');
      return getComputedStyle(el).backgroundColor;
    });
    expect(rootBg, 'viewport phải có nền sáng cố định').toMatch(/rgb\(25[0-9], 25[0-9], 2[45][0-9]\)/);

    // Đổi sang route content-only (ngoài 25-list) → sim cũ dispose, không còn svg sim2
    await page.evaluate(() => window.loadPage('ch1-1-1'));
    await page.waitForFunction(() => window.location.hash.replace('#', '') === 'ch1-1-1');
    await page.waitForTimeout(200);
    await expect(page.locator('#content-area .sim2-root')).toHaveCount(0);
    await expect(page.locator('#content-area .sim2-label')).toHaveCount(0);

    // Quay lại route sim → mount lại đúng 1 lần (no double-bind)
    await page.evaluate(() => window.loadPage('ch1-1-3'));
    await page.waitForFunction(() => window.location.hash.replace('#', '') === 'ch1-1-3');
    await page.waitForSelector('#content-area [data-sim-mount-route="ch1-1-3"] svg', { timeout: 10000 });
    await expect(page.locator('#content-area svg.sim2-svg')).toHaveCount(1);

    expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([]);
  });
});
