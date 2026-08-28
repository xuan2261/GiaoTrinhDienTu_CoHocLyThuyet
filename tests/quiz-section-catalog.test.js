const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PYTHON = process.env.PYTHON || 'python';
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

function generatedCatalog() {
  const code = [
    'import json, os, sys',
    `sys.path.insert(0, ${JSON.stringify(path.join(ROOT, 'tools'))})`,
    'import update_nav',
    `chapters = update_nav.scan_chapters(${JSON.stringify(ROOT)})`,
    'print(json.dumps(update_nav.chapter_sections(chapters), ensure_ascii=False))',
  ].join('; ');
  const result = childProcess.spawnSync(PYTHON, ['-c', code], { cwd: ROOT, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function renderedCatalog() {
  const app = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
  const match = app.match(/window\.CHAPTER_SECTIONS = (\{[\s\S]*?\});/);
  assert.ok(match, 'js/app.js must contain the generated CHAPTER_SECTIONS assignment');
  return JSON.parse(match[1]);
}

const expected = generatedCatalog();
const actual = renderedCatalog();
assert.deepStrictEqual(actual, expected, 'generated section catalog must match the navigation scan exactly');

for (const chapter of ['ch1', 'ch2', 'ch3']) {
  const sections = actual[chapter];
  assert.strictEqual(sections.length, 7, `${chapter} must expose every I–VII section`);
  assert.deepStrictEqual(sections.map(section => section.id), ROMAN, `${chapter} must preserve Roman section order`);
  assert.ok(sections.every(section => section.routeId === `${chapter}-${ROMAN.indexOf(section.id) + 1}` && section.title), `${chapter} catalog records must provide route IDs and titles`);

  const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', `quiz-${chapter}.json`), 'utf8'));
  const items = bank.items || bank;
  const available = new Set(items.map(item => item.section));
  assert.deepStrictEqual(sections.map(section => section.id), ROMAN.filter(id => available.has(id)), `${chapter} catalog must be compatible with the quiz bank`);
}

console.log('quiz section catalog: PASS');
