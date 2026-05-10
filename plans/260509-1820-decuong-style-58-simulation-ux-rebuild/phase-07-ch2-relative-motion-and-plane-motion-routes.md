# Phase 07 - Ch2 Relative Motion And Plane Motion Routes

## Context Links

- [Phase 06](./phase-06-ch2-particle-graph-rotation-and-transmission-routes.md)
- `js/sims/ch2/ch2-relative-motion-velocity-renderers.js`
- `js/sims/ch2/ch2-relative-renderers.js`
- `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js`
- `js/sims/ch2/ch2-plane-checker-renderers.js`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Estimate | 12h |
| Goal | Upgrade 9 Ch2 relative motion and plane motion routes with clear vector composition and rigid-body kinematics |

## Routes

`ch2-4-1`, `ch2-4-2`, `ch2-4-3`, `ch2-4-4`, `ch2-5-1`, `ch2-5-2`, `ch2-5-3`, `ch2-7-1`, `ch2-7-2`

## Key Insights

- Relative motion is visually confusing unless vector roles are separated.
- Instant center route must make IC handle and velocity distribution obvious.
- Exercise/checker routes should show method selection and numeric verification.

## Requirements

### Functional

- Composition routes distinguish absolute/relative/transport velocity and acceleration.
- Coriolis route shows direction and formula `a_c = 2 omega x v_r`.
- Velocity triangle route has draggable vector endpoint(s), not static diagram only.
- Plane motion route shows body, two points, angular velocity, and velocity field.
- Instant center route exposes IC handle and velocity arrows update from IC.
- Solver routes show guided step/status without assessment storage.

### Non-Functional

- Preserve route-specific renderer contract.
- Avoid overloaded vector colors; use consistent legend.

## Architecture

```text
Relative/plane motion state
  -> vector components / IC / omega
  -> behavior handles
  -> renderer vector triangle or rigid body
  -> readouts: va, vr, ve, ac, omega, IC
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-relative-plane-motion-scenes.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-kinematics-behaviors-b.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-relative-motion-velocity-renderers.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-relative-renderers.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-instant-center-plane-motion-renderers.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\ch2-plane-checker-renderers.js` |
| Modify if needed | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-physics-kinematics.js` |
| Modify tests | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` |

## Implementation Steps

1. Standardize vector legend for absolute/relative/transport/Coriolis.
2. Update velocity composition renderers:
   - triangle/sum construction.
   - formula panel with component relation.
3. Update Coriolis route:
   - clear rotating frame.
   - direction indicator.
   - readout `a_c`.
4. Update plane motion/IC:
   - body shape with point handles.
   - velocity arrows update around IC.
5. Update solver/checker routes:
   - step cards and finite numeric values.
6. Add route-group tests.

## Todo List

- [ ] Upgrade relative velocity and acceleration routes.
- [ ] Upgrade Coriolis route.
- [ ] Upgrade plane motion and instant center routes.
- [ ] Upgrade Ch2 solver/checker routes.
- [ ] Add Ch2 relative tests.

## Tests / Verify

```powershell
npm run test:sim:unit
npx playwright test tests/simulation-browser.spec.js --grep "@ch2-relative-plane"
npm run test:sim:visual-quality
npm run test:sim:renderer-contract
python tools\audit_simulation_quality.py --all --max-js-lines 220
```

Route-specific assertions:

| Route | Verify |
|---|---|
| `ch2-4-3` | vector triangle endpoint drag changes resultant |
| `ch2-4-4` | Coriolis readout changes with omega/relative velocity |
| `ch2-5-2` | IC drag changes velocity arrow distribution |
| `ch2-5-3` | point velocity distribution stays finite after drag |
| `ch2-7-2` | checker values remain finite and route-specific |

## Success Criteria

- 9/9 routes have clear vector roles.
- IC/plane motion routes no longer read as generic diagrams.
- Tests verify semantic value changes for representative routes.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Too many arrows cause clutter | Use legend + fade secondary construction lines |
| Coriolis direction wrong | Add formula-based unit tests or deterministic browser readout check |
| Solver route becomes text-heavy | Use compact step controls and readout cards |

## Security Considerations

- No dynamic HTML from route state.
- Keep numeric bounds.

## Next Steps

Proceed to Ch3 dynamics foundation.

## Unresolved Questions

Không có.
