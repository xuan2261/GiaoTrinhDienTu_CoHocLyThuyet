---
title: "Interactive Mechanics Simulation Expansion"
description: "Mở rộng giáo trình Cơ Học Lý Thuyết bằng simulation, visual, animation, activity checker, và QA offline-first theo từng chương/mục."
status: completed
priority: P1
effort: 96h
issue:
branch: none
tags: [feature, frontend, simulations, education, qa]
blockedBy: [20260505-2044-local-math-ocr-semantic-math-strict-publish]
blocks: []
created: 2026-05-06
---

# Interactive Mechanics Simulation Expansion

## Overview

Plan này biến lớp simulation hiện có thành bộ học tương tác bao phủ 3 chương: Tĩnh học, Động học, Động lực học. Scope: Canvas/SVG 2D/2.5D, activity checker, micro assessment, test/QA, docs. Không thêm backend. Không thêm framework nặng.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Blocked by | [Local Math OCR Semantic Math Strict Publish](../20260505-2044-local-math-ocr-semantic-math-strict-publish/plan.md) | Strict baseline complete | Semantic math strict publish baseline đã pass; release package/rollback còn theo dõi riêng. |

## Research & Reports

| Report | Purpose |
|---|---|
| [Offline Interaction Research](./research/researcher-01-offline-interaction-patterns.md) | Pattern simulation offline-first, Canvas/SVG, QA |
| [Mechanics Coverage Research](./research/researcher-02-mechanics-content-coverage.md) | Map tất cả chương/mục sang tương tác |
| [Simulation Coverage Matrix](./research/simulation-coverage-matrix.md) | Route-level backlog đầy đủ |
| [Codebase Scout Report](./reports/scout-report.md) | Runtime hiện có, constraints, test surface |
| [Red Team Review](./reports/red-team-review.md) | Rủi ro, objections, mitigations |
| [Validation Report](./reports/validation-report.md) | Câu hỏi xác nhận, quyết định mặc định |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 1 | [Baseline Coverage And QA Harness](./phase-01-baseline-coverage-and-qa-harness.md) | Complete | Current runtime syntax/audit pass |
| 2 | [Simulation Runtime Foundation](./phase-02-simulation-runtime-foundation.md) | Complete | Registry + helper modules pass syntax/smoke |
| 3 | [Chapter 1 Statics Core Interactions](./phase-03-chapter-1-statics-core-interactions.md) | Complete | Ch1 I-IV route smoke pass |
| 4 | [Chapter 1 Friction Centroid And Solver Labs](./phase-04-chapter-1-friction-centroid-and-solver-labs.md) | Complete | Ch1 V-VII route smoke pass |
| 5 | [Chapter 2 Particle Rigid Body And Transmission Labs](./phase-05-chapter-2-particle-rigid-body-and-transmission-labs.md) | Complete | Ch2 I-III route smoke pass |
| 6 | [Chapter 2 Composition Plane Motion And Fixed Point Labs](./phase-06-chapter-2-composition-plane-motion-and-fixed-point-labs.md) | Complete | Ch2 IV-VII route smoke pass |
| 7 | [Chapter 3 Dynamics Fundamentals And Differential Labs](./phase-07-chapter-3-dynamics-fundamentals-and-differential-labs.md) | Complete | Ch3 I-IV route smoke pass |
| 8 | [Chapter 3 Theorems Energy And Collision Labs](./phase-08-chapter-3-theorems-energy-and-collision-labs.md) | Complete | Ch3 V-VII route smoke pass |
| 9 | [Assessment Activity Data And Exercise Checkers](./phase-09-assessment-activity-data-and-exercise-checkers.md) | Complete | Activity scoring/localStorage pass |
| 10 | [Full QA Docs And Release Handoff](./phase-10-full-qa-docs-and-release-handoff.md) | Complete | Full audit + browser/file QA pass |

## Dependencies

- Existing app: `index.html`, `js/loader.js`, `js/simulations.js`, `css/style.css`, `data/quiz-ch*.json`.
- Existing constraints: `file://` works, no package manager, DOCX remains text source of truth, `js/pages.js` generated.
- Preferred tech: Canvas 2D + SVG overlays, plain JS modules loaded by script tags, no runtime network.

## Execution Strategy

Sequential. Phase 2 creates runtime foundation. Phases 3-8 add content by chapter blocks. Phase 9 adds shared scoring/checker layer. Phase 10 validates whole release. P1 matrix routes are complete; P2/P3 routes remain backlog.

## Completion Notes

- `SIM_MAP`: 58 routes.
- P1 coverage: 58/58.
- Chrome headless `file://` smoke: 58 routes x 3 viewports pass.
- QA report: [P1 Simulation Expansion QA Report](./reports/p1-simulation-expansion-qa-report.md).
- Residual: legacy `<img>` audit warnings resolved by strict image gate cleanup; default audit and `--strict-images` pass with 0 errors. P2/P3 route ideas remain long-term backlog unless real DOCX/scenario demand appears.

## Cook Handoff

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\20260506-1045-interactive-mechanics-simulation-expansion\plan.md
```

Unresolved questions: xem [Validation Report](./reports/validation-report.md).
