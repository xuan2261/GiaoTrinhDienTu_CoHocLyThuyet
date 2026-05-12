---
phase: 3
title: "CH1 Support Spatial"
status: complete
priority: P1
effort: "16h"
dependencies: [2]
---

# Phase 03: CH1 Support & Spatial Routes

## Overview
Rebuild 7 routes: phản lực liên kết còn lại + hệ lực không gian. ch1-3-4 (gối) phải giống DeCuong beam sim.

## Context Links
- [DeCuong Beam Sim](../../DeCuong_CoHocLyThuyet.html) — L3367-3499, beam reaction reference
- [Phase 00 Visual Spec](./phase-00-decuong-visual-foundation.md) — DeCuong extracted specs

## Route Matrix

| Route | Tên | Key Visual |
|---|---|---|
| `ch1-3-3` | Bản lề | Hx, Hy reaction arrows |
| `ch1-3-4` | Gối di động/cố định | **DeCuong beam**: triangle supports, roller, P drag, ΣF=0 equation |
| `ch1-3-6` | Ngàm | Moment + force reactions |
| `ch1-3-7` | Thanh 2 lực | Verify collinear, opposite |
| `ch1-4-1` | Véc tơ chính HLKG | Pseudo-3D axes |
| `ch1-4-2` | Mô men chính HLKG | Moment about axis |
| `ch1-4-4` | Cân bằng HLKG | 3 equilibrium equations |

## Related Code Files
- Modify: `js/sims/ch1/ch1-support-renderers.js`
- Modify: `js/sims/ch1/ch1-spatial-renderers.js`
- Modify: `js/sims/ch1/ch1-support-spatial-behaviors.js`
- Modify: `js/sims/ch1/ch1-support-spatial-scenes.js`

## Implementation Steps (ch1-3-4 beam — DeCuong match)

DeCuong Beam Sim spec (from L3367-3499):

| Element | Spec |
|---------|------|
| Canvas | 760×440 (uniform, DeCuong beam uses 760×380 but we standardize 440) |
| Beam | `beamY=240` (scaled), `beamL=500`, `beamX0=130`, fill dark `rgba(201,150,58,.15)` / light `.2`, stroke dark `rgba(201,150,58,.5)` / light `rgba(139,105,20,.5)` |
| Ground hatching | 15px spacing, diagonal lines below beam |
| Pin A (triangle) | `size=12`, dark `#3498db` / light `#2471a3` |
| Roller B | circle `r=8` + triangle `size=12` |
| Force P | drag handle (8px red + 3px white), arrow pointing down |
| Reactions | R_A, R_B arrows green `#27ae60`, lineWidth `2.5` |
| Distance marker | Dashed `[4,3]`, `rgba(231,76,60,.4)`, `a = x.x m` label |
| Equation | DOM text: `ΣF_y = 0: R_A + R_B - P = 0`, `ΣM_A = 0: R_B·L - P·a = 0` |

Steps:
1. Beam: filled rect + gold stroke at beamY
2. Triangle pin A at left, roller B at right
3. Ground hatching below beam
4. Force P: drag handle, arrow pointing down
5. Reaction R_A, R_B arrows green pointing up
6. Distance marker `a = x.x m`
7. KaTeX: `\sum F_y = 0: R_A + R_B - P = 0`, `\sum M_A = 0: R_B \cdot L - P \cdot a = 0`

## Todo List
- [x] ch1-3-3 hinge reactions
- [x] ch1-3-4 beam DeCuong match (per spec table)
- [x] ch1-3-6 fixed support
- [x] ch1-3-7 two-force member
- [x] ch1-4-1 to ch1-4-4 spatial routes (3 routes)
- [x] KaTeX + trail for each

## Verification / Tests
```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch1-3-3 ch1-3-4 ch1-3-6 ch1-3-7 ch1-4-1 ch1-4-2 ch1-4-4 --require-routes 7
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch1-3|ch1-4"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"
npm run test:sim:unit
```

## Success Criteria
- [x] 7/7 routes render DeCuong-style visuals
- [x] ch1-3-4 matches DeCuong beam visual (supports, hatching, reactions)
- [x] All support routes show correct reaction arrows
- [x] Spatial routes readable with pseudo-3D
- [x] KaTeX equations display correctly

## Completion Notes
- Completed: 2026-05-12
- Rebuilt `ch1-3-3`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7`, `ch1-4-1`, `ch1-4-2`, and `ch1-4-4`.
- Added direct-drag regressions for all 7 Phase 03 routes in `tests/simulation-interaction-engine.spec.js`.
- Code review findings fixed: `alpha` controls now change geometry for `ch1-3-7` and `ch1-4-2`; `ch1-3-4` force slider min/max and derived clamp now agree.
- Verification passed: syntax checks, unit, strict 7-route scene catalog, targeted renderer contract, targeted Phase 03 interaction suite, all-route control/direct-drag audit, visual-quality `@visual-all|@theme-all`, runtime smoke, manifest smoke, route smoke, and quality audit.

## Risk Assessment
- Risk: beam layout needs Y offset adjustment for 440 height (DeCuong uses 380). Mitigation: scale beamY proportionally.
