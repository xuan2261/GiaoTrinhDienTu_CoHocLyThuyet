# Phase 08 - Ch3 Fundamentals Differential Renderers

## Context Links

- `js/sims/ch3/ch3-fundamentals-differential-scenes.js`
- Routes: `ch3-1-2`, `ch3-1-3`, `ch3-2-1`, `ch3-2-2`, `ch3-2-3`, `ch3-2-5`, `ch3-3-1`, `ch3-3-2`, `ch3-4-1`, `ch3-4-2`

## Overview

Priority: P0. Status: Complete. Replace the largest duplicate group: Ch3 dynamics fundamentals currently share the same controls/readouts and generic dynamics renderer.

## Requirements

- 10 dedicated renderer functions.
- Each dynamics law route has distinct visual model.
- ODE and direct/inverse dynamics routes differ structurally and behaviorally.

## Architecture

Create:

```text
js/sims/ch3/ch3-dynamics-law-renderers.js
js/sims/ch3/ch3-differential-renderers.js
js/sims/ch3/ch3-forward-inverse-renderers.js
js/sims/ch3/ch3-fundamentals-differential-behaviors.js
```

## Related Code Files

| Action | File |
|---|---|
| Create | Ch3 fundamentals renderer/behavior modules |
| Modify | `js/sims/ch3/ch3-fundamentals-differential-scenes.js` |
| Modify | tests |

## Implementation Steps

1. Implement force-motion resultant renderer.
2. Implement inertial/non-inertial frame comparison renderer.
3. Implement inertia law renderer.
4. Implement Newton second law renderer.
5. Implement action/reaction pair renderer.
6. Implement dynamic FBD renderer.
7. Implement particle ODE integrator renderer.
8. Implement coupled system ODE renderer.
9. Implement forward dynamics solver renderer.
10. Implement inverse dynamics solver renderer.
11. Add tests for mass/force acceleration, frame toggle, action/reaction equality, ODE curve shift.

## Todo List

- [x] Implement 6 dynamics law renderers.
- [x] Implement 2 ODE renderers.
- [x] Implement 2 solver renderers.
- [x] Add concept-specific Ch3 tests.

## Success Criteria

- 10/10 routes pass strict renderer contract.
- No Ch3 fundamentals route shares `controls: force,mass` as its only pedagogical identity.
- Browser masked identity unique.

## Verify Gate

```powershell
python tools\smoke_simulation_renderer_contract.py --strict --routes ch3-1 ch3-2 ch3-3 ch3-4
npm run test:sim:renderer-contract -- --grep "ch3-1-|ch3-2-|ch3-3-|ch3-4-"
npm run test:sim:browser -- --grep "ch3-1-|ch3-2-|ch3-3-|ch3-4-|@direct-drag"
```

## Risk Assessment

- Risk: dynamics laws are abstract and can look similar. Mitigation: each law gets unique mechanical setup and structural marker.

## Security Considerations

No new storage.

## Next Steps

Migrate Ch3 theorem/collision/solver routes.


