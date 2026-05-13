const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const context = { console, window: {}, localStorage: { setItem() { throw new Error('unexpected persistence'); } } };
context.window.window = context.window;
context.window.localStorage = context.localStorage;
vm.createContext(context);
[
  'js/sim-route-invariants.js',
  'js/sim-invariant-evaluators.js',
  'js/sim-promax-challenges.js',
].forEach(script => vm.runInContext(fs.readFileSync(path.join(ROOT, script), 'utf8'), context));

const challenges = context.window.SimPromaxChallenges;
assert.strictEqual(challenges.pilotRoutes.length, 6);

for (const routeId of challenges.pilotRoutes) {
  const spec = challenges.get(routeId);
  assert.ok(spec.prompt.length > 10, `${routeId}: prompt missing`);
  assert.ok(spec.success.length > 5, `${routeId}: success missing`);
  assert.ok(spec.hint.length > 5, `${routeId}: hint missing`);
  const ok = challenges.evaluate(routeId, { status: 'pass', residual: 0 });
  assert.strictEqual(ok.state, 'success', `${routeId}: pass invariant should complete challenge`);
  const retry = challenges.evaluate(routeId, { status: 'fail', residual: spec.tolerance * 3 });
  assert.strictEqual(retry.state, 'retry', `${routeId}: fail invariant should ask retry`);
}

console.log('promax-challenge-mode: PASS');
