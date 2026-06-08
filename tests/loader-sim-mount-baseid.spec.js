const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

// loader.js strip hậu tố để resolve baseId cho nội dung. Sim PHẢI mount theo baseId,
// không theo id thô — nếu không, deep-link có hậu tố (vd #ch2-2-2x) hiện đúng nội dung
// ch2-2-2 nhưng sim im lặng không mount.
test.describe('sim mount theo baseId (không phải id thô)', () => {
  test('#ch2-2-2x resolve nội dung ch2-2-2 VÀ mount sim ch2-2-2', async ({ page }) => {
    await page.goto(`${INDEX}#ch2-2-2x`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.location.hash === '#ch2-2-2x');
    await page.waitForSelector('#content-area .sh2, #content-area .l3-content, #content-area h2');
    await page.waitForTimeout(300);

    await expect(page.locator('#content-area [data-sim-mount-route="ch2-2-2"]')).toHaveCount(1);
  });

  test('route gốc ch2-2-2 vẫn mount đúng (không hồi quy)', async ({ page }) => {
    await page.goto(`${INDEX}#ch2-2-2`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.location.hash === '#ch2-2-2');
    await page.waitForSelector('#content-area .sh2, #content-area .l3-content, #content-area h2');
    await page.waitForTimeout(300);

    await expect(page.locator('#content-area [data-sim-mount-route="ch2-2-2"]')).toHaveCount(1);
  });
});
