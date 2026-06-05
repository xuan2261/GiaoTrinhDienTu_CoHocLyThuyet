---
title: "Sim3 Visual Quality Upgrade"
date: 2026-06-03
tags: [sim3, threejs, visual-quality, tdd]
---

# Sim3 Visual Quality Upgrade

## Context

Executed the TDD plan `plans/260603-2145-sim3-visual-quality-upgrade-deep-tdd/plan.md` to raise the six-route optional Sim3 pilot visual quality while keeping Sim2 default.

## What Happened

- Added shared `Sim3VisualKit` for semantic colors, ghost materials, guide lines, shadows, and camera presets.
- Added a DOM label layer in `Sim3Shell` with projected 3D anchors and dispose cleanup.
- Added route labels/cues for `ch2-2-2`, `ch2-3-2`, `ch2-4-4`, `ch2-5-3`, `ch3-5-3`, and `ch3-6-2`.
- Strengthened `ch3-6-2` with before/impact/after labels, ghost bodies, trail lifecycle state, and reset-safe debug cues.
- Changed 3D→2D toggle to dispose Sim3 DOM instead of hiding it, preventing hidden canvas/label layers.

## Decisions

- Preserve Sim2 as canonical/default and keep Sim3 optional for the same six routes.
- Keep visual polish pedagogical: labels and cues map to existing panel terms.
- Avoid docs changes because public scope, commands, and contracts did not change.

## Validation

- `npm run test:sim3:pilot`: pass.
- `npm run test:sim3:visual:capture`: pass.
- `npm run test:sim:release`: pass.
- Code review final result: pass, no high-confidence actionable bugs.

## Next

No unresolved follow-up for this plan.
