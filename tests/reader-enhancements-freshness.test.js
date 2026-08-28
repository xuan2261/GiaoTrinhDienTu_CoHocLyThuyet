const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}

function normalizeLineEndings(value) {
  return value.replace(/\r\n/g, '\n');
}

const app = read('js/app.js');
const catalogMatch = app.match(/window\.CHAPTER_SECTIONS = (\{[\s\S]*?\});/);
assert.ok(catalogMatch, 'navigation output must expose CHAPTER_SECTIONS');
const catalog = JSON.parse(catalogMatch[1]);
assert.deepStrictEqual(Object.keys(catalog), ['ch1', 'ch2', 'ch3']);
assert.ok(Object.values(catalog).every(sections => sections.length === 7), 'catalog must retain all 21 sections');

const bundle = read('js/pages.js');
const bundleContext = {};
vm.runInNewContext(`${bundle}\nglobalThis.__pages = PAGES;`, bundleContext);
const pages = bundleContext.__pages;

for (const chapter of [1, 2, 3]) {
  const quizPath = `chapters/ch${chapter}/trac-nghiem.html`;
  const quiz = read(quizPath);
  assert.ok(!fs.existsSync(path.join(ROOT, `chapters/ch${chapter}/on-tap-trac-nghiem.html`)), `${chapter} obsolete quiz fragment must be absent`);
  assert.strictEqual(pages[`ch${chapter}-quiz`], normalizeLineEndings(quiz), `${quizPath} must be fresh in the offline bundle`);

  const indexPath = `chapters/ch${chapter}/index.html`;
  const index = read(indexPath);
  assert.strictEqual((index.match(/class="chapter-reference"/g) || []).length, 1, `${indexPath} must contain exactly one rendered reference section`);
  assert.strictEqual(pages[`ch${chapter}`], normalizeLineEndings(index), `${indexPath} must be fresh in the offline bundle`);
}

const reference = read('data/chapter-reference.json');
const manifest = JSON.parse(read('data/content-manifest.json'));
assert.deepStrictEqual(manifest.source.chapterReference, {
  logicalPath: 'data/chapter-reference.json',
  sha256: crypto.createHash('sha256').update(reference).digest('hex'),
});

console.log('reader enhancements freshness: PASS');
