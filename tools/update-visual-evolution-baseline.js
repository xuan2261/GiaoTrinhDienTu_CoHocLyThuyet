#!/usr/bin/env node
/**
 * Phase 09 backlog — update tier-2 visual evolution baseline.
 *
 * Generates the no-dependency JSON pixel-diff fallback baseline used by
 * tests/sim-canvas-pixelmatch.spec.js. By default, this refuses to normalize
 * visual drift; pass --accept-drift only after reviewing the change.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BASELINE_PATH = path.join(
  ROOT,
  'qa-verification',
  'visual-evolution-baseline',
  'per-route-visual-evolution-baseline.json'
);
const RESULTS_PATH = path.join(
  ROOT,
  'qa-verification',
  'visual-evolution-baseline',
  'visual-evolution-results.json'
);

function main() {
  const acceptDrift = process.argv.includes('--accept-drift');
  fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });

  const run = spawnSync(
    'npx',
    ['playwright', 'test', 'tests/sim-canvas-pixelmatch.spec.js'],
    {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: Object.assign({}, process.env, {
        SIM_UPDATE_VISUAL_BASELINE: '1',
        SIM_ACCEPT_VISUAL_BASELINE_DRIFT: acceptDrift ? '1' : '0',
      }),
    }
  );
  if (run.status !== 0) {
    console.error('[visual-evolution-baseline] capture failed; baseline NOT updated.');
    console.error('[visual-evolution-baseline] If this is intentional drift, review the visual change and rerun with --accept-drift.');
    process.exit(run.status || 1);
  }
  if (!fs.existsSync(RESULTS_PATH)) {
    console.error('[visual-evolution-baseline] results missing; baseline NOT updated.');
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  results.generated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(results, null, 2) + '\n');
  console.log(
    `[visual-evolution-baseline] updated ${Object.keys(results.routes || {}).length} routes at ${BASELINE_PATH}`
  );
}

main();
