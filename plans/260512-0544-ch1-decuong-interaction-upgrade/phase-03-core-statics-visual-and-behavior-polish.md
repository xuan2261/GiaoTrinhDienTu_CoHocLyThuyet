# Phase 03: Core Statics Visual And Behavior Polish

## Context Links

- [Phase 02](./phase-02-decuong-interaction-grammar-for-ch1.md)
- `js/sims/ch1/ch1-force-law-*`
- `js/sims/ch1/ch1-support-spatial-*`

## Overview

Priority: P1. Status: Completed. Polished core Ch1 routes: force laws, equilibrium, supports, spatial/statics beam routes.

## Key Insights

- These routes carry the first impression of the textbook simulation quality.
- DeCuong parallelogram and beam demos are the target interaction pattern.

## Requirements

- Functional: vectors, parallelograms, support reactions, and moments respond correctly to drag.
- Functional: formulas and readouts correspond to visible geometry.
- Non-functional: no route-specific renderer duplicates another renderer body.

## Architecture

Keep scene data deterministic. Put math in behavior/physics helpers. Keep renderer drawing direct and topic-specific.

## Related Code Files

- Modify: `js/sims/ch1/ch1-force-law-scenes.js`
- Modify: `js/sims/ch1/ch1-force-law-renderers.js`
- Modify: `js/sims/ch1/ch1-force-law-behaviors.js`
- Modify: `js/sims/ch1/ch1-support-spatial-scenes.js`
- Modify: `js/sims/ch1/ch1-support-renderers.js`
- Modify: `js/sims/ch1/ch1-spatial-renderers.js`
- Modify: `js/sims/ch1/ch1-support-spatial-behaviors.js`
- Modify if formula needed: `js/sim-physics-statics.js`

## Implementation Steps

1. Polish force vector anatomy: visible tail/head, magnitude, angle.
2. Polish moment/couple: line of action, arm, sign, moment arc.
3. Polish force system reducer: resultant and equivalent moment in one visual.
4. Polish equilibrium/parallelogram/FBD routes against DeCuong reference.
5. Polish support routes: normal, cable, hinge, roller, fixed, two-force member.
6. Polish spatial routes with compact pseudo-3D axes and readout clarity.
7. Update route-specific tests for semantic labels.

## Todo List

- [x] Force-law routes pass semantic drag/readout checks.
- [x] Support routes pass reaction direction checks.
- [x] Spatial routes avoid clutter and overflow.
- [x] Renderer contract remains unique.

## Verification / Tests

```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-1 ch1-2 ch1-3 ch1-4 --require-routes 17
python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-1 ch1-2 ch1-3 ch1-4 --require-routes 17
npm run test:sim:unit
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch1-2-3|ch1-3-1|@direct-drag"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@renderer-contract|@scene-identity"
```

## Success Criteria

- Core 17 Ch1 routes have clear DeCuong-style interaction.
- No fallback scene/renderer/behavior text.
- Semantic representative checks pass for `ch1-2-3` and `ch1-3-1`.

## Risk Assessment

- Risk: visual changes reduce physics accuracy. Mitigation: readout formulas checked after every drag.
- Risk: too much canvas text. Mitigation: offload detailed values to readout cards.

## Security Considerations

- No external assets.
- Keep DOM overlay scoped under `.sim-lab`.

## Next Steps

Proceed to applied routes and pilot reconcile.

## Unresolved Questions

Không có.
