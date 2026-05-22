const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DELETED_VII_CHECKER_ROUTES = Object.freeze([
  'ch1-7-1',
  'ch1-7-2',
  'ch2-7-1',
  'ch2-7-2',
  'ch3-7-1',
  'ch3-7-2',
]);

function runScript(context, file) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
}

const context = {
  console,
  window: {},
  document: {},
};
context.window.window = context.window;
context.window.document = context.document;
vm.createContext(context);

[
  'js/sim-scene-registry.js',
  'js/sim-route-renderer-registry.js',
  'js/sim-route-behavior-registry.js',
  'js/sim-core.js',
  'js/sim-route-renderer-primitives.js',
  'js/sim-route-manifest.js',
  'js/sim-statics.js',
  'js/sim-kinematics.js',
  'js/sim-dynamics.js',
  'js/sim-professional-lab.js',
  'js/sims/ch1/statics-routes.js',
  'js/sims/ch2/ch2-kinematics-scenes.js',
  'js/sims/ch2/ch2-relative-plane-motion-scenes.js',
  'js/sims/ch2/ch2-kinematics-behaviors-b.js',
  'js/sims/ch2/kinematics-routes.js',
  'js/sims/ch3/ch3-dynamics-all-18-scenes.js',
  'js/sims/ch3/ch3-collision-exercises-renderers.js',
  'js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js',
  'js/sims/ch3/dynamics-routes.js',
  'js/sims/zz-simulation-contract-scenes.js',
  'js/sims/zz-simulation-contract-renderers.js',
  'js/sims/zz-simulation-contract-behaviors.js',
  'js/simulations.js',
].forEach(file => runScript(context, file));

function assertAbsent(label, routes) {
  const exposed = DELETED_VII_CHECKER_ROUTES.filter(route => routes.includes(route));
  assert.deepStrictEqual(exposed, [], `${label} must not expose deleted Section VII checker routes`);
}

assertAbsent('SIM_ROUTE_MANIFEST', Object.keys(context.window.SIM_ROUTE_MANIFEST || {}));
assertAbsent('SIM_MAP', Object.keys(context.window.SIM_MAP || {}));
assertAbsent('scene registry', context.window.SimSceneRegistry.routes());
assertAbsent('renderer registry', context.window.SimRouteRenderers.routes());
assertAbsent('behavior registry', context.window.SimRouteBehaviors.routes());

assert.strictEqual(Object.keys(context.window.SIM_ROUTE_MANIFEST || {}).length, 52, 'manifest route count must be 52');
assert.strictEqual(context.window.SimSceneRegistry.routes().length, 52, 'scene registry route count must be 52');
assert.strictEqual(context.window.SimRouteRenderers.routes().length, 52, 'renderer registry route count must be 52');
assert.strictEqual(context.window.SimRouteBehaviors.routes().length, 52, 'behavior registry route count must be 52');

console.log('vii-checker-routes-deleted: PASS');
