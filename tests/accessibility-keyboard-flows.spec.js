const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

async function openRoute(page, route = 'home') {
  await page.goto(`${INDEX}#${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(expected => location.hash === `#${expected}`, route);
}

test.describe('Phase 8 keyboard-only flows', () => {
  test('skip navigation and mobile sidebar Escape preserve visible logical focus', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await openRoute(page);

    await page.locator('body').press('Tab');
    const skip = page.getByRole('link', { name: 'Bỏ qua điều hướng đến nội dung chính' });
    await expect(skip).toBeFocused();
    await skip.press('Enter');
    await expect(page.getByRole('main', { name: 'Nội dung giáo trình' })).toBeFocused();
    await expect(page).toHaveURL(/#home$/);

    const navigation = page.getByRole('navigation', { name: 'Mục lục giáo trình' });
    await expect(navigation).toBeHidden();
    const menu = page.locator('.menu-toggle');
    await expect(menu).toHaveAttribute('aria-label', 'Mở mục lục');
    await menu.focus();
    await menu.press('Enter');
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toHaveAttribute('aria-label', 'Đóng mục lục');
    await expect(navigation).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toHaveAttribute('aria-label', 'Mở mục lục');
    await expect(menu).toBeFocused();
    await expect(navigation).toBeHidden();
  });

  test('search combobox announces state and supports arrows, Enter, and Escape', async ({ page }) => {
    await openRoute(page);
    await page.keyboard.press('Control+k');
    const search = page.getByRole('combobox', { name: 'Tìm kiếm trong giáo trình' });
    await expect(search).toBeFocused();
    await search.fill('Tĩnh học');
    await search.press('ArrowDown');
    const activeId = await search.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();
    await expect(page.locator(`#${activeId}`)).toHaveAttribute('aria-selected', 'true');
    await search.press('Escape');
    await expect(search).toBeFocused();
    await expect(search).toHaveAttribute('aria-expanded', 'false');
    const ring = await page.locator('.search').evaluate(node => getComputedStyle(node).boxShadow);
    expect(ring).not.toBe('none');

    await search.fill('Câu hỏi trắc nghiệm Chương 1');
    await search.press('ArrowDown');
    await search.press('Enter');
    await expect(page).toHaveURL(/#ch1-quiz$/);
    await expect(page.locator(':focus')).toHaveClass(/l3-title/);
  });

  test('quiz radio answer, review, and reset keep focus inside the active workflow', async ({ page }) => {
    await openRoute(page, 'ch3-quiz');
    const quiz = page.locator('#quiz-ch3');
    await page.waitForSelector('#quiz-ch3 .q-card');

    const first = quiz.locator('input[type="radio"]').first();
    await first.focus();
    await page.keyboard.press('Space');
    await expect(quiz.locator('.q-card').nth(1).locator('input[type="radio"]').first()).toBeFocused();
    await expect(quiz.locator('.quiz-score [aria-live="polite"]')).toContainText('1/100');

    const review = quiz.getByRole('button', { name: 'Xem lại đáp án' });
    await review.focus();
    await review.press('Enter');
    await expect(quiz.getByRole('button', { name: 'Ẩn xem lại' })).toBeFocused();
    await expect(quiz.locator('.q-feedback.show').first()).toBeVisible();

    const reset = quiz.getByRole('button', { name: 'Xóa và làm lại' });
    await reset.focus();
    await reset.press('Enter');
    await expect(quiz.locator('input[type="radio"]').first()).toBeFocused();
    await expect(quiz.locator('.quiz-score [aria-live="polite"]')).toContainText('0/100');
  });

  test('PDF dialog closes with Escape and restores focus to its opener', async ({ page }) => {
    await openRoute(page);
    const trigger = page.getByRole('button', { name: 'Xem bản PDF' });
    await trigger.focus();
    await trigger.press('Enter');
    const dialog = page.getByRole('dialog', { name: /Bản PDF/i });
    await expect(dialog).toBeVisible();
    await expect(page.locator('#pdf-viewer-title')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('representative Sim2 range and drag handle respond to keyboard input', async ({ page }) => {
    await openRoute(page, 'ch1-1-3');
    const range = page.locator('.sim2-controls input[type="range"]').first();
    await range.waitFor();
    const beforeValue = await range.inputValue();
    await range.focus();
    await page.keyboard.press('ArrowRight');
    expect(await range.inputValue()).not.toBe(beforeValue);
    await expect(range).toHaveAttribute('aria-describedby', /-output$/);

    const handle = page.getByRole('slider', { name: 'Đầu vectơ lực P' });
    const beforeX = Number(await handle.getAttribute('cx'));
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    expect(Number(await handle.getAttribute('cx'))).toBeGreaterThan(beforeX);
    await expect(handle).toBeFocused();
  });

  test('representative Sim3 mode toggle works from the keyboard with an announced fallback', async ({ page }) => {
    await openRoute(page, 'ch1-1-5');
    const mode3d = page.getByRole('button', { name: 'Chế độ mô phỏng 3D' });
    await mode3d.waitFor();
    await mode3d.focus();
    await page.keyboard.press('Space');
    await page.waitForFunction(() => {
      const button = document.querySelector('.sim3-mode-toggle [data-mode="3d"]');
      const fallback = document.querySelector('.sim3-fallback');
      return button?.getAttribute('aria-pressed') === 'true' || (fallback && !fallback.hidden);
    });

    const fallbackVisible = await page.locator('.sim3-fallback').isVisible();
    if (fallbackVisible) {
      await expect(page.locator('.sim3-fallback')).toContainText('đang dùng 2D');
      await expect(page.getByRole('button', { name: 'Chế độ mô phỏng 2D' })).toHaveAttribute('aria-pressed', 'true');
    } else {
      await expect(mode3d).toHaveAttribute('aria-pressed', 'true');
      const canvas = page.locator('.sim3-host [role="img"]');
      await expect(canvas).toBeVisible();
      await expect(canvas).toHaveAttribute('aria-label', /\S+/);
    }
    await expect(mode3d).toBeFocused();
  });
});
