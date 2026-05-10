# Phase 10 - Assessment And Pedagogy Sync

## Context Links

- `js/sim-route-manifest.js`
- `js/sim-assessment.js`
- `js/sim-activities.js`
- [Pedagogical Route Specificity Research](./research/pedagogical-route-specificity-research.md)

## Overview

Priority: P1. Status: Complete. Align objectives, checkpoints, feedback, and assessment state with the new route-specific renderers.

## Requirements

- Each route objective matches its dedicated renderer.
- Checkpoints validate route-specific concept.
- Existing storage key `chlyt_sim_assessment_v2` remains compatible.
- Existing positive/negative assessment tests still pass.

## Architecture

Keep manifest-driven assessment. Extend checkpoint metadata only if needed:

```js
{
  id,
  type,
  conceptKey,
  expectedRendererId,
  evaluate(state) {}
}
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `js/sim-route-manifest.js` |
| Modify | `js/sim-assessment.js` if evaluator needs renderer/behavior metadata |
| Modify | `tests/simulation-browser.spec.js` |
| Modify | `tools/smoke_simulation_manifest.py` |

## Implementation Steps

1. Audit all 58 objectives against renderer ids.
2. Add/adjust checkpoint criteria for concept-specific outcomes.
3. Keep old state keys where tests depend on them.
4. Add manifest smoke rule: every route checkpoint references expected renderer/behavior where relevant.
5. Add browser assessment cases across Ch1/Ch2/Ch3 beyond existing 3 positives.

## Todo List

- [x] Update manifest objectives/checkpoints.
- [x] Add concept keys.
- [x] Add manifest smoke assertions.
- [x] Add representative positive/negative browser cases.

## Success Criteria

- `smoke_simulation_manifest.py` passes with renderer contract awareness.
- Assessment not pre-completed for every route.
- Positive paths pass for at least 2 routes per chapter.

## Verify Gate

```powershell
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2
python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58 --require-assessment-links
npm run test:sim:browser -- --grep "@assessment"
```

## Risk Assessment

- Risk: changing checkpoints invalidates old progress. Mitigation: keep storage schema and completed ids stable unless conceptually wrong; document any migration.

## Security Considerations

Validate malformed localStorage still normalized.

## Next Steps

Integrate full release gates.


