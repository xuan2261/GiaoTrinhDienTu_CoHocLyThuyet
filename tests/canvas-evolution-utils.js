/**
 * Phase 09 — canvas-evolution sweep utilities.
 *
 *   sampleGridHash(page)         — runs in-page getImageData step=8 and returns a
 *                                  32-bit FNV grid hash; falls back to a full-image
 *                                  digest. Step=8 (not 16) avoids aliasing on slow
 *                                  pulse animations (F14).
 *   clickPlay(page)              — clicks the visible Play button. Primary selector
 *                                  is the textContent match (works pre-Phase-03);
 *                                  positive-control hook is the data-sim-play
 *                                  attribute (added in Phase 03 GREEN). Static
 *                                  routes have no Play affordance at all — caller
 *                                  must short-circuit using the bucket.
 *   waitForCanvasMounted(page)   — waits until #content-area canvas is sized.
 *   waitForEngineTime(page, t)   — polls route state _t, falling back to the
 *                                  animation engine clock for renderers that do
 *                                  not persist _t (engine-time sampling, F15).
 */
'use strict';

const FILE_INDEX_URL = (rootDir) => {
  const path = require('path');
  const idx = path.join(rootDir, 'index.html').replace(/\\/g, '/');
  return idx.startsWith('/') ? `file://${idx}` : `file:///${idx}`;
};

async function navigateToRoute(page, rootDir, routeId) {
  const url = `${FILE_INDEX_URL(rootDir)}#${routeId}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    expected => window.location.hash.replace('#', '') === expected,
    routeId,
    { timeout: 8000 }
  );
}

async function waitForCanvasMounted(page, timeoutMs = 8000) {
  return page.evaluate(async (timeout) => {
    const t0 = Date.now();
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    while (Date.now() - t0 < timeout) {
      const mount = document.querySelector('#content-area');
      const canvas = mount ? mount.querySelector('canvas') : null;
      if (canvas && canvas.width > 0 && canvas.height > 0) {
        return { ok: true, w: canvas.width, h: canvas.height };
      }
      await sleep(60);
    }
    return { ok: false };
  }, timeoutMs);
}

async function sampleGridHash(page) {
  return page.evaluate(() => {
    const mount = document.querySelector('#content-area');
    const canvas = mount ? mount.querySelector('canvas') : null;
    if (!canvas) return { error: 'no-canvas' };
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return { error: 'zero-canvas' };
    let img;
    try {
      img = ctx.getImageData(0, 0, w, h).data;
    } catch (e) {
      return { error: 'getImageData:' + (e && e.message) };
    }
    // FNV-1a 32-bit; mix every 8th pixel to keep the hash both fine-grained
    // (catches small diffs) and stable (no per-frame jitter from text aa).
    let hGrid = 0x811c9dc5 >>> 0;
    let nonZero = 0, sampled = 0;
    for (let y = 0; y < h; y += 8) {
      for (let x = 0; x < w; x += 8) {
        const idx = (y * w + x) * 4;
        const r = img[idx], g = img[idx + 1], b = img[idx + 2];
        if (r + g + b > 30) nonZero++;
        hGrid = (hGrid ^ r) >>> 0; hGrid = Math.imul(hGrid, 0x01000193) >>> 0;
        hGrid = (hGrid ^ g) >>> 0; hGrid = Math.imul(hGrid, 0x01000193) >>> 0;
        hGrid = (hGrid ^ b) >>> 0; hGrid = Math.imul(hGrid, 0x01000193) >>> 0;
        sampled++;
      }
    }
    // Full-image FNV digest fallback — guards against pathological grid aliasing.
    let hFull = 0x811c9dc5 >>> 0;
    for (let i = 0; i < img.length; i += 4) {
      hFull = (hFull ^ img[i]) >>> 0; hFull = Math.imul(hFull, 0x01000193) >>> 0;
      hFull = (hFull ^ img[i + 1]) >>> 0; hFull = Math.imul(hFull, 0x01000193) >>> 0;
      hFull = (hFull ^ img[i + 2]) >>> 0; hFull = Math.imul(hFull, 0x01000193) >>> 0;
    }
    return {
      hash: hGrid >>> 0,
      hashFull: hFull >>> 0,
      nonZero,
      sampled,
      w,
      h,
    };
  });
}

async function clickPlay(page) {
  return page.evaluate(() => {
    const mount = document.querySelector('#content-area');
    if (!mount) return { clicked: false, reason: 'no-mount' };
    let btn = mount.querySelector('[data-sim-play]');
    if (!btn) {
      for (const candidate of mount.querySelectorAll('button')) {
        const txt = (candidate.textContent || '').trim();
        if (txt.includes('Chạy') || txt.includes('Dừng')) { btn = candidate; break; }
      }
    }
    if (!btn) return { clicked: false, reason: 'no-play-button' };
    const wasDừng = (btn.textContent || '').includes('Dừng');
    if (!wasDừng) btn.click();
    return { clicked: !wasDừng, alreadyRunning: wasDừng };
  });
}

async function readEngineTime(page) {
  return page.evaluate(() => {
    const lab = document.querySelector('.sim-container.sim-lab');
    const value = Number(lab && lab.dataset ? lab.dataset.engineTime : NaN);
    return Number.isFinite(value) ? value : null;
  });
}

async function waitForEngineTime(page, target, options = {}) {
  const timeoutMs = options.timeoutMs || 6000;
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const t = await readEngineTime(page);
    if (Number.isFinite(t) && t >= target) return t;
    await page.waitForTimeout(40);
  }
  return null;
}

async function pause(page, ms) {
  await page.waitForTimeout(ms);
}

module.exports = {
  navigateToRoute,
  waitForCanvasMounted,
  sampleGridHash,
  clickPlay,
  waitForEngineTime,
  readEngineTime,
  pause,
  FILE_INDEX_URL,
};
