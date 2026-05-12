# Phase 04: Applied Statics And Pilot Reconcile

## Context Links

- [Phase 03](./phase-03-core-statics-visual-and-behavior-polish.md)
- `js/sims/ch1/ch1-friction-centroid-solver-*`
- `js/routes/pilot-ch1-parallelogram.js`

## Overview

Priority: P1. Status: Completed. Polished applied Ch1 routes and settled what to do with Ch1 legacy/pilot files.

## Key Insights

- Friction/centroid/solver routes need clearer affordances than generic coordinate drag.
- Pilot parallelogram should inform UX but not create active duplicate route.

## Requirements

- Functional: friction threshold, centroid, and solver interactions show cause/effect.
- Functional: legacy/pilot reconciliation is explicit: adapt, archive, or remove from release package.
- Non-functional: no runtime route duplication.

## Architecture

Active runtime remains `js/sims/ch1/*`. Legacy/pilot is reference unless promoted through registry with tests.

## Related Code Files

- Modify: `js/sims/ch1/ch1-friction-centroid-solver-scenes.js`
- Modify: `js/sims/ch1/ch1-friction-renderers.js`
- Modify: `js/sims/ch1/ch1-centroid-solver-renderers.js`
- Modify: `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js`
- Modify: `js/sims/ch1/ch1-solver-exercises-scenes.js`
- Modify: `js/sims/ch1/ch1-solver-exercises-renderers.js`
- Modify: `js/sims/ch1/ch1-solver-exercises-behaviors.js`
- Reconcile: `js/routes/pilot-ch1-parallelogram.js`
- Optional docs: `docs/codebase-summary.md`, `docs/system-architecture.md`

## Implementation Steps

1. Polish friction contact, friction type tabs, cone/incline, self-locking routes.
2. Polish centroid routes with visible composite areas and `G` marker drag/readout.
3. Polish solver/checker routes to use DeCuong-style immediate feedback, not large assessment panel.
4. Compare active `ch1-2-3` against pilot parallelogram; import only useful interaction cues.
5. Decide pilot fate: keep in `js/routes` as reference, move to `js/deprecated`, or remove from package.
6. Document decision in changelog/architecture if implementation changes runtime package.

## Todo List

- [x] Applied statics routes pass direct-drag/readout checks.
- [x] Pilot parallelogram decision recorded.
- [x] No active duplicate route IDs.
- [x] Docs reflect active runtime truth.

## Verification / Tests

```powershell
python tools\smoke_simulation_manifest.py --routes ch1-5 ch1-6 ch1-7 --require-routes 8 --require-objectives --require-direct
python tools\audit_simulation_quality.py --all --routes ch1-5 ch1-6 ch1-7 --max-js-lines 220
npm run test:sim:unit
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch1-5-3|@touch|@control-audit"
npx playwright test tests/mass-conversion-audit.spec.js --grep "ch1"
```

## Success Criteria

- Applied 8 Ch1 routes are touch-friendly and readable.
- Legacy/pilot Ch1 is no longer ambiguous.
- No route duplication or dead active script load.

## Risk Assessment

- Risk: pilot removal may conflict with user expectation. Mitigation: keep decision in plan/report and only remove during implementation with clear evidence.
- Risk: solver routes become too complex. Mitigation: KISS, immediate readout over full assessment workflow.

## Security Considerations

- No user input persisted beyond existing local storage mechanisms.
- Avoid `innerHTML` for checker feedback.

## Next Steps

Proceed to Ch1 release QA and docs.

## Unresolved Questions

Không có.
