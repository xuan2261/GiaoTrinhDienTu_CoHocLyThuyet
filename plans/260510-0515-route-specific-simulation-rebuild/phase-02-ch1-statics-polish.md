# Phase 02 - Ch1 Statics Route Polish

## Context Links

- `js/sims/ch1/*.js`
- `js/sim-professional-lab.js`

## Overview

Priority: High  
Status: Completed  
Goal: polish 25 Ch1 routes with route-specific statics visuals: force geometry, supports, friction, centroid, solver boards.

## Requirements

- Improve route-specific visual clarity without changing route ids.
- Keep Ch1 handles route-owned and direct manipulation live.
- Prefer real statics symbols over generic blocks.

## Related Code Files

- Modify: `js/sims/ch1/ch1-force-law-renderers.js`
- Modify: `js/sims/ch1/ch1-support-renderers.js`
- Modify: `js/sims/ch1/ch1-spatial-renderers.js`
- Modify: `js/sims/ch1/ch1-friction-renderers.js`
- Modify: `js/sims/ch1/ch1-centroid-solver-renderers.js`
- Modify: `js/sims/ch1/ch1-solver-exercises-renderers.js`
- Modify if needed: `js/sim-professional-lab.js`

## Implementation Steps

1. Force/law routes: vector anatomy, moment arm, force polygon, parallelogram, FBD.
2. Supports: smooth support, cable, hinge, roller, fixed support, two-force member.
3. Friction/centroid: incline, cone, wedge, composite area, subtractive hole.
4. Solver routes: active step/status, equation board readability.

## Todo List

- [x] Polish all Ch1 renderer groups.
- [x] Keep Ch1 structural marks unique.
- [x] Run Ch1 route smoke via browser subset if possible.

## Success Criteria

- 25/25 Ch1 routes mount and pass visual-quality route checks.

## Risk Assessment

- `realisticBeam` currently horizontal; use/add rotated beam for inclined members.

## Security Considerations

- Formula overlays must remain sanitized through `domMath`/`domLabel`.

## Next Steps

Proceed to Ch2 kinematics pass.
