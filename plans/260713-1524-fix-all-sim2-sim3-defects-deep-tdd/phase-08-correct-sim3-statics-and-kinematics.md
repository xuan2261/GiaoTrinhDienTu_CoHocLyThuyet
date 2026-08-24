---
phase: 8
title: "Correct Sim3 Statics and Kinematics"
status: completed
priority: P1
dependencies: [7]
effort: "3-4 days"
---

# Phase 8: Correct Sim3 Statics and Kinematics

## Overview

Migrate four Sim3 adapters to the shared coordinate contract and correct their physical geometry: force-resultant/moment, friction cone/incline, tangent-normal curvature, and fixed-axis rotation.

## Requirements

- Route state remains sourced from canonical Sim2.
- Vector/axis signs satisfy independent cross-product tests.
- Friction cone half-angle and axis reflect `φ=atan(μ)` and contact normal.
- Fixed-axis disk, marker, orbit, ticks, axis, rotation, and velocity share one plane/axis.

## File Inventory

| Route | File | Main correction |
|---|---|---|
| `ch1-1-5` | `js/sim3/sims/ch1-1-5-3d.js` | Horizontal mapping; `r×F` moment sign; mapped resultant |
| `ch1-5-3` | `js/sim3/sims/ch1-5-3-3d.js` | Incline orientation/contact; variable-angle normal-aligned cone; downhill slip |
| `ch2-1-3` | `js/sim3/sims/ch2-1-3-3d.js` | Tangent/normal/circle in explicit horizontal plane |
| `ch2-2-2` | `js/sim3/sims/ch2-2-2-3d.js` | Disk/orbit/marker in XZ; axis/rotation about +Y; `v=ω×r` |
| Create | `tests/sim3-route-physics.spec.js` | Independent mesh/vector/geometry oracle |
| Modify | `tests/sim3-pilot-fallback-dispose.spec.js` | Preserve state/lifecycle compatibility |
| Modify | `tools/sim3-visual/pilot-capture.spec.js` | Correctness flags/captures for four routes |

## Function and Interface Checklist

- [x] Adapters call `Sim3Coordinates`, no manual source-y to `+z`.
- [x] World mesh/vector values are inspectable without trusting debug labels.
- [x] `ch1-1-5`: `sign((r×F)·axis) === sign(Mo)`.
- [x] `ch1-5-3`: tangent/normal orthogonal; block contacts plane; cone radius/height ratio equals `tan(phi)`.
- [x] `ch2-1-3`: tangent/normal unit and perpendicular; circle center/radius exact.
- [x] `ch2-2-2`: disk face normal parallel axis; marker remains on rim; velocity tangent and sign-correct.
- [x] Zero/negative synthetic states remain finite and meaningful.

## Dependency Map

- Requires phases 6-7.
- May run before phases 9-10 but all converge at phase 11.
- Existing Sim2 state oracles from phases 2/5 remain unchanged.

## Test Scenario Matrix

| Route | State matrix | Independent acceptance |
|---|---|---|
| `ch1-1-5` | default, positive/negative/zero moment, dragged force | Mapped sum and cross-product sign |
| `ch1-5-3` | `β=0`, below/equal/above `φ`, μ min/max | Cone angle/normal/contact/slip |
| `ch2-1-3` | four ellipse quadrants + drag extrema | Curvature geometry and safe crop |
| `ch2-2-2` | positive/negative/zero ω, multiple φ | Common axis/plane, tangent velocity |

## Tests Before

1. Add route-specific RED geometry assertions from actual object transforms.
2. Prove current fixed cone angle across two μ values.
3. Prove current disk, axis, and marker planes disagree.
4. Prove current horizontal mapping reverses at least one moment/velocity sign.

## Refactor

1. Migrate one adapter at a time to explicit plane mapping.
2. Rebuild friction cone geometry when `φ` changes or use non-uniform radius/height scaling that preserves exact angle.
3. Align incline objects with one tangent/normal basis.
4. Align fixed-axis disk primitives and apply rotation about axis.
5. Preserve public adapter `{host,setState,reset?,dispose}` and debug compatibility keys.

## Tests After

- Threshold transitions and negative synthetic state.
- Geometry resource disposal after cone rebuild.
- Narrow/DPR capture and label overlap.
- Repeated 2D/3D toggle for each route.

## Implementation Steps

1. Write RED tests for four routes.
2. Fix `ch1-1-5`; run filtered tests/capture.
3. Fix `ch1-5-3`; test μ/β threshold matrix.
4. Fix `ch2-1-3`; test all quadrants.
5. Fix `ch2-2-2`; test disk/axis/velocity.
6. Run core/pilot/Sim2 regressions.

## Regression Gate

```powershell
npx playwright test tests/sim3-route-physics.spec.js --grep "ch1-1-5|ch1-5-3|ch2-1-3|ch2-2-2"
npm run test:sim3:pilot
npm run test:sim:physics
npm run test:sim:mount
```

## Success Criteria

- [x] Four adapters satisfy independent sign/geometry contracts.
- [x] Friction cone visibly and numerically changes with μ.
- [x] Fixed-axis scene uses one coherent plane and axis.
- [x] No new lifecycle, crop, overlap, or fallback regression.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Rebuilding cone leaks geometry | Dispose replaced geometry immediately; lifecycle spy |
| Camera makes correct geometry appear wrong | Validate world transforms first, then capture/camera |
| Existing debug metric expectations break | Preserve old keys; add objective metrics separately |

## Security Considerations

Numeric state only. Validate finite values before creating/updating Three.js geometry.

## Next Steps

Phase 9 addresses the most complex transmission and rotating-frame geometry.
