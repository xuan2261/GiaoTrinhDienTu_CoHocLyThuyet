# Simulation Canvas Overlay Cleanup

Date: 2026-05-14

## Summary

Removed learner-facing formula/value DOM from the simulation canvas overlay across 58 routes. The canvas keeps physical geometry, handles, and short labels; formula context belongs to `.sim-formula-panel`; dynamic values belong to `.sim-readout-card`.

## Changes

- Added route-wide Playwright `@overlay-contract` gate.
- Added shared primitive guard: `domMath` marks suppressed calls and creates no `.sim-overlay-formula` by default.
- Added shared filtering for non-short `domLabel` and `domPanel` text, including dynamic status/progress/score text.
- Kept debug escape hatch: `window.SIM_ALLOW_CANVAS_FORMULA_OVERLAY === true`.
- Updated overlay-dependent tests to assert readout behavior.

## Verification

- `npm run test:sim:unit`: PASS.
- `npm run test:sim:semantic`: PASS.
- `npm run test:sim:visual-quality`: PASS, 4 tests.
- `npm run test:sim:browser`: PASS, 188 tests.
- `npm run test:sim:release`: PASS.

## Unresolved Questions

None.
