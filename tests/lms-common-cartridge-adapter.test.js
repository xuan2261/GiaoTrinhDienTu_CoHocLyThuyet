const assert = require('assert');
const childProcess = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PYTHON = process.env.PYTHON || 'python';
const RELEASE = path.join(ROOT, 'tools', 'release', 'release.py');
const BUILD = path.join(ROOT, 'tools', 'lms', 'build_common_cartridge.py');
const VALIDATE = path.join(ROOT, 'tools', 'lms', 'validate_common_cartridge.py');
const VERSION = '2026.08.21-cc-test';
const EPOCH = '1787270400';

function run(script, args) {
  return childProcess.spawnSync(PYTHON, [script, ...args], { cwd: ROOT, encoding: 'utf8' });
}

function expectPass(script, args) {
  const result = run(script, args);
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  return result;
}

function expectReject(script, args, message) {
  const result = run(script, args);
  assert.notStrictEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, message);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function rewriteZip(source, destination, mutations = {}, additions = {}) {
  const mutationText = Buffer.from(JSON.stringify(mutations)).toString('base64');
  const additionText = Buffer.from(JSON.stringify(additions)).toString('base64');
  const script = String.raw`
import base64, json, stat, sys, zipfile
source, destination, mutations, additions, epoch = sys.argv[1:]
mutations = json.loads(base64.b64decode(mutations))
additions = json.loads(base64.b64decode(additions))
timestamp = __import__('datetime').datetime.fromtimestamp(int(epoch), tz=__import__('datetime').timezone.utc).timetuple()[:6]
with zipfile.ZipFile(source) as original:
    entries = {item.filename: original.read(item.filename) for item in original.infolist()}
entries.update({name: base64.b64decode(content) for name, content in mutations.items()})
entries.update({name: base64.b64decode(content) for name, content in additions.items()})
with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as output:
    for name in sorted(entries):
        info = zipfile.ZipInfo(name, timestamp)
        info.compress_type = zipfile.ZIP_DEFLATED
        info.create_system = 3
        info.external_attr = (stat.S_IFREG | 0o644) << 16
        info.flag_bits |= 0x800
        output.writestr(info, entries[name], compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
`;
  const result = childProcess.spawnSync(PYTHON, ['-c', script, source, destination, mutationText, additionText, EPOCH], { cwd: ROOT, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
}

function duplicateZipEntry(source, destination, name) {
  const script = String.raw`
import stat, sys, zipfile
source, destination, name, epoch = sys.argv[1:]
timestamp = __import__('datetime').datetime.fromtimestamp(int(epoch), tz=__import__('datetime').timezone.utc).timetuple()[:6]
with zipfile.ZipFile(source) as original:
    entries = [(item.filename, original.read(item.filename)) for item in original.infolist()]
    duplicate = original.read(name)
with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as output:
    for entry_name, content in entries + [(name, duplicate)]:
        info = zipfile.ZipInfo(entry_name, timestamp)
        info.compress_type = zipfile.ZIP_DEFLATED
        info.create_system = 3
        info.external_attr = (stat.S_IFREG | 0o644) << 16
        info.flag_bits |= 0x800
        output.writestr(info, content, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
`;
  const result = childProcess.spawnSync(PYTHON, ['-c', script, source, destination, name, EPOCH], { cwd: ROOT, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'common-cartridge-contract-'));
try {
  const releaseOutput = path.join(temp, 'release');
  const basePolicy = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'release-policy.json'), 'utf8'));
  const fixturePolicy = {
    ...basePolicy,
    shipList: [{ path: 'index.html', kind: 'file' }],
    requiredPaths: ['index.html'],
    maximumPackageBytes: 2 * 1024 * 1024,
  };
  const fixturePolicyPath = path.join(temp, 'release-policy.json');
  fs.writeFileSync(fixturePolicyPath, JSON.stringify(fixturePolicy), 'utf8');
  expectPass(RELEASE, ['--output-dir', releaseOutput, '--version', VERSION, '--epoch', EPOCH, '--policy', fixturePolicyPath]);
  const releaseSummary = JSON.parse(fs.readFileSync(path.join(releaseOutput, 'release-summary.json'), 'utf8'));
  const sourceRelease = path.join(releaseOutput, releaseSummary.package.path);
  const first = path.join(temp, 'first.imscc');
  const second = path.join(temp, 'second.imscc');
  const buildArgs = ['--source-release', sourceRelease, '--epoch', EPOCH];

  expectPass(BUILD, [...buildArgs, '--output', first]);
  expectPass(BUILD, [...buildArgs, '--output', second]);
  assert.strictEqual(sha256(first), sha256(second), 'Common Cartridge ZIP must be byte-for-byte reproducible');
  expectPass(VALIDATE, ['--package', first, '--source-release', sourceRelease]);

  const inventory = JSON.parse(expectPass(VALIDATE, ['--package', first, '--list-json']).stdout);
  assert.ok(inventory.fileCount > inventory.embeddedFileCount);

  const manifest = fs.readFileSync(path.join(releaseOutput, 'package', 'release-manifest.json'));
  const metadata = {
    schemaVersion: 1,
    adapter: { name: 'tools/lms/build_common_cartridge.py', version: 1 },
    buildEpoch: Number(EPOCH),
    launchPath: 'webcontent/index.html',
    sourceRelease: {
      sourceReleaseZipSha256: sha256(sourceRelease),
      releaseManifestSha256: crypto.createHash('sha256').update(manifest).digest('hex'),
      releaseVersion: VERSION,
      releaseBuildEpoch: Number(EPOCH),
      releaseLaunchPath: 'index.html',
    },
  };

  const badMetadata = { ...metadata, sourceRelease: { ...metadata.sourceRelease, sourceReleaseZipSha256: '0'.repeat(64) } };
  const metadataMismatch = path.join(temp, 'bad-metadata.imscc');
  rewriteZip(first, metadataMismatch, {
    'adapter-metadata.json': Buffer.from(`${JSON.stringify(badMetadata)}\n`).toString('base64'),
  });
  expectReject(VALIDATE, ['--package', metadataMismatch], /source release manifest hash mismatch|provenance source release mismatch|source release metadata mismatch/i);
  const forgedSourceHash = path.join(temp, 'forged-source-hash.imscc');
  const forgedProvenance = {
    schemaVersion: 1,
    adapter: metadata.adapter,
    launchPath: metadata.launchPath,
    sourceRelease: badMetadata.sourceRelease,
  };
  rewriteZip(first, forgedSourceHash, {
    'adapter-metadata.json': Buffer.from(`${JSON.stringify(badMetadata)}\n`).toString('base64'),
    'provenance.json': Buffer.from(`${JSON.stringify(forgedProvenance)}\n`).toString('base64'),
  });
  expectReject(VALIDATE, ['--package', forgedSourceHash, '--source-release', sourceRelease], /source release ZIP hash mismatch/i);

  const sourceXml = childProcess.spawnSync(PYTHON, ['-c', 'import sys,zipfile; print(zipfile.ZipFile(sys.argv[1]).read("imsmanifest.xml").decode(), end="")', first], { encoding: 'utf8' }).stdout;
  function mutateManifest(name, replacement, expected) {
    const file = path.join(temp, `${name}.imscc`);
    const mutated = sourceXml.replace(...replacement);
    assert.notStrictEqual(mutated, sourceXml, `${name} mutation anchor must exist`);
    rewriteZip(first, file, { 'imsmanifest.xml': Buffer.from(mutated).toString('base64') });
    expectReject(VALIDATE, ['--package', file], expected);
  }
  mutateManifest('wrong-namespace', [/imsccv1p4\/imscp_v1p1/g, 'wrong-namespace'], /namespace|schema location/i);
  mutateManifest('wrong-resource-type', [/type="webcontent"/, 'type="assessment"'], /resource type/i);
  mutateManifest('launch-mismatch', [/href="webcontent\/index.html"/, 'href="webcontent/start.html"'], /launch href/i);
  mutateManifest('missing-declaration', [/<file href="webcontent\/index.html"\/>\r?\n/, ''], /file declarations/i);
  mutateManifest('orphan-declaration', [/<\/resource>/, '      <file href="webcontent/orphan.html"/>\n    </resource>'], /file declarations/i);

  const badProvenance = { ...metadata, adapter: { name: 'untrusted-adapter', version: 1 } };
  const provenanceMismatch = path.join(temp, 'bad-provenance.imscc');
  rewriteZip(first, provenanceMismatch, {
    'provenance.json': Buffer.from(`${JSON.stringify(badProvenance)}\n`).toString('base64'),
  });
  expectReject(VALIDATE, ['--package', provenanceMismatch], /adapter identity|provenance/i);

  const unsafePath = path.join(temp, 'unsafe-path.imscc');
  rewriteZip(first, unsafePath, {}, { '../escape.html': Buffer.from('unsafe').toString('base64') });
  expectReject(VALIDATE, ['--package', unsafePath], /unsafe.*path|path escapes/i);
  const duplicatePath = path.join(temp, 'duplicate-entry.imscc');
  duplicateZipEntry(first, duplicatePath, 'webcontent/index.html');
  expectReject(VALIDATE, ['--package', duplicatePath], /unique and sorted/i);
  expectReject(VALIDATE, ['--package', first, '--maximum-package-bytes', '1'], /exceeds maximumPackageBytes/i);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

console.log('Common Cartridge adapter contract: PASS');
