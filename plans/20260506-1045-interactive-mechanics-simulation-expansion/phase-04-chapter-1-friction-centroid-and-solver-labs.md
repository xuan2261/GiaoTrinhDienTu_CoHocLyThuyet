# Phase 04 Chapter 1 Friction Centroid And Solver Labs

## Context Links

- [Coverage Matrix](./research/simulation-coverage-matrix.md)
- [Phase 03](./phase-03-chapter-1-statics-core-interactions.md)

## Overview

Priority: P1. Status: Complete. Add high-impact Ch1 V-VII labs: friction, self-locking, centroid, and statics exercise checker.

## Key Insights

- Ma sát is the largest Ch1 gap.
- Self-locking is memorable when students drag angle and coefficient.
- Exercise checkers should validate method, not just final answer.

## Requirements

| Route Group | Required Interactions |
|---|---|
| `ch1-5-*` | static/sliding/rolling friction, friction cone, inclined plane, self-locking |
| `ch1-6-*` | balance point, centroid calculator, composite/hole method |
| `ch1-7-*` | FBD + equation + numeric answer step checker |

## Architecture

Use `SimStatics` for visuals. Use `SimActivities` for checker logic:

`scenario` -> `student actions` -> `validate step` -> `feedback` -> optional localStorage progress.

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-statics.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-activities.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\simulations.js` |
| Optional create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\data\activity-ch1.json` |

## Implementation Steps

1. Add `frictionContactLab` for `ch1-5-1`.
2. Add `frictionTypeTabs` for `ch1-5-2`.
3. Add `frictionConeInclineLab` for `ch1-5-3`.
4. Add `selfLockingWedgeScrewLab` for `ch1-5-4`.
5. Extend centroid calculator with composite shapes and negative area.
6. Add symmetry/hole visual for `ch1-6-3`.
7. Add guided solver for support reactions and friction examples in `ch1-7-1`.
8. Add numeric checker cards for selected `ch1-7-2` exercises.

## Todo List

- [x] Add friction law formula readouts: `F <= μN`, `φ = arctan μ`.
- [x] Add inclined plane state: rest, impending slip, sliding.
- [x] Add self-locking condition visual.
- [x] Add composite centroid visual with negative area.
- [x] Add Ch1 exercise checker scenarios.

## Completion Notes

- Ch1 V-VII P1 routes registered and browser-smoked.

## Tests And Verification

```powershell
node --check js\sim-statics.js
node --check js\sim-activities.js
node --check js\simulations.js
python tools\audit.py
```

Manual verify:

- `ch1-5-3`: `μ=0` gives no friction hold; increasing `μ` changes threshold.
- `ch1-5-4`: self-locking threshold matches `α <= φ`.
- `ch1-6-2`: symmetric shapes return centroid on symmetry axis.
- `ch1-7-*`: wrong step gives targeted feedback; reset clears only activity state.

## Success Criteria

- All Ch1 V-VII P1 interactions work.
- At least 3 guided Ch1 exercise scenarios.
- No regression in Ch1 I-IV sims.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Checker becomes fake/mocked | Use real formulas and numeric tolerance |
| UI overload | One main lab per route, not many panels |

## Security Considerations

Activity state stores only progress/answers locally; no PII.

## Next Steps

Proceed to Ch2 particle, rigid-body, transmission labs.
