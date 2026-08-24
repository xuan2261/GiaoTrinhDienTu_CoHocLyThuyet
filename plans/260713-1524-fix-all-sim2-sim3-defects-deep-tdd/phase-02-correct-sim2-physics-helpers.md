---
phase: 2
title: "Correct Sim2 Physics Helpers"
status: completed
priority: P1
dependencies: [1]
effort: "3-4 days"
---

# Phase 2: Correct Sim2 Physics Helpers

## Overview

Correct verified pure-helper defects and establish independent mounted-route physics tests for all 25 Sim2 routes. Route readouts gain stable semantic keys so tests never depend on row order or source-string matching.

## Context Links

- [Phase 1 contracts](./phase-01-freeze-simulation-contracts.md)
- `js/sim2/physics/{statics,kinematics,dynamics}.js`
- `tests/sim2-ch{1,2,3}-physics.test.js`
- `tests/sim2-visual-physics-regression.test.js`

## Requirements

- Correct `sliderCrankRodAngle`, `potentialEnergy`, and documented gear-ratio convention.
- Decide and test the currently ambiguous unused `tensionInCable` API before changing it; remove/deprecate instead of silently redefining parameters.
- Execute one control/state transition and independent numeric oracle for every Sim2 route.
- Keep displayed rounding separate from computation tolerance.

## Architecture

Mounted-route tests use:

```text
route descriptor -> fixture mount -> semantic control action
                 -> data-readout-key values / rendered geometry
                 -> independent helper or closed-form oracle
```

Tests may use canonical physics helpers where the route should delegate to them, but must independently verify wiring, signs, parameters, units, and displayed state.

## File Inventory

| Action | File group | Change | Test impact |
|---|---|---|---|
| Modify | `js/sim2/physics/kinematics.js` | Correct rod angle and gear-ratio contract | Pure tests |
| Modify | `js/sim2/physics/dynamics.js` | Preserve explicit `g=0` | Pure tests |
| Modify/decide | `js/sim2/physics/statics.js` | Define/deprecate unused cable helper | Pure tests |
| Modify | `js/sim2/core/panel.js` | Stable `data-readout-key` output | Route tests |
| Modify | `js/sim2/sims/ch1/*.js` | Add missing semantic keys; no physics duplication | 10 contracts |
| Modify | affected Ch2/Ch3 route files | Correct helper wiring/sign/readout exposed by RED | 15 contracts |
| Create | `tests/support/simulation-test-utils.js` | Mount, control, readout, numeric helpers | Shared browser tests |
| Create | `tests/sim2-route-physics.spec.js` | Manifest-driven 25-route scenarios | Replaces false confidence |
| Modify | `tests/sim2-physics-port.test.js`, chapter physics tests | Edge cases and corrected contracts | Fast gate |
| Modify | `tests/sim2-route-coverage.test.js` | Require executed contract result IDs | Coverage gate |

## Function and Interface Checklist

- [x] `sliderCrankRodAngle(r,L,theta) = asin((r/L)sin(theta))` for valid geometry.
- [x] Invalid slider-crank geometry returns a documented safe value/error consistently.
- [x] `potentialEnergy(m,0,h) === 0`; default gravity only when omitted.
- [x] Gear helper names and return ratio match formulas/readouts.
- [x] External gear sign applied explicitly; open belt sign remains same.
- [x] `Panel.setReadout()` emits stable keys and escapes text as before.
- [x] Every route reports finite values at min/max/zero/sign-changing inputs.
- [x] Route contract result includes actual executed ID.

## Dependency Map

- Requires phase 1 route descriptors.
- Blocks phase 3 timing and phase 5 route behavior, because those use the corrected oracles.
- Sim3 route phases consume canonical Sim2 state produced here.

## Test Scenario Matrix

| Area | Scenarios | Oracle |
|---|---|---|
| Rod angle | `θ=0, π/2, π`, `r=1,L=2`, limit `L=r` | Closed geometry |
| Potential energy | omitted `g`, `g=9.81`, `g=0`, negative `h` | `mgh` |
| Gear/belt | equal/unequal radii, sign | Tangential velocity equality |
| Ch1 10 routes | default + one drag/slider transition | Equilibrium/resultant/moment formulas |
| Ch2 7 routes | default + step/drag/slider | Kinematics/curvature/cross products |
| Ch3 8 routes | default + step/slider | Newton, impulse/work/energy/collision |
| Numeric safety | min/max/zero/near-singular | finite, no `NaN/Infinity` |

### Required route oracles

- Ch1: components/resultant/moment, support reactions, cable equilibrium, friction threshold, centroid.
- Ch2: projectile, tangent-normal curvature, fixed-axis rotation, signed gear/belt rates, Coriolis, instantaneous center, velocity field.
- Ch3: `F=ma`, action-reaction, inertial force, RK4 oscillator, impulse, angular momentum, work-energy, collision invariants.

## Tests Before

1. Add pure RED assertions reproducing `35.264° vs 30°` and `58.86 J vs 0`.
2. Add route-contract harness and semantic readout selectors.
3. Add all 25 scenario rows before route edits.
4. Confirm each RED fails at the expected helper/wiring/sign boundary.

## Refactor

1. Correct pure helpers with explicit defaults/domain guards.
2. Add semantic readout keys without changing presentation.
3. Make affected routes call canonical helpers rather than duplicate formulas.
4. Remove obsolete source-text physics coverage.
5. Keep route source changes minimal; visual/domain work remains phase 5.

## Tests After

- Add negative/zero/singular helper cases.
- Add control-transition assertions for each route.
- Add precision rules based on displayed decimals.
- Ensure contract table and executed results have exact set equality.

## Implementation Steps

1. Run existing pure tests.
2. Add RED helper tests.
3. Correct helpers and documentation comments.
4. Add semantic panel/readout contract.
5. Implement 25 route scenarios chapter by chapter.
6. Fix only confirmed physics/wiring failures.
7. Run chapter gate after each route batch, then full gate.

## Regression Gate

```powershell
node tests/sim2-physics-port.test.js
npx playwright test tests/sim2-route-physics.spec.js
npm run test:sim:physics
npm run test:sim:mount
```

## Success Criteria

- [x] Verified helper examples return exact expected values.
- [x] 25/25 mounted routes execute independent numeric contracts.
- [x] Every contract includes at least one state transition.
- [x] No comment/name grep counts as physics coverage.
- [x] No existing mount or offline behavior regression.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Correcting exported gear convention breaks hidden caller | Search all references; migrate atomically; add compatibility assertion |
| Test oracle repeats route implementation | Use closed forms/shared canonical helpers and explicit constants outside route source |
| Readout rounding causes flaky equality | Parse units, compare to precision-derived tolerance |
| Ambiguous cable API | Do not guess; document deprecation or define a new explicit signature only after tests |

## Security Considerations

No external input or network. Test helpers must select known manifest IDs and avoid evaluating arbitrary source.

## Next Steps

Phase 3 introduces a deterministic clock using these route-level oracles as behavior protection.
