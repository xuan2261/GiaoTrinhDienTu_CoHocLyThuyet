# Phase 06 Chapter 1 Force Fundamentals Labs

## Context Links

- [Plan](./plan.md)
- [Coverage Matrix](../20260506-1045-interactive-mechanics-simulation-expansion/research/simulation-coverage-matrix.md)

## Overview

Priority: P1. Status: Completed. Pro-upgraded Ch1 foundational force routes to professional labs with direct vector/body manipulation and conceptual checkpoints.

## Routes In Scope

`ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-1-8`, `ch1-2-1`, `ch1-2-3`, `ch1-2-6`.

## Requirements

Functional:
- Force vector endpoint drag, line-of-action drag, angle snap.
- Moment arm/point selector with live sign and lever arm.
- Force system reducer with movable origin and resultant/moment panel.
- FBD builder uses drag/drop force symbols, not only toggle buttons.

Non-functional:
- Each route has at least 2 checkpoints; FBD/reducer routes have 4+.
- Labels fit on mobile.
- Current formulas remain consistent with textbook notation.

## Architecture

Create route/topic modules:
- `js/sims/ch1/force-vector-anatomy.js`
- `js/sims/ch1/moment-and-couple-labs.js`
- `js/sims/ch1/force-system-reducer.js`
- `js/sims/ch1/fbd-builder.js`
- `js/sims/ch1/equilibrium-basics.js`

## Related Code Files

Modify:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\simulations.js`
- Ch1 topic modules above

## Implementation Steps

1. Upgrade `ch1-1-3`: drag application point and vector endpoint; checkpoint components `Fx`, `Fy`.
2. Upgrade `ch1-1-4`: drag force line and moment center; checkpoint sign and magnitude.
3. Upgrade `ch1-1-5`: drag forces and reduction point; checkpoint resultant class.
4. Upgrade `ch1-1-6`: drag couple separation; checkpoint free-vector moment.
5. Upgrade `ch1-1-8`: click/drag constraints; checkpoint locked DOF/reaction direction.
6. Upgrade `ch1-2-1`: drag two forces into equilibrium; checkpoint equal/opposite/collinear.
7. Upgrade `ch1-2-3`: direct parallelogram handles; checkpoint resultant magnitude.
8. Upgrade `ch1-2-6`: FBD drag/drop force builder; checkpoint missing/extra reactions.

## Todo List

- [x] Upgrade 8 route UIs.
- [x] Add 20+ checkpoints.
- [x] Add route manifest entries complete.
- [x] Add representative worked formulas.
- [x] Add browser drag tests.

## Verify / Tests

```powershell
Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --routes ch1-1-3,ch1-1-4,ch1-1-5,ch1-1-6,ch1-1-8,ch1-2-1,ch1-2-3,ch1-2-6 --require-direct --require-checkpoints-min 2
python tools\audit_simulation_quality.py --routes ch1-1-3,ch1-1-4,ch1-1-5,ch1-1-6,ch1-1-8,ch1-2-1,ch1-2-3,ch1-2-6
npm run test:sim:browser -- --grep @ch1-force
```

## Success Criteria

- All 8 routes use professional lab shell.
- All 8 have direct scene interaction.
- FBD/reducer routes have useful assessment, not only numeric input.

## Risk Assessment

Risk: FBD drag/drop too complex. Mitigation: implement with fixed force palette and snap zones, not arbitrary free-form drawing.

## Security Considerations

Clamp drag state to finite canvas bounds before physics calculations.

## Next Steps

Completed. See [plan](./plan.md) and [final QA report](./reports/final-qa-report.md).
