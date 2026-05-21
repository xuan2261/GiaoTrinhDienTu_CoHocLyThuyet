/**
 * Capture screenshots of all 58 simulations into a single folder.
 * Usage: node tools/capture-all-58-simulations-screenshots.js [outDir] [--routes a,b,c]
 *   outDir defaults to screenshots/sim-review-<timestamp>
 *
 * Pre-requisite: dev server running at http://127.0.0.1:8000/
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const ROUTES = [
  // Ch1 Statics (25)
  'ch1-1-3','ch1-1-4','ch1-1-5','ch1-1-6','ch1-1-8',
  'ch1-2-1','ch1-2-3','ch1-2-6',
  'ch1-3-1','ch1-3-2','ch1-3-3','ch1-3-4','ch1-3-6','ch1-3-7',
  'ch1-4-1','ch1-4-2','ch1-4-4',
  'ch1-5-1','ch1-5-2','ch1-5-3','ch1-5-4',
  'ch1-6-2','ch1-6-3',
  'ch1-7-1','ch1-7-2',
  // Ch2 Kinematics (15)
  'ch2-1-1','ch2-1-2','ch2-1-3','ch2-1-4',
  'ch2-2-2',
  'ch2-3-2',
  'ch2-4-1','ch2-4-2','ch2-4-3','ch2-4-4',
  'ch2-5-1','ch2-5-2','ch2-5-3',
  'ch2-7-1','ch2-7-2',
  // Ch3 Dynamics (18)
  'ch3-1-2','ch3-1-3',
  'ch3-2-1','ch3-2-2','ch3-2-3','ch3-2-5',
  'ch3-3-1','ch3-3-2',
  'ch3-4-1','ch3-4-2',
  'ch3-5-1','ch3-5-2','ch3-5-3','ch3-5-4',
  'ch3-6-2','ch3-6-3',
  'ch3-7-1','ch3-7-2',
];

const BASE_URL = process.env.SIM_BASE_URL || 'http://127.0.0.1:8000/';
function argValue(name) {
  const direct = process.argv.find(item => item.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : '';
}
const routeArg = argValue('--routes') || process.env.SIM_CAPTURE_ROUTES || '';
const ACTIVE_ROUTES = routeArg
  ? ROUTES.filter(route => routeArg.split(',').map(item => item.trim()).includes(route))
  : ROUTES;

(async () => {
  const stamp = new Date().toISOString().replace(/[:.]/g,'-').slice(0,16);
  const outDirArg = process.argv.find((arg, index) => index > 1 && !arg.startsWith('--') && process.argv[index - 1] !== '--routes');
  const outDir = outDirArg || path.join('screenshots', `sim-review-${stamp}`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.join(outDir, 'full'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'sim-only'), { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  const results = [];

  // Capture console errors per route
  const errorBag = [];
  page.on('pageerror', e => errorBag.push(`pageerror: ${e.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') errorBag.push(`console.error: ${msg.text()}`);
  });

  for (let i = 0; i < ACTIVE_ROUTES.length; i++) {
    const route = ACTIVE_ROUTES[i];
    errorBag.length = 0;
    const idx = String(i + 1).padStart(2, '0');
    const tag = `${idx}-${route}`;
    process.stdout.write(`[${idx}/${ACTIVE_ROUTES.length}] ${route} ... `);
    const t0 = Date.now();
    let status = 'ok';
    let mountedSelector = '';
    let canvasInfo = null;

    try {
      await page.goto(`${BASE_URL}#${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(300);
      await page.waitForSelector('.sim-container.sim-lab canvas, .sim-lab canvas, .sim-container canvas', { timeout: 15000 });
      await page.waitForTimeout(800);

      canvasInfo = await page.evaluate(() => {
        const c = document.querySelector('.sim-container.sim-lab canvas, .sim-lab canvas, .sim-container canvas');
        if (!c) return null;
        const rect = c.getBoundingClientRect();
        return {
          width: c.width, height: c.height,
          rectW: Math.round(rect.width), rectH: Math.round(rect.height),
          hasContent: (() => {
            try {
              const ctx = c.getContext('2d');
              const data = ctx.getImageData(0,0,Math.min(c.width,40),Math.min(c.height,40)).data;
              let nonBlank = 0;
              for (let k = 3; k < data.length; k += 4) if (data[k] > 0) nonBlank++;
              return nonBlank > 0;
            } catch (_) { return null; }
          })(),
        };
      });

      const main = await page.$('main, .app-main, #main');
      const fullPath = path.join(outDir, 'full', `${tag}.png`);
      if (main) {
        await main.screenshot({ path: fullPath });
      } else {
        await page.screenshot({ path: fullPath });
      }

      const sim = await page.$('.sim-container.sim-lab') || await page.$('.sim-lab') || await page.$('.sim-container');
      const simPath = path.join(outDir, 'sim-only', `${tag}.png`);
      if (sim) {
        mountedSelector = await sim.evaluate(el => el.className);
        await sim.screenshot({ path: simPath });
      } else {
        status = 'no-sim-container';
        await page.screenshot({ path: simPath });
      }
    } catch (err) {
      status = `error: ${err.message.slice(0, 200)}`;
      try {
        await page.screenshot({ path: path.join(outDir, 'full', `${tag}.png`), fullPage: false });
      } catch (_) {}
    }
    const ms = Date.now() - t0;
    const errs = errorBag.slice();
    results.push({ idx, route, status, ms, mountedSelector, canvasInfo, errors: errs });
    console.log(`${status} (${ms}ms${errs.length?`, ${errs.length} err`:''})`);
  }

  await browser.close();

  fs.writeFileSync(path.join(outDir, 'capture-manifest.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    total: ACTIVE_ROUTES.length,
    routes: ACTIVE_ROUTES,
    results,
  }, null, 2));

  const rows = results.map(r => `
    <tr class="${r.status === 'ok' ? '' : 'bad'}">
      <td>${r.idx}</td>
      <td><code>${r.route}</code></td>
      <td>${r.status}</td>
      <td>${r.canvasInfo ? `${r.canvasInfo.width}×${r.canvasInfo.height} (rect ${r.canvasInfo.rectW}×${r.canvasInfo.rectH}) hasContent=${r.canvasInfo.hasContent}` : '-'}</td>
      <td>${r.errors.length}</td>
      <td><img loading="lazy" src="sim-only/${r.idx}-${r.route}.png" style="max-width:560px;border:1px solid #ccc"></td>
    </tr>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><title>Sim review ${stamp}</title>
<style>
body{font:14px system-ui;margin:24px}
table{border-collapse:collapse;width:100%}
td,th{border:1px solid #ccc;padding:6px;vertical-align:top;text-align:left}
tr.bad{background:#fee}
code{background:#f4f4f4;padding:1px 4px;border-radius:3px}
</style>
<h1>Sim review ${stamp}</h1>
<p>${results.length} routes captured. <a href="capture-manifest.json">manifest JSON</a></p>
<table>
  <thead><tr><th>#</th><th>Route</th><th>Status</th><th>Canvas</th><th>Errs</th><th>Sim-only screenshot</th></tr></thead>
  <tbody>${rows}</tbody>
</table>`;
  fs.writeFileSync(path.join(outDir, 'index.html'), html);

  const okCount = results.filter(r => r.status === 'ok').length;
  console.log(`\nDone. ${okCount}/${ACTIVE_ROUTES.length} OK. Output: ${outDir}`);
})();
