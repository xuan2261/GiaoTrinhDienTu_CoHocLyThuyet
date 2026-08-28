const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

async function open(page, route = 'home', viewport = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewport);
  await page.goto(`${INDEX}#${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(expected => location.hash === `#${expected}`, route);
}

async function contentGeometry(page) {
  return page.locator('#content-area').evaluate(node => {
    const rect = node.getBoundingClientRect();
    return { width: rect.width, left: rect.left, right: rect.right, maxWidth: getComputedStyle(node).maxWidth };
  });
}

test('content width defaults to the unchanged standard layout and toggles persistently', async ({ page }) => {
  await open(page);
  const button = page.getByRole('button', { name: 'Mở rộng nội dung' });
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('html')).toHaveAttribute('data-content-width', 'standard');
  const standard = await contentGeometry(page);

  await button.click();
  await expect(page.locator('html')).toHaveAttribute('data-content-width', 'wide');
  await expect(page.getByRole('button', { name: 'Dùng chiều rộng tiêu chuẩn' })).toHaveAttribute('aria-pressed', 'true');
  const wide = await contentGeometry(page);
  expect(wide.width).toBeGreaterThan(standard.width + 100);
  expect(wide.right).toBeLessThanOrEqual(1441);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-content-width', 'wide');
  await expect(page.getByRole('button', { name: 'Dùng chiều rộng tiêu chuẩn' })).toHaveAttribute('aria-pressed', 'true');
});

test('saved wide preference is applied before the stylesheet and tracks sidebar space', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('contentWidth', 'wide'));
  await open(page, 'ch1-1-3');
  await expect(page.locator('html')).toHaveAttribute('data-content-width', 'wide');
  const openSidebar = await contentGeometry(page);

  await page.getByRole('button', { name: 'Đóng mục lục' }).click();
  await page.waitForFunction(width => document.querySelector('#content-area').getBoundingClientRect().width > width + 100, openSidebar.width);
  const closedSidebar = await contentGeometry(page);
  expect(closedSidebar.width).toBeGreaterThan(openSidebar.width + 100);
  expect(closedSidebar.left).toBeGreaterThanOrEqual(0);
  expect(closedSidebar.right).toBeLessThanOrEqual(1441);

  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  expect(index.indexOf('js/content-width.js')).toBeGreaterThan(-1);
  expect(index.indexOf('js/content-width.js')).toBeLessThan(index.indexOf('css/style.css'));
});


test('storage access errors do not stop the width control or page startup', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { throw new Error('Storage disabled'); },
    });
  });
  await open(page, 'ch2-quiz');
  const button = page.getByRole('button', { name: 'Mở rộng nội dung' });
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.locator('html')).toHaveAttribute('data-content-width', 'wide');
  await expect(page.locator('#quiz-ch2 .q-card')).toHaveCount(100);
});
test('invalid or unavailable storage leaves the reader usable and narrow controls remain safe', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('contentWidth', 'unsupported'));
  await open(page);
  await expect(page.locator('html')).toHaveAttribute('data-content-width', 'standard');
  await expect(page.getByRole('button', { name: 'Mở rộng nội dung' })).toHaveAttribute('aria-pressed', 'false');

  await open(page, 'ch1-quiz', { width: 800, height: 720 });
  const tabletButton = page.getByRole('button', { name: 'Mở rộng nội dung' });
  await expect(tabletButton).toBeVisible();
  await tabletButton.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-content-width', 'wide');

  await open(page, 'ch1-quiz', { width: 320, height: 640 });
  await expect(page.locator('#contentWidthBtn')).toBeHidden();
  const overflow = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);
});
