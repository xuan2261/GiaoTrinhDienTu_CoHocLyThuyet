const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'schemas', 'release-manifest.schema.json'), 'utf8'));

assert.strictEqual(schema.type, 'object');
assert.deepStrictEqual(schema.required, [
  'schemaVersion', 'releaseVersion', 'buildEpoch', 'launchPath', 'builder', 'policy', 'provenance', 'exclusions', 'files', 'payloadSha256',
]);
assert.strictEqual(schema.additionalProperties, false);
assert.strictEqual(schema.properties.schemaVersion.const, 2);
assert.match(schema.properties.releaseVersion.pattern, /^\^/);
assert.strictEqual(schema.properties.launchPath.const, 'index.html');
assert.strictEqual(schema.properties.builder.properties.name.const, 'tools/release/release.py');
assert.deepStrictEqual(schema.$defs.file.required, ['path', 'sizeBytes', 'sha256']);
assert.match(schema.$defs.path.pattern, /\\/);
assert.match(schema.$defs.sha256.pattern, /a-f0-9/);
assert.deepStrictEqual(schema.properties.provenance.required, ['contentManifest', 'sourceDocx', 'sourcePdf', 'thirdParty']);
assert.ok(schema.properties.files.minItems >= 1);
assert.ok(schema.properties.provenance.properties.thirdParty.minItems >= 1);

console.log('release manifest contract: PASS');
