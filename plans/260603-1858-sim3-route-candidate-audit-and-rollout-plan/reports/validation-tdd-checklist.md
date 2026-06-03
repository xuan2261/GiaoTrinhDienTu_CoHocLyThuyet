---
type: validation
plan: 260603-1858-sim3-route-candidate-audit-and-rollout-plan
created: 2026-06-03
---

# Validation TDD Checklist

## Summary

The plan is actionable. It has clear route scope, RED-GREEN-VERIFY sequence, fallback rules, and release gates.

## Critical Questions

| Question | Answer |
|---|---|
| Does plan preserve Sim2 as canonical default? | Yes. Every phase requires 2D default and fallback. |
| Does plan avoid physics duplication? | Yes. Sim3 adapters consume existing route state only. |
| Are tests written before implementation? | Yes. Each route phase starts with RED Playwright assertions. |
| Are failure modes covered? | Yes. WebGL fail, renderer fail, repeated toggle, dispose cleanup. |
| Is scope bounded? | Yes. Exactly 3 new routes. No full 25-route rollout, no ESM migration. |
| Are docs included? | Yes. README, system architecture, changelog in Phase 05. |
| Is visual QA included without overfitting release? | Yes. Capture is review evidence/dev-only. |

## Acceptance Checklist

- [x] `npm run test:sim3:pilot` covers 5 routes.
- [x] Forced WebGL fallback passes for representative ch2 and ch3 routes.
- [x] Repeated 2D/3D toggle creates max 1 canvas.
- [x] Route dispose removes Sim2 and Sim3 DOM.
- [x] `npm run test:sim3:visual:capture` produces artifacts for 5 routes.
- [x] `npm run test:sim:release` passes.
- [x] Manual browser QA report has no blocking issue.
- [x] README/docs/changelog match actual route list.

## Unresolved Questions

- None blocking.
