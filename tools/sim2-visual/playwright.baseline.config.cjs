/**
 * Playwright config RIENG cho selective screenshot baselines (DEV-ONLY).
 * Khong nam trong release; chi khoa vai route dai dien da duyet bang mat.
 */
const path = require('path');

module.exports = {
  testDir: path.resolve(__dirname),
  testMatch: '**/selective-baseline.spec.js',
  timeout: 300000,
  workers: 1,
  fullyParallel: false,
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.015
    }
  },
  use: {
    headless: true,
    viewport: { width: 1000, height: 620 },
    deviceScaleFactor: 1
  }
};
