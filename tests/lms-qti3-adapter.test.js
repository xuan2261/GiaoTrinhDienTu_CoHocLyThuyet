const assert = require('assert');
const childProcess = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PYTHON = process.env.PYTHON || 'python';
const BUILD = path.join(ROOT, 'tools', 'lms', 'build_qti3_package.py');
const VALIDATE = path.join(ROOT, 'tools', 'lms', 'validate_qti3_package.py');
const EPOCH = '1787270400';

function run(script, args) {
  return childProcess.spawnSync(PYTHON, [script, ...args], { cwd: ROOT, encoding: 'utf8' });
}

function build(output, extra = []) {
  const result = run(BUILD, ['--output', output, '--epoch', EPOCH, ...extra]);
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
  return JSON.parse(result.stdout);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function expectInvalid(packagePath, expression) {
  const result = run(VALIDATE, ['--package', packagePath]);
  assert.notStrictEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, expression);
}

function rewriteZip(input, output, entry, before, after) {
  const script = String.raw`
import copy, hashlib, json, sys, zipfile
source, target, entry, before, after = sys.argv[1:]
with zipfile.ZipFile(source) as original:
    ordered = [(copy.copy(info), original.read(info.filename)) for info in original.infolist()]
entries = {info.filename: payload for info, payload in ordered}
payload = entries[entry]
if before == '__FIRST_SOURCE_HASH__':
    metadata = json.loads(payload.decode('utf-8'))
    metadata['canonicalSources'][0]['sha256'] = '0' * 64
    entries[entry] = (json.dumps(metadata, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
else:
    entries[entry] = payload.decode('utf-8').replace(before, after, 1).encode('utf-8')
if entry.startswith('items/'):
    traceability = json.loads(entries['traceability.json'].decode('utf-8'))
    item_hash = hashlib.sha256(entries[entry]).hexdigest()
    for record in traceability['items']:
        if record['itemPath'] == entry:
            record['itemSha256'] = item_hash
    entries['traceability.json'] = (json.dumps(traceability, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    metadata = json.loads(entries['adapter-metadata.json'].decode('utf-8'))
    for record in metadata['files']:
        if record['path'] == entry:
            record['sha256'] = item_hash
        if record['path'] == 'traceability.json':
            record['sha256'] = hashlib.sha256(entries['traceability.json']).hexdigest()
    entries['adapter-metadata.json'] = (json.dumps(metadata, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as rewritten:
    for info, _ in ordered:
        rewritten.writestr(info, entries[info.filename], compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
`;
  const result = childProcess.spawnSync(PYTHON, ['-c', script, input, output, entry, before, after], { cwd: ROOT, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
}

function addUnsafePath(input, output) {
  const script = String.raw`
import copy, sys, zipfile
source, target = sys.argv[1:]
with zipfile.ZipFile(source) as original, zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as rewritten:
    for info in original.infolist():
        rewritten.writestr(copy.copy(info), original.read(info.filename), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    unsafe = zipfile.ZipInfo('../unsafe.xml', original.infolist()[0].date_time)
    unsafe.flag_bits |= 0x800
    unsafe.create_system = 3
    unsafe.external_attr = (0o100644) << 16
    rewritten.writestr(unsafe, b'unsafe', compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
`;
  const result = childProcess.spawnSync(PYTHON, ['-c', script, input, output], { cwd: ROOT, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'qti3-adapter-'));
try {
  const firstPath = path.join(temp, 'first.zip');
  const secondPath = path.join(temp, 'second.zip');
  const first = build(firstPath);
  const second = build(secondPath);
  assert.strictEqual(first.itemCount, 10);
  assert.strictEqual(first.sha256, sha256(firstPath));
  assert.strictEqual(sha256(firstPath), sha256(secondPath), 'QTI ZIP must be deterministic');

  const valid = run(VALIDATE, ['--package', firstPath, '--list-json']);
  assert.strictEqual(valid.status, 0, valid.stdout + valid.stderr);
  const entries = JSON.parse(valid.stdout);
  assert.deepStrictEqual(entries, [...entries].sort());
  assert.ok(entries.includes('imsmanifest.xml'));
  assert.ok(entries.includes('adapter-metadata.json'));
  assert.ok(entries.includes('traceability.json'));
  assert.strictEqual(entries.filter(entry => entry.startsWith('items/')).length, 10);

  const resourceType = path.join(temp, 'resource-type.zip');
  rewriteZip(firstPath, resourceType, 'imsmanifest.xml', 'imsqti_qtiitem_xmlv3p0', 'wrong-resource-type');
  expectInvalid(resourceType, /resource type/i);

  const semantic = path.join(temp, 'semantic.zip');
  rewriteZip(firstPath, semantic, 'items/quiz-ch1-001.xml', '<qti-value>CHOICE_A</qti-value>', '<qti-value>CHOICE_B</qti-value>');
  expectInvalid(semantic, /correct response semantic mismatch/i);

  const question = path.join(temp, 'question.zip');
  rewriteZip(firstPath, question, 'items/quiz-ch1-001.xml', 'Vật rắn tuyệt đối là gì?', 'Câu hỏi đã bị thay đổi');
  expectInvalid(question, /question semantic mismatch/i);

  const choices = path.join(temp, 'choices.zip');
  rewriteZip(firstPath, choices, 'items/quiz-ch1-001.xml', 'identifier="CHOICE_B"', 'identifier="CHOICE_A"');
  expectInvalid(choices, /duplicate or invalid choice identifiers/i);

  const metadata = path.join(temp, 'metadata.zip');
  rewriteZip(firstPath, metadata, 'adapter-metadata.json', '__FIRST_SOURCE_HASH__', '');
  expectInvalid(metadata, /stale canonical source hash/i);

  const unsafe = path.join(temp, 'unsafe.zip');
  addUnsafePath(firstPath, unsafe);
  expectInvalid(unsafe, /unsafe ZIP path/i);

  const tooMany = run(BUILD, ['--output', path.join(temp, 'too-many.zip'), '--epoch', EPOCH, '--max-items', '11']);
  assert.notStrictEqual(tooMany.status, 0, tooMany.stdout + tooMany.stderr);
  assert.match(tooMany.stdout + tooMany.stderr, /max-items must be between 1 and 10/i);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

console.log('lms qti3 adapter contract: PASS');
