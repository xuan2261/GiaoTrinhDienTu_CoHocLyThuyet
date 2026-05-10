const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = 'http://127.0.0.1:8000/';
  const routes = ['ch1-1-5', 'ch2-5-2', 'ch3-6-2'];

  for (const route of routes) {
    console.log(`Capturing ${route}...`);
    await page.goto(`${url}#${route}`);
    await page.waitForSelector('.sim-container.sim-lab canvas', { timeout: 10000 });
    await page.waitForTimeout(500); // Wait for potential animations to settle or start
    await page.screenshot({ path: `sim-capture-${route}.png` });
  }

  await browser.close();
  console.log('Done.');
})();
