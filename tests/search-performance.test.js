'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const search = require('../js/search.js');

const ROOT = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(ROOT, 'data', 'search-index.json'));
const index = JSON.parse(raw);
const engine = search.createEngine(index, null);

assert.strictEqual(search.normalizeText('Vô cùng bé', true), 'vo cung be');

const accented = engine.search('vô cùng bé');
const folded = engine.search('vo cung be');
assert.ok(accented.length > 0, 'body phrase must return results');
assert.strictEqual(folded[0].routeId, accented[0].routeId, 'folded query must preserve top route');
assert.ok(accented.some(result => result.field === 'body'), 'body field must be indexed');

const title = engine.search('Tĩnh học');
assert.strictEqual(title[0].routeId, 'ch1', 'exact title must outrank body matches');
assert.strictEqual(title[0].field, 'title', 'title field must carry the top result');

const segments = search.highlightSegments('<img src=x onerror=alert(1)>', '<img');
assert.strictEqual(segments.map(segment => segment.text).join(''), '<img src=x onerror=alert(1)>');
assert.ok(segments.some(segment => segment.mark), 'controlled highlight segments must identify the match');
assert.ok(!Object.prototype.hasOwnProperty.call(segments[0], 'html'), 'highlighter must not return injectable HTML');

for (let i = 0; i < 20; i += 1) engine.search('chuyển động');
const samples = [];
for (let i = 0; i < 120; i += 1) {
  const started = performance.now();
  engine.search(i % 2 ? 'vo cung be' : 'chuyển động');
  samples.push(performance.now() - started);
}
samples.sort((a, b) => a - b);
const p95 = samples[Math.floor(samples.length * 0.95)];
assert.ok(raw.length <= 2 * 1024 * 1024, `raw index ${raw.length} exceeds 2 MiB`);
const parsedProxy = Buffer.byteLength(JSON.stringify(index), 'utf8') * 2;
assert.ok(parsedProxy <= 4 * 1024 * 1024, `parsed proxy ${parsedProxy} exceeds 4 MiB`);
assert.ok(p95 <= 50, `p95 query ${p95.toFixed(2)}ms exceeds 50ms`);

console.log(`search performance: PASS (raw=${raw.length}, parsed-proxy=${parsedProxy}, p95=${p95.toFixed(2)}ms)`);
