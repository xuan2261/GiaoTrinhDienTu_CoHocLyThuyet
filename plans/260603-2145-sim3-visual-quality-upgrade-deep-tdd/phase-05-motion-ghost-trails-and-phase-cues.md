---
phase: 5
title: "Motion Ghost Trails And Phase Cues"
status: completed
priority: P1
effort: "5h"
dependencies: [4]
---

# Phase 05: Motion Ghost Trails And Phase Cues

## Overview

Strengthen dynamic storytelling, especially `ch3-6-2` collision, with ghost states, trails, impact marker, and phase cues that remain deterministic under tests.

## Requirements

- Functional: motion cues must update from existing route state and reset cleanly.
- Non-functional: respect reduced-motion expectations by avoiding essential information encoded only in animation.

## Architecture

Reuse or extend route-local trail arrays and shared ghost materials. `ch3-6-2` keeps its current state model; the adapter renders before/impact/after cues from `collided`, `impactPoint`, positions, velocities, and phase readout.

## Related Code Files

- Modify: `js/sim3/sims/ch3-6-2-3d.js`
- Modify: `js/sim3/sims/ch2-4-4-3d.js` if trail helper is shared
- Modify: `tests/sim3-pilot-fallback-dispose.spec.js`
- Modify: `tools/sim3-visual/pilot-capture.spec.js`

## Implementation Steps

1. RED: assert collision route debug includes deterministic cue state: `trailLength`, `collided`, optional `ghostCount`/`phaseCue`.
2. RED: assert reset clears trail/ghost/impact cue.
3. GREEN: add ghost spheres for pre/post collision reference positions.
4. Add impact marker and phase label anchored near collision point.
5. Improve trail fade and direction arrows without increasing animation complexity.
6. Capture before/impact/after states in visual script if deterministic step counts permit.

## Success Criteria

- [x] `ch3-6-2` communicates before collision, impact, and after collision at a glance.
- [x] Trail/ghost cues clear on reset and dispose.
- [x] No autoplay requirement is introduced.
- [x] `npm run test:sim3:pilot` remains green.
- [x] Updated capture includes a meaningful dynamic state, not only initial separation.

## Risk Assessment

Risk: deterministic impact frame varies with future physics tweaks. Mitigation: tests should assert cue lifecycle and state sync, not fragile pixel positions.
