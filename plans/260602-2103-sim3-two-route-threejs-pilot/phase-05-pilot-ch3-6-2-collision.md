# Phase 05 Pilot `ch3-6-2` Collision

## Context Links

- [Current route](../../js/sim2/sims/ch3/ch3-6-2.js)
- [Dynamics physics](../../js/sim2/physics/dynamics.js)
- [Ch3 mount tests](../../tests/sim2-ch3-mount.spec.js)

## Overview

Priority: P1  
Status: Pending  
Goal: add 3D collision teaching view after the rotation pilot is stable.

## Key Insights

- Do not duplicate collision physics in Sim3.
- Existing route owns `p1`, `p2`, `v1`, `v2`, `collided`, trails, and readout.
- 3D value is classroom clarity: before/after, impulse cue, restitution effect.

## Requirements

Functional:
- Add `2D | 3D` mode to `ch3-6-2`.
- 3D balls/blocks move from existing positions.
- Impact cue appears after collision.
- `e`, `m1`, `m2` sliders affect route state as today.
- Reset clears 3D impact/trail state.

Non-functional:
- No second collision solver.
- Keep 2D trail/canvas tests valid.

## Architecture

Data flow:

```text
existing frame()
  -> update p1/p2/v1/v2/collided via SimPhysicsDynamics
  -> draw() updates SVG/canvas/panel
  -> sim3.setState({ p1, p2, v1, v2, m1, m2, e, collided, impactPoint })
```

3D scene:
- two colored spheres or rounded blocks on a rail.
- subtle floor/grid.
- before/after trail as lightweight line segments.
- impact flash ring/plane.
- optional restitution badge in 3D corner only if not duplicating panel.

## Related Code Files

Modify:
- `js/sim2/sims/ch3/ch3-6-2.js`
- `tests/sim2-ch3-mount.spec.js` or `tests/sim3-pilot-fallback-dispose.spec.js`

Create:
- `js/sim3/sims/ch3-6-2-3d.js`

Delete:
- None

## Implementation Steps

1. Add route adapter `ch3-6-2-3d.js`.
2. Build scene:
   - rail/floor.
   - body meshes scaled by mass or radius.
   - trail lines capped for performance.
   - impact cue object.
3. Add `setState(state)`:
   - position bodies from existing `p1`, `p2`.
   - update trail buffers.
   - toggle impact cue on `collided`.
4. Wire `ch3-6-2.js`:
   - call adapter in `draw()`.
   - reset adapter in `reset()`.
   - dispose adapter in route dispose.
5. Keep `panel.setReadout()` unchanged except new 3D mode labels if needed.
6. Run focused Ch3 and Sim3 tests.

## Todo List

- [ ] Create `ch3-6-2` 3D adapter.
- [ ] Wire route state into adapter.
- [ ] Add reset/trail/impact tests.
- [ ] Verify existing collision tests still pass.

## Success Criteria

- `ch3-6-2` 3D mode works offline.
- Impact state is clear in 3D and panel.
- Reset clears 3D collision artifacts.
- `npx playwright test tests/sim2-ch3-mount.spec.js -g "ch3-6-2"` passes.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Physics desync | Only use existing route state |
| Trail memory growth | Cap 3D trail points like current 2D trail |
| Visual noise | Keep rail/simple bodies; no complex textures |

## Security Considerations

- No external textures/models.

## Next Steps

Move to visual QA and docs.
