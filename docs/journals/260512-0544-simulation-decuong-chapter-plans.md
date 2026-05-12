---
created: 2026-05-12
type: journal
topic: simulation-decuong-chapter-plans
---

# Simulation DeCuong Chapter Plans

## Context

User requested `ck:plan --hard` after brainstorming simulation UX upgrade. User decisions locked:

- Include legacy/pilot `js/routes/*`.
- Prioritize DeCuong-style thao tác.
- Split into 3 plans by Ch1/Ch2/Ch3.

## What Changed

- Created 3 child plans:
  - `plans/260512-0544-ch1-decuong-interaction-upgrade/`
  - `plans/260512-0544-ch2-decuong-interaction-upgrade/`
  - `plans/260512-0544-ch3-decuong-interaction-upgrade/`
- Each plan has 5 phase files, research synthesis, scout report, red-team review, validation report.
- Updated `plans/20260510-0516-route-specific-simulation-rebuild/plan.md` so parent plan is blocked by the 3 child execution plans.

## Decisions

- Do not restart Matter.js/SVG rewrite. Current active runtime is `SimProfessionalLab` + `js/sims/ch*/`.
- Treat legacy/pilot files as audit/reconcile scope, not automatically active runtime.
- Gate every phase with route-filtered simulation tests plus browser/visual checks.

## Next

Start implementation with Ch1 plan, then Ch2, then Ch3.
