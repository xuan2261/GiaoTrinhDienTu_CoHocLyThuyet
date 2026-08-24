const { test, expect } = require('@playwright/test');
const path = require('path');
const contracts = require('./support/simulation-route-contracts.js');

const indexUrl = `file:///${path.join(__dirname, '..', 'index.html').replace(/\\/g, '/')}`;
contracts.validateContracts(contracts);

async function loadRoute(page, routeId) {
  await page.evaluate(id => window.loadPage(id), routeId);
  await expect(page.locator('#content-area .sim2-root')).toHaveCount(1);
}
async function exerciseSim2(page, routeId) {
  const slider = page.locator('#content-area input[type=range]').first();
  if (await slider.count()) {
    const before = await slider.inputValue();
    await slider.evaluate(element => {
      const min = Number(element.min), max = Number(element.max), value = Number(element.value);
      element.value = String(value === max ? min : max);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(await slider.inputValue(), `${routeId} slider action`).not.toBe(before);
    return;
  }
  const step = page.locator('#content-area .sim2-step').first();
  if (await step.count()) { await step.click(); return; }
  const handle = page.locator('#content-area .sim2-handle').first();
  const box = await handle.boundingBox();
  expect(box, `${routeId} must expose an executable action`).not.toBeNull();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 24, box.y + box.height / 2 - 12, { steps: 3 });
  await page.mouse.up();
}

for (const route of contracts.all) {
  test(`production loader mounts, acts, and disposes ${route.engine}:${route.id}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(indexUrl, { waitUntil: 'domcontentloaded' });
    await loadRoute(page, route.id);
    if (route.engine === 'sim3') {
      await exerciseSim2(page, route.id);
      await page.locator('#content-area [data-mode="3d"]').click();
      const state = await page.locator('#content-area').evaluate(area => Boolean(area.querySelector('canvas.sim3-canvas')) || Boolean(area.querySelector('.sim3-fallback:not([hidden])')));
      expect(state, `${route.id} must render 3D or explicit 2D fallback`).toBe(true);
      await page.locator('#content-area [data-mode="2d"]').click();
      await exerciseSim2(page, route.id);
    } else {
      await exerciseSim2(page, route.id);
    }
    await page.evaluate(() => window.loadPage('home'));
    await expect(page.locator('#content-area .sim2-root')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
