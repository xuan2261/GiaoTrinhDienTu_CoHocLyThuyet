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

  test('section scopes expose native labels, catalog titles, and scoped counts', async ({ page }) => {
    await openQuiz(page, 'ch1');
    const chapterOne = page.locator('#quiz-ch1');
    const scopeOne = chapterOne.getByLabel('Phạm vi ôn tập');
    await expect(scopeOne.locator('option')).toHaveCount(8);
    await expect(scopeOne).toContainText('I. KHÁI NIỆM CƠ BẢN (12)');
    await expect(scopeOne).toContainText('VI. TRỌNG TÂM (5)');
    await scopeOne.selectOption('VI');
    await expect(chapterOne.locator('.q-card')).toHaveCount(5);
    await expect(chapterOne.locator('.quiz-mode button').first()).toHaveText('Tất cả (5)');
    await expect(chapterOne.locator('.quiz-mode button').nth(1)).toHaveText('Random (5)');

    await openQuiz(page, 'ch3');
    const chapterThree = page.locator('#quiz-ch3');
    const scopeThree = chapterThree.getByLabel('Phạm vi ôn tập');
    await expect(scopeThree.locator('option')).toHaveCount(8);
    await expect(scopeThree).toContainText('IV. HAI BÀI TOÁN CƠ BẢN CỦA ĐỘNG LỰC HỌC (9)');
    await scopeThree.selectOption('IV');
    await chapterThree.getByRole('button', { name: 'Random (9)' }).click();
    await expect(chapterThree.locator('.q-card')).toHaveCount(9);
    await expect(chapterThree.locator('.qs-total')).toContainText('0/9');
  });
});
