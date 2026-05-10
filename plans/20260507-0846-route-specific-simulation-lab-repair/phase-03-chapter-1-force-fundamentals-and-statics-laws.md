# Phase 03 Chapter 1 Force Fundamentals And Statics Laws

## Context Links

- [Plan](./plan.md)
- [Coverage Matrix](../20260506-1045-interactive-mechanics-simulation-expansion/research/simulation-coverage-matrix.md)
- [Phase 02](./phase-02-route-scene-registry-architecture.md)

## Overview

Priority: P1. Status: Completed.

Migrate first Ch1 group from generic statics renderer to route-specific scenes.

## Route Scope

| Route | Scene intent |
|---|---|
| `ch1-1-3` | Force vector anatomy: point, direction, magnitude, components. |
| `ch1-1-4` | Moment: lever arm, line of action, sign. |
| `ch1-1-5` | 2D force system reducer: resultant and moment at O. |
| `ch1-1-6` | Couple: two parallel opposite forces and free moment. |
| `ch1-1-8` | Active/reaction forces and DOF lock. |
| `ch1-2-1` | Two-force equilibrium: collinearity and equal/opposite forces. |
| `ch1-2-3` | Parallelogram law: vector addition geometry. |
| `ch1-2-6` | Free body diagram builder: replace constraints by reactions. |

## Requirements

- Each route has unique `sceneId`, `template`, `visualKey`, initial layout.
- Each route has at least one direct manipulation target.
- Each route has route-specific formula and readout labels.
- Existing checkpoint keys remain or are mapped.

## Architecture

Create Ch1 force/law scene catalog and use shared templates:

- `force-vector`
- `moment-arm`
- `force-system-reducer`
- `couple-free-vector`
- `constraint-release`
- `two-force-body`
- `parallelogram`
- `fbd-builder`

## Related Code Files

| Action | Path | Notes |
|---|---|---|
| Create/Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-force-law-scenes.js` | Scene definitions for this route group. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\index.html` | Add scene file if not already loaded. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-scene-templates.js` | Add only templates needed by this group. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` | Add filtered scene identity cases if needed. |

## Implementation Steps

1. Register 8 scene configs in `ch1-force-law-scenes.js`.
2. Add per-route initial state positions so canvas differs at first draw.
3. Add control definitions:
   - force magnitude/angle for `ch1-1-3`
   - pivot/load position for `ch1-1-4`
   - multi-force handles for `ch1-1-5`
   - couple distance for `ch1-1-6`
   - constraint toggles for `ch1-1-8`
   - line alignment for `ch1-2-1`
   - vector endpoints for `ch1-2-3`
   - support/reaction picker for `ch1-2-6`
4. Map assessment state keys: `primary`, `resultantMagnitude`, `moment`, `alpha`.
5. Run filtered identity gate.

## Todo List

- [x] Add 8 Ch1 scene definitions.
- [x] Add needed templates.
- [x] Wire direct handles/controls.
- [x] Verify checkpoint state mapping.
- [x] Run phase tests.

## Success Criteria

- 8 routes render through scene registry, not legacy fallback.
- 8 routes have unique canvas/control/readout signatures.
- Route mount and direct drag still pass.

## Phase Tests

```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 ch1-2-3 ch1-2-6
npm run test:sim:unit
npm run test:sim:browser:route-mount
npm run test:sim:scene-identity -- --grep "ch1-1-3|ch1-1-4|ch1-1-5|ch1-1-6|ch1-1-8|ch1-2-1|ch1-2-3|ch1-2-6"
```

## Risk Assessment

- Risk: force templates too similar. Mitigation: require distinct body geometry and controls per route.
- Risk: `ch1-1-5`/`ch1-2-6` both use FBD-like concepts. Mitigation: reducer vs FBD builder must expose different readouts.

## Security Considerations

Client-only. No new persistence keys.

## Next Steps

Completed.

Unresolved questions: none.
