const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'lms-targets.json'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'schemas', 'lms-targets.schema.json'), 'utf8'));

function validate(value) {
  assert.deepStrictEqual(Object.keys(value).sort(), ['schemaVersion', 'stages', 'status']);
  assert.strictEqual(value.schemaVersion, 1);
  assert.ok(['not-executed', 'partially-executed', 'executed'].includes(value.status));
  assert.deepStrictEqual(Object.keys(value.stages).sort(), ['commonCartridge', 'qti3', 'scorm', 'xapiCmi5'].sort());
  for (const [name, stage] of Object.entries(value.stages)) {
    assert.ok(['adapter-validated', 'blocked'].includes(stage.readiness), `${name}.readiness`);
    assert.ok(Array.isArray(stage.targets), `${name}.targets`);
    assert.ok(Array.isArray(stage.executionEvidence), `${name}.executionEvidence`);
    assert.ok(typeof stage.scope === 'string' && stage.scope.length > 0, `${name}.scope`);
    if (stage.readiness === 'blocked') {
      assert.deepStrictEqual(stage.targets, [], `${name} blocked targets`);
      assert.deepStrictEqual(stage.executionEvidence, [], `${name} blocked evidence`);
    }
    for (const target of stage.targets) {
      assert.ok(target.system && target.version);
      assert.ok(['planned', 'pass', 'fail', 'blocked'].includes(target.status));
      assert.ok(Array.isArray(target.evidenceRefs));
      if (target.status === 'pass') assert.ok(target.evidenceRefs.length > 0, 'passed target requires evidence');
    }
  }
  assert.ok(value.stages.qti3.maximumValidationItems >= 1 && value.stages.qti3.maximumValidationItems <= 10);
  if (value.status === 'not-executed') {
    assert.deepStrictEqual(value.stages.qti3.targets, []);
    assert.deepStrictEqual(value.stages.commonCartridge.targets, []);
    assert.deepStrictEqual(value.stages.qti3.executionEvidence, []);
    assert.deepStrictEqual(value.stages.commonCartridge.executionEvidence, []);
  }
}

validate(registry);
assert.strictEqual(schema.properties.schemaVersion.const, 1);
assert.deepStrictEqual(schema.properties.stages.required, ['qti3', 'commonCartridge', 'xapiCmi5', 'scorm']);
assert.strictEqual(schema.$defs.blockedStage.properties.targets.maxItems, 0);
assert.strictEqual(schema.$defs.blockedStage.properties.executionEvidence.maxItems, 0);

const forged = structuredClone(registry);
forged.status = 'executed';
forged.stages.qti3.targets.push({ system: 'Unverified LMS', version: 'unknown', status: 'pass', evidenceRefs: [] });
assert.throws(() => validate(forged), /passed target requires evidence/);

console.log('LMS target staging contract: PASS');
