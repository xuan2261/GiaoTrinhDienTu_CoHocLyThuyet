// Run the entire 58-route animation sweep inside the browser in one go.
// At end, expose window.__sweepResults (array) and window.__sweepDone=true.
// Caller polls window.__sweepDone, then JSON.stringify(window.__sweepResults).

(async function () {
  if (window.__sweepRunning) return;
  window.__sweepRunning = true;
  window.__sweepDone = false;
  window.__sweepResults = [];
  window.__sweepProgress = '';

  const routes = [
    'ch1-1-3','ch1-1-4','ch1-1-5','ch1-1-6','ch1-1-8',
    'ch1-2-1','ch1-2-3','ch1-2-6',
    'ch1-3-1','ch1-3-2','ch1-3-3','ch1-3-4','ch1-3-6','ch1-3-7',
    'ch1-4-1','ch1-4-2','ch1-4-4',
    'ch1-5-1','ch1-5-2','ch1-5-3','ch1-5-4',
    'ch1-6-2','ch1-6-3',
    'ch1-7-1','ch1-7-2',
    'ch2-1-1','ch2-1-2','ch2-1-3','ch2-1-4',
    'ch2-2-2','ch2-3-2',
    'ch2-4-1','ch2-4-2','ch2-4-3','ch2-4-4',
    'ch2-5-1','ch2-5-2','ch2-5-3',
    'ch2-7-1','ch2-7-2',
    'ch3-1-2','ch3-1-3',
    'ch3-2-1','ch3-2-2','ch3-2-3','ch3-2-5',
    'ch3-3-1','ch3-3-2',
    'ch3-4-1','ch3-4-2',
    'ch3-5-1','ch3-5-2','ch3-5-3','ch3-5-4',
    'ch3-6-2','ch3-6-3',
    'ch3-7-1','ch3-7-2'
  ];

  const allErrors = [];
  if (!window.__sweepInstrumented) {
    const origErr = console.error;
    console.error = function (...args) {
      try { allErrors.push({ kind: 'console.error', msg: args.map(a => (a && a.message) || String(a)).join(' ') }); } catch (e) {}
      return origErr.apply(console, args);
    };
    window.addEventListener('error', e => allErrors.push({ kind: 'window.error', msg: e.message || '' }));
    window.addEventListener('unhandledrejection', e => allErrors.push({ kind: 'unhandledrejection', msg: ((e.reason && e.reason.message) || String(e.reason)) }));
    window.__sweepInstrumented = true;
    window.__sweepAllErrors = allErrors;
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const mountSel = '#content-area';

  function $canvas() {
    const m = document.querySelector(mountSel);
    return m ? m.querySelector('canvas') : null;
  }
  function $readout() {
    const m = document.querySelector(mountSel);
    return m ? m.querySelector('.sim-readout-grid') : null;
  }
  function $playBtn() {
    const m = document.querySelector(mountSel);
    if (!m) return null;
    for (const b of m.querySelectorAll('button')) {
      const t = (b.textContent || '').trim();
      if (t.includes('Chạy') || t.includes('Dừng')) return b;
    }
    return null;
  }

  function frameHash(canvas) {
    if (!canvas) return null;
    try {
      const ctx = canvas.getContext('2d');
      const grid = 16;
      const w = canvas.width, h = canvas.height;
      // Single getImageData call is much faster than 256 individual calls.
      const img = ctx.getImageData(0, 0, w, h).data;
      let sum = 0, nonZero = 0, count = 0;
      for (let y = 1; y < grid; y++) {
        for (let x = 1; x < grid; x++) {
          const px = Math.floor((x / grid) * w);
          const py = Math.floor((y / grid) * h);
          const i = (py * w + px) * 4;
          const r = img[i], g = img[i+1], b = img[i+2];
          const v = r + g * 257 + b * 65537;
          if (r + g + b > 30) nonZero++;
          sum = (sum + v * (px + 1) * (py + 1)) >>> 0;
          count++;
        }
      }
      return { hash: sum, nonZero, sampled: count };
    } catch (e) { return { error: String(e) }; }
  }

  function readoutText() {
    const g = $readout();
    if (!g) return null;
    return (g.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 500);
  }

  async function waitCanvas(timeoutMs) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      const c = $canvas();
      if (c && c.width > 0 && c.height > 0) return c;
      await sleep(60);
    }
    return null;
  }

  async function runOne(routeId) {
    const errStart = allErrors.length;
    const r = {
      routeId,
      mounted: false,
      canvasSize: null,
      hasReadout: false,
      hasPlay: false,
      autoplayed: false,
      frames: {},
      readouts: {},
      uniqueFrames: 0,
      animEvolved: false,
      errors: [],
      elapsedMs: 0
    };
    const t0 = Date.now();
    try { window.loadPage(routeId); }
    catch (e) { r.errors.push('loadPage threw: ' + String(e)); return r; }

    const c = await waitCanvas(8000);
    if (!c) { r.errors.push('canvas not appearing'); r.elapsedMs = Date.now() - t0; return r; }
    r.mounted = true;
    r.canvasSize = { w: c.width, h: c.height, cssW: c.clientWidth, cssH: c.clientHeight };
    r.hasReadout = !!$readout();
    const pb = $playBtn();
    r.hasPlay = !!pb;

    await sleep(150);
    r.frames.t0 = frameHash(c);
    r.readouts.t0 = readoutText();
    const lblBefore = pb ? (pb.textContent || '').trim() : '';
    r.autoplayed = lblBefore.includes('Dừng');

    if (pb && !r.autoplayed) { pb.click(); await sleep(50); }

    await sleep(1000);
    r.frames.t1 = frameHash(c);
    r.readouts.t1 = readoutText();

    await sleep(1000);
    r.frames.t2 = frameHash(c);
    r.readouts.t2 = readoutText();

    await sleep(1000);
    r.frames.t3 = frameHash(c);
    r.readouts.t3 = readoutText();

    const pb2 = $playBtn();
    if (pb2 && (pb2.textContent || '').includes('Dừng')) pb2.click();

    const hashes = ['t0','t1','t2','t3']
      .map(k => r.frames[k]).filter(f => f && typeof f.hash === 'number').map(f => f.hash);
    r.uniqueFrames = new Set(hashes).size;
    r.animEvolved = r.uniqueFrames >= 2;
    r.errors = allErrors.slice(errStart).slice(0, 10);
    r.elapsedMs = Date.now() - t0;
    return r;
  }

  for (let i = 0; i < routes.length; i++) {
    window.__sweepProgress = `${i+1}/${routes.length} ${routes[i]}`;
    const out = await runOne(routes[i]);
    window.__sweepResults.push(out);
  }
  window.__sweepDone = true;
  window.__sweepRunning = false;
})();
'sweep started';
