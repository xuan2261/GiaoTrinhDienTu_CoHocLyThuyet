const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

// Characterization guard cho notes.js: sau khi seed chlyt_notes, badge .notes-indicator
// hiện đúng số ghi chú của trang. Lock hành vi badge để rename hàm nội bộ
// (restoreHighlights -> refreshNotesIndicator) KHÔNG đổi hành vi quan sát được.
test.describe('notes indicator (badge đếm)', () => {
  test('badge .notes-indicator hiện count theo chlyt_notes của trang', async ({ page }) => {
    // Seed trước khi notes.js init đọc localStorage
    await page.addInitScript(() => {
      localStorage.setItem('chlyt_notes', JSON.stringify({
        'ch1-1-1': [
          { text: 'lực', note: '', ts: 1 },
          { text: 'cân bằng', note: 'ghi chú', ts: 2 }
        ]
      }));
    });

    await page.goto(`${INDEX}#ch1-1-1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.location.hash === '#ch1-1-1');
    await page.waitForSelector('#content-area h2, #content-area .l3-content, #content-area .sh2');

    const indicator = page.locator('.notes-indicator');
    await expect(indicator).toBeVisible();
    await expect(indicator).toContainText('2');
  });
});
