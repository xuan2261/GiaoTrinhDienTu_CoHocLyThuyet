# QA Evidence

Generated: 2026-05-14

## Summary

All targeted and release gates passed after canvas overlay cleanup.

| Command | Result | Evidence |
|---|---|---|
| `npx playwright test tests/simulation-browser.spec.js --grep=@overlay-contract` | PASS | 1 test; scans 58/58 routes internally; rejects `.sim-overlay-formula` and all non-short label/panel overlay text |
| `npx playwright test tests/simulation-browser.spec.js --grep=@route-mount` | PASS | 59 tests |
| `npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch1-2-3 resultant|numeric checker residual"` | PASS | 2 tests |
| `npm run test:sim:unit` | PASS | `node --check: 104 JS files PASS`; unit/regression suites PASS |
| `npm run test:sim:semantic` | PASS | scene identity + renderer contract PASS |
| `npm run test:sim:visual-quality` | PASS | 4 tests |
| `npm run test:sim:browser` | PASS | 188 tests |
| `npm run test:sim:release` | PASS | unit + quality + browser + visual + disposal + audits + equation validation |

## TDD Evidence

- Pre-fix `@overlay-contract` failed with 145 offenders across formula/value overlay nodes.
- First post-fix `@overlay-contract` passed for formula/value regex but code review found dynamic status/progress blind spots.
- Final post-fix `@overlay-contract` passed with no `.sim-overlay-formula` and no non-short label/panel text in `.sim-lab-overlay`.

## Contract Verified

- 58/58 routes mount.
- Canvas overlay contains no learner-facing formula/value/status/progress DOM.
- Formula context remains in `.sim-formula-panel`.
- Dynamic values remain in `.sim-readout-card`.
- Direct drag/readout representative regressions pass.

## Unresolved Questions

None.
