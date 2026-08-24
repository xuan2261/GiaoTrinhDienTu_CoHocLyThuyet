const assert = require('assert');
const childProcess = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PYTHON = process.env.PYTHON || 'python';
const FIXTURE_FILES = [
  'data/content-manifest.json',
  'data/legal-standards-register.json',
  'data/requirement-traceability.json',
  'data/learning-outcomes.json',
  'data/content-learning-map.json',
  'data/quiz-learning-map.json',
  'data/simulation-learning-map.json',
  'data/evidence-registry.json',
  'data/qa-gates.json',
  'data/quiz-ch1.json',
  'data/quiz-ch2.json',
  'data/quiz-ch3.json',
  'js/sim2/sim2-route-manifest.js',
  'tools/content_manifest_utils.py',
  'tools/traceability_contracts.py',
  'tools/traceability_maps.py',
  'tools/run_qa_gates.py',
  'tools/validate_traceability.py',
  'docs/qa-gate-matrix.md',
];

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function digest(value) { return crypto.createHash('sha256').update(value).digest('hex'); }

function materializeEvidence(root) {
  const registryPath = path.join(root, 'data', 'evidence-registry.json');
  const configPath = path.join(root, 'data', 'qa-gates.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const input = 'docs/qa-gate-matrix.md';
  const inputHash = digest(fs.readFileSync(path.join(root, input)));
  const byId = new Map(config.gates.map(gate => [gate.gateId, gate]));
  for (const record of registry.records) {
    const gate = byId.get(record.gateId);
    Object.assign(gate, { owner: 'Fixture', command: ['python', 'tools/validate_traceability.py'], expected: 'Fixture evidence validates.', inputs: [input], timeoutSeconds: 30, evidenceClass: 'public' });
    delete gate.failureStatus;
    const artifact = `evidence/${record.gateId}.log`;
    Object.assign(record, {
      gateDefinitionHash: `sha256:${digest(canonical(gate))}`,
      repositoryHash: `sha256:${'1'.repeat(64)}`,
      owner: gate.owner,
      command: gate.command.join(' '),
      inputs: gate.inputs,
      expected: gate.expected,
      artifact,
      storageLocation: artifact,
      containsPII: false,
      redactionStatus: 'not-required',
      accessOwner: 'Release engineering',
      retentionPolicy: 'Retain with release evidence bundle.',
    });
    const exitCode = record.status === 'pass' ? 0 : 1;
    const capture = `gateId: ${record.gateId}\ngateDefinitionHash: ${record.gateDefinitionHash}\nrepositoryHash: ${record.repositoryHash}\nobservedAt: ${record.observedAt}\ncommand: ${record.command}\nexitCode: ${exitCode}\nstatus: ${record.status}\n\n--- inputs ---\nsha256:${inputHash} ${input}\n\n--- stdout ---\nfixture\n\n--- stderr ---\n`;
    const target = path.join(root, artifact);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, capture);
    record.hash = `sha256:${digest(capture)}`;
  }
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'traceability-'));
  for (const file of FIXTURE_FILES) {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(ROOT, file), target);
  }
  materializeEvidence(root);
  return root;
}
function json(root, file) { return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')); }
function save(root, file, value) { fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`); }
function run(root, strict = true) {
  return childProcess.spawnSync(PYTHON, ['tools/validate_traceability.py', '--root', root, '--allow-fixture-repository-hash', ...(strict ? ['--strict-claims'] : [])], { cwd: root, encoding: 'utf8' });
}
function expectFailure(mutate, message) {
  const root = fixture();
  try {
    mutate(root);
    const result = run(root);
    assert.notStrictEqual(result.status, 0, 'validator unexpectedly passed');
    assert.match(`${result.stdout}\n${result.stderr}`, message);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
function expectPass(mutate) {
  const root = fixture();
  try {
    mutate(root);
    const result = run(root);
    assert.strictEqual(result.status, 0, result.stderr);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
module.exports = { expectFailure, expectPass, json, save };
