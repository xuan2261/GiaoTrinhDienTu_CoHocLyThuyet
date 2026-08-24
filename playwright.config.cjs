/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests',
  testMatch: '**/*.spec.js',
  timeout: 120000,
  retries: 0,
  workers: 1,
  fullyParallel: false,
  expect: {
    timeout: 10000,
  },
  use: {
    headless: true,
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'no-preference'
  },
};
