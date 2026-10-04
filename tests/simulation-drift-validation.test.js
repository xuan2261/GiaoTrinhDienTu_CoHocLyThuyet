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
const { sourceSnapshot, SOURCE_DIRECTORIES, SOURCE_FILES } = require('../tools/sim-validation/source-snapshot.js');
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
  // Synthetic unit fixture only: copied artifacts are never production revalidation.
  for (const directory of SOURCE_DIRECTORIES) copyTree(ROOT, root, directory);
  for (const file of SOURCE_FILES) copy(ROOT, root, file);
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
  writeCurrentFixtureReceipt(root, artifacts);
  return root;
}

function writeCurrentFixtureReceipt(root, artifacts) {
  fs.writeFileSync(path.join(root, 'data/simulation-specifications.json'), JSON.stringify(verifiedDocument(specifications)));
  fs.writeFileSync(path.join(root, 'data/sim3-pedagogical-reviews.json'), JSON.stringify(verifiedDocument(reviews)));
  const sourceHash = sourceSnapshot(root).sha256;
  const now = new Date().toISOString();
  const currentPath = `${UPSTREAM}/test-fixture-current-evidence.json`;
  const file = path.join(root, currentPath);
  const environment = 'synthetic unit fixture, not executed browser evidence';
  const currentArtifacts = artifacts.map(artifact => {
    const current = { ...artifact, sourceHash, status: 'passed', observedAt: now, environment };
    let artifactFile = path.join(root, artifact.path);
    let payload = { sourceHash, runId: crypto.randomUUID(), status: 'passed', generatedAt: now, environment };
    if (['sim2-capture', 'sim3-capture', 'interaction-probe'].includes(artifact.kind)) {
      payload = { ...JSON.parse(fs.readFileSync(artifactFile)), ...payload, runId: JSON.parse(fs.readFileSync(artifactFile)).runId };
      fs.writeFileSync(artifactFile, JSON.stringify(payload));
    } else if (artifact.kind === 'visual-baselines') {
      current.path = `${UPSTREAM}/fixture-baseline-run.json`;
      artifactFile = path.join(root, current.path);
      fs.writeFileSync(artifactFile, JSON.stringify({ ...payload, files: artifact.files }));
    } else if (!artifact.kind.endsWith('-contact-sheet')) {
      const commands = { 'objective-release': 'npm run test:sim:release', 'visual-release': 'npm run test:sim:release:full', 'release-soak': 'npm run test:sim:release:soak' };
      payload = { ...payload, command: commands[artifact.kind], exitCode: 0, startedAt: now };
      if (artifact.kind === 'release-soak') Object.assign(payload, { retryFree: true, runs: Array.from({ length: 3 }, () => ({ runId: crypto.randomUUID(), sourceHash, command: commands['objective-release'], startedAt: now, completedAt: now, exitCode: 0 })) });
      fs.writeFileSync(artifactFile, `simulation-run-evidence: ${JSON.stringify(payload)}\n--- stdout ---\nSynthetic unit fixture only, no browser was run\n`);
    }
    current.runId = payload.runId;
    current.sha256 = hash(artifactFile);
    return current;
  });
  for (const artifact of currentArtifacts.filter(item => item.kind.endsWith('-contact-sheet'))) {
    const capture = currentArtifacts.find(item => item.kind === artifact.kind.replace('-contact-sheet', '-capture'));
    artifact.runId = capture.runId;
    const payload = { sourceHash, runId: capture.runId, status: 'passed', generatedAt: now, environment, captureManifest: { path: capture.path, sha256: capture.sha256, runId: capture.runId } };
    const artifactFile = path.join(root, artifact.path);
    fs.appendFileSync(artifactFile, `<script type="application/json" id="simulation-run-evidence">${JSON.stringify(payload)}</script>`);
    artifact.sha256 = hash(artifactFile);
  }
  // Keep separate historical fixture bindings valid after its files have been
  // replaced with synthetic source-bound payloads. This never modifies ROOT.
  const historical = JSON.parse(fs.readFileSync(path.join(root, UPSTREAM, 'phase-11-evidence.json')));
  for (const artifact of historical.artifacts) artifact.sha256 = hash(path.join(root, artifact.path));
  fs.writeFileSync(path.join(root, UPSTREAM, 'phase-11-evidence.json'), JSON.stringify(historical));
  fs.writeFileSync(file, JSON.stringify({ schemaVersion: '1.0.0', phase: 11, status: 'completed', sourceHash, generatedAt: now, artifacts: currentArtifacts }));
  fs.writeFileSync(path.join(root, 'data/simulation-current-revalidation.json'), JSON.stringify({ schemaVersion: '1.0.0', status: 'verified', sourceHash, evidenceManifest: { path: currentPath, sha256: hash(file) }, review: { reviewer: 'Synthetic test reviewer', role: 'Project technical reviewer', decision: 'accept', sourceHash, reviewedAt: now } }));
}

test('default drift validation accepts current structural metadata without claiming runtime acceptance', () => {
  const result = validate({ root: ROOT });
  assert.strictEqual(result.ok, true, result.issues.join('\n'));
  assert.deepStrictEqual(result.counts, { sim2: 25, sim3: 10 });
});

test('historical plan and hashed artifacts do not satisfy current-source acceptance', () => {
  const result = validate({ root: ROOT, requireVerified: true });
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.upstream.historicalReady, true);
  assert.strictEqual(result.upstream.ready, false);
  assert.match(result.issues.join('\n'), /current.source revalidation/i);
});

test('a source-bound current evidence manifest and explicit review permit verified records in a synthetic fixture', () => {
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


test('rehashing changed factory metadata cannot retain verified runtime claims', () => {
  const root = readyFixture();
  try {
    const data = verifiedDocument(specifications);
    const factory = data.specifications[0].sources.factory;
    fs.appendFileSync(path.join(root, factory.path), '\n// source mutation after capture\n');
    factory.sha256 = hash(path.join(root, factory.path));
    fs.writeFileSync(path.join(root, 'data/simulation-specifications.json'), JSON.stringify(data));
    const result = validate({ root, specDocument: data, reviewDocument: verifiedDocument(reviews), requireVerified: true });
    assert.strictEqual(result.ok, false);
    assert.match(result.issues.join('\n'), /current-source revalidation source hash/);
    assert.doesNotMatch(result.issues.join('\n'), /stale source hash/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('shared core changes invalidate acceptance even when all route hashes match', () => {
  const root = readyFixture();
  try {
    fs.appendFileSync(path.join(root, 'js/sim3/core/three-shell.js'), '\n// changed common lifecycle\n');
    const result = validate({ root, specDocument: verifiedDocument(specifications), reviewDocument: verifiedDocument(reviews), requireVerified: true });
    assert.strictEqual(result.ok, false);
    assert.match(result.issues.join('\n'), /current-source revalidation source hash/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('current-source receipt requires an explicit reviewer, not just refreshed hashes', () => {
  const root = readyFixture();
  try {
    const file = path.join(root, 'data/simulation-current-revalidation.json');
    const receipt = JSON.parse(fs.readFileSync(file));
    receipt.review = null;
    fs.writeFileSync(file, JSON.stringify(receipt));
    const result = validate({ root, specDocument: verifiedDocument(specifications), reviewDocument: verifiedDocument(reviews), requireVerified: true });
    assert.strictEqual(result.ok, false);
    assert.match(result.issues.join('\n'), /explicit technical review/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('the historical evidence manifest cannot be relabelled as current revalidation', () => {
  const root = readyFixture();
  try {
    const file = path.join(root, 'data/simulation-current-revalidation.json');
    const receipt = JSON.parse(fs.readFileSync(file));
    const rel = `${UPSTREAM}/phase-11-evidence.json`;
    receipt.evidenceManifest = { path: rel, sha256: hash(path.join(root, rel)) };
    fs.writeFileSync(file, JSON.stringify(receipt));
    const result = validate({ root, specDocument: verifiedDocument(specifications), reviewDocument: verifiedDocument(reviews), requireVerified: true });
    assert.strictEqual(result.ok, false);
    assert.match(result.issues.join('\n'), /historical phase 11 cannot be reused/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('every current artifact must have source-bound execution metadata', () => {
  const root = readyFixture();
  try {
    const file = path.join(root, 'data/simulation-current-revalidation.json');
    const receipt = JSON.parse(fs.readFileSync(file));
    const evidenceFile = path.join(root, receipt.evidenceManifest.path);
    const evidence = JSON.parse(fs.readFileSync(evidenceFile));
    delete evidence.artifacts[0].sourceHash;
    fs.writeFileSync(evidenceFile, JSON.stringify(evidence));
    receipt.evidenceManifest.sha256 = hash(evidenceFile);
    fs.writeFileSync(file, JSON.stringify(receipt));
    const result = validate({ root, specDocument: verifiedDocument(specifications), reviewDocument: verifiedDocument(reviews), requireVerified: true });
    assert.strictEqual(result.ok, false);
    assert.match(result.issues.join('\n'), /current-source execution receipt objective-release/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('new and deleted scoped sources invalidate the complete-source snapshot', () => {
  const root = readyFixture();
  try {
    const options = { root, specDocument: verifiedDocument(specifications), reviewDocument: verifiedDocument(reviews), requireVerified: true };
    const extra = path.join(root, 'js/sim3/core/new-test-source.js');
    fs.writeFileSync(extra, '// new source');
    assert.match(validate(options).issues.join('\n'), /current-source revalidation source hash/);
    fs.rmSync(extra);
    assert.strictEqual(validate(options).ok, true);
    fs.rmSync(path.join(root, 'js/sim3/core/three-shell.js'));
    assert.match(validate(options).issues.join('\n'), /current-source revalidation source hash/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('malformed current receipt fails closed without throwing', () => {
  const root = readyFixture();
  try {
    fs.writeFileSync(path.join(root, 'data/simulation-current-revalidation.json'), 'null');
    const result = validate({ root, specDocument: verifiedDocument(specifications), reviewDocument: verifiedDocument(reviews), requireVerified: true });
    assert.strictEqual(result.ok, false);
    assert.match(result.issues.join('\n'), /valid current-source revalidation receipt object/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('a retry-free flag alone cannot substitute for three executed release runs', () => {
  const root = readyFixture();
  try {
    const file = path.join(root, 'data/simulation-current-revalidation.json');
    const receipt = JSON.parse(fs.readFileSync(file));
    const evidenceFile = path.join(root, receipt.evidenceManifest.path);
    const evidence = JSON.parse(fs.readFileSync(evidenceFile));
    delete evidence.artifacts.find(artifact => artifact.kind === 'release-soak').runs;
    fs.writeFileSync(evidenceFile, JSON.stringify(evidence));
    receipt.evidenceManifest.sha256 = hash(evidenceFile);
    fs.writeFileSync(file, JSON.stringify(receipt));
    const result = validate({ root, specDocument: verifiedDocument(specifications), reviewDocument: verifiedDocument(reviews), requireVerified: true });
    assert.strictEqual(result.ok, false);
    assert.match(result.issues.join('\n'), /three retry-free release runs/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('renamed historical evidence with new wrapper hashes and dates is not current execution', () => {
  const root = readyFixture();
  try {
    const old = JSON.parse(fs.readFileSync(path.join(ROOT, UPSTREAM, 'phase-11-evidence.json')));
    for (const artifact of old.artifacts) copy(ROOT, root, artifact.path);
    const sourceHash = sourceSnapshot(root).sha256;
    const now = new Date().toISOString();
    const relative = 'data/renamed-old-evidence.json';
    const forgedWrapper = { ...old, sourceHash, generatedAt: now, artifacts: old.artifacts.map(artifact => ({ ...artifact, sourceHash, observedAt: now, status: 'passed', environment: 'synthetic adversarial fixture; NO EXECUTION', runId: crypto.randomUUID() })) };
    fs.writeFileSync(path.join(root, relative), JSON.stringify(forgedWrapper));
    fs.writeFileSync(path.join(root, 'data/simulation-current-revalidation.json'), JSON.stringify({ schemaVersion: '1.0.0', status: 'verified', sourceHash, evidenceManifest: { path: relative, sha256: hash(path.join(root, relative)) }, review: { reviewer: 'Synthetic adversarial fixture', role: 'Project technical reviewer', decision: 'accept', sourceHash, reviewedAt: now } }));
    const { currentRevalidationState } = require('../tools/sim-validation/validate-simulation-drift.js');
    const result = currentRevalidationState(root);
    assert.strictEqual(result.ready, false, 'copying a historical manifest must not turn old capture bytes into a new execution');
    assert.match(result.pending.join('\n'), /payload|embedded|fresh/i);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('embedded execution source, clock and run identity remain authoritative after wrapper rehashing', () => {
  const { currentRevalidationState } = require('../tools/sim-validation/validate-simulation-drift.js');
  const cases = [
    ['wrong source', (payload) => { payload.sourceHash = '0'.repeat(64); }, /embedded payload sim2-capture/],
    ['wrong run', (payload) => { payload.runId = crypto.randomUUID(); }, /embedded payload sim2-capture/],
    ['old execution', (payload, artifact) => { payload.generatedAt = new Date(Date.now() - 3 * 86400000).toISOString(); artifact.observedAt = payload.generatedAt; }, /generatedAt must be fresh|execution is not fresh/],
    ['after manifest', (payload, artifact, manifest) => { manifest.generatedAt = new Date(Date.now() - 60000).toISOString(); }, /timestamp mismatch/]
  ];
  for (const [name, mutate, expected] of cases) {
    const root = readyFixture();
    try {
      const receiptFile = path.join(root, 'data/simulation-current-revalidation.json');
      const receipt = JSON.parse(fs.readFileSync(receiptFile));
      const manifestFile = path.join(root, receipt.evidenceManifest.path);
      const manifest = JSON.parse(fs.readFileSync(manifestFile));
      const artifact = manifest.artifacts.find(item => item.kind === 'sim2-capture');
      const artifactFile = path.join(root, artifact.path);
      const payload = JSON.parse(fs.readFileSync(artifactFile));
      mutate(payload, artifact, manifest);
      fs.writeFileSync(artifactFile, JSON.stringify(payload));
      artifact.sha256 = hash(artifactFile);
      fs.writeFileSync(manifestFile, JSON.stringify(manifest));
      receipt.evidenceManifest.sha256 = hash(manifestFile);
      fs.writeFileSync(receiptFile, JSON.stringify(receipt));
      const result = currentRevalidationState(root);
      assert.strictEqual(result.ready, false, name);
      assert.match(result.pending.join('\n'), expected, name);
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
  }
});
