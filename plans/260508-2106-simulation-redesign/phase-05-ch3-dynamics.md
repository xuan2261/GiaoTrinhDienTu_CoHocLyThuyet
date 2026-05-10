---
phase: 05
title: "Ch3 Dynamics 22 Routes"
status: completed
priority: P1
effort: 2 tuần
dependencies: [02]
---

# Phase 05: Ch3 Dynamics 22 Routes

## Overview

Implement đầy đủ 22 routes Chương 3 — Động lực học: Newton's laws, D'Alembert principle, inverse dynamics, mass-spring systems, center of mass, impulse-momentum, angular momentum, work-energy, restitution, collision solver. Tất cả cần full physics simulation với physics world stepping.

## Requirements

- **Functional:** 22/22 routes có physics-driven animation. Bodies chuyển động theo forces. Collision response. Energy/momentum visualization.
- **Non-functional:** Physics accuracy; Conservation laws verified; 60fps with physics step

## Route Inventory (22 routes)

| Route ID | Simulation | Physics | Animation |
|----------|-----------|---------|-----------|
| ch3-1-1 | Newton's 1st law (inertia) | ΣF=0 → v=const | Body moves at constant velocity |
| ch3-1-2 | Newton's 2nd law | F=ma | Body accelerates under force |
| ch3-1-3 | Newton's 3rd law | F_AB = -F_BA | Two bodies, action-reaction |
| ch3-2-1 | D'Alembert principle | F_inertial = -m·a | Inertial force on FBD |
| ch3-2-2 | Dynamic equilibrium | ΣF = m·a | Bodies accelerate in equilibrium |
| ch3-3-1 | Mass-spring system (1 DOF) | mÿ + ky = 0 | Oscillating mass |
| ch3-3-2 | Coupled oscillators | coupled ODE system | Two masses oscillate |
| ch3-3-3 | Damped oscillation | mÿ + cẏ + ky = 0 | Decaying oscillation |
| ch3-4-1 | Center of mass (2 particles) | r_cm = Σ(mᵢrᵢ)/Σmᵢ | Two masses, COM point |
| ch3-4-2 | COM theorem | COM motion tracking | COM animates |
| ch3-5-1 | Impulse-momentum (linear) | m·Δv = J | Impact impulse |
| ch3-5-2 | Angular impulse-momentum | I·Δω = H | Rotational impulse |
| ch3-6-1 | Work-energy theorem | W = ΔK | Work done by force |
| ch3-6-2 | Potential energy | E = K + V | Energy bar graph |
| ch3-6-3 | Conservation of energy | E_total = const | Energy conservation viz |
| ch3-6-4 | Power | P = F·v | Instantaneous power |
| ch3-7-1 | Elastic collision (1D) | v1' = ..., v2' = ... | Balls exchange velocities |
| ch3-7-2 | Inelastic collision (1D) | KE loss | Balls stick/combine |
| ch3-7-3 | 2D collision solver | Vector impulse | Oblique collision |
| ch3-7-4 | Restitution coefficient | e = v_sep/v_app | Coefficient visualization |
| ch3-7-5 | Coefficient of restitution | e = 0..1 | Adjust e, see energy loss |
| ch3-7-6 | Exercise checker | Various | Mixed problems |

## Related Code Files

- **Create:** `js/routes/chapter-dynamics.js` (22 route configs)
- **Modify:** `js/routes/route-registry.js`, `js/simulations.js`
- **Read:** `js/sims/ch3/ch3-newton-laws-*.js`, `js/sims/ch3/ch3-dynamics-*.js`, `js/sims/ch3/ch3-impulse-*.js`, collision/dynamics scene files

## Implementation Steps

1. **Implement ch3-1-1 — Newton's 1st law**
   - Scene: 1 body on frictionless surface
   - Physics: `ΣF=0 → v=const`, no acceleration
   - Animation: body moves at constant velocity (dragged by initial push)
   - Interaction: drag to set initial velocity
   - Readout: m, v, K (kinetic energy)

2. **Implement ch3-1-2 — Newton's 2nd law**
   - Physics: `F = m·a`, Euler integration `v += a·dt, x += v·dt`
   - Render: body + applied force arrow + acceleration vector
   - Interaction: drag force magnitude/direction
   - Readout: m, F, a, v

3. **Implement ch3-1-3 — Newton's 3rd law**
   - Scene: 2 bodies, connected or approaching
   - Physics: `F_AB = -F_BA` always
   - Render: both bodies + equal/opposite force arrows
   - Animation: when contact, reaction forces appear
   - Readout: F_AB, F_BA, m_A, m_B

4. **Implement ch3-2-1 — D'Alembert principle**
   - Physics: add inertial force `-m·a` to FBD → dynamic equilibrium
   - Render: FBD with real forces + inertial force (dashed opposite direction)
   - Readout: ΣF (real), -m·a (inertial), verification

5. **Implement ch3-2-2 — Dynamic equilibrium**
   - Physics: `ΣF = m·a` → bodies accelerate
   - Render: multiple forces on body, resultant arrow, acceleration arrow

6. **Implement ch3-3-1 — Mass-spring (undamped)**
   - Physics: `ÿ = -(k/m)·y`, analytical `y = A·cos(ωt)` với `ω = √(k/m)`
   - Render: spring coil (zigzag, stretches/compresses), mass block, equilibrium line
   - Animation: block oscillates, spring coil animates
   - Interaction: drag initial displacement (A), drag k slider
   - Readout: A, k, m, ω, T (period), E_total
   - Energy: KE and PE bar graph

7. **Implement ch3-3-2 — Coupled oscillators**
   - Physics: coupled ODE: `m·ÿ₁ = -k·y₁ + k·(y₂-y₁)`, same for y₂
   - Render: 2 masses + 3 springs (left wall-spring1, spring1-mass1-mass2, mass2-spring3-right wall)
   - Animation: normal mode oscillation (beat pattern)
   - Readout: y₁, y₂, v₁, v₂, E₁, E₂

8. **Implement ch3-3-3 — Damped oscillation**
   - Physics: `ÿ + (c/m)·ẏ + (k/m)·y = 0`
   - Render: similar to undamped + damping indicator (velocity damping arrow)
   - Interaction: drag c (damping coefficient)
   - Readout: Underdamped/Overdamped/Critically damped status, decay rate

9. **Implement ch3-4-1/2 — Center of mass**
   - Physics: `r_cm = (m₁·r₁ + m₂·r₂)/(m₁+m₂)`
   - Render: 2 masses (sizes proportional to mass), COM point (X marker)
   - Animation: when masses move, COM updates
   - Interaction: drag mass positions
   - Readout: r_cm(x,y), m_total

10. **Implement ch3-5-1 — Impulse-momentum (linear)**
    - Physics: `m·v_final = m·v_initial + J` where `J = F·Δt`
    - Render: before-impact velocity arrow, impact impulse arrow, after-impact velocity arrow
    - Animation: ball approaches → impact (flash effect) → ball leaves
    - Interaction: drag impact force magnitude + duration
    - Readout: m, v_before, J, v_after, Δp

11. **Implement ch3-5-2 — Angular impulse-momentum**
    - Physics: `I·Δω = H` (angular impulse)
    - Render: rotating disk + impulse torque arrow
    - Animation: impulse applied → angular velocity changes
    - Readout: I, ω_before, H, ω_after, ΔL

12. **Implement ch3-6-1 — Work-energy theorem**
    - Physics: `W = ΔK = ½m(v² - v₀²)`
    - Render: body + force arrow + distance traveled + work area (shaded)
    - Animation: force applied over distance, work value accumulates
    - Interaction: drag force + drag distance
    - Readout: F, d, W, K_initial, K_final, ΔK

13. **Implement ch3-6-2/3 — Potential energy + Conservation**
    - Physics: PE_gravity = mgh, PE_spring = ½kx², E_total = K + V
    - Render: energy bar graph (stacked or side-by-side: KE blue, PE green)
    - Animation: bars update in real-time as body moves
    - For gravity: body on inclined plane slides down, KE increases, PE decreases
    - For spring: body oscillates, KE and PE exchange
    - Readout: K, V, E_total (verify constant)

14. **Implement ch3-6-4 — Power**
    - Physics: `P = F·v = dW/dt`
    - Render: body + force arrow + instantaneous power indicator
    - Animation: power value updates as velocity changes
    - Readout: F, v, P

15. **Implement ch3-7-1 — Elastic collision (1D)**
    - (Covered in pilot phase, refine and generalize)
    - Physics: `v1' = ((m1-m2)v1 + 2m2v2)/(m1+m2)`
    - Render: 2 balls, before/after velocity arrows, momentum bars
    - Animation: balls approach → collision (spark effect) → separate
    - Readout: m1, m2, v1, v2, v1', v2', p_before, p_after (verify conservation)

16. **Implement ch3-7-2 — Inelastic collision**
    - Physics: `v' = (m1v1 + m2v2)/(m1+m2)`, KE_loss = K_before - K_after
    - Render: balls merge into single mass after collision
    - Readout: KE_before, KE_after, ΔK, e (should be < 1)

17. **Implement ch3-7-3 — 2D collision solver**
    - Physics: impulse along collision normal: `J = -(1+e)·(v_rel·n)/(1/m₁ + 1/m₂)`
    - Render: 2 balls approaching at angle, collision normal line, after-collision velocity vectors
    - Animation: oblique approach → collision → oblique departure
    - Interaction: drag initial velocities (direction + magnitude) for both balls
    - Readout: v1, v2, v1', v2', e

18. **Implement ch3-7-4/5 — Restitution coefficient**
    - Physics: `e = v_separation / v_approach`
    - Render: before/after velocity arrows, e value displayed
    - Interaction: drag e slider (0..1)
    - Animation: for e=1 elastic, e<1 inelastic
    - Readout: e, KE_before, KE_after, ΔKE%

19. **Implement ch3-7-6 — Exercise checker**
    - Template: configurable problem (select from ch3 topics)
    - Physics: whatever problem type selected
    - Interaction: user inputs answer → system checks

20. **Physics world stepping** — Ch3 cần PhysicsWorld:
    - `world.step(dt)` được gọi mỗi RAF frame
    - Impulse-based collision detection (circle-circle distance check)
    - Constraint solver: springs, joints, distance constraints
    - Gravity: optional (0 or -9.81 m/s²)

21. **Energy/Momentum visualization** — unified cho tất cả Ch3 routes:
    - Momentum bar: `p = m·v` vector (directional)
    - Energy pie/bar: KE (blue) + PE (green) + total
    - Conservation indicator: red warning if ΔE > threshold

22. **Register all 22 routes into SIM_MAP** và smoke test

## Success Criteria

- [x] 22/22 routes mount và simulate được
- [x] Bodies chuyển động theo đúng physics (F=ma, conservation of momentum)
- [x] Collision detection: balls collide, separate correctly
- [x] Energy conservation verified: E_total stays constant (elastic) or decreases (inelastic)
- [x] Mass-spring oscillation: period matches T = 2π√(m/k)
- [x] Damping: amplitude decays correctly
- [x] 60fps với physics step trên tất cả routes

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Physics instability (large dt causing explosion) | Clamp dt ≤ 16ms, use Verlet integration for springs |
| Collision tunneling (fast objects) | Continuous collision detection or substep physics |
| Energy not conserved in elastic collision | Use analytical formulas for 1D elastic instead of impulse iteration |

## Context Links

- Phase 02: `phase-02-pilot-routes.md`
- Reference: `DeCuong_CoHocLyThuyet.html` lines 2800-3600
- Baseline: `js/sims/ch3/` (all files), `js/physics-dynamics.js`
