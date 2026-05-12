/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests',
  testMatch: '**/*.spec.js',
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  use: {
    headless: true,
  },
};
