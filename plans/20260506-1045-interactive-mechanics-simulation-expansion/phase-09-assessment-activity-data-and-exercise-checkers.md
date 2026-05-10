# Phase 09 Assessment Activity Data And Exercise Checkers

## Context Links

- [Phase 04](./phase-04-chapter-1-friction-centroid-and-solver-labs.md)
- [Phase 06](./phase-06-chapter-2-composition-plane-motion-and-fixed-point-labs.md)
- [Phase 08](./phase-08-chapter-3-theorems-energy-and-collision-labs.md)

## Overview

Priority: P1. Status: Complete. Standardize micro-checks, guided exercise data, local progress, and feedback patterns across simulations.

## Key Insights

- Existing `quiz.js` works for chapter quizzes. Do not overload it.
- Simulation checkers need route-level state and step-level feedback.
- Store only minimal local progress.

## Requirements

| Type | Requirement |
|---|---|
| Functional | Add route-level activity checkers |
| Functional | Support numeric tolerance, multiple-choice, drag classification, step completion |
| Functional | Save optional progress in localStorage |
| Non-functional | Preserve `quizScores`, `chlyt_progress`, notes/bookmarks |
| Non-functional | No server, no user account |

## Architecture

Proposed localStorage key:

`chlyt_activity_progress_v1`

Schema:

```json
{
  "routeId": {
    "completed": ["step-1", "step-2"],
    "lastScore": 0.8,
    "updatedAt": "2026-05-06T00:00:00.000Z"
  }
}
```

Data options:

| Option | Use |
|---|---|
| Inline route config in sim modules | Simple, best for few checks |
| `data/activity-ch*.json` | Better if many exercises |

Default: inline for simulation micro-checks, JSON for exercise banks.

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-activities.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-core.js` |
| Optional modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\bundle_pages.py` |
| Optional create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\data\activity-ch1.json` |
| Optional create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\data\activity-ch2.json` |
| Optional create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\data\activity-ch3.json` |

## Implementation Steps

1. Add checker helpers: numeric tolerance, vector direction, selected option, ordered step.
2. Add activity feedback UI components.
3. Add localStorage read/write with try/catch and schema guard.
4. Add optional activity data loading path.
5. Integrate Ch1/Ch2/Ch3 exercise scenarios from phases 4/6/8.
6. If JSON data is introduced, update bundling/audit expectations.

## Todo List

- [x] Add `SimActivities.checkNumeric`.
- [x] Add `SimActivities.checkVectorDirection`.
- [x] Add `SimActivities.createStepChecker`.
- [x] Add localStorage namespace and reset route function.
- [x] Add at least 3 checks per chapter.
- [x] Decide inline vs JSON per scenario count.

## Completion Notes

- Activity state uses `chlyt_activity_progress_v1`.
- Runtime smoke covers malformed localStorage schema guard.
- Exercise checkers use inline route config; no activity JSON added.

## Tests And Verification

```powershell
node --check js\sim-activities.js
node --check js\sim-core.js
node --check js\simulations.js
node --check js\quiz.js
python tools\audit.py
```

Manual verify:

- Activity progress survives page reload.
- Reset route clears activity only, not quiz/progress/notes.
- Invalid localStorage JSON does not crash app.
- Numeric tolerance accepts equivalent rounded answers.
- Wrong unit or wrong sign rejected where relevant.

## Success Criteria

- Shared checker layer avoids duplicated logic.
- Exercise checkers feel consistent across chapters.
- Existing quiz behavior unchanged.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| State schema grows messy | Versioned key and minimal fields |
| Bundle misses activity JSON | Update `tools/bundle_pages.py` only if JSON chosen |

## Security Considerations

No PII. localStorage can be cleared by user. Handle malformed values.

## Next Steps

Proceed to full QA, docs, and release handoff.
