# Phase 01 RED Baseline — TDD Foundation & Red Gates

Date: 2026-05-30 | Plan: 260530-1811-simulation-physics-theory-fidelity-fixes

## Helpers added (GREEN)
- `momentum2d(bodies)` → `js/sim-physics-dynamics.js` (signed 2D Σmᵢvᵢ). Unit test PASS.
- `resultant3D(forces)` → `js/sim-physics-statics.js` (full 3D vector sum + single magnitude). Unit test PASS.
- Both verified via `node tests/simulation-physics.test.js` → `simulation-physics: PASS`.

## Guards added (RED baseline as intended)

### 1. physics-source guard — `tests/sim-theory-fidelity-physics-source.test.js` (Node, vm)
RED at:
- `ch1-4-1`: derived lacks `forceComponents {Fx,Fy,Fz}` from `spatialForceComponents` (uses pixel hypot).
- `ch1-4-4`: derived lacks `ΣFx/ΣFy/ΣM` from `checkEquilibrium` + no `balancedState()` (residual fabricated `|spatialX-spatialY|/100`).
→ turns GREEN in Phase 02.

### 2. unit-label guard — `tests/sim-theory-fidelity.spec.js` (Playwright)
RED at (3, no m/s false positive):
- `ch1-4-2`: "MO" readout shows `°` (should be N·m). → Phase 04/07.
- `ch1-5-3`: "tan α" shows `°` (dimensionless ratio). → Phase 07.
- `ch1-6-3`: "S lỗ" (area) shows bare `m` (should be m²). → Phase 07.
Keyed by quantity (moment/tangent → no °, area → m², ω₀ → rad/s). `m/s`, `m/s²` never tripped.

### 3. empty-panel guard — `tests/sim-theory-fidelity.spec.js` (Playwright)
RED at 17 routes (orphan = `panel` rect containing a `dom*Suppressed` mark with no `barGraph` inside):
ch1-5-1, ch1-5-2, ch2-2-2, ch2-3-2, ch3-1-2, ch3-1-3, ch3-2-1, ch3-2-2, ch3-2-3, ch3-2-5, ch3-4-1, ch3-4-2, ch3-5-3, ch3-5-4, ch3-6-3.
Includes all 5 plan-named (ch3-5-3, ch3-2-2, ch2-2-2, ch2-3-2, ch3-6-3). Panels WITH barGraph (e.g. ch3-5-4 left energy panel, ch3-5-2 momentum bars) correctly NOT flagged. → Phase 08.

## Infra change (non-regressive)
- `js/sim-route-renderer-primitives.js` `panel()`: moved `mark('panel')` before the glassPanel early-return so the rect is always recorded for structural guards. Node suite (`test:sim:unit`) PASS, no baseline drift.
- `package.json`: added `test:sim:theory-fidelity` script (Node physics-source guard + Playwright spec).

## Deviations from plan
- Physics-source guard (Node) scopes ch1-4-1/ch1-4-4 (statics, load cleanly in vm). The ch2-4-4 `a_e` leak is lab-level (`sim-professional-lab.js`), covered by Phase 06 + browser checks rather than the Node vm guard.
- ch3-6-2 momentum px/frame→kg·m/s is dimension-conversion (Phase 05/07), not a key-level mislabel; the existing collision-momentum invariant already gates it. Unit-label guard intentionally not extended to momentum to avoid false positives.

## Open questions
None.
