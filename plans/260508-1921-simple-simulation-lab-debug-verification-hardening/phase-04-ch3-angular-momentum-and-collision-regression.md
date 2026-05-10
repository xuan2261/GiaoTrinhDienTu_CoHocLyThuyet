---
title: "Phase 04 - Ch3 Angular Momentum and Collision Regression"
status: completed
priority: P1
effort: 3h
---

# Phase 04 - Ch3 Angular Momentum and Collision Regression

## Context Links

- [Validation Report evidence](../260508-1435-simple-simulation-lab-assessment-removal/reports/validation-report.md#agent-browser-evidence)
- [System Architecture simulation section](../../docs/system-architecture.md#failure-modes-cần-quan-tâm)

## Overview

Lock direct manipulation behavior for `ch3-5-3` and `ch3-6-2`, because both had route-owned physics/readout drift.

## Key Insights

- `ch3-5-3` must map dragged mass radius to `r`, `I`, and `L`.
- `ch3-6-2` must update ball position plus velocity/momentum after drag.
- Pausing before drag gives clearer evidence.

## Requirements

- `ch3-5-3`: radius drag changes `L` visibly and redraws orbital mass.
- `ch3-6-2`: ball drag changes `p trước` / `p sau`.
- Existing slider controls remain functional.
- Collision animation continues after pause/resume/reset.

## Architecture

| Route | State Keys | Files |
|---|---|---|
| `ch3-5-3` | `r`, `I`, `omega`, `L` | `sim-professional-lab.js`, `ch3-dynamics-theorem-collision-behaviors.js`, `ch3-theorems-renderers.js` |
| `ch3-6-2` | `ball1`, `ball2`, `vx`, `vy`, `pBefore`, `pAfter` | `sim-professional-lab.js`, `ch3-dynamics-theorem-collision-behaviors.js` |

## Related Code Files

- Modify if needed: `js/sim-professional-lab.js`
- Modify if needed: `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js`
- Read: `js/sims/ch3/ch3-theorems-renderers.js`
- Tests: `tests/simulation-browser.spec.js`, `tests/simulation-visual-quality.spec.js`

## Implementation Steps

1. Inspect `ch3Handles()` route-owned descriptors.
2. Ensure `orbit-radius` setter recalculates `I` and `L`.
3. Ensure collision ball setters recalc velocities and call momentum update.
4. Confirm derived fallback returns finite momentum from current balls.
5. Verify reset pauses/clears as expected without losing frame callbacks.

## Todo List

- [x] Confirm `ch3-5-3` drag target follows physical mass.
- [x] Confirm `ch3-6-2` hit radius is usable but not visually generic.
- [x] Run direct-drag browser tests.
- [x] Capture agent-browser before/after screenshots.

## Verification & Tests

```powershell
node --check js\sim-professional-lab.js
node --check js\sims\ch3\ch3-dynamics-theorem-collision-behaviors.js
npm run test:sim:browser -- --grep "ch3-5-3|ch3-6-2|direct drag|animation"
npm run test:sim:visual-quality -- --grep "ch3-5-3|ch3-6-2|route-owned drag"
```

Manual `ck:agent-browser` evidence:

- Open `#ch3-5-3`; pause; drag orbiting mass outward; verify `L` changes.
- Open `#ch3-6-2`; pause; drag a ball; verify `p trước`/`p sau` changes.

## Success Criteria

- `ch3-5-3` readout `L` changes after drag.
- `ch3-6-2` momentum changes after drag.
- No non-finite values in readout.

## Risk Assessment

- Risk: hit target hidden too small for human use.
- Mitigation: keep hit radius generous while not drawing generic handles.

## Security Considerations

- Do not persist collision/debug state to storage.

## Next Steps

Proceed to broader manual matrix and screenshots.

## Execution Result

Completed 2026-05-08. Added paused readout/reset regressions for `ch3-5-3` L and `ch3-6-2` momentum, including vertical drag; direct-drag suite passed `70 passed`.

## Unresolved Questions

None.
