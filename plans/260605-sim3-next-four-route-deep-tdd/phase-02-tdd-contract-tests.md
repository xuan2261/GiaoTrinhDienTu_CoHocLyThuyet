---
phase: 2
title: "TDD Contract Tests"
status: completed
priority: P1
effort: "5h"
dependencies: [1]
---

# Phase 02: TDD Contract Tests

## Overview

Write failing Playwright tests that lock Sim3 availability, state sync, fallback, and disposal for the four target routes.

## Requirements

- Functional: tests fail before adapters/wiring exist and pass after implementation.
- Non-functional: keep tests deterministic and avoid brittle visual pixel assertions.

## Architecture

Extend the existing Sim3 contract suite. Each route gets assertions for 2D default, 3D mount, labels, debug state, control sync, repeated toggle, and dispose cleanup.

## Related Code Files

- Modify: `tests/sim3-pilot-fallback-dispose.spec.js`
- Modify: `tests/fixtures/sim2-ch1.html`
- Modify: `tests/fixtures/sim2-ch2.html`
- Modify: `tests/fixtures/sim2-ch3.html`

## Implementation Steps

1. Add Sim3 core and new adapter script tags to Ch1 fixture; add new adapter tags to Ch2/Ch3 fixtures.
2. Add test for `ch1-5-3`: labels `β`, `φ`, `Nón ma sát`/state cue and debug `betaDeg`, `mu`, `phiDeg`, `slips`; assert `phiDeg≈atan(mu)` and `slips === betaDeg > phiDeg`.
3. Add test for `ch3-1-3`: labels `a`, `F*`, `θ` and debug `aFrame`, `thetaDeg`, `inertiaFx`; assert `theta≈atan(a/g)` and `inertiaFx≈-aFrame` for `m=1`.
4. Add test for `ch2-1-3`: labels `τ`, `n`, `R` and debug `tParam`, `radius`, tangent/normal values; assert tangent/normal unit length and radius finite/positive at default.
5. Add test for `ch1-1-5`: labels `F1`, `F2`, `R`, `Mo` and debug resultant/moment values; assert `Rx/Ry` equal sum of forces and `Mo` equals planar cross-sum.
6. Add route-specific state sync assertions: slider input for `ch1-5-3`/`ch3-1-3`, drag-handle movement for `ch2-1-3`/`ch1-1-5`.
7. Add missing-global negative check: temporarily remove each new `Sim3Ch*` global before mount and assert 2D route still works.
8. Add forced WebGL fallback coverage for all four new adapters.
9. Keep all existing six-route Sim3 tests intact.

## Success Criteria

- [x] Tests fail because new adapters/globals are absent.
- [x] Test names describe route behavior, not implementation detail only.
- [x] Numeric physics assertions fail if debug state drifts from Sim2 formulas.
- [x] Assertions include lifecycle cleanup.
- [x] No production source changed in this phase except fixture script references if required for RED.

## Risk Assessment

Risk: test grows too large. Mitigation: reuse helper functions and keep per-route assertions compact.
