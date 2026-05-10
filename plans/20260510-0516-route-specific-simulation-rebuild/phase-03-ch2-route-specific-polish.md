# Phase 03: Ch2 Route-Specific Polish

## Context Links

- Overview: [plan.md](./plan.md)
- Route registry: `js/sims/ch2/kinematics-routes.js:15`
- Scene/control/readout sources: `js/sims/ch2/ch2-kinematics-scenes.js:46`, `js/sims/ch2/ch2-particle-rotation-transmission-scenes.js:39`, `js/sims/ch2/ch2-relative-plane-motion-scenes.js:44`
- Behavior sources: `js/sims/ch2/ch2-kinematics-behaviors-a.js:47`, `js/sims/ch2/ch2-kinematics-behaviors-b.js:11`

## Overview

- Priority: P1
- Status: pending
- Brief description: polish all 15 Ch2 routes around motion, vector composition, graph scrubbing, and instant-center discovery while keeping pause-safe readouts.

## Key Insights

- Ch2 is the chapter where restrained animation matters most; routes already have scene controls and route-owned handles, so the main gap is better motion storytelling, graph clarity, and vector-legibility.
- `js/sims/ch2/ch2-trajectory-graph-renderers.js` is already 205 lines, very close to the 220-line guardrail (`docs/code-standards.md:95`), so this phase must keep edits tight and rebalance logic before adding more branches.
- The current interaction tests already lock drag-readout stability, keyboard nudge, touch safety, and paused animation behavior (`tests/simulation-interaction-engine.spec.js:74`, `tests/simulation-interaction-engine.spec.js:113`, `tests/simulation-interaction-engine.spec.js:135`, `tests/simulation-interaction-engine.spec.js:149`).

## Requirements

- Keep all 15 canonical Ch2 route ids and dedicated renderer/behavior identity unchanged.
- Improve route-specific path scrubbing, vector composition, graph cursor feedback, and instant-center visualization without introducing readout drift when paused.
- Keep play/pause semantics meaningful only for routes that actually animate.

## Architecture

- Data in: slider/button/canvas drag updates motion parameters, graph cursors, or vector endpoints.
- Transform: behavior files own velocity/acceleration derivation; scene files own control metadata; renderer files own trajectory, graph, gear, relative-motion, and plane-motion visuals.
- Data out: route readouts should expose quantities like `alpha`, `IC_x`, `v_a`, `a_c`, or checker residuals instead of generic cursor positions.

## Related Code Files

- Modify: `js/sims/ch2/ch2-particle-renderers.js`, `js/sims/ch2/ch2-trajectory-graph-renderers.js`, `js/sims/ch2/ch2-rotation-gear-renderers.js`, `js/sims/ch2/ch2-rotation-transmission-renderers.js`, `js/sims/ch2/ch2-relative-renderers.js`, `js/sims/ch2/ch2-relative-motion-velocity-renderers.js`, `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js`, `js/sims/ch2/ch2-plane-checker-renderers.js`, `js/sims/ch2/ch2-kinematics-exercises-renderers.js`, `js/sims/ch2/ch2-kinematics-behaviors-a.js`, `js/sims/ch2/ch2-kinematics-behaviors-b.js`, and scene files where control/readout metadata needs to change.
- Do not modify: `js/sims/ch2/kinematics-routes.js`

## Implementation Steps

1. Particle/trajectory/graph routes: sharpen path visibility, cursor feedback, and time scrubbing; use trails only where they explain motion.
2. Rotation/transmission routes: make angular relationships and gear/pulley coupling visually obvious with clearer axes, radii, and direction cues.
3. Relative-motion and plane-motion routes: strengthen vector triangle readability, instant-center contrast, and motion decomposition overlays.
4. Exercise/checker routes: keep solver tables/checker surfaces compact and directly tied to canvas interaction.

## Todo List

- [ ] Polish particle + graph renderer group
- [ ] Polish rotation + transmission renderer group
- [ ] Polish relative + plane-motion renderer group
- [ ] Align Ch2 derived readouts and animation semantics
- [ ] Re-check near-limit file sizes before phase close

## Success Criteria

- All 15 Ch2 routes still pass direct drag and pause-stability checks.
- Representative semantic cards such as `α` and `IC_x` still change on drag (`tests/simulation-interaction-engine.spec.js:16`, `tests/simulation-interaction-engine.spec.js:17`, `tests/simulation-interaction-engine.spec.js:103`).
- No Ch2 route regresses into detached default coordinates or duplicate structure (`tests/simulation-visual-quality.spec.js:64`, `tests/simulation-visual-quality.spec.js:87`).

## Risk Assessment

- High: adding motion polish breaks pause semantics. Mitigation: routes animate only through existing `onTick` contracts and must re-pass `@animation`.
- Medium: the near-limit trajectory renderer file exceeds the size guardrail. Mitigation: rebalance within current chapter files before adding more logic; if unavoidable, perform a same-phase split that also removes the replaced chunk.
- Medium: vector-heavy routes become visually busy. Mitigation: one primary vector story per route, secondary guides only on interaction.

## Security Considerations

- No new persistence or external fetches.
- Keep touch and keyboard behavior on the existing local interaction layer only.

## Test Matrix

- Unit: `npm run test:sim:unit`
- Quality: `npm run test:sim:quality`
- Browser: `npm run test:sim:browser`, `npm run test:sim:visual-quality`

## Rollback Plan

- Restore only Ch2 snapshots plus any shared-file snapshot if Phase 01 hooks needed a corrective change.

## Next Steps

- Hand off to Ch3 after Ch2 motion routes are stable in both dark/light theme and paused/readout behavior.
