---
title: "Phase 03 - Ch2 Trajectory and Graph Interaction Regression"
status: completed
priority: P1
effort: 3h
---

# Phase 03 - Ch2 Trajectory and Graph Interaction Regression

## Context Links

- [Agent-browser evidence source](../260508-1435-simple-simulation-lab-assessment-removal/reports/validation-report.md#agent-browser-evidence)
- [Code Standards](../../docs/code-standards.md)

## Overview

Lock regression behavior for `ch2-1-1` trajectory presets and `ch2-1-2` graph cursor drag. These were user-visible symptoms.

## Key Insights

- `mode` is non-number state and must sync into readout.
- Preset buttons must redraw while paused/running.
- Graph drag must update route state, not just marker position.

## Requirements

- `ch2-1-1`: buttons `Tròn`, `Elip`, `Parabol` update canvas path and `CHẾ ĐỘ`.
- `ch2-1-2`: dragging graph cursor updates `X(T)`, `V(T)`, and related state.
- No generic visible drag label or standalone circular handle.

## Architecture

| Route | State Keys | Files |
|---|---|---|
| `ch2-1-1` | `mode`, `omega`, `angle`, readout display | `ch2-kinematics-scenes.js`, `ch2-kinematics-behaviors-a.js`, `ch2-trajectory-graph-renderers.js`, `sim-professional-lab.js` |
| `ch2-1-2` | `xVal`, `vVal`, `aVal`, `t` | `ch2-kinematics-scenes.js`, `ch2-kinematics-behaviors-a.js` |

## Related Code Files

- Modify if needed: `js/sim-professional-lab.js`
- Modify if needed: `js/sims/ch2/ch2-kinematics-scenes.js`
- Modify if needed: `js/sims/ch2/ch2-kinematics-behaviors-a.js`
- Modify if needed: `js/sims/ch2/ch2-trajectory-graph-renderers.js`
- Tests: `tests/simulation-browser.spec.js`, `tests/simulation-visual-quality.spec.js`

## Implementation Steps

1. Verify initial `ch2-1-1` mode and readout.
2. Ensure button handlers update state, clear trails if needed, and redraw.
3. Ensure `syncDisplayState()` handles string display values.
4. Verify `ch2-1-2` handle setter writes derived graph readout keys.
5. Add or update focused regression tests only if they assert plan requirements.

## Todo List

- [x] Check `ch2-1-1` initial `Elip` state.
- [x] Check preset button readout sync.
- [x] Check `ch2-1-2` drag state sync.
- [x] Capture agent-browser screenshots.
- [x] Run focused and full Ch2-related tests.

## Verification & Tests

```powershell
node --check js\sim-professional-lab.js
node --check js\sims\ch2\ch2-kinematics-scenes.js
node --check js\sims\ch2\ch2-kinematics-behaviors-a.js
node --check js\sims\ch2\ch2-trajectory-graph-renderers.js
npm run test:sim:browser -- --grep "ch2-1-1|ch2-1-2|particle preset|direct drag"
npm run test:sim:visual-quality -- --grep "ch2-1-1|ch2-1-2|visual-strict"
```

Manual `ck:agent-browser` evidence:

- Open `http://127.0.0.1:8000/index.html#ch2-1-1`; click `Tròn`, `Parabol`; save screenshots.
- Open `#ch2-1-2`; drag graph cursor; save before/after readout screenshots.

## Success Criteria

- `CHẾ ĐỘ` changes with preset buttons.
- `X(T)`/`V(T)` values change after graph drag.
- Tests pass without weakening localization or direct-drag assertions.

## Risk Assessment

- Risk: animation changes readout while testing.
- Mitigation: pause route before manual drag when possible.

## Security Considerations

- No storage writes beyond existing route state/UI behavior.

## Next Steps

Proceed to Ch3 direct interaction checks.

## Execution Result

Completed 2026-05-08. Added paused readout regressions for `ch2-1-1` presets and `ch2-1-2` graph cursor; direct-drag suite passed `70 passed`.

## Unresolved Questions

None.
