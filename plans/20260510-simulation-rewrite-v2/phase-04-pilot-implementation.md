---
phase: 4
title: "Pilot Implementation"
status: completed
priority: P1
effort: "2d"
dependencies: [1, 2, 3]
---

# Phase 04: Pilot Implementation

## Overview
Validate the new architecture by completely rewriting 3 pilot routes representing the core mechanics pillars: Statics, Kinematics, and Dynamics.

## Requirements
- Functional: 1 Statics scene (e.g., forces equilibrium), 1 Kinematics scene (e.g., projectile motion), 1 Dynamics scene (e.g., spring-mass system with chart).
- Non-functional: Code must be minimal (<150 LOC per route), utilizing the newly built SVG/DOM bridge, UI generator, and Chart wrapper.

## Architecture
Each route file will instantiate `SimulationEngine`, define SVG visual assets, define Matter.js bodies, map them, build the UI panel, and start the engine.

## Related Code Files
- Create: `js/routes/pilot-ch1-parallelogram.js`
- Create: `js/routes/pilot-ch2-particle-motion.js`
- Create: `js/routes/pilot-ch3-collision-solver.js`

## Implementation Steps
1. Identify 3 specific route IDs from the legacy routes to port.
2. **Statics**: Build a force equilibrium demo. Use UI sliders to change force magnitudes. SVG arrows represent force vectors. Matter.js ensures static equilibrium constraints.
3. **Kinematics**: Build a projectile motion demo. Use Matter.js to simulate gravity on a ball. SVG renders the ball and a path trace.
4. **Dynamics**: Build a spring-mass oscillator. Use Matter.js springs and bodies. Add `SimChart` to plot Position (y) vs. Time (t).
5. Hook these 3 routes into `simulations.js` (the route dispatcher) to load the V2 versions when accessed.

## Success Criteria
- [x] 3 pilot simulations are fully interactive, stable, and visually pristine.
- [x] Realtime charting works smoothly on the Dynamics pilot.
- [x] The total code for these pilots is significantly smaller and more readable than the V1 architecture.


## Risk Assessment
- Risk: Edge cases specific to textbook diagrams (e.g., drawing precise angles, dimensions).
- Mitigation: Rely on SVG's native drawing capabilities to create precise dimension lines or text overlays anchored to DOM elements.
