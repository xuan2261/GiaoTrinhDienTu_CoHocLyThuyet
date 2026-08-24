'use strict';

const assert = require('assert');
const scripts = require('../package.json').scripts;

const FAST_GATES = [
  'test:sim:physics',
  'test:sim:mount',
  'test:app',
  'test:content',
  'test:quiz',
  'test:sim:production',
  'test:sim:lifecycle',
  'test:sim:responsive',
  'test:sim3:pilot',
  'test:sim:visual:unit',
  'test:sim:probe:unit'
];
const FULL_GATES = [
  'test:sim:release',
  'test:sim:visual:capture',
  'tools/sim2-visual/validate-capture.js',
  'tools/sim2-visual/build-contact-sheet.js',
  'test:sim3:visual:capture',
  'tools/sim3-visual/validate-capture.js',
  'test:sim:probe:strict',
  'test:sim:visual:baseline'
];

for (const gate of FAST_GATES) assert.ok(scripts['test:sim:release'].includes(gate), `fast release includes ${gate}`);
for (const gate of FULL_GATES) assert.ok(scripts['test:sim:release:full'].includes(gate), `full release includes ${gate}`);
assert.strictEqual(
  scripts['test:sim:release:soak'],
  'npm run test:sim:release && npm run test:sim:release && npm run test:sim:release',
  'soak runs the retry-free release exactly three times'
);

console.log('simulation-release-scripts: PASS');
