'use strict';

const path = require('path');
const sim2Manifest = require('../../js/sim2/sim2-route-manifest.js');
const sim3Manifest = require('../../js/sim3/sim3-route-manifest.js');

const physicsTests = {
  1: 'tests/sim2-ch1-physics.test.js',
  2: 'tests/sim2-ch2-physics.test.js',
  3: 'tests/sim2-ch3-physics.test.js',
};
const mountTests = {
  1: 'tests/sim2-ch1-mount.spec.js',
  2: 'tests/sim2-ch2-mount.spec.js',
  3: 'tests/sim2-ch3-mount.spec.js',
};

const sim2 = sim2Manifest.map(route => ({
  id: route.id,
  baseRouteId: route.id,
  chapter: route.chapter,
  engine: 'sim2',
  source: `js/sim2/sims/ch${route.chapter}/${route.id}.js`,
  scenarioId: `${route.id}:mounted-physics-transition`,
  interaction: 'mounted controls and state transition',
  oracle: { kind: 'independent-test', path: physicsTests[route.chapter] },
  mountEvidence: mountTests[route.chapter],
  resolve(root) { return root.SIM_MAP && root.SIM_MAP[route.id]; },
}));

const sim3 = sim3Manifest.map(route => ({
  ...route,
  engine: 'sim3',
  scenarioId: `${route.id}:adapter-state-fallback-disposal`,
  interaction: '2D/3D mode toggle and adapter state update',
  oracle: { kind: 'adapter-contract', path: 'tests/sim3-pilot-fallback-dispose.spec.js' },
  resolve(root) {
    const adapter = root[route.adapterGlobal];
    return adapter && adapter.create;
  },
}));

function routeKeys(items) {
  return items.map(item => item.id);
}

function assertExactRoutes(label, actual, expected) {
  const seen = new Set();
  for (const id of actual) {
    if (seen.has(id)) throw new Error(`duplicate route id in ${label}: ${id}`);
    seen.add(id);
  }
  const expectedSet = new Set(expected);
  const missing = expected.filter(id => !seen.has(id));
  const unknown = actual.filter(id => !expectedSet.has(id));
  const problems = [];
  if (missing.length) problems.push(`missing ${label} route: ${missing.join(', ')}`);
  if (unknown.length) problems.push(`unknown ${label} route: ${unknown.join(', ')}`);
  if (problems.length) throw new Error(problems.join('; '));
}

function validateDescriptor(descriptor) {
  if (!/^ch\d-\d-\d$/.test(descriptor.id)) throw new Error(`invalid route id: ${descriptor.id}`);
  if (![1, 2, 3].includes(descriptor.chapter)) throw new Error(`invalid chapter: ${descriptor.id}`);
  if (!descriptor.scenarioId || typeof descriptor.resolve !== 'function') {
    throw new Error(`non-executable contract descriptor: ${descriptor.id}`);
  }
  if (!descriptor.oracle || !descriptor.oracle.kind || !descriptor.oracle.path) {
    throw new Error(`missing oracle contract: ${descriptor.id}`);
  }
  const normalized = descriptor.source.replace(/\\/g, '/');
  if (path.isAbsolute(descriptor.source) || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`unsafe source path: ${descriptor.source}`);
  }
  const prefix = descriptor.engine === 'sim2' ? 'js/sim2/sims/' : 'js/sim3/sims/';
  if (!normalized.startsWith(prefix)) throw new Error(`unsafe source path: ${descriptor.source}`);
}

function validateContracts(candidate) {
  if (!candidate || !Array.isArray(candidate.sim2) || !Array.isArray(candidate.sim3)) {
    throw new Error('simulation contracts must provide Sim2 and Sim3 arrays');
  }
  assertExactRoutes('Sim2', routeKeys(candidate.sim2), routeKeys(sim2Manifest));
  assertExactRoutes('Sim3', routeKeys(candidate.sim3), routeKeys(sim3Manifest));
  candidate.sim2.forEach(validateDescriptor);
  candidate.sim3.forEach(descriptor => {
    validateDescriptor(descriptor);
    if (!routeKeys(sim2Manifest).includes(descriptor.baseRouteId)) {
      throw new Error(`Sim3 base route missing from Sim2 manifest: ${descriptor.id}`);
    }
    if (!descriptor.adapterGlobal) throw new Error(`missing Sim3 adapter global: ${descriptor.id}`);
  });
  return true;
}

module.exports = { sim2, sim3, all: [...sim2, ...sim3], validateContracts };
