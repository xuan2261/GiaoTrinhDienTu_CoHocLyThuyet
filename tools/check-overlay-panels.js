/**
 * Q2 verification: are empty-looking panels a screenshot artifact (HTML overlay
 * mounted outside the captured element) or a real suppressed-render bug?
 * Checks DOM for sim-overlay-formula / sim-overlay-label nodes + their text.
 * Usage: node tools/check-overlay-panels.js   (dev server must run on 8011)
 */
const { chromium } = require('@playwright/test');

const ROUTES = ['ch3-5-3', 'ch3-3-2', 'ch3-2-2', 'ch2-2-2', 'ch2-3-2', 'ch3-6-3'];
const BASE = process.env.SIM_BASE_URL || 'http://127.0.0.1:8011/';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const route of ROUTES) {
    await page.goto(`${BASE}#${route}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.sim-lab canvas, .sim-container canvas', { timeout: 15000 });
    await page.waitForTimeout(900);
    const info = await page.evaluate(() => {
      const formulas = [...document.querySelectorAll('.sim-overlay-formula')];
      const labels = [...document.querySelectorAll('.sim-overlay-label')];
      const txt = el => (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      return {
        formulaCount: formulas.length,
        labelCount: labels.length,
        formulaSamples: formulas.slice(0, 6).map(txt).filter(Boolean),
        labelSamples: labels.slice(0, 6).map(txt).filter(Boolean),
        allowFlag: typeof window.__simAllowFormulaOverlay,
      };
    });
    console.log(`${route}: formulas=${info.formulaCount} labels=${info.labelCount}`);
    console.log(`   formula text: ${JSON.stringify(info.formulaSamples)}`);
    console.log(`   label text  : ${JSON.stringify(info.labelSamples)}`);
  }
  await browser.close();
})();
