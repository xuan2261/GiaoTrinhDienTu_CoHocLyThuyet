# Phase 08 Chapter 3 Theorems Energy And Collision Labs

## Context Links

- [Coverage Matrix](./research/simulation-coverage-matrix.md)
- [Phase 07](./phase-07-chapter-3-dynamics-fundamentals-and-differential-labs.md)

## Overview

Priority: P1. Status: Complete. Add/extend Ch3 V-VII labs: center of mass, momentum, angular momentum, work-energy, collision, and dynamics exercise checker.

## Key Insights

- Current momentum, kinetic energy, collision sims are useful but need theorem-level context.
- Angular momentum is missing and high value.
- Collision with coefficient of restitution is essential.

## Requirements

| Route Group | Required Interactions |
|---|---|
| `ch3-5-*` | center of mass, impulse/momentum, angular momentum, work-energy |
| `ch3-6-*` | collision assumptions, coefficient `e`, elastic/inelastic/oblique solver |
| `ch3-7-*` | theorem selector and numeric checker |

## Architecture

Use `SimDynamics`. Reuse graph helper and activity checker.

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-dynamics.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-activities.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\simulations.js` |
| Optional create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\data\activity-ch3.json` |

## Implementation Steps

1. Add center-of-mass theorem lab for `ch3-5-1`.
2. Extend momentum lab with impulse-time plot for `ch3-5-2`.
3. Add angular momentum lab for `ch3-5-3`.
4. Extend kinetic/work-energy lab for `ch3-5-4`.
5. Add collision assumption visual for `ch3-6-1`.
6. Extend 2D collision with coefficient `e` for `ch3-6-2`.
7. Add collision problem solver for `ch3-6-3`.
8. Add dynamics theorem selector for `ch3-7-1`.
9. Add numeric checker set for `ch3-7-2`.

## Todo List

- [x] Add center-of-mass lab.
- [x] Add impulse plot.
- [x] Add angular momentum conservation lab.
- [x] Add coefficient of restitution control.
- [x] Add dynamics exercise scenarios.

## Completion Notes

- P1 route coverage complete, including impulse plot. Collision assumptions P2 route remain backlog.

## Tests And Verification

```powershell
node --check js\sim-dynamics.js
node --check js\sim-activities.js
node --check js\simulations.js
python tools\audit.py
```

Manual verify:

- `ch3-5-1`: internal force toggles do not move center of mass when no external force.
- `ch3-5-2`: impulse area equals momentum change.
- `ch3-5-3`: zero external moment preserves angular momentum display.
- `ch3-6-2`: `e=1` preserves kinetic energy in ideal 1D case; `e=0` sticks normal component.
- `ch3-7-*`: theorem selector suggests correct method for sample tasks.

## Success Criteria

- Ch3 V-VII P1 coverage complete.
- Collision behavior matches textbook formulas.
- Exercise checker validates at least 3 Ch3 scenarios.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Collision formulas hard to get right | Start 1D, then 2D normal/tangent decomposition |
| Angular momentum too abstract | Use particle orbit + rotating disk examples |

## Security Considerations

Local-only progress.

## Next Steps

Proceed to shared assessment and activity data integration.
