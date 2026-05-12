---
phase: 11
title: "CH3 Theorems Collision"
status: pending
priority: P1
effort: "16h"
dependencies: [10]
---

# Phase 11: CH3 Theorems & Collision

## Overview
Rebuild 6 routes: các định lý tổng quát + va chạm.

## Context Links
- [Phase 00 Visual Spec](./phase-00-decuong-visual-foundation.md) — DeCuong extracted specs
- [Phase 10 Newton ODE](./phase-10-ch3-newton-ode-routes.md) — previous CH3 phase

## Route Matrix

| Route | Tên | Key Visual |
|---|---|---|
| `ch3-5-1` | Chuyển động khối tâm | Multi-body + G marker trail |
| `ch3-5-2` | Động lượng + xung lượng | p = mv vector, impulse FΔt |
| `ch3-5-3` | Mô men động lượng | L = r×mv, angular momentum conservation |
| `ch3-5-4` | Định lý động năng | KE bar + work integral display |
| `ch3-6-2` | Va chạm (e slider) | 2 spheres, drag e, before/after velocities |
| `ch3-6-3` | Va chạm đàn hồi/mềm/xiên | Collision type tabs, angle drag |

## Related Code Files
- Modify: `js/sims/ch3/ch3-theorems-renderers.js` — theorem routes rendering
- Modify: `js/sims/ch3/ch3-collision-exercises-renderers.js` — collision routes rendering
- Modify: `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js` — behavior contracts
- Modify: `js/sims/ch3/ch3-dynamics-all-18-scenes.js` — scene configs

## Implementation Steps
1. ch3-5-1: multiple bodies, center of mass G animated, trail for G
2. ch3-5-2: momentum vectors p₁, p₂, impulse FΔt with time slider
3. ch3-5-3: rotating body, angular momentum L vector, conservation demo
4. ch3-5-4: kinetic energy bar chart, work integral display
5. ch3-6-2: 2 balls, e slider [0,1], play collision, v₁'/v₂' readout
6. ch3-6-3: tabs (đàn hồi/mềm/xiên), angle drag for oblique

KaTeX:
- `\vec{p} = m\vec{v}`, `\Delta\vec{p} = \vec{S} = \int \vec{F}\,dt`
- `\vec{L}_O = \vec{r} \times m\vec{v}`
- `T = \frac{1}{2}mv^2`, `A_{12} = T_2 - T_1`
- `e = \frac{v_2' - v_1'}{v_1 - v_2}`

## Todo List
- [ ] ch3-5-1 to ch3-5-4 theorem routes
- [ ] ch3-6-2 collision with e slider
- [ ] ch3-6-3 collision types
- [ ] Energy bar chart visualization
- [ ] Momentum conservation demo
- [ ] KaTeX theorem formulas

## Verification / Tests
```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch3-5-1 ch3-5-2 ch3-5-3 ch3-5-4 ch3-6-2 ch3-6-3 --require-routes 6
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch3-5|ch3-6|@animation"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"
npm run test:sim:unit
```

## Success Criteria
- [ ] Collision e slider responsive, physics correct
- [ ] Momentum conservation visible in readouts
- [ ] Energy bar chart updates with animation
- [ ] All 6 routes render DeCuong-quality visuals

## Risk Assessment
- Risk: collision animation timing needs careful lifecycle management. Mitigation: use scope.requestFrame for deterministic cleanup.
