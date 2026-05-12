# Tester Report - 260512 Phase 01 CH1 Core Force Routes

## Test Results Overview
- Changed files under validation:
  - `js/sims/ch1/ch1-force-law-scenes.js`
  - `js/sims/ch1/ch1-force-law-renderers.js`
  - `js/sims/ch1/ch1-force-law-behaviors.js`
- Gate results:
  - PASS `python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
  - PASS `python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 --require-routes 6`
  - PASS `npm run test:sim:unit`
  - FAIL/TIMEOUT `npx playwright test tests/simulation-interaction-engine.spec.js --grep "@direct-drag|@control-audit"`
  - PASS `npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"`
- Narrow diagnostics for the 6 Phase 01 routes:
  - PASS `npx playwright test tests/simulation-browser.spec.js --grep "file route mounts DeCuong lab (ch1-1-3|ch1-1-4|ch1-1-5|ch1-1-6|ch1-1-8|ch1-2-1) @route-mount"`
  - PASS `npx playwright test tests/simulation-interaction-engine.spec.js --grep "all Ch1 handles use physical DeCuong-style labels @direct-drag"`

## Coverage Metrics
- Not collected in this run.
- Practical coverage on the touched surface:
  - scene catalog strict check
  - renderer contract strict check
  - JS syntax check across all `js/**/*.js`
  - browser mount coverage for the 6 Phase 01 routes
  - visual/theme coverage across all routes

## Failed Tests
- `npx playwright test tests/simulation-interaction-engine.spec.js --grep "@direct-drag|@control-audit"`
- Result: timed out after 124s, no assertion failure captured.
- Scope is broad; suite exercises many routes and interaction paths beyond Phase 01.

## Performance Metrics
- `npm run test:sim:unit`: 7.5s
- `npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"`: 51.4s
- Narrow route-mount diagnostic: 5.5s for 6 routes
- Narrow direct-drag diagnostic: 6.8s

## Build Status
- PASS on all non-timeout validation gates run here.
- No build command was required or run.

## Critical Issues
- None on the validated Phase 01 surface.
- The only issue is the broad interaction Playwright command timing out, not a functional regression.

## Recommendations
- Keep the broad interaction suite as a periodic full gate, but use the narrower Phase 01 diagnostics for faster iteration.
- If the timeout repeats, split the interaction suite into route-group subsets instead of running the full `@direct-drag|@control-audit` set in one shot.

## Next Steps
1. Use the narrow browser diagnostics above for local Phase 01 iteration.
2. Re-run the broad interaction suite in a longer CI window if full regression coverage is required.

## Unresolved Questions
- None.
