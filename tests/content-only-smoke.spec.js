const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_FILE_URL = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

// 1 route đại diện mỗi chương — content hiển thị, 0 console error, KHÔNG sim mount.
const CONTENT_ROUTES = ['ch1-2-3', 'ch2-1-1', 'ch3-6-2'];

test.describe('content-only smoke (sim đã gỡ)', () => {
  for (const route of CONTENT_ROUTES) {
    test(`${route}: nội dung + KaTeX, 0 console error, không sim mount`, async ({ page }) => {
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', err => consoleErrors.push(String(err)));

      await page.goto(`${INDEX_FILE_URL}#${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(
        expected => window.location.hash.replace('#', '') === expected,
        route
      );
      await page.waitForSelector('#content-area .sh2, #content-area .l3-content, #content-area h2');
      await page.waitForTimeout(200);

      // Nội dung hiện
      const text = await page.locator('#content-area').innerText();
      expect(text.trim().length).toBeGreaterThan(0);

      // KaTeX pipeline còn sống: thư viện đã load + không có lỗi render.
      // (Giáo trình render nhiều công thức bằng ảnh, nên KHÔNG ép mọi route phải có .katex.)
      const katexLoaded = await page.evaluate(() => typeof window.katex !== 'undefined');
      expect(katexLoaded).toBe(true);
      await expect(page.locator('#content-area .katex-error')).toHaveCount(0);

      // KHÔNG còn bất kỳ dấu vết sim mount nào
      await expect(page.locator('#content-area [data-sim-mount-route]')).toHaveCount(0);
      await expect(page.locator('#content-area .sim-mount')).toHaveCount(0);
      await expect(page.locator('#content-area .sim-container.sim-lab')).toHaveCount(0);
      await expect(page.locator('#content-area .sim-viewport-v2')).toHaveCount(0);

      expect(consoleErrors, `console errors trên ${route}:\n${consoleErrors.join('\n')}`).toEqual([]);
    });
  }
});
