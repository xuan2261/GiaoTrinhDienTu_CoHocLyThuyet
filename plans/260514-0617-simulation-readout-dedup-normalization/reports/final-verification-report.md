# Final Verification Report

Date: 2026-05-14

## Implementation Summary

- Added `readoutPolicy` in `js/sim-professional-lab.js` for `appendMode`, `appendAlpha`, `appendControls`, and `appendTime`.
- Removed confirmed duplicate alias readouts in Ch1 and Ch3 by disabling blanket control echo where explicit physics outputs exist.
- Normalized Ch2/Ch3 scene readouts so controls appear only as explicit pedagogical readouts.
- Fixed `ch2-1-3`: `a_n` and `ρ` now display distinct values with units.
- Fixed Ch2 angular velocity readout units so `omega/omega2` display `rad/s`, not linear `m/s`.
- Preserved intentional equalities: `R_A/R_B`, `m1/m2`, `p trước/p sau`.
- Made baseline report writing opt-in via `READOUT_BASELINE_KIND` so normal browser test runs do not mutate plan reports.
- Added regression coverage that control/generic cards must be explicit scene readouts or policy allowed.

## Snapshot Evidence

| Artifact | Result |
|---|---|
| `readout-baseline-before.json` | Captured 58 routes before cleanup |
| `readout-baseline-before.md` | Duplicate aliases documented |
| `readout-baseline-after.json` | Captured 58 routes after cleanup |
| `readout-baseline-after.md` | No forbidden duplicate aliases |

## Verification

| Command | Result |
|---|---|
| `npx playwright test tests/simulation-browser.spec.js --grep "readout dedup forbidden duplicate aliases"` before implementation | FAIL on `ch1-2-3` |
| `npm run test:sim:unit` | PASS |
| `npx playwright test tests/simulation-browser.spec.js --grep "readout dedup"` | PASS, 6 tests |
| `npm run test:sim:browser:route-mount` | PASS, 59 tests |
| `npm run test:sim:browser` | PASS, 185 tests |
| `npm run test:sim:semantic` | PASS |
| `npm run test:sim:visual-quality` | PASS, 4 tests |
| `npm run test:sim:disposal` | PASS |
| `python tools\audit.py` | PASS, 102 files, 0 warnings, 0 errors |

## Notes

- Full `npm run test:sim:release` was not run as one monolithic command; its relevant gates were run individually after the engine change.
- Post-review targeted fixes added formula consistency coverage for `ch2-1-3` (`a_n = v²/ρ`) and angular velocity unit coverage for `ch2-2-2`/`ch2-3-2`.
- No public route count, renderer/behavior contract, or shell layout contract changed.

## Unresolved Questions

- None.
