# Phase 07 Chapter 1 Supports Friction Centroid Solvers

## Context Links

- [Plan](./plan.md)
- [Phase 06](./phase-06-chapter-1-force-fundamentals-labs.md)

## Overview

Priority: P1. Status: Completed. Pro-upgraded remaining Ch1 routes: support reactions, spatial reduction, beam equilibrium, friction, centroid, and statics solvers.

## Routes In Scope

`ch1-3-1`, `ch1-3-2`, `ch1-3-3`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7`, `ch1-4-1`, `ch1-4-2`, `ch1-4-4`, `ch1-5-1`, `ch1-5-2`, `ch1-5-3`, `ch1-5-4`, `ch1-6-2`, `ch1-6-3`, `ch1-7-1`, `ch1-7-2`.

## Requirements

Functional:
- Support route labs allow learner to choose/drag reaction vectors.
- Friction route labs expose cone, angle, impending motion state.
- Centroid route labs allow direct shape/hole move and balance point readout.
- Solver routes use guided steps: isolate body, choose equations, solve, validate.

Non-functional:
- At least 40 checkpoints across this phase.
- No route only uses passive tabs/buttons.
- Beam/friction formulas unit-tested against worked examples.

## Architecture

Create route/topic modules:
- `js/sims/ch1/support-reaction-labs.js`
- `js/sims/ch1/spatial-force-reduction.js`
- `js/sims/ch1/beam-equilibrium-lab.js`
- `js/sims/ch1/friction-labs.js`
- `js/sims/ch1/centroid-labs.js`
- `js/sims/ch1/statics-solver-labs.js`

## Related Code Files

Modify:
- Ch1 topic modules above
- `js/sim-route-manifest.js`
- `js/simulations.js`
- `tests/simulation-physics.test.js`

## Implementation Steps

1. Upgrade support labs with reaction vector placement/checks.
2. Upgrade spatial reducer with 2.5D vector projection and point/axis selector.
3. Upgrade beam equilibrium with draggable load and equation board.
4. Upgrade friction labs with body drag, cone overlay, stick/slip feedback.
5. Upgrade centroid labs with draggable composite shapes/hole and balance test.
6. Upgrade statics solvers with guided task sequence and numeric validation.
7. Add formula tests for reactions, friction condition, centroid composite area.

## Todo List

- [x] Upgrade 17 route UIs.
- [x] Add 40+ checkpoints.
- [x] Add Ch1 formula unit tests.
- [x] Add browser route smoke.
- [x] Update manifest quality status.

## Verify / Tests

```powershell
Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
npm run test:sim:unit -- --grep ch1
python tools\smoke_simulation_manifest.py --routes ch1 --require-direct --require-checkpoints-min 2
python tools\audit_simulation_quality.py --routes ch1 --max-js-lines 220
npm run test:sim:browser -- --grep @ch1
python tools\audit.py
```

## Success Criteria

- All 25 Ch1 current sim routes upgraded.
- Ch1 has no route with only slider/button interaction.
- Ch1 checkpoint count and formula tests pass.

## Risk Assessment

Risk: spatial 2.5D can mislead. Mitigation: label as projection/2.5D, not full 3D physics.

Risk: solver route becomes long. Mitigation: stepper with compact feedback; no wall of instructions.

## Security Considerations

No network. Numeric inputs sanitized before comparison.

## Next Steps

Completed. See [plan](./plan.md) and [final QA report](./reports/final-qa-report.md).
