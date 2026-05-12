# 2026-05-12 - DeCuong Phase 09-12 Final Release

## Context

Executed `ck:cook plans/260512-0845-decuong-simulation-full-rebuild/plan.md --auto --tdd`.

Scope covered final phases:
- Phase 09: CH2 exercise/checker routes `ch2-7-1`, `ch2-7-2`.
- Phase 10: CH3 Newton/ODE routes `ch3-1-2` to `ch3-4-2`.
- Phase 11: CH3 theorem/collision routes `ch3-5-1` to `ch3-6-3`.
- Phase 12: CH3 exercise/checker routes `ch3-7-1`, `ch3-7-2` and 58-route release.

## Changes

- Added `tests/phase-09-12-tdd.test.js` and wired it into `npm run test:sim:unit`.
- Fixed CH2 exercise math:
  - `ch2-7-1` solver step is bounded to 3 panels.
  - `ch2-7-1` and `ch2-7-2` use one `omega` derivative chain for `x/v/a`.
  - `ch2-7-2` renderer table now honors `x0`, `amplitude`, and `omega`.
- Fixed CH3 dynamics state:
  - `ch3-3-1` starts with visible spring energy.
  - `ch3-3-2` creates and records both trajectory arrays.
  - `ch3-7-2` zero residual scale remains score 100.
- Synced plan and docs to Phase 00-12 complete.

## Verification

Passed:
- `npm run test:sim:unit`
- CH2 15-route manifest/scene/renderer/runtime smokes
- CH3 Phase 10 strict scene/renderer gates
- CH3 Phase 11 strict scene/renderer gates
- CH3 runtime smoke with mount rollback, listener cleanup, RAF cleanup
- `npm run test:sim:browser`: 163 passed
- `npm run test:sim:visual-quality`: 4 passed
- `npm run test:sim:release`
- content audit, strict equation audit, strict KaTeX mapping validation
- independent tester validation

## Follow-up

- Commit must include untracked `tests/phase-09-12-tdd.test.js` because `package.json` calls it.
- Phase 12 all-chapter screenshot evidence was not generated in this run.
