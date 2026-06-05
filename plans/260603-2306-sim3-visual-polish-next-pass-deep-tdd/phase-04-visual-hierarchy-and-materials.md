---
phase: 4
title: "Visual Hierarchy And Materials"
status: completed
priority: P2
effort: "5h"
dependencies: [3]
---

# Phase 04: Visual Hierarchy And Materials

## Overview

Improve perceived quality without heavy effects: clearer primary/secondary hierarchy, better material roughness/opacity, subtle shadows, and consistent semantic color dominance. This phase owns material/opacity/color/depth only; geometry/camera/label placement should already be handled in Phase 03.

## Requirements

- Functional: materials and hierarchy must support existing physical meaning and panel legends.
- Non-functional: no textures, no post-processing, no runtime dependencies, no performance-heavy lighting.

## Architecture

Use `Sim3VisualKit` material tokens and route-owned material choices. Primary objects/vectors get stronger saturation/opacity; construction/support elements become muted. Lighting stays in `Sim3Shell` or shared helpers with route overrides only when needed.

## Related Code Files

- Modify: `js/sim3/core/visual-kit.js`
- Modify: `js/sim3/core/three-shell.js` if global light tuning is needed
- Modify: selected `js/sim3/sims/*-3d.js`
- Modify: `tests/sim3-pilot-fallback-dispose.spec.js` for debug material/hierarchy assertions if useful

## Implementation Steps

1. RED: add tests for material/hierarchy metadata only where deterministic:
   - secondary shafts/supports are marked as muted in `ch2-3-2`.
   - construction arrows are marked distinct from primary vectors in `ch2-5-3`.
   - radius guide is marked as guide/dimension in `ch3-5-3`.
   - primary/secondary material roles are exposed in debug payload where routes use muted supports or construction cues.
2. Add shared material presets:
   - `primarySurface`, `secondarySurface`, `support`, `construction`, `dimension`, `ghost`.
3. Apply hierarchy:
   - `ch2-3-2`: shafts/support rods lower opacity/contrast; belt/gears primary.
   - `ch2-5-3`: gray field arrows become construction/dashed or lower-opacity guide.
   - `ch3-5-3`: orbit ring and radius guide have different weights.
4. Tune shell lighting only if screenshots still look flat after material hierarchy.
5. Run `npm run test:sim3:pilot` and screenshot capture.

## Success Criteria

- [x] Primary teaching objects are visually dominant in every route.
- [x] Secondary supports/construction cues remain visible but clearly subordinate.
- [x] Materials show better depth without decorative clutter.
- [x] Semantic colors remain aligned with Sim2 palette meanings.
- [x] No route becomes visually busier than baseline.

## Risk Assessment

Risk: transparency/shadows cause WebGL or screenshot flakiness. Mitigation: use simple MeshStandardMaterial opacity/roughness changes and avoid renderer feature changes unless necessary.
