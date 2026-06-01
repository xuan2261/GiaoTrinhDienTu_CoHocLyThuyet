# ch2-3-2 Transmission Visual Fix

---
date: 2026-06-01
type: journal
scope: sim2 ch2-3-2
---

## Context

User required `ch2-3-2` to show all three concepts in one route: bánh răng, đai, puli.

## What Changed

- Added a second visual tier for open belt + two pulleys while keeping the external gear pair.
- Split readout into `ω₂ bánh răng` and `ω₂ đai-puli`.
- Added semantic SVG classes for regression coverage: `.sim2-transmission-gear`, `.sim2-transmission-belt`, `.sim2-transmission-pulley`.
- Added Playwright regression test for route visual completeness.
- Updated changelog and visual triage artifact.

## Verification

- RED baseline: new test failed with 0 gear semantic elements.
- `npx playwright test tests/sim2-ch2-mount.spec.js -g "ch2-3-2" --reporter=line`: PASS, 3/3.
- `npm run test:sim:visual:capture`: PASS, 25/25.
- `npm run test:sim:release`: PASS.

## Decisions

- Kept one route, two visual tiers: gear pair above, belt-pulley pair below.
- Kept sliders `r₁`, `r₂` only; no new control mode. KISS.
- Did not change physics helpers; existing no-slip math already covers ratio and belt velocity.

## Next

- None required for this fix.
