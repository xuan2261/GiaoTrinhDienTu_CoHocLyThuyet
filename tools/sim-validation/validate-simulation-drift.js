'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { validateCapture } = require('../sim2-visual/validate-capture.js');
const { validateSim3Capture } = require('../sim3-visual/validate-capture.js');
const { validateProbe } = require('../sim-probe/probe-validation.js');

const ROOT = path.resolve(__dirname, '../..');
const UPSTREAM = 'plans/260713-1524-fix-all-sim2-sim3-defects-deep-tdd';
const PHASE_11_EVIDENCE = `${UPSTREAM}/phase-11-evidence.json`;
const UPSTREAM_BLOCKER = 'Runtime/evidence plan 260713-1524 is pending; draft records are not verified.';
const SPEC_REVIEW_ROLE = 'Project technical review';
const REVIEW_AUTHORITY = 'Project technical review; no independent institutional approval.';
const ORACLE_POLICY = 'independent-executable-reference';
const REQUIRED_SPEC_FIELDS = ['id', 'title', 'chapter', 'status', 'learningOutcomeId', 'phenomenon', 'assumptions', 'formula', 'controls', 'accessibility', 'oracle', 'boundaryChecks', 'capture', 'evidence', 'sources', 'freshness'];
const REQUIRED_REVIEW_FIELDS = ['id', 'title', 'chapter', 'adapter', 'status', 'decision', 'twoDimensionalLimitation', 'threeDimensionalValue', 'cognitiveRisk', 'fallbackEquivalence', 'reviewer', 'evidence', 'freshness'];
const REQUIRED_PHASE_11_ARTIFACTS = new Set([
  'objective-release',
  'visual-release',
  'release-soak',
  'sim2-capture',
  'sim2-contact-sheet',
  'sim3-capture',
  'sim3-contact-sheet',
  'interaction-probe',
  'visual-baselines'
]);
const REQUIRED_VISUAL_BASELINES = new Set([
  'tools/sim2-visual/selective-baseline.spec.js-snapshots/ch1-6-3-negative-area-win32.png',
  'tools/sim2-visual/selective-baseline.spec.js-snapshots/ch2-3-2-transmission-win32.png',
  'tools/sim2-visual/selective-baseline.spec.js-snapshots/ch2-4-4-coriolis-callout-win32.png',
  'tools/sim2-visual/selective-baseline.spec.js-snapshots/ch3-3-1-ode-graph-win32.png',
  'tools/sim2-visual/selective-baseline.spec.js-snapshots/ch3-6-2-collision-after-win32.png'
]);


function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function rootFile(root, rel) {
  if (typeof rel !== 'string' || !rel || path.isAbsolute(rel)) return null;
  const resolvedRoot = path.resolve(root);
  const file = path.resolve(resolvedRoot, rel);
  if (file !== resolvedRoot && !file.startsWith(`${resolvedRoot}${path.sep}`)) return null;
  try {
    return fs.statSync(file).isFile() ? file : null;
  } catch {
    return null;
  }
}

function issue(list, message) {
  list.push(message);
}

function requiredFields(record, fields, label, issues) {
  for (const field of fields) if (record[field] == null || record[field] === '') issue(issues, `${label} missing required field ${field}`);
}

function uniqueRecords(records, key, label, issues) {
  const seen = new Set();
  for (const record of records) {
    if (seen.has(record[key])) issue(issues, `duplicate ${label} ${record[key]}`);
    seen.add(record[key]);
  }
  return seen;
}

function exactCoverage(records, manifest, label, issues) {
  const expected = new Set(manifest.map(route => route.id));
  const actual = uniqueRecords(records, 'id', label, issues);
  for (const id of expected) if (!actual.has(id)) issue(issues, `missing ${label} ${id}`);
  for (const id of actual) if (!expected.has(id)) issue(issues, `extra ${label} ${id}`);
}

function isComplete(status) {
  return /^(done|completed|verified)$/i.test(status || '');
}

function frontmatterStatus(file) {
  const match = fs.readFileSync(file, 'utf8').match(/^status:\s*([^\s]+)\s*$/m);
  return match && match[1];
}
function validateConcreteArtifact(root, artifact, artifactFile, pending) {
  if (!artifactFile) return;
  try {
    if (artifact.kind === 'sim2-capture') validateCapture(readJson(artifactFile), Date.now(), path.dirname(artifactFile));
    if (artifact.kind === 'sim3-capture') validateSim3Capture(readJson(artifactFile), Date.now(), path.dirname(artifactFile));
    if (artifact.kind === 'interaction-probe') validateProbe(readJson(artifactFile), Date.now());
  } catch (error) {
    pending.push(`valid ${String(artifact.kind || '').replace(/-/g, ' ')} artifact: ${error.message}`);
  }
  if (artifact.kind !== 'visual-baselines') return;
  if (!Array.isArray(artifact.files) || artifact.files.length === 0) {
    pending.push('visual baseline artifacts');
    return;
  }
  const baselinePaths = new Set();
  for (const baseline of artifact.files) {
    const baselinePath = baseline && baseline.path;
    if (baselinePaths.has(baselinePath)) pending.push(`duplicate visual baseline artifact ${baselinePath}`);
    baselinePaths.add(baselinePath);
    if (!REQUIRED_VISUAL_BASELINES.has(baselinePath)) pending.push(`unexpected visual baseline artifact ${baselinePath || '<unknown>'}`);
    const file = rootFile(root, baselinePath);
    if (!file || !/^[a-f0-9]{64}$/i.test(baseline && baseline.sha256 || '') || sha256(file) !== baseline.sha256) pending.push(`fresh visual baseline artifact ${baselinePath || '<unknown>'}`);
  }
  for (const baselinePath of REQUIRED_VISUAL_BASELINES) if (!baselinePaths.has(baselinePath)) pending.push(`missing visual baseline artifact ${baselinePath}`);
}


function validateEvidenceManifest(root) {
  const file = rootFile(root, PHASE_11_EVIDENCE);
  if (!file) return { ready: false, pending: ['phase 11 evidence manifest'] };
  let manifest;
  try {
    manifest = readJson(file);
  } catch {
    return { ready: false, pending: ['valid phase 11 evidence manifest'] };
  }
  const pending = [];
  if (manifest.schemaVersion !== '1.0.0' || manifest.phase !== 11 || !isComplete(manifest.status)) pending.push('completed phase 11 evidence manifest metadata');
  const kinds = new Set();
  for (const artifact of Array.isArray(manifest.artifacts) ? manifest.artifacts : []) {
    kinds.add(artifact && artifact.kind);
    const artifactFile = rootFile(root, artifact && artifact.path);
    const digestValid = artifactFile && /^[a-f0-9]{64}$/i.test(artifact && artifact.sha256 || '') && sha256(artifactFile) === artifact.sha256;
    if (!digestValid) pending.push(`fresh phase 11 artifact ${artifact && artifact.kind || '<unknown>'}`);
    else validateConcreteArtifact(root, artifact, artifactFile, pending);
    if (artifact && artifact.kind === 'release-soak' && (artifact.retryFree !== true || artifact.runs < 3)) pending.push('three retry-free release runs');
  }
  for (const kind of REQUIRED_PHASE_11_ARTIFACTS) if (!kinds.has(kind)) pending.push(`phase 11 ${kind} artifact`);
  return { ready: pending.length === 0, pending };
}

function upstreamState(root) {
  const planFile = rootFile(root, `${UPSTREAM}/plan.md`);
  const directory = planFile && path.resolve(root, UPSTREAM);
  const pending = [];
  if (!planFile || !isComplete(frontmatterStatus(planFile))) pending.push('owning plan');
  for (let phase = 1; phase <= 11; phase += 1) {
    const prefix = `phase-${String(phase).padStart(2, '0')}-`;
    const file = directory && fs.readdirSync(directory).find(name => name.startsWith(prefix) && name.endsWith('.md'));
    if (!file || !isComplete(frontmatterStatus(path.join(directory, file)))) pending.push(`phase ${String(phase).padStart(2, '0')}`);
  }
  pending.push(...validateEvidenceManifest(root).pending);
  return { ready: pending.length === 0, pending };
}

function validateCatalog(root, catalog, label, issues) {
  const byPath = new Map();
  if (!Array.isArray(catalog) || catalog.length === 0) {
    issue(issues, `${label} missing evidence catalog`);
    return byPath;
  }
  for (const entry of catalog) {
    const file = rootFile(root, entry && entry.path);
    if (!file || !Array.isArray(entry && entry.routeIds) || entry.routeIds.length === 0 || !/^[a-f0-9]{64}$/i.test(entry && entry.sha256 || '')) {
      issue(issues, `${label} invalid evidence catalog entry`);
      continue;
    }
    if (byPath.has(entry.path)) issue(issues, `${label} duplicate evidence catalog path ${entry.path}`);
    else byPath.set(entry.path, entry);
    if (sha256(file) !== entry.sha256) issue(issues, `${label} stale evidence catalog hash ${entry.path}`);
  }
  return byPath;
}

function catalogReference(ref, routeId, catalog, label, issues) {
  const entry = catalog.get(ref);
  if (!entry || !entry.routeIds.includes(routeId)) issue(issues, `${label} must resolve through a fresh route-associated evidence catalog entry: ${ref}`);
}

function expectedStatus(upstream) {
  return upstream.ready ? 'verified' : 'draft';
}

function validateDocumentState(document, label, authority, upstream, issues) {
  const status = expectedStatus(upstream);
  const authorityKey = authority === SPEC_REVIEW_ROLE ? 'reviewRole' : 'reviewAuthority';
  if (document.schemaVersion !== '1.1.0') issue(issues, `${label} unsupported schema version`);
  if (document.status !== status) issue(issues, `${label} status must be ${status}`);
  if (document[authorityKey] !== authority) issue(issues, `${label} ${authorityKey} is invalid`);
  if (!upstream.ready && document.upstreamBlocker !== UPSTREAM_BLOCKER) issue(issues, `${label} upstream blocker is invalid`);
  if (upstream.ready && document.upstreamBlocker != null) issue(issues, `${label} cannot retain an upstream blocker after verification`);
}

function validateRecordState(record, label, upstream, issues) {
  const status = expectedStatus(upstream);
  if (record.status !== status) issue(issues, `${label} status must be ${status}`);
  if (!record.evidence || record.evidence.verified !== upstream.ready) issue(issues, `${label} evidence verified state must be ${upstream.ready}`);
}

function validateSpecifications(root, document, manifest, learningMap, upstream, issues) {
  validateDocumentState(document, 'Sim2 specification document', SPEC_REVIEW_ROLE, upstream, issues);
  if (!document.oraclePolicy || document.oraclePolicy.kind !== ORACLE_POLICY || document.oraclePolicy.debugMetricsSoleAuthority !== false) issue(issues, 'Sim2 specification document has an invalid oracle policy');
  const catalog = validateCatalog(root, document.evidenceCatalog, 'Sim2 specification document', issues);
  const specs = document.specifications || [];
  exactCoverage(specs, manifest, 'Sim2 specification', issues);
  const routes = new Map(manifest.map(route => [route.id, route]));
  for (const spec of specs) {
    requiredFields(spec, REQUIRED_SPEC_FIELDS, `Sim2 specification ${spec.id || '<unknown>'}`, issues);
    validateRecordState(spec, `Sim2 specification ${spec.id || '<unknown>'}`, upstream, issues);
    const route = routes.get(spec.id);
    if (!route) continue;
    if (spec.title !== route.name) issue(issues, `title drift for ${spec.id}`);
    if (spec.chapter !== route.chapter) issue(issues, `chapter drift for ${spec.id}`);
    const mapping = (learningMap.mappings || []).find(item => item.simulationId === spec.id);
    if (!mapping || mapping.learningOutcomeId !== spec.learningOutcomeId || !Array.isArray(mapping.contentIds) || !mapping.contentIds.includes(spec.id)) issue(issues, `learning outcome map drift for ${spec.id}`);
    const factory = `js/sim2/sims/ch${route.chapter}/${route.id}.js`;
    if (!spec.sources || !spec.sources.factory || spec.sources.factory.path !== factory) issue(issues, `factory reference drift for ${spec.id}`);
    for (const source of [spec.sources && spec.sources.manifest, spec.sources && spec.sources.registry, spec.sources && spec.sources.factory, spec.sources && spec.sources.learningMap]) {
      const file = rootFile(root, source && source.path);
      if (!file) issue(issues, `missing root-confined source reference for ${spec.id}`);
      else if (source.sha256 !== sha256(file)) issue(issues, `stale source hash for ${spec.id}: ${source.path}`);
    }
    const helperFile = rootFile(root, spec.oracle && spec.oracle.helper);
    if (!helperFile) issue(issues, `missing root-confined physics helper for ${spec.id}`);
    else if (!spec.oracle.helperHash || spec.oracle.helperHash !== sha256(helperFile)) issue(issues, `stale helper hash for ${spec.id}`);
    if (!spec.controls || !spec.controls.primary || !spec.controls.reset || !spec.controls.learnerInteraction) issue(issues, `incomplete learner control evidence for ${spec.id}`);
    if (!spec.accessibility || !spec.accessibility.textAlternative || !spec.accessibility.keyboard || !spec.accessibility.reducedMotion) issue(issues, `incomplete accessibility evidence for ${spec.id}`);
    if (!spec.evidence || spec.evidence.manualStatus !== expectedStatus(upstream) || !spec.evidence.manualEvidence || spec.evidence.manualEvidence.status !== expectedStatus(upstream) || spec.evidence.manualEvidence.reviewerRole !== 'Project technical reviewer') issue(issues, `invalid evidence status for ${spec.id}`);
    const refs = [spec.oracle && spec.oracle.independentTest, spec.capture && spec.capture.plan, spec.capture && spec.capture.executable].concat(spec.sources && Array.isArray(spec.sources.tests) ? spec.sources.tests : []);
    if (refs.length < 4) issue(issues, `incomplete executable evidence references for ${spec.id}`);
    for (const ref of refs) catalogReference(ref, spec.id, catalog, `Sim2 specification ${spec.id}`, issues);
  }
}

function validateReviews(root, document, manifest, upstream, issues) {
  validateDocumentState(document, 'Sim3 pedagogical review document', REVIEW_AUTHORITY, upstream, issues);
  if (!document.oraclePolicy || document.oraclePolicy.kind !== ORACLE_POLICY || document.oraclePolicy.selfReportedMetricsSoleAuthority !== false) issue(issues, 'Sim3 pedagogical review document has an invalid oracle policy');
  const catalog = validateCatalog(root, document.evidenceCatalog, 'Sim3 pedagogical review document', issues);
  const reviews = document.reviews || [];
  const expectedIds = new Set(['ch1-1-5', 'ch1-5-3', 'ch2-1-3', 'ch2-2-2', 'ch2-3-2', 'ch2-4-4', 'ch2-5-3', 'ch3-1-3', 'ch3-5-3', 'ch3-6-2']);
  const expected = manifest.filter(route => expectedIds.has(route.id));
  exactCoverage(reviews, expected, 'Sim3 pedagogical review', issues);
  const routes = new Map(expected.map(route => [route.id, route]));
  for (const review of reviews) {
    requiredFields(review, REQUIRED_REVIEW_FIELDS, `Sim3 review ${review.id || '<unknown>'}`, issues);
    validateRecordState(review, `Sim3 review ${review.id || '<unknown>'}`, upstream, issues);
    const route = routes.get(review.id);
    if (!route) continue;
    if (review.title !== route.name) issue(issues, `title drift for Sim3 ${review.id}`);
    if (review.chapter !== route.chapter) issue(issues, `chapter drift for Sim3 ${review.id}`);
    const expectedAdapter = `js/sim3/sims/${review.id}-3d.js`;
    const adapterFile = rootFile(root, review.adapter && review.adapter.path);
    if (!review.adapter || review.adapter.path !== expectedAdapter || !adapterFile) issue(issues, `unknown adapter for ${review.id}`);
    else if (review.adapter.sha256 !== sha256(adapterFile)) issue(issues, `stale adapter hash for ${review.id}`);
    if (!['retain-3d', '2d-only'].includes(review.decision)) issue(issues, `invalid Sim3 decision for ${review.id}`);
    if (!review.reviewer || review.reviewer.role !== 'Project technical reviewer' || !/Internal technical review only/i.test(review.reviewer.independence || '')) issue(issues, `review authority must remain internal for ${review.id}`);
    const refs = review.evidence && review.evidence.executableRefs;
    const fallbackEvidence = review.fallbackEquivalence && review.fallbackEquivalence.evidence;
    if (!Array.isArray(refs) || refs.length === 0) issue(issues, `missing executable evidence references for ${review.id}`);
    else for (const ref of refs.concat(fallbackEvidence)) catalogReference(ref, review.id, catalog, `Sim3 review ${review.id}`, issues);
    if (!review.fallbackEquivalence || review.fallbackEquivalence.canonicalMode !== 'Sim2 SVG-first' || !Array.isArray(review.fallbackEquivalence.preserved) || review.fallbackEquivalence.preserved.length === 0 || !fallbackEvidence) issue(issues, `incomplete fallback equivalence for ${review.id}`);
    if (!review.evidence || review.evidence.status !== expectedStatus(upstream)) issue(issues, `invalid evidence status for Sim3 ${review.id}`);
  }
}

function validate(options = {}) {
  const root = options.root || ROOT;
  const manifest = options.manifest || require(path.resolve(root, 'js/sim2/sim2-route-manifest.js'));
  const learningMap = options.learningMap || readJson(path.resolve(root, 'data/simulation-learning-map.json'));
  const specDocument = options.specDocument || readJson(path.resolve(root, 'data/simulation-specifications.json'));
  const reviewDocument = options.reviewDocument || readJson(path.resolve(root, 'data/sim3-pedagogical-reviews.json'));
  const issues = [];
  const upstream = upstreamState(root);
  validateSpecifications(root, specDocument, manifest, learningMap, upstream, issues);
  validateReviews(root, reviewDocument, manifest, upstream, issues);
  const claimsVerified = (specDocument.specifications || []).concat(reviewDocument.reviews || []).some(record => record.status === 'verified' || (record.evidence && record.evidence.verified === true));
  if (claimsVerified && !upstream.ready) issue(issues, `verified evidence rejected: upstream precondition incomplete (${upstream.pending.join(', ')})`);
  if (options.requireVerified && !upstream.ready) issue(issues, `--require-verified blocked: upstream plan ${UPSTREAM} and hashed phase 11 objective/visual/release evidence are pending (${upstream.pending.join(', ')})`);
  if (options.requireVerified && !claimsVerified && upstream.ready) issue(issues, '--require-verified requires verified evidence records after upstream preconditions are met');
  return { ok: issues.length === 0, issues, counts: { sim2: (specDocument.specifications || []).length, sim3: (reviewDocument.reviews || []).length }, upstream };
}

if (require.main === module) {
  const result = validate({ requireVerified: process.argv.includes('--require-verified') });
  if (!result.ok) {
    console.error(result.issues.join('\n'));
    process.exitCode = 1;
  } else console.log(`simulation drift validation: PASS (${result.counts.sim2} Sim2, ${result.counts.sim3} Sim3)`);
}

module.exports = { validate, upstreamState };
