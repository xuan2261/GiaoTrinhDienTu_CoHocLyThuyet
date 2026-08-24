'use strict';

const assert = require('assert');
const contracts = require('./support/simulation-route-contracts.js');
const { validateProbe } = require('../tools/sim-probe/probe-validation.js');

const NOW = Date.now();
function keyFor(route) { return route.engine === 'sim3' ? `${route.id}#sim3` : route.id; }
function artifact() {
  return {
    runId: '123e4567-e89b-12d3-a456-426614174000', generatedAt: new Date(NOW).toISOString(),
    routeCount: contracts.all.length,
    routes: contracts.all.map(route => ({
      runId: '123e4567-e89b-12d3-a456-426614174000', route: keyFor(route), engine: route.engine,
      chapter: route.chapter, baseId: route.baseRouteId,
      channel: route.engine === 'sim3' ? 'sim3-webgl' : 'sim2-dom', mounted: true, pageErrors: [],
      probeA: [{ control: 'slider:x', driven: true, deltaNonZero: true }],
      probeB: { feasible: true, items: [{ control: 'x', observedSign: '+', match: true }] }
    }))
  };
}
function rejects(mutate, message) {
  const payload = artifact(); mutate(payload);
  assert.throws(() => validateProbe(payload, NOW), message);
}

assert.strictEqual(validateProbe(artifact(), NOW), true);
rejects(payload => payload.routes.pop(), 'reject missing route');
rejects(payload => payload.routes.push(payload.routes[0]), 'reject duplicate route');
rejects(payload => { payload.routes[0].route = 'unknown'; }, 'reject unknown route');
rejects(payload => { payload.routes[0].probeA[0].deltaNonZero = false; }, 'reject no-op');
rejects(payload => { payload.routes[0].pageErrors.push('error'); }, 'reject page errors');
rejects(payload => { const route = payload.routes.find(record => record.engine === 'sim3'); route.channel = 'fallback-2d'; }, 'reject fallback-only Sim3 evidence');
rejects(payload => { payload.routes[0].probeB.items[0].match = false; }, 'reject incorrect signs');
rejects(payload => { payload.generatedAt = new Date(NOW - 86400001).toISOString(); }, 'reject stale artifact');
console.log(`sim-probe-validation: PASS (${contracts.all.length} routes)`);
