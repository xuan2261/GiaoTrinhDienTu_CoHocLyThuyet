const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PYTHON = process.env.PYTHON || 'python';
const BUILDER = path.join(ROOT, 'tools', 'build_content_manifest.py');
const VALIDATOR = path.join(ROOT, 'tools', 'validate_content_manifest.py');

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-manifest-'));
  fs.cpSync(ROOT, dir, { recursive: true, filter: (source) => !source.includes(`${path.sep}.git`) });
  return dir;
}

function run(root, script, args = []) {
  return childProcess.spawnSync(PYTHON, [script, ...args], { cwd: root, encoding: 'utf8' });
}

function expectFailure(mutate, message) {
  const root = fixture();
  try {
    mutate(root);
    const result = run(root, path.join(root, 'tools', 'validate_content_manifest.py'));
    assert.notStrictEqual(result.status, 0, 'validator unexpectedly passed');
    assert.match(`${result.stdout}\n${result.stderr}`, message);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const canonicalRoot = fixture();
try {
  const built = run(canonicalRoot, path.join(canonicalRoot, 'tools', 'build_content_manifest.py'));
  assert.strictEqual(built.status, 0, built.stderr);
  const checked = run(canonicalRoot, path.join(canonicalRoot, 'tools', 'validate_content_manifest.py'));
  assert.strictEqual(checked.status, 0, checked.stderr);
  const manifest = JSON.parse(fs.readFileSync(path.join(canonicalRoot, 'data', 'content-manifest.json'), 'utf8'));
  assert.strictEqual(manifest.schemaVersion, 1);
  assert.ok(manifest.source.logicalPath && !path.isAbsolute(manifest.source.logicalPath));
  assert.match(manifest.source.sha256, /^[a-f0-9]{64}$/);
  assert.deepStrictEqual(manifest.generator, { name: 'tools/build_content_manifest.py', version: 1 });
  assert.match(manifest.contentHash, /^[a-f0-9]{64}$/);
  assert.ok(manifest.routes.length > 0);
  const docxManifest = JSON.parse(fs.readFileSync(path.join(canonicalRoot, 'tools', 'docx_site_manifest.json'), 'utf8'));
  assert.strictEqual(docxManifest.schemaVersion, 1);
  assert.match(docxManifest.source.sha256, /^[a-f0-9]{64}$/);
  assert.deepStrictEqual(docxManifest.generator, { name: 'tools/extract_docx.py', version: 1 });
} finally {
  fs.rmSync(canonicalRoot, { recursive: true, force: true });
}

expectFailure((root) => {
  const file = path.join(root, 'data', 'content-manifest.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.source.logicalPath = 'C:/absolute.docx';
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}, /absolute|logical path/i);

expectFailure((root) => {
  const file = path.join(root, 'data', 'content-manifest.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  delete data.generator;
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}, /generator/i);

expectFailure((root) => {
  const file = path.join(root, 'data', 'content-manifest.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  delete data.source.sha256;
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}, /source.*missing.*sha256/i);

expectFailure((root) => {
  const file = path.join(root, 'data', 'content-manifest.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  delete data.schemaVersion;
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}, /schemaVersion/i);

expectFailure((root) => {
  const file = path.join(root, 'data', 'content-manifest.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.unexpected = true;
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}, /unexpected fields/i);

expectFailure((root) => {
  const file = path.join(root, 'data', 'content-manifest.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.routes[0].hasQuiz = 'false';
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}, /hasQuiz must be boolean/i);

console.log('content manifest schema: PASS');
