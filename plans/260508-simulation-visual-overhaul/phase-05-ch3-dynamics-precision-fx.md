---
phase: 5
title: "Chapter 3 (Dynamics) Precision and FX"
status: completed
priority: P2
effort: "8h"
dependencies: [1, 2, 4]
---

# Phase 5: Chapter 3 (Dynamics) Precision and FX

## Overview
Implement realistic collision effects, particle systems, and high-precision physics solving for Chapter 3 dynamics.

## Requirements
- Particle FX for collisions and contact points.
- Precision sub-stepping for fast dynamic events.
- Realistic rendering of springs, masses, and forces.

## Architecture
- **SimAnimationEngine**: Implement the particle pool and emitter logic.
- **Physics Engine**: Add a `subStep` option to the RK4/Euler solvers.
- **Route Renderers**: Update `js/sims/ch3/*.js`.

## Related Code Files
- Modify: `js/sims/ch3/ch3-collision-exercises-renderers.js`
- Modify: `js/sims/ch3/ch3-newton-laws-renderers.js`
- Modify: `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js`

## Implementation Steps
1. **Collision Particles**: Add `vis.emitCollisionSparks` to trigger when spheres/blocks hit each other, integrated into Chapter 3 collision behaviors.
2. **Spring Polish**: Use the new `P.spring` primitive with realistic metal texture and shading.
3. **Precision Solving**: Implement sub-stepping in `ch3-3-2` and `ch3-6-2` to ensure conservation of energy/momentum even at high speeds.
4. **Energy Visualization**: Use glowing fill bars or `vis.drawGlassBar` heat maps to visualize kinetic vs potential energy transformations, specifically upgraded `ch3-5-4`.

## Success Criteria
- [x] Collisions in `ch3-6-2` feel impactful with visual feedback.
- [x] Sparks integrated into Ch3 collision behaviors.
- [x] `ch3-5-4` features professional glassmorphism energy visualization.
- [x] Springs look like actual metal components, not just zig-zag lines.
- [x] No "tunneling" (objects passing through each other) in fast dynamics.

## Risk Assessment
- **Math Overflow**: High precision solving might hit floating point limits or infinite loops. Mitigation: Guard sub-stepping with a maximum iteration count (max 10 per frame).
- **Over-Animation**: Too many particles can obscure the physical model. Mitigation: Keep particle lifespan short (< 0.5s).
