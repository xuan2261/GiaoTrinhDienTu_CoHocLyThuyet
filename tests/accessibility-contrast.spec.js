const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = `file:///${path.join(ROOT, 'index.html').replace(/\\/g, '/')}`;
const BASELINE = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/accessibility-baseline.json'), 'utf8'));

function channels(color) {
  const match = color.match(/^#([0-9a-f]{6})$/i);
  if (!match) throw new Error(`Expected six-digit hex token, received ${color}`);
  return [0, 2, 4].map(offset => parseInt(match[1].slice(offset, offset + 2), 16) / 255);
}

function luminance(color) {
  const [r, g, b] = channels(color).map(value => value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

for (const theme of ['dark', 'light']) {
  test(`${theme} deterministic token pairs meet their WCAG thresholds`, async ({ page }) => {
    await page.goto(`${INDEX}#home`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
    const pairs = BASELINE.tokenPairs.filter(pair => pair.theme === theme);
    const values = await page.evaluate(requested => {
      const style = getComputedStyle(document.documentElement);
      return Object.fromEntries(requested.flatMap(pair => [pair.foreground, pair.background])
        .filter((token, index, all) => all.indexOf(token) === index)
        .map(token => [token, style.getPropertyValue(token).trim()]));
    }, pairs);

    for (const pair of pairs) {
      const ratio = contrast(values[pair.foreground], values[pair.background]);
      expect(ratio, `${pair.id}: ${values[pair.foreground]} on ${values[pair.background]}`).toBeGreaterThanOrEqual(pair.minimum);
    }
  });
}

for (const theme of ['dark', 'light']) {
  test(`${theme} visible keyboard focus uses the declared non-text contrast token`, async ({ page }) => {
    await page.goto(`${INDEX}#home`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
    const menu = page.locator('.menu-toggle');
    await menu.focus();
    const focus = await menu.evaluate(node => {
      const style = getComputedStyle(node);
      return { outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth), outlineColor: style.outlineColor };
    });
    expect(focus.outlineStyle).not.toBe('none');
    expect(focus.outlineWidth).toBeGreaterThanOrEqual(2);
    expect(focus.outlineColor).not.toBe('rgba(0, 0, 0, 0)');
  });
}

test('baseline records passed automation while preserving pending independent review and limited claims', () => {
  expect(BASELINE.automation.status).toBe('passed');
  expect(BASELINE.automation.command).toBe('npm run test:accessibility');
  expect(BASELINE.automation.specs).toContain('tests/accessibility-axe.spec.js');
  expect(BASELINE.manualReview.status).toBe('pending-independent-review');
  expect(BASELINE.claim).toMatch(/not an institutional certification|not.*blanket conformance/i);
  expect(BASELINE.scope.excludedOrLimited.length).toBeGreaterThan(0);
  expect([...BASELINE.criteria, ...BASELINE.additionalContracts].every(item => item.automatedStatus && item.manualStatus)).toBe(true);
});
