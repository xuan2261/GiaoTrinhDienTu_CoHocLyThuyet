const { test, expect } = require('@playwright/test');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FIXTURE = path.join(ROOT, 'tests', 'fixtures', 'pdf-transport-proof.html');
const FILE_URL = `file:///${FIXTURE.replace(/\\/g, '/')}`;
let server;
let httpUrl;

function startServer() {
  return new Promise(resolve => {
    server = http.createServer((req, res) => {
      const relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1);
      const filePath = path.resolve(ROOT, relative);
      if (!filePath.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filePath)) {
        res.writeHead(404).end('Not found');
        return;
      }
      res.setHeader('Content-Type', path.extname(filePath) === '.html' ? 'text/html' : 'text/javascript');
      fs.createReadStream(filePath).pipe(res);
    }).listen(0, '127.0.0.1', () => {
      httpUrl = `http://127.0.0.1:${server.address().port}/tests/fixtures/pdf-transport-proof.html`;
      resolve();
    });
  });
}

test.beforeAll(startServer);
test.afterAll(async () => new Promise(resolve => server.close(resolve)));

for (const mode of [
  { name: 'file', url: () => FILE_URL },
  { name: 'http', url: () => httpUrl },
]) {
  test(`${mode.name}: IIFE + Uint8Array render trang 1 và text layer`, async ({ page }) => {
    const errors = [];
    const forbiddenRequests = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('request', request => {
      const url = request.url();
      if (/\.mjs(?:$|\?)/.test(url) || /pdf\.worker/.test(url) || /https:\/\//.test(url)) {
        forbiddenRequests.push(url);
      }
    });

    await page.goto(mode.url(), { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('status')).toContainText('Trang 1 trên', { timeout: 30000 });
    expect(await page.locator('#canvas').evaluate(canvas => canvas.width * canvas.height)).toBeGreaterThan(0);
    await expect(page.locator('.textLayer span').first()).toBeAttached();
    expect(forbiddenRequests).toEqual([]);
    expect(errors).toEqual([]);
  });
}
