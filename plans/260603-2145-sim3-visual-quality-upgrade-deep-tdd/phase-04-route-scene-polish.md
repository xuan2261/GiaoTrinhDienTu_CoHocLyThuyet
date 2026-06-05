---
phase: 4
title: "Route Scene Polish"
status: completed
priority: P1
effort: "8h"
dependencies: [3]
---

# Phase 04: Route Scene Polish

## Overview

Apply targeted scene polish to the five non-collision Sim3 routes so each 3D scene teaches its concept rather than merely showing geometry.

## Requirements

- Functional: route-specific visual cues must follow existing state updates and sliders.
- Non-functional: cues must not add clutter; each must map to terms already present in the panel legend/readouts.

## Architecture

Adapters remain route-owned. Shared kit provides visual pieces; each adapter composes them around its concept. The state object remains the only source of truth for geometry changes.

## Related Code Files

- Modify: `js/sim3/sims/ch2-2-2-3d.js`
- Modify: `js/sim3/sims/ch2-3-2-3d.js`
- Modify: `js/sim3/sims/ch2-4-4-3d.js`
- Modify: `js/sim3/sims/ch2-5-3-3d.js`
- Modify: `js/sim3/sims/ch3-5-3-3d.js`
- Modify: `tests/sim3-pilot-fallback-dispose.spec.js`

## Implementation Steps

1. RED: add route assertions for expected labels/debug cues per route.
2. Polish `ch2-2-2`: clearer rotation plane, point `M`, tangential velocity, angular acceleration cue.
3. Polish `ch2-3-2`: reduce gear/belt visual clutter; label gear/belt directions and contact tangent.
4. Polish `ch2-4-4`: add vector plane/cross-product cue for `omega x v_rel`, richer bead trail, and labels for perpendicularity.
5. Polish `ch2-5-3`: add IC post label `P`, sample label `M`, velocity field ghost arrows, and radius guide emphasis.
6. Polish `ch3-5-3`: show radius contraction/extension context, angular momentum ring, and balanced mass labels.
7. Run focused Sim3 suite and capture screenshots after each route group.

## Success Criteria

- [x] `ch2-4-4` no longer feels empty; `omega`, `v_rel`, and `a_cor` are spatially explainable from the scene.
- [x] `ch2-5-3` clearly shows why velocity grows with distance from IC.
- [x] `ch2-3-2` remains readable despite multiple rotating parts.
- [x] `ch2-2-2` and `ch3-5-3` gain clarity without over-decoration.
- [x] Route debug state assertions still pass.

## Risk Assessment

Risk: route polish duplicates helper logic. Mitigation: move only genuinely repeated primitives into shared kit; keep one-off scene arrangement in adapters.
