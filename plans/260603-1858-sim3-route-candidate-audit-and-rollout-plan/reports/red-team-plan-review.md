---
type: red-team-review
plan: 260603-1858-sim3-route-candidate-audit-and-rollout-plan
created: 2026-06-03
---

# Red Team Plan Review

## Summary

Plan is viable if Sim3 remains route-scoped and test-first. Biggest risks: vector clutter in `ch2-4-4`, silent lifecycle leaks, and scope creep into Three.js migration.

## Findings

| Severity | Finding | Mitigation |
|---|---|---|
| High | `ch2-4-4` can become unreadable with 3 vectors, rotating platform, bead, and trail. | Phase 03 limits scene to 3 vectors plus capped optional trail; no camera animation. |
| High | More 3D routes increase chance of RAF/renderer/material leaks during route switching. | Phase 01 and per-route phases require dispose tests for DOM/canvas/RAF/resources. |
| Medium | Gear teeth in `ch2-3-2` may distract from direction relation. | Phase 02 starts with marked cylinders; teeth optional only if readable. |
| Medium | `ch3-5-3` fast spin may be uncomfortable. | Phase 04 clamps visual omega and respects reduced-motion. |
| Medium | Updating Three.js UMD/ESM during rollout would expand scope. | Plan explicitly defers UMD migration. |
| Low | Visual capture may be mistaken as release gate. | Phase 05 marks capture as review evidence/dev-only unless separately approved. |

## Recommendations

- Keep adapters thin: state mapping + visual placement only.
- Add route to Sim3 tests before adapter exists.
- Reject any PR that recalculates canonical physics in `js/sim3/`.
- Stop after exactly 3 new routes; no stretch route in same batch.

## Unresolved Questions

- None blocking.
