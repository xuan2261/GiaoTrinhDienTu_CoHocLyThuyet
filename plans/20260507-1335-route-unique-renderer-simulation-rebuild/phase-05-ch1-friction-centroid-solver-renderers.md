# Phase 05 - Ch1 Friction Centroid Solver Renderers

## Context Links

- `js/sims/ch1/ch1-friction-centroid-solver-scenes.js`
- Routes: `ch1-5-1`, `ch1-5-2`, `ch1-5-3`, `ch1-5-4`, `ch1-6-2`, `ch1-6-3`, `ch1-7-1`, `ch1-7-2`

## Overview

Priority: P0. Status: Complete. Finish Ch1 with strict renderers for friction, centroid, and solver routes.

## Requirements

- 8 dedicated renderer functions.
- Friction routes must not share a generic incline renderer.
- Centroid routes must show different geometry: composite vs hole/subtraction.
- Solver/checker routes must show different workflow boards.

## Architecture

Create:

```text
js/sims/ch1/ch1-friction-renderers.js
js/sims/ch1/ch1-centroid-solver-renderers.js
js/sims/ch1/ch1-friction-centroid-solver-behaviors.js
```

## Related Code Files

| Action | File |
|---|---|
| Create | Ch1 friction/centroid/solver renderer modules |
| Modify | `js/sims/ch1/ch1-friction-centroid-solver-scenes.js` |
| Modify | `tests/simulation-browser.spec.js` |

## Implementation Steps

1. Implement contact decomposition, friction modes, friction cone, self-locking wedge.
2. Implement composite centroid and centroid-with-hole renderers.
3. Implement guided solver and numeric checker renderers.
4. Add browser tests for hold/slip boundary, centroid shift, solver residual.
5. Run full Ch1 strict renderer gate.

## Todo List

- [x] Implement 4 friction renderers.
- [x] Implement 2 centroid renderers.
- [x] Implement 2 solver renderers.
- [x] Add Ch1 full strict tests.

## Success Criteria

- Ch1 25/25 renderer functions unique.
- Ch1 masked canvas identity unique with route text hidden.
- Ch1 assessment still passes representative positive/negative paths.

## Verify Gate

```powershell
python tools\smoke_simulation_renderer_contract.py --strict --routes ch1
npm run test:sim:renderer-contract -- --grep "ch1-"
npm run test:sim:browser -- --grep "ch1-|@assessment|@direct-drag"
```

## Risk Assessment

- Risk: checker routes become generic boards. Mitigation: renderer body hash + route-specific workflow tests.

## Security Considerations

No new user data.

## Next Steps

Migrate Ch2 particle/rotation/transmission routes.


