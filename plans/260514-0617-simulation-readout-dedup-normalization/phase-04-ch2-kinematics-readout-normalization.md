# Phase 04 - Ch2 Kinematics Readout Normalization

## Context Links

- [Research Synthesis](./research/research-synthesis.md)
- `js/sims/ch2/ch2-kinematics-scenes.js`
- `js/sims/ch2/ch2-kinematics-behaviors-a.js`
- `js/sims/ch2/ch2-kinematics-behaviors-b.js`
- `docs/system-architecture.md`

## Overview

Priority: P0. Status: Complete. Normalize Ch2 readouts so kinematics outputs are clear, controls are not repeated, and `ch2-1-3` separates `a_n` from `rho`.

## Key Insights

- Ch2 routes often show 7 cards due to generic `mode`, `α`, `omega`, route slider, `time`.
- Some time/mode cards are useful, but not every route needs all.
- `ch2-1-3` currently seeds `an=104` and `rho=104`, misleading because `a_n` and `rho` are different concepts.

## Requirements

- Functional: Apply explicit `readoutPolicy` to all 15 Ch2 scenes.
- Functional: Keep time card only where time cursor/animation is part of objective.
- Functional: Do not auto-append `omega` or route slider unless explicitly pedagogical.
- Functional: Fix `ch2-1-3` so `a_n = v^2 / rho` and `a_n !== rho` by default.
- Functional: Add units for `a_t`, `a_n`, `rho`, velocity magnitudes where practical.
- Non-functional: Preserve direct drag/readout stability.

## Architecture

```text
Ch2 scene readouts
  particle routes -> position/velocity/accel/time if needed
  rotation routes -> omega/epsilon/velocity ratio outputs
  relative routes -> vector magnitudes and Coriolis outputs
  checker routes -> status/error/step outputs
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `js/sims/ch2/ch2-kinematics-scenes.js` |
| Possibly modify | `js/sims/ch2/ch2-kinematics-behaviors-a.js` |
| Possibly modify | `js/sims/ch2/ch2-kinematics-behaviors-b.js` |
| Modify | `tests/simulation-browser.spec.js` |
| Possibly modify | `tests/phase-08-tdd.test.js` |

## Implementation Steps

1. Add Ch2 scene-level policy defaults: no generic mode/alpha unless listed in route readouts.
2. Decide per route whether `appendTime` is true:
   - likely true for `ch2-1-*`, `ch2-2-2`, `ch2-3-2` if animation/time cursor visible.
   - likely false for static checker/context routes unless objective needs it.
3. Convert important inputs to explicit readouts only when learner needs them.
4. Recompute `ch2-1-3` initial state:
   - choose `rho` and `speed` so `an = speed * speed / rho`.
   - avoid equal default display values.
   - ensure renderer handle starts valid.
5. Add targeted tests for `ch2-1-3` values and Ch2 card count/noise.

## Todo List

- [x] Add Ch2 readout policies.
- [x] Remove automatic `omega`/slider echoes from readouts.
- [x] Fix `ch2-1-3` seed and units.
- [x] Verify Ch2 direct drag still updates readouts.
- [x] Keep necessary time cards where meaningful.

## Verify / Tests

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "Ch2 readout dedup"
npx playwright test tests/simulation-browser.spec.js --grep "direct drag"
node tests/phase-08-tdd.test.js
npm run test:sim:browser:route-mount
```

Target assertions:

```text
ch2-1-3:
  readouts include a_t, a_n, rho
  displayed a_n != displayed rho
  formula relation within tolerance
  no duplicate control echo for rho unless intentionally explicit
```

## Success Criteria

- Ch2 readout cards are shorter and concept-first.
- `ch2-1-3` no longer teaches accidental equality.
- Existing drag/slider behavior remains coupled.

## Risk Assessment

- Risk: time card removal weakens animation feedback. Mitigation: per-route opt-in and browser play/pause test.
- Risk: changing seed affects visual layout. Mitigation: screenshot/visual-quality route checks.

## Security Considerations

- No new persistence or external data.
- Numeric formatting only.

## Next Steps

- Phase 05 handles Ch3 dynamics/readout policy.
