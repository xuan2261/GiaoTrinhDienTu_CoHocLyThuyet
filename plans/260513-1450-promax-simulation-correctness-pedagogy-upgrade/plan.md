---
title: "Promax Simulation Correctness Pedagogy Upgrade"
description: "Pilot-first, invariant-first upgrade to make existing mechanics simulations more correct, measurable, accessible, and pedagogically useful without rebuilding the runtime."
status: completed
priority: P1
effort: 124h
issue:
branch: master
tags: [feature, frontend, simulations, qa, education, physics]
blockedBy: []
blocks: []
created: 2026-05-13
reviewed: 2026-05-13
source: "ck:debug + ck:brainstorm upgrade"
---

# Promax Simulation Correctness Pedagogy Upgrade

## Overview

Upgrade the current 58-route mechanics simulation system through a 6-route pilot. The target is not a visual rebuild. The target is measurable physics correctness, live formula/readout coupling, useful diagnostics, and learner-facing challenge mode that can later roll out safely by invariant family.

This plan builds on the completed DeCuong simulation full rebuild and current `SimProfessionalLab` runtime. It keeps static `HTML/CSS/JS`, `file://` compatibility, route ids, registry contracts, and existing QA gates.

## Debug Review Findings

| Severity | Finding | Fix in this upgraded plan |
|---|---|---|
| High | Original plan had correct phase names but not enough acceptance detail for `/ck:cook`. | Add exact outputs, gates, route invariant map, and artifact checklist. |
| High | “Promax” was under-defined and could become subjective UI polish. | Define Promax as five measurable contracts: physics, state, formula/readout, diagnostics, pedagogy. |
| High | 58-route ambition could trigger another full rewrite. | Lock scope to 6 pilot routes, then produce a 52-route rollout matrix only. |
| High | Physics correctness was not clearly separated from renderer visuals. | Add invariant manifest/evaluators before pilot UI work. |
| Medium | Challenge mode could revive old assessment complexity. | Keep local, optional, no persistence by default. |
| Medium | Mini graph layer could add a heavy dependency. | Use local Canvas/SVG helpers first; no chart library unless Phase 08 proves need. |
| Medium | Final docs could overclaim “all routes upgraded”. | Phase 10 must state pilot-only results and remaining rollout work. |

## Codebase Context

| Area | Current fact |
|---|---|
| Project type | Static electronic textbook, no runtime bundler. |
| Runtime stack | `index.html`, `css/style.css`, vanilla `js/`, `chapters/`, `data/`, `tools/`. |
| Simulation architecture | Shared `.sim-lab` shell, `SimProfessionalLab`, route scene/renderer/behavior registries. |
| Route contract | 58 canonical P1 route ids, each with route-specific scene, renderer, behavior identity. |
| QA baseline | `npm run test:sim:unit`, `quality`, `semantic`, `browser`, `visual-quality`, `release`, Python smoke gates. |
| Hard constraints | `file://` compatible, no framework, no manual `js/pages.js`, active JS files under 220 lines. |

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Builds on | [DeCuong Simulation Full Rebuild](../260512-0845-decuong-simulation-full-rebuild/plan.md) | complete | Current 58-route baseline |
| Related historical | [DeCuong-Style 58 Simulation UX Rebuild](../260509-1820-decuong-style-58-simulation-ux-rebuild/plan.md) | stale in-progress | Superseded by completed rebuild; not blocker |
| Related historical | [Route-Specific Simulation Rebuild](../20260510-0516-route-specific-simulation-rebuild/plan.md) | stale pending | Not blocker; do not revive without user request |

## Exact Requirements

| Item | Requirement |
|---|---|
| Expected output | Implementable plan for upgrading 6 pilot routes and producing a 58-route rollout matrix. |
| Primary artifact | This plan plus linked phase files in `plans/260513-1450-promax-simulation-correctness-pedagogy-upgrade/`. |
| Implementation artifacts | New/updated invariant modules, lab shell diagnostics, route pilot changes, focused tests, reports, docs updates. |
| Acceptance criteria | Pilot routes pass invariant, browser, visual, accessibility, and release gates; rollout matrix covers 58/58 routes. |
| Scope boundary | Pilot implementation for 6 routes only; no automatic 52-route upgrade in this plan. |
| Non-negotiables | Static runtime, no bundler/framework, preserve route ids, preserve registry contracts, no generated file edits. |
| Touchpoints | `js/sim-*`, `js/sims/ch*/`, `css/style.css`, `tests/`, `tools/`, `docs/`, plan reports. |

## Out Of Scope

- Rebuilding the simulation engine.
- Replacing Canvas route renderers with Matter.js, Three.js, SVG V2, or a new framework.
- Changing canonical route ids or route map semantics.
- Editing generated `js/pages.js` or DOCX-generated `chapters/` manually.
- Adding backend, telemetry, accounts, or remote persistence.
- Claiming the remaining 52 routes are Promax-complete before follow-up rollout evidence exists.

## Promax Definition

A route is Promax-ready only if all contracts below are true:

| Contract | Requirement | Evidence |
|---|---|---|
| Physics invariant | Route has explicit invariant spec, evaluator, tolerance, and residual. | Unit test plus targeted browser state check. |
| Canonical state | Drag, slider, reset, animation, readouts, and formula use the same clamped state. | Browser interaction test after drag/slider/reset. |
| Formula/readout coupling | Visible formula substitution matches the readout values and route objective. | Formula test plus visual/mobile check. |
| Diagnostics | Optional diagnostics explain components/FBD/graph/error without layout fork. | Toggle test, no overflow, dark/light readable. |
| Pedagogy | Learner can observe, manipulate, and optionally self-check a target condition. | Challenge mode test, concise feedback, no unwanted persistence. |

## Pilot Route Invariant Map

| Route | Domain | Target invariant | Canonical state/readout | Diagnostics | Pedagogy challenge | Risk |
|---|---|---|---|---|---|---|
| `ch1-2-3` | Statics | `R = F1 + F2`; graphical diagonal equals computed resultant. | `F1`, `F2`, `R`, angle, components. | Parallelogram, component projections, residual badge. | Adjust two forces so resultant hits target magnitude/direction. | Medium: formula duplication in renderer. |
| `ch1-5-3` | Statics | Slip boundary `tan(alpha) <= mu`; margin `mu - tan(alpha)`. | `alpha`, `mu`, `phi`, slip/stick state. | Friction cone, boundary band, pass/warn/fail. | Find boundary between rest and slip. | Medium: boundary flicker near equality. |
| `ch2-1-2` | Kinematics | `v = dx/dt`, `a = dv/dt` from one analytic chain. | `t`, `x(t)`, `v(t)`, `a(t)`. | Cursor, tangent slope, linked graph markers. | Set cursor where velocity/acceleration condition is met. | Medium: numeric derivative noise. |
| `ch2-5-2` | Kinematics | `vP = omega x r(P/IC)`; velocity perpendicular to IC radius. | `IC`, `omega`, point velocities, radius lines. | IC rays, tangent velocity arrows, residual. | Move IC until target velocity ratio appears. | Medium: dense visual if diagnostics always on. |
| `ch3-3-1` | Dynamics | Oscillator equation `x'' + k/m x = 0`; energy drift within mode tolerance. | `x`, `v`, `T`, `V`, `E`, drift. | Energy band, ODE residual, pause-readable graph. | Tune mass/stiffness/state to keep drift inside tolerance. | High: damping/forcing mode ambiguity. |
| `ch3-6-2` | Dynamics | Momentum conservation and restitution relation, signed values preserved. | pre/post velocity, momentum, `e`, residuals. | Before/after vectors, momentum comparison, residual badge. | Choose collision parameters matching target outcome. | High: sign and zero-value regressions. |

## Architecture Strategy

```text
route state / behavior
  -> shared physics helpers
  -> invariant evaluator
  -> derived model
  -> readout + formula substitution
  -> renderer diagnostics
  -> optional challenge evaluator
  -> tests and reports
```

Shared-first rules:

- Put reusable math in physics/evaluator helpers, not renderers.
- Renderers draw the current derived state; they do not own formulas.
- `SimProfessionalLab` coordinates optional Promax slots without route-specific shell forks.
- Pilot routes prove the pattern before any 52-route rollout.

## Intended File Touchpoints

| Type | Files |
|---|---|
| Shared runtime modify | `js/sim-lab-ui.js`, `js/sim-professional-lab.js`, `js/sim-route-renderer-primitives.js`, `css/style.css` |
| Shared runtime create | `js/sim-route-invariants.js`, `js/sim-invariant-evaluators.js`, `js/sim-promax-challenges.js`, `js/sim-promax-readouts.js`, `js/sim-promax-mini-graph.js` |
| Physics helpers read/reuse | `js/sim-physics-statics.js`, `js/sim-physics-kinematics.js`, `js/sim-physics-dynamics.js` |
| Ch1 pilot | `js/sims/ch1/ch1-force-law-*`, `js/sims/ch1/ch1-friction-*`, `js/sims/ch1/ch1-friction-centroid-solver-*` |
| Ch2 pilot | `js/sims/ch2/ch2-trajectory-graph-renderers.js`, `js/sims/ch2/ch2-kinematics-behaviors-*`, `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js` |
| Ch3 pilot | `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js`, `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js`, `js/sims/ch3/ch3-collision-exercises-renderers.js`, `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js` |
| Tests create/modify | `tests/simulation-invariants.test.js`, `tests/promax-*.test.js`, `tests/promax-*.spec.js`, existing browser/visual tests |
| Reports/docs | `reports/promax-baseline-matrix.md`, `reports/promax-rollout-matrix.md`, `reports/final-promax-pilot-report.md`, `docs/*`, `docs/journals/*` |

## Research & Reports

| Report | Purpose |
|---|---|
| [Physics Correctness Research](./research/researcher-01-physics-correctness-report.md) | Invariant/test strategy |
| [UI UX Pedagogy QA Research](./research/researcher-02-ui-ux-pedagogy-qa-report.md) | Promax UX rules |
| [Scout Report](./reports/scout-report.md) | Current architecture/files |
| [Red Team Review](./reports/red-team-review.md) | Scope/risk challenge |
| [Validation Report](./reports/validation-report.md) | Locked assumptions |

## Phases

| Phase | Name | Status | Effort | Depends on | Output | Verify Gate |
|---:|---|---|---:|---|---|---|
| 01 | [Baseline Promax Audit Matrix](./phase-01-baseline-promax-audit-matrix.md) | Complete | 10h | current baseline | 58-route matrix, 6-pilot gap notes | Baseline report + current gates recorded |
| 02 | [Physics Invariant Manifest And Evaluators](./phase-02-physics-invariant-manifest-and-evaluators.md) | Complete | 14h | 01 | invariant schema, evaluators, unit tests | 6 pilot invariant unit tests pass |
| 03 | [Shared Lab UX Contract And Diagnostics](./phase-03-shared-lab-ux-contract-and-diagnostics.md) | Complete | 14h | 02 | diagnostics slots, invariant status API | shell/browser/a11y/mobile gates pass |
| 04 | [Pilot Ch1 Statics Routes](./phase-04-pilot-ch1-statics-routes.md) | Complete | 14h | 02,03 | `ch1-2-3`, `ch1-5-3` invariant shell/readout upgraded | targeted Promax shell + existing drag gates pass |
| 05 | [Pilot Ch2 Kinematics Routes](./phase-05-pilot-ch2-kinematics-routes.md) | Complete | 14h | 02,03 | `ch2-1-2`, `ch2-5-2` invariant shell/readout upgraded | derivative/IC unit + browser shell gates pass |
| 06 | [Pilot Ch3 Dynamics Routes](./phase-06-pilot-ch3-dynamics-routes.md) | Complete | 16h | 02,03 | `ch3-3-1`, `ch3-6-2` invariant shell/readout upgraded | energy/collision unit + browser shell gates pass |
| 07 | [Pedagogy Challenge Mode](./phase-07-pedagogy-challenge-mode.md) | Complete | 14h | 04,05,06 | optional observe/action/check mode | challenge tests + no persistence regressions |
| 08 | [Mini Graph And Formula Readout Layer](./phase-08-mini-graph-and-formula-readout-layer.md) | Complete | 12h | 04,05,06 | formula substitution helpers + route-owned graph summaries | formula/graph unit + Promax shell browser tests pass |
| 09 | [Rollout Matrix For Remaining Routes](./phase-09-rollout-matrix-for-remaining-routes.md) | Complete | 10h | 04-08 | 58-route family taxonomy and next plan recommendation | 52 non-pilot routes classified |
| 10 | [Release QA Docs And Handoff](./phase-10-release-qa-docs-and-handoff.md) | Complete | 6h | 09 | final report, docs sync, handoff | full release gate passes |

## Execution Rules

- Work phase by phase. Do not start pilot route changes before Phase 02 and Phase 03 pass.
- Keep each implementation change tied to one invariant or one shared UI contract.
- Update tests in the same phase as runtime behavior.
- After any JS change, run at least `node --check` for touched JS plus the phase gate.
- Do not ignore failed tests. Fix root cause or mark blocker.
- Do not edit `js/pages.js`, `chapters/`, generated equation reports, or DOCX-derived content for this plan.
- Do not revive stale Matter.js/SVG V2 paths.
- If a new JS file approaches 220 lines, split by responsibility before adding more code.
- If a pilot route needs route-specific exception, document it in the matrix before coding the exception.

## Verification Strategy

### Baseline Gate

```powershell
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58
python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58
python tools\smoke_simulation_runtime.py --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
npm run test:sim:unit
npm run test:sim:browser
npm run test:sim:visual-quality
```

### Phase Development Gate

```powershell
node --check <touched-js-file>
node tests\simulation-invariants.test.js --route <pilot-route>
npm run test:sim:unit
python tools\audit_simulation_quality.py --all --max-js-lines 220
```

### Browser And Visual Gate

```powershell
playwright test tests\promax-pilot-ch1.spec.js tests\promax-pilot-ch2.spec.js tests\promax-pilot-ch3.spec.js
playwright test tests\promax-challenge-mode.spec.js tests\promax-formula-graph.spec.js
npm run test:sim:browser
npm run test:sim:visual-quality
```

### Final Release Gate

```powershell
npm run test:sim:release
python tools\audit.py
python tools\audit.py --strict-equations
python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict --katex
```

## Manual QA Matrix

| View | Routes | Checks |
|---|---|---|
| Desktop `1280x900` | 6 pilot | Drag handles, sliders, formula, diagnostics toggle, challenge success/fail. |
| Mobile `375x812` | 6 pilot | No horizontal overflow, 44px controls, formula wraps, graph readable. |
| Tablet `768x1024` | 6 pilot | Canvas bounded, readout grid stable, keyboard focus visible. |
| Wide `1440x900` | 6 pilot | Diagnostics do not create empty space or excessive visual noise. |
| Dark/light | 6 pilot | Contrast readable, pass/warn/fail colors distinguishable. |
| Reduced motion | animated pilots | Nonessential motion disabled or paused; state remains inspectable. |
| `file://` | 6 pilot | Runtime loads without server-only assumptions. |
| Static server | 6 pilot | Same route behavior as `file://`. |

## Success Criteria

- 6 pilot routes have verified physical invariants, live formula/readout coupling, diagnostics, and challenge mode.
- Every pilot route passes drag, slider, reset, keyboard, mobile, dark/light, and reduced-motion checks.
- Formula/readout/diagnostic values come from canonical state and shared helpers, not copied renderer math.
- 58-route rollout matrix states exactly what to upgrade next, grouped by invariant family and risk.
- No route id changes, no generated file edits, no bundler, no remote dependency.
- `npm run test:sim:release` passes before handoff.
- Final docs and report state pilot scope honestly.

## Risk Matrix

| Risk | Impact | Mitigation | Stop condition |
|---|---|---|---|
| Pilot work grows into full 58-route rewrite | High | Phase 09 docs-only rollout decision. | Any request to modify non-pilot route behavior before Phase 09 approval. |
| Duplicated formulas diverge | High | Invariant/evaluator helpers own formulas. | Same formula appears in renderer and evaluator independently. |
| Ch3 numeric model ambiguous | High | Explicit route mode: exact, RK4, damped, or forced. | Energy invariant fails because physical model was not specified. |
| UI diagnostics clutter learning view | Medium | Diagnostics off by default, compact toggles. | Mobile overflow or teacher-facing noise appears by default. |
| Tests become flaky from animation | Medium | Pause before assertion, deterministic reset, reduced-motion path. | Same test fails nondeterministically twice. |
| New modules bloat script order | Medium | Group Promax modules carefully and verify runtime smoke. | `smoke_simulation_runtime.py` fails script load or global contract. |
| Accessibility regression | Medium | Native controls, `aria-pressed`, `aria-live`, keyboard tests. | Keyboard cannot complete a pilot route challenge. |
| Docs overclaim | Medium | Phase 10 says pilot-only and links rollout matrix. | Any doc says 58/58 Promax-complete without evidence. |

## Dependencies

- Static runtime: `HTML/CSS/JS`, `file://` compatible.
- Existing modules: `SimProfessionalLab`, `SimLabUI`, `SimInteractions`, physics helpers, route registries.
- Existing tests: unit, browser, visual-quality, renderer/scene/manifest/runtime smokes.
- No new runtime dependency unless Phase 08 proves custom Canvas graph insufficient.

## Documentation Sync

| Trigger | Docs |
|---|---|
| Shared Promax shell or diagnostics API changes | `docs/system-architecture.md`, `docs/design-guidelines.md` |
| QA scripts or release command changes | `README.md`, `docs/code-standards.md` |
| Pilot implementation complete | `docs/project-roadmap.md`, `docs/project-changelog.md` |
| Final handoff | `reports/final-promax-pilot-report.md`, `docs/journals/{date}-promax-simulation-pilot.md` |

Docs must list unresolved questions at the end if any. Reports should be concise and evidence-based.

## Cook Handoff

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260513-1450-promax-simulation-correctness-pedagogy-upgrade\plan.md
```

## Unresolved Questions

- Có cần lưu tiến trình challenge vào `localStorage` trong tương lai không? Current plan: không lưu.
- Nếu custom mini graph không đủ, có cho phép thêm local chart library không? Current plan: không thêm.
- Có muốn đổi 6 pilot route trước `/ck:cook` không? Current plan: giữ route đã validate.
- Release cuối là student/offline package hay maintainer package? Current plan: chỉ pilot handoff, chưa đóng gói release.
