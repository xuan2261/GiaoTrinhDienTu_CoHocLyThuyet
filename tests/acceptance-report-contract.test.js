const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const json = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const report = json('data/acceptance-report.json');
const config = json('data/qa-gates.json');
const schema = json('data/schemas/acceptance-report.schema.json');

assert.strictEqual(report.schemaVersion, 1);
assert.deepStrictEqual(Object.keys(report).sort(), schema.required.slice().sort());
const configured = config.gates.map(gate => gate.gateId).sort();
const reported = report.gates.map(gate => gate.gateId).sort();
assert.deepStrictEqual(reported, configured, 'acceptance report must cover every configured gate exactly once');
assert.strictEqual(new Set(reported).size, reported.length);

const statuses = report.gates.map(gate => gate.status);
const counts = {
  total: statuses.length,
  pass: statuses.filter(status => status === 'pass').length,
  fail: statuses.filter(status => status === 'fail').length,
  blocked: statuses.filter(status => status === 'blocked').length,
  notRun: statuses.filter(status => status === 'not-run').length,
};
assert.deepStrictEqual(report.gateSummary, counts);
const expectedOverall = counts.fail ? 'fail' : (counts.pass === counts.total ? 'pass' : 'blocked');
assert.strictEqual(report.overallStatus, expectedOverall);
assert.strictEqual(report.releaseDecision.decision, expectedOverall === 'pass' ? 'approved' : (expectedOverall === 'fail' ? 'rejected' : 'blocked'));

for (const gate of report.gates) {
  assert.ok(gate.owner && gate.artifact && gate.observedAt);
  if (gate.hash !== 'not-applicable') {
    const bytes = fs.readFileSync(path.join(ROOT, gate.artifact));
    assert.strictEqual(gate.hash, `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`, gate.gateId);
  }
  if (gate.status === 'pass') assert.notStrictEqual(gate.hash, 'not-applicable', gate.gateId);
}

const byId = new Map(report.gates.map(gate => [gate.gateId, gate]));
assert.strictEqual(report.independentReview.status, byId.get('academic-review-currentness').status);
assert.strictEqual(report.wordRoundtrip.status, byId.get('word-standalone-roundtrip').status);
assert.strictEqual(report.releaseCandidate.status, byId.get('release-candidate-inventory').status);
assert.strictEqual(report.independentSmoke.status, byId.get('release-independent-smoke').status);
assert.deepStrictEqual(Object.keys(report.lms.stages).sort(), ['commonCartridge', 'qti3', 'scorm', 'xapiCmi5'].sort());
if (report.lms.status === 'not-executed') {
  for (const stage of Object.values(report.lms.stages)) {
    assert.ok(!stage.targets.some(target => target.status === 'pass'), 'not-executed LMS registry cannot claim a passed target');
  }
}

console.log(`acceptance report contract: PASS (${counts.pass}/${counts.total} gates passed)`);
