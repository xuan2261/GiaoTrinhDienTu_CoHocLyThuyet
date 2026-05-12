---
phase: 2
title: "CH1 Axioms Parallelogram"
status: complete
priority: P1
effort: "14h"
dependencies: [1]
---

# Phase 02: CH1 Axioms & Parallelogram

## Overview
Rebuild 4 routes tiên đề. **ch1-2-3 là flagship** — phải render EXACT giống DeCuong.

**Completed 2026-05-12:** Phase 02 rebuilt the 4 route simulations with DeCuong-style canvas rendering, route-owned handles, trails, KaTeX overlays, synchronized readouts/controls, and post-review regressions for F1 drag and support alpha geometry.

## Context Links
- [DeCuong Parallelogram Sim](../../DeCuong_CoHocLyThuyet.html) — L3209-3364, reference implementation
- [Phase 00 Visual Spec](./phase-00-decuong-visual-foundation.md) — DeCuong extracted specs

## Route Matrix

| Route | Tên | Key Visual |
|---|---|---|
| `ch1-2-3` | Hình bình hành lực | EXACT DeCuong: parallelogram fill, dashed sides, handle dots |
| `ch1-2-6` | Giải phóng liên kết | FBD diagram auto-update |
| `ch1-3-1` | Liên kết tựa | Normal force N perpendicular |
| `ch1-3-2` | Dây mềm | Tension T along rope |

## Related Code Files
- Modify: `js/sims/ch1/ch1-force-law-renderers.js`
- Modify: `js/sims/ch1/ch1-support-renderers.js`
- Modify: `js/sims/ch1/ch1-force-law-behaviors.js`
- Modify: `js/sims/ch1/ch1-force-law-scenes.js`

## Implementation Steps

### ch1-2-3 (FLAGSHIP — match DeCuong visual spec)

DeCuong exact specification (from `DeCuong_CoHocLyThuyet.html` L3209-3364):

| Element | Spec |
|---------|------|
| Canvas | 760×440 (uniform) |
| Origin O | Fixed, 5px dot, theme text color |
| F1 endpoint | Draggable, initial `{x:350, y:180}` (scaled for 760×440) |
| F2 endpoint | Draggable, initial `{x:380, y:300}` (scaled for 760×440) |
| F1 arrow | `#e74c3c`, lineWidth 3 |
| F2 arrow | `#2980b9`, lineWidth 3 |
| R arrow | `#27ae60`, lineWidth 3.5, `R = F1 + F2 - O` |
| Parallelogram fill | dark `rgba(39,174,96,.08)` / light `rgba(39,174,96,.12)` |
| Parallelogram stroke | dark `rgba(39,174,96,.25)` / light `rgba(39,174,96,.35)`, lineWidth 1 |
| Dashed sides | `[6,4]`, lineWidth 1.5, globalAlpha .4 |
| Angle arc | 35px radius, dark `rgba(201,150,58,.6)` / light `rgba(139,105,20,.6)` |
| Labels font | `bold 14px "Segoe UI"` (F₁/F₂/R), `12px` (α) |
| Handle dots | 8px outer (force color) + 3px white inner |
| Hit radius | Mouse 15px, Touch 25px |
| Readout | |F₁| N, |F₂| N, |R| N, α° |
| Theme | MutationObserver on `data-theme` → re-render |
| Reset | `resetSim()` → F1={350,180}, F2={380,300}, render() |

Implementation:
1. Origin O fixed at scaled position, F1/F2 draggable with 8px+3px handles
2. R = F1+F2-O, parallelogram fill + dashed sides
3. Force arrows: F1=red, F2=blue, R=green, arrowhead `PI/7`
4. Angle arc 35px, labels F₁/F₂/R/α
5. KaTeX: `\vec{R} = \vec{F}_1 + \vec{F}_2`
6. Readout cards |F₁|, |F₂|, |R|, α°

### ch1-2-6, ch1-3-1, ch1-3-2
- FBD transition, normal force, rope tension — each with KaTeX + trail + DeCuong visual
- ch1-3-1: reference DeCuong Beam Sim (L3367-3499) for support visual style

## Todo List
- [x] ch1-2-3 renderer EXACT DeCuong match
- [x] ch1-2-6 FBD transition
- [x] ch1-3-1 surface + normal force (use beam support visual style)
- [x] ch1-3-2 rope + tension
- [x] KaTeX + trail for each
- [x] Screenshot comparison vs DeCuong via browser visual-quality gate

## Verification / Tests
```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-2-3 ch1-2-6 ch1-3-1 ch1-3-2 --require-routes 4
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch1-2-3|ch1-2-6|ch1-3"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"
npm run test:sim:unit
```

## Success Criteria
- [x] ch1-2-3 visually matches DeCuong parallelogram (per spec table above)
- [x] Handle dots 8px + 3px white, theme-aware grid 30px step
- [x] Parallelogram fill + dashed sides correct colors
- [x] KaTeX renders inline
- [x] Angle arc with α label visible

## Verification Summary
- 2026-05-12: `npm run test:sim:unit` PASS.
- 2026-05-12: `python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-2-3 ch1-2-6 ch1-3-1 ch1-3-2 --require-routes 4` PASS.
- 2026-05-12: `python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-2-3 ch1-2-6 ch1-3-1 ch1-3-2 --require-routes 4` PASS.
- 2026-05-12: `python tools\audit_simulation_quality.py --all --max-js-lines 220` PASS.
- 2026-05-12: `npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch1-2-3|ch1-2-6|ch1-3"` PASS, 6 tests.
- 2026-05-12: `npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"` PASS, 2 tests across 58 routes.
- 2026-05-12: Code review final PASS with no blockers after fixing F1 slider sync, support alpha geometry, bounded parallelogram resultant, and FBD initial force mismatch.

## Risk Assessment
- Risk: coordinate positions from DeCuong (O={200,300}) may need adjustment for new layout. Mitigation: test visually, adjust if needed.
