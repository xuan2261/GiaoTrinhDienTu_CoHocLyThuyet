# Phase 04 - Ch3 Dynamics Route Polish

## Context Links

- `js/sims/ch3/*.js`
- `js/sim-professional-lab.js`

## Overview

Priority: High  
Status: Completed  
Goal: polish 18 Ch3 routes with dynamics-specific diagrams, energy/residual/collision visuals, and richer direct manipulation.

## Requirements

- Keep all Ch3 animated route controls valid.
- Add meaningful route-owned handles where current single scalar drag is weak.
- Stabilize collision/energy visuals.

## Related Code Files

- Modify: `js/sims/ch3/ch3-newton-laws-renderers.js`
- Modify: `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js`
- Modify: `js/sims/ch3/ch3-theorems-renderers.js`
- Modify: `js/sims/ch3/ch3-collision-exercises-renderers.js`
- Modify: `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js`
- Modify: `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js`
- Modify if needed: `js/sim-professional-lab.js`

## Implementation Steps

1. Newton/D'Alembert routes: force pairs, vector-angle cues, live graphs.
2. Spring/ODE routes: spring chain, trajectory, energy display.
3. Theorem routes: multi-mass CM, impulse/momentum bars, angular momentum orbit, energy bars.
4. Collision/checker routes: arena, before/after ghost, residual bars, richer handles.

## Todo List

- [x] Polish all Ch3 renderer groups.
- [x] Add/adjust route-owned handles for weak direct manipulation routes.
- [x] Run Ch3 direct-drag and animation tests.


## Success Criteria

- 18/18 Ch3 routes pass browser/visual/interaction QA.

## Risk Assessment

- Collision and animated routes can drift if tick updates state after direct drag. Mitigation: pause-on-drag already exists; keep dt bounded.

## Security Considerations

- No storage schema changes.

## Next Steps

Proceed to full validation and docs.
