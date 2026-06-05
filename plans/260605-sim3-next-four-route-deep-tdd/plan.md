---
title: "Sim3 Next Four Route Deep TDD"
description: "Deep TDD plan to add four optional Sim3 routes after the completed six-route pilot, preserving Sim2 as default."
status: completed
priority: P1
effort: 24h
branch: master
tags: [planning, simulation, threejs, sim3, tdd]
blockedBy: []
blocks: []
created: 2026-06-05
---

# Sim3 Next Four Route Deep TDD

## Overview

Mode: `/ck:plan --deep --tdd`.

Add optional Three.js Sim3 mode for exactly four remaining high-value routes: `ch1-5-3`, `ch3-1-3`, `ch2-1-3`, and `ch1-1-5`. Sim2 SVG-first remains canonical/default; Sim3 is an optional 3D teaching viewport with deterministic fallback to 2D.

## Source Context

- Sim2 manifest: `js/sim2/sim2-route-manifest.js`
- Sim3 core: `js/sim3/core/three-shell.js`, `mode-toggle.js`, `three-primitives.js`, `visual-kit.js`, `three-dispose.js`
- Existing Sim3 adapters: `js/sim3/sims/*-3d.js`
- Route tests: `tests/sim3-pilot-fallback-dispose.spec.js`
- Fixtures: `tests/fixtures/sim2-ch1.html`, `tests/fixtures/sim2-ch2.html`, `tests/fixtures/sim2-ch3.html`
- Production loader: `index.html`
- Prior completed plans: `../260602-2103-sim3-two-route-threejs-pilot/`, `../260603-1858-sim3-route-candidate-audit-and-rollout-plan/`, `../260604-0000-sim3-visual-polish-8-plus-tdd/`

## Non-Negotiable Constraints

- Keep `window.SIM_MAP[id](container) -> { dispose }` unchanged.
- Sim2 remains default and must work if Sim3 globals are missing.
- No CDN, runtime bundler, remote textures, or new runtime dependencies.
- Three.js stays vendored offline through `lib/three/three.umd.min.js`.
- WebGL failure returns to 2D and shows Vietnamese fallback.
- `dispose()` removes toggle, fallback, host, canvas, labels, listeners, and RAF.
- 3D must teach physics, not act as decoration.

## Selected Routes

| Priority | Route | Teaching reason |
|---:|---|---|
| 1 | `ch1-5-3` | Friction cone is truly spatial; 3D clarifies `φ`, `β`, equilibrium/slip region. |
| 2 | `ch3-1-3` | Non-inertial frame scene benefits from train/body/pendulum depth and inertial force direction. |
| 3 | `ch2-1-3` | Frenet frame/curvature can be shown as tangent-normal-radius construction without replacing 2D ellipse. |
| 4 | `ch1-1-5` | Resultant force and moment vector can clarify planar reduction `R + Mo`. |

## Scope Boundary

In scope: four route-local Sim3 adapters, Sim2 wiring, fixture loading, production `index.html` script loading, route contract tests, numeric physics assertions, and visual capture for the new routes.

Out of scope: full 25-route rollout, physics rewrite, shared Sim3 core rewrite, docs rewrite beyond minimal plan/report sync, package/dependency changes.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Decision |
|---|---|---|---|
| Prerequisite | `260602-2103-sim3-two-route-threejs-pilot` | done | Reuse shell/fallback/dispose contract. |
| Prerequisite | `260603-1858-sim3-route-candidate-audit-and-rollout-plan` | completed | Batch 1 done; this is next-batch scope. |
| Prerequisite | `260604-0000-sim3-visual-polish-8-plus-tdd` | completed | Reuse visual metrics and label-overlap expectations. |

## Phases

| Phase | Name | Status |
|---:|---|---|
| 01 | [Research And Acceptance Baseline](./phase-01-research-and-acceptance-baseline.md) | Completed |
| 02 | [TDD Contract Tests](./phase-02-tdd-contract-tests.md) | Completed |
| 03 | [Adapter Skeletons And Fixture Wiring](./phase-03-adapter-skeletons-and-fixture-wiring.md) | Completed |
| 04 | [Route State Wiring](./phase-04-route-state-wiring.md) | Completed |
| 05 | [Visual QA Release Gates](./phase-05-visual-qa-release-gates.md) | Completed |

## TDD Strategy

1. RED: add failing Playwright contract assertions for 4 routes.
2. GREEN: add minimal adapter + route/index wiring to pass each route.
3. REFACTOR: reduce duplication only after green.
4. VERIFY: run focused Sim3 suite after each slice.
5. RELEASE: run full sim release gate.

## Success Criteria

- [x] Four target routes show `.sim3-mode-toggle`; 2D is default.
- [x] Clicking 3D creates exactly one `canvas.sim3-canvas` and `.sim3-label-layer`.
- [x] Each route exposes labels and `window.__SIM3_DEBUG__[route]` state for deterministic tests.
- [x] Numeric debug assertions match existing physics: `φ=atan(μ)`, `slips=β>φ`, `θ=atan(a/g)`, `F*=-m·a`, tangent/normal/radius consistency, `R=ΣF`, `Mo=Σ(r×F)`.
- [x] Slider routes (`ch1-5-3`, `ch3-1-3`) and drag-only routes (`ch2-1-3`, `ch1-1-5`) update active Sim3 state.
- [x] Repeated 2D/3D toggles do not duplicate canvas/labels.
- [x] Missing Sim3 globals still allow 2D mount without throwing.
- [x] Forced WebGL failure falls back to 2D without page errors for all four new adapters.
- [x] `dispose()` leaves no Sim2 or Sim3 DOM under host.
- [x] Existing six Sim3 route tests remain intact and passing.
- [x] `index.html` loads all four new adapter scripts offline.
- [x] `npm run test:sim3:pilot` passes.
- [x] `npm run test:sim3:visual:capture` passes after adding new-route captures.
- [x] `npm run test:sim:release` passes.

## Cook Handoff

After approval:

```powershell
/ck:cook C:\Work\GiaoTrinhDienTu_CoHocLyThuyet\plans\260605-sim3-next-four-route-deep-tdd\plan.md --tdd
```
