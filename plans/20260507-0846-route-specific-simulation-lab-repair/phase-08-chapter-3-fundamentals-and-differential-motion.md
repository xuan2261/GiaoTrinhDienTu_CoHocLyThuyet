# Phase 08 Chapter 3 Fundamentals And Differential Motion

## Context Links

- [Plan](./plan.md)
- [Phase 07](./phase-07-chapter-2-relative-and-plane-motion.md)

## Overview

Priority: P1. Status: Completed.

Migrate first Ch3 group. Current Ch3 initial scene is identical across all 18 routes; this phase makes dynamics fundamentals and differential equation routes distinct.

## Route Scope

| Route | Scene intent |
|---|---|
| `ch3-1-2` | Force-motion concept: resultant force to acceleration. |
| `ch3-1-3` | Inertial vs non-inertial frame comparison. |
| `ch3-2-1` | Inertia law: zero resultant and constant velocity. |
| `ch3-2-2` | Newton II: mass-force-acceleration lab. |
| `ch3-2-3` | Newton III: action/reaction pair. |
| `ch3-2-5` | Dynamic FBD with constraint and inertia force. |
| `ch3-3-1` | Differential equation integration with graph cursor. |
| `ch3-3-2` | Coupled system differential motion. |
| `ch3-4-1` | Forward dynamics problem. |
| `ch3-4-2` | Inverse dynamics from prescribed motion. |

## Requirements

- Dynamics fundamentals must not share one mass/force circle.
- Differential routes must include graph/integrator state.
- Forward/inverse routes must expose solver direction difference.

## Architecture

Add Ch3 fundamentals/differential scene catalog. Template families:

- `force-motion-resultant`
- `inertial-frame-comparison`
- `inertia-zero-force`
- `newton-second-law`
- `newton-third-pair`
- `dynamic-fbd`
- `ode-particle-integrator`
- `ode-coupled-system`
- `forward-dynamics-solver`
- `inverse-dynamics-solver`

## Related Code Files

| Action | Path | Notes |
|---|---|---|
| Create/Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-fundamentals-differential-scenes.js` | 10 scene definitions. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-scene-templates.js` | Dynamics templates. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js` | Align checkpoint state keys. |

## Implementation Steps

1. Register 10 route-specific Ch3 scenes.
2. Add dynamics state keys: force, mass, acceleration, frame mode, spring, time cursor.
3. Preserve `ch3-3-1` checkpoint for `spring = 0` and graph cursor.
4. Add forward/inverse solver scenes with different data flow.
5. Run filtered Ch3 identity gate.

## Todo List

- [x] Add 10 scene configs.
- [x] Add dynamics fundamental templates.
- [x] Add ODE/solver templates.
- [x] Verify `ch3-3-1` checkpoint.
- [x] Run phase tests.

## Success Criteria

- 10 Ch3 routes have unique scene identities.
- No route in this group uses legacy fallback.
- Differential and solver routes visually differ from Newton routes.

## Phase Tests

```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch3-1-2 ch3-1-3 ch3-2-1 ch3-2-2 ch3-2-3 ch3-2-5 ch3-3-1 ch3-3-2 ch3-4-1 ch3-4-2
npm run test:sim:unit
npm run test:sim:browser:route-mount
npm run test:sim:scene-identity -- --grep "ch3-1-|ch3-2-|ch3-3-|ch3-4-"
```

## Risk Assessment

- Risk: solver templates become text-heavy. Mitigation: keep canvas visual first, equation board compact.
- Risk: dynamic FBD overlaps statics FBD. Mitigation: include inertia force and acceleration state.

## Security Considerations

No persistence or network changes. Clamp numeric integration parameters.

## Next Steps

Completed.

Unresolved questions: none.
