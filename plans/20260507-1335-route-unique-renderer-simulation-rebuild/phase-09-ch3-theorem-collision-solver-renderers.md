# Phase 09 - Ch3 Theorem Collision Solver Renderers

## Context Links

- `js/sims/ch3/ch3-theorem-collision-solver-scenes.js`
- Routes: `ch3-5-1`, `ch3-5-2`, `ch3-5-3`, `ch3-5-4`, `ch3-6-2`, `ch3-6-3`, `ch3-7-1`, `ch3-7-2`

## Overview

Priority: P0. Status: Complete. Finish Ch3 with theorem, collision, and numeric/guided solver renderers.

## Requirements

- 8 dedicated renderer functions.
- Theorem routes must not share theorem-board renderer.
- Collision routes differ by restitution experiment vs solver workflow.
- Solver routes differ by theorem selection vs numeric validation.

## Architecture

Create:

```text
js/sims/ch3/ch3-theorem-renderers.js
js/sims/ch3/ch3-collision-renderers.js
js/sims/ch3/ch3-dynamics-checker-renderers.js
js/sims/ch3/ch3-theorem-collision-solver-behaviors.js
```

## Related Code Files

| Action | File |
|---|---|
| Create | Ch3 theorem/collision/checker modules |
| Modify | `js/sims/ch3/ch3-theorem-collision-solver-scenes.js` |
| Modify | tests |

## Implementation Steps

1. Implement center-of-mass theorem renderer.
2. Implement momentum/impulse renderer.
3. Implement angular momentum renderer.
4. Implement work-energy renderer.
5. Implement collision restitution renderer.
6. Implement collision solver renderer.
7. Implement theorem selector renderer.
8. Implement dynamics numeric checker renderer.
9. Add browser tests for restitution, energy/work, angular momentum radius, theorem selection.

## Todo List

- [x] Implement 4 theorem renderers.
- [x] Implement 2 collision renderers.
- [x] Implement 2 checker renderers.
- [x] Add Ch3 full strict tests.

## Success Criteria

- Ch3 18/18 renderer functions unique.
- Full 58/58 strict renderer gate passes.
- Collision positive assessment still saves progress.

## Verify Gate

```powershell
python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58
npm run test:sim:renderer-contract -- --grep "ch3-5-|ch3-6-|ch3-7-"
npm run test:sim:browser -- --grep "ch3-5-|ch3-6-|ch3-7-|collision|@assessment"
```

## Risk Assessment

- Risk: theorem routes become static diagrams. Mitigation: at least one route-specific interaction per renderer affects derived value.

## Security Considerations

No storage schema changes beyond existing assessment progress.

## Next Steps

Sync assessment and pedagogy manifest.


