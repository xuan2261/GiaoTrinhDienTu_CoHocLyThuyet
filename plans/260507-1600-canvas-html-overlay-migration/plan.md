---
title: "Canvas & HTML Overlay Migration"
description: "Reuse the existing sim lab overlay to render all coordinate formulas with KaTeX and fully localize simulation UI to Vietnamese."
status: completed
priority: P1
effort: "24h"
branch: ""
tags: [simulation, frontend, localization, qa]
blockedBy: []
blocks: []
created: "2026-05-07T09:01:13.821Z"
createdBy: "ck-cli"
source: cli
---

# Canvas & HTML Overlay Migration

## Overview

Revised plan after debug/brainstorm review. The repo already has KaTeX local-first/CDN fallback and `.sim-lab-overlay`; this plan reuses that architecture, avoids a second overlay, and keeps offline-first behavior.

Goals:
- Render every coordinate formula in simulation scenes with KaTeX over the existing HTML overlay.
- Việt hóa 100% user-visible simulation UI terms, including `handle`, `readout`, `mode`, `drag`, `Vector`, `Route`, fallback labels, legends, and panel text.
- Preserve 58-route renderer/behavior contracts, assessment links, `file://` support, and current QA gates.

Non-goals:
- No new runtime bundler/framework.
- No CDN-first KaTeX change.
- No generic `sim-overlay` duplication in `sim-core.js`.

## Cross-Plan Dependencies

| Relationship | Plan | Status |
|---|---|---|
| Reference | [Debug + brainstorm plan review](./reports/260507-1627-debug-brainstorm-plan-review.md) | Done |

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Baseline & Overlay Architecture](./phase-01-phase-1-architecture-ui-setup.md) | Done |
| 2 | [Full UI Localization Inventory](./phase-02-phase-2-data-manifest-localization.md) | Done |
| 3 | [Chapter 1 Formula Overlay Migration](./phase-03-phase-3-chapter-1-statics-migration.md) | Done |
| 4 | [Chapter 2 & 3 Formula Overlay Migration](./phase-04-phase-4-chapter-2-3-migration.md) | Done |
| 5 | [58-Route Verification & Polish](./phase-05-phase-5-e2e-verification.md) | Done |

## Completion
Canvas HTML overlay migration done: reused `.sim-lab-overlay`, moved coordinate formulas to DOM/KaTeX, localized visible simulation UI to Vietnamese, fixed late KaTeX rerender/readout/title regressions, and expanded tests for all-route visible localization + late KaTeX.

## Validation
Passed: `npm run test:sim:unit`, `npm run test:sim:quality`, `npm run test:sim:semantic`, `npm run test:sim:renderer-contract`, `npm run test:sim:browser`, targeted overlay/localization/responsive checks, runtime smoke, `compileall tools`.

## Dependencies

- Existing `.sim-lab-overlay` from `js/sim-lab-ui.js`.
- Existing KaTeX local-first load in `index.html`.
- Current 58-route renderer/behavior/assessment QA must stay green.
- User decisions: UI terms fully Vietnamese; every coordinate formula uses KaTeX; revise this plan directly.
