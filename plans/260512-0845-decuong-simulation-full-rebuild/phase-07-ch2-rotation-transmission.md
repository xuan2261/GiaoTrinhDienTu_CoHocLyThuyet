---
phase: 7
title: "CH2 Rotation Transmission"
status: pending
priority: P1
effort: "8h"
dependencies: [6]
---

# Phase 07: CH2 Rotation & Transmission

## Overview
Rebuild 2 routes quay và truyền động.

## Route Matrix

| Route | Tên | Key Visual |
|---|---|---|
| `ch2-2-2` | Quay quanh trục cố định | Rotating disk, ω/ε vectors, point P tracing circle |
| `ch2-3-2` | Truyền động bánh răng/đai | 2 gears/pulleys, ratio drag, ω₁/ω₂ readout |

## Related Code Files
- Modify: `js/sims/ch2/ch2-rotation-gear-renderers.js`
- Modify: `js/sims/ch2/ch2-rotation-transmission-renderers.js`
- Modify: `js/sims/ch2/ch2-particle-rotation-transmission-scenes.js`
- Modify: `js/sims/ch2/ch2-kinematics-behaviors-a.js`

## Implementation Steps
1. ch2-2-2: rotating disk with P on rim, drag angle, ω/ε vectors, trail of P
2. ch2-3-2: 2 circular gears/pulleys, drag r₁ radius, auto-compute ω₂ = ω₁·r₁/r₂
3. KaTeX: `\omega = \dot{\varphi}`, `\varepsilon = \dot{\omega}`, `\omega_2 = \omega_1 \cdot r_1/r_2`
4. Animation: rotation animation with speed control

## Todo List
- [ ] ch2-2-2 rotation renderer
- [ ] ch2-3-2 transmission renderer
- [ ] KaTeX rotation/transmission formulas
- [ ] Animation controls

## Verification / Tests
```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch2-2-2 ch2-3-2 --require-routes 2
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch2-2-2|ch2-3-2"
npm run test:sim:unit
```

## Success Criteria
- [ ] Gear ratio interaction clear and responsive
- [ ] Rotation animation smooth with trail
