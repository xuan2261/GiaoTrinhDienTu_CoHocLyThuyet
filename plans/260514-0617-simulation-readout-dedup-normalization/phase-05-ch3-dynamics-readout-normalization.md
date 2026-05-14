# Phase 05 - Ch3 Dynamics Readout Normalization

## Context Links

- [Scout Report](./reports/scout-report.md)
- [Red Team Review](./reports/red-team-review.md)
- `js/sims/ch3/ch3-dynamics-all-18-scenes.js`
- `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js`
- `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js`

## Overview

Priority: P0. Status: Complete. Normalize Ch3 readouts, remove duplicate control echo, and preserve valid conservation/default equalities.

## Key Insights

- Ch3 scenes append `Lực F` control broadly.
- `ch3-7-1` shows both `F` and `Lực F` with the same value.
- Some equal values are intentional teaching points: momentum before/after, equal masses.

## Requirements

- Functional: Remove `F`/`Lực F` duplicate in `ch3-7-1`.
- Functional: Apply Ch3 readout policy to prevent broad control echo.
- Functional: Keep important input parameters when they are part of the learning target, but declare them explicitly.
- Functional: Preserve:
  - `p trước/p sau` in collision routes.
  - `m1/m2` if comparing masses matters.
  - `e` in collision route if learner changes restitution.
- Non-functional: Do not alter hidden Promax invariant metadata.

## Architecture

```text
Ch3 readouts
  Newton routes -> a, v, core state, optional m/F if explicit
  ODE routes -> T, V, x/v/energy where relevant
  theorem routes -> theorem output + necessary parameter
  collision routes -> p before/after, e, signed velocities if needed
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `js/sims/ch3/ch3-dynamics-all-18-scenes.js` |
| Possibly modify | `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js` |
| Modify | `tests/simulation-browser.spec.js` |
| Verify | `tests/phase-09-12-tdd.test.js` |
| Verify | `tests/simulation-invariants.test.js` |

## Implementation Steps

1. Add policy to Ch3 scenes to disable automatic control echo where output readouts are enough.
2. For `ch3-7-1`, keep only one force card:
   - either output `F` or control `Lực F`, not both.
   - prefer Vietnamese label if learner-facing.
3. Review routes with control parameters:
   - `m`, `k`, `e`, `v1`, `v2`, `I`, `J`.
   - keep only if explicitly needed for learning and not already shown in controls.
4. Add allowlist tests for conservation equalities.
5. Confirm Promax pilot hidden data attributes still present.

## Todo List

- [x] Remove `ch3-7-1` force duplicate.
- [x] Add Ch3 readout policy.
- [x] Preserve intentional collision/mass equalities.
- [x] Verify hidden Promax metadata unaffected.

## Verify / Tests

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "Ch3 readout dedup"
node tests/phase-09-12-tdd.test.js
node tests/simulation-invariants.test.js
npx playwright test tests/promax-pilot-shell.spec.js
```

Target assertions:

```text
ch3-7-1:
  no two cards with force value 50N under labels F and Lực F
ch3-6-2/ch3-6-3:
  p trước and p sau remain visible
  equality allowed when conservation holds
```

## Success Criteria

- Ch3 duplicate force echo removed.
- Ch3 readouts remain pedagogically useful.
- Collision/invariant tests still pass.

## Risk Assessment

- Risk: removing too many controls reduces context. Mitigation: explicit route readouts for parameters needed by objective.
- Risk: Promax tests depend on readout keys. Mitigation: run Promax shell/invariant tests.

## Security Considerations

- No new storage.
- No HTML injection.

## Next Steps

- Phase 06 adds/locks automated regression gates.
