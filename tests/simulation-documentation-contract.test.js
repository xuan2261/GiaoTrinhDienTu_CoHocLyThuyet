'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const DOCS = [
  'README.md',
  'docs/system-architecture.md',
  'docs/code-standards.md',
  'docs/design-guidelines.md',
  'docs/codebase-summary.md',
  'docs/deployment-guide.md',
  'docs/project-roadmap.md',
  'docs/project-changelog.md',
  'docs/simulation-4d.md'
];
const REQUIRED_PATHS = [
  'js/sim2/core/animation-clock.js',
  'js/sim2/core/sim-shell.js',
  'js/sim2/sim2-route-manifest.js',
  'js/sim3/core/coordinate-system.js',
  'js/sim3/core/three-shell.js',
  'lib/three/three.umd.min.js',
  'tools/sim-validation/validate-simulation-drift.js',
  'plans/260713-1524-fix-all-sim2-sim3-defects-deep-tdd/phase-11-evidence.json'
];
const REQUIRED_SCRIPTS = [
  'validate:simulation-drift',
  'test:simulation-evidence',
  'test:sim:physics',
  'test:sim:mount',
  'test:sim:release',
  'test:sim:release:full',
  'test:sim:release:soak',
  'test:sim3:pilot',
  'test:sim3:core'
];

function text(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

test('simulation documentation files and referenced implementation paths exist', () => {
  for (const rel of DOCS.concat(REQUIRED_PATHS)) {
    assert.ok(fs.existsSync(path.join(ROOT, rel)), `missing documented path: ${rel}`);
  }
  assert.ok(text('README.md').split(/\r?\n/).length < 300, 'README must remain concise');
});

test('documented simulation commands exist in package.json', () => {
  for (const script of REQUIRED_SCRIPTS) {
    assert.strictEqual(typeof pkg.scripts[script], 'string', `missing npm script: ${script}`);
  }
});

test('architecture and policy docs describe the final contracts without stale blockers', () => {
  const combined = DOCS.map(text).join('\n');
  for (const token of [
    'fixed-step',
    '(x,y) -> (x,elevation,-y)',
    '(x,y) -> (x,y,depth)',
    'test:sim:release:full',
    'test:sim:release:soak',
    '--require-verified',
    'independent numeric/geometric oracle'
  ]) assert.ok(combined.includes(token), `missing documented contract: ${token}`);
  assert.ok(!text('docs/simulation-4d.md').includes('Manifest hiện chưa tồn tại'), 'stale phase-11 blocker');
});
