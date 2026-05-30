---
name: sim-physics-rc1
description: Core review invariant for the mechanics-textbook simulations — readouts must derive from shared physics modules, not faked
metadata:
  type: project
---

Simulation remediation core principle (RC1): every physics readout in `js/sims/**` must be computed by the shared modules `js/sim-physics-{statics,kinematics,dynamics}.js`, NOT by inline pixel heuristics or hardcoded constants.

**Why:** prior versions faked physics (e.g. forced `p_before = p_after` every tick, dragged centroids, duplicate |R| values). These passed CI but taught wrong physics.

**How to apply when reviewing sim changes:**
- Reject any `setCollisionMomentum(state, p0, p0, 0)` called unconditionally each tick (fabricated conservation). It's OK only in a genuine free-flight branch.
- Conserved-quantity sims: the conserved value is the input, dependent vars are consequences (ch3-5-3: I is the slider, ω=L/I derived; no independent ω slider).
- Behavior/renderer files have a hard ≤220-line cap (enforced by `audit_simulation_quality`). Several files sit at 217-220 — flag if a change pushes one over.
- Static-snapshot scenes (`static:true`, e.g. ch2-5-2) must NOT have `onTick` — adding one breaks `tests/phase-09-static-scene-flag.test.js`.
- Readout `key` in scene config must exist in the corresponding `derived()` return object, else the card shows blank.
- Release gate: `npm run test:sim:release`.
- Pixel-coordinate readouts (IC_x/IC_y/x_C) are intentionally unitless — fabricating an SI scale for raw canvas px was explicitly rejected.
