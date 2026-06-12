# 2026-06-12 — P2 visual polish + artifact policy

## Summary

Implemented the low-risk part of the interactive visual review recommendations. No physics, formulas,
readouts, route IDs, or mount contracts changed.

## Changes

- `ch2-4-4` Sim3 Coriolis sector cue is smaller and less saturated, reducing the peach-sweep artifact while preserving the perpendicular cue.
- Added Sim3 test guard for `planeCueOpacity`, `planeCueOuterRadius`, and `subtle-contained-sector` role.
- Kept `ch3-5-4` Sim2 unchanged because its previous `minY:-0.4` fix and no-clip guard already pass.
- Kept `ch3-2-3` Sim2 unchanged because lower space is label clearance for A/B labels; no-clip guard passes at F max.
- Documented visual artifact policy: PNG ignored, manifest/contact-sheet/report tracked, zip artifact for handoff if needed.

## Verification

- `npm run test:sim:visual:unit`
- `npm run test:sim3:visual:capture`
- `npx playwright test tests/sim3-pilot-fallback-dispose.spec.js`
- `node tests/sim2-visual-physics-regression.test.js`
- Focused no-clip tests for `ch3-5-4` and `ch3-2-3`
- `npm run test:sim:release`

## Unresolved Questions

- None.
