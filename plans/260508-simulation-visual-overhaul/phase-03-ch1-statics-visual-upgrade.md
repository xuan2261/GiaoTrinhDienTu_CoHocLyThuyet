---
phase: 3
title: "Chapter 1 (Statics) Visual Upgrade"
status: completed
priority: P2
effort: "8h"
dependencies: [1, 2]
---

# Phase 3: Chapter 1 (Statics) Visual Upgrade

## Overview
Apply the new realistic primitives and interaction engine to all 22 routes in Chapter 1.

## Requirements
- Replace all flat `P.body`, `P.ground`, and `P.arrow` with their realistic counterparts.
- Implement material textures for supports (steel pins, concrete walls).
- Add "Equilibrium Glow" when a system is correctly balanced in exercises.

## Architecture
- **Route Renderers**: Systematically update `js/sims/ch1/*.js` files.
- **Theme Mapping**: Assign materials: Beams -> Brushed Steel, Grounds -> Concrete, Forces -> Glowing Neon.

## Related Code Files
- Modify: `js/sims/ch1/ch1-force-law-renderers.js`
- Modify: `js/sims/ch1/ch1-support-renderers.js`
- Modify: `js/sims/ch1/ch1-solver-exercises-renderers.js`
- (And other ch1 renderers)

## Implementation Steps
1. **Support Upgrade**: Redraw all constraints (gối cố định, gối di động, ngàm) with 3D-like depth and material shading.
2. **Force Visualization**: Update `P.arrow` to use glowing tips and dynamic stroke width based on magnitude.
3. **Exercise Feedback**: Add a particle "burst" or "glow" effect in `ch1-2-1` and `ch1-7-1` when the user solves a statics step.
4. **Environment**: Add subtle shadows under all bodies to ground them on the `P.ground`.

## Success Criteria
- [x] All 22 routes in Ch1 feature realistic rendering.
- [x] Shadows are consistent across different zoom/resize levels.
- [x] Interaction highlights work on all Ch1 handles.

## Risk Assessment
- **Refactor Fatigue**: Updating 22 routes manually is prone to errors. Mitigation: Use a shared `renderStaticComponent` helper.
- **Visual Overload**: Too many glows might distract. Mitigation: Keep primary physics vectors sharp and clean.
