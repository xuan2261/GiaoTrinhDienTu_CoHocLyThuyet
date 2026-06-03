const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '../..');
const OUT_DIR = path.join(ROOT, 'plans/260603-2100-sim3-ch2-5-3-single-route-tdd-rollout/visuals');

const cases = [
  { id: 'ch2-2-2', fixture: 'sim2-ch2.html', steps: 8 },
  { id: 'ch2-3-2', fixture: 'sim2-ch2.html', steps: 8 },
  { id: 'ch2-4-4', fixture: 'sim2-ch2.html', steps: 16 },
  { id: 'ch2-5-3', fixture: 'sim2-ch2.html', steps: 0 },
  { id: 'ch3-5-3', fixture: 'sim2-ch3.html', steps: 8 },
  { id: 'ch3-6-2', fixture: 'sim2-ch3.html', steps: 24 }
];

function fixtureUrl(name) {
  return `file:///${path.join(ROOT, `tests/fixtures/${name}`).replace(/\\/g, '/')}`;
}

test.describe('sim3 pilot visual capture', () => {
  test.beforeAll(() => fs.mkdirSync(OUT_DIR, { recursive: true }));

  for (const cfg of cases) {
    test(`capture ${cfg.id} 3D`, async ({ page }) => {
      await page.goto(fixtureUrl(cfg.fixture), { waitUntil: 'domcontentloaded' });
      await page.addStyleTag({ path: path.join(ROOT, 'css/style.css') });
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        const h = document.getElementById('host');
        h.style.width = '960px';
        h.style.height = 'auto';
        h.style.minHeight = '560px';
        h.style.padding = '16px';
        h.style.background = '#fff';
      });
      await page.evaluate(id => { window.__sim = window.SIM_MAP[id](document.getElementById('host')); }, cfg.id);
      await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').click();
      await expect(page.locator('#host canvas.sim3-canvas')).toBeVisible();
      await page.evaluate(n => {
        const step = document.querySelector('#host .sim2-step');
        for (let i = 0; i < n && step; i++) step.click();
      }, cfg.steps);
      await page.locator('#host').screenshot({ path: path.join(OUT_DIR, `${cfg.id}-sim3.png`) });
      await page.evaluate(() => window.__sim.dispose());
    });
  }
});
