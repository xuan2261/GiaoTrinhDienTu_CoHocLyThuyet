# Phase 10 Chapter 3 Fundamentals Differential Labs

## Context Links

- [Plan](./plan.md)
- [Coverage Matrix](../20260506-1045-interactive-mechanics-simulation-expansion/research/simulation-coverage-matrix.md)

## Overview

Priority: P1. Status: Completed. Pro-upgraded Ch3 I-IV routes into professional dynamics labs: force-motion, frames, Newton laws, dynamic FBD, differential equations, forward/inverse dynamics.

## Routes In Scope

`ch3-1-2`, `ch3-1-3`, `ch3-2-1`, `ch3-2-2`, `ch3-2-3`, `ch3-2-5`, `ch3-3-1`, `ch3-3-2`, `ch3-4-1`, `ch3-4-2`.

## Requirements

Functional:
- Force/motion labs use draggable force vector and mass/body state.
- Frame lab compares inertial/non-inertial with pseudo-force layer.
- Newton laws include direct action/reaction and dynamic FBD builder.
- Differential labs show numerical trajectory + graph + equation residual.
- Inverse dynamics maps prescribed motion to required force.

Non-functional:
- Formula tests for `F=ma`, pseudo force, integrator sanity, inverse dynamics.
- Animation stable and deterministic.
- No runaway RAF after navigation.

## Architecture

Create route/topic modules:
- `js/sims/ch3/newton-frame-labs.js`
- `js/sims/ch3/dynamic-fbd-labs.js`
- `js/sims/ch3/differential-motion-labs.js`
- `js/sims/ch3/inverse-dynamics-labs.js`

## Related Code Files

Modify:
- Ch3 topic modules above
- `js/sim-route-manifest.js`
- `js/simulations.js`
- `tests/simulation-physics.test.js`
- `tools/smoke_simulation_runtime.py`

## Implementation Steps

1. Upgrade force-motion and inertia labs with direct force/body manipulation.
2. Upgrade frame lab with movable accelerating frame and pseudo-force assessment.
3. Upgrade Newton/FBD labs with drag force/reaction vectors.
4. Upgrade differential labs with timeline/graph cursor, energy/state readout.
5. Upgrade forward/inverse dynamics with scenario selector and computed force check.
6. Add animation cleanup tests.

## Todo List

- [x] Upgrade 10 route UIs.
- [x] Add 26+ checkpoints.
- [x] Add Ch3 dynamics formula tests.
- [x] Add animation lifecycle tests.

## Verify / Tests

```powershell
Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
npm run test:sim:unit -- --grep ch3-fundamentals
python tools\smoke_simulation_runtime.py --check-raf-cleanup --routes ch3-2-2,ch3-3-1
python tools\smoke_simulation_manifest.py --routes ch3-1-2,ch3-1-3,ch3-2-1,ch3-2-2,ch3-2-3,ch3-2-5,ch3-3-1,ch3-3-2,ch3-4-1,ch3-4-2 --require-direct --require-checkpoints-min 2
npm run test:sim:browser -- --grep @ch3-fundamentals
```

## Success Criteria

- Ch3 I-IV routes upgraded.
- Differential/inverse labs have graph + direct timeline interaction.
- RAF cleanup remains correct.

## Risk Assessment

Risk: Euler integration inaccurate in teaching context. Mitigation: label numerical method, keep simple scenarios, add sanity tests against closed-form cases.

## Security Considerations

Clamp input to finite values; avoid `eval` for motion formulas.

## Next Steps

Completed. See [plan](./plan.md) and [final QA report](./reports/final-qa-report.md).
