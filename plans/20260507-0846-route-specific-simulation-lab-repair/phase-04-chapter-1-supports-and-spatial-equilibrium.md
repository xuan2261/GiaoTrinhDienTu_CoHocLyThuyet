# Phase 04 Chapter 1 Supports And Spatial Equilibrium

## Context Links

- [Plan](./plan.md)
- [Phase 03](./phase-03-chapter-1-force-fundamentals-and-statics-laws.md)

## Overview

Priority: P1. Status: Completed.

Migrate Ch1 support/linkage and spatial equilibrium routes. These routes must no longer share the same beam/block scene.

## Route Scope

| Route | Scene intent |
|---|---|
| `ch1-3-1` | Smooth support: normal reaction follows tangent/normal. |
| `ch1-3-2` | Cable support: tension-only along cable. |
| `ch1-3-3` | Hinge/support type selector with reaction components. |
| `ch1-3-4` | Roller vs pin support reaction builder. |
| `ch1-3-6` | Fixed support: force pair plus fixed-end moment. |
| `ch1-3-7` | Two-force member axial force. |
| `ch1-4-1` | Spatial resultant 2.5D vector sum. |
| `ch1-4-2` | Spatial moment about point/axis projection. |
| `ch1-4-4` | Spatial equilibrium equations and support reactions. |

## Requirements

- Distinct support geometry per route.
- Spatial routes must visually differ from planar support routes.
- Controls/readouts must teach reaction direction/component logic.

## Architecture

Add Ch1 support/spatial scene catalog. Template families:

- `smooth-support-normal`
- `cable-tension`
- `support-component-selector`
- `fixed-support`
- `two-force-member`
- `spatial-resultant`
- `spatial-moment`
- `spatial-equilibrium-board`

## Related Code Files

| Action | Path | Notes |
|---|---|---|
| Create/Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-support-spatial-scenes.js` | 9 scene definitions. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-scene-templates.js` | Support/spatial templates. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\index.html` | Script tag if needed. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js` | Adjust checkpoint prompts only if readout keys change. |

## Implementation Steps

1. Register all 9 route scenes.
2. Add unique geometry:
   - inclined/smooth surface
   - sagging cable line
   - hinge with two reaction arrows
   - roller/pin comparison
   - wall fixed support with moment arc
   - truss member axial line
   - 2.5D axes for spatial routes
3. Keep assessment-compatible state keys.
4. Ensure direct drag updates support reaction readout.
5. Run filtered browser scene identity.

## Todo List

- [x] Add 9 scene configs.
- [x] Add support templates.
- [x] Add spatial 2.5D templates.
- [x] Align assessment keys.
- [x] Run phase tests.

## Success Criteria

- 17 migrated Ch1 routes total have unique identities.
- No Ch1 support route uses legacy fallback.
- Spatial routes are visibly non-identical to planar statics routes.

## Phase Tests

```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-3-1 ch1-3-2 ch1-3-3 ch1-3-4 ch1-3-6 ch1-3-7 ch1-4-1 ch1-4-2 ch1-4-4
npm run test:sim:unit
npm run test:sim:browser:route-mount
npm run test:sim:scene-identity -- --grep "ch1-3-|ch1-4-1|ch1-4-2|ch1-4-4"
```

## Risk Assessment

- Risk: 2.5D spatial scenes become misleading. Mitigation: label axes/projections clearly; avoid pretending full 3D physics.
- Risk: support scenes overlap. Mitigation: distinct constraint icons and readout labels.

## Security Considerations

No network or storage changes.

## Next Steps

Completed.

Unresolved questions: none.
