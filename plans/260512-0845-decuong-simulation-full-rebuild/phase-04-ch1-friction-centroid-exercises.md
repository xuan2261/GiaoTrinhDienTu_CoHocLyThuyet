---
phase: 4
title: "CH1 Friction Centroid Exercises"
status: complete
priority: P1
effort: "14h"
dependencies: [3]
---

# Phase 04: CH1 Friction, Centroid & Exercises

## Overview
Rebuild 8 routes: ma sát, trọng tâm, bài tập tĩnh học.

## Route Matrix

| Route | Tên | Key Visual |
|---|---|---|
| `ch1-5-1` | Phản lực + ma sát | N + friction arrows, μN label |
| `ch1-5-2` | Ma sát nghỉ/trượt/lăn | State indicator, threshold bar |
| `ch1-5-3` | Nón ma sát + nghiêng | Cone visualization, incline angle drag |
| `ch1-5-4` | Tự hãm nêm/vít | Self-locking condition indicator |
| `ch1-6-2` | Trọng tâm hình ghép | Composite areas, G marker drag |
| `ch1-6-3` | Trọng tâm đối xứng/khoét | Symmetry lines, cutout visualization |
| `ch1-7-1` | Bài tập step-by-step | Step buttons, progress indicator |
| `ch1-7-2` | Đối chiếu kết quả | Result verification panel |

## Related Code Files
- Modify: `js/sims/ch1/ch1-friction-renderers.js`
- Modify: `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js`
- Modify: `js/sims/ch1/ch1-friction-centroid-solver-scenes.js`
- Modify: `js/sims/ch1/ch1-centroid-solver-renderers.js`
- Modify: `js/sims/ch1/ch1-solver-exercises-renderers.js`
- Modify: `js/sims/ch1/ch1-solver-exercises-behaviors.js`
- Modify: `js/sims/ch1/ch1-solver-exercises-scenes.js`

## Implementation Steps
1. Friction routes: incline angle drag, friction cone, state (bám/trượt) indicator
2. KaTeX: `F_{\text{ms}} \leq \mu N`, `\tan\alpha \leq \mu`
3. Centroid routes: composite shape drag, centroid marker G
4. KaTeX: `x_G = \frac{\sum S_i x_i}{\sum S_i}`
5. Exercise routes: step-by-step solver with DeCuong-style immediate feedback
6. Trail + theme-aware grid for all routes

## Todo List
- [x] ch1-5-1 to ch1-5-4 friction routes
- [x] ch1-6-2, ch1-6-3 centroid routes
- [x] ch1-7-1, ch1-7-2 exercise routes
- [x] KaTeX equations for friction/centroid formulas

## Verification / Tests
```powershell
python tools\smoke_simulation_manifest.py --routes ch1-5 ch1-6 ch1-7 --require-routes 8 --require-objectives --require-direct
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch1-5|ch1-6|ch1-7"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all"
npm run test:sim:unit
```

## Success Criteria
- [x] Friction state indicator visible and correct
- [x] Centroid G marker updates on drag
- [x] Exercise solver shows step-by-step feedback

## Completion Notes

### 2026-05-12
- Rebuilt 8 Phase 04 routes with DeCuong-style 760x440 friction, centroid, and solver visuals.
- Added route-specific derived models for `Fms`, `mu N`, `tan alpha`, `lockState`, `xG/yG`, residual checks, and step progress.
- Added regression coverage for Phase 04 semantic drag/readout sync and `ch1-5-4` self-locking geometry/readout alignment.
- Verification passed: unit, targeted manifest/scene/renderer/runtime smokes, all-route direct-drag audit, Phase 04 semantic regressions, and visual-quality `@visual-all|@theme-all|@renderer-contract|@scene-identity`.
