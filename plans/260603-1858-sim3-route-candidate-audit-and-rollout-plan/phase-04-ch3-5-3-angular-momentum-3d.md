# Phase 04 `ch3-5-3` Angular Momentum 3D

## Context Links

- `js/sim2/sims/ch3/ch3-5-3.js`
- `js/sim2/physics/dynamics.js`
- `js/sim3/sims/ch2-2-2-3d.js`

## Overview

Priority: P1
Status: Complete
Effort: 5h
Goal: add optional 3D view for angular momentum conservation.

## Key Insights

- Reuses fixed-axis rotation concepts from `ch2-2-2`.
- Teaching value is radius-change causing angular-speed change while angular momentum stays readable in Sim2 panel.
- 3D should show relationship, not replace formula/readout panel.

## Requirements

- 3D shows rotating central body/axis and masses moving radially.
- Slider `r` changes radius; playback shows angular speed response.
- `L = I omega` relation stays route-owned/readout-owned.
- No duplicate dynamics solver.
- Keep rotation speed clamped for readability.
- Respect reduced-motion by limiting non-essential animation cues.

## Architecture

3D scene:
- vertical rotation axis.
- two symmetric masses on radial arms.
- radius guide.
- angular momentum vector.
- simple speed cue through rotation rate.
- adapter receives existing route state and writes `__SIM3_DEBUG__['ch3-5-3']`.

## Related Code Files

Modify:
- `js/sim2/sims/ch3/ch3-5-3.js`
- `index.html`
- `tests/fixtures/sim2-ch3.html`
- `tests/sim3-pilot-fallback-dispose.spec.js`

Create:
- `js/sim3/sims/ch3-5-3-3d.js`

Delete:
- None.

## Implementation Steps

1. RED: test 3D toggle and debug state includes radius, omega, inertia/momentum values exposed by route state.
2. RED: change radius slider and assert mass positions move radially plus omega cue updates.
3. RED: step/playback and assert rotation marker changes without changing 2D default.
4. GREEN: implement central axis, two masses, radial arms, radius guide, angular momentum vector.
5. GREEN: reuse shared arrow/grid/material helper from Phase 01 where available.
6. GREEN: wire existing route state; clamp visual rotation speed only in adapter.
7. VERIFY: dispose and fallback tests for ch3 fixture.
8. VERIFY: run `npm run test:sim3:pilot`.

## Todo List

- [x] Add RED tests.
- [x] Implement adapter.
- [x] Wire route.
- [x] Verify speed clamp/reduced-motion behavior.
- [x] Capture visual.

## Success Criteria

- Learner can see smaller `r` causing faster rotation.
- Existing ch3 mount tests still pass.
- Radius slider sync and playback sync are test-covered.
- Formula/readout ownership remains in Sim2 panel.

## Risk Assessment

- Fast spin can be uncomfortable. Clamp visual omega while preserving readout.
- Radial masses can occlude each other at small radius. Use slight vertical/marker offsets if needed.
- Avoid deriving new `L/I/omega` equations in adapter.

## Security Considerations

No external models/textures.

## Next Steps

Proceed to QA/docs.
