---
date: 2026-05-14
topic: simulation-readout-dedup-normalization
plan: plans/260514-0617-simulation-readout-dedup-normalization/plan.md
---

# Simulation Readout Dedup Normalization

## Context

58 simulation routes had readout cards mixing physics outputs with auto-added control/time/generic cards. Several routes showed duplicate aliases for the same quantity, especially Ch1 support/force cases and Ch3 theorem selector.

## What Happened

- Added `readoutPolicy` to `SimProfessionalLab` for mode, alpha, controls, and time append behavior.
- Normalized Ch1, Ch2, and Ch3 scene readouts so learner-facing cards prioritize physics outputs/status.
- Fixed `ch2-1-3` so `a_n` and `rho` display as different concepts with units.
- Fixed Ch2 angular velocity readout units so `omega/omega2` display `rad/s`.
- Added before/after readout baseline artifacts and `@readout-dedup` browser gates.
- Updated docs, changelog, roadmap, plan phases, and final verification report.

## Decisions

- Keep engine defaults backward-compatible, but active routes must use explicit readouts or route policy to avoid undeclared control echo.
- Keep intentional equalities when they express physics symmetry/conservation: `R_A/R_B`, `m1/m2`, `p trước/p sau`.
- Make baseline report writing opt-in via `READOUT_BASELINE_KIND` so normal browser QA does not mutate plan reports.

## Verification

- `npm run test:sim:unit` PASS.
- `npx playwright test tests/simulation-browser.spec.js --grep "readout dedup"` PASS: 6 tests.
- `npm run test:sim:browser` PASS: 185 tests.
- `npm run test:sim:semantic` PASS.
- `npm run test:sim:visual-quality` PASS: 4 tests.
- `npm run test:sim:disposal` PASS.
- `python tools\audit.py` PASS: 102 files, 0 warnings, 0 errors.

## Next

- No unresolved correctness question.
