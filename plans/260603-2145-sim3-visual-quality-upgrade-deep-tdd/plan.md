---
title: "Sim3 Visual Quality Upgrade Deep TDD"
description: "Deep TDD plan to raise the six-route Sim3 pilot from simple technical illustrations to clearer, higher-quality 3D teaching scenes."
status: completed
priority: P1
effort: 32h
branch: master
tags: [planning, simulation, threejs, sim3, visual-quality, tdd]
blockedBy: []
blocks: []
created: 2026-06-03
---

# Sim3 Visual Quality Upgrade Deep TDD

## Overview

Mode: `/ck:plan --deep --tdd`.

Upgrade the existing optional Sim3 pilot for six routes: `ch2-2-2`, `ch2-3-2`, `ch2-4-4`, `ch2-5-3`, `ch3-5-3`, `ch3-6-2`. The plan fixes the visual issues found in manual review: static camera, flat lighting/materials, missing in-canvas labels, sparse Coriolis/instant-center scenes, and weak collision phase/motion storytelling.

## Current Findings To Fix

| Finding | Evidence | Planned Fix |
|---|---|---|
| Camera is too static | Most captures look like models on a grid | Shared camera presets + per-route composition tests |
| Lighting/materials are flat | Objects have little shadow/highlight depth | Shared visual kit: lights, shadow receiver, material tokens |
| In-canvas labels are missing | User must read side panel to decode arrows/points | CSS2D-style DOM label overlay anchored to projected 3D points |
| `ch2-4-4` and `ch2-5-3` feel sparse | Large empty platform with few cues | Add semantic guides, vector planes, field/rotation context |
| `ch3-6-2` phase is weak | Collision lacks ghost/trail/phase emphasis | Impact ghost states, trail fade, phase marker and before/after cue |

## Cross-Plan Dependencies

| Relationship | Plan | Status | Decision |
|---|---|---|---|
| Prerequisite context | [Sim3 Two Route Three.js Pilot](../260602-2103-sim3-two-route-threejs-pilot/plan.md) | done | Reuse shell/toggle/fallback architecture. |
| Prerequisite context | [Sim3 Route Candidate Audit And Rollout Plan](../260603-1858-sim3-route-candidate-audit-and-rollout-plan/plan.md) | completed | Reuse batch route adapters and test patterns. |
| Prerequisite context | [Sim3 ch2-5-3 Single Route TDD Rollout](../260603-2100-sim3-ch2-5-3-single-route-tdd-rollout/plan.md) | completed | Current six-route scope is complete before visual polish. |
| Adjacent foundation | [Sim2 Pro Visual UX Theory Upgrade](../260531-1657-sim2-pro-visual-ux-theory-upgrade/plan.md) | pending frontmatter, phases done | No blocker; preserve Sim2 default and visual language. |

## Source Context

- Sim3 core: `js/sim3/core/three-shell.js`, `three-primitives.js`, `mode-toggle.js`, `three-dispose.js`
- Sim3 adapters: `js/sim3/sims/*-3d.js`
- Sim3 contract tests: `tests/sim3-pilot-fallback-dispose.spec.js`
- Sim3 visual capture: `tools/sim3-visual/pilot-capture.spec.js`
- Visual artifacts reviewed: `plans/260603-2100-sim3-ch2-5-3-single-route-tdd-rollout/visuals/*.png`
- Design rules: `docs/design-guidelines.md`
- Architecture rules: `docs/system-architecture.md`

## Scope Challenge

Keep this as a polish/foundation pass, not a 25-route 3D rollout. The highest-leverage work is shared Sim3 visual infrastructure plus targeted route polish for the six existing pilot scenes.

## Non-Negotiable Constraints

- Sim2 remains default/canonical; Sim3 remains optional per route.
- No physics rewrite; Sim3 consumes existing route state.
- No runtime CDN, bundler, remote textures, or new production dependency.
- Keep `file://` offline compatibility and vendored Three.js UMD.
- Preserve mount contract: `SIM_MAP[id] -> factory(container) -> { dispose }`.
- WebGL/renderer failure still falls back to 2D with Vietnamese message.
- `dispose()` removes canvas, labels, listeners, RAF, and route-specific DOM.
- Visual upgrades must be readable and pedagogical, not decorative clutter.

## Phases

| Phase | Name | Status |
|---:|---|---|
| 01 | [Research And Acceptance Baseline](./phase-01-research-and-acceptance-baseline.md) | Completed |
| 02 | [Core Visual Foundation TDD](./phase-02-core-visual-foundation-tdd.md) | Completed |
| 03 | [Labels Camera And Lighting](./phase-03-labels-camera-and-lighting.md) | Completed |
| 04 | [Route Scene Polish](./phase-04-route-scene-polish.md) | Completed |
| 05 | [Motion Ghost Trails And Phase Cues](./phase-05-motion-ghost-trails-and-phase-cues.md) | Completed |
| 06 | [Visual QA Release And Docs](./phase-06-visual-qa-release-and-docs.md) | Completed |

## TDD Strategy

1. RED: add deterministic Playwright assertions for labels, canvas count, fallback/dispose, debug state, and visual capture existence.
2. GREEN: implement shared visual primitives before route-specific polish.
3. VERIFY: run focused `npm run test:sim3:pilot` after each phase.
4. VISUAL: capture all six screenshots and do human review against acceptance checklist.
5. RELEASE: run Sim3 and Sim2 release gates before closeout.

## File Ownership Matrix

| Phase | Owns Writes | Reads |
|---:|---|---|
| 01 | plan-scoped report/checklist only | current visuals, Sim3 core/adapters/tests |
| 02 | `js/sim3/core/three-primitives.js`, optional new `js/sim3/core/visual-kit.js`, tests | all adapters |
| 03 | `js/sim3/core/three-shell.js`, optional `js/sim3/core/label-layer.js`, tests/CSS hooks | mode toggle, adapters |
| 04 | `js/sim3/sims/ch2-2-2-3d.js`, `ch2-3-2-3d.js`, `ch2-4-4-3d.js`, `ch2-5-3-3d.js`, `ch3-5-3-3d.js` | shared visual kit |
| 05 | `js/sim3/sims/ch3-6-2-3d.js`, plus motion cue helpers if shared | dynamics state, visual tests |
| 06 | `tools/sim3-visual/*`, `tests/sim3-pilot-fallback-dispose.spec.js`, plan visuals/reports, minimal docs sync if implementation changes docs claims | package scripts, README/docs |

## Success Criteria

- All six Sim3 scenes still mount in 2D first and switch to 3D without errors.
- Each 3D scene has readable in-canvas labels for core objects/vectors.
- Camera composition is route-specific enough that main teaching geometry is not hidden or excessively empty.
- Materials show better depth through consistent lighting, shadows, rim/edge cues, and non-flat surfaces.
- `ch2-4-4` clearly communicates `omega`, `v_rel`, and `a_cor` as perpendicular/spatial cues.
- `ch2-5-3` clearly communicates IC `P`, sample point `M`, radius vector, and velocity field relation.
- `ch3-6-2` shows phase/motion evolution with trail/ghost/impact cues without violating reduced-motion expectations.
- Fallback, repeated toggle, state sync, and dispose tests remain green.
- `npm run test:sim3:pilot` passes.
- `npm run test:sim3:visual:capture` passes and produces six updated artifacts.
- `npm run test:sim:release` passes.

## Out Of Scope

- Full 25-route Sim3 rollout.
- Replacing Sim2 as default.
- Physics formula changes.
- ESM/bundler migration.
- Remote assets, heavy post-processing, orbit controls, or interactive 3D camera controls.
- Perfect photorealism; target is clear educational 3D.

## Red-Team Notes

- Biggest risk: adding visual polish that obscures pedagogy. Mitigation: labels and visual cues must map to panel legend terms.
- Biggest technical risk: DOM label layer leaks on toggle/dispose. Mitigation: tests assert no duplicate labels/canvas and no remnants after dispose.
- Biggest scope risk: trying to make every scene “cinematic”. Mitigation: KISS shared kit first, then only route-specific cues tied to concepts.

## Cook Handoff

Run after approval:

```powershell
/ck:cook C:\Work\GiaoTrinhDienTu_CoHocLyThuyet\plans\260603-2145-sim3-visual-quality-upgrade-deep-tdd\plan.md
```
