# Phase 09 Chapter 3 Theorems Collision And Solvers

## Context Links

- [Plan](./plan.md)
- [Phase 08](./phase-08-chapter-3-fundamentals-and-differential-motion.md)

## Overview

Priority: P1. Status: Completed.

Finish Ch3 by migrating theorem, energy, collision, and checker routes. End state: all 58 routes have unique scene identities.

## Route Scope

| Route | Scene intent |
|---|---|
| `ch3-5-1` | Center-of-mass theorem for a system. |
| `ch3-5-2` | Momentum and impulse plot. |
| `ch3-5-3` | Angular momentum with radius/velocity. |
| `ch3-5-4` | Work-energy relation. |
| `ch3-6-2` | Collision theorem with restitution. |
| `ch3-6-3` | Collision solver: elastic/inelastic/oblique. |
| `ch3-7-1` | Dynamics theorem selector. |
| `ch3-7-2` | Numeric dynamics checker. |

## Requirements

- Theorem routes must show different conserved/derived quantities.
- Collision routes must preserve `restitution` assessment behavior.
- Checker routes must be route-specific problem tools.

## Architecture

Add Ch3 theorem/collision/checker scene catalog. Template families:

- `center-mass-system`
- `momentum-impulse`
- `angular-momentum`
- `work-energy`
- `collision-restitution`
- `collision-solver`
- `dynamics-theorem-selector`
- `dynamics-numeric-checker`

## Related Code Files

| Action | Path | Notes |
|---|---|---|
| Create/Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-theorem-collision-solver-scenes.js` | 8 scene definitions. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-scene-templates.js` | Theorem/collision/checker templates. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js` | Align Ch3 checkpoint prompts if needed. |

## Implementation Steps

1. Register 8 final Ch3 scenes.
2. Add theorem-specific readouts:
   - `xC`, `p`, `L`, `T`, `W`, `e`
3. Preserve `ch3-6-2` positive assessment path.
4. Add theorem selector/checker interaction.
5. Remove legacy fallback allowance from strict gate after all routes are covered.
6. Run full 58 route identity gate.

## Todo List

- [x] Add theorem scenes.
- [x] Add collision scenes.
- [x] Add solver/checker scenes.
- [x] Verify `ch3-6-2` checkpoint.
- [x] Run full strict scene identity.

## Success Criteria

- Ch3 18/18 routes unique.
- All 58 routes unique.
- No route uses legacy fallback.

## Phase Tests

```powershell
python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58
npm run test:sim:unit
npm run test:sim:browser:route-mount
npm run test:sim:scene-identity
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2
```

## Risk Assessment

- Risk: all-route identity gate too strict for legitimately similar solver routes. Mitigation: if exception exists, document and require different control/readout signatures.
- Risk: removing fallback breaks missing scene route. Mitigation: catalog smoke catches before browser.

## Security Considerations

No new storage. Numeric checker inputs clamped and handled defensively.

## Next Steps

Completed.

Unresolved questions: none.
