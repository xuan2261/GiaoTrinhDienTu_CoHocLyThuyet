const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

async function openApp(page, route = 'home') {
  await page.goto(`${INDEX}#${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.TextbookSearch && window.TextbookSearch.ready());
}

test.describe('Phase 8 landmark and accessible-name contracts', () => {
  test('closed application has one labelled landmark set and a working bypass link', async ({ page }) => {
    await openApp(page);

    await expect(page.getByRole('banner', { name: 'Thanh công cụ giáo trình' })).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Mục lục giáo trình' })).toHaveCount(1);
    await expect(page.getByRole('main', { name: 'Nội dung giáo trình' })).toHaveCount(1);
    await expect(page.getByRole('contentinfo', { name: 'Thông tin giáo trình' })).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);

    const skip = page.getByRole('link', { name: 'Bỏ qua điều hướng đến nội dung chính' });
    await expect(skip).toHaveAttribute('href', '#main-content');
    await expect(page.getByRole('button', { name: 'Đóng mục lục' })).toHaveAttribute('aria-controls', 'sb');
    await expect(page.getByRole('button', { name: 'Chuyển sang giao diện sáng' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('sidebar disclosure buttons expose the controlled region and current state', async ({ page }) => {
    await openApp(page);
    const chapter = page.getByRole('button', { name: /Chương 1\. Tĩnh học/ });
    const controlledId = await chapter.getAttribute('aria-controls');

    expect(controlledId).toBeTruthy();
    await expect(chapter).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(`#${controlledId}`)).toBeHidden();
    await chapter.click();
    await expect(chapter).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(`#${controlledId}`)).toHaveClass(/open/);
    await expect(page.locator(`#${controlledId}`)).toBeVisible();

    const section = page.getByRole('button', { name: 'I. KHÁI NIỆM CƠ BẢN' });
    const sectionId = await section.getAttribute('aria-controls');
    await expect(section).toHaveAttribute('aria-expanded', 'false');
    await section.press('Space');
    await expect(section).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(`#${sectionId}`)).toBeVisible();
  });

  test('dynamic bookmark icon exposes its action and pressed state', async ({ page }) => {
    await openApp(page, 'ch1-1-3');
    const bookmark = page.getByRole('button', { name: 'Đánh dấu trang này' });
    await expect(bookmark).toHaveAttribute('aria-pressed', 'false');
    await bookmark.click();
    await expect(page.getByRole('button', { name: 'Bỏ đánh dấu trang này' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('search is a labelled combobox and PDF dialog does not add a competing main', async ({ page }) => {
    await openApp(page);
    const search = page.getByRole('combobox', { name: 'Tìm kiếm trong giáo trình' });
    await expect(search).toHaveAttribute('aria-controls', 'sr');
    await expect(search).toHaveAttribute('aria-haspopup', 'listbox');
    await search.fill('Tĩnh học');
    await expect(search).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('listbox', { name: 'Kết quả tìm kiếm' })).toBeVisible();
    await expect(page.locator('#search-status')).toContainText(/kết quả/i);

    await page.getByRole('button', { name: 'Xem bản PDF' }).click();
    const dialog = page.getByRole('dialog', { name: /Bản PDF/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('document', { name: 'Nội dung bản PDF' })).toBeVisible();
    await expect(dialog.locator('main')).toHaveCount(0);
    await expect(page.locator('main')).toHaveCount(1);
  });
});
