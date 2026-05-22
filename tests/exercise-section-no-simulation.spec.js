const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_FILE_URL = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;

const EXERCISE_SECTION_ROUTES = [
  'ch1-7', 'ch1-7-1', 'ch1-7-2', 'ch1-7-3',
  'ch2-7', 'ch2-7-1', 'ch2-7-2', 'ch2-7-3',
  'ch3-7', 'ch3-7-1', 'ch3-7-2', 'ch3-7-3', 'ch3-7-4', 'ch3-7-5', 'ch3-7-6',
];

async function openContentRoute(page, route) {
  await page.goto(`${INDEX_FILE_URL}#${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(expected => window.location.hash.replace('#', '') === expected, route);
  await page.waitForSelector('#content-area .sh2, #content-area .l3-content');
  await page.waitForTimeout(120);
}

test.describe('VII BAI TAP section content routes', () => {
  for (const route of EXERCISE_SECTION_ROUTES) {
    test(`${route} does not mount or reserve simulation UI`, async ({ page }) => {
      await openContentRoute(page, route);

      await expect(page.locator('#content-area h2')).toContainText('BÀI TẬP');
      await expect(page.locator('#content-area .sim-container.sim-lab')).toHaveCount(0);
      await expect(page.locator('#content-area .sim-viewport-v2')).toHaveCount(0);
      await expect(page.locator('#content-area [data-sim-mount-route]')).toHaveCount(0);
      await expect(page.locator('#content-area .sim-mount')).toHaveCount(0);
      await expect(page.locator('#content-area [id^="sim-ch"]')).toHaveCount(0);
    });
  }

  test('non-exercise simulation routes still mount normally', async ({ page }) => {
    await openContentRoute(page, 'ch1-2-3');
    await expect(page.locator('#content-area .sim-container.sim-lab')).toHaveCount(1);
    await expect(page.locator('#content-area [data-sim-mount-route="ch1-2-3"]')).toHaveCount(1);
  });
});
