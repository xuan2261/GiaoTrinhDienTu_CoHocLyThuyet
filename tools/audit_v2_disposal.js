const { chromium } = require('@playwright/test');
const { ALL_ROUTES } = require('../tests/simulation-test-utils');

/**
 * Phase 05: Memory Disposal Audit
 * Automates random navigation cycles and verifies heap size stability.
 */
async function auditDisposal() {
  console.log('Starting Memory Disposal Audit...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const CYCLES = 20;
  const samples = ALL_ROUTES.slice(0, CYCLES); // Test a subset for speed

  await page.goto('http://127.0.0.1:8080/index.html');
  
  async function getHeapSize() {
    return await page.evaluate(() => window.performance.memory ? window.performance.memory.usedJSHeapSize : 0);
  }

  const baseline = await getHeapSize();
  console.log(`Baseline Heap: ${(baseline / 1024 / 1024).toFixed(2)} MB`);

  for (let i = 0; i < samples.length; i++) {
    const routeId = samples[i];
    process.stdout.write(`Cycle ${i+1}/${CYCLES}: Loading ${routeId}... `);
    
    await page.evaluate((id) => window.loadPage(id), routeId);
    await page.waitForTimeout(500); // Wait for simulation to settle
    
    const current = await getHeapSize();
    process.stdout.write(`Heap: ${(current / 1024 / 1024).toFixed(2)} MB\n`);
  }

  // Return to home to trigger final disposal
  await page.evaluate(() => window.loadPage('home'));
  await page.waitForTimeout(2000); // Wait for GC
  
  const final = await getHeapSize();
  console.log(`Final Heap: ${(final / 1024 / 1024).toFixed(2)} MB`);
  
  const delta = (final - baseline) / 1024 / 1024;
  console.log(`Delta: ${delta.toFixed(2)} MB`);

  if (delta > 5 && final > baseline) {
    console.warn('Potential memory leak detected (> 5MB delta)');
  } else {
    console.log('Memory disposal looks stable.');
  }

  await browser.close();
}

auditDisposal().catch(err => {
  console.error(err);
  process.exit(1);
});
