const assert = require('assert');
const childProcess = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PYTHON = process.env.PYTHON || 'python';
const RELEASE = path.join(ROOT, 'tools', 'release', 'release.py');
const VALIDATE = path.join(ROOT, 'tools', 'release', 'validate_release.py');
const VERSION = '2026.08.21-test';
const EPOCH = '1787270400';

function run(script, args) {
  return childProcess.spawnSync(PYTHON, [script, ...args], { cwd: ROOT, encoding: 'utf8' });
}

function build(output) {
  const result = run(RELEASE, ['--output-dir', output, '--version', VERSION, '--epoch', EPOCH]);
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  return JSON.parse(fs.readFileSync(path.join(output, 'release-summary.json'), 'utf8'));
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'release-contract-'));
try {
  const first = build(path.join(temp, 'first'));
  const second = build(path.join(temp, 'second'));
  const firstPackage = path.join(temp, 'first', first.package.path);
  const secondPackage = path.join(temp, 'second', second.package.path);
  assert.strictEqual(sha256(firstPackage), sha256(secondPackage), 'release ZIP must be byte-for-byte reproducible');
  assert.strictEqual(first.package.sha256, sha256(firstPackage));
  assert.ok(first.package.sizeBytes < 120 * 1024 * 1024, 'release package exceeds 120 MiB policy');

  const valid = run(VALIDATE, ['--package', firstPackage, '--policy', path.join(ROOT, 'data', 'release-policy.json')]);
  assert.strictEqual(valid.status, 0, valid.stdout + valid.stderr);

  const list = run(VALIDATE, ['--package', firstPackage, '--list-json']);
  assert.strictEqual(list.status, 0, list.stdout + list.stderr);
  const entries = JSON.parse(list.stdout);
  assert.deepStrictEqual(entries, [...entries].sort(), 'ZIP entries must be sorted');
  for (const required of ['index.html', 'release-manifest.json', 'SHA256SUMS', 'THIRD_PARTY_NOTICES.txt']) {
    assert.ok(entries.includes(required), `package must include ${required}`);
  }
  for (const excluded of ['CoHocLyThuyet_Full_New.docx', 'package-lock.json', 'tests/release-pipeline-contract.test.js']) {
    assert.ok(!entries.includes(excluded), `package must exclude ${excluded}`);
  }

  const badPolicy = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'release-policy.json'), 'utf8'));
  badPolicy.requiredPaths.push('missing-required-file.bin');
  const badPolicyPath = path.join(temp, 'bad-policy.json');
  fs.writeFileSync(badPolicyPath, JSON.stringify(badPolicy), 'utf8');
  const missing = run(RELEASE, ['--output-dir', path.join(temp, 'missing'), '--version', VERSION, '--epoch', EPOCH, '--policy', badPolicyPath]);
  assert.notStrictEqual(missing.status, 0, missing.stdout + missing.stderr);
  assert.match(missing.stdout + missing.stderr, /missing required release path/i);

  const tampered = path.join(temp, 'tampered-stage');
  fs.cpSync(path.join(temp, 'first', first.staging.path), tampered, { recursive: true });
  fs.appendFileSync(path.join(tampered, 'index.html'), '\n<!-- tampered -->\n', 'utf8');
  const rejected = run(VALIDATE, ['--staging', tampered]);
  assert.notStrictEqual(rejected.status, 0, rejected.stdout + rejected.stderr);
  assert.match(rejected.stdout + rejected.stderr, /checksum mismatch/i);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

console.log('release pipeline contract: PASS');
