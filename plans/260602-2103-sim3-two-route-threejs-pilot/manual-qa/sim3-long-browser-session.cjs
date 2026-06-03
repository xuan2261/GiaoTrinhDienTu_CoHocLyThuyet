const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../..');
const outDir = path.join(__dirname, 'artifacts');
fs.mkdirSync(outDir, { recursive: true });

const baseUrl = process.env.SIM3_QA_BASE_URL || 'http://127.0.0.1:8765/';
const headed = process.env.SIM3_QA_HEADED !== '0';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function setSlider(page, id, value) {
  await page.locator(`#content-area input[data-id="${id}"]`).evaluate((el, next) => {
    el.value = String(next);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

async function play(page) {
  const btn = page.locator('#content-area .sim2-playpause');
  if ((await btn.innerText()).includes('▶')) await btn.click();
}

async function pause(page) {
  const btn = page.locator('#content-area .sim2-playpause');
  if ((await btn.innerText()).includes('⏸')) await btn.click();
}

async function readState(page, route) {
  return page.evaluate(id => {
    const debug = window.__SIM3_DEBUG__ && window.__SIM3_DEBUG__[id];
    const readout = Array.from(document.querySelectorAll('#content-area .sim2-readout-row'))
      .map(row => row.innerText.replace(/\s+/g, ' ').trim());
    return {
      route: window.location.hash,
      hasCanvas: !!document.querySelector('#content-area canvas.sim3-canvas'),
      hasSvg: !!document.querySelector('#content-area svg.sim2-svg'),
      canvasCount: document.querySelectorAll('#content-area canvas.sim3-canvas').length,
      mode3dPressed: document.querySelector('#content-area .sim3-mode-toggle [data-mode="3d"]')?.getAttribute('aria-pressed'),
      fallbackVisible: !!document.querySelector('#content-area .sim3-fallback:not([hidden])'),
      debug,
      readout
    };
  }, route);
}

async function screenshot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.locator('#content-area').screenshot({ path: file });
  return path.relative(root, file).replace(/\\/g, '/');
}

async function runRouteCh2(page, report) {
  await page.evaluate(() => window.loadPage('ch2-2-2'));
  await page.waitForSelector('#content-area .sim3-mode-toggle');
  report.steps.push({ name: 'ch2 mounted 2D default', state: await readState(page, 'ch2-2-2') });

  await page.locator('#content-area .sim3-mode-toggle [data-mode="3d"]').click();
  await page.waitForSelector('#content-area canvas.sim3-canvas');
  await play(page);
  await wait(2500);
  await pause(page);
  report.steps.push({ name: 'ch2 3D played 2.5s', state: await readState(page, 'ch2-2-2') });

  await setSlider(page, 'omega0', 1.8);
  await setSlider(page, 'alphaAcc', 0.45);
  await play(page);
  await wait(2500);
  await pause(page);
  report.steps.push({ name: 'ch2 high omega/alpha played 2.5s', state: await readState(page, 'ch2-2-2') });

  for (let i = 0; i < 10; i++) await page.locator('#content-area .sim2-step').click();
  report.screenshots.push(await screenshot(page, 'ch2-after-long-interaction'));

  await page.locator('#content-area .sim3-mode-toggle [data-mode="2d"]').click();
  await wait(300);
  await page.locator('#content-area .sim3-mode-toggle [data-mode="3d"]').click();
  await page.waitForSelector('#content-area canvas.sim3-canvas');
  await page.locator('#content-area .sim2-reset').click();
  report.steps.push({ name: 'ch2 toggled 2D->3D and reset', state: await readState(page, 'ch2-2-2') });
}

async function runRouteCh3(page, report) {
  await page.evaluate(() => window.loadPage('ch3-6-2'));
  await page.waitForSelector('#content-area .sim3-mode-toggle');
  report.steps.push({ name: 'route switch ch2->ch3 disposed old sim', state: await readState(page, 'ch3-6-2') });

  await page.locator('#content-area .sim3-mode-toggle [data-mode="3d"]').click();
  await page.waitForSelector('#content-area canvas.sim3-canvas');
  await setSlider(page, 'e', 0.25);
  await setSlider(page, 'm1', 4.5);
  await setSlider(page, 'm2', 1.5);
  await play(page);
  await wait(4200);
  await pause(page);
  report.steps.push({ name: 'ch3 3D low restitution played 4.2s', state: await readState(page, 'ch3-6-2') });
  report.screenshots.push(await screenshot(page, 'ch3-after-low-e-play'));

  await page.locator('#content-area .sim2-reset').click();
  await setSlider(page, 'e', 1);
  await play(page);
  await wait(4200);
  await pause(page);
  report.steps.push({ name: 'ch3 3D elastic played 4.2s', state: await readState(page, 'ch3-6-2') });
  report.screenshots.push(await screenshot(page, 'ch3-after-elastic-play'));

  await page.locator('#content-area .sim3-mode-toggle [data-mode="2d"]').click();
  await wait(300);
  await page.locator('#content-area .sim3-mode-toggle [data-mode="3d"]').click();
  await page.locator('#content-area .sim2-reset').click();
  report.steps.push({ name: 'ch3 toggled 2D->3D and reset', state: await readState(page, 'ch3-6-2') });
}

async function main() {
  const report = {
    baseUrl,
    headed,
    startedAt: new Date().toISOString(),
    steps: [],
    screenshots: [],
    console: [],
    pageErrors: [],
    assertions: []
  };

  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
  page.on('console', msg => {
    if (['error', 'warning'].includes(msg.type())) {
      report.console.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on('pageerror', err => report.pageErrors.push(String(err && err.stack || err)));

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.loadPage === 'function' && window.SIM_MAP);
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));

  await runRouteCh2(page, report);
  await runRouteCh3(page, report);

  await page.evaluate(() => window.loadPage('ch2-2-2'));
  await page.waitForSelector('#content-area .sim3-mode-toggle');
  report.steps.push({ name: 'route switch back ch3->ch2 clean remount', state: await readState(page, 'ch2-2-2') });
  report.screenshots.push(await screenshot(page, 'ch2-remount-after-ch3'));

  const lastCh2 = report.steps.findLast(s => s.state.debug && s.state.debug.radius === 3);
  const lastCh3 = report.steps.findLast(s => s.state.debug && Object.prototype.hasOwnProperty.call(s.state.debug, 'collided'));
  report.assertions.push({
    name: 'no page errors',
    pass: report.pageErrors.length === 0,
    details: report.pageErrors
  });
  report.assertions.push({
    name: 'no console errors',
    pass: report.console.filter(m => m.type === 'error').length === 0,
    details: report.console
  });
  report.assertions.push({
    name: 'single 3D canvas while active',
    pass: report.steps.every(s => s.state.canvasCount <= 1),
    details: report.steps.map(s => ({ name: s.name, canvasCount: s.state.canvasCount }))
  });
  report.assertions.push({
    name: 'ch2 and ch3 debug states updated',
    pass: !!lastCh2?.state.debug && !!lastCh3?.state.debug,
    details: { ch2: lastCh2?.state.debug, ch3: lastCh3?.state.debug }
  });

  report.finishedAt = new Date().toISOString();
  const reportPath = path.join(outDir, 'manual-session-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  await browser.close();

  const failed = report.assertions.filter(a => !a.pass);
  console.log(JSON.stringify({
    ok: failed.length === 0,
    report: path.relative(root, reportPath).replace(/\\/g, '/'),
    screenshots: report.screenshots,
    assertions: report.assertions
  }, null, 2));
  if (failed.length) process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
