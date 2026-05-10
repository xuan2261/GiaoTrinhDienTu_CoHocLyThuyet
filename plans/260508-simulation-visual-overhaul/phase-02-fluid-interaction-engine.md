---
phase: 2
title: "Fluid Interaction Engine"
status: completed
priority: P1
effort: "8h"
dependencies: [1]
---

# Phase 2: Fluid Interaction Engine

## Overview
Re-engineer the interaction layer to provide a fluid, tactile feel using physics-based drag and sophisticated visual feedback.

## Requirements
- Visual hover/active states for all interactive handles.
- "Sticky" drag logic that uses spring physics instead of direct geometric pinning.
- Visual "Magnetic" snap feedback.
- Detach guides for off-bounds cursor movement.

## Architecture
- **SimInteractions**: Upgrade `createInteractionLayer` to track hover states.
- **SimInteractionEnhancements**: Add `springDrag` logic and `detachGuide` renderer.
- **SimProfessionalLab**: Connect interaction states to the animation tick for continuous feedback.

## Related Code Files
- Modify: `js/sim-interactions.js`
- Modify: `js/sim-interaction-enhancements.js`
- Modify: `js/sim-professional-lab.js`

## Implementation Steps
1. **Hover System**: Add `pointerover`/`pointerout` listeners to the interaction layer to trigger handle highlights.
2. **Spring Drag**: Implement a "target vs actual" state in handles, where the actual position follows the target (cursor) using a damped spring.
3. **Magnetic Snap**: Add a visual "pulse" or "glow" when a handle snaps to a grid or guide point.
4. **Fluid Readouts**: Smooth the readout values (interpolation) to avoid jarring numeric jumps during rapid movements.

## Success Criteria
- [x] Handles change color/size on hover.
- [x] Dragging heavy objects shows a visible lag/springiness.
- [x] No more "detached" cursor feeling when hitting bounds.

## Risk Assessment
- **Input Lag**: Spring physics can feel "mushy" if not tuned correctly. Mitigation: Allow per-route tension tuning.
- **Complexity**: Multiple handles interacting might cause oscillation. Mitigation: Use high damping by default.
