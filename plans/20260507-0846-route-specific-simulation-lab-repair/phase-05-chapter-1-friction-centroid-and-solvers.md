# Phase 05 Chapter 1 Friction Centroid And Solvers

## Context Links

- [Plan](./plan.md)
- [Phase 04](./phase-04-chapter-1-supports-and-spatial-equilibrium.md)

## Overview

Priority: P1. Status: Completed.

Finish Ch1 by migrating friction, centroid, and exercise/checker routes. End state: Ch1 25/25 routes unique.

## Route Scope

| Route | Scene intent |
|---|---|
| `ch1-5-1` | Contact force decomposition: normal + friction. |
| `ch1-5-2` | Static/sliding/rolling friction comparison. |
| `ch1-5-3` | Friction cone and inclined plane hold/slip. |
| `ch1-5-4` | Self-locking wedge/screw condition. |
| `ch1-6-2` | Centroid formula calculator by composite areas. |
| `ch1-6-3` | Symmetry, hole, and centroid shift. |
| `ch1-7-1` | Guided statics solver: FBD -> equations -> solve. |
| `ch1-7-2` | Numeric statics checker: reactions/moment validation. |

## Requirements

- Friction routes must not be generic block/beam force scenes.
- Centroid routes must show area/shape logic, not only force vectors.
- Solver/checker routes must use step/checker style visuals.

## Architecture

Add Ch1 friction/centroid/solver scene catalog. Template families:

- `contact-force-decomposition`
- `friction-mode-tabs`
- `friction-cone-incline`
- `self-locking-wedge`
- `centroid-composite`
- `centroid-hole-shift`
- `guided-equilibrium-solver`
- `statics-numeric-checker`

## Related Code Files

| Action | Path | Notes |
|---|---|---|
| Create/Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-friction-centroid-solver-scenes.js` | 8 scene definitions. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-scene-templates.js` | Friction/centroid/checker templates. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js` | Checkpoint prompts/readouts for Ch1 if needed. |

## Implementation Steps

1. Register 8 route-specific scenes.
2. Preserve `ch1-5-3` hold/slip checkpoint behavior with richer visual.
3. Add centroid templates using draggable composite parts or hole marker.
4. Build solver/checker scenes with compact equation board and direct numeric targets.
5. Run full Ch1 identity strict gate.

## Todo List

- [x] Add friction scenes.
- [x] Add centroid scenes.
- [x] Add solver/checker scenes.
- [x] Verify `ch1-5-3` assessment positive path.
- [x] Run full Ch1 strict identity.

## Success Criteria

- Ch1 25/25 routes have unique scene identities.
- No Ch1 route uses legacy fallback.
- Existing Ch1 assessment paths still work.

## Phase Tests

```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch1
npm run test:sim:unit
npm run test:sim:browser:route-mount
npm run test:sim:scene-identity -- --grep "ch1-"
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2
```

## Risk Assessment

- Risk: centroid/checker scenes need different state keys. Mitigation: add compatibility keys for assessment.
- Risk: many Ch1 scenes inflate templates. Mitigation: extract only common primitive drawing helpers.

## Security Considerations

No new storage. Solver inputs stay client-side and bounded.

## Next Steps

Completed.

Unresolved questions: none.
