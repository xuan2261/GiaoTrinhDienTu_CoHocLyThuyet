#!/usr/bin/env node
const { spawnSync } = require('child_process');

const commands = [
  `"${process.execPath}" tests/sim-review-2026-05-19/physics-invariants.test.js`,
  'npx playwright test tests/sim-review-2026-05-19',
];

let failed = 0;
for (const command of commands) {
  const result = spawnSync(command, { stdio: 'inherit', shell: true });
  if (result.error) {
    console.error(result.error.message);
    failed = 1;
    continue;
  }
  if (result.status !== 0) failed = result.status || 1;
}

process.exit(failed);
