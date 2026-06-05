---
title: "Sim3 Visual Polish 8 Plus"
date: 2026-06-04
status: completed
---

# Sim3 Visual Polish 8 Plus

## Context

After the previous Sim3 polish pass, real screenshot review still showed camera/crop gaps, label clutter, and hierarchy issues across the six optional 3D pilot routes.

## What Happened

- Added TDD assertions for new visual metrics: label spacing, crop margin, clutter reduction, stronger Coriolis plane, radius contrast, `L` label attachment, ghost opacity, and collision vertical fill.
- Tuned route-specific camera targets, labels, vector scale, grid strength, ghost opacity, orbit/axis hierarchy, and collision host height.
- Updated visual capture output to the new plan and regenerated six final screenshots.

## Decisions

- Keep scope as visual polish only; no physics rewrite and no Sim2 default change.
- Keep improvements deterministic through debug metrics plus screenshot inspection.
- Do not update evergreen docs because public Sim3 contract/scope did not change.

## Validation

- `npm run test:sim3:pilot` passed.
- `npm run test:sim3:visual:capture` passed.
- `npm run test:sim:release` passed.
- Code review passed.

## Next

Future improvement should focus on a smarter label/leader-line system or larger route viewport, not more ad-hoc per-route offsets.
