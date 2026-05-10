# Phase 03 Chapter 1 Statics Core Interactions

## Context Links

- [Coverage Matrix](./research/simulation-coverage-matrix.md)
- [Phase 02](./phase-02-simulation-runtime-foundation.md)

## Overview

Priority: P1. Status: Complete. Add/extend Ch1 I-IV interactions: force, moment, force systems, constraints, equilibrium, FBD, 3D force reduction.

## Key Insights

- Ch1 teaches visual reasoning. Drag builders are higher value than passive animation.
- Existing sims cover moment/couple/parallelogram/supports partially.
- Hệ lực không gian is currently underrepresented.

## Requirements

| Route Group | Required Interactions |
|---|---|
| `ch1-1-*` | force vector anatomy, moment, couple, force system reducer, DOF |
| `ch1-2-*` | equilibrium laws, action-reaction, add/remove balanced pair, FBD release |
| `ch1-3-*` | constraint selector for support types and reaction directions |
| `ch1-4-*` | vector sum, main moment, force-system classifier, equilibrium equation board |

## Architecture

Add Ch1 sims to `SimStatics`. Reuse common control helpers. Prefer one reusable `constraintReactionLab(config)` for support routes.

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-statics.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\simulations.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css` |

## Implementation Steps

1. Add `forceVectorAnatomy` for `ch1-1-3`.
2. Extend existing moment/couple sims with sign convention and cánh tay đòn overlay.
3. Add `forceSystemReducer2d` for `ch1-1-5`.
4. Add `dofConstraintExplorer` for `ch1-1-7` and `ch1-1-8`.
5. Add two-force and balanced-pair labs for `ch1-2-1`, `ch1-2-2`.
6. Add action-reaction pairing for `ch1-2-4`.
7. Add FBD builder for `ch1-2-6`.
8. Add support reaction variants for `ch1-3-1` through `ch1-3-7`.
9. Add 2.5D force/moment reducer for `ch1-4-1` through `ch1-4-5`.

## Todo List

- [x] Preserve existing Ch1 routes.
- [x] Add P1 new routes: `ch1-1-3`, `ch1-1-5`, `ch1-1-8`, `ch1-2-1`, `ch1-2-6`, `ch1-3-1`, `ch1-3-2`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7`, `ch1-4-1`, `ch1-4-2`, `ch1-4-4`.
- [ ] Add P2 routes if time: `ch1-1-2`, `ch1-2-2`, `ch1-2-4`, `ch1-3-5`, `ch1-4-3`, `ch1-4-5`.
- [x] Add reset buttons and deterministic defaults.
- [x] Add formula readout for each numerical sim.

## Completion Notes

- P1 routes registered and browser-smoked.
- P2 routes listed above remain backlog.

## Tests And Verification

```powershell
node --check js\sim-core.js
node --check js\sim-statics.js
node --check js\simulations.js
python tools\audit.py
```

Manual route smoke:

- Desktop and mobile: all `ch1-1-*`, `ch1-2-*`, `ch1-3-*`, `ch1-4-*`.
- Drag handles work by mouse and touch.
- Formula readouts update when sliders move.
- No canvas blank, no console errors.

## Success Criteria

- Ch1 I-IV has meaningful interaction coverage.
- Learner can build FBD and identify reaction directions.
- 3D force-system concepts have at least 2.5D visual support.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Too many one-off sims | Use reusable builders by route config |
| Incorrect statics equations | Validate with textbook examples and simple known cases |

## Security Considerations

No network, no sensitive storage.

## Next Steps

Proceed to Ch1 ma sát, trọng tâm, bài tập solvers.
