# Tester Report - 260512 Phase 01 Final Validation

## Test Results Overview
- Scope under validation:
  - `js/sim-professional-lab.js`
  - `js/sims/ch1/ch1-force-law-scenes.js`
  - `js/sims/ch1/ch1-force-law-renderers.js`
  - `js/sims/ch1/ch1-force-law-behaviors.js`
- Gate results:
  - PASS `python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
  - PASS `python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
  - PASS `python tools\audit_simulation_quality.py --all --max-js-lines 220`
  - PASS `npm run test:sim:unit`
  - PASS `npx playwright test tests/simulation-interaction-engine.spec.js --grep "@direct-drag|@control-audit"`
  - PASS `npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"`
  - PASS `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup`
- Extra manual smoke:
  - PASS `ch1-2-1` initial state: `|F|:105N|Lệch:0px|Cân bằng:đúng|α:0°`
  - PASS `ch1-1-8` direct drag changed readoutSnapshot and updated point position
  - PASS `ch1-1-8` overlay inspection: no KaTeX nodes found in `.sim-lab-overlay`

## Coverage Metrics
- Not collected in this validation pass.
- Practical coverage achieved:
  - scene catalog strict validation
  - renderer contract strict validation
  - JS syntax check across all non-deprecated `js/**/*.js`
  - interaction regression coverage for direct drag, control audit, reset, touch, keyboard, and animation states
  - visual/theme coverage across all routes

## Failed Tests
- None.

## Performance Metrics
- `npm run test:sim:unit`: 7.6s
- `npx playwright test tests/simulation-interaction-engine.spec.js --grep "@direct-drag|@control-audit"`: 3.2m
- `npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"`: 51.7s
- `python tools\smoke_simulation_runtime.py ...`: 1.0s

## Build Status
- PASS for all requested validation commands.
- `python tools\audit_simulation_quality.py --all --max-js-lines 220` confirmed route files stay within the 220-line audit gate.

## Critical Issues
- None found.

## Recommendations
- Add an explicit regression assertion for `ch1-1-8` overlay text structure if this bug returns; current validation is runtime/manual, not a dedicated spec.
- Keep `ch1-2-1` angle-init and `ch1-1-8` direct-drag cases in the next focused browser regression batch.

## Next Steps
1. Merge this Phase 01 fix set if no further code changes are pending.
2. Keep the current targeted browser checks as the fast gate for future CH1 force-law changes.

## Unresolved Questions
- None.
