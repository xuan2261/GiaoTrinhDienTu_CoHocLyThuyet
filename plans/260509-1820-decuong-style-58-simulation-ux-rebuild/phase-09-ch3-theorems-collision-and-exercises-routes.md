# Phase 09 - Ch3 Theorems Collision And Exercises Routes

## Context Links

- [Phase 08](./phase-08-ch3-newton-ode-and-forced-motion-routes.md)
- `js/sims/ch3/ch3-theorems-renderers.js`
- `js/sims/ch3/ch3-collision-exercises-renderers.js`
- `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Estimate | 12h |
| Goal | Upgrade 8 Ch3 theorem, energy, momentum, angular momentum, collision, and exercise routes |

## Routes

`ch3-5-1`, `ch3-5-2`, `ch3-5-3`, `ch3-5-4`, `ch3-6-2`, `ch3-6-3`, `ch3-7-1`, `ch3-7-2`

## Key Insights

- These routes need conservation/invariant visualization.
- Collision route is high-value: direct drag and play/reset must be excellent.
- Exercise routes should help method selection, not become quiz/assessment again.

## Requirements

### Functional

- Center-of-mass route shows masses, CM marker, and acceleration relation.
- Momentum/impulse route shows before/after momentum bars/vectors.
- Angular momentum route shows radius, omega, inertia, and `L = I omega`.
- Energy route shows work/kinetic/potential bars.
- Collision route supports mass/velocity/restitution and before/after velocities.
- Collision solver route distinguishes elastic/inelastic/oblique cases.
- Exercise routes show method cards and numeric verification.

### Non-Functional

- Collision animation must be deterministic.
- Energy/momentum visuals must not imply wrong conservation when external work exists.

## Architecture

```text
Theorem/collision state
  -> physicsDynamics helpers
  -> derived conservation values
  -> renderer bars/vectors/bodies
  -> readout cards + formula panel
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-dynamics-all-18-scenes.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-dynamics-theorem-collision-behaviors.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-theorems-renderers.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-collision-exercises-renderers.js` |
| Modify if needed | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-physics-dynamics.js` |
| Modify tests | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` |

## Implementation Steps

1. Normalize theorem readout values:
   - CM, impulse, momentum, angular momentum, energy.
2. Update theorem renderers:
   - use vector/bar visual paired with formula card.
   - distinguish conserved vs changed values.
3. Update collision behavior:
   - drag ball positions/velocities.
   - restitution control.
   - reset cancels active animation.
4. Update collision renderer:
   - before/after states.
   - momentum/energy cards.
5. Update exercise renderers:
   - method cards with active selection.
   - numeric verification values finite.
6. Add route-group tests.

## Todo List

- [ ] Upgrade CM/momentum/angular momentum/energy routes.
- [ ] Upgrade collision route interaction and animation.
- [ ] Upgrade collision solver and exercise routes.
- [ ] Add Ch3 theorem/collision tests.
- [ ] Verify conservation/invariant displays.

## Tests / Verify

```powershell
npm run test:sim:unit
npx playwright test tests/simulation-browser.spec.js --grep "@ch3-theorem-collision"
npx playwright test tests/simulation-browser.spec.js --grep "@collision"
npm run test:sim:visual-quality
npm run test:sim:renderer-contract
python tools\audit_simulation_quality.py --all --max-js-lines 220
```

Route-specific assertions:

| Route | Verify |
|---|---|
| `ch3-5-1` | dragging masses changes CM readout/marker |
| `ch3-5-3` | radius/omega changes `I` and `L` |
| `ch3-5-4` | energy bars update and remain finite |
| `ch3-6-2` | ball drag changes velocity/momentum; reset restores |
| `ch3-6-3` | restitution/case changes collision result |

## Success Criteria

- 8/8 routes show theorem-specific physics values.
- Collision route is direct, readable, resettable.
- Conservation visuals are not misleading.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Energy/momentum bars imply exact conservation incorrectly | Label external work/loss explicitly in formula/readout |
| Collision route flaky after repeated play | Cancel previous RAF on reset/play |
| Exercise route too text-heavy | Use compact method cards, not long instructions |

## Security Considerations

- No dynamic HTML.
- No persistence/storage changes.

## Next Steps

Final all-route polish and release QA.

## Unresolved Questions

Không có.
