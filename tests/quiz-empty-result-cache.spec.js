const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

// loadQuizData cache cả kết quả rỗng: chương không có data, render lại nhiều lần
// (vd bấm "Làm lại") KHÔNG được fetch lặp. [] là truthy nên guard cache đầu hàm vẫn đúng.
test.describe('quiz cache kết quả rỗng', () => {
  test('render 2 lần cho chương thiếu data → chỉ fetch 1 lần', async ({ page }) => {
    await page.goto(INDEX, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.renderQuiz === 'function');

    const fetchCount = await page.evaluate(async () => {
      let count = 0;
      const orig = window.fetch;
      window.fetch = (...args) => {
        if (String(args[0]).includes('quiz-')) count++;
        return Promise.reject(new Error('no file'));
      };
      const div = document.createElement('div');
      div.id = 'quiz-empty-cache-probe';
      document.body.appendChild(div);
      // chId vắng trong QUIZ_DATA → rơi xuống nhánh fetch
      await window.renderQuiz('quiz-empty-cache-probe', 'zz-nonexistent');
      await window.renderQuiz('quiz-empty-cache-probe', 'zz-nonexistent');
      window.fetch = orig;
      return count;
    });

    expect(fetchCount, 'lần render thứ 2 phải dùng cache rỗng, không fetch lại').toBe(1);
  });
});
