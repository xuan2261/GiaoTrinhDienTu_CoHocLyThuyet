---
phase: 10
title: "CH3 Newton ODE Routes"
status: complete
priority: P1
effort: "20h"
dependencies: [0]
---

# Phase 10: CH3 Newton & ODE Routes

## Context Links
- [Phase 00 Visual Spec](./phase-00-decuong-visual-foundation.md) — DeCuong extracted specs

## Overview
Rebuild 10 routes: định luật Newton, PTVP chuyển động, bài toán thuận/ngược.

## Route Matrix

| Route | Tên | Key Visual |
|---|---|---|
| `ch3-1-2` | Lực → chuyển động | F arrow drag → body accelerates, a = F/m |
| `ch3-1-3` | Hệ quy chiếu | Inertial vs non-inertial comparison |
| `ch3-2-1` | Định luật quán tính | Body at rest/motion when ΣF=0 |
| `ch3-2-2` | F = ma | Drag F, see a change, F/m/a readout |
| `ch3-2-3` | Tác dụng/phản tác dụng | 2 bodies with equal-opposite force pairs |
| `ch3-2-5` | Dynamic FBD | Moving body + constraint reactions |
| `ch3-3-1` | PTVP chất điểm | Spring-mass oscillation, x(t) graph |
| `ch3-3-2` | PTVP cơ hệ | Coupled springs/masses |
| `ch3-4-1` | Bài toán thuận | Given F → find motion (integrate) |
| `ch3-4-2` | Bài toán ngược | Given motion → find F |

## Related Code Files
- Modify: `js/sims/ch3/ch3-newton-laws-renderers.js`
- Modify: `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js`
- Modify: `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js`
- Modify: `js/sims/ch3/ch3-dynamics-all-18-scenes.js`

## Implementation Steps
1. Newton routes: body + force arrow + acceleration indicator
2. ch3-2-2: drag F magnitude → a changes → readout F=ma
3. ch3-3-1: spring-mass animation, displacement trail, energy bar
4. ch3-3-2: coupled system animation
5. ch3-4-1: given F, show computed trajectory
6. ch3-4-2: drag desired trajectory, show required F

KaTeX equations:
- `m\vec{a} = \vec{F}` (Newton II)
- `\vec{F}_{12} = -\vec{F}_{21}` (Newton III)
- `m\ddot{x} + kx = 0` (SHM)
- `m\ddot{x} = F(t)` (forced motion)

## Todo List
- [x] ch3-1-2, ch3-1-3 concept routes
- [x] ch3-2-1 to ch3-2-5 Newton laws routes
- [x] ch3-3-1, ch3-3-2 ODE/spring routes
- [x] ch3-4-1, ch3-4-2 forward/inverse problem routes
- [x] Spring oscillation animation with energy bar
- [x] KaTeX dynamics formulas
- [x] Trail for all animated routes

## Verification / Tests
```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch3-1 ch3-2 ch3-3 ch3-4 --require-routes 10
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch3-1|ch3-2|ch3-3|ch3-4|@animation"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"
npm run test:sim:unit
```

## Success Criteria
- [x] F=ma relation visible and interactive
- [x] Spring oscillation smooth with energy readout
- [x] Animation lifecycle deterministic
- [x] Physics readouts don't drift while paused

## Completion Notes

- CH3 Newton/ODE routes pass strict scene/renderer contract gates for `ch3-1` through `ch3-4`.
- `ch3-3-1` opens with non-zero spring displacement so energy and trajectory readouts are meaningful immediately.
- `ch3-3-2` now creates and appends both trajectory arrays when missing, preventing silent loss of coupled-spring samples.
- Verification passed: Phase 10 strict scene/renderer gates, `npm run test:sim:unit`, targeted CH3 interaction/animation checks, `npm run test:sim:visual-quality`, and final release gate.
