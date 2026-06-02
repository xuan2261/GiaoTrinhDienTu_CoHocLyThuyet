/**
 * Selective visual baselines for representative Sim2 routes.
 * DEV-ONLY: intentionally narrow, not part of test:sim:release.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const fixtureFor = ch =>
  `file:///${path.join(ROOT, `tests/fixtures/sim2-ch${ch}.html`).replace(/\\/g, '/')}`;

const CASES = [
  { route: 'ch1-6-3', chapter: 1, label: 'negative-area', steps: 0 },
  { route: 'ch2-3-2', chapter: 2, label: 'transmission', steps: 120 },
  { route: 'ch2-4-4', chapter: 2, label: 'coriolis-callout', steps: 120 },
  { route: 'ch3-3-1', chapter: 3, label: 'ode-graph', steps: 120 },
  { route: 'ch3-6-2', chapter: 3, label: 'collision-after', steps: 125 }
];

async function prepareHost(page, chapter, route) {
  await page.goto(fixtureFor(chapter), { waitUntil: 'domcontentloaded' });
  await page.addStyleTag({ path: path.join(ROOT, 'css/style.css') });
  await page.evaluate(id => {
    document.documentElement.setAttribute('data-theme', 'light');
    const h = document.getElementById('host');
    h.style.width = '960px';
    h.style.height = 'auto';
    h.style.minHeight = '560px';
    h.style.padding = '16px';
    h.style.background = '#fff';
    h.style.boxSizing = 'border-box';
    window.__sim = window.SIM_MAP[id](h);
  }, route);
}

async function stepN(page, n) {
  if (!n) return;
  await page.evaluate(count => {
    const step = document.querySelector('#host .sim2-step');
    if (!step) return;
    for (let i = 0; i < count; i++) step.click();
  }, n);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
}

test.describe('sim2 selective screenshot baselines', () => {
  for (const c of CASES) {
    test(`${c.route}: ${c.label}`, async ({ page }) => {
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push(String(e)));

      await prepareHost(page, c.chapter, c.route);
      await stepN(page, c.steps);
      await expect(page.locator('#host')).toHaveScreenshot(`${c.route}-${c.label}.png`, {
        animations: 'disabled',
        caret: 'hide'
      });
      await page.evaluate(() => window.__sim && window.__sim.dispose());
      expect(errors, errors.join('\n')).toEqual([]);
    });
  }
});
