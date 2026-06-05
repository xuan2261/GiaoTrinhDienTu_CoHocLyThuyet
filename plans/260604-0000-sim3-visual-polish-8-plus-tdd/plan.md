---
title: "Sim3 Visual Polish 8 Plus TDD"
description: "TDD pass to raise the six optional Sim3 pilot scenes toward 8+/10 by improving camera crop, label spacing, clutter, and material hierarchy without changing physics."
status: completed
priority: P1
effort: 8h
branch: master
tags: [simulation, threejs, sim3, visual-polish, tdd]
created: 2026-06-04
---

# Sim3 Visual Polish 8 Plus TDD

## Overview

Implement the visual recommendations from the latest screenshot review: better crop/camera, smarter label placement, less clutter in dense scenes, clearer secondary/primary hierarchy, and stronger after-impact composition.

## Scope

- Only existing Sim3 pilot routes: `ch2-2-2`, `ch2-3-2`, `ch2-4-4`, `ch2-5-3`, `ch3-5-3`, `ch3-6-2`.
- No physics changes.
- No Sim2 default behavior changes.
- No new runtime dependencies, textures, post-processing, or orbit controls.

## Touchpoints

- `js/sim3/sims/ch2-2-2-3d.js`
- `js/sim3/sims/ch2-3-2-3d.js`
- `js/sim3/sims/ch2-4-4-3d.js`
- `js/sim3/sims/ch2-5-3-3d.js`
- `js/sim3/sims/ch3-5-3-3d.js`
- `js/sim3/sims/ch3-6-2-3d.js`
- `tests/sim3-pilot-fallback-dispose.spec.js`
- `tools/sim3-visual/pilot-capture.spec.js`

## Acceptance Criteria

- `ch2-2-2`: `M`/`v` labels separated from marker/vector cluster; disk and axis still clear.
- `ch2-3-2`: large pulley has safe crop margin; belt/gear labels no longer cover dense faces; clutter metrics captured.
- `ch2-4-4`: central vector cluster more centered; Coriolis plane cue visibly stronger; labels clear.
- `ch2-5-3`: green velocity arrow has safe left margin; purple radius guide more legible; labels clear.
- `ch3-5-3`: `L` label visually attached to arrow; orbit cue clearer; vertical axis de-emphasized.
- `ch3-6-2`: collision scene fills viewport better; label cluster reduced; active balls dominate ghosts.
- Label overlap remains zero in representative 3D modes.
- `npm run test:sim3:pilot` passes.
- `npm run test:sim3:visual:capture` passes and writes final screenshots to this plan.
- `npm run test:sim:release` passes.

## Phases

| Phase | Name | Status |
|---:|---|---|
| 01 | [TDD Visual Contracts](./phase-01-tdd-visual-contracts.md) | Completed |
| 02 | [Route Polish Implementation](./phase-02-route-polish-implementation.md) | Completed |
| 03 | [Capture Review And Release](./phase-03-capture-review-and-release.md) | Completed |

## Unresolved Questions

None.
