# Phase 06 Chapter 2 Composition Plane Motion And Fixed Point Labs

## Context Links

- [Coverage Matrix](./research/simulation-coverage-matrix.md)
- [Phase 05](./phase-05-chapter-2-particle-rigid-body-and-transmission-labs.md)

## Overview

Priority: P1. Status: Complete. Add Ch2 IV-VII labs: relative motion, acceleration composition/Coriolis, instantaneous center, slider-crank, fixed-point rotation, and kinematics checkers.

## Key Insights

- Coriolis and acceleration composition are visually hard; high payoff.
- Plane motion benefits from instantaneous center interaction.
- Fixed-point rotation can be 2.5D, not full 3D engine.

## Requirements

| Route Group | Required Interactions |
|---|---|
| `ch2-4-*` | absolute/relative/transport motion, velocity and acceleration composition |
| `ch2-5-*` | rolling, instantaneous center, point velocity distribution, slider-crank |
| `ch2-6-*` | fixed-point rotation, Euler/precession visual |
| `ch2-7-*` | kinematics guided checker |

## Architecture

Use `SimKinematics` with reusable vector-composition overlay. Use `SimActivities` for checker routes.

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-kinematics.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-activities.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\simulations.js` |
| Optional create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\data\activity-ch2.json` |

## Implementation Steps

1. Add scenario selector for `ch2-4-1`.
2. Add absolute/relative/transport toggle for `ch2-4-2`.
3. Extend `ch2-4-3` velocity composition.
4. Add acceleration composition and Coriolis lab for `ch2-4-4`.
5. Extend rolling wheel lab for `ch2-5-1`.
6. Add instantaneous center finder for `ch2-5-2`.
7. Add point velocity distribution and slider-crank for `ch2-5-3`.
8. Add fixed-point rotation 2.5D lab for `ch2-6-1`, `ch2-6-2`.
9. Add kinematics exercise checker for `ch2-7-1`, `ch2-7-2`.

## Todo List

- [x] Add vector composition helper.
- [x] Add Coriolis visual and formula readout.
- [x] Add instantaneous center drag/check.
- [x] Add slider-crank motion preset.
- [x] Add Ch2 guided checker scenarios.

## Completion Notes

- P1 route coverage complete. Fixed-point rotation P2 routes remain backlog.

## Tests And Verification

```powershell
node --check js\sim-kinematics.js
node --check js\sim-activities.js
node --check js\simulations.js
python tools\audit.py
```

Manual verify:

- `ch2-4-4`: Coriolis term becomes zero when relative speed or transport angular velocity is zero.
- `ch2-5-2`: instantaneous center for pure rolling lies at contact point.
- `ch2-5-3`: velocity magnitude scales with distance from instantaneous center.
- `ch2-7-*`: numeric tolerance works and wrong unit is rejected.

## Success Criteria

- Ch2 IV-VII P1 coverage complete.
- Coriolis, instantaneous center, and exercise checker usable on mobile.
- No regression in Ch2 I-III.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Coriolis sign confusion | Explicit direction arrows and zero-case tests |
| 2.5D fixed-point visual misleading | Label as conceptual, keep axes clear |

## Security Considerations

Local-only activity state.

## Next Steps

Proceed to Ch3 fundamentals and differential equation labs.
