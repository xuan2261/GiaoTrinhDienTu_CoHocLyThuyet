# Phase 02 `ch2-3-2` Transmission 3D

## Context Links

- `js/sim2/sims/ch2/ch2-3-2.js`
- `js/sim2/physics/kinematics.js`
- `js/sim3/sims/ch2-2-2-3d.js`

## Overview

Priority: P1
Status: Complete
Effort: 5h
Goal: add optional 3D view for gear/belt/pulley transmission.

## Key Insights

- Highest low-risk next route after pilot.
- Teaching value is direction relation: gear pair opposite, open belt pair same.
- 3D must not invent new transmission physics; it mirrors existing route state.

## Requirements

- 3D must show gear pair rotating opposite directions and belt-pulley pair rotating same direction.
- Sliders `r1`, `r2` and playback must drive both 2D and 3D from existing route state.
- No duplicate transmission physics.
- Fallback to 2D on WebGL failure.
- Toggle starts in 2D; 3D lazy-loads only when user selects it.
- 3D shows axis rods and compact direction cues without dense gear teeth.

## Architecture

3D scene:
- two marked cylinders for gear transmission; optional low-count tooth marks only if readable.
- two pulleys connected by simple belt loop/strip.
- simple axis rods and direction cues.
- panel/readout stays Sim2-owned.
- adapter receives existing route state and writes `__SIM3_DEBUG__['ch2-3-2']`.

## Related Code Files

Modify:
- `js/sim2/sims/ch2/ch2-3-2.js`
- `index.html`
- `tests/fixtures/sim2-ch2.html`
- `tests/sim3-pilot-fallback-dispose.spec.js`

Create:
- `js/sim3/sims/ch2-3-2-3d.js`

Delete:
- None.

## Implementation Steps

1. RED: extend Sim3 spec for `ch2-3-2` mode toggle appears after mount.
2. RED: assert click 3D creates one canvas and debug state includes `r1`, `r2`, gear angular directions, belt angular directions.
3. RED: change `r1`/`r2` sliders and assert 3D debug state updates.
4. RED: step/playback once and assert gear marker rotation changes.
5. GREEN: create `ch2-3-2-3d.js` adapter with marked cylinders, belt loop, axes, direction arrows.
6. GREEN: wire `Sim3Mode.attach` in the existing route after Sim2 shell root exists.
7. VERIFY: dispose route; assert no `.sim3-mode-toggle`, `.sim3-fallback`, `.sim3-host`, `canvas.sim3-canvas`.
8. VERIFY: run `npm run test:sim3:pilot`.

## Todo List

- [x] Add RED tests.
- [x] Create adapter.
- [x] Wire route.
- [x] Verify fallback and repeated toggle.
- [x] Capture visual.

## Success Criteria

- Gear and belt direction distinction is visually clear.
- Existing ch2 mount tests still pass.
- Slider sync and playback sync are covered by tests.
- 2D remains default and readable when 3D fails.

## Risk Assessment

- Gear teeth can become visual noise. Prefer marked cylinders.
- Belt geometry can be misleading if twisted. Use open-belt same-direction only unless existing route models crossed-belt.
- Extra script load can break fixtures. Update `index.html` and fixture order together.

## Security Considerations

No external models/textures.

## Next Steps

Proceed to `ch2-4-4`.
