/**
 * TDD guard for KaTeX strict configuration across the runtime JS surface.
 *
 * KaTeX default strict='warn' floods console with `unicodeTextInMathMode` +
 * `unknownSymbol` for Vietnamese diacritics inside math mode (e.g. "ặ", "ự",
 * "đ", "″"). Source of truth is the DOCX, so per-fragment edits get blown away
 * by the regen pipeline. The fix is a function-based `strict` at every KaTeX
 * call site that silences ONLY those two codes while keeping `warn` for
 * everything else (so real LaTeX bugs still surface).
 *
 * Scope:
 *   - js/loader.js (renderMathInElement + katex.render)
 *   - js/sim-lab-ui.js (katex.render for formula panel)
 *   - js/sim-route-renderer-primitives.js (katex.render for overlay math)
 *
 * Excluded (intentional): equation-review*.html — author-facing review tools
 * where the warn-level noise IS the signal.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const targets = [
  {
    file: 'js/loader.js',
    patterns: [
      /renderMathInElement\(container,\s*\{[\s\S]*?\n\s*\}\)/,
      /katex\.render\(el\.textContent,\s*el,\s*\{[\s\S]*?\n\s*\}\)/
    ]
  },
  {
    file: 'js/sim-lab-ui.js',
    patterns: [
      /window\.katex\.render\(text,\s*panel,\s*\{[\s\S]*?\}\)/
    ]
  },
  {
    file: 'js/sim-route-renderer-primitives.js',
    patterns: [
      /window\.katex\.render\(latex[^,]*,\s*node,\s*\{[\s\S]*?\}\)/
    ]
  }
];

const repoRoot = path.join(__dirname, '..');
let totalChecked = 0;

for (const { file, patterns } of targets) {
  const src = fs.readFileSync(path.join(repoRoot, file), 'utf8');
  for (const pat of patterns) {
    const m = src.match(pat);
    assert.ok(m, `${file}: expected KaTeX call matching ${pat} not found`);
    const block = m[0];
    assert.match(
      block,
      /strict\s*:/,
      `${file}: KaTeX call must configure 'strict'`
    );
    assert.match(
      block,
      /unicodeTextInMathMode/,
      `${file}: strict must reference 'unicodeTextInMathMode'`
    );
    assert.match(
      block,
      /unknownSymbol/,
      `${file}: strict must reference 'unknownSymbol'`
    );
    assert.match(
      block,
      /['"]ignore['"]/,
      `${file}: strict must return 'ignore' for the targeted codes`
    );
    assert.match(
      block,
      /['"]warn['"]/,
      `${file}: strict must preserve 'warn' for other codes (real LaTeX errors)`
    );
    totalChecked++;
  }
}

console.log(
  `OK: ${totalChecked} KaTeX call sites configure strict to silence Vietnamese unicode while preserving real warnings`
);
