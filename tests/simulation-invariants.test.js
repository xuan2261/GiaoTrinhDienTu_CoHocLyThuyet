const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function loadContext() {
  const context = { console, window: {} };
  context.window.window = context.window;
  vm.createContext(context);
  [
    'js/sim-physics-statics.js',
    'js/sim-physics-kinematics.js',
    'js/sim-physics-dynamics.js',
    'js/sim-route-invariants.js',
    'js/sim-invariant-evaluators.js',
  ].forEach(script => vm.runInContext(fs.readFileSync(path.join(ROOT, script), 'utf8'), context));
  return context.window;
}

function approx(actual, expected, tolerance, label) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected ${expected}, got ${actual}`);
}

const routeArgIndex = process.argv.indexOf('--route');
const requestedRoute = routeArgIndex >= 0 ? process.argv[routeArgIndex + 1] : '';
const win = loadContext();
const specs = win.SimRouteInvariants;
const evaluators = win.SimInvariantEvaluators;
const pilotRoutes = ['ch1-2-3', 'ch1-5-3', 'ch2-1-2', 'ch2-5-2', 'ch3-3-1', 'ch3-6-2'];
const routesToCheck = requestedRoute ? [requestedRoute] : pilotRoutes;

assert.deepStrictEqual(Array.from(specs.pilotRoutes), pilotRoutes);

const states = {
  'ch1-2-3': { f1: { x: 120, y: -30 }, f2: { x: 40, y: 90 }, resultant: { x: 160, y: 60 } },
  'ch1-5-3': { alpha: 20, mu: 0.42 },
  'ch2-1-2': { t: 1.2, x: 54 * Math.sin(1.2), v: 54 * Math.cos(1.2), a: -54 * Math.sin(1.2) },
  'ch2-5-2': { omega: 1.4, point: { x: 220, y: 120 }, ic: { x: 180, y: 250 }, velocity: { vx: 182, vy: 56 } },
  'ch3-3-1': { m: 2, k: 18, x: 0.238834, v: -0.22164, x0: 0.25, v0: 0, t: 0.1 },
  'ch3-6-2': { m1: 2, m2: 3, v1: 4, v2: -1, e: 0.7 },
};

for (const route of routesToCheck) {
  const spec = specs.get(route);
  assert.ok(spec, `${route}: invariant spec missing`);
  const result = evaluators.evaluateRoute(route, states[route]);
  assert.strictEqual(result.routeId, route);
  assert.strictEqual(result.status, 'pass', `${route}: expected pass, got ${result.status} residual ${result.residual}`);
  assert.ok(result.residual <= spec.tolerance, `${route}: residual exceeds tolerance`);
}

const boundary = evaluators.evaluateRoute('ch1-5-3', { alpha: Math.atan(0.5) * 180 / Math.PI, mu: 0.5 });
approx(boundary.values.margin, 0, 1e-12, 'friction boundary margin');
assert.strictEqual(boundary.status, 'pass');

const warned = evaluators.evaluateRoute('ch1-2-3', {
  f1: { x: 100, y: 0 },
  f2: { x: 0, y: 50 },
  resultant: { x: 100.000002, y: 50 },
});
assert.strictEqual(warned.status, 'warn');

const missingResultant = evaluators.evaluateRoute('ch1-2-3', {
  f1: { x: 100, y: 0 },
  f2: { x: 0, y: 50 },
});
assert.strictEqual(missingResultant.status, 'fail');
assert.strictEqual(missingResultant.values.missing, 'f1/f2/resultant');

const missingAcceleration = evaluators.evaluateRoute('ch2-1-2', { t: 0, x: 0, v: 54 });
assert.strictEqual(missingAcceleration.status, 'fail');
assert.strictEqual(missingAcceleration.values.missing, 'x/v/a');

const unknown = evaluators.evaluateRoute('ch1-1-3', {});
assert.strictEqual(unknown.status, 'none');
assert.strictEqual(unknown.residual, 0);

const collision = evaluators.evaluateRoute('ch3-6-2', { m1: 1, m2: 1, v1: 10, v2: 0, e: 1 });
approx(collision.values.post.v1, 0, 1e-9, 'elastic v1');
approx(collision.values.post.v2, 10, 1e-9, 'elastic v2');

const collision2d = evaluators.evaluateRoute('ch3-6-2', {
  m1: 1,
  m2: 1,
  e: 1,
  ball1: { x: 150, y: 180, vx: 8, vy: 1 },
  ball2: { x: 380, y: 180, vx: -3, vy: -1 },
  momentumBefore: { x: 5, y: 0 },
  momentumAfter: { x: 5, y: 0 },
  restitutionResidual: 0,
});
assert.strictEqual(collision2d.status, 'pass');
approx(collision2d.values.momentumBefore.x, collision2d.values.momentumAfter.x, 1e-9, 'collision2d momentum x');
approx(collision2d.values.momentumBefore.y, collision2d.values.momentumAfter.y, 1e-9, 'collision2d momentum y');

const bogusRuntimeMomentum = evaluators.evaluateRoute('ch3-6-2', {
  m1: 1,
  m2: 1,
  e: 1,
  ball1: { x: 150, y: 180, vx: 8, vy: 1 },
  ball2: { x: 380, y: 180, vx: -3, vy: -1 },
  momentumBefore: { x: 999, y: 0 },
  momentumAfter: { x: -999, y: 0 },
  restitutionResidual: 0,
});
assert.strictEqual(bogusRuntimeMomentum.status, 'fail');

const scalarRuntimeMomentum = evaluators.evaluateRoute('ch3-6-2', {
  m1: 1,
  m2: 1,
  e: 1,
  ball1: { x: 150, y: 180, vx: 8, vy: 1 },
  ball2: { x: 380, y: 180, vx: -3, vy: -1 },
  pBefore: 999,
  pAfter: -999,
});
assert.strictEqual(scalarRuntimeMomentum.status, 'fail');
assert.strictEqual(scalarRuntimeMomentum.values.missing, 'signed vector momentum');

console.log('simulation-invariants: PASS');
