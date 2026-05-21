# Simulation Review 2026-05-19 — Priority Fixes

## Goal
Make `npm run test:sim:review-2026-05-19` exit 0. RED gate today: 1 Node test + 7 Playwright specs in `tests/sim-review-2026-05-19/`.

## RED Gate Sources
- Fixtures: `tests/sim-review-2026-05-19-fixtures.js`
- Node: `tests/sim-review-2026-05-19/physics-invariants.test.js`
- Specs: 7 in `tests/sim-review-2026-05-19/*.spec.js`
- Runner: `tools/run-sim-review-2026-05-19-tests.js` (already wired into `package.json`)

## Phase Index (TDD — RED → GREEN per category)

| # | Phase | Spec file | Routes | Status |
|---|-------|-----------|--------|--------|
| 01 | slider-unit-display | `slider-unit-display.spec.js` + physics ch1-3-2 | 13 | pending |
| 02 | empty-panel-hint | `empty-panel-hint.spec.js` (hint loop) | 11 | pending |
| 03 | autoplay-preview-mode | `empty-panel-hint.spec.js` (autoplay loop) | 2 | pending |
| 04 | decuong-shell-overlay | `decuong-shell-overlay.spec.js` | 3 | pending |
| 05 | label-collision-detector | `label-collision-detector.spec.js` | 15 | pending |
| 06 | coordinate-pixel-cleanup | `coordinate-pixel-cleanup.spec.js` + physics ch1-3-6,ch1-5-3 | 7 | pending |
| 07 | route-redesign-checks | `route-redesign-checks.spec.js` + physics ch3-5-2 | 7 | pending |

Cross-cut: `readout-unit-audit.spec.js` covers all 58 routes; gets pulled GREEN by phases 01, 06, 07.

## Critical Files (touch surface)
- `js/sim-readout-format.js` — unit inference (already exists)
- `js/sim-lab-ui.js` — overlay mount, hint binding
- `js/sim-scene-registry.js` — autoplay metadata schema
- `js/sims/ch1/`, `js/sims/ch2/`, `js/sims/ch3/` — per-route renderers/behaviors/scenes
- `js/sim-route-renderer-primitives.js` — shared marks API

## Constraints
- 200-line cap per file (see development-rules)
- 58-route invariants in `js/sim-route-manifest.js` must hold
- No new external requests; KaTeX local fallback OK
- Existing release gate `npm run test:sim:release` must still pass after all phases

## Workflow
1. RED baseline now (phase 01 entry).
2. Per phase: read spec → implement smallest fix → run that spec → next.
3. After all phases GREEN: full `npm run test:sim:review-2026-05-19` → if zero failures, finalize.
4. Then sanity: `npm run test:sim:unit` + the 4 specs touched.
