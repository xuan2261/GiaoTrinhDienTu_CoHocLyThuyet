const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const context = { console, window: {} };
context.window.window = context.window;
vm.createContext(context);
[
  'js/sim-route-invariants.js',
  'js/sim-invariant-evaluators.js',
  'js/sim-promax-readouts.js',
  'js/sim-promax-mini-graph.js',
].forEach(script => vm.runInContext(fs.readFileSync(path.join(ROOT, script), 'utf8'), context));

const readouts = context.window.SimPromaxReadouts;
const graphs = context.window.SimPromaxMiniGraph;
const evaluators = context.window.SimInvariantEvaluators;

const formula = readouts.formatFormula({
  template: 'R = sqrt(F1^2 + F2^2 + 2 F1 F2 cos(alpha))',
  values: { F1: 120, F2: 80, alpha: 60 },
  result: 174.4,
  unit: 'N',
});
assert.ok(formula.text.includes('R ='));
assert.ok(formula.text.includes('174.4 N'));
assert.ok(formula.summary.includes('F1=120'));

const line = graphs.buildLineSummary([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: -1 }], 'E');
assert.strictEqual(line.count, 3);
assert.strictEqual(line.minY, -1);
assert.strictEqual(line.maxY, 3);
assert.ok(line.summary.includes('E'));

const bars = graphs.buildBeforeAfterSummary({ before: 12, after: 11.98, label: 'p' });
assert.ok(bars.residual <= 0.02 + Number.EPSILON);
assert.ok(bars.summary.includes('p'));
assert.strictEqual(bars.bars.length, 2);

const frictionSummary = readouts.invariantFormula('ch1-5-3', {
  values: { mu: 0.42, alpha: 20, margin: 0.056 },
  residual: 0,
});
assert.ok(frictionSummary.summary.includes('mu=0.42'));
assert.ok(frictionSummary.summary.includes('0.06'));

const collisionSummary = readouts.invariantFormula('ch3-6-2', {
  values: { momentumBefore: 5, momentumAfter: 5 },
  residual: 0,
});
assert.ok(collisionSummary.summary.includes('p0=5'));
assert.ok(collisionSummary.summary.includes('p1=5'));

const graphSummary = graphs.routeSummary('ch3-6-2', {}, {
  values: { momentumBefore: { x: 3, y: 4 }, momentumAfter: { x: 0, y: 5 } },
});
assert.ok(graphSummary.summary.includes('động lượng'));
assert.strictEqual(graphSummary.bars.length, 2);

const collision2dOutcome = evaluators.evaluateRoute('ch3-6-2', {
  m1: 2,
  m2: 3,
  e: 1,
  ball1: { x: 0, y: 0, vx: 3, vy: 4 },
  ball2: { x: 10, y: 0, vx: -1, vy: 2 },
});
const collision2dFormula = readouts.invariantFormula('ch3-6-2', collision2dOutcome);
assert.ok(!collision2dFormula.summary.includes('[object Object]'));
assert.ok(collision2dFormula.summary.includes('p0='));
assert.ok(collision2dFormula.summary.includes('('));

const pilotStates = {
  'ch1-2-3': { f1: { x: 120, y: -30 }, f2: { x: 40, y: 90 }, resultant: { x: 160, y: 60 } },
  'ch1-5-3': { alpha: 20, mu: 0.42 },
  'ch2-1-2': { t: 1.2, x: 54 * Math.sin(1.2), v: 54 * Math.cos(1.2), a: -54 * Math.sin(1.2) },
  'ch2-5-2': { omega: 1.4, point: { x: 220, y: 120 }, ic: { x: 180, y: 250 }, velocity: { vx: 182, vy: 56 } },
  'ch3-3-1': { m: 2, k: 18, x: 0.238834, v: -0.22164, x0: 0.25, v0: 0 },
  'ch3-6-2': { m1: 2, m2: 3, v1: 4, v2: -1, e: 0.7 },
};
for (const route of Object.keys(pilotStates)) {
  const summary = readouts.invariantFormula(route, evaluators.evaluateRoute(route, pilotStates[route])).summary;
  assert.ok(!summary.includes('[object Object]'), `${route}: summary must not leak object string`);
}

const rendererSources = {
  ch2Graph: fs.readFileSync(path.join(ROOT, 'js/sims/ch2/ch2-trajectory-graph-renderers.js'), 'utf8'),
  ch2Ic: fs.readFileSync(path.join(ROOT, 'js/sims/ch2/ch2-instant-center-plane-motion-renderers.js'), 'utf8'),
  ch3Spring: fs.readFileSync(path.join(ROOT, 'js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js'), 'utf8'),
  ch3Collision: fs.readFileSync(path.join(ROOT, 'js/sims/ch3/ch3-collision-exercises-renderers.js'), 'utf8'),
};
assert.ok(rendererSources.ch2Graph.includes('d && d.invariant && d.invariant.values'));
assert.ok(rendererSources.ch2Ic.includes('values.perpendicularResidual'));
assert.ok(!rendererSources.ch3Spring.includes('state.invariant'));
assert.ok(rendererSources.ch3Spring.includes('values.energyDrift'));
assert.ok(rendererSources.ch3Collision.includes('d && d.invariant && d.invariant.residual'));

console.log('promax-formula-graph: PASS');
