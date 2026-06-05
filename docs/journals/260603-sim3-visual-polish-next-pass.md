---
title: "Sim3 Visual Polish Next Pass"
date: 2026-06-03
status: completed
---

# Sim3 Visual Polish Next Pass

## Context

After reviewing real Sim3 screenshots, the six optional Three.js pilot routes were usable but still visually uneven: crowded mechanisms, oversized vectors, weak Coriolis framing, flat depth cues, and collision capture before the strongest teaching moment.

## What Happened

- Added visual contracts for label overlap, route metrics, material opacity, reusable cylinder length, and after-impact capture.
- Polished six Sim3 routes through shared helper usage, route-specific composition changes, clearer material hierarchy, and better label offsets.
- Fixed review findings in `Sim3Primitives.material()` and `setCylinderBetween()` so actual rendering matches visual metrics.
- Regenerated baseline/final visual artifacts under the plan directory.

## Decisions

- Keep this as a precise Sim3 pilot polish pass, not a photorealistic or full-route rollout.
- Preserve Sim2 as default/canonical and keep Sim3 optional.
- Keep final QA grounded in deterministic tests plus plan-scoped screenshot review.

## Validation

- `npm run test:sim3:pilot` passed.
- `npm run test:sim3:visual:capture` passed.
- `npm run test:sim:release` passed.
- Code review passed after the primitives fixes.

## Next

No immediate follow-up required. Future Sim3 work should start from the remaining subjective polish gap, not from lifecycle/fallback concerns.
