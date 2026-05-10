# Test Report — 2026-05-09 — Focused Simulation Test Rewrite

## Test Results Overview
- **Scope**: 58 simulation routes, DeCuong shell, direct interactions, visual identity, release gate.
- **Browser**: 87 passed, 0 failed, 0 skipped.
- **Visual-quality**: 4 passed, 0 failed, 0 skipped.
- **Release**: PASS.

## Coverage Metrics
| Layer | Coverage | Status |
|---|---:|---|
| Manifest routes | 58/58 | PASS |
| P1 route smoke | 58/58 | PASS |
| Renderer registrations | 58/58 unique | PASS |
| Behavior registrations | 58/58 unique | PASS |
| Direct interactions | 58/58 declared + audited | PASS |

## Updated Suites
- `tests/simulation-browser.spec.js`: route mount, globals, script order, shell/theme, responsive, localization, static server.
- `tests/simulation-interaction-engine.spec.js`: active handle metadata, all-route drag/readout stability, 6 semantic drags, keyboard, reset, touch, play-pause.
- `tests/simulation-visual-quality.spec.js`: nonblank/bounded canvas, route-owned handles, renderer/behavior/scene identity, dark/light readability.
- `tests/simulation-test-utils.js`: shared real `file://` browser helpers sourced from `js/sim-route-manifest.js`.

## Removed Legacy Suites
- `tests/simulation-infrastructure-polish.spec.js`
- `tests/simulation-visual-v2-infra.spec.js`
- `tests/simulation-ch1-visual-upgrade.spec.js`
- `tests/simulation-ch2-visual-upgrade.spec.js`
- `tests/simulation-ch3-visual-upgrade.spec.js`

## Failed Tests
- None in final run.

## Build Status
- `npm run test:sim:unit`: PASS, 111 JS files syntax-checked.
- `npm run test:sim:quality`: PASS.
- `npm run test:sim:semantic`: PASS.
- `npm run test:sim:renderer-contract`: PASS.
- `npm run test:sim:visual-quality`: PASS.
- `npm run test:sim:browser`: PASS.
- `npm run test:sim:release`: PASS.

## Fixes From New Tests
- Keyboard nudge now redraws and updates readout because `SimProfessionalLab` focuses the registered wrapper handle.
- `ch3-5-4` and `ch3-6-3` no longer put Vietnamese prose into `domMath`, removing KaTeX warnings during route mount.

## Recommendations
1. Keep future route QA in the focused suites; do not reintroduce phase rollout specs.
2. Add new route-specific semantic checks only for physics behavior not covered by the 6 current representatives.

## Unresolved Questions
- Không có.
