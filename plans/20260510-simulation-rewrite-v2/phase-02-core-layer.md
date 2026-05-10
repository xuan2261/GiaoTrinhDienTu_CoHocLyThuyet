---
phase: 2
title: "Core Layer"
status: completed
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 02: Core Layer

## Overview
Build the foundational `SimulationEngine` that wraps headless Matter.js and synchronizes physics bodies to SVG/DOM elements for rendering.

## Requirements
- Functional: Must support creating standard rigid bodies (rectangles, circles, polygons, constraints). Must sync body positions/rotations to SVG elements on every `requestAnimationFrame`.
- Non-functional: Fast, lightweight, 100% CSS stylable. Proper coordinate system mapping (Matter.js Y-down vs standard Math Y-up).

## Architecture
- **Matter.js Engine**: Headless mode (no `Render.create`).
- **SVG Bridge**: An update loop that iterates over all bodies and updates the `transform="translate(x,y) rotate(rad)"` of corresponding SVG `<g>` or `<path>` elements.

## Related Code Files
- Create: `js/sim-engine-v2.js`
- Modify: `css/style.css` (add basic SVG sim styles)

## Implementation Steps
1. Create `js/sim-engine-v2.js`.
2. Define class `SimulationEngine` that initializes `Matter.Engine.create()`.
3. Implement `addBody(matterBody, svgElement)` method to map a physics body to a DOM/SVG element.
4. Implement `start()` method using `requestAnimationFrame`. Inside the loop:
   - Call `Matter.Engine.update()`.
   - Iterate mapped bodies and apply CSS transforms/SVG attributes to match Matter.js `body.position` and `body.angle`.
5. Implement coordinate transformation utilities (e.g., offset origin to center/bottom, flip Y axis) so standard mechanics scenarios look correct.

## Success Criteria
- [x] `SimulationEngine` can run headless Matter.js.
- [x] SVG elements visually follow Matter.js physics (gravity, collisions) perfectly in a basic test scene.
- [x] Coordinate system flips correctly (Y points up if needed).


## Risk Assessment
- Risk: SVG performance with many bodies.
- Mitigation: Textbooks rarely exceed 10-20 bodies per scene. SVG handles this effortlessly at 60fps.
