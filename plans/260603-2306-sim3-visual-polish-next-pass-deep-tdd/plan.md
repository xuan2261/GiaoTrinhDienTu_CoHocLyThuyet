---
title: "Sim3 Visual Polish Next Pass Deep TDD"
description: "Deep TDD plan for the next Sim3 visual-quality pass after real screenshot review found composition, hierarchy, label, material, and dynamic-capture issues."
status: completed
priority: P1
effort: 28h
branch: master
tags: [planning, simulation, threejs, sim3, visual-polish, tdd]
blockedBy: []
blocks: []
created: 2026-06-03
---

# Sim3 Visual Polish Next Pass Deep TDD

## Overview

Mode: `/ck:plan --deep --tdd`.

This plan addresses the concrete visual issues found from reviewing the six current Sim3 screenshots. The previous Sim3 pass made the pilot usable with labels, cues, fallback, and lifecycle safety; this pass raises actual visual quality: better composition, clearer hierarchy, cleaner labels, stronger but still lightweight materials, and a more meaningful dynamic capture for collision.

## Visual Findings To Fix

| Route | Current score | Main issue | Target |
|---|---:|---|---|
| `ch2-2-2` | 7/10 | Disk dominates scene; marker/vector too close to edge. | Smaller disk, safer margins, cleaner tangent relation. |
| `ch2-3-2` | 7.5/10 | Informative but cluttered by shafts/arrows/gears/belt at equal weight. | Strong hierarchy: belt/gears primary, supports secondary. |
| `ch2-4-4` | 6.5/10 | Sparse scene; label cluster; Coriolis plane weak. | Clear rotating-frame cue and separated perpendicular vectors. |
| `ch2-5-3` | 7/10 | Velocity vector overpowers; gray field arrows ambiguous. | Balanced vector scale; construction arrows have clear role. |
| `ch3-5-3` | 7/10 | Clean but flat; radius label/guide rough. | Crisp radius dimension cue and subtle depth. |
| `ch3-6-2` | 7/10 | Capture shows mostly pre-collision, not the strongest teaching moment. | Baseline shows near/after impact with matching phase cues. |

## Cross-Plan Dependencies

| Relationship | Plan | Status | Decision |
|---|---|---|---|
| Prerequisite | [Sim3 Visual Quality Upgrade Deep TDD](../260603-2145-sim3-visual-quality-upgrade-deep-tdd/plan.md) | completed | Build on existing visual kit, label layer, route labels, and lifecycle tests. |
| Prerequisite context | [Sim3 ch2-5-3 Single Route TDD Rollout](../260603-2100-sim3-ch2-5-3-single-route-tdd-rollout/plan.md) | completed | Reuse route adapter and test patterns. |
| Adjacent foundation | [Sim2 Pro Visual UX Theory Upgrade](../260531-1657-sim2-pro-visual-ux-theory-upgrade/plan.md) | pending frontmatter, phases done | Preserve Sim2 default and color semantics; no blocker. |
| Adjacent QA | [Sim2 Visual Quality Eval Pipeline](../260531-2122-sim2-visual-quality-eval-pipeline/plan.md) | completed | Reuse screenshot-review thinking, but target Sim3 six-route pilot only. |

## Source Context

- Sim3 core: `js/sim3/core/three-shell.js`, `visual-kit.js`, `three-primitives.js`, `mode-toggle.js`, `three-dispose.js`
- Sim3 adapters: `js/sim3/sims/ch2-2-2-3d.js`, `ch2-3-2-3d.js`, `ch2-4-4-3d.js`, `ch2-5-3-3d.js`, `ch3-5-3-3d.js`, `ch3-6-2-3d.js`
- Sim3 tests: `tests/sim3-pilot-fallback-dispose.spec.js`
- Sim3 visual capture: `tools/sim3-visual/pilot-capture.spec.js`
- Current screenshot artifacts: `plans/260603-2145-sim3-visual-quality-upgrade-deep-tdd/visuals/final/*.png`
- Design rules: `docs/design-guidelines.md`
- Architecture rules: `docs/system-architecture.md`

## Scope Challenge

This is **not** a new Sim3 rollout and not a photorealistic graphics project. Highest leverage is a precise polish pass over the six existing routes, with small shared helpers only where repeated. Avoid orbit controls, post-processing, textures, and any physics rewrite.

## Non-Negotiable Constraints

- Sim2 remains default/canonical; Sim3 remains optional per route.
- Scope stays at the existing six Sim3 pilot routes.
- No physics rewrite; Sim3 consumes existing route state.
- No runtime CDN, bundler, remote texture, new production dependency, or heavy post-processing.
- Keep `file://` offline compatibility and vendored Three.js UMD.
- Preserve mount contract: `SIM_MAP[id] -> factory(container) -> { dispose }`.
- 3D→2D toggle, WebGL fallback, repeated toggle, reset, and dispose remain clean.
- Visual improvements must clarify pedagogy, not add decorative noise.

## Phases

| Phase | Name | Status |
|---:|---|---|
| 01 | [Baseline Visual Diagnostics](./phase-01-baseline-visual-diagnostics.md) | Completed |
| 02 | [Shared Composition And Label Rules](./phase-02-shared-composition-and-label-rules.md) | Completed |
| 03 | [Route Composition Polish](./phase-03-route-composition-polish.md) | Completed |
| 04 | [Visual Hierarchy And Materials](./phase-04-visual-hierarchy-and-materials.md) | Completed |
| 05 | [Dynamic Capture And QA](./phase-05-dynamic-capture-and-qa.md) | Completed |
| 06 | [Release Review And Closeout](./phase-06-release-review-and-closeout.md) | Completed |

## TDD Strategy

1. RED: encode route visual issues as deterministic assertions where possible: debug visual metrics, label layer counts, capture states, screenshot existence.
2. GREEN: adjust shared composition helpers and route adapter parameters minimally.
3. VERIFY: run `npm run test:sim3:pilot` after each implementation phase.
4. VISUAL: run `npm run test:sim3:visual:capture` and manually inspect the six generated screenshots.
5. RELEASE: run `npm run test:sim:release` before closeout.

## File Ownership Matrix

| Phase | Owns Writes | Reads |
|---:|---|---|
| 01 | `plans/260603-2306-sim3-visual-polish-next-pass-deep-tdd/reports/*`, `visuals/baseline/*` | current final captures, Sim3 tests/capture script |
| 02 | `js/sim3/core/visual-kit.js`, `js/sim3/core/three-shell.js`, `tests/sim3-pilot-fallback-dispose.spec.js` | all adapters |
| 03 | `js/sim3/sims/ch2-2-2-3d.js`, `ch2-3-2-3d.js`, `ch2-4-4-3d.js`, `ch2-5-3-3d.js`, `ch3-5-3-3d.js` | shared visual kit |
| 04 | `js/sim3/core/visual-kit.js`, selected route adapters | design guidelines, previous visual artifacts |
| 05 | `js/sim3/sims/ch3-6-2-3d.js`, `tools/sim3-visual/pilot-capture.spec.js`, tests | dynamics route state |
| 06 | plan reports/visuals, optional README/docs only if public claims change | package scripts, README/docs |

## Success Criteria

- `ch2-2-2`: disk no longer dominates; tangent vector and marker have safe margins.
- `ch2-3-2`: mechanism remains rich but has clear visual hierarchy; support shafts/secondary arrows are visibly secondary.
- `ch2-4-4`: `v_rel` and `a_cor` are separated, legible, and visually perpendicular; rotating-frame cue is recognizable.
- `ch2-5-3`: velocity vector scale is balanced; IC-to-M radius and construction arrows read clearly.
- `ch3-5-3`: radius guide/label is crisp and intentional; materials/ring/arm have subtle depth without clutter.
- `ch3-6-2`: final capture shows a near/after-impact teaching state, not only distant pre-impact.
- Label layer remains legible, non-blocking, and removed on 3D→2D and dispose.
- No public contract changes, no new runtime dependencies.
- `npm run test:sim3:pilot` passes.
- `npm run test:sim3:visual:capture` passes and generates six final screenshots.
- `npm run test:sim:release` passes.

## Out Of Scope

- Full 25-route Sim3 rollout.
- Replacing Sim2 as default.
- Physics formula or parameter changes.
- ESM/bundler migration.
- Runtime textures, post-processing, orbit controls, camera UI, or photorealistic rendering.
- Broad docs rewrite; update docs only if public architecture/design claims change.

## Red-Team Notes

- Risk: visual “improvement” hides pedagogy. Mitigation: every route change must map to an existing formula/legend term.
- Risk: screenshot-only quality checks become subjective. Mitigation: pair screenshot review with route debug visual metrics and explicit route acceptance checklist.
- Risk: ch3-6-2 dynamic capture becomes flaky. Mitigation: deterministic step count or helper to advance to impact, not time-based waits.
- Risk: mode-toggle lifecycle regresses. Mitigation: keep tests asserting canvas/label removal on 3D→2D and full dispose.

## Cook Handoff

Run after review:

```powershell
/ck:cook C:\Work\GiaoTrinhDienTu_CoHocLyThuyet\plans\260603-2306-sim3-visual-polish-next-pass-deep-tdd\plan.md --tdd
```
