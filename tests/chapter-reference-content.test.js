const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'chapter-reference.json'), 'utf8'));

assert.strictEqual(source.schemaVersion, 1);
assert.deepStrictEqual(Object.keys(source.chapters), ['ch1', 'ch2', 'ch3']);
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
  }
}

console.log('chapter reference content: PASS');
