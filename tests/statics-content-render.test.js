// CPU rendering guard for corrected Chapter 1 TeX; not a browser layout claim.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const katex = require('../lib/katex/katex.min.js');
const root = path.resolve(__dirname, '..');
const files = ['muc-I-2', 'muc-I-4', 'muc-IV-2', 'muc-IV-3', 'muc-V-3', 'muc-V-4', 'muc-VI-2', 'muc-VII-1'];
let count = 0;
for (const file of files) {
  const formulas = JSON.parse(execFileSync(process.env.PYTHON || 'python', [path.join(root, 'tools/extract_tex_for_validation.py'), path.join(root, 'chapters/ch1', file + '.html')], {encoding:'utf8'}));
  for (const formula of formulas) {
    const math = formula.math;
    let rendered;
    assert.doesNotThrow(() => {
      rendered = katex.renderToString(math, {throwOnError: true, output: 'htmlAndMathml', strict: 'error', displayMode: formula.display});
    }, `${file}: ${math}`);
    assert.match(rendered, /<math /, `${file}: accessible MathML output`);
    assert.doesNotMatch(rendered, /katex-error/, `${file}: no KaTeX error span`);
    count++;
  }
}
assert.ok(count > 50, 'exercise and reduction repairs should supply their equations');
console.log(`Chapter 1 CPU KaTeX rendering: PASS (${count} formulas; browser layout unverified)`);
