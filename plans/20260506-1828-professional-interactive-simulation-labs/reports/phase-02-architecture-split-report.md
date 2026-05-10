# Phase 02 Architecture Split Report

Date: 2026-05-06
Status: Completed

## Summary

Phase 02 split simulation runtime wiring into shared kernels, chapter route registration modules, and a registry-backed compatibility map while preserving the existing `window.SIM_MAP` API for `loader.js`.

## Implemented

- Added shared simulation namespaces: `SimMath`, `SimRender`, `SimInteractions`, `SimLabUI`, `SimAssessment`, and `SIM_ROUTE_MANIFEST`.
- Added `SimRegistry` in `js/sim-core.js`.
- Moved route ownership to `js/sims/ch1/statics-routes.js`, `js/sims/ch2/kinematics-routes.js`, and `js/sims/ch3/dynamics-routes.js`.
- Rebuilt `js/simulations.js` as a compatibility adapter from registry entries to `window.SIM_MAP`.
- Updated `index.html` script order for deterministic static/file:// loading.
- Added runtime architecture tests and extended smoke gates to execute the real JS registry.

## Debug Fixes

- Runtime smoke now supports `--expect-runtime-routes 58`, executing scripts in Node VM and counting the actual built `window.SIM_MAP`.
- Runtime smoke discovers route modules from `js/sims/` and executes simulation scripts in the order declared by `index.html`.
- Runtime smoke now supports `--check-mount-rollback`, verifying failed mounts remove appended `.sim-container` nodes.
- Browser `@route-mount` tests now discover route modules recursively from `js/sims/` instead of hard-coding chapter files.
- `SimCore` scope tracks mounted containers and removes them during dispose/failure rollback.
- `simulations.js` preserves legacy cleanup compatibility for implementations returning either a function or an object with `dispose()`.

## Verification

Passed:

- `Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }`
- `node --check tests\simulation-browser.spec.js`
- `python -m compileall -q tools`
- `python tools\audit.py`
- `python tools\smoke_simulation_routes.py --require-p1`
- `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI --expect-runtime-routes 58 --check-mount-rollback`
- `python tools\audit_simulation_quality.py --max-js-lines 220 --allow-legacy-adapters`
- `python tools\test_simulation_qa_tools.py`
- `python tools\test_simulation_architecture.py`
- `npm run test:sim:unit`
- `npm run test:sim:quality`
- `npm run test:sim:browser:route-mount` (`58 passed`)

## Residual Notes

- `js/sim-statics.js`, `js/sim-kinematics.js`, and `js/sim-dynamics.js` remain large legacy adapters for behavior stability. Later phases can split topic implementations after visual/lab contracts settle.
- `js/sim-core.js` is above 220 lines and allowed by the quality gate as shared runtime core.

Unresolved questions: none.
