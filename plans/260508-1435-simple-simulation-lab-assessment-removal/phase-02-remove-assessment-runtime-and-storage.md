# Phase 02 - Remove Assessment Runtime and Storage

## Context Links

- [Plan](./plan.md)
- [Red Team Review](./reports/red-team-review.md)
- [Baseline Inventory](./phase-01-baseline-and-contract-inventory.md)

## Overview

Priority: P1  
Status: Done  Goal: remove assessment/checkpoint runtime contract. After this phase, app no longer loads or writes assessment storage.

## Key Insights

- User explicitly approved full removal, not CSS hiding.
- `sim-route-manifest.js` should stay as lightweight metadata to avoid large script-order churn.
- Existing browser localStorage may contain old key; new runtime must ignore it.

## Requirements

Functional:
- Remove `js/sim-assessment.js` script load from `index.html`.
- Remove `SimAssessment.createAssessmentPanel` call path from `sim-lab-ui.js`.
- Convert `sim-route-manifest.js` to objectives/interactions/renderer links only.
- Remove checkpoint metadata and registration.
- Remove or retire `js/sim-assessment.js` after references are gone.
- Ensure no runtime reads/writes `chlyt_sim_assessment_v2`.

Non-functional:
- Keep 58 routes, renderer IDs, behavior IDs intact.
- Keep route objectives for hint text.
- No new storage schema.

## Architecture

Before:
`SIM_ROUTE_MANIFEST.checkpoints` -> `SimAssessment.registerAll` -> `createAssessmentPanel()` -> localStorage.

After:
`SIM_ROUTE_MANIFEST.objective` -> `SimProfessionalLab` hint only. No assessment module.

## Related Code Files

| Action | File | Notes |
|---|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\index.html` | Remove `js/sim-assessment.js` script |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-lab-ui.js` | Remove assessment panel and controller |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js` | Strip checkpoints, keep route metadata |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-professional-lab.js` | Remove `getAssessmentState` config |
| Delete | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-assessment.js` | Only after `rg SimAssessment` clean |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\code-standards.md` | Later docs phase can finalize |

## Implementation Steps

1. In `sim-lab-ui.js`, remove `lab.assessment`, `.sim-checkpoint-panel`, and `SimAssessment.createAssessmentPanel`.
2. In `sim-professional-lab.js`, stop passing `getAssessmentState`.
3. In `sim-route-manifest.js`, remove `cp()`, all `checkpoints`, `syncContractLinks` checkpoint loop, and `SimAssessment.registerAll`.
4. Keep `objective`, `interaction`, and runtime `rendererId`/`behaviorId` linking.
5. In `index.html`, remove `js/sim-assessment.js`.
6. Delete `js/sim-assessment.js` if no runtime/test/tool import remains.
7. Run static checks.

## Todo List

- [ ] Remove assessment panel creation.
- [ ] Remove assessment config passed from engine.
- [ ] Convert route manifest to metadata.
- [ ] Remove assessment script from `index.html`.
- [ ] Delete retired assessment module when references are clean.
- [ ] Confirm no runtime storage key access.

## Validation & Tests

```powershell
node --check js\sim-lab-ui.js
node --check js\sim-professional-lab.js
node --check js\sim-route-manifest.js
rg -n "SimAssessment|chlyt_sim_assessment_v2|sim-checkpoint|Điểm kiểm tra" index.html js css tests tools package.json
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup
npm run test:sim:unit
```

Expected:
- `rg` has no runtime hits in `index.html js css`.
- Runtime smoke passes without malformed assessment storage option.
- No `SimAssessment` global required.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Manifest parser tools break | Update tools in Phase 06, but keep this phase static command expectations explicit. |
| Engine relies on checkpoint objective | Preserve `objective`. |
| Delete file too early | Only delete after static search confirms no references. |

## Security Considerations

- Removing localStorage writes reduces persisted data.
- No sensitive data involved.

## Next Steps

Proceed to Phase 03 after runtime no longer depends on assessment.

## Unresolved Questions

None.
