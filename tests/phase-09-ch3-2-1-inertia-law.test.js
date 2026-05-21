/**
 * Phase 09 → Phase 02 — ch3-2-1 inertia law renderer.
 *
 * Verifies that the renderer reads engine-populated `state._t` and `state.v`
 * and translates the body across the canvas instead of painting a fixed offset
 * keyed only off `state.F`. Soft-clamps `bodyX` to [68, 500] so arrows never
 * leak across the label panel (F13).
 *
 * The test loads the production renderer source through a vm context with a
 * stubbed primitives surface that records every `P.body(...)` call. We then
 * compare bodyX values across (_t=0, _t=3) on both Fnet=0 and Fnet>0 branches.
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const RENDERER_PATH = path.join(ROOT, 'js', 'sims', 'ch3', 'ch3-newton-laws-renderers.js');

function loadRenderer(routeId) {
  const calls = [];
  function noop() {}
  function recordBody(_ctx, x, y, w, h, fill, stroke, label) {
    calls.push({ fn: 'body', x, y, w, h, fill, stroke, label });
  }
  function recordArrow(_ctx, x1, y1, x2, y2, color, label) {
    calls.push({ fn: 'arrow', x1, y1, x2, y2, color, label });
  }
  function recordPanel(_ctx, x, y, w, h, title, color) {
    calls.push({ fn: 'panel', x, y, w, h, title, color });
  }
  function recordFrame(_ctx, _scene, title, color) {
    calls.push({ fn: 'frame', title, color });
  }
  function recordDomMath(_ctx, id, x, y, latex, opts) {
    calls.push({ fn: 'domMath', id, x, y, latex, color: opts && opts.color });
  }
  const primitives = {
    W: 760,
    H: 440,
    tone: i => `tone-${i}`,
    frame: recordFrame,
    body: recordBody,
    arrow: recordArrow,
    neonArrow: recordArrow,
    panel: recordPanel,
    domMath: recordDomMath,
    realisticBody: noop,
    realisticGround: noop,
    dashedLine: noop,
    line: noop,
    point: noop,
    realisticPoint: noop,
    barGraph: noop,
  };
  const renderers = {};
  const sandbox = {
    console,
    window: {
      SimRouteRendererPrimitives: primitives,
      SimRouteRenderers: {
        register(routeId, rendererId, fn) {
          renderers[routeId] = fn;
        },
      },
    },
  };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(RENDERER_PATH, 'utf8'), sandbox, { filename: RENDERER_PATH });
  return {
    render(state) {
      calls.length = 0;
      const ctx = {
        save() {},
        restore() {},
        beginPath() {},
        moveTo() {},
        lineTo() {},
        stroke() {},
        fillRect() {},
        strokeRect() {},
        setLineDash() {},
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        fillText() {},
      };
      const scene = { routeId, title: 'Định luật quán tính' };
      const fn = renderers[routeId];
      if (!fn) throw new Error(`renderer ${routeId} not registered`);
      fn(ctx, scene, state, {});
      return calls.slice();
    },
  };
}

function bodyXFrom(calls) {
  const body = calls.find(c => c.fn === 'body');
  if (!body) throw new Error('body() not called by renderer');
  return body.x;
}

const renderer = loadRenderer('ch3-2-1');

// 1. Fnet ≈ 0 branch: engine clamps state.v to its previous value (default 5
//    on the first frame). Body must translate by ≈ v · _t · pxPerMeter.
{
  const t0 = renderer.render({ F: 0, alpha: 0, m: 5, _t: 0, v: 5 });
  const t3 = renderer.render({ F: 0, alpha: 0, m: 5, _t: 3, v: 5 });
  const x0 = bodyXFrom(t0);
  const x3 = bodyXFrom(t3);
  // Expected pxPerMeter = 8 → 5 m/s · 3 s · 8 px/m = 120 px translation.
  // Allow a 10 % tolerance to leave room for soft-clamp behaviour later.
  assert.ok(
    x3 - x0 >= 80,
    `[ch3-2-1] Fnet=0 branch must translate body ≥80 px between t=0 and t=3, got Δ=${(x3 - x0).toFixed(1)} px`
  );
}

// 2. Fnet > 0 branch: body accelerates per 0.5·a·t² so Δx grows quadratically
//    with _t. With F=50 N, m=5 kg → a=10 m/s² → at _t=3 s Δx ≈ 0.5·10·9·8 = 360 px,
//    soft-clamped to bodyX ≤ 500.
{
  const t0 = renderer.render({ F: 50, alpha: 0, m: 5, _t: 0, v: 0 });
  const t3 = renderer.render({ F: 50, alpha: 0, m: 5, _t: 3, v: 0 });
  const x0 = bodyXFrom(t0);
  const x3 = bodyXFrom(t3);
  assert.ok(
    x3 > x0 + 50,
    `[ch3-2-1] Fnet>0 branch must accelerate body, got Δ=${(x3 - x0).toFixed(1)} px`
  );
}

// 3. Soft-clamp halts body at canvas edge (F13). For very large _t and v the
//    body must stop at bodyX = 500, never wrap.
{
  const tBig = renderer.render({ F: 0, alpha: 0, m: 5, _t: 60, v: 10 });
  const x = bodyXFrom(tBig);
  assert.strictEqual(x, 500, `[ch3-2-1] soft-clamp must halt body at right edge bodyX=500, got ${x}`);
}

// 4. Reset → _t=0, v=0 → bodyX equals the original baseX expression.
{
  const reset = renderer.render({ F: 50, alpha: 0, m: 5, _t: 0, v: 0 });
  const x = bodyXFrom(reset);
  const expected = 200 + 50 * 0.3;
  assert.ok(
    Math.abs(x - expected) < 0.01,
    `[ch3-2-1] reset must restore baseX=${expected}, got ${x}`
  );
}

// 5. Arrows must follow the body (no anchor lag): both bodyX and the F₁ arrow
//    head x1 advance by the same delta.
{
  const t0 = renderer.render({ F: 50, alpha: 0, m: 5, _t: 0, v: 5 });
  const t3 = renderer.render({ F: 50, alpha: 0, m: 5, _t: 3, v: 5 });
  const xb0 = bodyXFrom(t0);
  const xb3 = bodyXFrom(t3);
  const a0 = t0.find(c => c.fn === 'arrow' && c.label === 'F₁');
  const a3 = t3.find(c => c.fn === 'arrow' && c.label === 'F₁');
  assert.ok(a0 && a3, '[ch3-2-1] F₁ arrow must be drawn');
  // Arrow anchors at bodyX+82, so Δ(arrow.x1) === Δ(bodyX) within 0.5 px.
  const dBody = xb3 - xb0;
  const dArrow = a3.x1 - a0.x1;
  assert.ok(
    Math.abs(dBody - dArrow) < 0.5,
    `[ch3-2-1] F₁ arrow must track body, Δbody=${dBody}, Δarrow=${dArrow}`
  );
}

console.log('phase-09-ch3-2-1-inertia-law.test.js: 5/5 PASS');
