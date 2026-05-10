# Phase 05 Pedagogy And Assessment Engine

## Context Links

- [Plan](./plan.md)
- [Validation Report](./reports/validation-report.md)
- [System Architecture](../../docs/system-architecture.md)

## Overview

Priority: P1. Status: Completed. Upgrade `SimActivities` from numeric checker to route-level pedagogy/assessment engine with objectives, checkpoints, hints, feedback, scoring, and safe localStorage state.

## Key Insights

- Current checkers are useful but too narrow.
- All 58 routes need at least 2 checkpoints.
- Storage must not corrupt existing quiz/progress/notes.

## Requirements

Functional:
- Route manifest includes objective, concept tags, interaction type, assessment checkpoints.
- Assessment supports numeric, vector, multiple-choice, drag-placement, sequence, graph cursor checks.
- Store progress per route and checkpoint.
- Provide reset for route assessment.

Non-functional:
- New storage key: `chlyt_sim_assessment_v2`.
- Old `chlyt_activity_progress_v1` read-only migration optional.
- Malformed storage cannot crash route.

## Architecture

`SimAssessment`:
- `registerRoute(routeId, metadata)`
- `createAssessmentPanel(lab, routeId)`
- `check(routeId, checkpointId, answerOrState)`
- `saveProgress(routeId, checkpointId, result)`
- `resetRoute(routeId)`

Manifest shape:

```js
{
  routeId: 'ch1-1-5',
  objective: 'Reduce a planar force system to resultant and moment.',
  interaction: ['drag-vector', 'move-origin', 'toggle-resultant'],
  checkpoints: [{ id: 'resultant-direction', type: 'vector', tolerance: 5 }]
}
```

## Related Code Files

Modify:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-activities.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-assessment.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\smoke_simulation_manifest.py`

## Implementation Steps

1. Define manifest schema for 58 route IDs.
2. Add assessment storage helpers with versioning and normalization.
3. Add checkpoint types: numeric, vector, choice, drag-target, sequence.
4. Convert representative routes to new assessment panel.
5. Add manifest smoke to hard-fail missing objective/checkpoints.
6. Add malformed localStorage tests.

## Todo List

- [x] Define manifest schema.
- [x] Add 58 route metadata skeleton.
- [x] Implement assessment engine.
- [x] Convert representative checkpoints.
- [x] Add storage smoke.
- [x] Update docs.

## Completion Notes

- `SimAssessment` now owns `chlyt_sim_assessment_v2`, route registration, checkpoint checking, panel rendering, reset, and malformed storage normalization.
- `js/sim-route-manifest.js` now declares all 58 current simulation routes with objective and at least 2 checkpoints.
- Representative lab route assessment is state-based; browser `@assessment` fails before drag and passes after scene drag.
- Evidence: [Phase 04-05 Interaction Assessment Report](./reports/phase-04-05-interaction-assessment-report.md).

## Verify / Tests

```powershell
Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-checkpoints-min 2
python tools\smoke_simulation_runtime.py --malformed-assessment-storage
python tools\audit_simulation_quality.py --require-assessment
npm run test:sim:browser -- --grep @assessment
```

## Success Criteria

- Every current route has objective and at least 2 planned checkpoints in manifest.
- Representative routes have working interactive assessment.
- Storage is versioned and resilient.

## Risk Assessment

Risk: assessment UI distracts from learning. Mitigation: collapsed/compact panel, only expands when learner starts task.

Risk: too many checkpoint types. Mitigation: only implement types used by current 58 routes.

## Security Considerations

localStorage only stores route IDs/checkpoint state/scores. No personal data.

## Next Steps

Phases 6-11 upgrade all 58 routes using shared shell, direct interaction, and assessment.
