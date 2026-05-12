# Phase 03: Particle Rotation And Transmission Polish

## Context Links

- [Phase 02](./phase-02-decuong-interaction-grammar-for-ch2.md)
- `js/sims/ch2/ch2-particle-renderers.js`
- `js/sims/ch2/ch2-trajectory-graph-renderers.js`
- `js/sims/ch2/ch2-rotation-gear-renderers.js`
- `js/sims/ch2/ch2-rotation-transmission-renderers.js`

## Overview

Priority: P1. Status: Pending. Polish Ch2 particle, graph, rotation, and transmission routes.

## Key Insights

- These routes need obvious visual connection between motion, vectors, and readouts.
- Graph routes should feel like dragging a DeCuong-style cursor, not reading static chart art.

## Requirements

- Functional: particle routes show position, velocity, acceleration, tangent/normal relation.
- Functional: graph cursor syncs with x/v/a readouts.
- Functional: rotation/transmission show radius/omega/speed relation.
- Non-functional: animation stable and no mobile overflow.

## Architecture

Use route-specific renderer functions; keep shared primitives only for arrows/grid/labels. Derived values stay in behavior or kinematics helpers.

## Related Code Files

- Modify: `js/sims/ch2/ch2-kinematics-scenes.js`
- Modify: `js/sims/ch2/ch2-particle-renderers.js`
- Modify: `js/sims/ch2/ch2-trajectory-graph-renderers.js`
- Modify: `js/sims/ch2/ch2-rotation-gear-renderers.js`
- Modify: `js/sims/ch2/ch2-rotation-transmission-renderers.js`
- Modify: `js/sims/ch2/ch2-kinematics-behaviors-a.js`
- Modify if formula needed: `js/sim-physics-kinematics.js`

## Implementation Steps

1. Polish `ch2-1-1`: trajectory, velocity, acceleration, draggable point.
2. Polish `ch2-1-2`: graph cursor, synchronized x/v/a readouts.
3. Polish `ch2-1-3`: natural coordinates, tangent/normal/radius visualization.
4. Polish `ch2-1-4`: motion presets with visible state.
5. Polish `ch2-2-2`: fixed-axis rotation with vectors on disk.
6. Polish `ch2-3-2`: gear/belt/pulley ratio interaction.
7. Add semantic browser checks for graph cursor and rotation radius.

## Todo List

- [ ] Particle routes pass semantic readout checks.
- [ ] Graph cursor route passes sync check.
- [ ] Rotation/transmission routes pass control/drag checks.
- [ ] Visual labels readable in dark/light mode.

## Verification / Tests

```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch2-1 ch2-2 ch2-3 --require-routes 6
python tools\smoke_simulation_renderer_contract.py --strict --routes ch2-1 ch2-2 ch2-3 --require-routes 6
npm run test:sim:unit
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch2-1-1|ch2-5-2|@animation|@control-audit"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"
```

## Success Criteria

- First 6 Ch2 routes are visually clear and directly manipulable.
- Graph/time cursor response is visible and readout-backed.
- No route has detached/default coordinate text.

## Risk Assessment

- Risk: graph rendering clutters small screens. Mitigation: use compact axes, move values to readout cards.

## Security Considerations

- No new external chart dependency.
- Keep canvas overlay scoped.

## Next Steps

Proceed to relative/plane motion and pilot reconcile.

## Unresolved Questions

Không có.
