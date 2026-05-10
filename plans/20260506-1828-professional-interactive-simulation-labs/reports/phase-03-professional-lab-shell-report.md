# Phase 03 Professional Lab Shell Report

Date: 2026-05-06; reviewer follow-up 2026-05-07
Status: Completed

## Summary

Phase 03 added a reusable professional simulation lab shell and converted 6 representative routes to prove scene-first layout, stable slots, lab metadata, and browser responsive gates.

## Implemented

- Expanded `SimLabUI.createLab` with scene, overlay, toolbar, legend, formula panel, status/readout, feedback panel, and checkpoint panel.
- Converted `ch1-1-5`, `ch1-5-3`, `ch2-1-1`, `ch2-5-2`, `ch3-3-1`, and `ch3-6-2` through `createLabShell` fallback adapters.
- Added `.sim-lab` scoped CSS only; legacy `.sim-container` routes keep current layout.
- Added manifest declarations with `labShell: true` for representative routes.
- Reworked `SimCore.createSimContainer` to build the container DOM safely without interpolating title through raw `innerHTML`.
- Reworked `SimCore.addSlider` to build label/input DOM safely without raw `innerHTML`.
- Added Playwright `@lab-shell` and `@responsive` assertions for lab slots, 375/768/1280 widths, and mobile-to-desktop resize.
- Hardened runtime QA: `--routes` now rejects unknown filters, fake DOM lab shell compatibility is covered, and collision double-click cancels the previous RAF chain.
- Tightened direct interaction metadata: generic canvas scene tokens no longer satisfy `--require-direct`; only direct routes are checked with that gate.

## Verification

Passed:

- `Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }`
- `node --check tests\simulation-browser.spec.js`
- `python -m compileall -q tools`
- `python tools\audit.py`
- `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI --expect-runtime-routes 58 --check-mount-rollback`
- `python tools\smoke_simulation_manifest.py --routes ch1-1-5,ch1-5-3,ch2-1-1,ch2-5-2,ch3-3-1,ch3-6-2 --require-objectives`
- `python tools\smoke_simulation_manifest.py --routes ch2-5-2,ch3-6-2 --require-direct`
- `python tools\audit_simulation_quality.py --require-lab-shell ch1-1-5,ch1-5-3,ch2-1-1,ch2-5-2,ch3-3-1,ch3-6-2`
- `python tools\smoke_simulation_runtime.py --routes ch1-1-5`
- `npm run test:sim:unit`
- `npm run test:sim:quality`
- `python tools\test_simulation_architecture.py`
- `python tools\test_simulation_qa_tools.py`
- `npx playwright test tests/simulation-browser.spec.js --grep lab-shell`
- `npx playwright test tests/simulation-browser.spec.js --grep responsive`
- `npx playwright test tests/simulation-browser.spec.js` (`80 passed`)

Expected negative probes:

- `python tools\smoke_simulation_runtime.py --routes not-a-route` fails with `Unknown route filter: not-a-route`.
- `python tools\smoke_simulation_manifest.py --routes ch1-1-5 --require-direct` fails because slider-only lab routes no longer false-pass direct interaction.

## Residual Notes

- Current phase intentionally converts 6 representative routes; later chapter phases apply shell and direct manipulation deeper per route group.
- Existing full page at 375px still has some non-lab horizontal overflow from textbook content; lab-specific elements do not overflow.

Unresolved questions: none.
