---
phase: 3
title: "Build Deterministic Sim2 Clock"
status: completed
priority: P1
dependencies: [2]
effort: "2-3 days"
---

# Phase 3: Build Deterministic Sim2 Clock

## Overview

Make all eight animated Sim2 routes refresh-rate independent while preserving deterministic one-step behavior. One pure fixed-step clock owns wall-time accumulation, pause/resume anchoring, stall bounds, and simulation time.

## Requirements

- Same simulated state after one real second at 30/60/120/144 Hz timestamp sequences.
- Manual step advances exactly `1/60 s`.
- Resume after pause never catches up paused wall time.
- Long stalls are bounded to avoid spiral-of-death.
- Existing route factory and `shell.start/stop/dispose` contracts remain compatible.

## Architecture

```js
createClock({
  stepSeconds: 1 / 60,
  maxFrameSeconds: 0.25,
  maxSubSteps: 15,
  update(dt, simulationTime) {}
})
```

Public methods: `advance(timestampMs)`, `stepOnce()`, `resetTimestamp()`, `resetSimulationTime()`, `getSimulationTime()`. `Sim2Shell` drives `advance(ts)` from RAF. Playback and step call the same route `update(dt)` path; drawing occurs after substeps.

## File Inventory

| Action | File | Change | Test impact |
|---|---|---|---|
| Create | `js/sim2/core/animation-clock.js` | Pure UMD/CommonJS clock | New Node tests |
| Create | `tests/sim2-animation-clock.test.js` | Timestamp/fixed-step matrix | Fast deterministic gate |
| Modify | `js/sim2/core/sim-shell.js` | Clock ownership and `onFrame(update)` semantics | Shared lifecycle |
| Modify | `index.html`, three chapter fixtures | Load clock before shell | Offline/browser wiring |
| Modify | Eight dynamic route files | Replace hardcoded `1/60` with `update(dt)` | Route contracts |
| Modify | `tests/sim2-ui-components.spec.js` | RAF/start/stop/step semantics | Shared component |
| Modify | `tests/sim2-visual-motion-polish.spec.js` | Deterministic frames | Visual behavior |
| Modify | `package.json` | Include clock tests | Release gate |

Dynamic routes: `ch2-1-1`, `ch2-2-2`, `ch2-3-2`, `ch2-4-4`, `ch3-2-2`, `ch3-3-1`, `ch3-5-3`, `ch3-6-2`.

## Function and Interface Checklist

- [x] First timestamp anchors only, no simulation jump.
- [x] Accumulator drains in fixed substeps.
- [x] Delta clamped and substep count bounded.
- [x] `start()` resets wall timestamp but not simulation state.
- [x] `stop()` cancels exactly one owned RAF.
- [x] `stepOnce()` works only once per click and does not start RAF.
- [x] `dispose()` prevents future update/draw callbacks.
- [x] Route `reset()` resets both route state and clock simulation time where time is displayed.
- [x] Draw path does not append duplicate trails during zero-substep frames.

## Dependency Map

- Uses corrected physics and route contracts from phase 2.
- Blocks responsive work that instruments RAF/disposal in phase 4.
- Collision-specific stepping remains phase 5 but must use this clock.

## Test Scenario Matrix

| Scenario | Input | Expected |
|---|---|---|
| Refresh rates | Synthetic timestamps for 1 s at 30/60/120/144 Hz | Same step count/state |
| Pause/resume | Advance, pause 2 s, resume | No catch-up |
| Stall | 500-2000 ms gap | Bounded delta/substeps |
| Manual step | 60 clicks | Exactly 1 simulated second |
| Mixed | 10 steps, play, pause, one step | Monotonic exact time |
| Dispose | Pending RAF then dispose | Zero updates afterward |
| Route invariants | All eight dynamic routes | Same physics at N steps |

## Tests Before

1. Write pure clock RED tests for every matrix row.
2. Add browser instrumentation for owned RAF IDs and update counts.
3. Add a route test that feeds 30/120 Hz timestamps and demonstrates current divergence.
4. Confirm manual step baseline remains deterministic.

## Refactor

1. Add pure clock module.
2. Integrate it into `Sim2Shell` without exposing wall time to routes.
3. Convert routes one at a time to `update(dt)`.
4. Separate update and draw where needed.
5. Keep playback controls API stable.

## Tests After

- Add negative/non-monotonic timestamp defense.
- Add idempotent start/stop and rapid-toggle cases.
- Verify reset during a frame and dispose during callback.
- Verify no route retains literal update `1 / 60`.

## Implementation Steps

1. Add RED clock tests and script wiring.
2. Implement clock pure module.
3. Integrate shell and fixtures.
4. Migrate four Ch2 routes, run Ch2 contracts.
5. Migrate four Ch3 routes, run Ch3 contracts.
6. Add lifecycle edge cases.
7. Run all Sim2 gates and visual unit tests.

## Regression Gate

```powershell
node tests/sim2-animation-clock.test.js
npx playwright test tests/sim2-ui-components.spec.js tests/sim2-route-physics.spec.js
npm run test:sim:physics
npm run test:sim:mount
```

## Success Criteria

- [x] Playback state is invariant across tested refresh rates.
- [x] Pause/resume, stall, step, reset, and dispose contracts pass.
- [x] All eight routes use supplied `dt`; no hardcoded frame advancement remains.
- [x] Existing 25 route contracts and 110 mount coverage remain green.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Screenshot timing changes | Use manual deterministic steps; triage baseline later |
| Resume jumps | Reset wall anchor in `start()` |
| Too many catch-up steps | Clamp elapsed time and substeps |
| Trails append multiple points per paint | Define whether trail records per physics step or rendered frame and test it |

## Security and Performance

No network/input risk. Bound substeps prevents CPU spikes after tab throttling.

## Next Steps

Phase 4 builds responsive and accessibility behavior on a measurable RAF/disposal foundation.
