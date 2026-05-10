---
title: "DeCuong-Style 58 Simulation UX Rebuild"
description: "Rebuild UX, visual shell, and route-specific interactions for all 58 mechanics simulations while preserving the current registry engine and light/dark theme support."
status: in-progress
priority: P1
effort: 116h
issue:
branch: none
tags: [feature, frontend, simulations, ux, qa, education]
blockedBy: [20260510-0516-route-specific-simulation-rebuild]
blocks: []
created: 2026-05-09
source: "ck:plan --hard"
---

# DeCuong-Style 58 Simulation UX Rebuild

## Overview

Plan này rebuild UX/visual/interaction cho 58 simulation routes theo tinh thần `DeCuong_CoHocLyThuyet.html`: trực quan, dễ kéo, readout rõ, công thức sát canvas. Giữ engine hiện có: `SimProfessionalLab`, route scene/renderer/behavior registries, offline `file://`, no bundler.

## Session Sync

- Blocked 2026-05-10 for the remaining route-specific renderer/behavior polish. That scope is now tracked in [Route-Specific Simulation Rebuild](../20260510-0516-route-specific-simulation-rebuild/plan.md).
- Done: shared-first UX sweep xong; CSS chapter accents, touch-first controls/readout styling, shell a11y, semantic readout metadata, handle-action hints, control active metadata, browser assertions.
- Verified: `npm run test:sim:unit`; `npm run test:sim:quality`; `npm run test:sim:semantic`; `npm run test:sim:visual-quality`; `npm run test:sim:browser`; runtime smoke.
- Open: route-by-route Ch1/Ch2/Ch3 visual polish and all-route responsive/theme screenshot audit.

## User Decisions

| Decision | Value |
|---|---|
| Priority | Đẹp giống DeCuong trước và đúng vật lý/tương tác từng route trước |
| Theme | Giữ dark + light theme cho simulation |
| Approach | Hướng 2: route-by-route UX upgrade trên engine hiện có |
| Non-goal | Không full rewrite engine, không thêm framework, không phục hồi assessment/checkpoint |

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Builds on | [Simple Simulation Lab Debug Verification Hardening](../260508-1921-simple-simulation-lab-debug-verification-hardening/plan.md) | completed | Stable simple shell + release baseline |
| Builds on | [Simulation Engine Redesign](../260508-2106-simulation-redesign/plan.md) | completed | Current foundation layers already exist |
| Replaces intent of | [Simulation Visual & UX Upgrade](../260507-1855-simulation-visual-ux-upgrade/plan.md) | cancelled | New scope keeps current engine and user-confirmed DeCuong style |
| No blocker | [Local Math OCR Semantic Math Strict Publish](../20260505-2044-local-math-ocr-semantic-math-strict-publish/plan.md) | in-progress | Different output area; only release packaging may intersect later |

## Research & Reports

| Report | Purpose |
|---|---|
| [Research Synthesis](./research/research-synthesis.md) | Approved approach, DeCuong comparison, architecture decision |
| [Scout Report](./reports/scout-report.md) | Current files, tests, evidence, affected modules |
| [Concise Turn Plan](./reports/planner-260509-concise-shared-first-ux-sweep.md) | Shared-first execution slice for current turn; scope, gates, rollback |
| [Red Team Review](./reports/red-team-review.md) | Hard-mode risks and mitigations |
| [Validation Report](./reports/validation-report.md) | Locked user answers and acceptance interpretation |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 01 | [Baseline UX Audit And Test Gates](./phase-01-baseline-ux-audit-and-test-gates.md) | Completed | Baseline screenshots + current release gates locked |
| 02 | [Shared Lab Shell And Theme System](./phase-02-shared-lab-shell-and-theme-system.md) | Completed | Dark/light DeCuong shell hardening in place; route polish continues |
| 03 | [Interaction Grammar And Control Model](./phase-03-interaction-grammar-and-control-model.md) | In Progress | Drag/touch/keyboard/readout contract still being normalized |
| 04 | [Ch1 Force Laws Supports And Spatial Statics](./phase-04-ch1-force-laws-supports-and-spatial-statics.md) | Pending | 17 Ch1 core statics routes pass visual + physics checks |
| 05 | [Ch1 Friction Centroid And Solver Routes](./phase-05-ch1-friction-centroid-and-solver-routes.md) | Pending | 8 Ch1 applied routes pass interaction + numeric checks |
| 06 | [Ch2 Particle Graph Rotation And Transmission Routes](./phase-06-ch2-particle-graph-rotation-and-transmission-routes.md) | Pending | 6 Ch2 motion routes pass animation + control checks |
| 07 | [Ch2 Relative Motion And Plane Motion Routes](./phase-07-ch2-relative-motion-and-plane-motion-routes.md) | Pending | 9 Ch2 composition/plane routes pass vector checks |
| 08 | [Ch3 Newton ODE And Forced Motion Routes](./phase-08-ch3-newton-ode-and-forced-motion-routes.md) | In Progress | 10 Ch3 dynamics foundation routes under physics-check hardening |
| 09 | [Ch3 Theorems Collision And Exercises Routes](./phase-09-ch3-theorems-collision-and-exercises-routes.md) | Pending | 8 Ch3 theorem/collision routes pass conservation checks |
| 10 | [All-Route Polish Performance Docs And Release QA](./phase-10-all-route-polish-performance-docs-and-release-qa.md) | In Progress | Full 58-route release gate pass and docs sync recorded; all-route polish continues |

## Dependencies

- Current static runtime: `HTML/CSS/JS`, no bundler.
- Existing QA scripts in `package.json`.
- Existing 58-route manifest in `js/sim-route-manifest.js`.
- Existing screenshots from brainstorm: `test-results/brainstorm-simulation-redesign/`.

## Success Criteria

- 58/58 routes keep exact route ids and mount via `window.SIM_MAP`.
- Dark and light simulation themes readable, touch-friendly, no clipped main objects.
- Every route has meaningful direct manipulation or route-appropriate controls.
- Readout cards show user-facing physics values, not generic coordinates unless route needs them.
- Full `npm run test:sim:release` passes before handoff.

## Unresolved Questions

Không có. User đã duyệt priorities, theme requirement, và approach.
