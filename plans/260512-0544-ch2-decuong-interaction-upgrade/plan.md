---
title: "Ch2 DeCuong Interaction Upgrade"
description: "Nâng cấp 15 mô phỏng Ch2 theo thao tác DeCuong, gồm active registry routes và legacy/pilot Ch2 reconciliation."
status: pending
priority: P1
effort: 44h
issue:
branch: master
tags: [feature, frontend, simulations, ux, qa, education]
blockedBy: []
blocks: [20260510-0516-route-specific-simulation-rebuild]
created: 2026-05-12
source: "ck:plan --hard"
---

# Ch2 DeCuong Interaction Upgrade

## Overview

Plan này nâng cấp Ch2 Động học theo kiểu thao tác trong `DeCuong_CoHocLyThuyet.html`: kéo con trỏ/quỹ đạo/cơ cấu trực tiếp, readout tức thì, animation dễ kiểm soát, graph/time cursor rõ. Phạm vi gồm 15 active routes trong `js/sims/ch2/*` và legacy/pilot Ch2 trong `js/routes/*`.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Builds on | [Batch Simulation Conversion V2](../260510-1615-batch-simulation-conversion-v2/plan.md) | completed | Migration baseline |
| Builds on | [DeCuong-Style Simulation UX Refresh](../260511-2245-decuong-style-simulation-ux-refresh/plan.md) | done | Shared handles/readout shell already improved |
| Blocks | [Route-Specific Simulation Rebuild](../20260510-0516-route-specific-simulation-rebuild/plan.md) | pending | This is the Ch2 child execution plan |
| Can run after | [Ch1 DeCuong Interaction Upgrade](../260512-0544-ch1-decuong-interaction-upgrade/plan.md) | pending | Prefer shared shell stabilization first |

## Research & Reports

| Report | Purpose |
|---|---|
| [Research Synthesis](./research/research-synthesis.md) | Approach, trade-offs, Ch2 pedagogy |
| [Scout Report](./reports/scout-report.md) | Files/routes/tests in Ch2 scope |
| [Red Team Review](./reports/red-team-review.md) | Hard-mode risks |
| [Validation Report](./reports/validation-report.md) | Locked user decisions |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 01 | [Baseline And Legacy Scope Audit](./phase-01-baseline-and-legacy-scope-audit.md) | Pending | Ch2 route + legacy matrix complete |
| 02 | [DeCuong Interaction Grammar For Ch2](./phase-02-decuong-interaction-grammar-for-ch2.md) | Pending | Motion controls and drag semantics normalized |
| 03 | [Particle Rotation And Transmission Polish](./phase-03-particle-rotation-and-transmission-polish.md) | Pending | Particle/graph/gear routes pass |
| 04 | [Relative Plane Motion And Pilot Reconcile](./phase-04-relative-plane-motion-and-pilot-reconcile.md) | Pending | Relative/plane/solver/pilot pass |
| 05 | [Ch2 QA Docs And Handoff](./phase-05-ch2-qa-docs-and-handoff.md) | Pending | Ch2 + global release gates clean |

## Dependencies

- Active runtime: `SimProfessionalLab`, `SimKinematics`, `SimRouteRenderers`, `SimRouteBehaviors`.
- Active Ch2 route count: 15.
- Legacy/pilot scope: deleted indexed `js/routes/ch2/*`, deleted `js/deprecated/pilot-ch2-particle-motion.js`, untracked `js/routes/pilot-ch2-particle-motion.js`.
- No framework, no bundler, no manual `js/pages.js` edits.

## Success Criteria

- 15/15 Ch2 routes feel like DeCuong-style direct manipulation.
- Motion routes expose time/play/drag without readout drift.
- Graph routes have clear time cursor and readable labels.
- `file://` and static server Ch2 route mount pass.

## Cook Handoff

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260512-0544-ch2-decuong-interaction-upgrade\plan.md
```

## Unresolved Questions

Không có. User đã chốt: include legacy/pilot, ưu tiên giống DeCuong về thao tác, chia theo Ch1/Ch2/Ch3.
