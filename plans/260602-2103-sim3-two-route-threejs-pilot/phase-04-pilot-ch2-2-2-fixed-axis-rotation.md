# Phase 04 Pilot `ch2-2-2` Fixed Axis Rotation

## Context Links

- [Current route](../../js/sim2/sims/ch2/ch2-2-2.js)
- [Kinematics physics](../../js/sim2/physics/kinematics.js)
- [Ch2 mount tests](../../tests/sim2-ch2-mount.spec.js)

## Overview

Priority: P1  
Status: Done  
Goal: add first 3D pilot route. Use current route state and controls to drive a 3D disk/shaft teaching view.

## Key Insights

- This is the simpler pilot: deterministic rotation from `omega0`, `alphaAcc`, `t`.
- 3D scene should emphasize axis, angular vector, point M, and tangential velocity.
- Keep formula/readout in Sim2 panel.

## Requirements

Functional:
- Add `2D | 3D` mode to `ch2-2-2`.
- 3D disk rotates with current `phi(t)`.
- `ω0` and `α` sliders reset/update 3D state.
- Playback/step drives 3D and 2D consistently.
- Dispose cleans 3D resources.

Non-functional:
- No duplicate kinematics formulas.
- Route file should remain manageable; extract adapter if needed.

## Architecture

Data flow:

```text
params + t
  -> SimPhysicsKinematics.angularDisplacement/angularVelocity
  -> existing SVG draw()
  -> sim3 adapter setState({ phi, omega, alphaAcc, radius })
```

3D scene:
- cylinder/disk mesh.
- shaft/axis line.
- point M marker.
- colored `ω` vector.
- colored tangential `v` arrow.
- light grid/floor optional, low opacity.

## Related Code Files

Modify:
- `js/sim2/sims/ch2/ch2-2-2.js`
- `tests/sim2-ch2-mount.spec.js` or `tests/sim3-pilot-fallback-dispose.spec.js`

Create:
- `js/sim3/sims/ch2-2-2-3d.js`

Delete:
- None

## Implementation Steps

1. Add route adapter `ch2-2-2-3d.js` exporting global factory, e.g. `window.Sim3Ch222.create`.
2. Build scene objects once:
   - disk cylinder.
   - axis.
   - point marker.
   - vectors.
3. Add `setState(state)`:
   - rotate disk by `phi`.
   - move marker to disk rim.
   - update vector transforms/lengths.
4. Wire `ch2-2-2.js`:
   - after shell creation, attach mode toggle.
   - call `sim3.setState(...)` in `draw()`.
   - dispose Sim3 in returned dispose chain.
5. Run focused RED tests until GREEN.
6. Verify current Ch2 retrofit tests still pass.

## Todo List

- [x] Create `ch2-2-2` 3D adapter.
- [x] Wire route state into adapter.
- [x] Add/adjust tests for slider/playback sync.
- [x] Verify fallback and dispose.

## Success Criteria

- `ch2-2-2` 3D mode works offline.
- Slider/play/step/reset sync 3D scene.
- 2D mode remains visually unchanged enough to pass existing tests.
- `npx playwright test tests/sim2-ch2-mount.spec.js tests/sim3-pilot-fallback-dispose.spec.js --reporter=line --workers=1 --timeout=30000` passes.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Route file grows too large | Put 3D scene in `js/sim3/sims/ch2-2-2-3d.js` |
| 3D vector labels clutter | Use panel legend/readout, keep 3D labels minimal |
| Desync between 2D and 3D | One `draw()` computes state and updates both |

## Security Considerations

- No network assets/textures.

## Next Steps

Use lessons from this route before `ch3-6-2`.
