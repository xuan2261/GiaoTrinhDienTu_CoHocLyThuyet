const path = require('path');
const base = require('../../playwright.config.cjs');
module.exports = {
  ...base,
  testDir: path.resolve(__dirname, '../../tests'),
  projects: [
    { name: 'chromium', use: { ...base.use, browserName: 'chromium' } },
    { name: 'firefox', use: { ...base.use, browserName: 'firefox' } },
    { name: 'webkit', use: { ...base.use, browserName: 'webkit' } },
  ],
};
