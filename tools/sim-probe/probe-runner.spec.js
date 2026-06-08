/**
 * probe-runner.spec.js — DEV-ONLY interaction probe (triage harness).
 * Mount mỗi route qua SIM_MAP trên fixture sim2-ch{N}.html, drive control, đo:
 *   - Probe A (liveness): |Δ readout/scene| > epsilon → control SỐNG.
 *   - Probe B (monotonic sign): dấu d(readout)/d(control) khớp expectSign physics.
 * KHÔNG sửa bất kỳ file sim/fixture/release nào.
 *
 * KHÔNG nằm trong test:sim:release (config riêng playwright.sim-probe.config.cjs).
 * Chạy: npm run test:sim:probe → ghi interaction-probe.json (probeA + probeB / 35 route).
 *
 * Phân tách trách nhiệm:
 *   - Browser trả CHUỖI readout / số debug thô (không tính toán).
 *   - Node tính delta/sign qua probe-delta.js (pure, DRY giữa A và B).
 *   - probe-targets.js giải quyết "selector ambiguity" của route-map cho Probe B.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '../..');
const ROUTE_MAP = require(path.join(
  ROOT, 'plans/260608-1559-sim-fullquality-triage/research/sim-probe-route-map.json'
));
const {
  computeDelta, signOf, parseReadout, midValue, isLive, compareSign, DEFAULT_EPSILON
} = require('./probe-delta.js');
const { targetsFor } = require('./probe-targets.js');

const OUT_DIR = path.join(ROOT, 'plans/260608-1559-sim-fullquality-triage/visuals');
const OUT_JSON = path.join(OUT_DIR, 'interaction-probe.json');

const LIVE_EPSILON = 1e-4;   // ngưỡng liveness: > nhiễu in-số nhưng < thay đổi vật lý thật
const PLAYBACK_STEPS = 120;  // đủ để sim va-chạm (ch3-6-2) tiến tới sự kiện impact

const fixtureFor = ch =>
  `file:///${path.join(ROOT, `tests/fixtures/sim2-ch${ch}.html`).replace(/\\/g, '/')}`;
const baseIdOf = key => key.split('#')[0];
// "__SIM3_DEBUG__['ch2-4-4'].aCor.mag" → "aCor.mag"
const fieldOf = debugPath => String(debugPath).replace(/^.*\]\./, '');

fs.mkdirSync(OUT_DIR, { recursive: true });
const probeResults = {};

// ── low-level page helpers ──────────────────────────────────────────────────
async function waitRaf(page, k) {
  await page.evaluate((n) => new Promise((resolve) => {
    let i = 0;
    (function tick() { if (++i >= n) return resolve(); requestAnimationFrame(tick); })();
  }), k);
}

/** Mảng readout row values đã parse (NaN nếu không phải số), theo thứ tự DOM. */
async function readNumericRows(page) {
  const raw = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#host .sim2-readout-row'))
      .map(r => { const v = r.querySelector('.sim2-readout-value'); return v ? v.textContent.trim() : ''; })
  );
  return raw.map(parseReadout);
}

/** Giá trị readout đã parse tại 1 hàng cụ thể (Probe B). */
async function readRowValue(page, rowIndex) {
  const raw = await page.evaluate((i) => {
    const rows = document.querySelectorAll('#host .sim2-readout-row');
    const row = rows[i];
    if (!row) return null;
    const v = row.querySelector('.sim2-readout-value');
    return v ? v.textContent.trim() : null;
  }, rowIndex);
  return raw == null ? NaN : parseReadout(raw);
}

async function readSim3Field(page, baseId, fieldPath) {
  return page.evaluate(({ id, fp }) => {
    const dbg = window.__SIM3_DEBUG__ && window.__SIM3_DEBUG__[id];
    if (!dbg) return null;
    let cur = dbg;
    for (const p of String(fp).split('.')) { if (cur == null) return null; cur = cur[p]; }
    return typeof cur === 'number' ? cur : null;
  }, { id: baseId, fp: fieldPath });
}

/**
 * Snapshot mọi field SỐ trong __SIM3_DEBUG__[id] (đệ quy) → { path: number }.
 * Probe A sim3 đo liveness qua TOÀN BỘ field, không chỉ 1 readout → control chỉ
 * tác động field phụ (vd alphaAcc → omega/phi) vẫn được phát hiện sống.
 */
async function snapshotSim3(page, baseId) {
  return page.evaluate((id) => {
    const dbg = window.__SIM3_DEBUG__ && window.__SIM3_DEBUG__[id];
    const out = {};
    if (!dbg) return out;
    (function walk(obj, prefix) {
      for (const k of Object.keys(obj)) {
        if (k === 'visualMetrics') continue;   // metric thẩm mỹ, không phải state vật lý
        const v = obj[k];
        const key = prefix ? prefix + '.' + k : k;
        if (typeof v === 'number' && isFinite(v)) out[key] = v;
        else if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, key);
      }
    })(dbg, '');
    return out;
  }, baseId);
}

async function getSliderValue(page, id) {
  return page.evaluate((sid) => {
    const el = document.querySelector(`#host input[data-id="${sid}"]`);
    return el ? parseFloat(el.value) : null;
  }, id);
}

/** Set slider value + bắn 'input' (kích hoạt onInput → render2 → readout/sim3.setState). */
async function setSlider(page, id, value) {
  const okSet = await page.evaluate(({ sid, v }) => {
    const el = document.querySelector(`#host input[data-id="${sid}"]`);
    if (!el) return false;
    el.value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }, { sid: id, v: value });
  await waitRaf(page, 2);
  return okSet;
}

/** Kéo handle đầu tiên một đoạn xác định trong vùng SVG → đo liveness. */
async function dragHandle(page, selector) {
  const handle = page.locator(`#host ${selector}`).first();
  if (await handle.count() === 0) return false;
  const hb = await handle.boundingBox();
  const sb = await page.locator('#host .sim2-root').boundingBox();
  if (!hb || !sb) return false;
  const sx = hb.x + hb.width / 2, sy = hb.y + hb.height / 2;
  // Dịch sang phải 28% bề rộng SVG; nếu sát mép phải thì dịch sang trái.
  let dx = sb.width * 0.28;
  if (sx + dx > sb.x + sb.width - 12) dx = -dx;
  let ex = sx + dx;
  let ey = sy - sb.height * 0.12;
  ex = Math.max(sb.x + 12, Math.min(sb.x + sb.width - 12, ex));
  ey = Math.max(sb.y + 12, Math.min(sb.y + sb.height - 12, ey));
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(ex, ey, { steps: 10 });
  await page.mouse.up();
  await waitRaf(page, 2);
  return true;
}

/** Playback: play → step N → đảm bảo scene tiến (deterministic settle). */
async function drivePlayback(page) {
  await page.evaluate((steps) => {
    const host = document.getElementById('host');
    const play = host.querySelector('.sim2-playpause');
    const step = host.querySelector('.sim2-step');
    if (play) play.click();
    for (let i = 0; i < steps && step; i++) step.click();
  }, PLAYBACK_STEPS);
  await waitRaf(page, 2);
}

/**
 * Chữ ký scene SVG: nối cx/cy/transform/d/x1.. của mọi phần tử trong .sim2-root.
 * Playback animate cảnh (đổi vị trí phần tử) NHƯNG readout có thể là hằng theo t
 * (vd ch2-3-2 chỉ in bán kính/tỉ số). Đo scene-change để bắt liveness playback thật,
 * tránh "dead" giả khi readout không phụ thuộc thời gian.
 */
async function sceneSignature(page) {
  return page.evaluate(() => {
    const root = document.querySelector('#host .sim2-root');
    if (!root) return '';
    const attrs = ['cx', 'cy', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'd', 'transform', 'points', 'r'];
    const parts = [];
    for (const el of root.querySelectorAll('*')) {
      for (const a of attrs) { const v = el.getAttribute(a); if (v != null) parts.push(a + '=' + v); }
    }
    return parts.join('|');
  });
}

// ── sim3 mode toggle ──────────────────────────────────────────────────────
async function clickMode(page, mode) {
  const btn = page.locator(`#host .sim3-mode-toggle [data-mode="${mode}"]`);
  if (await btn.count() === 0) return false;
  await btn.click();
  await waitRaf(page, 3);
  return true;
}
async function sim3Channel(page) {
  if (await page.locator('#host .sim3-mode-toggle [data-mode="3d"]').count() === 0) return 'mount-error';
  await clickMode(page, '3d');
  const canvasVisible = await page.locator('#host canvas.sim3-canvas').isVisible().catch(() => false);
  if (canvasVisible) return 'sim3-webgl';
  const fb = await page.evaluate(() => {
    const f = document.querySelector('#host .sim3-fallback'); return !!(f && !f.hidden);
  });
  return fb ? 'fallback-2d' : 'mount-error';
}

/**
 * Đưa sim3 về trạng thái sạch giữa các control: reset slider về default + nhấn ↺
 * (reset playback) rồi đảm bảo đang ở 3D. Tránh drive control này nhiễu control kia
 * (vd drag-handle detour làm dời time/state, slider trước đổi param).
 */
async function resetSim3(page, controls) {
  // 1. reset playback nếu có (↺ đưa t=0, dừng).
  await page.evaluate(() => {
    const r = document.querySelector('#host .sim2-reset'); if (r) r.click();
  });
  // 2. set mỗi slider về value mặc định (min của route-map → trạng thái xác định).
  for (const c of controls) {
    if (c.kind === 'slider') await setSlider(page, c.id, c.min);
  }
  // 3. chắc chắn đang ở 3D (detour 2D có thể còn sót).
  const is3d = await page.evaluate(() => {
    const b = document.querySelector('#host .sim3-mode-toggle [data-mode="3d"]');
    return b && b.getAttribute('aria-pressed') === 'true';
  });
  if (!is3d) await clickMode(page, '3d');
}

// ── mount ───────────────────────────────────────────────────────────────────
async function mountBase(page, chapter, baseId) {
  await page.goto(fixtureFor(chapter), { waitUntil: 'domcontentloaded' });
  await page.addStyleTag({ path: path.join(ROOT, 'css/style.css') });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    const h = document.getElementById('host');
    h.style.width = '960px'; h.style.height = 'auto';
    h.style.minHeight = '560px'; h.style.padding = '16px';
    h.style.background = '#fff'; h.style.boxSizing = 'border-box';
  });
  await page.evaluate(id => {
    if (!window.SIM_MAP || !window.SIM_MAP[id]) throw new Error('SIM_MAP missing ' + id);
    window.__sim = window.SIM_MAP[id](document.getElementById('host'));
  }, baseId);
}

/**
 * Re-mount sạch về trạng thái mặc định: dispose sim cũ, clear #host, mount lại.
 * Cần thiết cho Probe A vì drive slider làm DỜI drag-handle → đo handle sau slider
 * trên cùng 1 mount cho Δ=0 GIẢ. Mỗi control đo trên mount tươi → độc lập.
 */
async function remount(page, baseId) {
  await page.evaluate(id => {
    try { window.__sim && window.__sim.dispose(); } catch (e) {}
    const h = document.getElementById('host');
    if (h) h.innerHTML = '';
    window.__sim = window.SIM_MAP[id](h);
  }, baseId);
  await waitRaf(page, 1);
}

// ── Probe A (liveness) ───────────────────────────────────────────────────────

/** Sim2 DOM liveness: drive control, lấy max |Δ| qua mọi hàng readout numeric. */
async function livenessSim2(page, control) {
  const before = await readNumericRows(page);
  const sceneBefore = await sceneSignature(page);   // mọi control: cảnh đổi = sống dù readout đứng
  let driven = true, detail = control.kind;
  if (control.kind === 'slider') {
    const cur = await getSliderValue(page, control.id);
    const target = (cur != null && cur >= (control.max + control.min) / 2) ? control.min : control.max;
    driven = await setSlider(page, control.id, target);
  } else if (control.kind === 'drag-handle') {
    driven = await dragHandle(page, control.selector || '.sim2-handle');
  } else if (control.kind === 'playback') {
    await drivePlayback(page);
  }
  const after = await readNumericRows(page);
  // Δ = max chênh lệch tuyệt đối qua các hàng (bất kỳ hàng đổi → control sống).
  let maxAbs = 0, bSel = NaN, aSel = NaN;
  const n = Math.max(before.length, after.length);
  for (let i = 0; i < n; i++) {
    const d = computeDelta(before[i], after[i]);
    if (Number.isFinite(d) && Math.abs(d) > maxAbs) { maxAbs = Math.abs(d); bSel = before[i]; aSel = after[i]; }
  }
  const delta = Number.isFinite(bSel) ? computeDelta(bSel, aSel) : NaN;
  let live = isLive(maxAbs, LIVE_EPSILON);
  // Cảnh SVG đổi = control sống dù readout là hằng (vd ch2-1-1 alpha đổi hướng v
  // nhưng |v| ở t=0 không đổi; playback animate cảnh mà readout hằng theo t).
  const sceneAfter = await sceneSignature(page);
  const sceneChanged = sceneBefore !== sceneAfter;
  if (!live && sceneChanged) live = true;
  return {
    control: control.kind + (control.id ? `:${control.id}` : ''),
    channel: 'sim2-dom', driven, detail,
    before: Number.isFinite(bSel) ? bSel : null,
    after: Number.isFinite(aSel) ? aSel : null,
    delta: Number.isFinite(delta) ? delta : null,
    sceneChanged,
    deltaNonZero: live
  };
}

/** Sim3 liveness: đo TOÀN BỘ field __SIM3_DEBUG__ trước/sau drive, lấy field Δ max. */
async function livenessSim3(page, baseId, control) {
  const before = await snapshotSim3(page, baseId);
  let driven = true;
  if (control.kind === 'slider') {
    const cur = await getSliderValue(page, control.id);
    const target = (cur != null && cur >= (control.max + control.min) / 2) ? control.min : control.max;
    driven = await setSlider(page, control.id, target);     // slider hoạt động cả ở 3D (ngoài SVG)
  } else if (control.kind === 'playback') {
    await drivePlayback(page);                              // step forward → sim3.setState live
  } else if (control.kind === 'drag-handle') {
    // Handle trong SVG bị ẩn ở 3D → detour: về 2D kéo, quay lại 3D replay lastState.
    await clickMode(page, '2d');
    driven = await dragHandle(page, control.selector || '.sim2-handle');
    await clickMode(page, '3d');
  }
  const after = await snapshotSim3(page, baseId);
  // Field có |Δ| lớn nhất → bằng chứng liveness mạnh nhất cho control này.
  let maxAbs = 0, bestField = null, bVal = null, aVal = null;
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of keys) {
    const d = computeDelta(before[k], after[k]);
    if (Number.isFinite(d) && Math.abs(d) > maxAbs) { maxAbs = Math.abs(d); bestField = k; bVal = before[k]; aVal = after[k]; }
  }
  const delta = bestField ? computeDelta(bVal, aVal) : NaN;
  return {
    control: control.kind + (control.id ? `:${control.id}` : ''),
    channel: 'sim3-webgl', driven, field: bestField,
    before: bVal == null ? null : bVal,
    after: aVal == null ? null : aVal,
    delta: Number.isFinite(delta) ? delta : null,
    deltaNonZero: isLive(maxAbs, LIVE_EPSILON)
  };
}

// ── Probe B (monotonic sign) ──────────────────────────────────────────────────

/** Sim2 B: drive slider lo→hi, đo hàng rowIndex, so dấu với expectSign. */
async function signSim2(page, t) {
  const lo = t.lo != null ? t.lo : null;
  const hi = t.hi != null ? t.hi : null;
  // Biên slider: ưu tiên lo/hi override (local-monotonic), else min/max DOM.
  const range = await page.evaluate((sid) => {
    const el = document.querySelector(`#host input[data-id="${sid}"]`);
    return el ? { min: parseFloat(el.min), max: parseFloat(el.max) } : null;
  }, t.control);
  if (!range) return { key: t.key, control: t.control, error: 'slider-not-found', match: false };
  const vLo = lo != null ? lo : range.min;
  const vHi = hi != null ? hi : range.max;
  await setSlider(page, t.control, vLo);
  const rLo = await readRowValue(page, t.rowIndex);
  await setSlider(page, t.control, vHi);
  const rHi = await readRowValue(page, t.rowIndex);
  const delta = computeDelta(rLo, rHi);
  const observedSign = signOf(delta, DEFAULT_EPSILON);
  return {
    key: t.key, control: t.control, rowIndex: t.rowIndex,
    driveLow: vLo, driveHigh: vHi,
    readoutLow: Number.isFinite(rLo) ? rLo : null,
    readoutHigh: Number.isFinite(rHi) ? rHi : null,
    delta: Number.isFinite(delta) ? delta : null,
    observedSign, expectSign: t.expectSign,
    match: compareSign(observedSign, t.expectSign)
  };
}

/** Sim3 B: drive slider lo→hi (ở 3D), đo field, so dấu. */
async function signSim3(page, baseId, field, t) {
  const range = await page.evaluate((sid) => {
    const el = document.querySelector(`#host input[data-id="${sid}"]`);
    return el ? { min: parseFloat(el.min), max: parseFloat(el.max) } : null;
  }, t.control);
  if (!range) return { control: t.control, error: 'slider-not-found', match: false };
  const vLo = t.lo != null ? t.lo : range.min;
  const vHi = t.hi != null ? t.hi : range.max;
  await setSlider(page, t.control, vLo);
  const rLo = await readSim3Field(page, baseId, field);
  await setSlider(page, t.control, vHi);
  const rHi = await readSim3Field(page, baseId, field);
  const delta = computeDelta(rLo, rHi);
  const observedSign = signOf(delta, DEFAULT_EPSILON);
  return {
    field, control: t.control, driveLow: vLo, driveHigh: vHi,
    readoutLow: rLo == null ? null : rLo, readoutHigh: rHi == null ? null : rHi,
    delta: Number.isFinite(delta) ? delta : null,
    observedSign, expectSign: t.expectSign,
    match: compareSign(observedSign, t.expectSign)
  };
}

// ── main ──────────────────────────────────────────────────────────────────────
test.describe('sim interaction-probe — 35 route (route-map driven, dev-only)', () => {
  for (const key of Object.keys(ROUTE_MAP)) {
    const entry = ROUTE_MAP[key];
    const baseId = baseIdOf(key);
    const isSim3 = entry.engine === 'sim3';

    test(`probe ${key}`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', e => pageErrors.push(String(e)));

      await mountBase(page, entry.chapter, baseId);
      await expect(page.locator('#host .sim2-root'), `${key} .sim2-root mounted`).toHaveCount(1);

      const result = {
        route: key, baseId, engine: entry.engine, chapter: entry.chapter,
        bMode: entry.bMode, channel: 'sim2-dom', mounted: true,
        probeA: [], probeB: null, pageErrors: []
      };

      if (!isSim3) {
        // ── SIM2 ──────────────────────────────────────────────────────────
        // Probe A: mỗi control trên 1 mount tươi → drive này không nhiễu drive kia
        // (drive slider làm dời drag-handle; đo handle sau slider cho Δ=0 giả).
        for (const control of (entry.controls || [])) {
          await remount(page, baseId);
          result.probeA.push(await livenessSim2(page, control));
        }
        const tg = targetsFor(key);
        if (entry.bMode === 'monotonic' || entry.bMode === 'local-monotonic') {
          if (tg) {
            await remount(page, baseId);   // bắt đầu Probe B từ trạng thái mặc định
            const items = [];
            for (const t of tg.targets) items.push(await signSim2(page, t));
            result.probeB = { feasible: true, items };
          } else {
            result.probeB = { feasible: false, bSkipped: true, reason: `${entry.bMode}: no probe-target mapping` };
          }
        } else {
          result.probeB = { feasible: false, bSkipped: true, reason: `${entry.bMode}: liveness-only (no monotonic scalar chain)` };
        }
      } else {
        // ── SIM3 ──────────────────────────────────────────────────────────
        const channel = await sim3Channel(page);
        result.channel = channel;
        const baseEntry = ROUTE_MAP[baseId];
        const controls = Array.isArray(baseEntry && baseEntry.controls) ? baseEntry.controls : [];
        const field = entry.readouts && entry.readouts[0] && entry.readouts[0].debugPath
          ? fieldOf(entry.readouts[0].debugPath) : null;

        if (channel === 'sim3-webgl' && field) {
          for (const control of controls) {
            await resetSim3(page, controls);   // mỗi control đo trên trạng thái 3D sạch
            result.probeA.push(await livenessSim3(page, baseId, control));
          }
          const tg = targetsFor(key);
          if ((entry.bMode === 'monotonic' || entry.bMode === 'local-monotonic') && tg) {
            await resetSim3(page, controls);
            const items = [];
            for (const t of tg.targets) {
              const bField = t.field || field;   // target field override, else readout field
              items.push(await signSim3(page, baseId, bField, t));
            }
            result.probeB = { feasible: true, channel, items };
          } else {
            result.probeB = { feasible: false, bSkipped: true,
              reason: `${entry.bMode}: ${tg ? 'ok' : 'no target'} — sign ${entry.bMode === 'monotonic' || entry.bMode === 'local-monotonic' ? 'mapped' : 'not applicable'}` };
          }
        } else if (channel === 'fallback-2d') {
          // WebGL fail → đo DOM readout Sim2 (valid fallback, không phải mount error).
          await clickMode(page, '2d');
          for (const control of controls) result.probeA.push(await livenessSim2(page, control));
          result.probeB = { feasible: false, bSkipped: true, reason: 'fallback-2d: WebGL unavailable, measured Sim2 DOM' };
        } else {
          result.finding = 'sim3-mount-error: 3D canvas + fallback both absent';
          result.probeB = { feasible: false, bSkipped: true, reason: 'mount-error' };
        }
      }

      result.pageErrors = pageErrors.slice();
      probeResults[key] = result;

      await page.evaluate(() => { try { window.__sim && window.__sim.dispose(); } catch (e) {} });
    });
  }

  test.afterAll(() => {
    const routes = Object.values(probeResults);
    const payload = {
      generatedAt: new Date().toISOString(),
      epsilon: { live: LIVE_EPSILON, sign: DEFAULT_EPSILON },
      playbackSteps: PLAYBACK_STEPS,
      routeCount: routes.length,
      routes
    };
    fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), 'utf8');
    expect(routes.length, 'có ≥1 route được probe').toBeGreaterThan(0);
  });
});
