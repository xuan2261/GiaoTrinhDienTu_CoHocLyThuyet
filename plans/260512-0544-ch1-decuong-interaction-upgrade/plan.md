---
title: "Ch1 DeCuong Interaction Upgrade"
description: "Nâng cấp 25 mô phỏng Ch1 theo thao tác DeCuong, gồm active registry routes và legacy/pilot Ch1 reconciliation."
status: completed
priority: P1
effort: 52h
issue:
branch: master
tags: [feature, frontend, simulations, ux, qa, education]
blockedBy: []
blocks: [20260510-0516-route-specific-simulation-rebuild]
created: 2026-05-12
source: "ck:plan --hard"
---

# Ch1 DeCuong Interaction Upgrade

## Overview

Plan này nâng cấp Ch1 Tĩnh học theo kiểu thao tác trong `DeCuong_CoHocLyThuyet.html`: kéo trực tiếp, readout tức thì, hint rõ, reset dễ thấy. Phạm vi gồm 25 active routes trong `js/sims/ch1/*` và legacy/pilot Ch1 trong `js/routes/*`.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Builds on | [Batch Simulation Conversion V2](../260510-1615-batch-simulation-conversion-v2/plan.md) | completed | Migration baseline |
| Builds on | [DeCuong-Style Simulation UX Refresh](../260511-2245-decuong-style-simulation-ux-refresh/plan.md) | done | Shared handles/readout shell already improved |
| Blocks | [Route-Specific Simulation Rebuild](../20260510-0516-route-specific-simulation-rebuild/plan.md) | pending | This is the Ch1 child execution plan |

## Research & Reports

| Report | Purpose |
|---|---|
| [Research Synthesis](./research/research-synthesis.md) | Approach, trade-offs, Ch1 pedagogy |
| [Scout Report](./reports/scout-report.md) | Files/routes/tests in Ch1 scope |
| [Red Team Review](./reports/red-team-review.md) | Hard-mode risks |
| [Validation Report](./reports/validation-report.md) | Locked user decisions |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 01 | [Baseline And Legacy Scope Audit](./phase-01-baseline-and-legacy-scope-audit.md) | Completed | Ch1 route + legacy matrix complete |
| 02 | [DeCuong Interaction Grammar For Ch1](./phase-02-decuong-interaction-grammar-for-ch1.md) | Completed | All Ch1 routes expose direct thao tác |
| 03 | [Core Statics Visual And Behavior Polish](./phase-03-core-statics-visual-and-behavior-polish.md) | Completed | Force/moment/support/spatial routes pass |
| 04 | [Applied Statics And Pilot Reconcile](./phase-04-applied-statics-and-pilot-reconcile.md) | Completed | Friction/centroid/solver/pilot pass |
| 05 | [Ch1 QA Docs And Handoff](./phase-05-ch1-qa-docs-and-handoff.md) | Completed | Ch1 + global release gates clean |

## Dependencies

- Active runtime: `SimProfessionalLab`, `SimStatics`, `SimRouteRenderers`, `SimRouteBehaviors`.
- Active Ch1 route count: 25.
- Legacy/pilot scope: deleted indexed `js/routes/ch1/*`, deleted `js/deprecated/pilot-ch1-parallelogram.js`, untracked `js/routes/pilot-ch1-parallelogram.js`.
- No framework, no bundler, no manual `js/pages.js` edits.

## Success Criteria

- 25/25 Ch1 routes feel like DeCuong-style direct manipulation.
- No `legacy-primary` handle, missing renderer, legacy behavior, fallback scene.
- Ch1 readouts show physical values, not generic coordinates except where intentional.
- `file://` and static server Ch1 route mount pass.

## Cook Handoff

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260512-0544-ch1-decuong-interaction-upgrade\plan.md
```

## Unresolved Questions

Không có. User đã chốt: include legacy/pilot, ưu tiên giống DeCuong về thao tác, chia theo Ch1/Ch2/Ch3.
