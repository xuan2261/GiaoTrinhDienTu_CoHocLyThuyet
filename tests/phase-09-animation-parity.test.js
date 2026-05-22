/**
 * Phase 09 → Phase 05 — animation parity for active candidate renderers.
 *
 * Pins the engine-time → canvas evolution contract for ch3-1-2, ch3-5-1,
 * ch3-5-2, and ch2-5-1. Each sub-test loads the production renderer in a
 * vm sandbox with stubbed primitives that record every draw call, then asserts
 * geometry differs between two engine-time samples.
 *
 *   5a ch3-1-2      F arrow length pulses with _t
 *   5b ch3-5-1      particles orbit AND centroid invariant holds (F8)
 *                   (mass-weighted xCM/yCM of rendered particles == rendered "C")
 *   5c ch3-5-2      pAfter (barGraph p_sau value) changes with _t
 *   5d ch2-5-1      B point rotates around A as state.phi changes (F5: read phi
 *                   directly; engine integrates it via onTick_ch251)
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function makeRecorder() {
  const calls = [];
  const noop = () => {};
  function rec(name) {
    return (...args) => calls.push({ fn: name, args });
  }
  const primitives = {
    W: 760,
    H: 440,
    tone: i => `tone-${i}`,
    isDarkTheme: () => false,
    frame: rec('frame'),
    body: rec('body'),
    arrow: rec('arrow'),
    neonArrow: rec('neonArrow'),
    panel: rec('panel'),
    domMath: rec('domMath'),
    domLabel: rec('domLabel'),
    realisticBody: rec('realisticBody'),
    realisticGround: rec('realisticGround'),
    realisticBeam: rec('realisticBeam'),
    realisticPoint: rec('realisticPoint'),
    dashedLine: rec('dashedLine'),
    line: noop,
    point: noop,
    barGraph: rec('barGraph'),
    angleArc: noop,
    dimension: noop,
  };
  return { calls, primitives };
}

function makeStubCtx() {
  return {
    save() {}, restore() {},
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {},
    stroke() {}, fill() {}, arc() {}, fillRect() {}, strokeRect() {},
    setLineDash() {},
    fillStyle: '', strokeStyle: '', lineWidth: 1, font: '',
    fillText() {}, measureText: () => ({ width: 0 }),
  };
}

function loadRenderers(rendererPath) {
  const renderers = {};
  const { calls, primitives } = makeRecorder();
  const sandbox = {
    console,
    Math,
    Number,
    window: {
      SimRouteRendererPrimitives: primitives,
      SimRouteRenderers: {
        register(routeId, _id, fn) { renderers[routeId] = fn; },
      },
    },
  };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(rendererPath, 'utf8'),
    sandbox,
    { filename: rendererPath }
  );
  return {
    render(routeId, state, derived) {
      calls.length = 0;
      const ctx = makeStubCtx();
      const fn = renderers[routeId];
      if (!fn) throw new Error(`renderer not registered: ${routeId}`);
      fn(ctx, { routeId, title: routeId }, state, derived || {});
      return calls.slice();
    },
  };
}

let passed = 0;

// ─── 5a: ch3-1-2 force-acceleration ─────────────────────────────────────────
{
  const r = loadRenderers(path.join(ROOT, 'js', 'sims', 'ch3', 'ch3-newton-laws-renderers.js'));
  const t0 = r.render('ch3-1-2', { F: 50, m: 5, _t: 0 });
  const t2 = r.render('ch3-1-2', { F: 50, m: 5, _t: 2 });
  // neonArrow signature: (ctx, x1, y1, x2, y2, fill, text)
  const arrow0 = t0.find(c => c.fn === 'neonArrow' && c.args[6] === 'F');
  const arrow2 = t2.find(c => c.fn === 'neonArrow' && c.args[6] === 'F');
  assert.ok(arrow0 && arrow2, '[ch3-1-2] F arrow not drawn');
  const len0 = Math.hypot(arrow0.args[3] - arrow0.args[1], arrow0.args[4] - arrow0.args[2]);
  const len2 = Math.hypot(arrow2.args[3] - arrow2.args[1], arrow2.args[4] - arrow2.args[2]);
  assert.ok(
    Math.abs(len0 - len2) > 1,
    `[ch3-1-2] F arrow length must change with _t, got len(t=0)=${len0.toFixed(2)} vs len(t=2)=${len2.toFixed(2)}`
  );
  passed++;
}

// ─── 5b: ch3-5-1 center of mass — particle motion + centroid invariant ─────
{
  const r = loadRenderers(path.join(ROOT, 'js', 'sims', 'ch3', 'ch3-theorems-renderers.js'));
  const masses = [
    { x: 130, y: 188, m: 2 },
    { x: 238, y: 130, m: 1.5 },
    { x: 332, y: 204, m: 1 },
  ];
  function frameAt(t) {
    const calls = r.render('ch3-5-1', { masses, _t: t }, {});
    const points = calls.filter(c => c.fn === 'realisticPoint');
    const find = label => points.find(p => p.args[3] && p.args[3].text === label);
    const m1 = find('m1'), m2 = find('m2'), m3 = find('m3'), c = find('C');
    assert.ok(m1 && m2 && m3 && c, '[ch3-5-1] expected m1, m2, m3, C points');
    return {
      m1: { x: m1.args[1], y: m1.args[2] },
      m2: { x: m2.args[1], y: m2.args[2] },
      m3: { x: m3.args[1], y: m3.args[2] },
      C:  { x: c.args[1],  y: c.args[2]  },
    };
  }
  const f0 = frameAt(0);
  const f15 = frameAt(1.5);
  const f3 = frameAt(3);
  // Particle motion: m1 must move between t=0 and t=3
  const dist = Math.hypot(f3.m1.x - f0.m1.x, f3.m1.y - f0.m1.y);
  assert.ok(
    dist > 1,
    `[ch3-5-1] particles must orbit between t=0 and t=3, got dist=${dist.toFixed(3)} px`
  );
  // Centroid invariant: rendered C dot tracks mass-weighted centroid of
  // displaced particle positions at every sample frame within 0.5 px (F8).
  for (const [label, f] of [['t=0', f0], ['t=1.5', f15], ['t=3', f3]]) {
    const totalM = 2 + 1.5 + 1;
    const xCM = (f.m1.x * 2 + f.m2.x * 1.5 + f.m3.x * 1) / totalM;
    const yCM = (f.m1.y * 2 + f.m2.y * 1.5 + f.m3.y * 1) / totalM;
    assert.ok(
      Math.abs(f.C.x - xCM) < 0.5 && Math.abs(f.C.y - yCM) < 0.5,
      `[ch3-5-1] centroid invariant ${label}: rendered C=(${f.C.x.toFixed(2)},${f.C.y.toFixed(2)}) vs computed (${xCM.toFixed(2)},${yCM.toFixed(2)})`
    );
  }
  passed++;
}

// ─── 5c: ch3-5-2 impulse-momentum — pAfter time-dependent ──────────────────
{
  const r = loadRenderers(path.join(ROOT, 'js', 'sims', 'ch3', 'ch3-theorems-renderers.js'));
  const t0 = r.render('ch3-5-2', { m: 2, J: 20, F: 20, _t: 0 });
  const t2 = r.render('ch3-5-2', { m: 2, J: 20, F: 20, _t: 2 });
  // barGraph signature: (ctx, x, y, w, h, value, max, color, labelText)
  const bar0 = t0.find(c => c.fn === 'barGraph' && c.args[8] === 'p_sau');
  const bar2 = t2.find(c => c.fn === 'barGraph' && c.args[8] === 'p_sau');
  assert.ok(bar0 && bar2, '[ch3-5-2] p_sau bar not drawn');
  assert.ok(
    Math.abs(bar0.args[5] - bar2.args[5]) > 0.1,
    `[ch3-5-2] pAfter must change with _t, got pAfter(t=0)=${bar0.args[5]} vs pAfter(t=2)=${bar2.args[5]}`
  );
  passed++;
}

// ─── 5d: ch2-5-1 plane translation+rotation — B rotates with state.phi ─────
{
  const r = loadRenderers(path.join(ROOT, 'js', 'sims', 'ch2', 'ch2-instant-center-plane-motion-renderers.js'));
  // F5: state.phi is integrated by the engine in onTick_ch251
  // (ch2-kinematics-behaviors-b.js:107-119). Renderer must read phi directly,
  // NOT add another `omega * t` term — that doubles rotation rate.
  const calls0 = r.render('ch2-5-1', { phi: 0, omega: 1.0 });
  const calls1 = r.render('ch2-5-1', { phi: 1.0, omega: 1.0 });
  const findB = calls => {
    const points = calls.filter(c => c.fn === 'realisticPoint');
    return points.find(p => p.args[3] && p.args[3].text === 'B');
  };
  const B0 = findB(calls0);
  const BP = findB(calls1);
  assert.ok(B0 && BP, '[ch2-5-1] B point not drawn');
  const move = Math.hypot(BP.args[1] - B0.args[1], BP.args[2] - B0.args[2]);
  assert.ok(
    move > 5,
    `[ch2-5-1] B must rotate around A as phi changes, got displacement=${move.toFixed(2)} px`
  );
  passed++;
}

console.log(`phase-09-animation-parity.test.js: ${passed}/4 PASS`);
