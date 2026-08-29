const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

async function openChapter(page, chapter, viewport = { width: 1280, height: 800 }) {
  await page.setViewportSize(viewport);
  await page.goto(`${INDEX}#${chapter}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#content-area .chapter-reference');
}

test('chapter reference tables are semantic, visible by default, and link to first use', async ({ page }) => {
  await openChapter(page, 'ch1');
  const reference = page.locator('.chapter-reference');
  await expect(reference.getByRole('heading', { name: 'Tra cứu ký hiệu, chữ viết tắt và đơn vị' })).toBeVisible();
  await expect(reference.locator('details[open]')).toHaveCount(1);
  await expect(reference.locator('table thead th[scope=col]')).toHaveCount(4);
  await expect(reference.locator('tbody .chapter-reference-group')).toHaveCount(3);
  expect(await reference.locator('a[href="#ch1-1-3"]').count()).toBeGreaterThanOrEqual(2);
  const vectorCell = reference.locator('tbody tr:not(.chapter-reference-group) th').first();
  const vectorArrow = vectorCell.locator('.katex svg');
  await expect(vectorArrow).toBeVisible();
  const [cellBox, arrowBox] = await Promise.all([vectorCell.boundingBox(), vectorArrow.boundingBox()]);
  expect(arrowBox.x).toBeGreaterThanOrEqual(cellBox.x);
  expect(arrowBox.y).toBeGreaterThanOrEqual(cellBox.y);
  expect(arrowBox.x + arrowBox.width).toBeLessThanOrEqual(cellBox.x + cellBox.width);
  expect(arrowBox.y + arrowBox.height).toBeLessThanOrEqual(cellBox.y + cellBox.height);

  await reference.locator('a[href="#ch1-1-3"]').first().click();
  await page.waitForFunction(() => location.hash === '#ch1-1-3');
  await expect(page.locator('#bc')).toContainText('Lực');
  await expect(page.locator('.sub-menu .l3.active')).toContainText('Lực');
});

test('reference table owns narrow horizontal scrolling without document overflow', async ({ page }) => {
  await openChapter(page, 'ch2', { width: 320, height: 640 });
  const scrollRegion = page.locator('.chapter-reference-scroll');
  await expect(scrollRegion).toBeVisible();
  const metrics = await scrollRegion.evaluate(node => ({ client: node.clientWidth, scroll: node.scrollWidth }));
  expect(metrics.scroll).toBeGreaterThan(metrics.client);
  const documentMetrics = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(documentMetrics.scroll).toBeLessThanOrEqual(documentMetrics.client + 1);
});
