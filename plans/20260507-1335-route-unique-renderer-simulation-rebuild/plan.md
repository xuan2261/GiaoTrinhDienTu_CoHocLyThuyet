---
title: "Route Unique Renderer Simulation Rebuild"
description: "Rebuild the 58 simulation routes so every route owns a distinct renderer, behavior contract, and QA gate that rejects family-level reuse."
status: completed
priority: P1
effort: 96h
issue:
branch: none
tags: [bugfix, frontend, simulations, qa, tech-debt]
blockedBy: []
blocks: []
created: 2026-05-07
---

# Route Unique Renderer Simulation Rebuild

## Overview

Current route-specific repair is insufficient: 58 scenes have unique metadata, but rendering still dispatches through 14 `family` renderers and generic interaction/derived logic. This plan raises the pedagogical standard: every simulation route must have a completely distinct renderer function. Shared low-level drawing primitives are allowed; shared route renderer functions are not.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Builds on | [Route-Specific Simulation Lab Repair](../20260507-0846-route-specific-simulation-lab-repair/plan.md) | completed | Keeps 58-route catalog, lab shell, assessment, and existing QA baseline. |
| No conflict | [Local Math OCR Semantic Math Strict Publish](../20260505-2044-local-math-ocr-semantic-math-strict-publish/plan.md) | in-progress | Different files and release scope; math plan owns DOCX/equation publish outputs. |

## Research And Reports

| Report | Purpose |
|---|---|
| [Renderer Contract Research](./research/renderer-contract-research.md) | Strict architecture for 58 unique route renderers and behavior contracts. |
| [Pedagogical Route Specificity Research](./research/pedagogical-route-specificity-research.md) | Teaching standard: what “route-specific” means per mechanics topic. |
| [Codebase Scout Report](./reports/codebase-scout-report.md) | Current files, root cause evidence, and affected QA surfaces. |
| [Red Team Review](./reports/red-team-review.md) | Failure modes and mitigations before implementation. |
| [Validation Report](./reports/validation-report.md) | Critical decisions locked for implementation. |
| [Final QA Report](./reports/final-qa-report.md) | PASS evidence for strict renderer contract, semantic gate, and release gate. |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 1 | [Baseline Semantic Failure Gates](./phase-01-baseline-semantic-failure-gates.md) | Complete | New gates fail current family-level renderer reuse |
| 2 | [Renderer And Behavior Contract Architecture](./phase-02-renderer-and-behavior-contract-architecture.md) | Complete | 58 route renderer slots validated, no behavior change yet |
| 3 | [Ch1 Force Fundamentals And Laws Renderers](./phase-03-ch1-force-fundamentals-and-laws-renderers.md) | Complete | 8 Ch1 routes have distinct renderer functions |
| 4 | [Ch1 Supports And Spatial Renderers](./phase-04-ch1-supports-and-spatial-renderers.md) | Complete | 9 Ch1 routes have distinct renderer functions |
| 5 | [Ch1 Friction Centroid Solver Renderers](./phase-05-ch1-friction-centroid-solver-renderers.md) | Complete | Remaining 8 Ch1 routes distinct; Ch1 25/25 strict |
| 6 | [Ch2 Particle Rotation Transmission Renderers](./phase-06-ch2-particle-rotation-transmission-renderers.md) | Complete | 6 Ch2 routes distinct |
| 7 | [Ch2 Relative Plane Checker Renderers](./phase-07-ch2-relative-plane-checker-renderers.md) | Complete | Remaining 9 Ch2 routes distinct; Ch2 15/15 strict |
| 8 | [Ch3 Fundamentals Differential Renderers](./phase-08-ch3-fundamentals-differential-renderers.md) | Complete | 10 Ch3 routes distinct |
| 9 | [Ch3 Theorem Collision Solver Renderers](./phase-09-ch3-theorem-collision-solver-renderers.md) | Complete | Remaining 8 Ch3 routes distinct; Ch3 18/18 strict |
| 10 | [Assessment And Pedagogy Sync](./phase-10-assessment-and-pedagogy-sync.md) | Complete | Checkpoints verify route-specific concepts, not generic drag |
| 11 | [Full Semantic Browser QA And Release Gates](./phase-11-full-semantic-browser-qa-and-release-gates.md) | Complete | Full strict renderer, browser, release gates pass |
| 12 | [Docs And Handoff](./phase-12-docs-and-handoff.md) | Complete | Docs synced; handoff and rollback notes complete |

## Dependencies

- Runtime: `index.html`, `js/sim-professional-lab.js`, `js/sim-scene-registry.js`, `js/sim-scene-templates.js`, `js/sims/ch*/`, `js/sim-route-manifest.js`.
- QA: `tools/smoke_simulation_scene_catalog.py`, new renderer contract smoke, `tests/simulation-browser.spec.js`, `package.json`.
- Constraints: offline `file://`, no bundler/framework, generated files not edited manually, new files kebab-case and kept focused.

## Success Criteria

- `window.SIM_MAP` remains 58 routes.
- Every route has one dedicated renderer function; no two routes share renderer id, function reference, or normalized renderer body hash.
- `renderScene()` no longer uses `family` as the final renderer selector.
- Browser QA proves route-specific visual structure with text/label uniqueness masked.
- Interaction/readout/checkpoints reflect the target lesson per route.
- Existing lifecycle, storage, assessment, responsive, `file://`, and release tests still pass.

## Cook Handoff

After review, run:

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\20260507-1335-route-unique-renderer-simulation-rebuild\plan.md
```

Unresolved questions: none.


