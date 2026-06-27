const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const DELETED_IMAGES = [
  'images/ch1/hinh-037.png',
  'images/ch1/hinh-039.png',
  'images/ch3/hinh-136.png',
  'images/ch3/hinh-240.png',
  'images/ch3/hinh-241.png',
  'images/ch3/hinh-266.png',
  'images/ch3/hinh-283.png',
  'images/ch3/hinh-289.png',
];

test('bundled pages do not reference deleted formula rasters or placeholder numbers', async () => {
  const pages = fs.readFileSync(path.join(ROOT, 'js/pages.js'), 'utf8');
  for (const image of DELETED_IMAGES) {
    expect(pages).not.toContain(image);
  }
  expect(pages).not.toMatch(/(?:^|>)\s*\(\.\)\s*(?:<|$)/m);
});
