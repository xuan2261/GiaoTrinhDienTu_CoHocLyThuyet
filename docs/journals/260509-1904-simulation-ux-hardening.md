---
title: "Simulation UX Hardening"
created: 2026-05-09
status: complete
plan: "../plans/260509-1820-decuong-style-58-simulation-ux-rebuild/plan.md"
---

# Simulation UX Hardening

## Context

Session chạy `/ck:cook plans/260509-1820-decuong-style-58-simulation-ux-rebuild/plan.md --auto --tdd`.
Plan scope lớn hơn session này; lần này tập trung khóa baseline UX, shared shell, interaction metadata, và một lỗi paused drag của `ch3-3-1`.

## What Happened

- Added active handle lifecycle metadata: `.sim-lab[data-active-handle-id]` set during drag, cleared on release, dispose, and `removeHandle`.
- Hardened `.sim-lab` CSS scope: readout selectors scoped under `.sim-lab`, formula overlay wraps on mobile.
- Guarded optional formula panel `setAttribute` in `SimLabUI.createLab()` for fake DOM runtime smoke.
- Fixed `ch3-3-1` derived energy so paused spring-mass drag updates `T/V` readout cards immediately.
- Hardened browser QA: representative direct drag now checks `.sim-info` and `.sim-readout-card`; added active-handle metadata test; renderer-contract route discovery filters canonical P1 routes.
- Synced docs and plan status without claiming full route-by-route rebuild complete.

## Validation

| Gate | Result |
|---|---|
| `npm run test:sim:unit` | PASS |
| `npm run test:sim:quality` | PASS |
| `npm run test:sim:visual-quality` | PASS, 4 passed + 3 skipped |
| `npm run test:sim:renderer-contract` | PASS |
| `npm run test:sim:release` | PASS |
| Runtime smoke 58 routes | PASS |
| Focused Playwright `@ux-baseline|@interaction-grammar` | PASS, 9 passed |

## Decisions

- Keep the plan `in-progress`: Phase 01 completed, but route-by-route Ch1/Ch2/Ch3 polish remains open.
- Treat `ch3-6-2` as valid collision representative because current manifest and scene registry define it as collision route.
- Do not commit: work context is not a git repository.

## Notes

- Tester and debugger subagents completed; both found no blocking runtime failures.
- Code-reviewer subagents were invoked twice but timed out; session proceeded with release gate evidence and local sanity review.

## Next

- Continue route-by-route polish for phases 04-09.
- Unskip/expand all-route browser tests only when route UX is stable enough to avoid brittle failures.
- Run commit workflow from the actual git repository root if this folder is later attached to git.
