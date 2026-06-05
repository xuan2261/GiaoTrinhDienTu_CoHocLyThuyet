---
phase: 3
title: "Route Composition Polish"
status: completed
priority: P1
effort: "8h"
dependencies: [2]
---

# Phase 03: Route Composition Polish

## Overview

Fix the concrete route-level composition problems: scale, camera, margins, label separation, and object spacing. This phase owns geometry/camera/label placement only; material opacity/color/depth belongs to Phase 04.

## Requirements

- Functional: route geometry and labels remain synced to existing Sim2 state.
- Non-functional: no physics changes, no new controls, no route outside the six Sim3 pilot routes.

## Architecture

Each adapter owns its concept-specific composition. Shared kit only supplies helpers; route files choose camera position, object scale, vector lengths, label offsets, and cue placement.

## Related Code Files

- Modify: `js/sim3/sims/ch2-2-2-3d.js`
- Modify: `js/sim3/sims/ch2-3-2-3d.js`
- Modify: `js/sim3/sims/ch2-4-4-3d.js`
- Modify: `js/sim3/sims/ch2-5-3-3d.js`
- Modify: `js/sim3/sims/ch3-5-3-3d.js`
- Modify: `tests/sim3-pilot-fallback-dispose.spec.js`

## Implementation Steps

1. RED: add route debug assertions for composition targets:
   - `ch2-2-2`: disk scale target and tangent vector safe-margin metadata.
   - `ch2-4-4`: vector separation/perpendicular cue metadata.
   - `ch2-5-3`: velocity/vector scale ratio metadata.
   - `ch3-5-3`: radius guide label exists and route reports clean radius cue.
   - all routes: `.sim3-label` overlap count is `0` in 3D mode.
2. Polish `ch2-2-2`:
   - reduce disk radius ~10–18%;
   - adjust camera/object so tangent point and arrowhead have breathing room;
   - keep axis, `M`, `ω`, `v` visible.
3. Polish `ch2-3-2`:
   - mute support shafts and secondary arrows;
   - keep belt/gears as primary visual layer;
   - avoid arrow overlap with teeth/belt.
4. Polish `ch2-4-4`:
   - offset labels further from vector cluster;
   - strengthen rotating-frame/sector cue;
   - separate `v_rel` and `a_cor` origins enough to show near-perpendicularity.
5. Polish `ch2-5-3`:
   - shorten/lighten main velocity vector by ~15–25%;
   - give gray field arrows a clear construction style;
   - make radius `P→M` more explicit.
6. Polish `ch3-5-3`:
   - replace rough radius label with crisp dimension/radius guide;
   - keep orbit ring secondary and masses/arm primary.
7. Run `npm run test:sim3:pilot` and capture screenshots for review.

## Success Criteria

- [x] All five non-collision routes pass new visual debug assertions.
- [x] `ch2-2-2` no longer looks oversized or edge-crowded.
- [x] `ch2-3-2` remains information-rich but less cluttered.
- [x] `ch2-4-4` reads as an intentional Coriolis scene, not an empty plate.
- [x] `ch2-5-3` communicates velocity proportional to IC distance without an overpowering vector.
- [x] `ch3-5-3` has a clean radius cue.

## Risk Assessment

Risk: route-specific tweaks drift from current formula/readout. Mitigation: do not change state formulas; only change render scale, geometry placement, label offsets, and camera composition.
