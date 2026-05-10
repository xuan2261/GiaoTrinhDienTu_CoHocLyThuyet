# Phase 06 Chapter 2 Particle Rotation And Transmission

## Context Links

- [Plan](./plan.md)
- [Phase 05](./phase-05-chapter-1-friction-centroid-and-solvers.md)
- [Coverage Matrix](../20260506-1045-interactive-mechanics-simulation-expansion/research/simulation-coverage-matrix.md)

## Overview

Priority: P1. Status: Completed.

Migrate first Ch2 group. Current Ch2 has only a few distinct initial visuals; this phase gives particle, rigid body rotation, and transmission routes their own scenes.

## Route Scope

| Route | Scene intent |
|---|---|
| `ch2-1-1` | Vector method: path, velocity, acceleration along trajectory. |
| `ch2-1-2` | Cartesian motion: x(t), y(t), v, a graph lab. |
| `ch2-1-3` | Natural coordinates: tangent, normal, curvature. |
| `ch2-1-4` | Special motions: preset gallery and timeline. |
| `ch2-2-2` | Fixed-axis rotation: angle, omega, tangential/normal acceleration. |
| `ch2-3-2` | Gear/belt transmission: no-slip angular speed relation. |

## Requirements

- Route visuals must distinguish trajectory graph, natural frame, rotation disk, and gear/belt systems.
- `ch2-1-1` preset buttons remain but no longer define the only distinct Ch2 scene.
- Controls/readouts target kinematic quantities, not generic force/mass.

## Architecture

Add Ch2 particle/rotation/transmission scene catalog. Template families:

- `particle-vector-path`
- `cartesian-motion-graphs`
- `natural-coordinate-frame`
- `motion-preset-gallery`
- `fixed-axis-rotation`
- `gear-belt-transmission`

## Related Code Files

| Action | Path | Notes |
|---|---|---|
| Create/Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-particle-rotation-transmission-scenes.js` | 6 scene definitions. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-scene-templates.js` | Ch2 route templates. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js` | Checkpoint prompts if state keys change. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\index.html` | Add scene file script if needed. |

## Implementation Steps

1. Register 6 scene configs.
2. Replace generic kinematics sine-path scene for these routes.
3. Add route-specific controls:
   - time cursor
   - trajectory mode
   - graph cursor
   - curvature radius
   - angular speed
   - gear radius ratio
4. Ensure assessment keys include `trajectory`, `t`, `omega`, and route-specific readouts.
5. Run filtered Ch2 identity gate.

## Todo List

- [x] Add 6 Ch2 scene configs.
- [x] Add graph/trajectory templates.
- [x] Add rotation/transmission templates.
- [x] Verify `ch2-1-1` preset behavior.
- [x] Run phase tests.

## Success Criteria

- 6 Ch2 routes are visually and semantically unique.
- No route in this group uses legacy fallback.
- Ch2 representative browser tests still pass.

## Phase Tests

```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch2-1-1 ch2-1-2 ch2-1-3 ch2-1-4 ch2-2-2 ch2-3-2
npm run test:sim:unit
npm run test:sim:browser:route-mount
npm run test:sim:scene-identity -- --grep "ch2-1-|ch2-2-2|ch2-3-2"
```

## Risk Assessment

- Risk: graph-heavy scenes overcrowd mobile. Mitigation: compact axes, stable canvas constraints, responsive browser check.
- Risk: transmission relation misunderstood. Mitigation: readout shows `omega2 = omega1 r1 / r2`.

## Security Considerations

No network/storage changes. Numeric controls must clamp values.

## Next Steps

Completed.

Unresolved questions: none.
