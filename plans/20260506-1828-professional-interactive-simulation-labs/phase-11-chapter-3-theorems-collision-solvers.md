# Phase 11 Chapter 3 Theorems Collision Solvers

## Context Links

- [Plan](./plan.md)
- [Phase 10](./phase-10-chapter-3-fundamentals-differential-labs.md)

## Overview

Priority: P1. Status: Completed. Pro-upgraded Ch3 V-VII routes: center of mass, momentum, angular momentum, kinetic energy, collisions, theorem selector, numeric checker.

## Routes In Scope

`ch3-5-1`, `ch3-5-2`, `ch3-5-3`, `ch3-5-4`, `ch3-6-2`, `ch3-6-3`, `ch3-7-1`, `ch3-7-2`.

## Requirements

Functional:
- Momentum/energy labs show before/after states and conservation/loss readout.
- Collision lab allows direct aim/velocity/mass setup on scene.
- Angular momentum lab allows direct radius/mass/torque manipulation.
- Theorem selector maps problem conditions to appropriate theorem.
- Numeric checker uses guided steps with hints and validation.

Non-functional:
- Formula tests for conservation laws and coefficient of restitution.
- Browser tests drag collision setup and verify state changes.
- Visual feedback distinguishes elastic/inelastic cases clearly.

## Architecture

Create route/topic modules:
- `js/sims/ch3/theorem-labs.js`
- `js/sims/ch3/momentum-energy-labs.js`
- `js/sims/ch3/collision-labs.js`
- `js/sims/ch3/dynamics-checker-labs.js`

## Related Code Files

Modify:
- Ch3 topic modules above
- `js/sim-route-manifest.js`
- `js/simulations.js`
- `tests/simulation-physics.test.js`

## Implementation Steps

1. Upgrade center-of-mass theorem with draggable particles/internal force pair.
2. Upgrade momentum lab with impulse timeline and before/after drag.
3. Upgrade angular momentum with radius/torque direct handles.
4. Upgrade kinetic energy with work-distance direct manipulation.
5. Upgrade collision 2D with direct ball placement/aim, mass/e controls, result vectors.
6. Upgrade collision solver with before/after equation panel and checkpoint.
7. Upgrade theorem selector/numeric checker with guided condition selection.

## Todo List

- [x] Upgrade 8 route UIs.
- [x] Add 22+ checkpoints.
- [x] Add Ch3 theorem/collision unit tests.
- [x] Add browser collision direct interaction tests.

## Verify / Tests

```powershell
Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
npm run test:sim:unit -- --grep ch3-theorems
python tools\smoke_simulation_manifest.py --routes ch3-5-1,ch3-5-2,ch3-5-3,ch3-5-4,ch3-6-2,ch3-6-3,ch3-7-1,ch3-7-2 --require-direct --require-checkpoints-min 2
python tools\audit_simulation_quality.py --routes ch3 --max-js-lines 220
npm run test:sim:browser -- --grep @ch3-collision
```

## Success Criteria

- All 18 Ch3 current sim routes upgraded.
- Conservation/loss concepts visible and checkable.
- Collision edge cases remain stable.

## Risk Assessment

Risk: collision physics edge cases. Mitigation: keep existing EPS guard, add overlapping-ball regression tests.

## Security Considerations

No user-generated formulas. Numeric state bounded.

## Next Steps

Completed. See [plan](./plan.md) and [final QA report](./reports/final-qa-report.md).
