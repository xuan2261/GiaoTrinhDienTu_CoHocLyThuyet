'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const document = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/sim3-pedagogical-reviews.json'), 'utf8'));
const { validate } = require('../tools/sim-validation/validate-simulation-drift.js');

const EXPECTED = ['ch1-1-5', 'ch1-5-3', 'ch2-1-3', 'ch2-2-2', 'ch2-3-2', 'ch2-4-4', 'ch2-5-3', 'ch3-1-3', 'ch3-5-3', 'ch3-6-2'];

test('10 Sim3 reviews document pedagogical decision and equivalent Sim2 fallback with catalogued evidence', () => {
  assert.strictEqual(document.schemaVersion, '1.1.0');
  assert.strictEqual(document.status, 'verified');
  assert.match(document.reviewAuthority, /Project technical review/);
  assert.match(document.reviewAuthority, /no independent institutional approval/i);
  assert.deepStrictEqual(document.oraclePolicy, { kind: 'independent-executable-reference', selfReportedMetricsSoleAuthority: false });
  assert.ok(Array.isArray(document.evidenceCatalog) && document.evidenceCatalog.length > 0);
  assert.deepStrictEqual(document.reviews.map(review => review.id).sort(), EXPECTED.slice().sort());
  for (const review of document.reviews) {
    assert.ok(['retain-3d', '2d-only'].includes(review.decision), `${review.id} decision`);
    for (const field of ['twoDimensionalLimitation', 'threeDimensionalValue', 'cognitiveRisk']) assert.ok(review[field], `${review.id} ${field}`);
    assert.strictEqual(review.fallbackEquivalence.canonicalMode, 'Sim2 SVG-first');
    assert.strictEqual(review.reviewer.role, 'Project technical reviewer');
    assert.match(review.reviewer.independence, /Internal technical review only/);
    assert.strictEqual(review.evidence.verified, true);
    assert.ok(fs.existsSync(path.join(ROOT, review.adapter.path)), `${review.id} adapter resolves`);
  }
});

test('review mutations reject duplicate, title/chapter drift, unknown adapter, stale hash, and unsupported authority', () => {
  const clone = () => JSON.parse(JSON.stringify(document));
  const mutations = [
    ['duplicate', data => data.reviews.push({ ...data.reviews[0] })],
    ['title drift', data => { data.reviews[0].title = 'incorrect'; }],
    ['chapter drift', data => { data.reviews[0].chapter = 9; }],
    ['unknown adapter', data => { data.reviews[0].adapter.path = 'js/sim3/sims/unknown-3d.js'; }],
    ['stale hash', data => { data.reviews[0].adapter.sha256 = '0'.repeat(64); }],
    ['unassociated review evidence', data => { data.reviews[0].evidence.executableRefs[0] = 'README.md'; }],
    ['unassociated fallback evidence', data => { data.reviews[0].fallbackEquivalence.evidence = 'README.md'; }],
    ['stale catalog hash', data => { data.evidenceCatalog[0].sha256 = '0'.repeat(64); }],
    ['debug-only review policy', data => { data.oraclePolicy.selfReportedMetricsSoleAuthority = true; }],
    ['unsupported authority', data => { data.reviewAuthority = 'Institutional approval'; }],
    ['unsupported per-record authority', data => { data.reviews[0].reviewer.independence = 'Institutional approval'; }]
  ];
  for (const [name, mutate] of mutations) {
    const data = clone();
    mutate(data);
    assert.strictEqual(validate({ root: ROOT, reviewDocument: data }).ok, false, name);
  }
});
