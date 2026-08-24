const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];

async function openApp(page, route) {
  await page.goto(`${INDEX}#${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.TextbookSearch && window.TextbookSearch.ready());
}

async function severeViolations(page) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return results.violations
    .filter(violation => ['critical', 'serious'].includes(violation.impact))
    .map(violation => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.map(node => node.target.join(' ')),
    }));
}

for (const route of ['home', 'ch3-quiz', 'ch1-5-2']) {
  test(`${route} has no critical or serious axe violations`, async ({ page }) => {
    await openApp(page, route);
    expect(await severeViolations(page)).toEqual([]);
  });
}

test('open PDF dialog has no critical or serious axe violations', async ({ page }) => {
  await openApp(page, 'home');
  await page.getByRole('button', { name: 'Xem bản PDF' }).click();
  await expect(page.getByRole('dialog', { name: /Bản PDF/i })).toBeVisible();
  expect(await severeViolations(page)).toEqual([]);
});
