const { test, expect } = require('@playwright/test');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const INDEX_FILE_URL = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

test('keyboard-only learner can answer, review, and reset semantic quiz controls', async ({ page }) => {
  await page.goto(`${INDEX_FILE_URL}#ch3-quiz`);
  const quiz = page.locator('#quiz-ch3');
  await expect(quiz.locator('fieldset')).toHaveCount(100);
  await expect(quiz.locator('fieldset').first().locator('legend')).not.toBeEmpty();
  const firstOption = quiz.locator('.q-card').first().locator('input[type=radio]').first();
  const secondOption = quiz.locator('.q-card').nth(1).locator('input[type=radio]').first();
  await secondOption.focus();
  await page.keyboard.press('Space');
  await expect(quiz.locator('.q-card').nth(2).locator('input[type=radio]').first()).toBeFocused();
  await firstOption.focus();
  await page.keyboard.press('Space');
  await expect(quiz.locator('input[type=radio]').first()).toBeChecked();
  await expect(quiz.locator('.q-card').first().locator('[role=status]')).toBeVisible();
  await expect(quiz.locator('.quiz-score [aria-live=polite]')).toContainText('2/100');
  await expect(quiz.locator('.q-card').nth(2).locator('input[type=radio]').first()).toBeFocused();
  await quiz.getByRole('button', { name: /xem lại/i }).click();
  await expect(quiz.locator('.q-card').first().locator('.q-feedback.show')).toBeVisible();
  await quiz.getByRole('button', { name: /xóa.*làm lại/i }).click();
  await expect(quiz.locator('input[type=radio]').first()).not.toBeChecked();
  await expect(quiz.locator('.quiz-score [aria-live=polite]')).toContainText('0/100');
});
