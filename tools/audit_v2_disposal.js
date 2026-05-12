const { chromium } = require('@playwright/test');
const { ALL_ROUTES, startStaticServer } = require('../tests/simulation-test-utils');
const LEAK_THRESHOLD_MB = 5;

function assertStableHeap(baseline, final, thresholdMb = LEAK_THRESHOLD_MB) {
  const start = Number(baseline);
  const end = Number(final);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end <= 0) {
    throw new Error(`Heap metric unavailable or invalid: baseline=${baseline}, final=${final}`);
  }

  const delta = (end - start) / 1024 / 1024;
  if (delta > thresholdMb && end > start) {
    throw new Error(`Potential memory leak detected: ${delta.toFixed(2)} MB delta exceeds ${thresholdMb} MB`);
  }
  return delta;
}

/**
 * Phase 05: Memory Disposal Audit
 * Automates random navigation cycles and verifies heap size stability.
 */
async function auditDisposal() {
  console.log('Starting Memory Disposal Audit...');
  const { server, port } = await startStaticServer();
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  const CYCLES = 20;
  const samples = ALL_ROUTES.slice(0, CYCLES); // Test a subset for speed

  try {
    await cdp.send('Performance.enable');
    await page.goto(`http://127.0.0.1:${port}/index.html`);
  
  async function getHeapSize() {
    const perf = await cdp.send('Performance.getMetrics');
    const heap = (perf.metrics || []).find(metric => metric.name === 'JSHeapUsedSize');
    if (heap && Number.isFinite(Number(heap.value)) && Number(heap.value) > 0) return Number(heap.value);
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
  
  const delta = assertStableHeap(baseline, final);
  console.log(`Delta: ${delta.toFixed(2)} MB`);
  console.log('Memory disposal looks stable.');

  } finally {
    await cdp.detach().catch(() => {});
    await browser.close();
    server.close();
  }
}

if (require.main === module) auditDisposal().catch(err => {
  console.error(err);
  process.exit(1);
});

module.exports = { assertStableHeap };
