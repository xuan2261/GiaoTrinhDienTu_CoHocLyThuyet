# Phase 07 Pedagogy Challenge Mode

## Context Links

- [Phase 04](./phase-04-pilot-ch1-statics-routes.md)
- [Phase 05](./phase-05-pilot-ch2-kinematics-routes.md)
- [Phase 06](./phase-06-pilot-ch3-dynamics-routes.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Complete |
| Goal | Turn invariant knowledge into learner-facing tasks |
| Routes | 6 pilot routes |

## Key Insights

- Challenge mode must stay small. No heavy assessment engine revival.
- Feedback should be local/session-only unless user asks for persistence.
- Challenge tasks use same invariant residuals from Phase 02.

## Requirements

### Functional

- Add optional mode selector:
  - `Quan sát`
  - `Thao tác`
  - `Kiểm tra`
- Add route challenge specs:
  - prompt text.
  - target condition.
  - tolerance.
  - success message.
  - recovery hint.
- Use invariant residual to score.
- Add `Try again` and `Reset` paths.

### Non-Functional

- No gamification noise.
- No modal traps.
- No persistence by default.
- Screen reader feedback via polite live region.

## Architecture

```text
js/sim-promax-challenges.js
  -> challenge specs per pilot route
  -> evaluateChallenge(routeId, state, invariant)

SimProfessionalLab
  -> optional mode state
  -> challenge readout/hint update
```

## Related Code Files

| Action | File |
|---|---|
| Create | `js/sim-promax-challenges.js` |
| Modify | `js/sim-professional-lab.js` |
| Modify | `js/sim-lab-ui.js` |
| Modify | `css/style.css` |
| Modify/create | `tests/promax-challenge-mode.test.js` |
| Modify/create | `tests/promax-challenge-mode.spec.js` |

## Implementation Steps

1. Define challenge spec schema:
   - `routeId`
   - `mode`
   - `targetInvariant`
   - `tolerance`
   - `prompt`
   - `success`
   - `hint`
2. Add challenge specs for 6 pilots.
3. Add shared mode control to lab shell.
4. Add challenge evaluator that consumes invariant result.
5. Add feedback UI:
   - neutral.
   - close.
   - success.
   - error/retry.
6. Add browser tests for challenge completion and reset.
7. Confirm no localStorage writes unless explicit user decision later.

## Todo List

- [x] Create challenge module.
- [x] Add 6 pilot challenge specs.
- [x] Add mode selector UI.
- [x] Add live feedback.
- [x] Add unit tests.
- [x] Add browser tests.

## Verification / Tests

```powershell
node --check js\sim-promax-challenges.js
node tests\promax-challenge-mode.test.js
npm run test:sim:unit
playwright test tests\promax-challenge-mode.spec.js
playwright test tests\simulation-browser.spec.js --grep "reset|keyboard|localization"
npm run test:sim:visual-quality
python tools\audit_simulation_quality.py --all --max-js-lines 220
```

Manual checks:

- Complete one challenge per pilot route.
- Keyboard-only challenge completion works.
- Screen reader live region text is concise.
- Reset returns to neutral state.

## Success Criteria

- 6 pilot routes support optional `Kiểm tra` mode.
- Challenge feedback uses invariant, not separate formula copy.
- No persistence/state regression.
- All tests pass.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Recreates removed assessment complexity | Keep local mode only |
| Challenge text too verbose | One prompt, one hint, one feedback line |
| Formula duplicated | Consume Phase 02 invariant result |

## Security Considerations

- No personal data.
- No backend.
- No new storage unless later approved.

## Next Steps

- Phase 08 adds mini graph/formula readout layer for richer explanation.

## Unresolved Questions

- Whether future progress persistence is desired. Not needed for this plan.
