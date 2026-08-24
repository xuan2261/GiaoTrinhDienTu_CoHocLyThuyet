---
phase: 5
title: "Repair Sim2 Route Behavior"
status: completed
priority: P1
dependencies: [4]
effort: "4-5 days"
---

# Phase 5: Repair Sim2 Route Behavior

## Overview

Repair all confirmed Sim2 route-level defects: unbounded drag, invalid viewport envelopes, misleading controls, frozen moving bodies, non-tangent belts, collision penetration/reset/state inconsistency, and stale predicted/readout state.

## Requirements

- Legal UI parameters never hide manipulated geometry or labels.
- Physical values stay canonical; clamp display vectors only when needed.
- Control labels match the actual controlled quantity.
- Dynamic objects never visually freeze while state continues changing.
- Collision transitions are tangent, conservative per `e`, consistent across 2D/3D, and reset exactly once.

## Architecture

Each route exposes a deterministic state transition protected by phase 2 oracles. Domain fixes use one of:

1. Analytically expanded `worldBox`.
2. Route-specific input clamp when outside states are physically/educationally meaningless.
3. Display-only vector scale/clamp while readout preserves canonical magnitude.
4. Camera/viewport envelope derived from full geometry plus label margin.

Collision uses a single transition function: integrate to first contact, resolve once, store immutable impact point/state, hold one exact tangent teaching frame, then continue fixed-step motion and reset on first complete exit.

## File Inventory

| Route/file | Confirmed work |
|---|---|
| `ch1-1-3.js`, `ch1-1-8.js`, `ch1-5-3.js` | Label/handle safe margins at extrema |
| `ch1-1-5.js`, `ch1-2-3.js` | Clamp drag to meaningful world/control domain |
| `ch1-3-2.js` | Fix anchor/world envelope at `α=75°` |
| `ch2-1-1.js` | Full projectile envelope; reset after full trajectory |
| `ch2-1-3.js` | Full osculating-circle envelope |
| `ch2-2-2.js` | Bound display vectors while preserving growing physical state |
| `ch2-3-2.js` | True common external belt tangents for unequal radii |
| `ch2-4-4.js` | Make `v_rel` slider semantics match instantaneous/source speed |
| `ch2-5-3.js` | Fit high-ω velocity field/sample vectors |
| `ch3-2-2.js` | Avoid frozen block with increasing velocity |
| `ch3-6-2.js` | Collision first contact, exit, reset, parameter consistency, fixed impact point |
| Create `tests/sim2-route-domain.spec.js` | Extremes/no-clip/semantic control matrix |
| Modify route physics/mount/visual tests | Numeric and lifecycle regressions |

No blanket edits to unaffected routes. Add a route only when RED test proves a defect.

## Function and Interface Checklist

- [x] Drag callbacks clamp before moving handle/readout.
- [x] Route-local display envelopes cover body, guides, arrows, labels, and osculating circles without unreadable global world-box expansion.
- [x] Display-vector clamp never changes canonical readout/Sim3 state.
- [x] Coriolis `v_rel,max` source and instantaneous `v_rel(t)` semantics are formula-consistent.
- [x] Belt tangent points satisfy radius perpendicularity and no line-circle penetration.
- [x] Newton-II body wraps through the display lane while canonical `x(t)` and `v(t)` continue increasing.
- [x] Collision parameter changes pause and reset live/predicted state together.
- [x] Collision impact point remains fixed and is forwarded to Sim3 with canonical radii.
- [x] Auto-reset returns before appending stale trail data.
- [x] Any fully exited body ends the cycle.

## Dependency Map

- Depends on fixed helpers, clock, and responsive shell from phases 2-4.
- Supplies canonical collision/radius state to Sim3 phase 10.
- Blocks strict visual capture and baseline triage in phase 11.

## Test Scenario Matrix

| Group | Scenarios | Acceptance |
|---|---|---|
| Drag | Inside, beyond each SVG edge, zero vector | Clamped, finite, visible |
| Static extrema | Every slider min/max | Bodies/labels inside root |
| Projectile | `v0/angle` corner combinations | Entire trajectory fits |
| Osculating circle | Ellipse extrema/quadrants | Circle + labels fit |
| Rotation vectors | Long playback/high parameters | Readout true, vector visible |
| Belt | Equal/unequal/min/max radii | Common tangents |
| Coriolis | Reset, inward/outward phase, slider extremes | `a=2ω×v`, label honest |
| Newton block | Long playback | Position/state story consistent |
| Collision | `e=0,0.7,1`, mass extrema | Tangency, momentum, restitution, energy |
| Collision reset | Exit, slider change, manual reset | One clean reset |

## Tests Before

1. Add rendered bounding-box assertions at all legal extrema.
2. Add geometric residual tests for belt tangent and osculating circle.
3. Add state/readout assertions reproducing Coriolis slider mismatch and Newton freeze.
4. Add collision RED tests for penetration, stale `e`, wrong exit predicate, moving impact point, and double reset/trail append.
5. Confirm current visual baseline failures are recorded but do not update snapshots.

## Refactor

1. Fix route domains in chapter order.
2. Introduce small route-local geometry helpers where formulas are specific.
3. Reuse canonical physics helpers for values.
4. Rewrite collision as an explicit state transition without changing public controls.
5. Forward canonical radii/impact data required by Sim3.

## Tests After

- Extreme keyboard and pointer states.
- Long-run playback and repeated resets.
- Synthetic negative/sign-changing state at pure helper boundaries.
- Narrow/mobile route checks from phase 4.
- Cross-check 2D readout and forwarded Sim3 state.

## Implementation Steps

1. Add RED route-domain test table.
2. Fix Ch1 drag/envelope routes and run Ch1 contracts.
3. Fix Ch2 envelope, vector, belt, and Coriolis routes.
4. Fix Newton-II visual lifecycle.
5. Fix collision transition and Sim3 bridge.
6. Run all 25 contracts plus responsive/mount suites.
7. Capture actual images for review only; do not approve baselines yet.

## Regression Gate

```powershell
npx playwright test tests/sim2-route-domain.spec.js tests/sim2-route-physics.spec.js
npx playwright test tests/sim2-ch1-mount.spec.js tests/sim2-ch2-mount.spec.js tests/sim2-ch3-mount.spec.js
npm run test:sim:physics
npm run test:sim:mount
npm run test:sim3:pilot
```

## Success Criteria

- [x] Every confirmed route defect has a reproducing route-domain or existing regression contract that passes after remediation.
- [x] No tested legal state clips essential geometry, controls, or labels.
- [x] Belt/Coriolis/Newton/collision visual stories match canonical physics readouts.
- [x] Collision helper and mounted-route invariants pass for elastic, inelastic, and default restitution contracts.
- [x] Sim3 bridge receives fixed impact point and canonical radii; contact residual is independently asserted.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Expanding world box makes scene unreadably small | Prefer input/display clamp when pedagogically valid; capture review |
| Display clamps hide physical magnitude | Keep readout/state canonical and label scale policy |
| Collision tunneling at large `dt` | Solve first contact within fixed step; test stall-bounded steps |
| Reset changes UX unexpectedly | Define pause/reset semantics in tests and observation text |

## Verification Evidence

- `npx playwright test tests/sim2-route-domain.spec.js`: 10 passed.
- `npx playwright test tests/sim2-route-physics.spec.js`: 26 passed.
- `npm run test:sim:mount`: 129 passed.
- `npm run test:sim3:pilot`: 19 passed.
- `npm run test:sim:release`: passed, including physics, 129 mount tests, app, content, and quiz gates.
- `node tests/sim2-visual-physics-regression.test.js`: passed.
- Independent fallback review found two medium visual/impact defects and one low observability gap; all three received failing regression contracts, source fixes, and green focused/full gates.
- Actual browser captures reviewed for projectile extrema, adaptive cable geometry, osculating-circle extrema, Coriolis maximum vectors, and physical tangent collision cue; no baselines approved.

## Security Considerations

No external input. Clamp numeric control/drag values before geometry calculations to prevent `NaN`, infinite attributes, or oversized DOM/canvas operations.

## Next Steps

Phase 6 establishes the right-handed Sim3 coordinate contract before any adapter geometry changes.
