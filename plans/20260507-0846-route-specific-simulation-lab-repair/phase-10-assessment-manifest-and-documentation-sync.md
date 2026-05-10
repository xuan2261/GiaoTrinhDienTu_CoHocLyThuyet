# Phase 10 Assessment Manifest And Documentation Sync

## Context Links

- [Plan](./plan.md)
- [Phase 09](./phase-09-chapter-3-theorems-collision-and-solvers.md)
- [Documentation Management Rules](../../docs/project-roadmap.md)

## Overview

Priority: P1. Status: Completed.

Align route assessments, manifests, docs, and changelog after all scenes are route-specific.

## Key Insights

- Scene visuals can be correct while checkpoints still test old generic state.
- Documentation currently says shared professional lab centralizes topic selection; update to route-scene architecture.
- `sim-route-manifest.js` should describe route-specific objective/checkpoints.

## Requirements

- Every route checkpoint uses state keys produced by new scene.
- Browser assessment positive cases still pass.
- Docs reflect route-scene registry.
- Changelog records root-cause fix and QA gates.

## Architecture

Assessment flow remains:

```text
SimLabUI.createLab -> SimAssessment.createAssessmentPanel -> scene.getAssessmentState()
```

Only the state source changes from generic derived state to route-specific scene state.

## Related Code Files

| Action | Path | Notes |
|---|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js` | Route-specific checkpoint prompts/keys. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-assessment.js` | Only if generic checker needs key handling. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` | Add positive paths for representative new scenes. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\system-architecture.md` | Document scene registry architecture. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\codebase-summary.md` | Update simulation file roles. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\code-standards.md` | Add new validation commands. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-changelog.md` | Record bugfix and QA additions. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-roadmap.md` | Mark simulation uniqueness repair progress. |

## Implementation Steps

1. Audit all scene `assessmentState` outputs.
2. For each route, verify every checkpoint key exists.
3. Update manifest prompts to match new interactions.
4. Add browser positive assessment cases for:
   - Ch1 force/statics route
   - Ch1 support/friction route
   - Ch2 graph/relative route
   - Ch3 ODE/collision route
5. Update docs/changelog/roadmap.
6. Save docs sync notes to plan report.

## Todo List

- [x] Audit checkpoint keys across 58 scenes.
- [x] Update manifest prompts/keys.
- [x] Add positive assessment browser cases.
- [x] Update architecture/codebase/code-standards docs.
- [x] Update roadmap/changelog.
- [x] Run docs and assessment tests.

## Success Criteria

- Every route has at least 2 checkpoints.
- No checkpoint references missing scene state.
- Docs match actual runtime files.

## Phase Tests

```powershell
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2
python tools\audit_simulation_quality.py --all --max-js-lines 220 --require-assessment
npm run test:sim:unit
npm run test:sim:browser -- --grep "@assessment"
python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58
```

## Risk Assessment

- Risk: manifest updates break existing positive tests. Mitigation: update scene state and tests together.
- Risk: docs overstate implementation. Mitigation: docs only after code/test evidence.

## Security Considerations

Keep `localStorage` schema stable. Do not change `chlyt_sim_assessment_v2` unless necessary.

## Next Steps

Completed.

Unresolved questions: none.
