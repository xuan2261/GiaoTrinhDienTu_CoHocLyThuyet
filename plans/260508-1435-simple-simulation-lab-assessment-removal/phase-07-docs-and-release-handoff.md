# Phase 07 - Docs and Release Handoff

## Context Links

- [Plan](./plan.md)
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\README.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\code-standards.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\design-guidelines.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\system-architecture.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-roadmap.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-changelog.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\codebase-summary.md`

## Overview

Priority: P1  
Status: Done  
Goal: make documentation match the new simple simulation shell, clean interaction contract, and removed assessment contract.

## Key Insights

- Docs currently describe professional assessment foundation.
- README QA commands currently include checkpoint/assessment gates.
- Project roadmap/changelog must explain intentional removal, not regression.

## Requirements

Functional:
- README lists current simulation architecture and QA commands.
- Docs remove current-state references to checkpoint panels/storage.
- Docs state that professional labs no longer render generic round drag handles or drag-placement markers on canvas.
- Docs state animated routes expose reset/play-pause behavior where animation is continuous.
- Changelog records assessment removal and simple shell.
- Roadmap marks simple shell baseline done after implementation.
- Code standards update validation commands.

Non-functional:
- Keep docs concise.
- Preserve historical notes only in changelog/journals if needed.
- No generated files edited by hand.

## Architecture

Docs should describe:
`SimLabUI simple shell` + `SimProfessionalLab` + clean controls/hidden hit targets + route metadata + renderer/behavior registries.

They should not describe:
`SimAssessment`, checkpoint storage, checkpoint panel, or visible generic drag handles as active runtime.

## Related Docs

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\README.md` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\code-standards.md` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\design-guidelines.md` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\system-architecture.md` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\codebase-summary.md` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-roadmap.md` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-changelog.md` |
| Optional create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\journals\260508-simple-simulation-lab-assessment-removal.md` |

## Implementation Steps

1. Update README structure table: `sim-lab-ui.js`, `sim-route-manifest.js`, remove `sim-assessment.js`.
2. Update QA commands in README and `docs/code-standards.md`.
3. Update design guidelines: simple shell slots, no checkpoint panel, no visible generic drag markers.
4. Update system architecture and codebase summary.
5. Update roadmap snapshot and phases.
6. Add changelog entry under 2026-05-08.
7. Add journal entry if project convention requires.
8. Run final full QA.

## Todo List

- [x] README synced.
- [x] Code standards synced.
- [x] Design guidelines synced.
- [x] System architecture synced.
- [x] Codebase summary synced.
- [x] Roadmap synced.
- [x] Changelog updated.
- [x] Full release gate passes.

## Validation & Tests

```powershell
python tools\audit.py
python tools\audit.py --strict-equations
python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict --katex
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup
npm run test:sim:release
rg -n "SimAssessment|chlyt_sim_assessment_v2|sim-checkpoint|Điểm kiểm tra|require-assessment|malformed-assessment-storage" README.md docs index.html js css tests tools package.json
rg -n "render\\.drawHandle\\(|điểm kéo|điểm điều khiển|legacy-primary|legacy-vector" index.html js css tests tools package.json
```

Expected:
- Historical references only in old plans/journals, not active docs/runtime.
- Active runtime/tests do not describe or render generic handle markers.
- Release gate passes.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Docs say old assessment still active | Use final `rg` across README/docs. |
| README commands drift from package scripts | Cross-check `package.json`. |
| Full release gate exposes hidden regression | Fix before marking phase complete. |

## Security Considerations

- Docs should not mention obsolete storage as active state.
- No confidential files touched.

## Next Steps

After this phase, unblock visual polish plans if still wanted.

## Unresolved Questions

None.
