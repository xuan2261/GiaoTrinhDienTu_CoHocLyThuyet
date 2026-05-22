const fs = require('fs');
const http = require('http');
const path = require('path');
const { pathToFileURL } = require('url');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
const INDEX_FILE = path.join(ROOT, 'index.html');
const EXPECTED_ROUTE_COUNT = 52;
const EXPECTED_MOUNTABLE_ROUTE_COUNT = EXPECTED_ROUTE_COUNT;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

function discoverV2Routes() {
  const manifestPath = path.join(ROOT, 'js', 'sim-route-manifest.js');
  if (fs.existsSync(manifestPath)) {
    const text = fs.readFileSync(manifestPath, 'utf8');
    const routes = [];
    const pattern = /['"](ch\d+-\d+-\d+)['"]\s*:\s*\{/g;
    let match;
    while ((match = pattern.exec(text)) !== null) routes.push(match[1]);
    if (routes.length) return [...new Set(routes)].sort();
  }

  const routes = new Set();
  const simsRoot = path.join(ROOT, 'js', 'sims');
  if (fs.existsSync(simsRoot)) {
    for (const chapter of fs.readdirSync(simsRoot)) {
      const chapterDir = path.join(simsRoot, chapter);
      if (!fs.statSync(chapterDir).isDirectory()) continue;
      for (const file of fs.readdirSync(chapterDir)) {
        if (!file.endsWith('-routes.js')) continue;
        const text = fs.readFileSync(path.join(chapterDir, file), 'utf8');
        const pattern = /['"](ch\d+-\d+-\d+)['"]/g;
        let match;
        while ((match = pattern.exec(text)) !== null) routes.add(match[1]);
      }
    }
  }
  return [...routes].sort();
}

const ALL_ROUTES = discoverV2Routes();
const MOUNTABLE_ROUTES = ALL_ROUTES.slice();
const ROUTE_GROUPS = {
  ch1: ALL_ROUTES.filter(route => route.startsWith('ch1-')),
  ch2: ALL_ROUTES.filter(route => route.startsWith('ch2-')),
  ch3: ALL_ROUTES.filter(route => route.startsWith('ch3-')),
};
const MOUNTABLE_ROUTE_GROUPS = {
  ch1: MOUNTABLE_ROUTES.filter(route => route.startsWith('ch1-')),
  ch2: MOUNTABLE_ROUTES.filter(route => route.startsWith('ch2-')),
  ch3: MOUNTABLE_ROUTES.filter(route => route.startsWith('ch3-')),
};

async function blockNonLocalHttp(page) {
  if (page.__simHttpBlocked) return;
  page.__simHttpBlocked = true;
  page.__simExternalRequests = [];
  await page.route(/^https?:\/\//, route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue();
    page.__simExternalRequests.push(route.request().url());
    return route.abort();
  });
}

function relevantConsoleErrors(messages) {
  return messages.filter(text =>
    !/Failed to load resource/i.test(text) &&
    !/cdn\.jsdelivr|katex|ERR_ABORTED|LaTeX-incompatible|No character metrics/i.test(text)
  );
}

async function openRoute(page, route, options = {}) {
  if (options.blockExternal !== false) await blockNonLocalHttp(page);
  page.__simExternalRequests = [];
  const consoleMessages = [];
  const onConsole = message => {
    if (['error', 'warning'].includes(message.type())) consoleMessages.push(message.text());
  };
  const onPageError = error => consoleMessages.push(error.message);
  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  try {
    const url = options.url || `${pathToFileURL(INDEX_FILE).href}#${route}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(expected => window.location.hash.replace('#', '') === expected, route);
    
    // Wait for either legacy or V2 simulation container
    const selector = '.sim-container.sim-lab canvas, .sim-viewport-v2 svg.sim-svg-v2, .sim-viewport-v2 h2';
    await page.waitForSelector(selector, { timeout: options.timeout || 10000 });
    await page.waitForTimeout(options.settleMs || 90);
    
    const labCount = await page.locator('.sim-container.sim-lab, .sim-viewport-v2').count();
    assert(labCount === 1, `${route}: expected one simulation lab, got ${labCount}`);
    
    // For V2, we skip canvasStats check for now as it's SVG-based
    const isV2 = await page.locator('.sim-viewport-v2').count() > 0;
    if (!isV2) {
      const stats = await canvasStats(page);
      assert(stats.width > 100 && stats.height > 100, `${route}: canvas size too small`);
      assert(stats.variants > 2, `${route}: canvas appears blank`);
    }
    
    assert((page.__simExternalRequests || []).length === 0, `${route}: external requests: ${page.__simExternalRequests.join(', ')}`);
    const errors = relevantConsoleErrors(consoleMessages);
    assert(errors.length === 0, `${route}: console errors: ${errors.join(' | ')}`);
  } finally {
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
  }
}

async function canvasStats(page) {
  return page.locator('.sim-container.sim-lab canvas').first().evaluate(canvas => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const edge = { left: 0, right: 0, top: 0, bottom: 0 };
    const band = 6;
    let variants = 0;
    let ink = 0;
    let first = null;
    let hash = 2166136261;
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const i = (y * width + x) * 4;
        const sample = `${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`;
        if (first === null) first = sample;
        else if (sample !== first) variants += 1;
        const nonBlank = data[i + 3] > 20 && (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245);
        if (!nonBlank) continue;
        ink += 1;
        if (x < band) edge.left += 1;
        if (x >= width - band) edge.right += 1;
        if (y < band) edge.top += 1;
        if (y >= height - band) edge.bottom += 1;
        hash ^= data[i] + data[i + 1] * 3 + data[i + 2] * 7 + data[i + 3] * 11;
        hash = Math.imul(hash, 16777619);
      }
    }
    return { width, height, edge, ink, variants, hash: String(hash >>> 0) };
  });
}

async function labState(page) {
  const hasV2 = await page.locator('.sim-viewport-v2').count() > 0;
  if (hasV2) {
    return page.locator('.sim-viewport-v2').first().evaluate(vp => {
      const readout = vp.parentNode.querySelector('.sim-readout-v2');
      return {
        routeId: vp.getAttribute('data-route-id') || '', // Might need to be set in init
        title: vp.parentNode.querySelector('.sim-title')?.textContent.trim() || '',
        readoutText: readout?.textContent.trim() || '',
        readoutCards: [...(readout?.querySelectorAll('.sim-readout-card') || [])].map(card => ({
          label: card.querySelector('.sim-readout-label')?.textContent.trim() || '',
          value: card.querySelector('.sim-readout-value')?.textContent.trim() || '',
          key: card.dataset?.readoutKey || '',
          kind: card.dataset?.readoutKind || 'default',
        })),
        v2: true
      };
    });
  }

  return page.locator('.sim-container.sim-lab').first().evaluate(lab => ({
    routeId: lab.getAttribute('data-route-id') || '',
    rendererId: lab.getAttribute('data-renderer-id') || '',
    behaviorId: lab.getAttribute('data-behavior-id') || '',
    title: lab.querySelector('.sim-title')?.textContent.trim() || '',
    formula: lab.querySelector('.sim-formula-panel')?.textContent.trim() || '',
    hint: lab.querySelector('.sim-lab-hint')?.textContent.trim() || '',
    visibleText: lab.textContent || '',
    handleIds: String(lab.getAttribute('data-handle-ids') || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean),
    structuralMarks: String(lab.getAttribute('data-structural-marks') || '')
      .split('|')
      .map(item => item.trim())
      .filter(Boolean),
    readoutCards: [...lab.querySelectorAll('.sim-readout-card')].map(card => ({
      label: card.querySelector('.sim-readout-label')?.textContent.trim() || '',
      value: card.querySelector('.sim-readout-value')?.textContent.trim() || '',
      key: card.dataset?.readoutKey || '',
      kind: card.dataset?.readoutKind || 'default',
    })),
    v2: false
  }));
}

async function readoutSnapshot(page) {
  const state = await labState(page);
  return state.readoutCards.map(card => `${card.label}:${card.value}`).join('|');
}

async function firstHandlePoint(page) {
  return page.locator('.sim-container.sim-lab canvas').first().evaluate(canvas => {
    const handles = canvas.__simInteractionLayer?.handles ? canvas.__simInteractionLayer.handles() : [];
    return handles[0]?.point || null;
  });
}

function dragTarget(point, offset) {
  const dx = offset?.x ?? (point.x > 450 ? -72 : 72);
  const dy = offset?.y ?? (point.y < 90 ? 44 : -40);
  return { x: point.x + dx, y: point.y + dy };
}

async function dragCanvasPoint(page, from, to) {
  const canvas = page.locator('.sim-container.sim-lab canvas').first();
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  assert(box, 'canvas bounding box missing');
  const scale = await canvas.evaluate(node => ({
    x: node.getBoundingClientRect().width / node.width,
    y: node.getBoundingClientRect().height / node.height,
  }));
  await page.mouse.move(box.x + from.x * scale.x, box.y + from.y * scale.y);
  await page.mouse.down();
  await page.mouse.move(box.x + to.x * scale.x, box.y + to.y * scale.y, { steps: 8 });
  await page.mouse.up();
}

async function setTheme(page, theme) {
  await page.evaluate(next => document.documentElement.setAttribute('data-theme', next), theme);
  await page.waitForTimeout(60);
}

async function layoutOverflow(page) {
  return page.locator('.sim-container.sim-lab').first().evaluate(lab => {
    const controls = lab.querySelector('.sim-controls');
    const readout = lab.querySelector('.sim-readout-grid');
    return Math.max(
      lab.scrollWidth - lab.clientWidth,
      controls ? controls.scrollWidth - controls.clientWidth : 0,
      readout ? readout.scrollWidth - readout.clientWidth : 0,
      lab.getBoundingClientRect().right - document.documentElement.clientWidth,
    );
  });
}

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const cleanPath = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname).replace(/^\/+/, '') || 'index.html';
      const filePath = path.normalize(path.join(ROOT, cleanPath));
      const relative = path.relative(ROOT, filePath);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
      }
      fs.readFile(filePath, (error, data) => {
        if (error) {
          response.writeHead(404);
          response.end('Not found');
          return;
        }
        response.writeHead(200, { 'content-type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        response.end(data);
      });
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

module.exports = {
  ROOT, INDEX_FILE, EXPECTED_ROUTE_COUNT, EXPECTED_MOUNTABLE_ROUTE_COUNT,
  ALL_ROUTES, MOUNTABLE_ROUTES, ROUTE_GROUPS, MOUNTABLE_ROUTE_GROUPS,
  openRoute, canvasStats, labState, readoutSnapshot, firstHandlePoint,
  dragTarget, dragCanvasPoint, setTheme, layoutOverflow, startStaticServer, relevantConsoleErrors,
};
