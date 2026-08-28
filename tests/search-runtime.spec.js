const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

async function openSearch(page) {
  await page.goto(`${INDEX}#home`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.TextbookSearch && window.TextbookSearch.ready());
  return page.locator('#si');
}

test.describe('offline full-text search', () => {
  test('finds body text with accents or folding and focuses the stable anchor', async ({ page }) => {
    const input = await openSearch(page);
    await expect(input).toHaveAttribute('role', 'combobox');
    await expect(input).toHaveAttribute('aria-controls', 'sr');

    await input.fill('vô cùng bé');
    const first = page.locator('#sr [role="option"]').first();
    await expect(first).toBeVisible();
    const accentedRoute = await first.getAttribute('data-route');

    await input.fill('vo cung be');
    await expect(page.locator('#sr [role="option"]').first()).toHaveAttribute('data-route', accentedRoute);
    await input.press('ArrowDown');
    await expect(page.locator('#sr [role="option"]').first()).toHaveAttribute('aria-selected', 'true');
    await input.press('Enter');

    await page.waitForFunction(() => document.activeElement && document.activeElement.id.startsWith('search-'));
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`#${accentedRoute}$`));
  });
  test('indexes level-three page titles and Enter opens the first result', async ({ page }) => {
    const input = await openSearch(page);
    await input.fill('Câu hỏi trắc nghiệm Chương 1');
    await input.press('Enter');
    await page.waitForFunction(() => document.activeElement?.classList.contains('l3-title'));
    await expect(page).toHaveURL(/#ch1-quiz$/);
    await expect(page.locator(':focus')).toHaveText('Câu hỏi trắc nghiệm Chương 1');
  });


  test('ranks exact titles first and exposes listbox status semantics', async ({ page }) => {
    const input = await openSearch(page);
    await input.fill('Tĩnh học');
    const listbox = page.locator('#sr');
    await expect(listbox).toHaveAttribute('role', 'listbox');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(listbox.locator('[role="option"]').first()).toHaveAttribute('data-route', 'ch1');
    await expect(page.locator('#search-status')).toContainText(/kết quả/i);
    await input.press('Escape');
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('uses a visible navigation-only fallback for structurally corrupt entries', async ({ page }) => {
    const input = await openSearch(page);
    await page.evaluate(() => {
      window.SEARCH_INDEX.entries[0].routeId = 'missing';
      window.TextbookSearch.init({ navItems: [{ id: 'ch1', text: 'Tĩnh học' }] });
    });
    await input.fill('Tĩnh');
    await expect(page.locator('#sr .search-degraded')).toBeVisible();
    await expect(page.locator('#search-status')).toContainText(/mục lục/i);
    await expect(page.locator('#sr [role="option"]').first()).toHaveAttribute('data-route', 'ch1');
  });

  test('falls back when glossary metadata is stale', async ({ page }) => {
    const input = await openSearch(page);
    await page.evaluate(() => {
      window.TEXTBOOK_GLOSSARY_TERMS.__stale = 'changed';
      window.TextbookSearch.init({ navItems: [{ id: 'ch1', text: 'Tĩnh học' }] });
    });
    await input.fill('Tĩnh');
    await expect(page.locator('#sr .search-degraded')).toBeVisible();
  });

  test('renders hostile queries as text and reports no results', async ({ page }) => {
    const input = await openSearch(page);
    await input.fill('<img src=x onerror=window.__searchXss=1>');
    await expect(page.locator('#search-status')).toContainText(/không tìm thấy/i);
    expect(await page.evaluate(() => window.__searchXss)).toBeUndefined();
    await expect(page.locator('#sr img')).toHaveCount(0);
  });

  test('finds rendered chapter-reference terms and opens their chapter route', async ({ page }) => {
    const input = await openSearch(page);
    await input.fill('HQT');
    const referenceResult = page.locator('#sr [role="option"]').first();
    await expect(referenceResult).toHaveAttribute('data-route', 'ch3');
    await input.press('Enter');
    await expect(page).toHaveURL(/#ch3$/);
    await expect(page.locator('.chapter-reference')).toContainText('Hệ quy chiếu quán tính');
  });
});
