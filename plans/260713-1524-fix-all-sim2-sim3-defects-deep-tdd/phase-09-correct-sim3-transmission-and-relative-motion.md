---
phase: 9
title: "Correct Sim3 Transmission and Relative Motion"
status: pending
priority: P1
dependencies: [7]
effort: "3-4 days"
---

# Phase 9: Correct Sim3 Transmission and Relative Motion

## Overview

Correct three Sim3 routes with coupled rotation geometry: gear/open-belt transmission, Coriolis motion, and instantaneous-center velocity field. Enforce shared right-handed mapping and independent tangent/cross-product invariants.

## File Inventory

| Route | File | Main correction |
|---|---|---|
| `ch2-3-2` | `js/sim3/sims/ch2-3-2-3d.js` | Shafts normal to faces; signed gear/pulley axes; true external tangent belt path |
| `ch2-4-4` | `js/sim3/sims/ch2-4-4-3d.js` | `aCor = 2ω×vRel` in mapped world coordinates |
| `ch2-5-3` | `js/sim3/sims/ch2-5-3-3d.js` | Field/sample arrows satisfy `v=ω×r`; zero at IC |
| Modify | `tests/sim3-route-physics.spec.js` | Independent geometry/sign cases |
| Modify | `tests/sim3-pilot-fallback-dispose.spec.js` | State/toggle compatibility |
| Modify | `tools/sim3-visual/pilot-capture.spec.js` | Default/far correctness flags |

## Requirements

- Wheel shafts parallel wheel normals.
- External gears rotate opposite; open pulleys rotate same direction.
- Unequal-radius belt uses common external tangents and connected wrap arcs.
- Coriolis vectors use mapped state and remain perpendicular with correct magnitude/sign.
- Every instantaneous-center field arrow uses its own `r` and vanishes at IC.

## Architecture

For open belt centers `C1,C2`, radii `r1,r2`, compute tangent normal from center distance and radius difference; derive four tangent points and wrap arcs. Tests independently verify:

- `(T-C)·spanDirection = 0`
- `|T-C| = r`
- straight spans do not intersect pulley interiors
- arc/span endpoints coincide

No physics is recomputed in adapters beyond visual geometric mapping.

## Function and Interface Checklist

- [ ] Gear and pulley face normals parallel shafts.
- [ ] Gear pitch circles meet at one contact without overlap/gap.
- [ ] Belt points form one closed continuous path.
- [ ] Belt markers follow path direction consistent with pulley tangent arrows.
- [ ] `worldACor == 2 * worldOmega × worldVRel`.
- [ ] `aCor·vRel == 0` within tolerance.
- [ ] Field arrow `v·r == 0`, `|v|=|ω||r|`.
- [ ] IC arrow hidden/zero; negative synthetic ω flips all directions.
- [ ] Geometry updates reuse or dispose replaced buffers.

## Dependency Map

- Requires coordinate/core phases 6-7.
- Uses corrected Sim2 gear/Coriolis/IC state from phases 2/5.
- Blocks visual/release phase 11.

## Test Scenario Matrix

| Route | Scenarios | Acceptance |
|---|---|---|
| `ch2-3-2` | equal/unequal radii, both slider extremes, multiple phases | Tangency, axis signs, continuous path |
| `ch2-4-4` | inward/outward vRel, ω/value extrema, synthetic negative ω | Cross product/perpendicular/magnitude |
| `ch2-5-3` | default/moved IC, ω extrema/negative/zero, sample at IC | Field invariant and zero handling |
| All | narrow/DPR, repeated toggle/dispose | Crop/lifecycle clean |

## Tests Before

1. Prove current shafts lie in wheel faces.
2. Prove current unequal-radius belt spans are not tangent and marker direction conflicts.
3. Prove current Coriolis mapping sign conflicts with displayed +Y ω.
4. Prove current IC field arrows conflict with world cross product.

## Refactor

1. Correct gear/pulley axes and belt tangent/wrap geometry.
2. Map all Coriolis source vectors via `Sim3Coordinates`.
3. Map IC/sample/field points and vectors through shared helper.
4. Use shared signed-arrow updater.
5. Preserve debug/state contracts; expose objective world vectors/points for tests.

## Tests After

- Belt continuity after dynamic radii changes.
- Resource disposal for replaced belt geometry.
- Negative/zero synthetic states.
- Label attachment to actual belt span, not pulley face.
- No duplicate render loop after dynamic Sim2 updates.

## Implementation Steps

1. Add RED transmission/Coriolis/IC assertions.
2. Fix transmission scene and run geometry matrix.
3. Fix Coriolis signs and vector semantics.
4. Fix IC field signs/zero behavior.
5. Capture default and far states.
6. Run all Sim3 core/pilot and Sim2 route contracts.

## Regression Gate

```powershell
npx playwright test tests/sim3-route-physics.spec.js --grep "ch2-3-2|ch2-4-4|ch2-5-3"
npm run test:sim3:pilot
npm run test:sim:physics
npm run test:sim:mount
```

## Success Criteria

- [ ] Transmission axes, belt tangency/path, and marker direction are physically coherent.
- [ ] Coriolis/IC vectors satisfy independent world cross-product tests.
- [ ] All three routes pass responsive, lifecycle, and visual semantic checks.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Belt formula degenerates for invalid radii/distance | UI-domain guard plus finite fallback; test extremes |
| Dynamic geometry leaks buffers | Reuse fixed segments or dispose prior geometry explicitly |
| Sign appears reversed due camera | Assert world-space vectors before screenshot review |

## Security and Performance

Bound geometry segment counts. Do not allocate new meshes per state update when transforms can be updated in place.

## Next Steps

Phase 10 corrects the three dynamics adapters and final collision bridge.
