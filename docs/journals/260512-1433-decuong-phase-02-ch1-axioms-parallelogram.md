# DeCuong Phase 02 CH1 Axioms Parallelogram

## Summary

Phase 02 complete for `plans/260512-0845-decuong-simulation-full-rebuild`.

Rebuilt 4 CH1 routes:
- `ch1-2-3`: DeCuong-style parallelogram law with fixed `O`, draggable `F1`/`F2`, bounded resultant, fill/dashed sides, PI/7 arrows, handle dots, trail, KaTeX overlay, and synchronized `|F₁|`, `|F₂|`, `|R|`, `α`.
- `ch1-2-6`: FBD diagram with draggable force vector, matching initial force/readout, trail, reaction arrows, moment marker, and KaTeX equilibrium overlay.
- `ch1-3-1`: smooth support normal route with support alpha geometry, normal arrow, trail, and KaTeX overlay.
- `ch1-3-2`: cable tension route with load handle, rope/tension geometry, alpha-driven cable direction, trail, and KaTeX overlay.

## Review Fixes

- Fixed browser mount crash caused by `supportInfo('Chuẩn')` returning undefined.
- Synced `ch1-2-3` F1 drag with `state.force`, slider display, and readout.
- Made `ch1-3-1` / `ch1-3-2` alpha controls alter canvas geometry, not only readout text.
- Bounded parallelogram endpoints so the resultant stays inside the 760×440 canvas.
- Added Playwright regressions for F1 drag sync and support alpha geometry.

## Verification

- `npm run test:sim:unit` PASS.
- `python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-2-3 ch1-2-6 ch1-3-1 ch1-3-2 --require-routes 4` PASS.
- `python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-2-3 ch1-2-6 ch1-3-1 ch1-3-2 --require-routes 4` PASS.
- `python tools\audit_simulation_quality.py --all --max-js-lines 220` PASS.
- `npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch1-2-3|ch1-2-6|ch1-3"` PASS, 6 tests.
- `npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"` PASS, 2 tests across 58 routes.
- Final code review: no blockers.

## Next

Proceed to Phase 03 (`ch1-3-*`, `ch1-4-*`) or start parallel CH2 Phase 06 / CH3 Phase 10.
