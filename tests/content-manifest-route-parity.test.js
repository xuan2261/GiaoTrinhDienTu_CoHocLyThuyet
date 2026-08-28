const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PYTHON = process.env.PYTHON || 'python';

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-route-'));
  fs.cpSync(ROOT, dir, { recursive: true, filter: (source) => !source.includes(`${path.sep}.git`) });
  return dir;
}

function run(root, tool) {
  return childProcess.spawnSync(PYTHON, [path.join(root, 'tools', tool)], { cwd: root, encoding: 'utf8' });
}

function expectFailure(mutate, message) {
  const root = fixture();
  try {
    mutate(root);
    const result = run(root, 'validate_content_manifest.py');
    assert.notStrictEqual(result.status, 0, 'validator unexpectedly passed');
    assert.match(`${result.stdout}\n${result.stderr}`, message);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const bundleRoot = fixture();
try {
  const loader = path.join(bundleRoot, 'js', 'loader.js');
  fs.writeFileSync(loader, fs.readFileSync(loader, 'utf8').replace(
    "  'ch1-1-1': 'chapters/ch1/muc-I-1.html',",
    "  'ch1-1-1': 'chapters/ch1/not-found.html',",
  ));
  const result = run(bundleRoot, 'bundle_pages.py');
  assert.notStrictEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /ch1-1-1.*not-found|not-found.*ch1-1-1/i);
} finally {
  fs.rmSync(bundleRoot, { recursive: true, force: true });
}

const blankRouteRoot = fixture();
try {
  const loader = path.join(blankRouteRoot, 'js', 'loader.js');
  fs.writeFileSync(loader, fs.readFileSync(loader, 'utf8').replace(
    "  'ch1-1-1': 'chapters/ch1/muc-I-1.html',",
    "  'ch1-1-1': '',",
  ));
  const result = run(blankRouteRoot, 'bundle_pages.py');
  assert.notStrictEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /blank PAGE_MAP path.*ch1-1-1/i);
} finally {
  fs.rmSync(blankRouteRoot, { recursive: true, force: true });
}
expectFailure((root) => {
  const file = path.join(root, 'js', 'loader.js');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(
    "  'ch1-1-1': 'chapters/ch1/muc-I-1.html',",
    "  'ch1-1-1': 'chapters/ch1/muc-I-1.html',\n  'ch1-1-1': 'chapters/ch1/muc-I-1.html',",
  ));
}, /duplicate route id/i);

expectFailure((root) => {
  const file = path.join(root, 'data', 'content-manifest.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.routes[0].routeId = data.routes[1].routeId;
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}, /duplicate route id/i);

expectFailure((root) => {
  const file = path.join(root, 'js', 'pages.js');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('PAGES["ch1-1-1"]', 'PAGES["orphan-route"]'));
}, /bundle.*PAGE_MAP|orphan/i);

const rootA = fixture();
const rootB = fixture();
try {
  assert.strictEqual(run(rootA, 'build_content_manifest.py').status, 0);
  assert.strictEqual(run(rootB, 'build_content_manifest.py').status, 0);
  assert.strictEqual(
    fs.readFileSync(path.join(rootA, 'data', 'content-manifest.json'), 'utf8'),
    fs.readFileSync(path.join(rootB, 'data', 'content-manifest.json'), 'utf8'),
  );
} finally {
  fs.rmSync(rootA, { recursive: true, force: true });
  fs.rmSync(rootB, { recursive: true, force: true });
}

expectFailure((root) => {
  fs.appendFileSync(path.join(root, 'data', 'chapter-reference.json'), '\n');
}, /chapter reference.*hash/i);

console.log('content manifest route parity: PASS');
