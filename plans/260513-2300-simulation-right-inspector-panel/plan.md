---
title: "Simulation Right Inspector Panel"
description: "Move readouts, controls, formula, and hint into a right-side inspector beside the simulation viewport on wide screens while preserving the shared offline simulation shell."
status: completed
priority: P2
effort: 18h
issue:
branch: master
tags: [refactor, frontend, simulations, ux, qa]
blockedBy: []
blocks: []
created: 2026-05-13
---

# Simulation Right Inspector Panel

## Overview

Use the newly widened simulation area to place the inspector/context UI on the right of the main simulation viewport. Keep reading layout unchanged, keep `.sim-lab` shared for 58 routes, keep canvas logical size `760x440`, and keep mobile stacked.

## Decision

Accepted design: move **readouts + controls + formula + hint** to a right-side inspector on wide screens. This keeps the viewport cleaner and groups all changing values/context in one scannable area.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Builds on | [Layout Simulation Responsive Refinement](../260513-2146-layout-simulation-responsive-refinement/plan.md) | completed | Provides scoped wide `.sim-container.sim-lab` |
| References | [DeCuong-Style 58 Simulation UX Rebuild](../260509-1820-decuong-style-58-simulation-ux-rebuild/plan.md) | in-progress | Must preserve shared shell and 58-route UX contracts |
| References | [Route-Specific Simulation Rebuild](../20260510-0516-route-specific-simulation-rebuild/plan.md) | pending | Must not conflict with renderer/behavior route work |
| References | [Ch2 DeCuong Interaction Upgrade](../260512-0544-ch2-decuong-interaction-upgrade/plan.md) | pending | Layout must support Ch2 route controls/readouts |
| References | [Ch3 DeCuong Interaction Upgrade](../260512-0544-ch3-decuong-interaction-upgrade/plan.md) | pending | Layout must support Ch3 animated controls/readouts |

## Research And Reports

| Report | Purpose |
|---|---|
| [Codebase Scout Report](./reports/scout-report.md) | Current shell, CSS, tests, constraints |
| [UI UX Research Notes](./research/ui-ux-right-inspector-research.md) | Data-dense layout and accessibility recommendations |
| [Red Team Review](./reports/red-team-review.md) | Hard-mode risks and mitigations |
| [Validation Report](./reports/validation-report.md) | Locked decisions and acceptance criteria |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 01 | [Baseline And Layout Contract Audit](./phase-01-baseline-and-layout-contract-audit.md) | Completed | Baseline dimensions, DOM order, overflow evidence captured |
| 02 | [TDD Right Inspector Layout Gates](./phase-02-tdd-right-inspector-layout-gates.md) | Completed | Failing-first tests define desktop/tablet/mobile layout |
| 03 | [Shared Shell Grid Layout](./phase-03-shared-shell-grid-layout.md) | Completed | CSS-only right inspector works on wide screens |
| 04 | [Inspector Density And Control Ergonomics](./phase-04-inspector-density-and-control-ergonomics.md) | Completed | Readouts/controls/formula/hint scan well, touch targets preserved |
| 05 | [Responsive Fallback And Accessibility](./phase-05-responsive-fallback-and-accessibility.md) | Completed | Tablet/mobile stack, keyboard, focus, live regions verified |
| 06 | [All Route Browser And Visual QA](./phase-06-all-route-browser-and-visual-qa.md) | Completed | 58-route browser/visual gates clean |
| 07 | [Docs Changelog And Release Handoff](./phase-07-docs-changelog-and-release-handoff.md) | Completed | Docs synced, release gate recorded, cook handoff ready |

## Dependencies

- Runtime: static `HTML/CSS/JS`, offline `file://`.
- Shared shell: `js/sim-lab-ui.js`, `js/sim-professional-lab.js`, `css/style.css`.
- Existing tests: `tests/simulation-browser.spec.js`, `tests/simulation-visual-quality.spec.js`, `tests/simulation-test-utils.js`.
- Docs: `docs/design-guidelines.md`, `docs/system-architecture.md`, `docs/project-changelog.md`.

## Success Criteria

- Wide screens show canvas left, inspector right with readouts, controls, formula, hint.
- `<= 768px` does not force side panel; no horizontal page scroll.
- Canvas logical `760x440` and aspect ratio remain unchanged.
- 58 route mount/browser/visual-quality tests pass.
- No route renderer/behavior rewrite.

## Cook Handoff

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260513-2300-simulation-right-inspector-panel\plan.md
```

## Unresolved Questions

- None. User selected formula/hint in the right inspector.
