# Phase 03 `ch2-4-4` Coriolis 3D

## Context Links

- `js/sim2/sims/ch2/ch2-4-4.js`
- `js/sim2/physics/kinematics.js`
- `docs/design-guidelines.md`

## Overview

Priority: P1
Status: Complete
Effort: 6h
Goal: add optional 3D view that clarifies `a_cor = 2 omega x v_rel`.

## Key Insights

- Highest concept value, highest clutter risk.
- Must teach perpendicular vector relation, not produce a busy amusement-park scene.
- Use Sim2 palette meanings: `omega/moment`, `v`, `coriolis`.

## Requirements

- Existing Sim2 route remains default and canonical.
- 3D shows rotating frame, relative velocity vector, angular velocity vector, and Coriolis acceleration vector.
- Avoid vector clutter; use color tokens matching Sim2.
- No duplicate Coriolis physics.
- Capped trail only. No accumulating unbounded geometry.
- Reduced-motion should keep state readable and avoid non-essential trail/motion effects.

## Architecture

3D scene:
- rotating platform/grid.
- moving bead/point.
- `omega` axis vector.
- `v_rel` and `a_cor` perpendicular vectors.
- optional trail of absolute path, capped.
- adapter receives existing route state and writes `__SIM3_DEBUG__['ch2-4-4']`.

## Related Code Files

Modify:
- `js/sim2/sims/ch2/ch2-4-4.js`
- `index.html`
- `tests/fixtures/sim2-ch2.html`
- `tests/sim3-pilot-fallback-dispose.spec.js`

Create:
- `js/sim3/sims/ch2-4-4-3d.js`

Delete:
- None.

## Implementation Steps

1. RED: test 3D toggle, one canvas, and debug state for `omega`, `vRel`, `aCor`.
2. RED: move relevant slider/control and assert vector magnitudes/directions update.
3. RED: repeated 2D/3D toggle does not duplicate platform, trail, or canvas.
4. GREEN: build minimal rotating platform, bead, axis, 3 vectors.
5. GREEN: cap trail points and clear/collapse trail on reset/dispose.
6. GREEN: wire existing route state; do not recalculate physics in adapter beyond vector placement.
7. VERIFY: browser visual check for overlap from desktop and mobile fixture widths.
8. VERIFY: run `npm run test:sim3:pilot`.

## Todo List

- [x] Add RED tests.
- [x] Implement adapter.
- [x] Verify vector readability.
- [x] Verify trail cap/reset/dispose.
- [x] Capture visual.

## Success Criteria

- `v_rel`, `omega`, and `a_cor` are readable and not overlapping.
- Existing canvas trail route behavior remains unchanged in 2D.
- Test proves 3D state follows existing route controls.
- Trail cannot leak DOM/geometry over route switches.

## Risk Assessment

- Vector clutter: show only 3 core vectors plus optional short trail.
- Motion confusion: avoid camera animation; animate object/frame only.
- Performance: cap trail and dispose geometries/materials.

## Security Considerations

No external assets.

## Next Steps

Proceed to `ch3-5-3`.
