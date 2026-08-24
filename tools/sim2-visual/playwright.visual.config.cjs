/**
 * Playwright config RIÊNG cho pipeline capture visual (DEV-ONLY).
 * Tách khỏi playwright.config.cjs (release, testDir ./tests) → spec này KHÔNG vào release.
 * Chạy: npm run test:sim:visual:capture
 */
const path = require('path');

module.exports = {
  testDir: path.resolve(__dirname),
  testMatch: '**/capture-sims.spec.js',
  timeout: 600000,            // 25 route × nhiều shot + step → nới rộng
  workers: 1,                 // tuần tự: tránh đua ghi file + chụp xác định
  retries: 0,
  fullyParallel: false,
  expect: { timeout: 10000 },
  use: { headless: true, viewport: { width: 1000, height: 620 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'no-preference' },
};
