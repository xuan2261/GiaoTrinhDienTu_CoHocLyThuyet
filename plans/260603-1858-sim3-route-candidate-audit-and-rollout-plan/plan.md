---
title: "Sim3 Route Candidate Audit And Rollout Plan"
description: "Deep TDD plan to add 3 optional Sim3 routes after auditing all 25 Sim2 route candidates."
status: completed
priority: P1
effort: 24h
branch: master
tags: [planning, simulation, threejs, sim3, tdd]
blockedBy: []
blocks: []
created: 2026-06-03
---

# Sim3 Route Candidate Audit And Rollout Plan

## Overview

Mode: `--deep --tdd`.

Option C result: audit all 25 Sim2 routes and pick a small next batch. Sim3 remains optional; Sim2 SVG-first remains canonical. This plan implements exactly 3 more optional 3D adapters with test-first gates, fallback coverage, visual artifacts, and docs sync.

## Source Context

- Route manifest: `js/sim2/sim2-route-manifest.js`
- Sim2 routes: `js/sim2/sims/`
- Sim3 pilot: `js/sim3/`
- Architecture: `docs/system-architecture.md`
- Design rules: `docs/design-guidelines.md`
- Audit report: `reports/sim3-route-candidate-audit.md`
- Red-team review: `reports/red-team-plan-review.md`
- TDD validation: `reports/validation-tdd-checklist.md`
- Completed prerequisite: `../260602-2103-sim3-two-route-threejs-pilot/plan.md`

## Cross-Plan Dependencies

| Relationship | Plan | Status | Decision |
|---|---|---|---|
| Prerequisite context | [Sim3 Two Route Threejs Pilot](../260602-2103-sim3-two-route-threejs-pilot/plan.md) | done | Reuse shell/toggle/fallback patterns. No blocker. |
| Adjacent pending work | Sim2 visual/docs plans | pending/complete mixed | No direct dependency. Sim3 remains optional and route-scoped. |

## Selected Batch

| Rank | Route | Reason | Status |
|---:|---|---|---|
| 1 | `ch2-3-2` | Transmission has true spatial rotation axes; 3D clarifies gear vs belt direction. | Proposed |
| 2 | `ch2-4-4` | Coriolis is inherently cross-product/spatial; 3D can make perpendicular vectors clearer. | Proposed |
| 3 | `ch3-5-3` | Angular momentum conservation maps naturally to rotating mass radius changes. | Proposed |

Stretch candidate `ch2-5-3` is out of scope for this plan. Re-evaluate only after all 5 Sim3 routes pass QA and manual review.

## Execution Strategy

Sequential. Phase 01 hardens shared contracts first; Phases 02-04 add one route each with RED-GREEN-VERIFY; Phase 05 runs release gates and docs.

## File Ownership Matrix

| Phase | Owns Writes | Reads |
|---:|---|---|
| 01 | `js/sim3/core/*`, focused Sim3 contract tests | existing `js/sim3/sims/*`, Sim2 route modules |
| 02 | `js/sim3/sims/ch2-3-2-3d.js`, `js/sim2/sims/ch2/ch2-3-2.js`, ch2 fixture/test wiring | Sim3 core, kinematics physics |
| 03 | `js/sim3/sims/ch2-4-4-3d.js`, `js/sim2/sims/ch2/ch2-4-4.js`, ch2 fixture/test wiring | Sim3 core, kinematics physics |
| 04 | `js/sim3/sims/ch3-5-3-3d.js`, `js/sim2/sims/ch3/ch3-5-3.js`, ch3 fixture/test wiring | Sim3 core, dynamics physics |
| 05 | `package.json`, `tools/sim3-visual/*`, `README.md`, `docs/*`, plan visual/report outputs | all Sim3 route outputs |

## Phases

| Phase | Name | Status |
|---:|---|---|
| 01 | [Shared Sim3 Adapter Hardening](./phase-01-shared-sim3-adapter-hardening.md) | Complete |
| 02 | [`ch2-3-2` Transmission 3D](./phase-02-ch2-3-2-transmission-3d.md) | Complete |
| 03 | [`ch2-4-4` Coriolis 3D](./phase-03-ch2-4-4-coriolis-3d.md) | Complete |
| 04 | [`ch3-5-3` Angular Momentum 3D](./phase-04-ch3-5-3-angular-momentum-3d.md) | Complete |
| 05 | [QA, Visuals, Docs](./phase-05-qa-visuals-docs.md) | Complete |

## TDD Gate Order

1. RED: add failing Playwright assertions for route-specific 3D mode availability, state sync, fallback, repeated toggle, dispose cleanup.
2. GREEN: implement smallest adapter/wiring that passes route test.
3. VERIFY: run focused Sim3 suite after each route.
4. RELEASE: run `npm run test:sim3:pilot`, `npm run test:sim3:visual:capture`, `npm run test:sim:release`.

## Success Criteria

- Next batch adds exactly 3 new optional Sim3 routes.
- Existing `ch2-2-2` and `ch3-6-2` still pass.
- Sim2 remains default and public mount contract unchanged.
- `npm run test:sim3:pilot`, new focused Sim3 tests, `npm run test:sim:release`, and manual browser QA pass.
- No remote CDN/model/texture dependency. Three.js remains vendored offline.
- Each new adapter exposes deterministic debug state under `window.__SIM3_DEBUG__[routeId]` only for tests.

## Out Of Scope

- Full 25-route 3D rollout.
- Physics rewrite.
- Runtime bundler migration.
- Replacing Sim2 SVG-first.
- UMD-to-ESM migration for Three.js.

## Unresolved Questions

- None blocking. UMD deprecation deferred until after this batch because offline pilot currently works and migration would expand scope.

## Completion Notes

- Implemented exactly 3 new optional Sim3 routes: `ch2-3-2`, `ch2-4-4`, `ch3-5-3`.
- Pilot now covers 5 optional routes; Sim2 remains default.
- Verified: `npm run test:sim3:pilot`, `npm run test:sim3:visual:capture`, `npm run test:sim:release`.
