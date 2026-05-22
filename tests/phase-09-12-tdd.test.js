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

function getCh3Scene(route) {
  const context = { console, window: {} };
  context.window.window = context.window;
  vm.createContext(context);
  runScript(context, 'js/sim-scene-registry.js');
  runScript(context, 'js/sims/ch3/ch3-dynamics-all-18-scenes.js');
  return context.window.SimSceneRegistry.get(route);
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
  const collisionSource = fs.readFileSync(path.join(ROOT, 'js/sims/ch3/ch3-collision-exercises-renderers.js'), 'utf8');
  const sceneSource = fs.readFileSync(path.join(ROOT, 'js/sims/ch3/ch3-dynamics-all-18-scenes.js'), 'utf8');
  assert.ok(!collisionSource.includes('COLLISION'), 'ch3 collision marker must be localized');
  assert.ok(!collisionSource.includes('bảng sai lệch (residuals)'), 'ch3 residual panel must be localized');
  assert.ok(!collisionSource.includes('state.v1 || 5'), 'ch3 collision renderer must preserve valid v1=0');
  assert.ok(!collisionSource.includes('state.v2 || -3'), 'ch3 collision renderer must preserve valid v2=0');
  assert.ok(!sceneSource.includes('verify theorems'), 'ch3 scene formula text must be localized');
  assert.ok(!sceneSource.includes("'Verify'"), 'ch3 scene visual label must be localized');
}

{
  const indexSource = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(!indexSource.includes('js/sims/ch2/ch2-particle-renderers.js'),
    'legacy ch2 particle draft renderer module must not be loaded');
  assert.ok(!fs.existsSync(path.join(ROOT, 'js/sims/ch2/ch2-particle-renderers.js')),
    'legacy ch2 particle draft renderer module must be removed instead of retained as dead code');
}

{
  const behavior = getCh3Behavior('ch3-5-4');
  const state = {};
  behavior.onReset({ routeId: 'ch3-5-4' }, state);
  assert.ok(!Object.prototype.hasOwnProperty.call(state, 'ball1'),
    'ch3-5-4 reset must not seed collision-only ball state');
  assert.ok(!Object.prototype.hasOwnProperty.call(state, 'ball2'),
    'ch3-5-4 reset must not seed collision-only ball state');
  assert.ok(!Object.prototype.hasOwnProperty.call(state, 'collision'),
    'ch3-5-4 reset must not seed collision-only flags');
  assert.ok(!Object.prototype.hasOwnProperty.call(state, 'masses'),
    'ch3-5-4 reset must not seed center-of-mass-only masses');
}

{
  const behavior = getCh3Behavior('ch3-5-1');
  const state = {};
  behavior.onReset({ routeId: 'ch3-5-1' }, state);
  assert.ok(Array.isArray(state.masses), 'ch3-5-1 reset must seed center-of-mass masses');
  assert.ok(!Object.prototype.hasOwnProperty.call(state, 'ball1'),
    'ch3-5-1 reset must not seed collision-only ball state');
  assert.ok(!Object.prototype.hasOwnProperty.call(state, 'ball2'),
    'ch3-5-1 reset must not seed collision-only ball state');
  assert.ok(!Object.prototype.hasOwnProperty.call(state, 'collision'),
    'ch3-5-1 reset must not seed collision-only flags');
}

{
  const behavior = getCh3Behavior('ch3-6-2');
  const state = {};
  behavior.onReset({ routeId: 'ch3-6-2' }, state);
  assert.ok(state.ball1 && state.ball2, 'ch3-6-2 reset must seed collision balls');
  assert.ok(!Object.prototype.hasOwnProperty.call(state, 'masses'),
    'ch3-6-2 reset must not seed center-of-mass-only masses');
}

{
  const scene = getCh3Scene('ch3-5-4');
  const initial = scene.initialState;
  assert.ok(!Object.prototype.hasOwnProperty.call(initial, 'ball1'),
    'ch3-5-4 initial state must keep runtime reset free of collision-only ball state');
  assert.ok(!Object.prototype.hasOwnProperty.call(initial, 'ball2'),
    'ch3-5-4 initial state must keep runtime reset free of collision-only ball state');
  assert.ok(!Object.prototype.hasOwnProperty.call(initial, 'collision'),
    'ch3-5-4 initial state must keep runtime reset free of collision-only flags');
  assert.ok(!Object.prototype.hasOwnProperty.call(initial, 'masses'),
    'ch3-5-4 initial state must keep runtime reset free of center-of-mass-only masses');
}

{
  const scene = getCh3Scene('ch3-5-1');
  const initial = scene.initialState;
  assert.ok(Array.isArray(initial.masses), 'ch3-5-1 initial state must seed center-of-mass masses');
  assert.ok(!Object.prototype.hasOwnProperty.call(initial, 'ball1'),
    'ch3-5-1 initial state must not seed collision-only ball state');
  assert.ok(!Object.prototype.hasOwnProperty.call(initial, 'ball2'),
    'ch3-5-1 initial state must not seed collision-only ball state');
  assert.ok(!Object.prototype.hasOwnProperty.call(initial, 'collision'),
    'ch3-5-1 initial state must not seed collision-only flags');
}

{
  const scene = getCh3Scene('ch3-6-2');
  const initial = scene.initialState;
  assert.ok(initial.ball1 && initial.ball2, 'ch3-6-2 initial state must seed collision balls');
  assert.ok(!Object.prototype.hasOwnProperty.call(initial, 'masses'),
    'ch3-6-2 initial state must not seed center-of-mass-only masses');
}

console.log('phase-09-12-tdd: PASS');
