---
phase: 7
title: "CH2 Rotation Transmission"
status: complete
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
- Modify: `js/sims/ch2/ch2-kinematics-scenes.js`
- Modify: `js/sims/ch2/ch2-kinematics-behaviors-a.js`
- Modify: `js/sim-professional-lab.js`

## Implementation Steps
1. ch2-2-2: rotating disk with P on rim, drag angle, ω/ε vectors, trail of P
2. ch2-3-2: 2 circular gears/pulleys, drag r₁ radius, auto-compute ω₂ = ω₁·r₁/r₂
3. KaTeX: `\omega = \dot{\varphi}`, `\varepsilon = \dot{\omega}`, `\omega_2 = \omega_1 \cdot r_1/r_2`
4. Animation: rotation animation with speed control

## Todo List
- [x] ch2-2-2 rotation renderer
- [x] ch2-3-2 transmission renderer
- [x] KaTeX rotation/transmission formulas
- [x] Animation controls

## Verification / Tests
```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch2-2-2 ch2-3-2 --require-routes 2
python tools\smoke_simulation_renderer_contract.py --strict --routes ch2-2-2 ch2-3-2 --require-routes 2
npx playwright test tests/simulation-interaction-engine.spec.js --grep "@direct-drag-audit|@control-audit|@animation|@reset"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all|@renderer-contract|@scene-identity"
npm run test:sim:unit
```

## Success Criteria
- [x] Gear ratio interaction clear and responsive
- [x] Rotation animation smooth with trail

## Completion Notes

- `ch2-2-2` rebuilt with DeCuong-style 760x440 disk scene, route-owned P drag, omega/epsilon/v/an/at vectors, 30-point trail, and KaTeX overlays.
- `ch2-3-2` rebuilt with two-pulley belt transmission, r1 handle/slider sync, omega2 = omega1*r1/r2, dual trails, radius dimensions, and KaTeX overlays.
- Verification passed: unit, strict 2-route scene catalog, strict 2-route renderer contract, all-route control/direct-drag/reset/animation browser gate, and all-route visual/theme/identity gate.
