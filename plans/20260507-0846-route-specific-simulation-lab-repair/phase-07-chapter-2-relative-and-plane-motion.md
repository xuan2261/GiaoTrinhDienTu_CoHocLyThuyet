# Phase 07 Chapter 2 Relative And Plane Motion

## Context Links

- [Plan](./plan.md)
- [Phase 06](./phase-06-chapter-2-particle-rotation-and-transmission.md)

## Overview

Priority: P1. Status: Completed.

Finish Ch2 by migrating relative motion, plane motion, and exercise/checker routes. End state: Ch2 15/15 routes unique.

## Route Scope

| Route | Scene intent |
|---|---|
| `ch2-4-1` | Moving frame scenario selector. |
| `ch2-4-2` | Absolute/relative/transport motion definitions. |
| `ch2-4-3` | Velocity composition triangle. |
| `ch2-4-4` | Acceleration composition and Coriolis term. |
| `ch2-5-1` | Plane motion: translation + rotation. |
| `ch2-5-2` | Instantaneous center finder. |
| `ch2-5-3` | Velocity distribution and slider-crank style readout. |
| `ch2-7-1` | Guided kinematics step checker. |
| `ch2-7-2` | Numeric/graph kinematics checker. |

## Requirements

- Relative motion routes must not share one generic path scene.
- Plane motion routes must include rigid-body geometry.
- Checker routes must use exercise/checker layout, not pure animation.

## Architecture

Add Ch2 relative/plane scene catalog. Template families:

- `moving-frame-scenario`
- `motion-definition-toggle`
- `velocity-composition-triangle`
- `coriolis-acceleration`
- `plane-motion-rigid-body`
- `instant-center-finder`
- `velocity-distribution`
- `kinematics-guided-checker`
- `kinematics-numeric-checker`

## Related Code Files

| Action | Path | Notes |
|---|---|---|
| Create/Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-relative-plane-motion-scenes.js` | 9 scene definitions. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-scene-templates.js` | Relative/plane/checker templates. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js` | Align prompts/checkpoint keys. |

## Implementation Steps

1. Register 9 scene configs.
2. Add moving frame and vector triangle visuals.
3. Preserve `ch2-5-2` assessment positive path for instant center.
4. Add checker scenes with route-specific equation/readout boards.
5. Run full Ch2 strict identity gate.

## Todo List

- [x] Add relative motion scenes.
- [x] Add plane motion scenes.
- [x] Add checker scenes.
- [x] Verify `ch2-5-2` checkpoint.
- [x] Run full Ch2 strict identity.

## Success Criteria

- Ch2 15/15 routes have unique scene identities.
- No Ch2 route uses legacy fallback.
- Relative, plane, and checker routes differ in initial canvas and controls.

## Phase Tests

```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch2
npm run test:sim:unit
npm run test:sim:browser:route-mount
npm run test:sim:scene-identity -- --grep "ch2-"
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2
```

## Risk Assessment

- Risk: Coriolis scene becomes too abstract. Mitigation: show vector sum and zero-condition toggle.
- Risk: checkers feel like static forms. Mitigation: require direct cursor/handle interaction.

## Security Considerations

All inputs are local and clamped.

## Next Steps

Completed.

Unresolved questions: none.
