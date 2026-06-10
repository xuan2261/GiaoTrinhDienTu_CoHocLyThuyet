---
title: "Sim2 Visual Pedagogy Fixes TDD"
date: 2026-06-09
status: completed
tags: [sim2, tdd, visual-quality, pedagogy]
---

# Sim2 Visual Pedagogy Fixes TDD

## Context

Executed `plans/260609-0830-sim2-visual-pedagogy-fixes-tdd/plan.md` after deep visual review found clipping, dead-space, and physics-pedagogy issues in six Sim2 routes.

## What Happened

- Added fail-first no-clip tests for `ch3-3-1`, `ch3-5-4`, and `ch3-2-3`.
- Reframed Ch3 world boxes so negative graph lobes, force labels, and body labels stay inside `.sim2-root`.
- Added directed moment arcs for `ch1-1-4` and `ch1-3-6`, using cross-product sign instead of absolute moment magnitude.
- Replaced the one-line friction cue in `ch1-5-3` with a 2D friction cone around the surface normal plus a vertical reaction vector `R`.
- Synced plan phase status and project changelog after verification.

## Decisions

- Keep changes visual/pedagogical only; do not touch physics ports or route contracts.
- Treat label pixel size as part of viewport design, not only world-coordinate math.
- Keep probe outside release gate for this plan because rowIndex regressions are a separate failure mode.
- Document two intentional deviations from plan: `ch3-2-3` widened to `±6` for `F_AB` label room, and `ch1-3-6` `maxY` raised to `3.6` for the max-load label.

## Validation

- `npm run test:sim:physics`: 9/9 pass.
- `npm run test:sim:mount`: 110 pass.
- `npm run test:sim:probe:unit`: 68 assertions pass.
- `npm run test:sim:probe`: 35/35 route pass.
- `npm run test:sim:visual:capture`: 25 pass, with manual inspection of the six affected routes.
- Committed as `8a8e83f` with message `fix(sim2): visual clipping, dead-space, and pedagogy fixes for 6 sims`.

## Next

No unresolved follow-up for this plan.
