---
phase: 6
title: "CH2 Particle Trajectory"
status: pending
priority: P1
effort: "16h"
dependencies: [0]
---

# Phase 06: CH2 Particle & Trajectory Routes

## Context Links
- [DeCuong Particle Sim](../../DeCuong_CoHocLyThuyet.html) — L3502-3621, particle motion reference
- [Phase 00 Visual Spec](./phase-00-decuong-visual-foundation.md) — DeCuong extracted specs

## Overview
Rebuild 4 routes chuyển động chất điểm. **ch2-1-1 phải match DeCuong particle sim** (lines 3502-3621): trajectory dashed, trail 30 points, velocity/acceleration vectors, play/pause/speed/path controls.

## Route Matrix

| Route | Tên | Key Visual |
|---|---|---|
| `ch2-1-1` | Quỹ đạo + v + a | **DeCuong particle**: dashed trajectory, trail, v(red)/aₙ(blue)/aτ(orange), particle dot, speed+path controls |
| `ch2-1-2` | Đồ thị x/v/a | Graph cursor drag, synchronized x/v/a readouts |
| `ch2-1-3` | Tọa độ tự nhiên | τ/n/ρ visualization, drag point on curve |
| `ch2-1-4` | Preset motion | Path selector (Tròn/Elip/Parabol), speed slider |

## Related Code Files
- Modify: `js/sims/ch2/ch2-particle-renderers.js`
- Modify: `js/sims/ch2/ch2-trajectory-graph-renderers.js`
- Modify: `js/sims/ch2/ch2-kinematics-behaviors-a.js`
- Modify: `js/sims/ch2/ch2-kinematics-scenes.js`

## Implementation Steps

### ch2-1-1 (DeCuong particle match)
1. Path functions: `getPos(t)` for ellipse/circle/figure8
2. Trail: last 30 points, `rgba(231,76,60,.3)`, lineWidth 3
3. Trajectory: dashed `[5,3]`, `rgba(255,255,255,.15)` dark / `rgba(0,0,0,.12)` light
4. Velocity vector: red `#e74c3c`, scale 0.6, label `v`
5. Normal accel: blue `#2980b9`, scale 0.15, label `aₙ` (only if |aₙ|>0.5)
6. Tangential accel: orange `#e67e22`, scale 0.15, label `aτ` (only if |aτ|>0.5)
7. Particle: 7px dot + 3px white center
8. Controls: speed slider (0.5-4), path dropdown, play/pause, reset
9. Readout: |v|, |aτ|, |aₙ|, ρ
10. KaTeX: `\vec{a} = a_\tau\vec{\tau} + a_n\vec{n}`, `a_n = v^2/\rho`
11. Animation: `t += 0.02 * speedVal`, requestAnimationFrame

### ch2-1-2: Graph cursor
1. Draw x(t), v(t), a(t) curves on canvas
2. Vertical cursor line — drag horizontally
3. Readouts sync with cursor position
4. KaTeX: `v = \dot{x}`, `a = \ddot{x}`

### ch2-1-3: Natural coordinates
1. Curve with moving point P
2. τ (tangent), n (normal), ρ (radius of curvature) visualization
3. Drag P along curve
4. KaTeX: `\vec{v} = v\vec{\tau}`, `\vec{a} = \dot{v}\vec{\tau} + \frac{v^2}{\rho}\vec{n}`

### ch2-1-4: Preset motion
1. 3 trajectory presets: Tròn, Elip, Parabol
2. Speed slider
3. Auto-animate along chosen path

## Todo List
- [ ] ch2-1-1 renderer matching DeCuong particle
- [ ] ch2-1-2 graph cursor renderer
- [ ] ch2-1-3 natural coordinates renderer
- [ ] ch2-1-4 preset motion renderer
- [ ] Play/pause/reset controls for animated routes
- [ ] KaTeX kinematics formulas
- [ ] Trail for all 4 routes

## Verification / Tests
```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch2-1 --require-routes 4
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch2-1-1|ch2-1-2|@animation|@direct-drag"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"
npm run test:sim:unit
# Manual: play/pause, speed adjustment, path switching
```

## Success Criteria
- [ ] ch2-1-1 matches DeCuong particle (trail, vectors, controls)
- [ ] Graph cursor syncs with readouts
- [ ] Animation stable: no drift, clean reset
