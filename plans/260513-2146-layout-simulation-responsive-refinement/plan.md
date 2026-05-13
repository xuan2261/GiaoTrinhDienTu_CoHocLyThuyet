---
title: "Layout Simulation Responsive Refinement"
description: "Nới riêng vùng simulation, giữ layout đọc hiện tại, và chỉnh nhẹ topbar responsive cho giáo trình điện tử offline."
status: completed
priority: P2
effort: 14h
branch: master
tags: [refactor, frontend, simulations, ux, qa]
blockedBy: []
blocks: []
created: 2026-05-13
---

# Layout Simulation Responsive Refinement

## Overview

Implement approved brainstorm direction B from [brainstorm report](../reports/brainstorm-260513-2146-layout-simulation-responsive.md): keep reading layout narrow, widen only simulation presentation, and reduce topbar crowding on tablet/mobile. No framework change. No simulation renderer/behavior changes.

## Cross-Plan Dependencies

| Relationship | Plan | Status |
|---|---|---|
| References | [Route-Specific Simulation Rebuild](../20260510-0516-route-specific-simulation-rebuild/plan.md) | Complete |
| References | [DeCuong-Style 58 Simulation UX Rebuild](../260509-1820-decuong-style-58-simulation-ux-rebuild/plan.md) | in-progress |

No blocking dependency. This plan scopes to shell/layout CSS and layout tests only.

## Phases

| Phase | Name | Status |
|---|---|---|
| 1 | [Baseline Responsive Audit](./phase-01-baseline-responsive-audit.md) | Complete |
| 2 | [TDD Layout Gates](./phase-02-tdd-layout-gates.md) | Complete |
| 3 | [Scoped Simulation Width](./phase-03-scoped-simulation-width.md) | Complete |
| 4 | [Topbar Responsive Refinement](./phase-04-topbar-responsive-refinement.md) | Complete |
| 5 | [Mobile Simulation Polish](./phase-05-mobile-simulation-polish.md) | Complete |
| 6 | [Docs And Changelog Sync](./phase-06-docs-and-changelog-sync.md) | Complete |
| 7 | [Release Verification And Review](./phase-07-release-verification-and-review.md) | Complete |

## Key Decisions

- Text content keeps current `content-area` max width.
- Simulation gets scoped wide layout through `.sim-container` / `.sim-lab` only.
- Canvas logical size stays `760x440`.
- Shared `.sim-lab` shell remains single source for 58 routes.
- Topbar changes are responsive CSS first; markup changes only if CSS cannot solve overlap.

## Dependencies

- Existing static app: `index.html`, `css/style.css`, `js/app.js`, `js/loader.js`.
- Existing QA: Playwright specs in `tests/`, Python smoke tools in `tools/`.
- Docs to sync: `docs/design-guidelines.md`, `docs/project-changelog.md`, optionally `layout_hientai.md`.

## Success Criteria

- Reading pages remain narrow and readable.
- Simulation pages use wider available desktop/tablet width without page horizontal scroll.
- Topbar does not overlap at `1366`, `768`, `390` viewport widths.
- Existing 58-route simulation gates pass.
- Evidence screenshots saved under this plan reports folder.

## Handoff

Recommended cook command:

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260513-2146-layout-simulation-responsive-refinement\plan.md
```
