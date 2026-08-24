'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const manifest = require('../js/sim2/sim2-route-manifest.js');
const document = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/simulation-specifications.json'), 'utf8'));
const { validate } = require('../tools/sim-validation/validate-simulation-drift.js');

const REQUIRED = ['id', 'title', 'chapter', 'status', 'learningOutcomeId', 'phenomenon', 'assumptions', 'formula', 'controls', 'accessibility', 'oracle', 'boundaryChecks', 'capture', 'evidence', 'sources', 'freshness'];

test('25 verified Sim2 specifications exactly join the canonical manifest with catalogued independent evidence', () => {
  assert.strictEqual(document.schemaVersion, '1.1.0');
  assert.strictEqual(document.status, 'verified');
  assert.strictEqual(document.reviewRole, 'Project technical review');
  assert.deepStrictEqual(document.oraclePolicy, { kind: 'independent-executable-reference', debugMetricsSoleAuthority: false });
  assert.ok(Array.isArray(document.evidenceCatalog) && document.evidenceCatalog.length > 0);
  assert.strictEqual(document.specifications.length, 25);
  assert.deepStrictEqual(document.specifications.map(record => record.id).sort(), manifest.map(route => route.id).sort());
  for (const record of document.specifications) {
    for (const field of REQUIRED) assert.ok(record[field] != null, `${record.id} missing ${field}`);
    assert.strictEqual(record.status, 'verified', `${record.id} must retain verified technical evidence`);
    assert.strictEqual(record.evidence.verified, true, `${record.id} evidence must remain verified`);
    assert.ok(fs.existsSync(path.join(ROOT, record.sources.factory.path)), `${record.id} factory resolves`);
    assert.ok(fs.existsSync(path.join(ROOT, record.oracle.helper)), `${record.id} helper oracle resolves`);
  }
});

test('specification mutations are rejected: missing, duplicate, renamed, title/chapter, stale source/helper hash, dead test, and downgraded status', () => {
  const clone = () => JSON.parse(JSON.stringify(document));
  const mutations = [
    ['missing', data => data.specifications.pop()],
    ['duplicate', data => data.specifications.push({ ...data.specifications[0] })],
    ['renamed', data => { data.specifications[0].id = 'ch9-9-9'; }],
    ['title drift', data => { data.specifications[0].title = 'incorrect'; }],
    ['chapter drift', data => { data.specifications[0].chapter = 9; }],
    ['stale hash', data => { data.specifications[0].sources.factory.sha256 = '0'.repeat(64); }],
    ['stale helper hash', data => { data.specifications[0].oracle.helperHash = '0'.repeat(64); }],
    ['dead test ref', data => { data.specifications[0].sources.tests[0] = 'tests/does-not-exist.js'; }],
    ['unassociated reference', data => { data.specifications[0].oracle.independentTest = 'README.md'; }],
    ['traversal reference', data => { data.specifications[0].capture.plan = '../README.md'; }],
    ['stale catalog hash', data => { data.evidenceCatalog[0].sha256 = '0'.repeat(64); }],
    ['debug-only oracle policy', data => { data.oraclePolicy.debugMetricsSoleAuthority = true; }],
    ['invalid document review role', data => { data.reviewRole = 'Institutional approval'; }],
    ['downgraded status', data => { data.specifications[0].status = 'draft'; data.specifications[0].evidence.verified = false; }]
  ];
  for (const [name, mutate] of mutations) {
    const data = clone();
    mutate(data);
    assert.strictEqual(validate({ root: ROOT, specDocument: data }).ok, false, name);
  }
});
