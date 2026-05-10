# Phase 01 - Baseline and Contract Inventory

## Context Links

- [Plan](./plan.md)
- [Scout Report](./reports/scout-report.md)
- [Test Strategy Research](./research/test-strategy-research.md)
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\README.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\code-standards.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\system-architecture.md`

## Overview

Priority: P1  
Status: Done  Goal: lock current baseline before deleting assessment. Produce inventory of route count, assessment references, test references, and expected command deltas.

## Key Insights

- Current project passes assessment-era gates.
- Removing assessment without inventory can leave stale references in tests/tools/docs.
- Workspace is not a git repo, so baseline report must be explicit.

## Requirements

Functional:
- Confirm 58 runtime routes.
- List every assessment/checkpoint reference in runtime, tools, tests, docs.
- List every visible generic handle/draw-handle reference in runtime, tests, and docs.
- Mark files to modify/delete in later phases.

Non-functional:
- No code changes in this phase except optional report docs inside plan dir.
- Keep commands reproducible.

## Architecture

No runtime architecture changes.

Data flow to document:
`index.html` -> `sim-assessment.js` + `sim-route-manifest.js` -> `SimAssessment.registerAll` -> `SimLabUI.createLab` -> `.sim-checkpoint-panel`.

## Related Code Files

| Action | File |
|---|---|
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\index.html` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-lab-ui.js` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-professional-lab.js` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-assessment.js` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\*.py` simulation QA files |

## Implementation Steps

1. Run baseline route and manifest commands.
2. Run `rg` inventory for assessment/checkpoint/storage terms.
3. Run `rg` inventory for generic handle rendering/text terms.
4. Record command outputs into `reports/baseline-inventory.md`.
5. Identify phase ownership for each file.
6. Confirm pending visual plans are blocked by this plan.

## Todo List

- [ ] Run route smoke.
- [ ] Run manifest smoke.
- [ ] Run runtime smoke current baseline.
- [ ] Run `rg` assessment inventory.
- [ ] Run `rg` handle-marker inventory.
- [ ] Write `reports/baseline-inventory.md`.
- [ ] Confirm no hidden route count mismatch.

## Validation & Tests

```powershell
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage
npm run test:sim:unit
rg -n "SimAssessment|chlyt_sim_assessment_v2|sim-checkpoint|Điểm kiểm tra|require-assessment|checkpoint" index.html js css tests tools docs README.md package.json
rg -n "drawRouteHandles|render\\.drawHandle|drawHandle\\(|điểm kéo|điểm điều khiển|legacy-primary|legacy-vector|data-handle-ids" js css tests tools docs README.md package.json
```

Expected:
- Baseline commands pass before removal.
- Inventory is complete and attached to plan reports.
- Inventory explicitly identifies current visible handle-marker drawing path.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Missing stale reference | Use broad `rg` terms and include docs/tests/tools. |
| Baseline already broken | Stop and fix baseline or update plan before deletion. |

## Security Considerations

- No user data migration yet.
- Do not touch confidential files.

## Next Steps

Proceed to Phase 02 only after inventory is written.

## Unresolved Questions

None.
