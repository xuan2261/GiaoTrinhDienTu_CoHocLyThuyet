---
title: "Ch3 DeCuong Interaction Upgrade"
description: "Nâng cấp 18 mô phỏng Ch3 theo thao tác DeCuong, gồm active registry routes và legacy/pilot Ch3 reconciliation."
status: pending
priority: P1
effort: 56h
issue:
branch: master
tags: [feature, frontend, simulations, ux, qa, education]
blockedBy: []
blocks: [20260510-0516-route-specific-simulation-rebuild]
created: 2026-05-12
source: "ck:plan --hard"
---

# Ch3 DeCuong Interaction Upgrade

## Overview

Plan này nâng cấp Ch3 Động lực học theo kiểu thao tác trong `DeCuong_CoHocLyThuyet.html`: drag/play/pause rõ, readout tức thì, năng lượng/xung lượng/va chạm trực quan. Phạm vi gồm 18 active routes trong `js/sims/ch3/*` và legacy/pilot Ch3 trong `js/routes/*`.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Builds on | [Batch Simulation Conversion V2](../260510-1615-batch-simulation-conversion-v2/plan.md) | completed | Migration baseline |
| Builds on | [DeCuong-Style Simulation UX Refresh](../260511-2245-decuong-style-simulation-ux-refresh/plan.md) | done | Shared handles/readout shell already improved |
| Blocks | [Route-Specific Simulation Rebuild](../20260510-0516-route-specific-simulation-rebuild/plan.md) | pending | This is the Ch3 child execution plan |
| Can run after | [Ch2 DeCuong Interaction Upgrade](../260512-0544-ch2-decuong-interaction-upgrade/plan.md) | pending | Prefer shared animation grammar stabilized first |

## Research & Reports

| Report | Purpose |
|---|---|
| [Research Synthesis](./research/research-synthesis.md) | Approach, trade-offs, Ch3 pedagogy |
| [Scout Report](./reports/scout-report.md) | Files/routes/tests in Ch3 scope |
| [Red Team Review](./reports/red-team-review.md) | Hard-mode risks |
| [Validation Report](./reports/validation-report.md) | Locked user decisions |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 01 | [Baseline And Legacy Scope Audit](./phase-01-baseline-and-legacy-scope-audit.md) | Pending | Ch3 route + legacy matrix complete |
| 02 | [DeCuong Interaction Grammar For Ch3](./phase-02-decuong-interaction-grammar-for-ch3.md) | Pending | Dynamic drag/play semantics normalized |
| 03 | [Newton ODE And Forced Motion Polish](./phase-03-newton-ode-and-forced-motion-polish.md) | Pending | Newton/ODE/D'Alembert routes pass |
| 04 | [Theorems Collision Exercises And Pilot Reconcile](./phase-04-theorems-collision-exercises-and-pilot-reconcile.md) | Pending | Energy/collision/solver/pilot pass |
| 05 | [Ch3 QA Docs And Release Handoff](./phase-05-ch3-qa-docs-and-release-handoff.md) | Pending | Ch3 + full release gates clean |

## Dependencies

- Active runtime: `SimProfessionalLab`, `SimDynamics`, `SimRouteRenderers`, `SimRouteBehaviors`.
- Active Ch3 route count: 18.
- Legacy/pilot scope: deleted indexed `js/routes/ch3/*`, untracked `js/routes/phase-05-ch3-dynamics-all-routes.js`, untracked `js/routes/pilot-ch3-collision-solver.js`, deleted deprecated Ch3 pilot/bulk files.
- No framework, no bundler, no manual `js/pages.js` edits.

## Success Criteria

- 18/18 Ch3 routes feel like DeCuong-style dynamic labs.
- Animation/play/pause/reset lifecycle is deterministic.
- Energy/momentum/collision readouts are physically credible.
- `file://` and static server Ch3 route mount pass.

## Cook Handoff

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260512-0544-ch3-decuong-interaction-upgrade\plan.md
```

## Unresolved Questions

Không có. User đã chốt: include legacy/pilot, ưu tiên giống DeCuong về thao tác, chia theo Ch1/Ch2/Ch3.
