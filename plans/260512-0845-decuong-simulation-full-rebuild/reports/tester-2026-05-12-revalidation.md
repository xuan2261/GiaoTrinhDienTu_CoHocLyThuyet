# Tester Report - 2026-05-12

Scope: re-validate final code after fixes for code-review findings on `ch2-1-3`, `ch2-5-3`, `ch2-7-1`, `ch2-7-2`.

## Test Results Overview

- `npm run test:sim:unit`: PASS
  - `node --check`: 100 JS files PASS
  - `tests/simulation-primitives.test.js`: PASS
  - `tests/simulation-physics.test.js`: PASS
  - `tests/simulation-runtime-regressions.test.js`: PASS
  - `tests/phase-08-tdd.test.js`: PASS
  - `tests/phase-09-12-tdd.test.js`: PASS
  - Duration: 6912 ms
- `python tools\smoke_simulation_scene_catalog.py --strict --routes ch2-1-3,ch2-5-3,ch2-7-1,ch2-7-2`: PASS
  - SIM_MAP routes: 58
  - Selected routes: 4
  - Scene signatures: 58
  - Duplicate scene signatures: none
  - Duration: 224 ms
- `python tools\smoke_simulation_renderer_contract.py --strict --routes ch2-1-3,ch2-5-3,ch2-7-1,ch2-7-2`: PASS
  - SIM_MAP routes: 4
  - Scene catalog routes: 58
  - Renderer registrations: 58
  - Behavior registrations: 58
  - Unique rendererId values: 4
  - Unique behaviorId values: 4
  - Family dispatch: no
  - Family renderer groups: 2
  - Duration: 271 ms
- `npx playwright test tests/simulation-browser.spec.js --grep "@localization"`: PASS
  - 1 test passed
  - Duration: 14.1 s

## Critical Issues

- None.

## Recommendations

- Keep `ch2-1-3`, `ch2-5-3`, `ch2-7-1`, `ch2-7-2` in unit coverage as regression guards.
- If another UI regression appears in CH2 drag/readout flows, add a route-specific Playwright test instead of widening the full browser suite.

## Unresolved Questions

- None.
