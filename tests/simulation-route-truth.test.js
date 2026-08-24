'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const sim2Manifest = require('../js/sim2/sim2-route-manifest.js');
const sim3Manifest = require('../js/sim3/sim3-route-manifest.js');
const contracts = require('./support/simulation-route-contracts.js');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function scriptSources(relativePath) {
  return [...read(relativePath).matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)]
    .map(match => match[1].replace(/^(?:\.\.\/)+/, ''));
}

function sourceFiles(directory, suffix) {
  const absolute = path.join(ROOT, directory);
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap(entry => {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(relative, suffix);
    return entry.name.endsWith(suffix) ? [relative] : [];
  }).sort();
}

function loadScripts(descriptors, setup = {}) {
  const root = { ...setup };
  root.window = root;
  vm.createContext(root);
  for (const descriptor of descriptors) {
    vm.runInContext(read(descriptor.source), root, { filename: descriptor.source });
  }
  return root;
}

assert.strictEqual(sim2Manifest.length, 25, 'Sim2 manifest must contain exactly 25 routes');
assert.strictEqual(sim3Manifest.length, 10, 'Sim3 manifest must contain exactly 10 routes');
assert.strictEqual(contracts.all.length, 35, 'contract table must contain exactly 35 routes');
assert.doesNotThrow(() => contracts.validateContracts({ sim2: contracts.sim2, sim3: contracts.sim3 }));

assert.throws(
  () => contracts.validateContracts({ sim2: [...contracts.sim2, contracts.sim2[0]], sim3: contracts.sim3 }),
  /duplicate route id/i
);
assert.throws(
  () => contracts.validateContracts({ sim2: contracts.sim2.slice(1), sim3: contracts.sim3 }),
  /missing Sim2 route/i
);
assert.throws(
  () => contracts.validateContracts({
    sim2: contracts.sim2.map((item, index) => index ? item : { ...item, id: 'ch9-9-9' }),
    sim3: contracts.sim3,
  }),
  /unknown Sim2 route/i
);
assert.throws(
  () => contracts.validateContracts({
    sim2: contracts.sim2.map((item, index) => index ? item : { ...item, source: '../escape.js' }),
    sim3: contracts.sim3,
  }),
  /unsafe source path/i
);

const sim2Root = loadScripts([
  { source: 'js/sim2/registry.js' },
  ...contracts.sim2,
]);
for (const descriptor of contracts.sim2) {
  assert.strictEqual(typeof descriptor.resolve(sim2Root), 'function', `${descriptor.id} must resolve a Sim2 factory`);
}

const sim3Root = loadScripts(contracts.sim3);
for (const descriptor of contracts.sim3) {
  assert.strictEqual(typeof descriptor.resolve(sim3Root), 'function', `${descriptor.id} must resolve a Sim3 adapter factory`);
}

assert.deepStrictEqual(
  sourceFiles('js/sim2/sims', '.js'),
  contracts.sim2.map(item => item.source).sort(),
  'Sim2 source tree and contracts must match exactly'
);
assert.deepStrictEqual(
  sourceFiles('js/sim3/sims', '-3d.js'),
  contracts.sim3.map(item => item.source).sort(),
  'Sim3 source tree and contracts must match exactly'
);

const loaderRoot = { window: { addEventListener() {}, location: { hash: '' } }, document: {} };
loaderRoot.window.window = loaderRoot.window;
vm.runInNewContext(`${read('js/loader.js')}\n;this.__PAGE_MAP__ = PAGE_MAP;`, loaderRoot);
for (const descriptor of contracts.all) {
  assert.ok(Object.hasOwn(loaderRoot.__PAGE_MAP__, descriptor.baseRouteId), `${descriptor.baseRouteId} missing from PAGE_MAP`);
}

const productionScripts = scriptSources('index.html');
assert.ok(productionScripts.includes('js/sim2/sim2-route-manifest.js'), 'production must load Sim2 manifest');
assert.ok(productionScripts.includes('js/sim3/sim3-route-manifest.js'), 'production must load Sim3 manifest');
for (const descriptor of contracts.sim3) {
  assert.ok(productionScripts.includes(descriptor.source), `production missing ${descriptor.source}`);
}

for (const chapter of [1, 2, 3]) {
  const fixtureScripts = scriptSources(`tests/fixtures/sim2-ch${chapter}.html`);
  assert.ok(fixtureScripts.includes('js/sim2/sim2-route-manifest.js'), `chapter ${chapter} fixture missing Sim2 manifest`);
  assert.ok(fixtureScripts.includes('js/sim3/sim3-route-manifest.js'), `chapter ${chapter} fixture missing Sim3 manifest`);
  for (const descriptor of contracts.sim3.filter(item => item.chapter === chapter)) {
    assert.ok(fixtureScripts.includes(descriptor.source), `chapter ${chapter} fixture missing ${descriptor.source}`);
  }
}

console.log('simulation-route-truth: PASS (25 Sim2 / 10 Sim3 / 35 contracts)');
