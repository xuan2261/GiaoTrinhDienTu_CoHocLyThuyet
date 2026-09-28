'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '../..');
const OUT_DIR = path.join(ROOT, 'assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets');
const CASES = [
  { route: 'ch1-6-3', chapter: 1, steps: 0, file: 'sim-live-ch1-6-3.png', label: 'Trọng tâm hình phẳng ghép và khoét' },
  { route: 'ch2-4-4', chapter: 2, steps: 120, file: 'sim-live-ch2-4-4.png', label: 'Hợp chuyển động và gia tốc Coriolis' },
  { route: 'ch3-6-2', chapter: 3, steps: 125, file: 'sim-live-ch3-6-2.png', label: 'Va chạm một chiều với hệ số phục hồi' },
];

const fixtureFor = chapter => `file:///${path.join(ROOT, `tests/fixtures/sim2-ch${chapter}.html`).replace(/\\/g, '/')}`;

async function captureCase(page, item) {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(fixtureFor(item.chapter), { waitUntil: 'domcontentloaded' });
  await page.addStyleTag({ path: path.join(ROOT, 'css/style.css') });
  await page.evaluate(({ route }) => {
    document.documentElement.setAttribute('data-theme', 'light');
    const host = document.getElementById('host');
    host.style.width = '1320px';
    host.style.height = 'auto';
    host.style.minHeight = '760px';
    host.style.padding = '24px';
    host.style.background = '#fff';
    host.style.boxSizing = 'border-box';
    window.__sim = window.SIM_MAP[route](host);
  }, { route: item.route });
  await page.locator('#host .sim2-svg').waitFor({ state: 'visible' });
  if (item.steps) {
    await page.evaluate(count => {
      const step = document.querySelector('#host .sim2-step');
      if (!step) throw new Error('simulation step control not found');
      for (let i = 0; i < count; i += 1) step.click();
    }, item.steps);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  const output = path.join(OUT_DIR, item.file);
  await page.locator('#host').screenshot({ path: output });
  const size = await page.locator('#host').boundingBox();
  const focusedOutput = output.replace(/\.png$/i, '-focus.png');
  await page.screenshot({
    path: focusedOutput,
    clip: {
      x: Math.round(size.x),
      y: Math.round(size.y),
      width: Math.round(size.width),
      height: Math.min(580, Math.round(size.height)),
    },
  });
  await page.evaluate(() => window.__sim && window.__sim.dispose());
  if (errors.length) throw new Error(`${item.route} emitted browser errors:\n${errors.join('\n')}`);
  return {
    route: item.route,
    file: path.relative(ROOT, output).replaceAll('\\', '/'),
    focusedFile: path.relative(ROOT, focusedOutput).replaceAll('\\', '/'),
    width: Math.round(size.width),
    height: Math.round(size.height),
    focusedHeight: Math.min(580, Math.round(size.height)),
    steps: item.steps,
    label: item.label,
  };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  try {
    const captures = [];
    for (const item of CASES) captures.push(await captureCase(page, item));
    const manifest = { generatedAt: new Date().toISOString(), viewport: { width: 1440, height: 900 }, captures };
    fs.writeFileSync(path.join(OUT_DIR, 'sim-live-captures.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    process.stdout.write(`${JSON.stringify(manifest)}\n`);
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
