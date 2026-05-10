/**
 * Debug: test newly added routes.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.js': 'text/javascript', '.html': 'text/html; charset=utf-8', '.css': 'text/css' };

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, 'http://127.0.0.1');
  let cleanPath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '') || 'index.html';
  let filePath = path.normalize(path.join(ROOT, cleanPath));
  const relative = path.relative(ROOT, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    res.writeHead(403); res.end('Forbidden: ' + cleanPath);
    return;
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404); res.end('Not found: ' + cleanPath);
    return;
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(filePath)] || 'application/octet-stream' });
  res.end(fs.readFileSync(filePath));
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  console.log('HTTP server on port', port);

  const routes = ['ch1-1-4', 'ch1-1-5', 'ch2-4-4'];
  const routesJson = JSON.stringify(routes);

  const testCode = `
    const { chromium } = require('@playwright/test');
    (async () => {
      const browser = await chromium.launch({ headless: true });
      const routes = ${routesJson};
      const results = [];
      for (const r of routes) {
        const page = await browser.newPage();
        const errors = [];
        page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
        page.on('pageerror', e => errors.push(e.message));
        try {
          await page.goto('http://127.0.0.1:${port}/index.html#' + r, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(3000);
          const info = await page.evaluate(function(r) {
            return {
              hasSimContainer: !!document.querySelector('.sim-container'),
              hasCanvas: !!document.querySelector('.sim-container canvas'),
              simMapHasRoute: typeof (window.SIM_MAP || {})[r] === 'function',
            };
          }, r);
          results.push({ route: r, ...info, errors: errors.slice(0, 3) });
        } catch (e) {
          results.push({ route: r, error: e.message, errors: errors.slice(0, 3) });
        }
        await page.close();
      }
      console.log('RESULTS:' + JSON.stringify(results, null, 2));
      await browser.close();
    })().catch(e => { console.error(e); process.exit(1); });
  `;

  const child = spawn('node', ['-e', testCode], { cwd: ROOT, stdio: 'inherit' });
  child.on('close', code => { server.close(); process.exit(code || 0); });
});
