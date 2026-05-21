const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');

function loadBehaviors(files) {
  const behaviors = {};
  const context = {
    console,
    window: {
      SimPhysicsDynamics: {},
      SimRouteBehaviors: {
        registerMany(entries) {
          Object.assign(behaviors, entries);
        },
      },
    },
  };
  context.window.window = context.window;
  vm.createContext(context);
  for (const file of files) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
  }
  return behaviors;
}

function loadScenes(files) {
  const scenes = {};
  const context = {
    console,
    window: {
      SimSceneRegistry: {
        registerMany(entries) {
          for (const scene of entries) scenes[scene.routeId] = scene;
        },
      },
    },
  };
  context.window.window = context.window;
  vm.createContext(context);
  for (const file of files) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
  }
  return scenes;
}

function approx(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected}, got ${actual}`
  );
}

const behaviors = loadBehaviors([
  'js/sims/ch1/ch1-support-spatial-behaviors.js',
  'js/sims/ch1/ch1-friction-centroid-solver-behaviors.js',
  'js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js',
]);
const scenes = loadScenes(['js/sims/ch3/ch3-dynamics-all-18-scenes.js']);

{
  const behavior = behaviors['ch1-3-2'];
  const state = { routeId: 'ch1-3-2', alpha: 20, force: 96, primary: { x: 300, y: 240 } };
  const derived = behavior.derived({ routeId: 'ch1-3-2' }, state);
  // RED until P04: slider angle and readout alpha must share one source.
  approx(derived.alpha, state.alpha, 0.1, 'ch1-3-2 slider/readout alpha drift');
}

{
  const behavior = behaviors['ch1-3-6'];
  const state = { routeId: 'ch1-3-6', force: 96, load: 200, alpha: 0, primary: { x: 310, y: 210 } };
  const derived = behavior.derived({ routeId: 'ch1-3-6' }, state);
  // RED until P02: fixed-end moment must use physical arm in metres, not px divisor.
  approx(derived.moment, 96 * 1.8, 1, 'ch1-3-6 MA = R*d');

  const sibling = behaviors['ch1-4-2'].derived(
    { routeId: 'ch1-4-2' },
    { routeId: 'ch1-4-2', force: 96, load: 120, alpha: 30, primary: { x: 310, y: 210 } }
  );
  assert.ok(Number.isFinite(sibling.moment), 'ch1-4-2 sibling moment remains finite');
}

{
  const behavior = behaviors['ch1-5-3'];
  const state = { routeId: 'ch1-5-3', alpha: 19, mu: 0.46, load: 120, force: 92, primary: { x: 380, y: 250 } };
  const derived = behavior.derived({ routeId: 'ch1-5-3' }, state);
  // RED until P02: tan(19deg) < 0.46 means self-locking, not sliding.
  assert.strictEqual(derived.lockState, 'tự hãm');
  assert.notStrictEqual(derived.slipState, 'slip', 'ch1-5-3 should not slide inside friction cone');
}

{
  const behavior = behaviors['ch3-5-2'];
  const initial = scenes['ch3-5-2'].initialState;
  assert.strictEqual(initial.m, 2, 'ch3-5-2 mount mass seed');
  assert.strictEqual(initial.J, 20, 'ch3-5-2 mount impulse seed');
  assert.strictEqual(initial.deltaP, 20, 'ch3-5-2 mount deltaP seed');
  const state = {};
  behavior.onReset({ routeId: 'ch3-5-2' }, state);
  // RED until P02: mount/reset must seed impulse readouts before first tick.
  assert.strictEqual(state.m, 2, 'ch3-5-2 reset mass seed');
  assert.strictEqual(state.J, 20, 'ch3-5-2 reset impulse seed');
  assert.strictEqual(state.deltaP, 20, 'ch3-5-2 deltaP available before tick');
}

console.log('sim-review physics invariants: PASS');
