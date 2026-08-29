const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'chapter-reference.json'), 'utf8'));

assert.strictEqual(source.schemaVersion, 1);
assert.deepStrictEqual(Object.keys(source.chapters), ['ch1', 'ch2', 'ch3']);
const requiredCoreIds = {
  ch1: [
    'ch1-force-vector', 'ch1-force-magnitude', 'ch1-force-moment', 'ch1-axis-moment',
    'ch1-main-vector', 'ch1-main-moment', 'ch1-weight-vector', 'ch1-normal-reaction',
    'ch1-sliding-friction', 'ch1-sliding-friction-coefficient',
    'ch1-rolling-friction-coefficient', 'ch1-distributed-load-intensity',
  ],
  ch2: [
    'ch2-position-vector', 'ch2-velocity-vector', 'ch2-acceleration-vector',
    'ch2-path-coordinate', 'ch2-tangent-unit-vector', 'ch2-normal-unit-vector',
    'ch2-curvature-radius', 'ch2-angular-position', 'ch2-angular-velocity-vector',
    'ch2-angular-acceleration-vector', 'ch2-absolute-velocity', 'ch2-coriolis-acceleration',
  ],
  ch3: [
    'ch3-force-vector', 'ch3-mass', 'ch3-acceleration-vector', 'ch3-position-vector',
    'ch3-center-of-mass-position', 'ch3-total-mass', 'ch3-point-momentum',
    'ch3-system-momentum', 'ch3-force-impulse', 'ch3-angular-momentum',
    'ch3-moment-of-inertia', 'ch3-kinetic-energy', 'ch3-work',
  ],
};
const ids = new Set();
for (const [chapter, record] of Object.entries(source.chapters)) {
  assert.ok(Array.isArray(record.entries) && record.entries.length >= 3, `${chapter} must contain curated entries`);
  assert.deepStrictEqual(
    new Set(record.entries.map(entry => entry.kind)),
    new Set(['symbol', 'abbreviation', 'unit']),
    `${chapter} must curate each reference group`,
  );
  for (const entry of record.entries) {
    assert.match(entry.id, new RegExp(`^${chapter}-[a-z0-9-]+$`));
    assert.ok(!ids.has(entry.id), `duplicate reference ID: ${entry.id}`);
    ids.add(entry.id);
    assert.ok(entry.meaning.trim().length > 2 && !/^(todo|example|placeholder)$/i.test(entry.meaning.trim()), `${entry.id} must have a real meaning`);
    assert.strictEqual(Number(Boolean(entry.tex)) + Number(Boolean(entry.label)), 1, `${entry.id} must have one display value`);
    assert.ok(entry.sourceRoutes.length > 0, `${entry.id} must trace first use`);
    if (/\bvéc tơ\b/i.test(entry.meaning)) {
      assert.ok(entry.tex && entry.tex.includes('\\vec'), `${entry.id} must render explicit vector notation`);
    }
  }
  const chapterIds = new Set(record.entries.map(entry => entry.id));
  assert.deepStrictEqual(
    requiredCoreIds[chapter].filter(id => !chapterIds.has(id)),
    [],
    `${chapter} is missing core reference entries`,
  );
}
const ch1Moment = source.chapters.ch1.entries.find(entry => entry.id === 'ch1-force-moment');
assert.strictEqual(ch1Moment.tex, '\\vec{m}_O(\\vec{F})', 'force moment must retain vector notation');

console.log('chapter reference content: PASS');
