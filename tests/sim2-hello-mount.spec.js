const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FIXTURE_URL = `file:///${path.join(ROOT, 'tests/fixtures/sim2-hello.html').replace(/\\/g, '/')}`;

test.describe('sim2 hello — mount/dispose qua SIM_MAP', () => {
  test('mount: SVG + HTML overlay, 0 console error, dispose sạch', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.push(String(err)));

    await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });

    // SIM_MAP['sim2-hello'] là factory
    const isFactory = await page.evaluate(() => typeof (window.SIM_MAP || {})['sim2-hello'] === 'function');
    expect(isFactory).toBe(true);

    // Mount lần 1
    await page.evaluate(() => {
      const host = document.getElementById('host');
      window.__sim = window.SIM_MAP['sim2-hello'](host);
    });

    // Có <svg> trong host
    await expect(page.locator('#host svg')).toHaveCount(1);

    // Nhãn là HTML overlay (DOM text), KHÔNG phải vẽ trong canvas
    await expect(page.locator('#host .sim2-overlay')).toHaveCount(1);
    await expect(page.locator('#host .sim2-label').first()).toBeVisible();
    const labelText = await page.locator('#host .sim2-label').first().innerText();
    expect(labelText.trim().length).toBeGreaterThan(0);

    // dispose() là hàm
    const hasDispose = await page.evaluate(() => window.__sim && typeof window.__sim.dispose === 'function');
    expect(hasDispose).toBe(true);

    // Dispose → gỡ sạch DOM trong host
    await page.evaluate(() => window.__sim.dispose());
    await expect(page.locator('#host svg')).toHaveCount(0);
    await expect(page.locator('#host .sim2-overlay')).toHaveCount(0);

    // Mount lại lần 2 → vẫn đúng 1 svg (không double-bind / không rò node)
    await page.evaluate(() => {
      const host = document.getElementById('host');
      window.__sim = window.SIM_MAP['sim2-hello'](host);
    });
    await expect(page.locator('#host svg')).toHaveCount(1);
    await expect(page.locator('#host .sim2-overlay')).toHaveCount(1);

    await page.evaluate(() => window.__sim.dispose());
    await expect(page.locator('#host svg')).toHaveCount(0);

    expect(consoleErrors, `console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
  });
});
