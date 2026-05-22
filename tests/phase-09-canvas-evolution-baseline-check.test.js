/**
 * Phase 09 → Phase 04 — baseline JSON shape gate.
 *
 * The drift-check tool consumes this baseline; if the file is malformed the
 * gate fails silently. This Node test asserts the baseline schema:
 *   - 52 learner-facing mountable routes;
 *   - bucket ∈ {static-ch1, static-concept, animated};
 *   - expectedUniqueFrames is [min, max] with min ≤ max;
 *   - lastSeenFrames either matches the window OR carries a knownDefect tag.
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASELINE_PATH = path.join(
  ROOT,
  'qa-verification',
  'animation-sweep',
  'per-route-animation-sweep-baseline.json'
);
const TOTAL_EXPECTED = 52;
const VALID_BUCKETS = new Set(['static-ch1', 'static-concept', 'animated']);

const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
assert.ok(baseline && typeof baseline.routes === 'object', 'baseline.routes missing');
const ids = Object.keys(baseline.routes);
assert.strictEqual(
  ids.length,
  TOTAL_EXPECTED,
  `baseline must list ${TOTAL_EXPECTED} routes, got ${ids.length}`
);

let defects = 0;
let drift = 0;
for (const routeId of ids) {
  const r = baseline.routes[routeId];
  assert.ok(VALID_BUCKETS.has(r.bucket), `${routeId}: bucket "${r.bucket}" invalid`);
  const w = r.expectedUniqueFrames;
  assert.ok(
    Array.isArray(w) && w.length === 2 && Number.isFinite(w[0]) && Number.isFinite(w[1]) && w[0] <= w[1],
    `${routeId}: expectedUniqueFrames must be [min,max] ascending, got ${JSON.stringify(w)}`
  );
  assert.ok(
    Number.isFinite(r.lastSeenFrames),
    `${routeId}: lastSeenFrames must be a number, got ${r.lastSeenFrames}`
  );
  const inWindow = r.lastSeenFrames >= w[0] && r.lastSeenFrames <= w[1];
  if (!inWindow) {
    drift++;
    assert.ok(
      typeof r.knownDefect === 'string' && r.knownDefect.length > 0,
      `${routeId}: lastSeenFrames=${r.lastSeenFrames} outside [${w[0]},${w[1]}] without knownDefect tag`
    );
  }
  if (r.knownDefect) defects++;
}

console.log(
  `phase-09-canvas-evolution-baseline-check.test.js: ${ids.length}/${TOTAL_EXPECTED} routes, `
  + `${defects} defects, ${drift} out-of-window (all defect-tagged) PASS`
);
