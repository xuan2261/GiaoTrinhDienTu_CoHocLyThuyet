# 2026-05-14 - Compact Simulation Readout Cards

## Summary

Implemented CSS-only compact readout cards for shared `.sim-lab` simulations. Short label/value pairs now align on one row in the right inspector; long values wrap inside cards without changing route renderer, behavior, manifest, or readout DOM contracts.

## Changed

- `css/style.css`: `.sim-readout-card` now uses grid, lower `min-height`, bounded value column, and wrapping on label/value.
- `tests/simulation-browser.spec.js`: added compact readout layout metrics and Playwright gates for density, alignment, overflow, and narrow-value wrapping.
- `docs/design-guidelines.md` and `docs/project-changelog.md`: documented compact name-value readout rule and QA evidence.
- `plans/260514-compact-simulation-readout-cards/`: marked phases complete and added baseline/QA/PM reports.

## Verification

- Failing-first: compact readout test failed on old `display:flex`.
- `npx playwright test tests/simulation-browser.spec.js --grep "compact readout|right inspector|responsive"` PASS: 11 tests.
- `npm run test:sim:unit` PASS.
- `npm run test:sim:browser` PASS: 180 tests.
- `npm run test:sim:visual-quality` PASS: 4 tests.

## Follow-Up

- None.
