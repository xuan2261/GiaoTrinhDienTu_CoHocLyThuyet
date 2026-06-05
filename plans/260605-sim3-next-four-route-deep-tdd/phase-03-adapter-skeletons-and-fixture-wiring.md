---
phase: 3
title: "Adapter Skeletons And Fixture Wiring"
status: completed
priority: P1
effort: "6h"
dependencies: [2]
---

# Phase 03: Adapter Skeletons And Fixture Wiring

## Overview

Create four route-local Sim3 adapter files and load them in the chapter fixtures.

## Requirements

- Functional: each adapter exports `{ create }` under a stable global and can mount a 3D scene.
- Non-functional: no new runtime dependency, no CDN, no public contract change.

## Architecture

Adapters follow existing UMD-style globals:

```text
root.Sim3Ch153
root.Sim3Ch313
root.Sim3Ch213
root.Sim3Ch115
```

Each uses `Sim3Shell.create`, `Sim3VisualKit`, and `Sim3Primitives`.

## Related Code Files

- Create: `js/sim3/sims/ch1-5-3-3d.js`
- Create: `js/sim3/sims/ch3-1-3-3d.js`
- Create: `js/sim3/sims/ch2-1-3-3d.js`
- Create: `js/sim3/sims/ch1-1-5-3d.js`
- Modify: `tests/fixtures/sim2-ch1.html`
- Modify: `tests/fixtures/sim2-ch2.html`
- Modify: `tests/fixtures/sim2-ch3.html`
- Modify: `index.html`

## Implementation Steps

1. Build `ch1-5-3` scene: inclined plane, block, cone/friction-angle guide, equilibrium/slip cue.
2. Build `ch3-1-3` scene: rail/toa, pendulum bob, acceleration arrow, inertial force arrow.
3. Build `ch2-1-3` scene: ellipse path, point marker, tangent/normal arrows, osculating circle/radius guide.
4. Build `ch1-1-5` scene: application points, two force vectors, resultant vector, moment-axis cue.
5. Expose route-specific debug state with `visualMetrics` and numeric fields used by tests.
6. Add production script tags in `index.html` so real app loads all four adapters offline.

## Success Criteria

- [x] All four files load in browser without syntax errors.
- [x] `create()` returns `{ host, setState, dispose }` or `null` on fallback.
- [x] `setState()` updates geometry and `window.__SIM3_DEBUG__[route]`.
- [x] Labels use existing label layer, not custom unmanaged DOM.
- [x] `index.html` and fixtures load adapters in the same dependency order.

## Risk Assessment

Risk: duplicated vector helpers across adapters. Mitigation: keep tiny local helpers; only extract shared helper if repetition becomes clear after all four pass.
