# Phase 06 - Ch2 Particle Rotation Transmission Renderers

## Context Links

- `js/sims/ch2/ch2-particle-rotation-transmission-scenes.js`
- Routes: `ch2-1-1`, `ch2-1-2`, `ch2-1-3`, `ch2-1-4`, `ch2-2-2`, `ch2-3-2`

## Overview

Priority: P0. Status: Complete. Create distinct renderers for particle motion, coordinate graphs, natural frame, motion gallery, rotation, and transmission.

## Requirements

- 6 dedicated renderer functions.
- Particle/vector/graph/natural-coordinate visuals must be structurally different.
- Rotation and transmission must not share same disk renderer.

## Architecture

Create:

```text
js/sims/ch2/ch2-particle-renderers.js
js/sims/ch2/ch2-rotation-transmission-renderers.js
js/sims/ch2/ch2-particle-rotation-transmission-behaviors.js
```

## Related Code Files

| Action | File |
|---|---|
| Create | Ch2 particle/rotation renderers and behaviors |
| Modify | `js/sims/ch2/ch2-particle-rotation-transmission-scenes.js` |
| Modify | `index.html` |
| Modify | tests |

## Implementation Steps

1. Implement route-specific path and vector decomposition renderers.
2. Implement Cartesian graph renderer with slope/tangent cues.
3. Implement natural coordinate frame renderer with tau/n/rho.
4. Implement gallery renderer with selectable motion presets.
5. Implement fixed-axis rotation renderer.
6. Implement gear/belt transmission renderer with ratio geometry.
7. Add browser tests for preset switch, graph cursor, omega/radius relation.

## Todo List

- [x] Implement 4 particle renderers.
- [x] Implement rotation renderer.
- [x] Implement transmission renderer.
- [x] Add concept tests.

## Success Criteria

- 6/6 Ch2 routes in group have unique renderer functions.
- Browser structural identity passes with text masked.
- Existing `particle preset redraws` test still passes.

## Verify Gate

```powershell
python tools\smoke_simulation_renderer_contract.py --strict --routes ch2-1-1 ch2-1-2 ch2-1-3 ch2-1-4 ch2-2-2 ch2-3-2
npm run test:sim:renderer-contract -- --grep "ch2-1-|ch2-2-2|ch2-3-2"
npm run test:sim:browser -- --grep "ch2-1-|ch2-2-2|ch2-3-2|@direct-drag"
```

## Risk Assessment

- Risk: graph renderer too text-heavy. Mitigation: hash masked visuals and structural marks such as axes, tangent, normal.

## Security Considerations

No storage changes.

## Next Steps

Migrate Ch2 relative/plane/checker routes.


