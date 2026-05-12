---
title: "DeCuong Simulation Full Rebuild"
description: "Xây dựng lại toàn bộ 58 simulation (25 CH1 + 15 CH2 + 18 CH3) đạt chuẩn DeCuong visual/interaction quality. Canvas 760×440, KaTeX equations, trail effect toàn bộ, instant reset."
status: in_progress
priority: P1
effort: 180h
issue:
branch: master
tags: [feature, frontend, simulations, ux, qa, education, rebuild]
blockedBy: []
blocks: []
created: 2026-05-12
source: "ck:plan --hard"
---

# DeCuong Simulation Full Rebuild

## Overview

Xây dựng lại toàn bộ 58 route mô phỏng trong giáo trình điện tử Cơ Học Lý Thuyết đạt chuẩn chất lượng của `DeCuong_CoHocLyThuyet.html`. Thay thế 3 plans cũ (`ch1-decuong-interaction-upgrade`, `ch2-...`, `ch3-...`).

### User Decisions (Locked)
| Quyết định | Giá trị |
|---|---|
| Canvas size | **760×440** (nâng từ 560×340, uniform tất cả routes) |
| Equation rendering | **KaTeX inline** |
| Trail effect | **Tất cả routes** (không chỉ animated) |
| Audio feedback | **Không** |
| Reset pattern | **Instant reset** (giống DeCuong `resetSim()`) |
| Contract scenes | **Align match manifest** 58 IDs |
| Execution model | **Parallel** CH1/CH2/CH3 sau Phase 00 |

## User Review Required

> [!WARNING]
> ### W/H Migration Scope
> Canvas size change 560×340 → 760×440 ảnh hưởng **7 files** chứa hardcoded constants. Tất cả coordinates (handle positions, hit areas, layout offsets) trong scene configs và behavior files phải được scale lại. Scale factor: X ≈ 1.357, Y ≈ 1.294.

> [!IMPORTANT]
> ### Contract Scenes Realignment
> `zz-simulation-contract-scenes.js` hiện có 58 route IDs **khác** so với manifest (chỉ 39 trùng). Phase 00 sẽ rewrite contract scenes để match manifest 58 IDs chính xác.

## Architecture

```
W/H Migration Path:
  sim-scene-templates.js          → W=760, H=440 (authoritative source)
  sim-route-renderer-primitives.js → import from templates
  sim-professional-lab.js          → reads from templates.W, templates.H
  sim-core.js                      → createSimContainer(host, title, 760, 440)
  ch1-force-law-behaviors.js       → const W = 760, H = 440
  ch1-support-spatial-behaviors.js → const W = 760, H = 440
  ch1-solver-exercises-behaviors.js → const W = 760, H = 440
  ch1-friction-centroid-solver-behaviors.js → const W = 760, H = 440

clearCanvas() Migration:
  Before: ctx.fillStyle = '#f8f9fa'; ctx.fillRect(0, 0, w, h);
  After:  ctx.clearRect(0, 0, w, h);  // transparent → CSS var(--bg)

Arrowhead Fix:
  Before: 0.35 rad
  After:  Math.PI/7 ≈ 0.449 rad (match DeCuong)

DeCuong Visual Stack:
  sim-rendering.js  → drawThemeGrid, drawDragHandle, drawTrail, drawAngleArc, drawDeCuongArrow
  sim-professional-lab.js → readout cards, equation panel, hint format
  css/style.css → .sim-info-card color variants, .sim-canvas-wrap responsive, .sim-equation
  sim-core.js → canvas size, clearCanvas theme-aware
```

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Replaces | [Ch1 DeCuong Upgrade](../260512-0544-ch1-decuong-interaction-upgrade/plan.md) | completed (redo) | Output chưa đạt DeCuong quality |
| Replaces | [Ch2 DeCuong Upgrade](../260512-0544-ch2-decuong-interaction-upgrade/plan.md) | pending (cancel) | Merged vào plan này |
| Replaces | [Ch3 DeCuong Upgrade](../260512-0544-ch3-decuong-interaction-upgrade/plan.md) | pending (cancel) | Merged vào plan này |
| Builds on | [Batch Simulation Conversion V2](../260510-1615-batch-simulation-conversion-v2/plan.md) | completed | Migration baseline |

## Phases

> [!TIP]
> Sau Phase 00, ba nhánh CH1/CH2/CH3 có thể chạy **parallel** vì dùng files khác nhau. CH1 (Phases 01-05), CH2 (Phases 06-09), CH3 (Phases 10-12).

| Phase | Name | Status | Routes | Effort | Dep | Verify Gate |
|---:|---|---|---:|---:|---|---|
| 00 | [DeCuong Visual Foundation](./phase-00-decuong-visual-foundation.md) | Complete | 0 | 18h | — | Shared helpers + CSS + contract scenes pass |
| 01 | [CH1 Core Force Routes](./phase-01-ch1-core-force-routes.md) | Complete | 6 | 16h | 00 | ch1-1-* routes pass |
| 02 | [CH1 Axioms Parallelogram](./phase-02-ch1-axioms-parallelogram.md) | Complete | 4 | 14h | 01 | ch1-2-3 matches DeCuong |
| 03 | [CH1 Support Spatial](./phase-03-ch1-support-spatial.md) | Complete | 7 | 16h | 02 | ch1-3-* ch1-4-* pass |
| 04 | [CH1 Friction Centroid Exercises](./phase-04-ch1-friction-centroid-exercises.md) | Complete | 8 | 14h | 03 | ch1-5-* ch1-6-* ch1-7-* pass |
| 05 | [CH1 Full QA Gate](./phase-05-ch1-full-qa-gate.md) | Pending | 0 | 6h | 04 | 25/25 CH1 release clean |
| 06 | [CH2 Particle Trajectory](./phase-06-ch2-particle-trajectory.md) | Pending | 4 | 16h | 00 | ch2-1-* matches DeCuong particle |
| 07 | [CH2 Rotation Transmission](./phase-07-ch2-rotation-transmission.md) | Pending | 2 | 8h | 06 | ch2-2-2 ch2-3-2 pass |
| 08 | [CH2 Relative Plane Motion](./phase-08-ch2-relative-plane-motion.md) | Pending | 7 | 18h | 07 | ch2-4-* ch2-5-* pass |
| 09 | [CH2 Exercises QA Gate](./phase-09-ch2-exercises-qa-gate.md) | Pending | 2 | 8h | 08 | 15/15 CH2 release clean |
| 10 | [CH3 Newton ODE Routes](./phase-10-ch3-newton-ode-routes.md) | Pending | 10 | 20h | 00 | ch3-1-* to ch3-4-* pass |
| 11 | [CH3 Theorems Collision](./phase-11-ch3-theorems-collision.md) | Pending | 6 | 16h | 10 | ch3-5-* ch3-6-* pass |
| 12 | [CH3 Exercises Full Release](./phase-12-ch3-exercises-full-release.md) | Pending | 2 | 10h | 11 | 58/58 full release gate |

```
Parallel Execution Graph:

Phase 00 (Foundation)
  ├──► CH1: Phase 01 → 02 → 03 → 04 → 05
  ├──► CH2: Phase 06 → 07 → 08 → 09
  └──► CH3: Phase 10 → 11 → 12
                         ↘
                    Final Release Gate (Phase 12)
```

## Dependencies

### Runtime Modules
- `SimProfessionalLab`, `SimRouteRenderers`, `SimRouteBehaviors`, `SimSceneRegistry`

### Files Requiring W/H Update (560→760, 340→440)
- `js/sim-scene-templates.js` (L9)
- `js/sim-route-renderer-primitives.js` (L3)
- `js/sim-professional-lab.js` (L21)
- `js/sims/ch1/ch1-force-law-behaviors.js` (L13)
- `js/sims/ch1/ch1-support-spatial-behaviors.js` (L10)
- `js/sims/ch1/ch1-solver-exercises-behaviors.js` (L10)
- `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js` (L10)

### DeCuong Visual Reference
- `DeCuong_CoHocLyThuyet.html` — 3 reference sims (Parallelogram L3209-3364, Beam L3367-3499, Particle L3502-3621)

### Other
- Route count: 58 (25 CH1 + 15 CH2 + 18 CH3) per `sim-route-manifest.js`
- Contract scenes alignment: `zz-simulation-contract-scenes.js` → rewrite to match manifest
- No framework, no bundler, no manual `js/pages.js` edits
- KaTeX đã có sẵn (local fallback + CDN)
- Equation mapping: `data/equation_mapping.json` (702 rows)

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Canvas size change breaks renderer coordinates | High | High | Scale factor X=1.357 Y=1.294, update ALL 7 files, verify per route |
| Contract scenes rewrite breaks tests | Medium | Medium | Run full test suite after Phase 00, fix before route work |
| clearCanvas theme change causes visual regression | Medium | Low | DeCuong uses clearRect, test dark/light immediately |
| KaTeX offline not loading | Low | Low | KaTeX already has local fallback in index.html |
| Parallel execution causes file conflicts | Medium | Low | CH1/CH2/CH3 use separate behavior/renderer/scene files |
| DeCuong reference sim has different canvas heights | Low | N/A | Decision locked: uniform 440 for all routes |

## Success Criteria

- 58/58 routes render giống DeCuong quality: theme-aware grid, handle dots, color-coded readouts
- Canvas 760×440 responsive
- KaTeX equation display per route where applicable
- Trail effect visible trên tất cả routes
- Instant reset giống DeCuong `resetSim()`
- `file://` và static server mount pass
- Contract scenes aligned with manifest (58/58 match)
- Full release gate clean
- No English text leak in visible UI

## Verification Plan

### Per-Phase Gate
```powershell
# Static analysis
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct

# Runtime globals
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup

# Unit + Browser + Visual
npm run test:sim:unit
npm run test:sim:browser
npm run test:sim:visual-quality
```

### Final Release Gate (Phase 12)
```powershell
npm run test:sim:release
python tools\audit.py
```

### Manual Verification
- Screenshot dark/light per chapter gate
- Touch emulation drag test via Chrome DevTools
- `file://` offline mount test
- KaTeX rendering check per route

## Cook Handoff

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260512-0845-decuong-simulation-full-rebuild\plan.md
```

## Progress Log

### 2026-05-12
- Phase 00 complete: shared DeCuong foundation migrated to 760×440 canvas, theme-aware clear/grid, PI/7 arrows, route contract scenes/renderers/behaviors aligned to manifest 58 IDs, KaTeX equation panel fallback hardened, and scoped mount disposal added.
- Verification passed: `npm run test:sim:unit`, `npm run test:sim:browser`, `npm run test:sim:visual-quality`, renderer/manifest/scene/runtime smokes, `audit_simulation_quality.py --all --max-js-lines 220`, and `python tools\audit.py`.
- Phase 01 complete: rebuilt `ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-1-8`, and `ch1-2-1` with DeCuong-style 760×440 scenes, route-owned handles, trails, KaTeX/DOM overlays, and synchronized readout/control state.
- Verification passed: unit, targeted `ch1-1-3` tail-drag regression, full `@direct-drag|@control-audit`, strict Phase 01 scene/renderer contract smokes, visual-quality `@visual-all|@theme-all`, runtime smoke, quality audit, and content audit.
- Phase 02 complete: rebuilt `ch1-2-3`, `ch1-2-6`, `ch1-3-1`, and `ch1-3-2` with DeCuong parallelogram/FBD/support visuals, F1/F2 route-owned handles, support/tension geometry controls, trails, KaTeX overlays, and synchronized readout/control state.
- Verification passed: unit, strict 4-route scene catalog, strict 4-route renderer contract, quality audit max 220 lines, targeted `ch1-2-3|ch1-2-6|ch1-3` interaction suite (6 tests), and visual-quality `@visual-all|@theme-all` across 58 routes. Code review found no blockers after fixes.
- Phase 03 complete: rebuilt `ch1-3-3`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7`, `ch1-4-1`, `ch1-4-2`, and `ch1-4-4` with DeCuong-style support/spatial visuals, route-owned handles, trails, beam reactions, KaTeX overlays, and synchronized readout/control state.
- Verification passed: unit, strict 7-route scene catalog, targeted renderer contract, targeted `ch1-3|ch1-4` interaction suite (10 tests), all-route `@control-audit|@direct-drag-audit`, visual-quality `@visual-all|@theme-all`, runtime/manifest/route smokes, and quality audit. Code review findings were fixed and re-reviewed clean.
- Phase 04 complete: rebuilt `ch1-5-1`, `ch1-5-2`, `ch1-5-3`, `ch1-5-4`, `ch1-6-2`, `ch1-6-3`, `ch1-7-1`, and `ch1-7-2` with DeCuong-style friction thresholds, friction cone/self-locking wedge, centroid composite/cutout visuals, solver/checker boards, route-owned handles, trails, KaTeX overlays, and synchronized readout/control state.
- Verification passed: unit, strict 8-route manifest/scene/renderer gates, runtime smoke, all-route `@direct-drag-audit`, Phase 04 semantic regressions for `ch1-5-1`, `ch1-6-2`, and `ch1-5-4`, visual-quality `@visual-all|@theme-all|@renderer-contract|@scene-identity`, tester re-validation, and code re-review after fixes.
