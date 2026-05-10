---
phase: 4
title: "Chapter 2 (Kinematics) Animation Fluidity"
status: completed
priority: P2
effort: "6h"
dependencies: [1, 2]
---

# Phase 4: Chapter 2 (Kinematics) Animation Fluidity

## Overview
Enhance the kinematic simulations with smooth path trails, realistic gear/transmission rendering, and fluid velocity/acceleration vectors.

## Requirements
- Dynamic, fading trails for trajectories.
- Realistic rendering for gears, pulleys, and belts (cable primitive).
- Smooth interpolation for time-based graphs.

## Architecture
- **SimAnimationEngine**: Leverage `createTrail` and `drawTrail` more extensively.
- **Route Renderers**: Update `js/sims/ch2/*.js`.
- **Transmission Helpers**: Use `P.cable` for all belt drives.

## Related Code Files
- Modify: `js/sims/ch2/ch2-trajectory-graph-renderers.js`
- Modify: `js/sims/ch2/ch2-rotation-gear-renderers.js`
- Modify: `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js`

## Implementation Steps
1. **Trail Upgrade**: Implement high-quality SVG-like trails that fade out and have variable thickness based on speed.
2. **Gear Polish**: Add `P.realisticWheel` primitive with "teeth" or material shine and radial gradients.
3. **Motion Curves**: Ensure all kinematic curves (v(t), a(t)) are drawn with anti-aliased, glowing lines.
4. **Instant Centers**: Add a "focus ring" or pulsing effect to the Instant Center (IC) point to highlight its importance.
5. **Route-Specific Upgrade**: Systematically upgrade `ch2-3-2` with professional rendering and realistic gear mechanics.

## Success Criteria
- [x] Trails in `ch2-1-1` and `ch2-5-1` are smooth and non-jagged.
- [x] Belts in `ch2-3-2` have realistic curvature and material look via new `realisticWheel`.
- [x] Animation at high speeds remains visually stable (no flickering).
- [x] `realisticWheel` integrated into primitives with support for spokes and radial gradients.

## Risk Assessment
- **Trail Performance**: Long trails with hundreds of points can lag. Mitigation: Limit trail length and use simplified geometry for far points.
- **Graph Readability**: Glowing lines might blur small numeric labels. Mitigation: Keep text labels on a separate, high-contrast layer.
