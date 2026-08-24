---
phase: 10
title: "Correct Sim3 Dynamics and Collision"
status: completed
priority: P1
dependencies: [7, 5]
effort: "3-4 days"
---

# Phase 10: Correct Sim3 Dynamics and Collision

## Overview

Correct the non-inertial pendulum, angular-momentum scene, and collision scene. Preserve constant geometry, signed axial quantities, canonical collision radii/contact, and synchronized reset/impact state from Sim2.

## File Inventory

| Route | File | Main correction |
|---|---|---|
| `ch3-1-3` | `js/sim3/sims/ch3-1-3-3d.js` | Constant cord length; inertial force opposite frame acceleration |
| `ch3-5-3` | `js/sim3/sims/ch3-5-3-3d.js` | Right-handed orbit; signed `L`; antipodal masses and constant radius |
| `ch3-6-2` | `js/sim3/sims/ch3-6-2-3d.js` | Common collision lane; canonical radii/contact/impact; velocity signs |
| Verify/modify | `js/sim2/sims/ch3/ch3-6-2.js` | Forward radii/fixed impact state from phase 5 | Cross-engine bridge |
| Modify | `tests/sim3-route-physics.spec.js` | Dynamics/geometry oracles |
| Modify | `tests/sim3-pilot-fallback-dispose.spec.js` | Collision phase/reset compatibility |
| Modify | `tools/sim3-visual/pilot-capture.spec.js` | Before/impact/after/far captures |

## Requirements

- Pendulum pivot-bob distance equals fixed `L` for every acceleration.
- Inertial-force arrow equals `-m*aFrame`, including zero/negative synthetic states.
- Angular momentum direction follows signed scalar and right-hand rule.
- Collision centers share one lane; visible radii match canonical Sim2 radii with one scale.
- 3D contact/impact phase matches 2D exact transition and fixed impact point.

## Function and Interface Checklist

- [x] Bob position `pivot + L*(-sinθ,-cosθ,0)` or equivalent constant-length canonical state.
- [x] Cord endpoints exactly pivot/bob after every update.
- [x] True zero force hides/neutralizes arrow without fake positive stub.
- [x] `ch3-5-3` position/velocity follows +Y rotation under horizontal mapping.
- [x] `L` arrow sign and magnitude match state; `Iω=L`.
- [x] Collision z-lanes equal; no mass-dependent radii.
- [x] Contact at `distance = R1+R2`; no penetration.
- [x] Impact point divides center line by radius ratio and remains fixed.
- [x] Before/after velocity arrows follow signed state.
- [x] Reset clears ghosts/cue/phase exactly once.

## Dependency Map

- Requires Sim3 coordinate/core phases 6-7.
- Requires phase 5 collision state bridge.
- Blocks final visual/release phase.

## Test Scenario Matrix

| Route | Scenarios | Acceptance |
|---|---|---|
| `ch3-1-3` | `a=0`, default, max, synthetic negative | Constant L, force/deflection sign |
| `ch3-5-3` | radius min/max, positive/negative/zero L/ω, multiple φ | Antipodal/radius/sign/invariant |
| `ch3-6-2` | before/contact/after/reset, `e=0,0.7,1`, mass extrema | Lane/contact/radii/impact/state |
| All | narrow/DPR, repeated toggle/navigation | No crop/leak/error |

## Tests Before

1. Demonstrate current pendulum length varies with angle.
2. Demonstrate current angular orbit sign conflicts with +Y `L`.
3. Demonstrate current collision spheres have different z lanes and mass-scaled radii.
4. Add bridge assertion that Sim3 receives immutable impact point and canonical radii.

## Refactor

1. Correct pendulum geometry and signed force arrows.
2. Migrate angular momentum scene to horizontal mapping.
3. Replace collision lane/radii/impact geometry with canonical state.
4. Preserve visual distinction of mass via color/labels/readouts, not radius.
5. Keep adapter API and lifecycle contracts unchanged.

## Tests After

- Synthetic negative state not reachable through current slider.
- First-contact tolerance and no intersection.
- Parameter change/manual/auto reset parity.
- Repeated collision cycles and 2D/3D toggles.
- Ghost/live semantics and safe crop.

## Implementation Steps

1. Add RED route physics/geometry cases.
2. Fix pendulum and run sign/length matrix.
3. Fix angular momentum and run invariant matrix.
4. Fix collision adapter and bridge assertions.
5. Capture before/contact/after states.
6. Run full Sim3 and Sim2 collision regressions.

## Regression Gate

```powershell
npx playwright test tests/sim3-route-physics.spec.js --grep "ch3-1-3|ch3-5-3|ch3-6-2"
npx playwright test tests/sim3-pilot-fallback-dispose.spec.js
npx playwright test tests/sim2-route-physics.spec.js --grep "ch3-6-2"
npm run test:sim:release
```

## Success Criteria

- [x] Pendulum length and force signs are physically correct.
- [x] Angular momentum geometry follows right-hand rule and conserves `Iω`.
- [x] 2D/3D collision contact, radii, phase, impact point, and reset agree.
- [x] No lifecycle/fallback/responsive regression.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Fixing collision radii changes visual emphasis | Use labels/color, not geometry, to communicate mass |
| Synthetic negative cases unsupported by UI | Test adapter contract directly |
| Ghost cues become cluttered | Semantic capture and overlap checks before baseline approval |

## Security and Performance

Finite-state validation before mesh transforms. Reuse ghost/body meshes; avoid per-frame allocation.

## Next Steps

Phase 11 turns all correctness work into strict production, visual, probe, and release gates.
