# Phase 04: Ch3 Route-Specific Polish

## Context Links

- Overview: [plan.md](./plan.md)
- Route registry: `js/sims/ch3/dynamics-routes.js:15`
- Scene/control/readout sources: `js/sims/ch3/ch3-dynamics-all-18-scenes.js:192`
- Behavior sources: `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js:194`, `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js:198`

## Overview

- Priority: P1
- Status: pending
- Brief description: polish all 18 Ch3 dynamics routes so motion, force, collision, and theorem scenes feel route-owned while preserving pause/reset/readout correctness.

## Key Insights

- Ch3 already groups route behaviors into Newton/D'Alembert and theorem/collision files, which cleanly separates force-driven motion from conservation/checker logic.
- Ch3 is the chapter most likely to use active animation, particles, and spring handles, but current tests require drag to pause running animation and reset to restore initial readout (`tests/simulation-interaction-engine.spec.js:123`, `tests/simulation-interaction-engine.spec.js:149`).
- Visual differentiation matters: collision, spring-mass, momentum, angular momentum, and theorem selector routes must not collapse into one generic dynamics scene (`tests/simulation-visual-quality.spec.js:71`).

## Requirements

- Keep all 18 canonical Ch3 route ids and dedicated renderer/behavior identity unchanged.
- Use motion feedback only where it teaches the concept: spring oscillation, collision outcome, energy/momentum transfer, rotating mass, or theorem selection.
- Keep every animated route paused-safe, reset-safe, and bounded.

## Architecture

- Data in: drag/play/pause/reset and slider controls feed route state through existing behaviors and animation callbacks.
- Transform: behavior `onTick` owns temporal evolution; route renderers own the scene-specific display; shared animation helpers stay opt-in support only.
- Data out: readout cards should surface dynamic quantities such as `V`, `p trước`, `L`, `T`, or residual/checker status rather than raw internal state.

## Related Code Files

- Modify: `js/sims/ch3/ch3-newton-laws-renderers.js`, `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js`, `js/sims/ch3/ch3-theorems-renderers.js`, `js/sims/ch3/ch3-collision-exercises-renderers.js`, `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js`, `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js`, and `js/sims/ch3/ch3-dynamics-all-18-scenes.js` only where control/readout metadata needs to change.
- Do not modify: `js/sims/ch3/dynamics-routes.js`

## Implementation Steps

1. Newton and inertial-frame routes: improve body/force ownership, directional emphasis, and state-dependent feedback without overdecorating.
2. Spring-mass and D'Alembert routes: tighten oscillator motion readability, spring compression cues, and pause/resume semantics.
3. Momentum, collision, and angular-momentum routes: make pre/post-state comparison explicit and keep drag handles coupled to visible bodies.
4. Theorem selector and numeric checker routes: keep canvas/state identity unique and visibly distinct from the physical routes.

## Todo List

- [ ] Polish Newton/inertia renderer group
- [ ] Polish spring-mass/D'Alembert renderer group
- [ ] Polish theorem/collision/exercise renderer group
- [ ] Align Ch3 readouts with route-specific motion states
- [ ] Re-check drag-pause-reset semantics

## Success Criteria

- All 18 Ch3 routes keep unique renderer/behavior identity and route-owned handles.
- Representative semantic cards such as `V` and `p trước` still change on drag (`tests/simulation-interaction-engine.spec.js:18`, `tests/simulation-interaction-engine.spec.js:19`, `tests/simulation-interaction-engine.spec.js:103`).
- Animated routes still open paused, pause on drag, and reset cleanly (`tests/simulation-interaction-engine.spec.js:149`).

## Risk Assessment

- High: animation polish causes state drift or reset mismatch. Mitigation: every animated route re-checks `@animation` and `@reset` after edits.
- Medium: particle/glow effects reduce contrast in light theme. Mitigation: theme-readability gate remains mandatory (`tests/simulation-visual-quality.spec.js:96`).
- Medium: theorem/checker routes lose unique structural marks. Mitigation: rerun identity gate before phase sign-off.

## Security Considerations

- No remote assets, no new storage, no unsafe HTML.
- Keep all dynamic rendering on local canvas/overlay primitives only.

## Test Matrix

- Unit: `npm run test:sim:unit`
- Quality: `npm run test:sim:quality`
- Browser: `npm run test:sim:browser`, `npm run test:sim:visual-quality`

## Rollback Plan

- Restore only Ch3 snapshots plus any shared-file snapshot if a shared hook needs to be reverted.

## Next Steps

- When Ch3 closes green, move immediately to the all-route regression/docs phase without reopening chapter files unless a release gate identifies a concrete regression.
