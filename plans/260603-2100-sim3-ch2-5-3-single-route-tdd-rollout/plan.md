---
title: "Sim3 ch2-5-3 Single Route TDD Rollout"
description: "Add one optional Sim3 3D adapter for `ch2-5-3` after the prior 5-route pilot, keeping Sim2 default and test-first rollout."
status: completed
priority: P1
effort: 8h
branch: master
tags: [feature, simulation, threejs, sim3, tdd]
blockedBy: []
blocks: []
created: 2026-06-03
---

# Sim3 ch2-5-3 Single Route TDD Rollout

## Overview

Mode: `/ck:plan --deep --tdd`.

Add exactly one optional Sim3 route for `ch2-5-3` (`Phân bố vận tốc điểm trên vật rắn`). This is a validation step after the prior 5-route Sim3 pilot, bringing the optional pilot scope to 6 routes after completion. Sim2 remains canonical/default; Sim3 stays route-scoped, fallback-safe, and offline.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Decision |
|---|---|---|---|
| Prerequisite context | [Sim3 Route Candidate Audit And Rollout Plan](../260603-1858-sim3-route-candidate-audit-and-rollout-plan/plan.md) | completed | Reuse prior pilot patterns. |
| Adjacent work | [Sim2 Pro Visual UX Theory Upgrade](../260531-1657-sim2-pro-visual-ux-theory-upgrade/plan.md) | pending | No blocker. Sim3 is optional layer only. |
| Adjacent work | [Sim2 Visual Quality Eval Pipeline](../260531-2122-sim2-visual-quality-eval-pipeline/plan.md) | unknown | No blocker. Visual capture remains dev-only. |

## Source Context

- Scout: [Scout Report](./reports/scout-report.md)
- Red-team: [Red Team Plan Review](./reports/red-team-plan-review.md)
- Validation: [Validation TDD Checklist](./reports/validation-tdd-checklist.md)
- Current Sim2 route: `js/sim2/sims/ch2/ch2-5-3.js`
- Sim3 core: `js/sim3/core/`
- Sim3 tests: `tests/sim3-pilot-fallback-dispose.spec.js`

## Phases

| Phase | Name | Status |
|---:|---|---|
| 01 | [RED Contract Tests](./phase-01-red-contract-tests.md) | Complete |
| 02 | [GREEN Adapter And Wiring](./phase-02-green-adapter-and-wiring.md) | Complete |
| 03 | [VERIFY Visual And Release Gates](./phase-03-verify-visual-and-release-gates.md) | Complete |
| 04 | [Docs And Plan Closeout](./phase-04-docs-and-plan-closeout.md) | Complete |

## Execution Strategy

Sequential TDD. Write failing tests first, implement smallest route adapter, verify with focused and release gates, then sync docs.

## File Ownership Matrix

| Phase | Owns Writes | Reads |
|---:|---|---|
| 01 | `tests/sim3-pilot-fallback-dispose.spec.js`, `tests/fixtures/sim2-ch2.html`, `tools/sim3-visual/pilot-capture.spec.js` | Sim3 core, current route adapters |
| 02 | `js/sim3/sims/ch2-5-3-3d.js`, `js/sim2/sims/ch2/ch2-5-3.js`, `index.html`, `tests/fixtures/sim2-ch2.html` | `js/sim3/core/*`, `js/sim3/sims/*` |
| 03 | visual artifact under `plans/260603-2100-sim3-ch2-5-3-single-route-tdd-rollout/visuals/` | all Sim3 tests and QA scripts |
| 04 | `README.md`, `docs/system-architecture.md`, `docs/design-guidelines.md`, `docs/project-roadmap.md`, `docs/project-changelog.md`, optional journal | implementation outputs |

## Success Criteria

- `ch2-5-3` exposes `2D | 3D` toggle and starts in 2D.
- 3D mode renders offline with one canvas and no CDN/bundler dependency.
- IC drag and `omega` slider update Sim3 debug state deterministically.
- 3D scene teaches `v_M = omega x r_{M/P}` without dense vector clutter.
- WebGL/renderer failures still fall back to 2D with Vietnamese message.
- Repeated 2D/3D toggles do not duplicate canvas.
- Dispose removes Sim3 host/canvas/toggle and leaves no page errors.
- `npm run test:sim3:pilot` passes.
- `npm run test:sim3:visual:capture` passes and captures `ch2-5-3`.
- `npm run test:sim:release` passes.

## Out Of Scope

- Any route except `ch2-5-3`.
- Full 25-route Sim3 rollout.
- Physics rewrite or new physics formula in `js/sim3/`.
- Three.js UMD to ESM migration.
- Runtime bundler/build step.
- Camera orbit controls or user-controlled 3D camera.

## Cook Handoff

Run after review:

```powershell
/ck:cook C:\Work\GiaoTrinhDienTu_CoHocLyThuyet\plans\260603-2100-sim3-ch2-5-3-single-route-tdd-rollout\plan.md
```

## Unresolved Questions

- None.
