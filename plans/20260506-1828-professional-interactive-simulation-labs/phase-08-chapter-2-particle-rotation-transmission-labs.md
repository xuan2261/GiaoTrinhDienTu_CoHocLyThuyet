# Phase 08 Chapter 2 Particle Rotation Transmission Labs

## Context Links

- [Plan](./plan.md)
- [Coverage Matrix](../20260506-1045-interactive-mechanics-simulation-expansion/research/simulation-coverage-matrix.md)

## Overview

Priority: P1. Status: Completed. Pro-upgraded Ch2 I-III routes into motion labs with draggable timeline/path cursors, vector decomposition, graph readouts, rotation handles, and transmission constraints.

## Routes In Scope

`ch2-1-1`, `ch2-1-2`, `ch2-1-3`, `ch2-1-4`, `ch2-2-2`, `ch2-3-2`.

## Requirements

Functional:
- Particle motion: drag time cursor or point on path; live `r`, `v`, `a`.
- Cartesian graph: draggable graph cursor; synced position on path.
- Natural coordinates: drag M on curve; show tangent/normal and curvature.
- Rotation: drag angular position and radius; play/step controls.
- Gear/belt: drag radii and mode; enforce no-slip relation.

Non-functional:
- Graphs readable on mobile.
- Motion state deterministic and resettable.
- Unit tests for derivative/rotation/transmission formulas.

## Architecture

Create route/topic modules:
- `js/sims/ch2/particle-motion-labs.js`
- `js/sims/ch2/graph-motion-labs.js`
- `js/sims/ch2/natural-coordinate-labs.js`
- `js/sims/ch2/rotation-transmission-labs.js`

## Related Code Files

Modify:
- Ch2 topic modules above
- `js/sim-route-manifest.js`
- `js/simulations.js`
- `tests/simulation-physics.test.js`

## Implementation Steps

1. Upgrade particle path with direct cursor and trail.
2. Upgrade Cartesian graph with linked path/graph cursor.
3. Upgrade natural coordinate lab with curve handle and curvature readout.
4. Upgrade motion preset gallery into scenario cards + direct timeline.
5. Upgrade rotation lab with radius/angle handles and vector overlay.
6. Upgrade gear transmission with direct radius drag and slip/no-slip challenge.

## Todo List

- [x] Upgrade 6 route UIs.
- [x] Add 14+ checkpoints.
- [x] Add formula tests.
- [x] Add browser drag/timeline tests.

## Verify / Tests

```powershell
Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
npm run test:sim:unit -- --grep ch2-particle
python tools\smoke_simulation_manifest.py --routes ch2-1-1,ch2-1-2,ch2-1-3,ch2-1-4,ch2-2-2,ch2-3-2 --require-direct --require-checkpoints-min 2
python tools\audit_simulation_quality.py --routes ch2-1-1,ch2-1-2,ch2-1-3,ch2-1-4,ch2-2-2,ch2-3-2
npm run test:sim:browser -- --grep @ch2-particle
```

## Success Criteria

- All 6 routes use graph/path direct interaction.
- At least one route validates graph reading via checkpoint.
- Transmission relation remains physically correct.

## Risk Assessment

Risk: graphs too dense on phone. Mitigation: single focused graph plus tap/drag cursor, no tiny multi-plot grid on mobile.

## Security Considerations

Validate preset formulas and numeric ranges.

## Next Steps

Completed. See [plan](./plan.md) and [final QA report](./reports/final-qa-report.md).
