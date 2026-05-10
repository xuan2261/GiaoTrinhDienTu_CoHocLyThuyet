# Phase 06 - Ch2 Particle Graph Rotation And Transmission Routes

## Context Links

- [Phase 03](./phase-03-interaction-grammar-and-control-model.md)
- `js/sims/ch2/ch2-kinematics-scenes.js`
- `js/sims/ch2/ch2-trajectory-graph-renderers.js`
- `js/sims/ch2/ch2-rotation-gear-renderers.js`
- `js/sims/ch2/ch2-rotation-transmission-renderers.js`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Estimate | 12h |
| Goal | Upgrade 6 Ch2 motion routes with clear animation, trajectory, graph, rotation, and transmission controls |

## Routes

`ch2-1-1`, `ch2-1-2`, `ch2-1-3`, `ch2-1-4`, `ch2-2-2`, `ch2-3-2`

## Key Insights

- DeCuong particle route is a good reference: path selector, speed, play/pause, vector arrows.
- Current Ch2 routes must keep animation but expose what changes physically.
- Motion graph route needs linked cursor/point and graph readouts.

## Requirements

### Functional

- Particle trajectory shows `r`, `v`, `a_t`, `a_n`, and curvature/normal direction when relevant.
- Graph route links point on path to graph cursor.
- Natural-coordinate route shows tangent/normal frame.
- Motion preset route uses segmented controls, not hidden mode text.
- Rotation route shows angle, angular velocity, tangential/normal components.
- Transmission route shows ratio, direction, and gear/pulley state.

### Non-Functional

- Animations should remain smooth at 60fps target on normal laptop.
- Pause should freeze visual state and readout.
- Reset should clear trail.

## Architecture

```text
Kinematics behavior tick
  -> update state t / angle / preset
  -> derive v, a, alpha, omega, ratio
  -> renderer draws path/graph/frame
  -> readout cards update
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-kinematics-scenes.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-kinematics-behaviors-a.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-particle-renderers.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-trajectory-graph-renderers.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-rotation-gear-renderers.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-rotation-transmission-renderers.js` |
| Modify if needed | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-physics-kinematics.js` |
| Modify tests | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` |

## Implementation Steps

1. Start with `ch2-1-1` DeCuong-style particle route.
2. Add speed/path controls:
   - speed slider if route animates.
   - segmented path/preset buttons.
3. Update trajectory renderer:
   - visible path, trail, point, velocity, acceleration components.
   - readout cards for `|v|`, `|a_t|`, `|a_n|`, `rho`.
4. Update graph route:
   - cursor drag updates `x(t)`, `v(t)`, `a(t)`.
   - graph labels not clipped.
5. Update rotation/transmission renderers:
   - clear angular arrows.
   - gear/pulley ratio cards.
6. Add performance and animation regression tests.

## Todo List

- [ ] Upgrade particle trajectory route.
- [ ] Upgrade graph/cursor route.
- [ ] Upgrade natural coordinate and motion preset routes.
- [ ] Upgrade rotation/transmission routes.
- [ ] Add Ch2 motion tests.

## Tests / Verify

```powershell
npm run test:sim:unit
npx playwright test tests/simulation-browser.spec.js --grep "@ch2-motion"
npx playwright test tests/simulation-browser.spec.js --grep "@animation"
npm run test:sim:visual-quality
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup
```

Route-specific assertions:

| Route | Verify |
|---|---|
| `ch2-1-1` | play/pause changes/freeze canvas hash; speed/path controls update readout |
| `ch2-1-2` | graph cursor drag changes `x(t)`/`v(t)` |
| `ch2-1-3` | tangent/normal readouts finite |
| `ch2-2-2` | angular position/velocity readouts update |
| `ch2-3-2` | ratio change updates gear/pulley direction |

## Success Criteria

- 6/6 Ch2 motion routes feel animated and controllable.
- No trail persists after reset.
- Dark/light + mobile remain readable.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Animation causes flaky tests | Pause or deterministic time sample in tests |
| Visual path too busy | Keep one active point and short trail |
| Speed controls confuse physical scale | Label units and route purpose clearly |

## Security Considerations

- No external assets/scripts.
- Bound all numeric control values.

## Next Steps

Proceed to Ch2 relative/composition and plane motion.

## Unresolved Questions

Không có.
