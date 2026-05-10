# Phase 09 Chapter 2 Relative Plane Motion Checkers

## Context Links

- [Plan](./plan.md)
- [Phase 08](./phase-08-chapter-2-particle-rotation-transmission-labs.md)

## Overview

Priority: P1. Status: Completed. Pro-upgraded Ch2 IV-VII routes: relative motion, acceleration composition/Coriolis, plane motion, instant center, velocity distribution, guided/numeric checkers.

## Routes In Scope

`ch2-4-1`, `ch2-4-2`, `ch2-4-3`, `ch2-4-4`, `ch2-5-1`, `ch2-5-2`, `ch2-5-3`, `ch2-7-1`, `ch2-7-2`.

## Requirements

Functional:
- Relative motion labs allow dragging moving frame/object and observing absolute/relative/transport vectors.
- Coriolis lab shows component vector build-up and zero-condition challenge.
- Plane motion labs allow direct instant center placement and velocity vector checks.
- Checkers use graph/vector checkpoints, not only numeric input.

Non-functional:
- At least 24 checkpoints across routes.
- Touch drag works at 375x812.
- Formula tests for velocity/acceleration composition and slider-crank velocity.

## Architecture

Create route/topic modules:
- `js/sims/ch2/relative-motion-labs.js`
- `js/sims/ch2/acceleration-composition-labs.js`
- `js/sims/ch2/plane-motion-labs.js`
- `js/sims/ch2/kinematics-checker-labs.js`

## Related Code Files

Modify:
- Ch2 topic modules above
- `js/sim-route-manifest.js`
- `js/simulations.js`
- `tests/simulation-physics.test.js`

## Implementation Steps

1. Upgrade scenario selector into draggable moving-frame scenes.
2. Upgrade absolute/relative/transport toggle into layer visibility + direct state manipulation.
3. Upgrade velocity composition with vector triangle drag.
4. Upgrade acceleration composition with Coriolis vector builder.
5. Upgrade rolling/plane motion with contact point/instant-center direct manipulation.
6. Upgrade slider-crank with timeline/handle drag and velocity projections.
7. Upgrade Ch2 checkers with graph cursor and vector direction checkpoints.

## Todo List

- [x] Upgrade 9 route UIs.
- [x] Add 24+ checkpoints.
- [x] Add Ch2 composition tests.
- [x] Add mobile drag browser tests.

## Verify / Tests

```powershell
Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
npm run test:sim:unit -- --grep ch2-relative
python tools\smoke_simulation_manifest.py --routes ch2-4-1,ch2-4-2,ch2-4-3,ch2-4-4,ch2-5-1,ch2-5-2,ch2-5-3,ch2-7-1,ch2-7-2 --require-direct --require-checkpoints-min 2
python tools\audit_simulation_quality.py --routes ch2 --max-js-lines 220
npm run test:sim:browser -- --grep @ch2-relative
```

## Success Criteria

- All 15 Ch2 current sim routes upgraded.
- Relative/plane motion labs can be solved by direct manipulation.
- Checkers use mixed assessment types.

## Risk Assessment

Risk: Coriolis visualization can be conceptually hard. Mitigation: component build-up with toggle layers and zero-condition checkpoint.

## Security Considerations

No external data. Clamp all drag positions.

## Next Steps

Completed. See [plan](./plan.md) and [final QA report](./reports/final-qa-report.md).
