const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOOL = path.join(ROOT, 'tools', 'validate_accessibility_review.py');
const PYTHON = process.env.PYTHON || 'python';

function run(root) {
  return childProcess.spawnSync(PYTHON, [TOOL, '--root', root, '--require-complete'], { encoding: 'utf8' });
}

const current = run(ROOT);
assert.notStrictEqual(current.status, 0, 'pending baseline must not pass independent review');
assert.match(current.stderr, /independent accessibility review incomplete/i);

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'accessibility-review-'));
try {
  fs.mkdirSync(path.join(temp, 'data'), { recursive: true });
  fs.mkdirSync(path.join(temp, 'evidence'), { recursive: true });
  const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'accessibility-baseline.json'), 'utf8'));
  baseline.manualReview.status = 'completed-independent-review';
  baseline.manualReview.reviewer = { role: 'Independent accessibility reviewer', affiliation: 'External accessibility unit' };
  baseline.manualReview.environment = 'Windows, Chromium, NVDA';
  baseline.manualReview.evidenceRefs = ['evidence/manual-review.txt'];
  for (const item of [...baseline.criteria, ...baseline.additionalContracts]) item.manualStatus = 'passed';
  fs.writeFileSync(path.join(temp, 'data', 'accessibility-baseline.json'), JSON.stringify(baseline));
  fs.writeFileSync(path.join(temp, 'evidence', 'manual-review.txt'), 'independent review evidence');
  const complete = run(temp);
  assert.strictEqual(complete.status, 0, complete.stdout + complete.stderr);

  fs.rmSync(path.join(temp, 'evidence', 'manual-review.txt'));
  const missing = run(temp);
  assert.notStrictEqual(missing.status, 0, 'missing review evidence must fail');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

console.log('accessibility independent review gate: PASS');
