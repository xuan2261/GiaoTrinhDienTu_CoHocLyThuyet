# 2026-05-12 - DeCuong Phase 08 CH2 Relative/Plane Motion

## Context

Executed `ck:cook` for `plans/260512-0845-decuong-simulation-full-rebuild/plan.md --auto --tdd`.

Phase 08 rebuilt 7 CH2 routes:
- `ch2-4-1` to `ch2-4-4`: relative motion, velocity composition, velocity triangle, Coriolis acceleration.
- `ch2-5-1` to `ch2-5-3`: plane motion, instant center, velocity distribution.

## Changes

- Added `tests/phase-08-tdd.test.js` and wired it into `npm run test:sim:unit`.
- Reworked Phase 08 behavior contracts so core invariants are explicit:
  - `v_a = v_e + v_r`
  - `a_c = 2 omega x v_r`
  - `v_B = v_A + omega x AB`
  - `v = omega x r_IC`
- Updated CH2 relative/plane renderers with DeCuong-style trails, KaTeX equations, vector triangles, Coriolis frame, IC marker, and velocity distribution arrows.
- Fixed code-review issues around UI-contract state:
  - `vrMag`, `phi`, and `theta` controls now drive model state.
  - `|v_a|`, `|a_c|`, `|v_A|`, and `|v_B|` readouts use scalar keys.
  - Direct drag recomputes dependent velocity vectors/magnitudes immediately while paused.

## Verification

Passed:
- `npm run test:sim:unit`
- strict `ch2-4/ch2-5` scene catalog
- strict `ch2-4/ch2-5` renderer contract
- all-route `@direct-drag-audit`
- all-route `@control-audit`
- focused visual-quality tags
- `npm run test:sim:browser` earlier in the run: 163 passed
- `npm run test:sim:visual-quality` earlier in the run: 4 passed
- `python tools/audit.py`
- independent tester re-validation
- final narrow code re-review: no remaining findings

## Follow-up

- Next plan work: Phase 09 CH2 exercises QA gate or CH3 Phase 10.
