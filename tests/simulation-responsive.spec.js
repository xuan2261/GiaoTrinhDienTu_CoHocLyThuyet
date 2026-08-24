const { test, expect } = require('@playwright/test');
const path = require('path');
const contracts = require('./support/simulation-route-contracts.js');

const indexUrl = `file:///${path.join(__dirname, '..', 'index.html').replace(/\\/g, '/')}`;
const widths = [360, 520, 900, 1024];
contracts.validateContracts(contracts);
test.use({ deviceScaleFactor: 2 });

async function assertResponsive(page, route, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.evaluate(id => window.loadPage(id), route.id);
  const root = page.locator('#content-area .sim2-root');
  await expect(root).toHaveCount(1);
  const metrics = await root.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      controls: element.closest('.sim-mount').querySelectorAll('button,input,[role=slider],.sim2-handle').length
    };
  });
  expect(metrics.width, `${route.id} 2D width at ${width}`).toBeGreaterThan(0);
  expect(metrics.scrollWidth, `${route.id} 2D horizontal overflow at ${width}`).toBeLessThanOrEqual(metrics.clientWidth + 1);
  expect(metrics.controls, `${route.id} controls at ${width}`).toBeGreaterThan(0);
  if (route.engine === 'sim3') {
    await page.locator('#content-area [data-mode="3d"]').click();
    const canvas = page.locator('#content-area canvas.sim3-canvas');
    await expect(canvas).toHaveCount(1);
    const surface = await page.locator('#content-area .sim3-host').evaluate(element => {
      const rect = element.getBoundingClientRect(), target = element.querySelector('canvas.sim3-canvas');
      return { width: rect.width, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth, pixelRatio: target.width / target.getBoundingClientRect().width };
    });
    expect(surface.width, `${route.id} 3D width at ${width}`).toBeGreaterThan(0);
    expect(surface.scrollWidth, `${route.id} 3D horizontal overflow at ${width}`).toBeLessThanOrEqual(surface.clientWidth + 1);
    expect(surface.pixelRatio, `${route.id} DPR at ${width}`).toBeCloseTo(2, 1);
  }
  await page.evaluate(() => window.loadPage('home'));
  await expect(page.locator('#content-area .sim2-root')).toHaveCount(0);
}

for (const route of contracts.all) {
  test(`responsive production matrix ${route.engine}:${route.id}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(indexUrl, { waitUntil: 'domcontentloaded' });
    for (const width of widths) await assertResponsive(page, route, width);
    expect(errors).toEqual([]);
  });
}
