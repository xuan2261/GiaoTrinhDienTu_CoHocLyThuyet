const assert = require('assert');
const childProcess = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PYTHON = process.env.PYTHON || 'python';
const BASE_FILES = [
  'data/media-pilot-manifest.json',
  'data/content-manifest.json',
  'data/learning-outcomes.json',
  'data/content-learning-map.json',
  'data/simulation-learning-map.json',
  'tools/media_pilot_contracts.py',
  'tools/validate_media_pilot.py'
];

function readJson(root, logical) {
  return JSON.parse(fs.readFileSync(path.join(root, logical), 'utf8'));
}

function saveJson(root, logical, value) {
  fs.writeFileSync(path.join(root, logical), `${JSON.stringify(value, null, 2)}\n`);
}

function digest(root, logical) {
  const bytes = fs.readFileSync(path.join(root, logical));
  return {
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length
  };
}

function copy(root, logical) {
  const target = path.join(root, logical);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(ROOT, logical), target);
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'media-pilot-'));
  BASE_FILES.forEach(file => copy(root, file));
  const index = readJson(root, 'data/media-pilot-manifest.json');
  index.contractFiles.forEach(record => copy(root, record.path));
  const media = readJson(root, 'data/media-manifest.json');
  const files = new Set();
  for (const asset of media.assets) {
    asset.sourceFiles.forEach(record => files.add(record.path));
    const packet = readJson(ROOT, asset.authoringPacket.path);
    packet.sourceEvidence.forEach(record => files.add(record.path));
  }
  files.forEach(file => copy(root, file));
  return root;
}

function run(root) {
  return childProcess.spawnSync(
    PYTHON,
    ['tools/validate_media_pilot.py', '--root', root, '--strict'],
    { cwd: root, encoding: 'utf8' }
  );
}

function expectPass(mutate = () => {}) {
  const root = fixture();
  try {
    mutate(root);
    const result = run(root);
    assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function expectFailure(mutate, pattern) {
  const root = fixture();
  try {
    mutate(root);
    const result = run(root);
    assert.notStrictEqual(result.status, 0, 'validator unexpectedly passed');
    assert.match(`${result.stdout}\n${result.stderr}`, pattern);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function refreshIndexRecord(root, logical) {
  const index = readJson(root, 'data/media-pilot-manifest.json');
  const record = index.contractFiles.find(item => item.path === logical);
  assert(record, `missing contract index record: ${logical}`);
  Object.assign(record, digest(root, logical));
  saveJson(root, 'data/media-pilot-manifest.json', index);
}

function mutateIndex(root, mutate) {
  const index = readJson(root, 'data/media-pilot-manifest.json');
  mutate(index);
  saveJson(root, 'data/media-pilot-manifest.json', index);
}

function mutateContract(root, logical, mutate) {
  const value = readJson(root, logical);
  mutate(value);
  saveJson(root, logical, value);
  refreshIndexRecord(root, logical);
}

function mutateMediaManifest(root, mutate) {
  mutateContract(root, 'data/media-manifest.json', mutate);
}

function mutatePacket(root, assetIndex, mutate) {
  const media = readJson(root, 'data/media-manifest.json');
  const content = readJson(root, 'data/multimedia-content-contracts.json');
  const asset = media.assets[assetIndex];
  const packetPath = asset.authoringPacket.path;
  const packet = readJson(root, packetPath);
  mutate(packet);
  saveJson(root, packetPath, packet);
  const packetDigest = digest(root, packetPath);
  Object.assign(asset.authoringPacket, packetDigest);
  Object.assign(asset.sourceFiles.find(record => record.path === packetPath), packetDigest);
  asset.budget.measuredBytes = asset.sourceFiles.reduce((sum, record) => sum + record.bytes, 0);
  Object.assign(content.contracts.find(contract => contract.assetId === asset.id).authoringPacket, packetDigest);
  saveJson(root, 'data/media-manifest.json', media);
  saveJson(root, 'data/multimedia-content-contracts.json', content);
  refreshIndexRecord(root, 'data/media-manifest.json');
  refreshIndexRecord(root, 'data/multimedia-content-contracts.json');
}

module.exports = {
  ROOT,
  expectFailure,
  expectPass,
  mutateContract,
  mutateIndex,
  mutateMediaManifest,
  mutatePacket,
  readJson,
  saveJson
};
