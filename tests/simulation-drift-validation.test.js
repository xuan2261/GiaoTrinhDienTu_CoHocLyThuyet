'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const UPSTREAM = 'plans/260713-1524-fix-all-sim2-sim3-defects-deep-tdd';
const { validate } = require('../tools/sim-validation/validate-simulation-drift.js');
const specifications = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/simulation-specifications.json'), 'utf8'));
const reviews = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/sim3-pedagogical-reviews.json'), 'utf8'));
const SIM2_CAPTURE = 'plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/capture-manifest.json';
const SIM3_CAPTURE = 'plans/260605-sim3-visual-quality-upgrade-tdd/visuals/final/capture-manifest.json';
const INTERACTION_PROBE = 'plans/260608-1559-sim-fullquality-triage/visuals/interaction-probe.json';
const BASELINE_SPEC = 'tools/sim2-visual/selective-baseline.spec.js';
const BASELINE_FILES = [
  'tools/sim2-visual/selective-baseline.spec.js-snapshots/ch1-6-3-negative-area-win32.png',
  'tools/sim2-visual/selective-baseline.spec.js-snapshots/ch2-3-2-transmission-win32.png',
  'tools/sim2-visual/selective-baseline.spec.js-snapshots/ch2-4-4-coriolis-callout-win32.png',
  'tools/sim2-visual/selective-baseline.spec.js-snapshots/ch3-3-1-ode-graph-win32.png',
  'tools/sim2-visual/selective-baseline.spec.js-snapshots/ch3-6-2-collision-after-win32.png'
];

function hash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function copy(root, target, rel) {
  const destination = path.join(target, rel);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, rel), destination);
}
function copyTree(root, target, rel) {
  const destination = path.join(target, rel);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(path.join(root, rel), destination, { recursive: true });
}


function verifiedDocument(document) {
  const clone = JSON.parse(JSON.stringify(document));
  clone.status = 'verified';
  delete clone.upstreamBlocker;
  for (const record of clone.specifications || clone.reviews) {
    record.status = 'verified';
    record.evidence.verified = true;
    record.evidence.status = 'verified';
    if (record.evidence.manualEvidence) record.evidence.manualEvidence.status = 'verified';
    if (record.evidence.manualStatus) record.evidence.manualStatus = 'verified';
  }
  return clone;
}

function readyFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'simulation-drift-ready-'));
  const files = new Set(['data/simulation-learning-map.json', 'js/sim2/sim2-route-manifest.js']);
  for (const entry of specifications.evidenceCatalog) files.add(entry.path);
  for (const entry of reviews.evidenceCatalog) files.add(entry.path);
  for (const specification of specifications.specifications) {
    for (const source of [specification.sources.manifest, specification.sources.registry, specification.sources.factory, specification.sources.learningMap]) files.add(source.path);
    files.add(specification.oracle.helper);
  }
  for (const review of reviews.reviews) files.add(review.adapter.path);
  for (const file of files) copy(ROOT, root, file);

  const planDirectory = path.join(ROOT, UPSTREAM);
  const targetPlanDirectory = path.join(root, UPSTREAM);
  fs.mkdirSync(targetPlanDirectory, { recursive: true });
  for (const file of fs.readdirSync(planDirectory).filter(file => file === 'plan.md' || /^phase-(0[1-9]|10|11)-.*\.md$/.test(file))) {
    const completed = fs.readFileSync(path.join(planDirectory, file), 'utf8').replace(/^status:\s*[^\s]+\s*$/m, 'status: completed');
    fs.writeFileSync(path.join(targetPlanDirectory, file), completed);
  }

  const artifacts = [];
  for (const [kind, contents, extra] of [
    ['objective-release', 'objective release evidence', {}],
    ['visual-release', 'visual release evidence', {}],
    ['release-soak', 'retry-free release evidence', { retryFree: true, runs: 3 }]
  ]) {
    const rel = `${UPSTREAM}/evidence/${kind}.txt`;
    const file = path.join(root, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, contents);
    artifacts.push({ kind, path: rel, sha256: hash(file), ...extra });
  }

  for (const [kind, rel] of [
    ['sim2-contact-sheet', 'plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/contact-sheet.html'],
    ['sim3-contact-sheet', 'plans/260605-sim3-visual-quality-upgrade-tdd/visuals/final/contact-sheet.html']
  ]) {
    copy(ROOT, root, rel);
    artifacts.push({ kind, path: rel, sha256: hash(path.join(root, rel)) });
  }

  for (const [kind, rel] of [['sim2-capture', SIM2_CAPTURE], ['sim3-capture', SIM3_CAPTURE]]) {
    copy(ROOT, root, rel);
    const file = path.join(root, rel);
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    payload.generatedAt = new Date().toISOString();
    fs.writeFileSync(file, JSON.stringify(payload));
    copyTree(ROOT, root, `${path.dirname(rel).replace(/\\/g, '/')}/${payload.artifactDir}`);
    artifacts.push({ kind, path: rel, sha256: hash(file) });
  }

  copy(ROOT, root, INTERACTION_PROBE);
  const probeFile = path.join(root, INTERACTION_PROBE);
  const probe = JSON.parse(fs.readFileSync(probeFile, 'utf8'));
  probe.generatedAt = new Date().toISOString();
  fs.writeFileSync(probeFile, JSON.stringify(probe));
  artifacts.push({ kind: 'interaction-probe', path: INTERACTION_PROBE, sha256: hash(probeFile) });

  copy(ROOT, root, BASELINE_SPEC);
  for (const rel of BASELINE_FILES) copy(ROOT, root, rel);
  artifacts.push({
    kind: 'visual-baselines',
    path: BASELINE_SPEC,
    sha256: hash(path.join(root, BASELINE_SPEC)),
    files: BASELINE_FILES.map(rel => ({ path: rel, sha256: hash(path.join(root, rel)) }))
  });
  fs.writeFileSync(path.join(targetPlanDirectory, 'phase-11-evidence.json'), JSON.stringify({ schemaVersion: '1.0.0', phase: 11, status: 'completed', artifacts }));
  return root;
}

test('default drift validation accepts the complete structural verified state', () => {
  const result = validate({ root: ROOT });
  assert.strictEqual(result.ok, true, result.issues.join('\n'));
  assert.deepStrictEqual(result.counts, { sim2: 25, sim3: 10 });
});

test('verified claims pass when the owning plan and hashed phase-11 evidence are complete', () => {
  const result = validate({ root: ROOT, requireVerified: true });
  assert.strictEqual(result.ok, true, result.issues.join('\n'));
  assert.strictEqual(result.upstream.ready, true);
  assert.deepStrictEqual(result.upstream.pending, []);
});

test('a complete owned plan plus fresh phase-11 artifacts permits verified records', () => {
  const root = readyFixture();
  try {
    const result = validate({ root, specDocument: verifiedDocument(specifications), reviewDocument: verifiedDocument(reviews), requireVerified: true });
    assert.strictEqual(result.ok, true, result.issues.join('\n'));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('verified evidence rejects a capture manifest whose bound run artifact is missing', () => {
  const root = readyFixture();
  try {
    const capture = JSON.parse(fs.readFileSync(path.join(root, SIM2_CAPTURE), 'utf8'));
    const image = capture.routes[0].images[0];
    fs.rmSync(path.join(root, path.dirname(SIM2_CAPTURE), capture.artifactDir, image.file));
    const result = validate({ root, specDocument: verifiedDocument(specifications), reviewDocument: verifiedDocument(reviews), requireVerified: true });
    assert.strictEqual(result.ok, false);
    assert.match(result.issues.join('\n'), /sim2 capture/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('verified evidence rejects a missing selective visual baseline', () => {
  const root = readyFixture();
  try {
    fs.rmSync(path.join(root, BASELINE_FILES[0]));
    const result = validate({ root, specDocument: verifiedDocument(specifications), reviewDocument: verifiedDocument(reviews), requireVerified: true });
    assert.strictEqual(result.ok, false);
    assert.match(result.issues.join('\n'), /visual baseline/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('verified evidence requires every approved selective visual baseline', () => {
  const root = readyFixture();
  try {
    const evidenceFile = path.join(root, UPSTREAM, 'phase-11-evidence.json');
    const evidence = JSON.parse(fs.readFileSync(evidenceFile, 'utf8'));
    evidence.artifacts.find(artifact => artifact.kind === 'visual-baselines').files.pop();
    fs.writeFileSync(evidenceFile, JSON.stringify(evidence));
    const result = validate({ root, specDocument: verifiedDocument(specifications), reviewDocument: verifiedDocument(reviews), requireVerified: true });
    assert.strictEqual(result.ok, false);
    assert.match(result.issues.join('\n'), /missing visual baseline/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
