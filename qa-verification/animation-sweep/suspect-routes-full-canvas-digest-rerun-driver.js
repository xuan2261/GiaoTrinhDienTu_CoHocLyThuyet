// Re-runs only the routes that flagged as "not evolved" with a full-image
// pixel checksum (sum of all RGB bytes) instead of a 16x16 sparse grid.
// Catches small moving objects that slipped through the sparse sample.

(async function () {
  if (window.__deepRunning) return;
  window.__deepRunning = true;
  window.__deepDone = false;
  window.__deepResults = [];
  window.__deepProgress = '';

  const routes = [
    'ch2-5-1','ch2-7-2',
    'ch3-1-2','ch3-1-3','ch3-2-1','ch3-2-3','ch3-2-5',
    'ch3-4-1','ch3-5-1','ch3-5-2','ch3-6-3','ch3-7-1','ch3-7-2'
  ];

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const $canvas = () => document.querySelector('#content-area canvas');
  const $play = () => {
    const m = document.querySelector('#content-area');
    if (!m) return null;
    for (const b of m.querySelectorAll('button')) {
      const t = (b.textContent || '').trim();
      if (t.includes('Chạy') || t.includes('Dừng')) return b;
    }
    return null;
  };

  // Full-image digest: sum of every RGB byte, plus a sample of distinct
  // (r,g,b) values seen, plus per-quadrant subsums to localize change.
  function fullDigest(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const img = ctx.getImageData(0, 0, w, h).data;
    let sum = 0, nonBg = 0;
    let q0 = 0, q1 = 0, q2 = 0, q3 = 0; // top-left, top-right, bot-left, bot-right
    const halfW = w >> 1, halfH = h >> 1;
    // step 4 = sample every 4th pixel for speed (still ~83k samples for 760x440)
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        const i = (y * w + x) * 4;
        const r = img[i], g = img[i+1], b = img[i+2];
        const v = r + g + b;
        sum = (sum + v + (x ^ y) * (r + 1)) >>> 0;
        if (v > 30) nonBg++;
        if (y < halfH) {
          if (x < halfW) q0 = (q0 + v) >>> 0; else q1 = (q1 + v) >>> 0;
        } else {
          if (x < halfW) q2 = (q2 + v) >>> 0; else q3 = (q3 + v) >>> 0;
        }
      }
    }
    return { sum, nonBg, q: [q0, q1, q2, q3] };
  }

  async function waitCanvas(ms) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const c = $canvas();
      if (c && c.width > 0) return c;
      await sleep(60);
    }
    return null;
  }

  for (let i = 0; i < routes.length; i++) {
    const id = routes[i];
    window.__deepProgress = `${i+1}/${routes.length} ${id}`;
    const r = { routeId: id, frames: {}, deltas: {} };
    window.loadPage(id);
    const c = await waitCanvas(8000);
    if (!c) { r.error = 'no canvas'; window.__deepResults.push(r); continue; }
    await sleep(150);
    r.frames.t0 = fullDigest(c);
    const pb = $play();
    if (pb && !(pb.textContent || '').includes('Dừng')) { pb.click(); await sleep(50); }
    await sleep(1000); r.frames.t1 = fullDigest(c);
    await sleep(1000); r.frames.t2 = fullDigest(c);
    await sleep(1000); r.frames.t3 = fullDigest(c);
    const pb2 = $play();
    if (pb2 && (pb2.textContent || '').includes('Dừng')) pb2.click();
    // deltas
    r.deltas.t1 = r.frames.t1.sum - r.frames.t0.sum;
    r.deltas.t2 = r.frames.t2.sum - r.frames.t0.sum;
    r.deltas.t3 = r.frames.t3.sum - r.frames.t0.sum;
    const sums = [r.frames.t0.sum, r.frames.t1.sum, r.frames.t2.sum, r.frames.t3.sum];
    r.uniqueSums = new Set(sums).size;
    r.canvasChanged = r.uniqueSums >= 2;
    // also: did any quadrant change?
    const q0 = r.frames.t0.q, q3 = r.frames.t3.q;
    r.quadDeltas = q0.map((v, idx) => q3[idx] - v);
    r.anyQuadChanged = r.quadDeltas.some(d => d !== 0);
    window.__deepResults.push(r);
  }
  window.__deepDone = true;
  window.__deepRunning = false;
})();
'deep sweep started';
