# Phase 04 Pilot Ch1 Statics Routes

## Context Links

- [Phase 02](./phase-02-physics-invariant-manifest-and-evaluators.md)
- [Phase 03](./phase-03-shared-lab-ux-contract-and-diagnostics.md)
- [Simulation List](../../simulation-list.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Goal | Upgrade Ch1 pilot routes to promax correctness + UX |
| Routes | `ch1-2-3`, `ch1-5-3` |

## Key Insights

- `ch1-2-3` proves vector/resultant formula and direct geometry coupling.
- `ch1-5-3` proves friction threshold and state boundary clarity.
- These routes should become templates for remaining Ch1 rollout.

## Requirements

### Functional

- `ch1-2-3`:
  - Drag `F1`, `F2`.
  - Show parallelogram, resultant, components.
  - Live formula: `R = F1 + F2`, component form.
  - Invariant residual: computed `R` equals graphical diagonal.
- `ch1-5-3`:
  - Drag/slider `alpha`, `mu`.
  - Show friction cone and slip boundary.
  - Live formula: `tan(alpha) <= mu`.
  - Invariant residual: margin `mu - tan(alpha)`.

### Non-Functional

- Do not duplicate formulas in renderer.
- Keep route files under line limit.
- Keep controls Vietnamese.

## Architecture

```text
Ch1 behavior derived model
  -> physics statics helpers
  -> invariant evaluator
  -> readouts
  -> renderer diagnostics
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `js/sims/ch1/ch1-force-law-behaviors.js` or current route behavior file |
| Modify | `js/sims/ch1/ch1-force-law-renderers.js` or current route renderer file |
| Modify | `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js` |
| Modify | `js/sims/ch1/ch1-friction-centroid-solver-renderers.js` |
| Modify | `js/sims/ch1/*-scenes.js` for readout metadata only if needed |
| Modify/create | `tests/simulation-invariants.test.js` |
| Modify/create | `tests/promax-pilot-ch1.spec.js` |

## Implementation Steps

1. Confirm actual file ownership for `ch1-2-3` and `ch1-5-3`.
2. Refactor derived values to use shared statics helpers.
3. Add invariant status updates after slider/drag/reset.
4. Add diagnostic overlay support:
   - components.
   - friction boundary.
   - residual/error display.
5. Improve readouts:
   - values with units.
   - formula substitution.
   - pass/warn/fail status.
6. Add targeted Playwright route tests.
7. Update baseline matrix status.

## Todo List

- [ ] Lock current file ownership.
- [ ] Upgrade `ch1-2-3` invariant/readout/render diagnostics.
- [ ] Upgrade `ch1-5-3` invariant/readout/render diagnostics.
- [ ] Add unit invariant cases.
- [ ] Add browser direct-drag cases.
- [ ] Run Ch1 targeted and full gates.

## Verification / Tests

```powershell
node tests\simulation-invariants.test.js --route ch1-2-3
node tests\simulation-invariants.test.js --route ch1-5-3
npm run test:sim:unit
playwright test tests\promax-pilot-ch1.spec.js
playwright test tests\simulation-interaction-engine.spec.js --grep "ch1-2-3|ch1-5-3|direct-drag"
npm run test:sim:visual-quality -- --grep "@visual-all|@theme-all"
python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58
python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58
python tools\audit_simulation_quality.py --all --max-js-lines 220
```

Manual checks:

- At `alpha = atan(mu)`, `ch1-5-3` visibly changes boundary state.
- `ch1-2-3` resultant readout equals diagonal within tolerance.
- Dark/light readable, mobile no overflow.

## Success Criteria

- Both Ch1 pilot routes show invariant status and pass semantic tests.
- Drag, slider, readout, formula, diagnostics all use same canonical state.
- No regression in all-route browser/visual gates.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Renderer has hidden formula math | Move math to behavior/evaluator |
| Boundary flicker near equality | Use tolerance band and `warn` state |
| Extra UI text clutters route | Use compact diagnostic toggle |

## Security Considerations

- No new persistence.
- No external assets.

## Next Steps

- Phase 05 applies same pattern to Ch2 kinematics pilot routes.

## Unresolved Questions

- None.
