const path = require('path');

module.exports = {
  testDir: path.resolve(__dirname),
  testMatch: '**/pilot-capture.spec.js',
  timeout: 120000,
  workers: 1,
  retries: 0,
  fullyParallel: false,
  expect: { timeout: 10000 },
  use: { headless: true, viewport: { width: 1000, height: 620 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'no-preference' },
};
