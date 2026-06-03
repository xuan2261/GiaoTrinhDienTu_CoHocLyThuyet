---
type: red-team-review
created: 2026-06-03
plan: 260603-2100-sim3-ch2-5-3-single-route-tdd-rollout
---

# Red Team Plan Review

## Summary

Plan is viable only if `ch2-5-3` 3D stays a classroom aid for planar velocity distribution, not a fake spatial rigid-body solver.

## Findings

| Severity | Finding | Mitigation |
|---|---|---|
| High | 3D can obscure the planar IC relation. | Keep plane visible, IC marker obvious, sample point M and radius guide primary. |
| High | Velocity field arrows can clutter fast. | Use sparse field or selected representative vectors; cap arrows; no dense 3D grid of arrows. |
| High | Hidden 3D updates could reappear when Sim2 field redraws on drag. | Contract test 2D/3D repeated toggle + dispose; rely on `mode === '3d'` forwarding guard. |
| Medium | Route is static/no playback; Sim3 shell RAF may run unnecessarily. | Plan must verify 2D switch stops RAF; adapter may render on state update only if core supports it later. No core refactor unless test proves leak. |
| Medium | IC drag state may not sync if Sim2 only updates canvas/DOM. | Add `sim3.setState()` call inside `render2()` with IC, sample point, omega, velocity vector, radius. |
| Medium | Visual capture path currently hardcoded to previous plan. | Update capture spec to current plan visuals or make output dir configurable. Keep dev-only. |
| Low | Naming can drift. | Use `ch2-5-3-3d.js`, export `root.Sim3Ch253`. |

## Recommendation

Proceed with 4 sequential phases. Stop after this one route and review visual artifact before planning `ch1-5-3` or `ch3-1-3`.

## Unresolved Questions

- None.
