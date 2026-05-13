const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function runScript(context, file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
}

function contextWithRegistries(files) {
  const context = { console, window: {} };
  context.window.window = context.window;
  vm.createContext(context);
  runScript(context, 'js/sim-route-behavior-registry.js');
  files.forEach(file => runScript(context, file));
  return context;
}

function getCh2Behavior(route) {
  const context = contextWithRegistries(['js/sims/ch2/ch2-kinematics-behaviors-b.js']);
  return context.window.SimRouteBehaviors.get(route);
}

function getCh3Behavior(route) {
  const context = contextWithRegistries([
    'js/sim-physics-dynamics.js',
    'js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js',
    'js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js'
  ]);
  return context.window.SimRouteBehaviors.get(route);
}

{
  const behavior = getCh2Behavior('ch2-7-1');
  const state = { omega: 4, t: Math.PI * 2 - 0.01 };
  behavior.onTick({ routeId: 'ch2-7-1' }, state, 2, 2);
  assert.ok(state.step >= 0 && state.step <= 2, 'ch2-7-1 step must stay within three solver panels');
  assert.ok(Math.abs(state.vVal - 3 * state.omega * Math.cos(state.t)) < 1e-9,
    'ch2-7-1 velocity must be derivative of x(t)');
  assert.ok(Math.abs(state.aVal + 3 * state.omega * state.omega * Math.sin(state.t)) < 1e-9,
    'ch2-7-1 acceleration must be derivative of v(t)');
}

{
  const behavior = getCh2Behavior('ch2-7-2');
  const state = { omega: 2, t: 1.2, x0: 5, amplitude: 3 };
  behavior.onTick({ routeId: 'ch2-7-2' }, state, 0, 0);
  assert.ok(state.errorX < 1e-9, 'ch2-7-2 default x(t) must verify against the canonical sinusoid');
  assert.ok(state.errorV < 1e-9, 'ch2-7-2 default v(t) must verify against the canonical sinusoid derivative');
  assert.strictEqual(state.status, 'Đúng', 'ch2-7-2 exact canonical data must be accepted');
}

{
  const behavior = getCh2Behavior('ch2-7-2');
  const state = { omega: 1.5, t: 0.9, x0: 7, amplitude: 4 };
  behavior.onTick({ routeId: 'ch2-7-2' }, state, 0, 0);
  assert.ok(Math.abs(state.xVal - (7 + 4 * Math.sin(state.t))) < 1e-9,
    'ch2-7-2 must honor non-default x0/amplitude for x(t)');
  assert.ok(Math.abs(state.vVal - (4 * 1.5 * Math.cos(state.t))) < 1e-9,
    'ch2-7-2 must honor non-default amplitude/omega for v(t)');
  assert.strictEqual(state.status, 'Đúng', 'ch2-7-2 exact non-default data must be accepted');
}

{
  const behavior = getCh2Behavior('ch2-7-2');
  const state = { omega: 1.5, t: 0.9, x0: 0, amplitude: 4 };
  behavior.onTick({ routeId: 'ch2-7-2' }, state, 0, 0);
  assert.ok(Math.abs(state.xVal - (4 * Math.sin(state.t))) < 1e-9,
    'ch2-7-2 must preserve valid x0=0 instead of falling back to 5');
  assert.strictEqual(state.status, 'Đúng', 'ch2-7-2 exact zero-offset data must be accepted');
}

{
  const source = fs.readFileSync(path.join(ROOT, 'js/sim-professional-lab.js'), 'utf8');
  assert.ok(!source.includes('(state.x0 || 5)'), 'ch2-7-2 direct-drag path must preserve valid x0=0');
}

{
  const source = fs.readFileSync(path.join(ROOT, 'js/sims/ch2/ch2-kinematics-exercises-renderers.js'), 'utf8');
  assert.ok(!source.includes('state.xVal || 5'), 'ch2 exercise renderer must preserve visible x=0');
  assert.ok(!source.includes('buoc '), 'ch2 exercise renderer must localize visible step labels');
  assert.ok(!source.includes('Doc x(t) tai t'), 'ch2 exercise renderer must localize visible step descriptions');
  assert.ok(!source.includes('bang so lieu'), 'ch2 exercise renderer must localize visible table labels');
}

{
  const behavior = getCh3Behavior('ch3-3-1');
  const state = { x: 0.8, v: 0, m: 2, k: 20, trajectory: [] };
  behavior.onTick({ routeId: 'ch3-3-1' }, state, 0.05, 0.05);
  const derived = behavior.derived({ routeId: 'ch3-3-1' }, state);
  assert.ok(state.trajectory.length === 1, 'ch3-3-1 must append spring trajectory samples');
  assert.ok(derived.totalEnergy > 0, 'ch3-3-1 must expose non-zero spring energy');
}

{
  const behavior = getCh3Behavior('ch3-3-2');
  const state = { x: 0.4, x2: -0.2, v1: 0, v2: 0, m: 2, m2: 2, k: 20 };
  behavior.onTick({ routeId: 'ch3-3-2' }, state, 0.05, 0.05);
  assert.ok(Array.isArray(state.trajectory), 'ch3-3-2 must create trajectory array when missing');
  assert.ok(Array.isArray(state.trajectory2), 'ch3-3-2 must create second trajectory array when missing');
  assert.strictEqual(state.trajectory.length, 1, 'ch3-3-2 must append x1 sample');
  assert.strictEqual(state.trajectory2.length, 1, 'ch3-3-2 must append x2 sample');
}

{
  const behavior = getCh3Behavior('ch3-6-3');
  const state = { m1: 2, m2: 3, v1: 6, v2: -2, e: 0.7 };
  behavior.onTick({ routeId: 'ch3-6-3' }, state, 0.1, 0.1);
  assert.ok(Math.abs(state.pBefore - state.pAfter) < 1e-9,
    'ch3-6-3 1D collision solver must conserve signed momentum');
}

{
  const behavior = getCh3Behavior('ch3-6-3');
  const state = { m1: 2, m2: 3, v1: 0, v2: 0, e: 0 };
  behavior.onTick({ routeId: 'ch3-6-3' }, state, 0.1, 0.1);
  assert.strictEqual(state.v1After, 0, 'ch3-6-3 must preserve valid v1=0');
  assert.strictEqual(state.v2After, 0, 'ch3-6-3 must preserve valid v2=0');
  assert.strictEqual(state.pBefore, 0, 'ch3-6-3 must preserve zero input momentum');
  assert.strictEqual(state.pAfter, 0, 'ch3-6-3 must preserve zero output momentum');
}

{
  const behavior = getCh3Behavior('ch3-7-2');
  const state = { residualScale: 0 };
  behavior.onTick({ routeId: 'ch3-7-2' }, state, 0.1, 0.1);
  const derived = behavior.derived({ routeId: 'ch3-7-2' }, state);
  assert.strictEqual(state.residual1, 0, 'ch3-7-2 zero residual scale must keep residual1 at 0');
  assert.strictEqual(derived.score, 100, 'ch3-7-2 zero residual scale must score 100');
}

{
  const collisionSource = fs.readFileSync(path.join(ROOT, 'js/sims/ch3/ch3-collision-exercises-renderers.js'), 'utf8');
  const sceneSource = fs.readFileSync(path.join(ROOT, 'js/sims/ch3/ch3-dynamics-all-18-scenes.js'), 'utf8');
  assert.ok(!collisionSource.includes('COLLISION'), 'ch3 collision marker must be localized');
  assert.ok(!collisionSource.includes('bảng sai lệch (residuals)'), 'ch3 residual panel must be localized');
  assert.ok(!collisionSource.includes('state.v1 || 5'), 'ch3 collision renderer must preserve valid v1=0');
  assert.ok(!collisionSource.includes('state.v2 || -3'), 'ch3 collision renderer must preserve valid v2=0');
  assert.ok(!sceneSource.includes('verify theorems'), 'ch3 scene formula text must be localized');
  assert.ok(!sceneSource.includes("'Verify'"), 'ch3 scene visual label must be localized');
}

console.log('phase-09-12-tdd: PASS');
