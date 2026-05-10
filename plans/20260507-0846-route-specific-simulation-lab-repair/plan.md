---
title: "Route-Specific Simulation Lab Repair"
description: "Fix 58 mechanics simulation routes that mount correctly but reuse the same chapter-level scene; each route gets a distinct simulation scene, controls, readout, and QA identity gate."
status: completed
priority: P1
effort: 120h
issue:
branch: none
tags: [bugfix, frontend, simulations, qa, tech-debt]
blockedBy: []
blocks: []
created: 2026-05-07
---

# Route-Specific Simulation Lab Repair

## Overview

Fix root cause from debug: router/registry is correct, but `SimProfessionalLab` collapses 58 routes into 3 chapter renderers. Requirement: every current simulation route has its own route-specific scene. Keep static `file://` app, `window.SIM_MAP`, existing lab shell, and no runtime bundler.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Builds on | [Interactive Mechanics Simulation Expansion](../20260506-1045-interactive-mechanics-simulation-expansion/plan.md) | completed | Provides 58-route coverage matrix and current route scope. |
| Corrects regression from | [Professional Interactive Simulation Labs](../20260506-1828-professional-interactive-simulation-labs/plan.md) | completed | Professional shell succeeded, but content scenes became chapter-level generic. |

## Evidence

| Evidence | Finding |
|---|---|
| [Debug Summary](./reports/debug-root-cause-summary.md) | Ch1 25/25 same canvas, Ch3 18/18 same canvas, Ch2 13/15 same generic scene. |
| [Architecture Research](./research/root-cause-and-architecture-research.md) | Preserve registry; add route-scene registry and template renderers. |
| [Test Strategy](./research/test-strategy-scene-identity-research.md) | Add stable scene catalog gate + browser scene identity gate. |
| [Red Team Review](./reports/red-team-review.md) | Main risk: 58 bespoke scenes can bloat files; mitigate via templates + split catalogs. |
| [Final QA Report](./reports/final-qa-report.md) | `python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58` PASS; `npm run test:sim:unit` PASS; `npm run test:sim:scene-identity` PASS; `npm run test:sim:browser` PASS 262 tests; `npm run test:sim:release` PASS. |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 1 | [Baseline And Failing Scene Identity Gates](./phase-01-baseline-and-failing-scene-identity-gates.md) | Completed | New uniqueness gate fails on current root cause, existing gates still pass |
| 2 | [Route Scene Registry Architecture](./phase-02-route-scene-registry-architecture.md) | Completed | Registry/catalog skeleton mounts without changing route count |
| 3 | [Chapter 1 Force Fundamentals And Statics Laws](./phase-03-chapter-1-force-fundamentals-and-statics-laws.md) | Completed | 8 Ch1 routes have unique scene signatures and browser identity |
| 4 | [Chapter 1 Supports And Spatial Equilibrium](./phase-04-chapter-1-supports-and-spatial-equilibrium.md) | Completed | 9 Ch1 routes have unique scene signatures and browser identity |
| 5 | [Chapter 1 Friction Centroid And Solvers](./phase-05-chapter-1-friction-centroid-and-solvers.md) | Completed | Remaining 8 Ch1 routes unique; Ch1 25/25 unique |
| 6 | [Chapter 2 Particle Rotation And Transmission](./phase-06-chapter-2-particle-rotation-and-transmission.md) | Completed | 6 Ch2 routes unique and interactive |
| 7 | [Chapter 2 Relative And Plane Motion](./phase-07-chapter-2-relative-and-plane-motion.md) | Completed | Remaining 9 Ch2 routes unique; Ch2 15/15 unique |
| 8 | [Chapter 3 Fundamentals And Differential Motion](./phase-08-chapter-3-fundamentals-and-differential-motion.md) | Completed | 10 Ch3 routes unique and interactive |
| 9 | [Chapter 3 Theorems Collision And Solvers](./phase-09-chapter-3-theorems-collision-and-solvers.md) | Completed | Remaining 8 Ch3 routes unique; Ch3 18/18 unique |
| 10 | [Assessment Manifest And Documentation Sync](./phase-10-assessment-manifest-and-documentation-sync.md) | Completed | Checkpoints/readouts align with new route scenes |
| 11 | [Full QA Release Gate And Handoff](./phase-11-full-qa-release-gate-and-handoff.md) | Completed | Full simulation release gate, browser suite, docs handoff pass |

## Dependencies

- Runtime files: `index.html`, `js/sim-professional-lab.js`, `js/sim-lab-ui.js`, `js/sim-core.js`, `js/sim-interactions.js`, `js/sim-rendering.js`, `js/sim-route-manifest.js`, `js/sims/ch*/`.
- QA files: `tests/simulation-browser.spec.js`, `tests/simulation-physics.test.js`, `tools/smoke_simulation_*.py`, `tools/audit_simulation_quality.py`, `package.json`.
- Constraints: `file://` must work; no framework/bundler; `js/pages.js` and `chapters/` not edited manually; new JS files kebab-case and under 200 lines where feasible.

## Execution Strategy

Sequential. Phase 1 creates red tests. Phase 2 adds architecture. Phases 3-9 migrate all 58 route scenes by route groups. Phase 10 aligns assessment/docs. Phase 11 runs release gates. All 11 phases completed in the implementation pass.

## Completion Summary

- All 11 phases are complete.
- Final QA gates passed: scene catalog strict, unit, scene identity, browser 262 tests, release.
- See [Final QA Report](./reports/final-qa-report.md).

## Success Criteria

- `SIM_MAP` remains 58 routes.
- Each route has unique `sceneId`, title/formula intent, controls/readout signature, and visual identity.
- Browser initial canvas identity is unique per route unless a deliberate exception is documented and approved.
- Existing lifecycle, storage guard, file route, server route, responsive, touch, assessment tests still pass.

## Cook Handoff

Completed. See [Final QA Report](./reports/final-qa-report.md).

Unresolved questions: none.
