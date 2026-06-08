/**
 * Playwright config RIÊNG cho interaction-probe (DEV-ONLY triage).
 * Tách khỏi playwright.config.cjs (release) → spec này KHÔNG vào test:sim:release.
 * Mirror tools/sim2-visual/playwright.visual.config.cjs.
 * Chạy: npm run test:sim:probe
 */
const path = require('path');

module.exports = {
  testDir: path.resolve(__dirname),
  testMatch: '**/probe-runner.spec.js',
  timeout: 600000,            // 35 route × nhiều control + step → nới rộng
  workers: 1,                 // tuần tự: tránh đua ghi 1 file JSON chung + đo xác định
  fullyParallel: false,
  expect: { timeout: 10000 },
  use: { headless: true },
};
