---
title: "Compact Simulation Readout Cards"
description: "Make right-inspector readout cards denser by placing short label/value pairs on one row while preserving shared simulation shell contracts."
status: completed
priority: P2
effort: 10h
issue:
branch: master
tags: [refactor, frontend, simulations, ux, qa]
blockedBy: []
blocks: []
created: 2026-05-14
source: "ck:plan --hard"
---

# Compact Simulation Readout Cards

## Overview

Plan này giảm chiều cao readout trong `simulation-right-inspector-panel`: đổi card từ label/value luôn 2 dòng sang compact name-value khi đủ chỗ. Ưu tiên CSS-only trong shared `.sim-lab`, không đụng route renderer/behavior, không đổi runtime architecture.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Builds on | [Simulation Right Inspector Panel](../260513-2300-simulation-right-inspector-panel/plan.md) | completed | Đã đặt readouts ở cột phải và có QA responsive |
| Supports | [DeCuong-Style 58 Simulation UX Rebuild](../260509-1820-decuong-style-58-simulation-ux-rebuild/plan.md) | in-progress | Làm readout gọn hơn cho shared shell |
| Coordinates with | [Route-Specific Simulation Rebuild](../20260510-0516-route-specific-simulation-rebuild/plan.md) | pending | Không sửa route contracts; giảm rủi ro conflict |
| Coordinates with | [Ch2 DeCuong Interaction Upgrade](../260512-0544-ch2-decuong-interaction-upgrade/plan.md) | pending | Ch2 có nhiều readout động cần không drift/overflow |
| Coordinates with | [Ch3 DeCuong Interaction Upgrade](../260512-0544-ch3-decuong-interaction-upgrade/plan.md) | pending | Ch3 có readout năng lượng/xung lượng dài |

## Research And Reports

| Report | Purpose |
|---|---|
| [Scout Report](./reports/scout-report.md) | File, CSS, tests, constraints |
| [Research Synthesis](./research/research-synthesis.md) | Options and recommendation |
| [Red Team Review](./reports/red-team-review.md) | Risks and mitigations |
| [Validation Report](./reports/validation-report.md) | Acceptance criteria and gates |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 01 | [Baseline Density Audit](./phase-01-baseline-density-audit.md) | Complete | Current readout layout captured in baseline report |
| 02 | [TDD Compact Readout Layout Gates](./phase-02-tdd-compact-readout-layout-gates.md) | Complete | Tests failed before CSS change |
| 03 | [CSS-Only Compact Card Implementation](./phase-03-css-only-compact-card-implementation.md) | Complete | Label/value align one row where possible |
| 04 | [Responsive Overflow And Long Text Hardening](./phase-04-responsive-overflow-and-long-text-hardening.md) | Complete | Long labels/values wrap without horizontal overflow |
| 05 | [All-Route Regression And Visual QA](./phase-05-all-route-regression-and-visual-qa.md) | Complete | 58-route browser/visual gates pass |
| 06 | [Docs Changelog And Handoff](./phase-06-docs-changelog-and-handoff.md) | Complete | Docs updated, cook handoff ready |

## Dependencies

- Runtime: static `HTML/CSS/JS`, offline `file://`.
- Main touchpoint: `css/style.css`.
- Test touchpoints: `tests/simulation-browser.spec.js`, `tests/simulation-visual-quality.spec.js`, `tests/simulation-test-utils.js`.
- Docs: `docs/design-guidelines.md`, `docs/project-changelog.md`.

## Success Criteria

- Desktop right inspector shows compact readout cards with short label/value on one row.
- Card min-height is meaningfully lower than current 62px without hurting readability.
- Long Vietnamese labels and long physics values wrap, not overflow.
- Mobile `<=768px`, `<=560px`, and narrow `390px` keep stacked layout, no horizontal scroll.
- Existing readout DOM hooks, `data-readout-kind`, screen-reader status, route sync stay unchanged.
- Final gates pass: targeted Playwright, `npm run test:sim:browser`, `npm run test:sim:visual-quality`.

## Cook Handoff

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260514-compact-simulation-readout-cards\plan.md
```

## Unresolved Questions

- None. Recommended option is CSS-only compact `Label    Value` layout.
