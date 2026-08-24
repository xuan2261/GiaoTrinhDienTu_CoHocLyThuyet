'use strict';

const fs = require('fs');
const path = require('path');
const contracts = require('../../tests/support/simulation-route-contracts.js');

function fail(message) { throw new Error(`invalid simulation probe: ${message}`); }
function exact(actual, expected) {
  if (!Array.isArray(actual)) fail('routes must be an array');
  const seen = new Set();
  for (const key of actual) {
    if (seen.has(key)) fail(`duplicate route: ${key}`);
    seen.add(key);
  }
  const missing = expected.filter(key => !seen.has(key));
  const unknown = actual.filter(key => !expected.includes(key));
  if (missing.length || unknown.length) fail(`route mismatch; missing=${missing.join(',') || '-'} unknown=${unknown.join(',') || '-'}`);
}
function keyFor(route) { return route.engine === 'sim3' ? `${route.id}#sim3` : route.id; }

function validateProbe(payload, now = Date.now()) {
  if (!payload || typeof payload !== 'object') fail('artifact object required');
  if (!/^[0-9a-f-]{36}$/i.test(payload.runId || '')) fail('runId must be a UUID');
  const generatedAt = Date.parse(payload.generatedAt);
  if (!Number.isFinite(generatedAt) || generatedAt > now + 60000 || now - generatedAt > 24 * 60 * 60 * 1000) fail('generatedAt must be fresh');
  contracts.validateContracts(contracts);
  const expected = contracts.all.map(keyFor);
  exact(payload.routes.map(route => route && route.route), expected);
  if (payload.routeCount !== expected.length) fail(`routeCount must equal ${expected.length}`);
  for (const route of payload.routes) {
    if (route.runId !== payload.runId) fail(`runId mismatch: ${route.route}`);
    const descriptor = contracts.all.find(candidate => keyFor(candidate) === route.route);
    if (route.engine !== descriptor.engine || route.chapter !== descriptor.chapter || route.baseId !== descriptor.baseRouteId) fail(`manifest metadata mismatch: ${route.route}`);
    if (route.channel === 'mount-error') fail(`mount channel error: ${route.route}`);
    if (descriptor.engine === 'sim3' && route.channel !== 'sim3-webgl') fail(`Sim3 WebGL evidence required: ${route.route}`);
    if (!route.mounted || route.finding || (route.pageErrors && route.pageErrors.length)) fail(`mount/page error: ${route.route}`);
    if (!Array.isArray(route.probeA) || !route.probeA.length) fail(`missing liveness evidence: ${route.route}`);
    for (const probe of route.probeA) {
      if (!probe.driven || !probe.deltaNonZero) fail(`no-op control: ${route.route}/${probe.control}`);
    }
    if (!route.probeB || typeof route.probeB !== 'object') fail(`missing sign evidence: ${route.route}`);
    if (route.probeB.feasible) {
      if (!Array.isArray(route.probeB.items) || !route.probeB.items.length) fail(`empty sign evidence: ${route.route}`);
      for (const item of route.probeB.items) {
        if (item.error || item.match !== true || !['+', '-'].includes(item.observedSign)) fail(`invalid sign evidence: ${route.route}/${item.control || item.field}`);
      }
    } else if (!route.probeB.bSkipped || !route.probeB.reason) {
      fail(`invalid skipped sign evidence: ${route.route}`);
    }
  }
  return true;
}

function main() {
  const input = process.argv[2] || path.resolve(__dirname, '../../plans/260608-1559-sim-fullquality-triage/visuals/interaction-probe.json');
  const payload = JSON.parse(fs.readFileSync(input, 'utf8'));
  validateProbe(payload);
  process.stdout.write(`simulation probe valid: ${payload.routes.length} routes\n`);
}

if (require.main === module) main();
module.exports = { validateProbe };
