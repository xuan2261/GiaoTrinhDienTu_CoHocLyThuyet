---
title: "Simulation Interaction & Visual Quality Hardening"
description: "Fix route-owned simulation interactions, visual clipping, duplicate registrations, and QA gates from browser audit."
status: completed
priority: P1
effort: 44h
branch: ""
tags: [bugfix, frontend, simulations, qa, visual, interaction]
blockedBy: []
blocks: [260507-1855-simulation-visual-ux-upgrade]
created: 2026-05-08
source: "ck:plan --hard"
---

# Simulation Interaction & Visual Quality Hardening

## Overview

Audit shows 58 simulation routes mount and tests pass, but user-facing quality fails. Main root cause: generic global handles in `js/sim-professional-lab.js` are detached from actual route state. This plan hardens interaction contracts, removes duplicate registrations, fixes clipped visuals, and adds strict visual QA.

## Evidence

- Audit report: [Simulation browser audit](../reports/260508-0846-simulation-browser-audit/report.md)
- Metrics: [all-route-runtime-summary.json](../reports/260508-0846-simulation-browser-audit/all-route-runtime-summary.json)
- Screenshots: [audit screenshots](../reports/260508-0846-simulation-browser-audit/screenshots/)
- Release gate: `npm run test:sim:release` passed; browser QA 268 passed / 1 skipped; visual-quality 69 passed.
- Related pending plan now blocked: [Simulation Visual & UX Upgrade](../260507-1855-simulation-visual-ux-upgrade/plan.md)

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Blocks | [Simulation Visual & UX Upgrade](../260507-1855-simulation-visual-ux-upgrade/plan.md) | pending | Visual polish must wait until route-owned interaction and QA gates are fixed. |

## Phases

| Phase | Name | Status | Gate |
|---|---|---|---|
| 1 | [Baseline Visual QA Harness](./phase-01-baseline-visual-qa-harness.md) | Complete | Reproduce audit issues deterministically |
| 2 | [Registry Deduplication](./phase-02-registry-deduplication.md) | Complete | Zero overwrite warnings |
| 3 | [Route-Owned Interaction Contract](./phase-03-route-owned-interaction-contract.md) | Complete | Handles come from behavior state |
| 4 | [Ch2 Kinematics Interaction Repair](./phase-04-ch2-kinematics-interaction-repair.md) | Complete | Ch2 handles aligned and animated |
| 5 | [Ch3 Dynamics Interaction Repair](./phase-05-ch3-dynamics-interaction-repair.md) | Complete | Ch3 objects/vectors interactive and bounded |
| 6 | [Ch1 Statics Visual & Drag Repair](./phase-06-ch1-statics-visual-drag-repair.md) | Complete | Static diagrams not clipped; drag is meaningful |
| 7 | [Strict Visual Quality Gates](./phase-07-strict-visual-quality-gates.md) | Complete | Edge/crop/detached-handle gates strict |
| 8 | [Localization Docs Release Validation](./phase-08-localization-docs-release-validation.md) | Complete | Full release QA + docs sync |

## Dependencies

- Keep app static/offline-first; no runtime bundler.
- Keep renderer/behavior contract: 58 route renderers and 58 behavior ids.
- Keep `js/pages.js` generated-only; no content fragment edits.
- Prefer small route-family modules; do not create duplicate "enhanced" variants.

## Success Criteria

- No `Simulation scene overwritten`, `Route renderer overwritten`, or `Route behavior overwritten` warnings.
- No Ch2/Ch3 route shows default detached `điểm kéo=(190; 255)` unless the visual object is actually there.
- Known clipped routes `ch1-2-3`, `ch1-2-6`, `ch2-1-1`, `ch3-5-3`, `ch3-6-2` pass edge-ink gate.
- Browser QA remains green: `npm run test:sim:browser`.
- Release QA green: `npm run test:sim:release`.

## Handoff

Implementation command after review:

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260508-0913-simulation-interaction-visual-quality-hardening\plan.md
```
