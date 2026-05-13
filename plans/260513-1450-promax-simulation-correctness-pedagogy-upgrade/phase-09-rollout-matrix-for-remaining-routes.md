# Phase 09 Rollout Matrix For Remaining Routes

## Context Links

- [Phase 01](./phase-01-baseline-promax-audit-matrix.md)
- [Phase 04](./phase-04-pilot-ch1-statics-routes.md)
- [Phase 05](./phase-05-pilot-ch2-kinematics-routes.md)
- [Phase 06](./phase-06-pilot-ch3-dynamics-routes.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Goal | Decide safe rollout strategy after pilot evidence |
| Routes | Remaining 52 routes |

## Key Insights

- Do not auto-upgrade 58 routes blindly.
- Rollout should group by invariant family, not chapter only.
- This phase may produce a follow-up implementation plan.

## Requirements

### Functional

- Update 58-route matrix with:
  - invariant family.
  - diagnostic type.
  - challenge type.
  - formula/readout upgrade needed.
  - risk level.
  - target phase group.
- Define rollout groups:
  - Statics vector/moment.
  - Supports/reactions.
  - Friction/centroid.
  - Particle graphs.
  - Rotation/transmission.
  - Relative/plane motion.
  - Newton/D'Alembert.
  - ODE/spring.
  - Theorems/collision.
  - Solver/checker routes.
- Recommend next plan or continue with new phases.

### Non-Functional

- No mass code changes in this phase.
- Must include test expectations per group.

## Architecture

```text
Pilot evidence
  -> route family taxonomy
  -> rollout matrix
  -> effort/risk estimate
  -> follow-up plan or phase extension
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `reports/promax-baseline-matrix.md` |
| Create | `reports/promax-rollout-matrix.md` |
| Read | `js/sim-route-manifest.js` |
| Read | `js/sims/ch*/**/*.js` |
| Optional create | follow-up plan under `plans/` |

## Implementation Steps

1. Compare pilot before/after results.
2. Extract reusable patterns:
   - invariant specs.
   - diagnostic overlays.
   - formula readout templates.
   - challenge mode prompts.
3. Classify remaining 52 routes.
4. Estimate effort and risk per group.
5. Decide:
   - continue current plan with added phases.
   - or create follow-up rollout plan.
6. Write rollout matrix and recommendation.

## Todo List

- [ ] Update baseline matrix.
- [ ] Create rollout family taxonomy.
- [ ] Add test plan per family.
- [ ] Estimate effort/risk.
- [ ] Recommend next execution path.

## Verification / Tests

```powershell
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct
npm run test:sim:unit
npm run test:sim:browser
npm run test:sim:visual-quality
```

Report validation:

- 58/58 routes present.
- 52 non-pilot routes classified.
- Every group has invariant strategy and test gate.
- No route marked “promax done” without evidence.

## Success Criteria

- Rollout matrix exists and is actionable.
- Remaining routes have grouped implementation strategy.
- User can approve next rollout with clear cost/risk.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Matrix becomes wish list | Require test gate per route family |
| Rollout too large | Recommend follow-up plan chunks |
| Pilot pattern not reusable | Mark exceptions explicitly |

## Security Considerations

- Docs/report only.

## Next Steps

- Phase 10 finalizes docs and handoff for implementation/release.

## Unresolved Questions

- Whether user wants immediate 52-route rollout after pilot. Not needed to complete this plan.
