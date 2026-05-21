#!/usr/bin/env node
/**
 * Phase 09 → Phase 04 — regenerate the canvas-evolution baseline.
 *
 * Runs the sweep spec, copies sweep-results.json over the baseline, and
 * prints a diff so the human can spot accidental drift before committing.
 * Treat this as a deliberate "I have reviewed the diff" action.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (e) { return null; }
}

function summarize(routes) {
  const stats = { total: 0, animated: 0, staticCh1: 0, staticConcept: 0, defective: 0 };
  for (const id of Object.keys(routes || {})) {
    stats.total++;
    const r = routes[id];
    if (r.bucket === 'animated') stats.animated++;
    if (r.bucket === 'static-ch1') stats.staticCh1++;
    if (r.bucket === 'static-concept') stats.staticConcept++;
    if (r.knownDefect) stats.defective++;
  }
  return stats;
}

function main() {
  const before = readJson(BASELINE_PATH) || { routes: {} };
  console.log('[update-baseline] running playwright sweep…');
  const playwright = spawnSync(
    'npx',
    ['playwright', 'test', 'tests/sim-canvas-evolution.spec.js'],
    { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' }
  );
  if (playwright.status !== 0) {
    console.error('[update-baseline] sweep spec failed; baseline NOT updated.');
    process.exit(playwright.status || 1);
  }
  const fresh = readJson(RESULTS_PATH);
  if (!fresh) {
    console.error('[update-baseline] sweep-results.json missing after sweep.');
    process.exit(1);
  }
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(fresh, null, 2) + '\n');
  const after = summarize(fresh.routes);
  const prev = summarize(before.routes);
  console.log('[update-baseline] baseline updated.');
  console.log(
    `  routes: ${after.total} (was ${prev.total})  animated: ${after.animated}  `
    + `static-ch1: ${after.staticCh1}  static-concept: ${after.staticConcept}  `
    + `defective: ${after.defective}`
  );
}

main();
