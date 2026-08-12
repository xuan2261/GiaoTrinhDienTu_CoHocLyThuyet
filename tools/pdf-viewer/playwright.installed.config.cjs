const path = require('path');
const base = require('../../playwright.config.cjs');
module.exports = {
  ...base,
  testDir: path.resolve(__dirname, '../../tests'),
  projects: [
    { name: 'chrome', use: { ...base.use, channel: 'chrome' } },
    { name: 'msedge', use: { ...base.use, channel: 'msedge' } },
  ],
};
