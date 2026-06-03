const path = require('path');

module.exports = {
  testDir: path.resolve(__dirname),
  testMatch: '**/pilot-capture.spec.js',
  timeout: 120000,
  workers: 1,
  fullyParallel: false,
  expect: { timeout: 10000 },
  use: { headless: true },
};
