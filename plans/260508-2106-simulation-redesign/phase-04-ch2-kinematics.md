---
phase: 04
title: "Ch2 Kinematics 16 Routes"
status: completed
priority: P1
effort: 2 tuần
dependencies: [02]
---

# Phase 04: Ch2 Kinematics 16 Routes

## Overview

Implement đầy đủ 16 routes Chương 2 — Động học: Cartesian trajectory, position/velocity graphs, natural coordinates, motion templates, rotation kinematics, gear transmission, relative motion, Coriolis, instant center, slider-crank. Tất cả đều có animation theo thời gian với timeline scrubber + playback controls.

## Requirements

- **Functional:** 16/16 routes có full animation (play → motion). Timeline scrubber. Playback speed. Readout theo thời gian.
- **Non-functional:** Smooth 60fps animation; scrubber seek chính xác; consistent playback UI

## Route Inventory (16 routes)

| Route ID | Simulation | Physics | Animation |
|----------|-----------|---------|-----------|
| ch2-1-1 | Cartesian trajectory (preset) | x(t), y(t) parametric | Particle moves on path |
| ch2-1-2 | Trajectory: position graph | x(t) = f(t), y(t) = g(t) | Graph cursor syncs |
| ch2-2-1 | Velocity-time graph reading | v = dx/dt | Graph cursor |
| ch2-2-2 | Acceleration graph | a = dv/dt | Graph cursor |
| ch2-3-1 | Natural coordinates | s(t), θ(t) | Curvilinear motion |
| ch2-3-2 | Motion templates | uniform/accelerated/circular | Playback with presets |
| ch2-4-1 | Rotation kinematics | θ(t), ω(t), α(t) | Wheel rotates |
| ch2-4-2 | Angular velocity/acceleration | ω=dθ/dt, α=dω/dt | Animated rotation graph |
| ch2-5-1 | Gear transmission | ω₁/ω₂ = N₂/N₁ | Gears mesh + rotate |
| ch2-5-2 | Belt/pulley system | v = r·ω relationship | Belt animates |
| ch2-5-3 | Slider-crank | x = r·cosθ + √(l²-r²sin²θ) | Crank rotates, slider translates |
| ch2-6-1 | Relative motion (absolute/relative) | v_A = v_B + v_AB | Two particles |
| ch2-6-2 | Carry-along velocity | v_carrier = ω × r | Rotating reference |
| ch2-6-3 | Coriolis acceleration | a_C = 2·ω × v_rel | Coriolis path viz |
| ch2-7-1 | Instant center (IC) | IC velocity method | IC point animates |
| ch2-7-2 | Plane motion IC | Translation + rotation IC | Rolling without slip |

## Related Code Files

- **Create:** `js/routes/chapter-kinematics.js` (16 route configs)
- **Modify:** `js/routes/route-registry.js`, `js/simulations.js`
- **Read:** `js/sims/ch2/ch2-particle-*.js`, `js/sims/ch2/ch2-kinematics-*.js`, `js/sims/ch2/ch2-relative-*.js`, `js/sims/ch2/ch2-trajectory-graph-*.js`

## Implementation Steps

1. **Implement ch2-1-1 — Cartesian trajectory**
   - Scene: 1 particle body
   - Physics: parametric path `getPos(t)`: circle `x=CX+140cos(t), y=CY+140sin(t)`, ellipse, lemniscate, parabola
   - Path selector: dropdown/buttons để chọn path type
   - Render: path trail (fading), particle dot, velocity vector, acceleration vector (decomposed)
   - Animation: RAF loop tăng t, particle moves, trail accumulates
   - Playback: ▶/⏸ + speed selector
   - Readout: v (magnitude), a (magnitude), v_x, v_y, a_t (tangential), a_n (normal)

2. **Implement ch2-1-2 — Position graph**
   - Dual-canvas: simulation canvas + graph canvas
   - Graph: x(t) và y(t) plotted as functions of time
   - Animation: graph cursor moves along x(t) and y(t) curves
   - Interaction: scrubber on timeline updates graph cursor AND simulation simultaneously
   - Readout: x, y, ẋ, ẏ

3. **Implement ch2-2-1/2 — Velocity/Acceleration graphs**
   - Graph canvas: v(t) hoặc a(t) curve
   - Animation: particle on main canvas moves, graph cursor on velocity/acceleration graph
   - Readout: v hoặc a value at current time
   - Physics: `v = (x₂-x₁)/(t₂-t₁)`, `a = (v₂-v₁)/(t₂-t₁)`

4. **Implement ch2-3-1 — Natural coordinates**
   - Physics: arc length s(t), heading angle θ(t)
   - Render: path with s-distance markers, θ angle indicator
   - Readout: s, θ, ds/dt, dθ/dt

5. **Implement ch2-3-2 — Motion templates**
   - Preset motions: uniform (v=const), accelerated (v=v₀+at), circular (ω=const), harmonic (x=Asinωt)
   - Selector: dropdown chọn template
   - Render: path + motion state indicators
   - Readout: position, velocity, acceleration for current template

6. **Implement ch2-4-1/2 — Rotation kinematics**
   - Render: wheel with spokes (visual)
   - Physics: `θ = θ₀ + ω₀t + ½αt²`
   - Animation: wheel rotates, angle arc updates
   - Graph: angular displacement/velocity/acceleration vs time
   - Readout: θ, ω, α

7. **Implement ch2-5-1 — Gear transmission**
   - Render: 2 gear wheels with teeth (simplified), center distance fixed
   - Physics: `ω₂ = ω₁ · N₁/N₂` (gear ratio)
   - Animation: both gears rotate, teeth mesh visually
   - Interaction: drag ω₁ magnitude
   - Readout: ω₁, ω₂, N₁/N₂ ratio, teeth contact speed

8. **Implement ch2-5-2 — Belt/pulley system**
   - Render: 2 pulleys with belt (taut + sag sections)
   - Physics: `v_belt = r·ω`, relationship between pulley angular velocities
   - Animation: belt moves, pulleys rotate

9. **Implement ch2-5-3 — Slider-crank**
   - Render: crank arm + connecting rod + slider on horizontal rail
   - Physics: slider position `x = r·cosθ + √(l²-r²sin²θ)`
   - Animation: crank rotates, slider translates, connecting rod angle changes
   - Readout: crank angle θ, slider position x, slider velocity ẋ

10. **Implement ch2-6-1 — Relative motion**
    - Render: 2 particles A and B, with absolute + relative velocity vectors
    - Physics: `v_A = v_B + v_AB`
    - Animation: A and B move independently, relative vector updates
    - Readout: v_A, v_B, v_AB

11. **Implement ch2-6-2 — Carry-along velocity**
    - Render: rotating platform with point on it
    - Physics: `v_carrier = ω × r` (perpendicular to radius)
    - Animation: platform rotates, carrier velocity arrow updates

12. **Implement ch2-6-3 — Coriolis acceleration**
    - Render: rotating disk with radial moving particle
    - Physics: `a_C = 2·ω × v_rel`
    - Animation: disk rotates, particle moves radially, Coriolis vector shown
    - Readout: ω, v_rel, a_C magnitude

13. **Implement ch2-7-1/2 — Instant center**
    - Render: body with known motion, IC point marked
    - Physics: velocity via IC method `v = ω × r_IC`
    - Animation: IC point shown + velocity vectors consistent with IC method
    - Interaction: drag body configuration

14. **Timeline scrubber unified UI** — tất cả Ch2 routes dùng cùng scrubber:
    - `<input type="range" class="sim-scrubber" min="0" max="T" step="0.01" value="0">`
    - Dưới scrubber: time display `t = X.Xs`
    - Scrub → cập nhật `state.t` → simulation seek to that time
    - Ghost preview: khi scrubbing, show trajectory preview from current position

15. **Playback controls unified** — tất cả Ch2 routes:
    - ▶/⏸ button
    - Speed: 0.25x / 0.5x / 1x / 2x dropdown
    - Reset: ↺ quay về t=0

16. **Register all 16 routes into SIM_MAP** và smoke test

## Success Criteria

- [x] 16/16 routes mount và animate được
- [x] Timeline scrubber seek chính xác — particle ở đúng vị trí tương ứng với t
- [x] Playback controls hoạt động: play/pause/speed/reset
- [x] Dual-canvas routes (graph) sync cursor với simulation
- [x] Gear transmission: teeth mesh visual không bị tách rời
- [x] Coriolis: rotation + radial motion đồng thời, vector updates correct
- [x] 60fps animation trên tất cả routes

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Scrubber seek không sync với simulation state | Mỗi route implement `seekTo(t)` method, inverse of `update(dt)` |
| Dual-canvas sync lag | Dùng cùng `state.t`, render both canvases trong 1 RAF frame |
| Gear mesh visual glitch | Constraint: 2 gears có cùng arc length at contact: `θ₁·r₁ = θ₂·r₂` |

## Context Links

- Phase 02: `phase-02-pilot-routes.md`
- Reference: `DeCuong_CoHocLyThuyet.html` lines 2000-2800
- Baseline renderers: `js/sims/ch2/` (all files)
