---
title: "Sim2 Visual Motion Polish v1"
description: "Nang polish visual, motion clarity, affordance va feedback su pham cho 25 sim SVG-first ma khong rebuild engine hay sua physics."
status: complete
priority: P1
effort: 32h
issue:
branch: master
tags: [feature, frontend, simulation, visual-qa, tdd]
blockedBy: []
blocks: []
created: 2026-06-01
---

# Sim2 Visual Motion Polish v1

## Overview

Nang 25 mo phong `js/sim2/` theo huong PhET+ Premium nhe: motion ro hon, affordance keo/slider ro hon, feedback readout/formula song dong hon. Khong them dependency runtime. Khong sua `js/sim2/physics/*`. Khong rebuild route.

## Source Context

- `plans/reports/visual-review-260601-0822-sim2-25-quality-report.md`
- `plans/reports/260601-sim2-visual-quality-review.md`
- `plans/reports/diagnosis-brainstorm-260531-2238-sim2-visual-quality-rootcause-upgrade-report.md`
- `plans/260531-1657-sim2-pro-visual-ux-theory-upgrade/plan.md`
- `plans/260531-2122-sim2-visual-quality-eval-pipeline/plan.md`

## Cross-Plan Dependencies

| Relationship | Plan | Status |
|---|---|---|
| Context | [Sim2 Pro Visual UX Theory Upgrade](../260531-1657-sim2-pro-visual-ux-theory-upgrade/plan.md) | already applied in worktree |
| Context | [Sim2 Visual Quality Eval Pipeline](../260531-2122-sim2-visual-quality-eval-pipeline/plan.md) | completed/evidence source |

## Phases

| Phase | Name | Status |
|---|---|---|
| 00 | [Baseline And TDD Harness](./phase-00-baseline-and-tdd-harness.md) | Complete |
| 01 | [Shared Visual Motion Primitives](./phase-01-shared-visual-motion-primitives.md) | Complete |
| 02 | [Pilot Three Routes](./phase-02-pilot-three-routes.md) | Complete |
| 03 | [Chapter 1 Static Affordance Rollout](./phase-03-chapter1-static-affordance-rollout.md) | Complete |
| 04 | [Chapter 2 Motion Clarity Rollout](./phase-04-chapter2-motion-clarity-rollout.md) | Complete |
| 05 | [Chapter 3 Dynamics Clarity Rollout](./phase-05-chapter3-dynamics-clarity-rollout.md) | Complete |
| 06 | [Visual Capture Review And Baseline](./phase-06-visual-capture-review-and-baseline.md) | Complete |
| 07 | [Docs Release Gates](./phase-07-docs-release-gates.md) | Complete |

## Non-Negotiables

- Runtime stays offline `file://`; no runtime dependency, no bundler.
- Do not edit `js/sim2/physics/*`.
- Keep mount contract: `window.SIM_MAP[pageId] -> factory(container) -> { dispose }`.
- Shared-first: core/CSS before per-route tweaks.
- Every phase starts RED tests first, then implementation, then GREEN verify.

## Success Criteria

- `npm run test:sim:release` PASS.
- `npm run test:sim:visual:capture` PASS and refreshed contact-sheet shows before/after improvement.
- Pilot routes prove new effects without clutter: `ch1-1-3`, `ch2-4-4`, `ch3-6-2`.
- 25/25 routes keep panel, legend, readout, controls, dispose cleanup.
- Reduced-motion mode disables non-essential animation effects.

## Dependencies

- Existing Playwright visual pipeline under `tools/sim2-visual/`.
- Existing test fixtures `tests/fixtures/sim2-ch{1,2,3}.html`.
- Existing core modules: `sim-shell.js`, `svg-render.js`, `canvas-underlay.js`, `panel.js`, `controls.js`, `overlay.js`, `palette.js`.

## Cook Handoff

```powershell
/ck:cook --tdd C:\Work\GiaoTrinhDienTu_CoHocLyThuyet\plans\260601-2204-sim2-visual-motion-polish-v1\plan.md
```

## Unresolved Questions

- None.
