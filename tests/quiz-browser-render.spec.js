const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_FILE_URL = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;
const CHAPTERS = ['ch1', 'ch2', 'ch3'];

async function openQuiz(page, chapter) {
  await page.goto(`${INDEX_FILE_URL}#${chapter}-quiz`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(expected => window.location.hash.replace('#', '') === `${expected}-quiz`, chapter);
  await page.waitForSelector(`#quiz-${chapter} .q-card`);
}

test.describe('quiz browser rendering', () => {
  for (const chapter of CHAPTERS) {
    test(`${chapter} renders semantic v2 questions in all and random modes`, async ({ page }) => {
      await openQuiz(page, chapter);

      const container = page.locator(`#quiz-${chapter}`);
      await expect(container.locator('.q-card')).toHaveCount(100);
      await expect(container.locator('fieldset')).toHaveCount(100);
      await expect(container.locator('input[type=radio]')).toHaveCount(400);
      await expect(container.locator('.qs-total')).toContainText('0/100');
      await expect(container.locator('.quiz-mode button').first()).toContainText('Tất cả (100)');
      await expect(container.locator('.quiz-mode button').nth(1)).toContainText('Random (10)');
      await expect(container.locator('[onclick]')).toHaveCount(0);
      await expect(container.locator('.q-opt div')).toHaveCount(0);

      await container.locator('.quiz-mode button').nth(1).click();
      await expect(container.locator('.q-card')).toHaveCount(10);
      await expect(container.locator('fieldset')).toHaveCount(10);
      await expect(container.locator('.qs-total')).toContainText('0/10');
    });
  }
});
