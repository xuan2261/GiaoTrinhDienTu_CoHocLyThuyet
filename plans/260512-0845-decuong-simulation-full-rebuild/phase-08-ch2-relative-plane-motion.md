---
phase: 8
title: "CH2 Relative Plane Motion"
status: pending
priority: P1
effort: "18h"
dependencies: [7]
---

# Phase 08: CH2 Relative & Plane Motion

## Overview
Rebuild 7 routes: hợp chuyển động, chuyển động song phẳng, tâm vận tốc tức thời.

## Route Matrix

| Route | Tên | Key Visual |
|---|---|---|
| `ch2-4-1` | Hợp chuyển động | vₐ = vₑ + v_r triangle, drag vₐ endpoint |
| `ch2-4-2` | Tuyệt đối/tương đối/kéo theo | 3 vectors color-coded |
| `ch2-4-3` | Tam giác vận tốc | Interactive velocity triangle |
| `ch2-4-4` | Gia tốc Coriolis | Rotating frame + Coriolis vector |
| `ch2-5-1` | Chuyển động song phẳng | Rigid body with translation + rotation |
| `ch2-5-2` | Tâm vận tốc tức thời (IC) | IC point marker, velocity distribution |
| `ch2-5-3` | Phân bố vận tốc | Multiple velocity arrows from IC |

## Related Code Files
- Modify: `js/sims/ch2/ch2-relative-motion-velocity-renderers.js`
- Modify: `js/sims/ch2/ch2-relative-renderers.js`
- Modify: `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js`
- Modify: `js/sims/ch2/ch2-plane-checker-renderers.js`
- Modify: `js/sims/ch2/ch2-kinematics-behaviors-b.js`
- Modify: `js/sims/ch2/ch2-relative-plane-motion-scenes.js`

## Implementation Steps
1. ch2-4-1: velocity triangle v_a = v_e + v_r, drag v_a tip
2. ch2-4-2: 3 labeled vectors (absolute red, relative blue, transport green)
3. ch2-4-3: interactive triangle construction
4. ch2-4-4: rotating frame, Coriolis a_c = 2ω × v_r
5. ch2-5-1: rigid body translating + rotating
6. ch2-5-2: IC point, velocity arrows from IC
7. ch2-5-3: multiple points on body with velocity arrows

KaTeX equations:
- `\vec{v}_a = \vec{v}_e + \vec{v}_r`
- `\vec{a}_c = 2\vec{\omega} \times \vec{v}_r`
- `\vec{v}_A = \vec{\omega} \times \overrightarrow{IA}`

## Todo List
- [ ] ch2-4-1 to ch2-4-4 relative motion routes
- [ ] ch2-5-1 to ch2-5-3 plane motion routes
- [ ] Velocity triangle interactive
- [ ] IC visualization with velocity distribution
- [ ] KaTeX + trail for each

## Verification / Tests
```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch2-4 ch2-5 --require-routes 7
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch2-4|ch2-5"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"
npm run test:sim:unit
```

## Success Criteria
- [ ] Velocity triangle interactive and correct
- [ ] IC point + velocity distribution visible
- [ ] Coriolis vector direction correct
