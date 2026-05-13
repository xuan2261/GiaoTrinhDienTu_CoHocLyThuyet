# Validation Report

## Summary

User requested hard-mode detailed plan. Previous brainstorm decisions interpreted as:

- Prefer shared-first premium upgrade.
- Prioritize physics correctness with UI polish attached to shared shell.
- Use 6 pilot routes:
  - `ch1-2-3`
  - `ch1-5-3`
  - `ch2-1-2`
  - `ch2-5-2`
  - `ch3-3-1`
  - `ch3-6-2`
- Do not implement yet.
- Plan must include phases and tests/verification for each phase.

## Validated Constraints

| Constraint | Status |
|---|---|
| Static offline runtime | Locked |
| No framework/bundler | Locked |
| Keep 58 route ids | Locked |
| Extend existing simulation architecture | Locked |
| Pilot before rollout | Locked |
| Per-phase tests | Locked |

## Plan Assumptions

- Existing `260512-0845-decuong-simulation-full-rebuild` is the real implementation baseline.
- Stale pending/in-progress plans are historical context, not blockers.
- User wants maximum detail now, implementation later via `/ck:cook`.

## Unresolved Questions

- None blocking plan creation.
