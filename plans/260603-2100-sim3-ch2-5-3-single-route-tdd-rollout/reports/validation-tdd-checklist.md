---
type: validation
created: 2026-06-03
plan: 260603-2100-sim3-ch2-5-3-single-route-tdd-rollout
---

# Validation TDD Checklist

## Critical Questions

| Question | Answer |
|---|---|
| Does this modify canonical physics? | No. Sim3 consumes Sim2 state only. |
| Is Sim2 still default? | Yes. Toggle starts in 2D. |
| Is the scope one route? | Yes. Only `ch2-5-3` adapter/wiring/tests/docs. |
| Is full 25-route rollout excluded? | Yes. Explicit out of scope. |
| Is failure mode covered? | Yes. Existing forced WebGL/renderer failure tests stay; new route must fall back through same core path. |
| Is lifecycle covered? | Yes. Toggle repeat + dispose assertions for new route. |
| Is visual quality reviewable? | Yes. Add one screenshot artifact under this plan `visuals/`. |
| Is release gate preserved? | Yes. Run `npm run test:sim3:pilot`, `npm run test:sim3:visual:capture`, `npm run test:sim:release`. |

## Validation Result

Pass for planning. Implement test-first.

## Unresolved Questions

- None.
