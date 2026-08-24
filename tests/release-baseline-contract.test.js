const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECKER = path.join(ROOT, 'scripts', 'test-phase-01-baseline-html-chapter-formula-image-ref-counts.py');
const PYTHON = process.env.PYTHON || 'python';

function copyFixture() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'release-baseline-'));
  for (const relativePath of ['chapters', 'images', 'js', 'tools/docx_site_manifest.json']) {
    const source = path.join(ROOT, relativePath);
    const destination = path.join(fixture, relativePath);
    fs.cpSync(source, destination, { recursive: true });
  }
  return fixture;
}

function runChecker(root) {
  return childProcess.spawnSync(PYTHON, [CHECKER, '--root', root], {
    cwd: ROOT,
    encoding: 'utf8',
  });
}

function expectFailure(mutate, expectedMessage) {
  const fixture = copyFixture();
  try {
    mutate(fixture);
    const result = runChecker(fixture);
    assert.notStrictEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout + result.stderr, expectedMessage);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

function replaceFile(root, relativePath, from, to) {
  const target = path.join(root, relativePath);
  const content = fs.readFileSync(target, 'utf8');
  assert.ok(content.includes(from), `${relativePath} must contain fixture mutation anchor`);
  fs.writeFileSync(target, content.replace(from, to), 'utf8');
}

function firstReferencedImage(root) {
  const pending = [path.join(root, 'chapters')];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(target);
        continue;
      }
      if (!entry.name.endsWith('.html')) continue;
      const match = fs.readFileSync(target, 'utf8').match(/<img\b[^>]*\bsrc=["'](images\/[^"']+)["']/i);
      if (match) return path.join(root, ...match[1].split('/'));
    }
  }
  throw new Error('fixture must contain a referenced local image');
}

{
  const fixture = copyFixture();
  try {
    const result = runChecker(fixture);
    assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

expectFailure(
  (root) => replaceFile(
    root,
    'tools/docx_site_manifest.json',
    '"roman": "I"',
    '"roman": "IX"',
  ),
  /manifest route mismatch/i,
);

expectFailure(
  (root) => fs.rmSync(firstReferencedImage(root)),
  /missing referenced local image/i,
);

expectFailure(
  (root) => fs.writeFileSync(path.join(root, 'chapters', 'ch1', 'orphan.html'), '<p>orphan</p>', 'utf8'),
  /orphan chapter fragment/i,
);

expectFailure(
  (root) => replaceFile(
    root,
    'js/loader.js',
    "  'ch1-1-1': 'chapters/ch1/muc-I-1.html',",
    "  'ch1-1-1': 'chapters/ch1/muc-I-1.html',\n  'ch1-1-1': 'chapters/ch1/muc-I-1.html',",
  ),
  /duplicate route id/i,
);

expectFailure(
  (root) => replaceFile(root, 'js/pages.js', 'PAGES["ch1-1-1"]', 'PAGES["bundle-only"]'),
  /bundle\/PAGE_MAP mismatch/i,
);

const evidenceSchema = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'data', 'schemas', 'evidence-registry.schema.json'),
  'utf8',
));
const requiredEvidenceFields = [
 'gateId', 'gateDefinitionHash', 'repositoryHash', 'owner', 'command', 'inputs', 'expected', 'artifact', 'hash', 'status', 'observedAt',
 'containsPII', 'redactionStatus', 'storageLocation', 'accessOwner', 'retentionPolicy',
];
assert.deepStrictEqual(evidenceSchema.required, requiredEvidenceFields);
assert.deepStrictEqual(evidenceSchema.properties.status.enum, ['not-run', 'pass', 'fail', 'blocked']);

const qaConfig = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'qa-gates.json'), 'utf8'));
const wordGate = qaConfig.gates.find((gate) => gate.gateId === 'word-standalone-roundtrip');
assert.ok(wordGate, 'QA registry must define the Word standalone roundtrip gate');
const workerTimeoutIndex = wordGate.command.indexOf('-TimeoutSeconds');
assert.ok(workerTimeoutIndex >= 0, 'Word gate must configure its isolated worker timeout');
const workerTimeoutSeconds = Number(wordGate.command[workerTimeoutIndex + 1]);
assert.ok(Number.isInteger(workerTimeoutSeconds) && workerTimeoutSeconds >= 30, 'Word worker timeout must be valid');
assert.ok(
  wordGate.timeoutSeconds >= workerTimeoutSeconds + 60,
  'QA process timeout must leave at least 60 seconds for worker cleanup and evidence persistence',
);

const matrix = fs.readFileSync(path.join(ROOT, 'docs', 'qa-gate-matrix.md'), 'utf8');
const gateRows = matrix.split('\n')
  .filter((line) => line.startsWith('| `'))
  .map((line) => line.split('|')[1].trim().replaceAll('`', ''));
assert.ok(gateRows.length > 0, 'QA matrix must define release gates');
assert.strictEqual(new Set(gateRows).size, gateRows.length, 'QA matrix gate IDs must be unique');


console.log('release baseline contract: PASS');
