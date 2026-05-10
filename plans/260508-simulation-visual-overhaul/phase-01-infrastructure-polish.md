---
phase: 1
title: "Infrastructure Polish"
status: completed
priority: P1
effort: "6h"
dependencies: []
---

# Phase 1: Infrastructure Polish

## Overview
Upgrade the core rendering primitives and visual helpers to support high-quality, realistic visuals across all simulations.

## Requirements
- Support for rounded corners, gradients, and shadows in standard primitives.
- New "Realistic" versions of bodies, beams, and grounds.
- Enhanced arrow system with dynamic width and glow.
- Material-like textures (metal, wood, concrete) using canvas patterns or gradients.

## Architecture
- **SimRouteRendererPrimitives**: Add `realisticBody`, `realisticBeam`, `realisticGround`, `realisticPoint`.
- **SimVisualHelpers**: Add `createMaterialPattern`, `applyShadow`, `drawSpring`, `drawCable`.
- **Theme integration**: Map the current Navy+Gold theme into a more sophisticated material palette.

## Related Code Files
- Modify: `js/sim-route-renderer-primitives.js`
- Modify: `js/sim-visual-helpers.js`
- Modify: `css/style.css`

## Implementation Steps
1. **Enhanced Primitives**: Update `P.body` to use `ctx.roundRect` and add `drop-shadow` capability.
2. **Material Helpers**: Implement `vis.metalGradient`, `vis.concretePattern` in `SimVisualHelpers`.
3. **Physical Primitives**: Add `P.spring` (dynamic sine wave) and `P.cable` (catenary curve approximation).
4. **Visual Effects Helpers**: Implement `emitCollisionSparks`, `emitEnergyBurst`, and `drawGlassBar` for advanced feedback.
5. **Lighting**: Implement a simple global "light source" offset for all shadows to ensure consistency.

## Success Criteria
- [x] `P.body` supports configurable `radius` and `shadow`.
- [x] New `P.spring` correctly animates based on state.
- [x] New `emitCollisionSparks` and `emitEnergyBurst` integrated into visual infrastructure.
- [x] `drawGlassBar` provides professional glassmorphism state visualization.
- [x] Visual audit passes with new structural marks for realistic components.

## Risk Assessment
- **Canvas Context Bloat**: Too many `save()`/`restore()` calls might impact FPS. Mitigation: Group shadow applications.
- **Old Browser Support**: `roundRect` might not be available in very old browsers. Mitigation: Provide manual arc-based fallback.
