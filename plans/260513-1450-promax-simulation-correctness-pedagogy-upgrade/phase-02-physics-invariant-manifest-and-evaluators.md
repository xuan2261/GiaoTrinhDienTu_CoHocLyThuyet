# Phase 02 Physics Invariant Manifest And Evaluators

## Context Links

- [Physics Research](./research/researcher-01-physics-correctness-report.md)
- [Phase 01](./phase-01-baseline-promax-audit-matrix.md)
- [Code Standards](../../docs/code-standards.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Goal | Add shared physics invariant contract before pilot route polish |
| Routes | 6 pilot first, manifest shape ready for 58 |

## Key Insights

- Correctness must be tested outside renderers.
- Invariant evaluators should reuse existing physics helpers.
- Keep files small under 220 JS lines.

## Requirements

### Functional

- Add a route invariant manifest for pilot routes.
- Add evaluator helpers for statics, kinematics, dynamics.
- Add test utility to run invariant against route state/derived model.
- Return numeric residuals and pass/fail with tolerance.

### Non-Functional

- No UI dependency.
- No DOM/browser needed for pure invariant unit tests.
- Deterministic output.

## Architecture

```text
js/sim-route-invariants.js
  -> route id maps to invariant spec

js/sim-invariant-evaluators.js
  -> statics / kinematics / dynamics residual evaluators

tests/simulation-invariants.test.js
  -> loads helpers
  -> checks pilot route invariant contracts
```

## Related Code Files

| Action | File |
|---|---|
| Create | `js/sim-route-invariants.js` |
| Create | `js/sim-invariant-evaluators.js` |
| Modify | `index.html` script order if browser access needed |
| Read | `js/sim-physics-statics.js` |
| Read | `js/sim-physics-kinematics.js` |
| Read | `js/sim-physics-dynamics.js` |
| Create | `tests/simulation-invariants.test.js` |
| Optional modify | `package.json` add invariant test into `test:sim:unit` |

## Implementation Steps

1. Define invariant spec schema:
   - `routeId`
   - `domain`
   - `invariants[]`
   - `inputs`
   - `tolerance`
   - `readoutKeys`
2. Implement pure evaluator helpers:
   - `forceResultant`.
   - `frictionConeMargin`.
   - `kinematicDerivativeChain`.
   - `instantCenterVelocity`.
   - `springEnergyDrift`.
   - `collisionMomentumRestitution`.
3. Add pilot specs:
   - `ch1-2-3`: vector resultant.
   - `ch1-5-3`: `tan(alpha) <= mu` slip boundary.
   - `ch2-1-2`: `v=dx/dt`, `a=dv/dt`.
   - `ch2-5-2`: `v = omega x r_IC`.
   - `ch3-3-1`: spring energy and ODE residual.
   - `ch3-6-2`: momentum + restitution residual.
4. Add unit tests with representative states.
5. Add failure messages that say route id, invariant id, residual.

## Todo List

- [ ] Define invariant manifest schema.
- [ ] Implement evaluator helpers.
- [ ] Add 6 pilot specs.
- [ ] Add unit tests.
- [ ] Wire into unit gate if stable.
- [ ] Document tolerance choices.

## Verification / Tests

```powershell
node --check js\sim-route-invariants.js
node --check js\sim-invariant-evaluators.js
node tests\simulation-invariants.test.js
npm run test:sim:unit
python tools\audit_simulation_quality.py --all --max-js-lines 220
python tools\smoke_simulation_runtime.py --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
```

Expected targeted assertions:

- `ch1-2-3` resultant residual near zero.
- `ch1-5-3` state flips at friction boundary.
- `ch2-1-2` derivative chain consistent.
- `ch2-5-2` velocity perpendicular to radius from IC.
- `ch3-3-1` RK4 energy drift within tolerance for undamped route.
- `ch3-6-2` momentum before/after conserved within tolerance.

## Success Criteria

- Invariant manifest loads in browser and Node tests.
- 6 pilot specs pass unit tests.
- No route renderer code touched.
- File size audit passes.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Manifest duplicates formulas | Call physics helpers where possible |
| Tolerance too strict | Start with documented numeric tolerances |
| Browser load order breaks | Keep manifest after physics helpers if loaded in browser |

## Security Considerations

- No user input or network.
- No persistence change.

## Next Steps

- Phase 03 exposes UX contract hooks to show invariant/readout state.

## Unresolved Questions

- None.
