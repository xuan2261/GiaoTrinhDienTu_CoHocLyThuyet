---
title: "Promax Simulation Correctness Pedagogy Upgrade"
description: "Pilot-first upgrade to make existing mechanics simulations more accurate, professional, measurable, and learner-focused without rebuilding the engine."
status: pending
priority: P1
effort: 124h
issue:
branch: master
tags: [feature, frontend, simulations, qa, education, physics]
blockedBy: []
blocks: []
created: 2026-05-13
source: "ck:plan --hard"
---

# Promax Simulation Correctness Pedagogy Upgrade

## Overview

Upgrade simulations to “promax” by adding physics invariant checks, live formula/readout coupling, diagnostic overlays, challenge mode, pilot-route polish, and rollout gates. Build on current `SimProfessionalLab` stack. No framework, no full rewrite.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Builds on | [DeCuong Simulation Full Rebuild](../260512-0845-decuong-simulation-full-rebuild/plan.md) | complete | Current 58-route baseline |
| Related historical | [DeCuong-Style 58 Simulation UX Rebuild](../260509-1820-decuong-style-58-simulation-ux-rebuild/plan.md) | stale in-progress | Superseded by completed rebuild; not blocker |
| Related historical | [Route-Specific Simulation Rebuild](../20260510-0516-route-specific-simulation-rebuild/plan.md) | stale pending | Not blocker; do not revive without user request |

## Research & Reports

| Report | Purpose |
|---|---|
| [Physics Correctness Research](./research/researcher-01-physics-correctness-report.md) | Invariant/test strategy |
| [UI UX Pedagogy QA Research](./research/researcher-02-ui-ux-pedagogy-qa-report.md) | Promax UX rules |
| [Scout Report](./reports/scout-report.md) | Current architecture/files |
| [Red Team Review](./reports/red-team-review.md) | Scope/risk challenge |
| [Validation Report](./reports/validation-report.md) | Locked assumptions |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 01 | [Baseline Promax Audit Matrix](./phase-01-baseline-promax-audit-matrix.md) | Pending | Baseline report + route matrix |
| 02 | [Physics Invariant Manifest And Evaluators](./phase-02-physics-invariant-manifest-and-evaluators.md) | Pending | Invariant unit tests pass |
| 03 | [Shared Lab UX Contract And Diagnostics](./phase-03-shared-lab-ux-contract-and-diagnostics.md) | Pending | Shell/browser/a11y tests pass |
| 04 | [Pilot Ch1 Statics Routes](./phase-04-pilot-ch1-statics-routes.md) | Pending | `ch1-2-3`, `ch1-5-3` semantic pass |
| 05 | [Pilot Ch2 Kinematics Routes](./phase-05-pilot-ch2-kinematics-routes.md) | Pending | `ch2-1-2`, `ch2-5-2` semantic pass |
| 06 | [Pilot Ch3 Dynamics Routes](./phase-06-pilot-ch3-dynamics-routes.md) | Pending | `ch3-3-1`, `ch3-6-2` semantic pass |
| 07 | [Pedagogy Challenge Mode](./phase-07-pedagogy-challenge-mode.md) | Pending | Challenge tests + no persistence regressions |
| 08 | [Mini Graph And Formula Readout Layer](./phase-08-mini-graph-and-formula-readout-layer.md) | Pending | Graph/formula visual + a11y pass |
| 09 | [Rollout Matrix For Remaining Routes](./phase-09-rollout-matrix-for-remaining-routes.md) | Pending | 58-route readiness matrix |
| 10 | [Release QA Docs And Handoff](./phase-10-release-qa-docs-and-handoff.md) | Pending | Full release gate + docs sync |

## Dependencies

- Static runtime: `HTML/CSS/JS`, `file://` compatible.
- Existing modules: `SimProfessionalLab`, `SimLabUI`, `SimInteractions`, physics helpers, route registries.
- Existing tests: unit, browser, visual-quality, renderer/scene/manifest/runtime smokes.
- No new runtime dependency unless Phase 08 proves custom Canvas graph insufficient.

## Success Criteria

- 6 pilot routes have verified physical invariants, live formula/readout coupling, diagnostics, and challenge mode.
- 58-route rollout matrix says exactly what to upgrade next.
- No route id changes, no generated file edits, no bundler.
- `npm run test:sim:release` passes before handoff.

## Cook Handoff

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260513-1450-promax-simulation-correctness-pedagogy-upgrade\plan.md
```

## Unresolved Questions

Không có câu hỏi blocking. User can still change pilot routes before `/ck:cook`.
