const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

// Tiến trình đọc hợp nhất về MỘT store: chlyt_progress (js/progress.js).
// Topbar .progress-fill đếm theo visits>0 (phản hồi tức thì); home per-chương dùng read (8s).
// Guard: key cũ readPages KHÔNG bao giờ được ghi nữa.
test.describe('progress single-source (chlyt_progress)', () => {
  test('điều hướng KHÔNG ghi key readPages (đã hợp nhất)', async ({ page }) => {
    await page.goto(`${INDEX}#ch1-1-1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.location.hash === '#ch1-1-1');
    await page.waitForSelector('#content-area h2, #content-area .l3-content, #content-area .sh2');
    await page.waitForTimeout(300);

    const readPages = await page.evaluate(() => localStorage.getItem('readPages'));
    expect(readPages, 'readPages phải biến mất sau khi hợp nhất về chlyt_progress').toBeNull();
  });

  test('topbar progress-fill phản ánh chlyt_progress sau khi thăm trang', async ({ page }) => {
    await page.goto(`${INDEX}#ch1-1-1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.location.hash === '#ch1-1-1');
    await page.waitForSelector('#content-area h2, #content-area .l3-content, #content-area .sh2');
    await page.waitForTimeout(400);

    // chlyt_progress đã ghi visit cho trang vừa thăm
    const prog = await page.evaluate(() => JSON.parse(localStorage.getItem('chlyt_progress') || '{}'));
    expect(prog['ch1-1-1'] && prog['ch1-1-1'].visits, 'chlyt_progress phải ghi visit').toBeGreaterThan(0);

    // Topbar bar phải > 0% (nuôi từ chlyt_progress, không phải readPages)
    const width = await page.evaluate(() => document.querySelector('.progress-fill').style.width);
    expect(parseFloat(width), `progress-fill width = "${width}"`).toBeGreaterThan(0);
  });
});
