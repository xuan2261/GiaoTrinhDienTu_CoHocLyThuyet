---
title: "Professional Interactive Simulation Labs"
description: "Refactor and upgrade all 58 existing mechanics simulations into maintainable professional visual labs with direct interaction and pedagogy/assessment gates."
status: completed
priority: P1
effort: 132h
issue:
branch: none
tags: [feature, frontend, simulations, assessment, qa, tech-debt]
blockedBy: []
blocks: []
created: 2026-05-06
---

# Professional Interactive Simulation Labs

## Overview

Đã hoàn tất upgrade toàn bộ 58 route simulation hiện có từ mức minh họa tham số thành professional interactive labs. Mục tiêu kép: pro visual + pro pedagogy/assessment. Không thêm backend. Runtime app vẫn chạy `file://`. Chấp nhận tăng số JS files trong `index.html` để đổi lấy maintainability. Progress: 12/12 phases completed; 58/58 routes verified.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Related | [Local Math OCR Semantic Math Strict Publish](../20260505-2044-local-math-ocr-semantic-math-strict-publish/plan.md) | In Progress | Scope chính đã strict pass; trước release cuối cần reconcile plan status/release package. |
| Builds on | [Interactive Mechanics Simulation Expansion](../20260506-1045-interactive-mechanics-simulation-expansion/plan.md) | Completed | New plan preserves 58-route P1 behavior, then upgrades architecture/UX/assessment. |

## Research & Reports

| Report | Purpose |
|---|---|
| [Research Synthesis](./research/research-synthesis.md) | Consolidate previous research + new hard-mode decisions |
| [Scout Report](./reports/scout-report.md) | Current files, metrics, constraints |
| [Red Team Review](./reports/red-team-review.md) | Failure modes and mitigations |
| [Validation Report](./reports/validation-report.md) | Decisions confirmed from user answers |
| [Phase 02 Architecture Split Report](./reports/phase-02-architecture-split-report.md) | Registry split, runtime gates, and verification summary |
| [Phase 03 Professional Lab Shell Report](./reports/phase-03-professional-lab-shell-report.md) | Lab shell slots, representative route conversion, and QA summary |
| [Phase 04-05 Interaction Assessment Report](./reports/phase-04-05-interaction-assessment-report.md) | Direct interaction kernel, assessment engine, manifest, and QA summary |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 1 | [Baseline, Metrics And QA Harness](./phase-01-baseline-metrics-and-qa-harness.md) | Completed | Existing gates pass + new manifest/browser QA scaffold |
| 2 | [Simulation Architecture Split](./phase-02-simulation-architecture-split.md) | Completed | 58 routes mount; executable registry + rollback gates pass |
| 3 | [Professional Lab Shell And Visual System](./phase-03-professional-lab-shell-and-visual-system.md) | Completed | Shared lab UI rendered across sample routes |
| 4 | [Direct Interaction Kernel](./phase-04-direct-interaction-kernel.md) | Completed | Pointer/touch drag tests pass on sample routes |
| 5 | [Pedagogy And Assessment Engine](./phase-05-pedagogy-and-assessment-engine.md) | Completed | Assessment state/versioning + route manifest pass |
| 6 | [Chapter 1 Force Fundamentals Labs](./phase-06-chapter-1-force-fundamentals-labs.md) | Completed | Ch1 force routes pro-upgraded and tested |
| 7 | [Chapter 1 Supports Friction Centroid Solvers](./phase-07-chapter-1-supports-friction-centroid-solvers.md) | Completed | Remaining Ch1 routes pro-upgraded and tested |
| 8 | [Chapter 2 Particle Rotation Transmission Labs](./phase-08-chapter-2-particle-rotation-transmission-labs.md) | Completed | Ch2 I-III routes pro-upgraded and tested |
| 9 | [Chapter 2 Relative Plane Motion Checkers](./phase-09-chapter-2-relative-plane-motion-checkers.md) | Completed | Ch2 IV-VII routes pro-upgraded and tested |
| 10 | [Chapter 3 Fundamentals Differential Labs](./phase-10-chapter-3-fundamentals-differential-labs.md) | Completed | Ch3 I-IV routes pro-upgraded and tested |
| 11 | [Chapter 3 Theorems Collision Solvers](./phase-11-chapter-3-theorems-collision-solvers.md) | Completed | Ch3 V-VII routes pro-upgraded and tested |
| 12 | [Full QA Docs And Release Handoff](./phase-12-full-qa-docs-and-release-handoff.md) | Completed | Full syntax/audit/unit/browser/visual docs pass |

## Key Decisions

- Keep static script-tag architecture; no runtime bundler.
- Allow dev-only Playwright/package tooling for persistent browser QA.
- Keep `window.SIM_MAP` compatibility; add metadata/manifest beside it.
- No hand-edit generated `chapters/` or `js/pages.js`.
- Every 58 route gets direct manipulation or direct on-scene interaction; sliders become precision fallback.

## Completion Note

- [Final QA Report](./reports/final-qa-report.md)

Unresolved questions: none.
