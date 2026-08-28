const { test, expect } = require('@playwright/test');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const INDEX_FILE_URL = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

test('random attempt restores exact order and answered choice after file reload', async ({ page }) => {
  await page.goto(`${INDEX_FILE_URL}#ch1-quiz`);
  const quiz = page.locator('#quiz-ch1');
  await quiz.locator('.quiz-mode button').nth(1).click();
  await expect(quiz.locator('.q-card')).toHaveCount(10);
  const ids = await quiz.locator('.q-card').evaluateAll(cards => cards.map(card => card.dataset.questionId));
  await quiz.locator('input[type=radio]').first().check();
  await page.reload();
  await page.waitForSelector('#quiz-ch1 .q-card');
  await expect.poll(() => quiz.locator('.q-card').evaluateAll(cards => cards.map(card => card.dataset.questionId))).toEqual(ids);
  await expect(quiz.locator('input[type=radio]').first()).toBeChecked();
  await expect(quiz.locator('.quiz-score [aria-live=polite]')).toContainText('1/10');
});

test('concurrent tabs merge answers for the same attempt without losing progress', async ({ page }) => {
  await page.goto(`${INDEX_FILE_URL}#ch1-quiz`);
  const peer = await page.context().newPage();
  await peer.goto(`${INDEX_FILE_URL}#ch1-quiz`);
  await page.locator('#quiz-ch1 input[type=radio]').first().check();
  await peer.locator('#quiz-ch1 .q-card').nth(1).locator('input[type=radio]').first().check();
  await page.reload();
  await page.waitForSelector('#quiz-ch1 .q-card');
  await expect(page.locator('#quiz-ch1 .q-card').first().locator('input[type=radio]').first()).toBeChecked();
  await expect(page.locator('#quiz-ch1 .q-card').nth(1).locator('input[type=radio]').first()).toBeChecked();
  await expect(page.locator('#quiz-ch1 .quiz-score [aria-live=polite]')).toContainText('2/100');
  await peer.close();
});

test('malformed stored attempt is replaced with an answerable fresh attempt', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('chlyt_quiz_attempts', JSON.stringify({
      schemaVersion: 2,
      activeAttempts: {
        'ch1|all|all': {
          attemptId: 'broken', schemaVersion: 2, chapter: 'ch1', mode: 'all', section: null, seed: 'broken',
          questionIds: Array.from({ length: 100 }, (_, index) => `quiz-ch1-${String(index + 1).padStart(3, '0')}`),
          order: Array.from({ length: 100 }, (_, index) => `quiz-ch1-${String(index + 1).padStart(3, '0')}`),
          answersByQuestionId: {}, startedAt: 1, updatedAt: 1, completedAt: 2, elapsed: 1,
          correct: 0, wrong: 0, percent: 0, passPolicyRef: 'quiz-v2-pass-70', status: 'completed',
        },
      },
      history: [], legacyScores: {}, selectedModes: {},
    }));
  });
  await page.goto(`${INDEX_FILE_URL}#ch1-quiz`);
  const first = page.locator('#quiz-ch1 input[type=radio]').first();
  await expect(first).toBeEnabled();
  await first.check();
  await expect(page.locator('#quiz-ch1 .quiz-score [aria-live=polite]')).toContainText('1/100');
});

test('clear action creates a fresh attempt and persistence failure leaves quiz usable', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('chlyt_quiz_attempts', '{corrupt'); });
  await page.goto(`${INDEX_FILE_URL}#ch2-quiz`);
  const quiz = page.locator('#quiz-ch2');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('QuotaExceededError'); }; });
  await quiz.getByRole('button', { name: /xóa.*làm lại/i }).click();
  await expect(quiz.locator('input[type=radio]').first()).not.toBeChecked();
  await quiz.locator('input[type=radio]').first().check();
  await expect(quiz.locator('.quiz-persistence-warning')).toBeVisible();
  await expect(quiz.locator('.q-card')).toHaveCount(100);
});

test('section changes isolate saved attempts and reset only the active scope', async ({ page }) => {
  await page.goto(`${INDEX_FILE_URL}#ch1-quiz`);
  const quiz = page.locator('#quiz-ch1');
  const scope = quiz.getByLabel('Phạm vi ôn tập');

  await scope.selectOption('VI');
  await quiz.getByRole('button', { name: 'Random (5)' }).click();
  const viIds = await quiz.locator('.q-card').evaluateAll(cards => cards.map(card => card.dataset.questionId));
  await quiz.locator('input[type=radio]').first().check();

  await quiz.getByLabel('Phạm vi ôn tập').selectOption('I');
  await expect(quiz.locator('.q-card')).toHaveCount(10);
  await quiz.locator('input[type=radio]').first().check();

  await quiz.getByLabel('Phạm vi ôn tập').selectOption('VI');
  await expect.poll(() => quiz.locator('.q-card').evaluateAll(cards => cards.map(card => card.dataset.questionId))).toEqual(viIds);
  await expect(quiz.locator('input[type=radio]').first()).toBeChecked();
  await quiz.getByRole('button', { name: /xóa.*làm lại/i }).click();
  await expect(quiz.locator('input[type=radio]').first()).not.toBeChecked();

  await quiz.getByLabel('Phạm vi ôn tập').selectOption('I');
  await expect(quiz.locator('input[type=radio]').first()).toBeChecked();
});

test('last selected scope wins across tabs without dropping either scoped attempt', async ({ page }) => {
  await page.goto(`${INDEX_FILE_URL}#ch1-quiz`);
  const peer = await page.context().newPage();
  await peer.goto(`${INDEX_FILE_URL}#ch1-quiz`);

  await page.locator('#quiz-ch1').getByLabel('Phạm vi ôn tập').selectOption('VI');
  await page.locator('#quiz-ch1 input[type=radio]').first().check();
  await peer.locator('#quiz-ch1').getByLabel('Phạm vi ôn tập').selectOption('I');
  await peer.locator('#quiz-ch1 input[type=radio]').first().check();

  const saved = await peer.evaluate(() => JSON.parse(localStorage.getItem('chlyt_quiz_attempts')));
  expect(saved.selectedSections).toEqual({ ch1: 'I' });
  expect(saved.activeAttempts['ch1|all|VI'].answersByQuestionId).not.toEqual({});
  expect(saved.activeAttempts['ch1|all|I'].answersByQuestionId).not.toEqual({});
  await peer.close();
});
