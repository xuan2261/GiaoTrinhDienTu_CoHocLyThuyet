# 260512-1621 DeCuong Phase 04 CH1 Friction Centroid Exercises

## Summary
- Rebuilt 8 CH1 Phase 04 routes: `ch1-5-1` to `ch1-5-4`, `ch1-6-2`, `ch1-6-3`, `ch1-7-1`, `ch1-7-2`.
- Added route-specific friction, centroid, and solver derived models with synchronized readouts and route-owned handles.
- Added semantic Playwright regressions for Phase 04 drag/readout and self-locking geometry behavior.

## Implementation Notes
- Friction routes now expose `N`, `Fms`, `mu N`, `tan alpha`, `phi`, and `lockState` through behavior-derived state.
- Centroid routes now update `xG/yG` from route semantics, including direct G drag for composite areas and subtractive-area shift for holes.
- Solver routes now show guided equilibrium steps and numeric residual checking using the same load position/force state as the canvas.

## Verification
- `npm run test:sim:unit`
- `python tools\smoke_simulation_manifest.py --routes ch1-5 ch1-6 ch1-7 --require-routes 8 --require-objectives --require-direct`
- `python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-5 ch1-6 ch1-7 --require-routes 8`
- `python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-5 ch1-6 ch1-7 --require-routes 8`
- `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup`
- `npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch1-5-4 self-locking|Phase 04 friction and centroid|direct-drag-audit"`
- `npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all|@renderer-contract|@scene-identity"`

## Review
- Initial code review found direct-drag/readout mismatches for `ch1-5-1` and `ch1-6-2`, plus `ch1-5-4` lock-state mismatch.
- Fixes landed and re-validation passed.
- Re-review confirmed blockers fixed; final test gap on `ch1-5-4` wedge-base geometry was covered by a handle-position assertion.

## Unresolved Questions
- None.
