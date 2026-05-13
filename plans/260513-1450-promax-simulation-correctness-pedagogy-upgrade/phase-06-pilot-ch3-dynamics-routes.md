# Phase 06 Pilot Ch3 Dynamics Routes

## Context Links

- [Phase 02](./phase-02-physics-invariant-manifest-and-evaluators.md)
- [Phase 05](./phase-05-pilot-ch2-kinematics-routes.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Goal | Upgrade Ch3 pilot routes for ODE/energy/collision correctness |
| Routes | `ch3-3-1`, `ch3-6-2` |

## Key Insights

- `ch3-3-1` tests numerical integration and energy consistency.
- `ch3-6-2` tests collision impulse, momentum, restitution.
- These are highest-risk correctness routes.

## Requirements

### Functional

- `ch3-3-1`:
  - Use RK4 or exact oscillator for spring route.
  - Show `T`, `V`, `E`, drift.
  - Diagnostic energy band.
  - Live formula `x'' + k/m x = 0`.
- `ch3-6-2`:
  - Show pre/post velocity vectors.
  - Show momentum before/after.
  - Show restitution relation.
  - Diagnostic residual for momentum and `e`.

### Non-Functional

- Deterministic reset.
- Animation pause for precise reading.
- Respect reduced motion.
- No excessive trail/motion.

## Architecture

```text
SimPhysicsDynamics
  -> ODE / collision helper
  -> invariant evaluator
  -> route behavior state
  -> renderer diagnostics
  -> readout/formula/challenge
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js` |
| Modify | `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js` |
| Modify | `js/sims/ch3/ch3-collision-exercises-renderers.js` |
| Modify | `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js` |
| Modify | `js/sims/ch3/ch3-dynamics-all-18-scenes.js` |
| Modify/create | `tests/promax-pilot-ch3.spec.js` |

## Implementation Steps

1. Audit spring route current integration and readouts.
2. Decide exact oscillator vs RK4 route model.
3. Add energy drift invariant and readout.
4. Add diagnostic energy band overlay.
5. Audit collision route current pre/post state.
6. Add momentum/restitution invariant.
7. Add visual residual badges.
8. Add tests for edge cases:
   - zero velocity.
   - equal masses.
   - `e=0`, `e=1`.
   - pause/resume.

## Todo List

- [ ] Upgrade spring invariant/readout.
- [ ] Upgrade spring diagnostics.
- [ ] Upgrade collision invariant/readout.
- [ ] Upgrade collision diagnostics.
- [ ] Add dynamic edge-case tests.
- [ ] Run full pilot gate.

## Verification / Tests

```powershell
node tests\simulation-invariants.test.js --route ch3-3-1
node tests\simulation-invariants.test.js --route ch3-6-2
npm run test:sim:unit
playwright test tests\promax-pilot-ch3.spec.js
playwright test tests\simulation-browser.spec.js --grep "ch3-3-1|ch3-6-2|animation|play-pause|reset"
npm run test:sim:visual-quality
python tools\smoke_simulation_runtime.py --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
python tools\audit_simulation_quality.py --all --max-js-lines 220
```

Manual checks:

- `ch3-3-1`: energy drift is understandable, not hidden.
- `ch3-6-2`: momentum signs preserved, no zero-value display loss.
- Animation remains readable and not distracting.

## Success Criteria

- Both Ch3 pilot routes pass invariant tests and browser tests.
- Edge cases for zero/equality are locked.
- No release gate regression.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Energy drift expected under damping/forcing | Spec route mode explicitly |
| Collision sign bugs | Test signed momentum and zero values |
| Animation flakes | Use deterministic pause/read assertions |

## Security Considerations

- No storage/network.

## Next Steps

- Phase 07 adds learner challenge mode using pilot invariants.

## Unresolved Questions

- None.
