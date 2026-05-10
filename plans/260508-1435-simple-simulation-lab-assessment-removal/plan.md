---
title: "Simple Simulation Lab, Clean Interaction, and Assessment Removal"
description: "Refactor 58 existing simulation routes to a simple DeCuong-like lab shell, remove visible round drag markers, and remove assessment/checkpoint runtime, storage, and QA gates."
status: completed
priority: P1
effort: 62h
issue:
branch: none
tags: [refactor, frontend, simulations, qa, tech-debt]
blockedBy: []
blocks: [260508-simulation-visual-overhaul-v2, 260507-1855-simulation-visual-ux-upgrade]
created: 2026-05-08
source: "ck:plan --hard"
---

# Simple Simulation Lab, Clean Interaction, and Assessment Removal

## Overview

Plan này chuyển 58 mô phỏng hiện có sang shell đơn giản giống tinh thần `DeCuong_CoHocLyThuyet.html`: canvas trung tâm, readout cards, controls rõ, hint ngắn. Đồng thời xóa hẳn assessment/checkpoint runtime, storage, test gate, và các marker kéo tròn/điểm đặt kéo generic đang phủ lên canvas. Không rewrite toàn bộ renderer/physics, không thêm framework, vẫn chạy `file://`.

## User Decisions

| Decision | Value |
|---|---|
| Scope | 58 simulation routes hiện có |
| Assessment | Xóa hẳn UI/runtime/storage/test gate |
| Approach | Giữ current engine, làm lại simple shell |
| Interaction visual | Không vẽ marker kéo tròn/điểm đặt kéo generic trên canvas |
| Animation/control | Route có animation phải có reset và play/pause rõ nếu đang chạy liên tục |

## Cross-Plan Dependencies

Blocks [Simulation Visual Overhaul V2](../260508-simulation-visual-overhaul-v2/plan.md) and [Simulation Visual & UX Upgrade](../260507-1855-simulation-visual-ux-upgrade/plan.md) until simple shell, clean interaction, and assessment removal are complete.

## Reports

| Report | Purpose |
|---|---|
| [Scout Report](./reports/scout-report.md) | Current code/files/evidence |
| [Brainstorm Synthesis](./reports/brainstorm-synthesis.md) | Approved direction and trade-offs |
| [Red Team Review](./reports/red-team-review.md) | Risks and mitigations |
| [Validation Report](./reports/validation-report.md) | Confirmed requirements |
| [Simple Shell Architecture Research](./research/simple-shell-architecture-research.md) | Recommended shell design |
| [Test Strategy Research](./research/test-strategy-research.md) | Phase and release QA strategy |

## Phases

| Phase | Name | Status | Effort |
|---|---|---|---|
| 01 | [Baseline and Contract Inventory](./phase-01-baseline-and-contract-inventory.md) | Done | 6h |
| 02 | [Remove Assessment Runtime and Storage](./phase-02-remove-assessment-runtime-and-storage.md) | Done | 8h |
| 03 | [Build Simple Lab Shell](./phase-03-build-simple-lab-shell.md) | Done | 10h |
| 04 | [Convert Readout to Cards](./phase-04-convert-readout-to-cards.md) | Done | 8h |
| 05 | [Align Controls and Interaction UX](./phase-05-align-controls-and-interaction-ux.md) | Done | 12h |
| 06 | [Rewrite QA Gates](./phase-06-rewrite-qa-gates.md) | Done | 12h |
| 07 | [Docs and Release Handoff](./phase-07-docs-and-release-handoff.md) | Done | 6h |

## Global Success Criteria

- 58/58 simulation routes mount.
- No visible `Điểm kiểm tra`, no `.sim-checkpoint-panel`.
- No runtime read/write of `chlyt_sim_assessment_v2`.
- `index.html` does not load `js/sim-assessment.js`.
- No visible generic circular drag handles, orange hit circles, or "điểm kéo/điểm điều khiển" labels rendered over the canvas.
- Direct manipulation, if kept, uses invisible hit targets tied to real scene objects/vectors; otherwise route state is controlled by sliders/buttons.
- Controls update visible readout cards on slider, button, reset, play/pause, pointer/touch, and keyboard paths.
- Animated routes advance smoothly with bounded canvas ink, finite state values, and pause/resume/reset behavior.
- Representative physics checks prove readouts/visual state match statics, kinematics, and dynamics helper formulas.
- QA scripts pass without assessment gates.
- Docs reflect new simple shell architecture.

## Unresolved Questions

None.
