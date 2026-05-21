#!/usr/bin/env node
/**
 * Phase 09 → Phase 04 — canvas-evolution baseline drift gate.
 *
 * Compares the freshly written sweep-results.json against the checked-in
 * baseline and exits non-zero on any drift:
 *   - new or missing route ids;
 *   - lastSeenFrames falling outside the route's expectedUniqueFrames window
 *     (after accounting for `knownDefect` tags that intentionally relax the
 *     window for in-flight phases).
 *
 * Updating the baseline is intentional — re-run `npm run
 * test:sim:browser:update-evolution-baseline` after a deliberate change.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASELINE_PATH = path.join(
  ROOT,
  'qa-verification',
  'animation-sweep',
  'per-route-animation-sweep-baseline.json'
);
const RESULTS_PATH = path.join(
  ROOT,
  'qa-verification',
  'animation-sweep',
  'sweep-results.json'
);

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error(`[canvas-evolution] missing ${label} (${filePath}).`);
    if (label === 'sweep-results.json') {
      console.error('Run: playwright test tests/sim-canvas-evolution.spec.js');
    }
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`[canvas-evolution] cannot parse ${label}: ${err.message}`);
    process.exit(1);
  }
}

function inWindow(value, window) {
  if (!Array.isArray(window) || window.length !== 2) return false;
  return value >= window[0] && value <= window[1];
}

function main() {
  const baseline = readJson(BASELINE_PATH, 'baseline');
  const results = readJson(RESULTS_PATH, 'sweep-results.json');
  const failures = [];
  const baselineRoutes = (baseline && baseline.routes) || {};
  const resultRoutes = (results && results.routes) || {};

  for (const routeId of Object.keys(baselineRoutes).sort()) {
    const b = baselineRoutes[routeId];
    const r = resultRoutes[routeId];
    if (!r) {
      failures.push(`${routeId}: missing from sweep results`);
      continue;
    }
    const window = b.expectedUniqueFrames;
    const observed = r.lastSeenFrames;
    if (b.bucket === 'animated' && r.sampleMode !== 'engine-time') {
      failures.push(`${routeId} (${b.bucket}): sampleMode=${r.sampleMode}, expected engine-time`);
    }
    if (!inWindow(observed, window)) {
      // Routes carrying a knownDefect explicitly relax the window — they
      // pass while the in-flight phase has not yet shipped.
      if (b.knownDefect) continue;
      failures.push(
        `${routeId} (${b.bucket}): uniqueFrames=${observed} outside [${window[0]},${window[1]}]`
      );
    }
  }
  for (const routeId of Object.keys(resultRoutes)) {
    if (!baselineRoutes[routeId]) {
      failures.push(`${routeId}: not in baseline (new route?)`);
    }
  }

  if (failures.length) {
    console.error('Canvas evolution baseline drift:');
    for (const f of failures) console.error('  - ' + f);
    console.error(
      'After human review, regenerate via: npm run test:sim:browser:update-evolution-baseline'
    );
    process.exit(1);
  }
  console.log(
    `Canvas evolution baseline OK (${Object.keys(baselineRoutes).length} routes).`
  );
}

main();
