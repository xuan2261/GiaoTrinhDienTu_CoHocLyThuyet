---
phase: 03
title: "Ch1 Statics 20 Routes"
status: completed
priority: P1
effort: 3 tuần
dependencies: [02]
---

# Phase 03: Ch1 Statics 20 Routes

## Overview

Implement đầy đủ 20 routes Chương 1 — Tĩnh học theo kiến trúc mới: vector anatomy, moment arm, force system reducer, couple, constraint release, two-force body, parallelogram law, support reactions, spatial 3D forces, beam reactions, friction, centroid.

## Requirements

- **Functional:** 20/20 routes có interaction + readout + equation. Physics computation chính xác. Consistent interaction model.
- **Non-functional:** Ghost preview + snap guides đồng nhất; KaTeX equation display; 60fps

## Route Inventory (20 routes)

| Route ID | Simulation | Physics | Interaction |
|----------|-----------|---------|------------|
| ch1-1-1 | Cartesian force components | `Fx=F·cosα, Fy=F·sinα` | Drag F magnitude + angle |
| ch1-1-2 | Force projection onto axis | `Fp=F·cos(θ-α)` | Drag axis angle + F angle |
| ch1-1-3 | Force vector anatomy | Label anatomy of vector | Drag endpoint |
| ch1-1-4 | Parallelogram law | `R=F₁+F₂` | 4 handles (F1/F2 x/y) |
| ch1-2-1 | Moment about a point | `M=F·d` | Drag F position + magnitude |
| ch1-2-2 | Varignon theorem | `M_R = ΣM_i` | Multiple forces, moment arm viz |
| ch1-2-3 | Couple system | `M=F·d` (couple moment) | Drag parallel forces |
| ch1-2-4 | Equivalent couple | Couple equivalence | Drag couple position |
| ch1-3-1 | FBD single body | Free body diagram | Drag force vectors |
| ch1-3-2 | FBD multiple bodies | Equilibrium equations | Connect bodies + forces |
| ch1-3-3 | Two-force body | P + R collinear | Drag body orientation |
| ch1-4-1 | Support reactions (roller/pin/fixed) | Equilibrium → R_A, R_B | Drag load position |
| ch1-4-2 | Beam reactions | `ΣM=0 → RA, RB` | Drag P position + magnitude |
| ch1-4-3 | Cantilever beam | Fixed support moment | Drag load |
| ch1-5-1 | Spatial 3D force | `Fx,Fy,Fz` components | Rotate 3D projection |
| ch1-5-2 | 3D moment | `M=r×F` | Drag force + moment arm |
| ch1-6-1 | Dry friction | `F≤μN` | Drag block, show friction threshold |
| ch1-6-2 | Friction angle | `tan φ = μ` | Show cone of friction |
| ch1-6-3 | Friction rollback | Impending motion | Drag weight, show rollback |
| ch1-7-1 | Centroid composite | `x̄=Σ(xᵢ·Aᵢ)/ΣAᵢ` | Select shapes + holes |

## Related Code Files

- **Create:** `js/routes/chapter-statics.js` (20 route configs)
- **Modify:** `js/routes/route-registry.js`, `js/simulations.js`
- **Read:** `js/sims/ch1/ch1-force-law-*.js`, `js/sims/ch1/ch1-support-*.js`, `js/sims/ch1/ch1-friction-*.js`, `js/sims/ch1/ch1-centroid-solver-*.js`, `js/sims/ch1/ch1-spatial-*.js`

## Implementation Steps

1. **Implement ch1-1-1 — Cartesian force components**
   - 1 particle body, 1 force arrow
   - Physics: decompose F into Fx, Fy
   - Render: F arrow + Fx arrow + Fy arrow + right-triangle dashed
   - Readout: F, Fx, Fy, α
   - Equation: `F_x = F\\cos\\alpha`, `F_y = F\\sin\\alpha`
   - Handles: F magnitude (0-300N), α angle (0-360°)

2. **Implement ch1-1-2 — Force projection**
   - Physics: `Fp = F·cos(θ-α)`
   - Render: force arrow, axis arrow, projection arrow (dashed), angle arc
   - Readout: F, θ, α, Fp

3. **Implement ch1-1-3 — Force vector anatomy**
   - Render: labeled vector anatomy (point of application, direction line, arrowhead, magnitude label)
   - Readout: |F|, α, Fx, Fy
   - This is mostly static visualization — drag endpoint only

4. **Implement ch1-1-4 — Parallelogram law**
   - (Already done in pilot, copy pattern)

5. **Implement ch1-2-1 — Moment about a point**
   - Physics: `M = F·d` where d = perpendicular distance
   - Render: force arrow + moment arm (perpendicular dashed line) + curved arc
   - Readout: F, d, M
   - Handle: drag F position (changes d), drag F magnitude
   - Animation: moment arm rotates around point as F moves

6. **Implement ch1-2-2 — Varignon theorem**
   - Physics: `M_R = Σ(F_i × r_i)` vs `M_R = R × r_com`
   - Render: multiple forces + individual moments + resultant moment
   - Readout: ΣM_i, M_R, difference
   - Show moment balance equation

7. **Implement ch1-2-3/4 — Couple system**
   - Physics: `M_couple = F·d` (same for any point)
   - Render: 2 parallel equal forces (opposite direction) + couple moment indicator
   - Readout: F, d, M_couple

8. **Implement ch1-3-1/2 — FBD builder**
   - Render: body outline + force vectors at connection points
   - Interaction: drag force vectors to connect to body attachment points
   - Readout: ΣFx, ΣFy, ΣM at CG
   - Equation: equilibrium conditions `ΣFx=0, ΣFy=0, ΣM=0`

9. **Implement ch1-3-3 — Two-force body**
   - Render: body with 2 forces only (collinear, equal/opposite)
   - Interaction: drag body orientation
   - Readout: F magnitude, direction

10. **Implement ch1-4-1 — Support reactions**
    - Render: roller/pin/fixed support symbols + body + load
    - Physics: equilibrium → compute R_A, R_B
    - Readout: R_A, R_B (reaction forces)
    - Handles: load P position + magnitude

11. **Implement ch1-4-2 — Beam reactions**
    - (Already covered conceptually in DeCuong reference)
    - Physics: `ΣM_A = 0 → R_B·L = P·a → R_B = P·a/L; R_A = P - R_B`
    - Render: beam with supports A/B, load P (draggable), reaction arrows R_A, R_B
    - Readout: R_A, R_B, P
    - Equation: `ΣFy = 0: R_A + R_B - P = 0`, `ΣM_A = 0: R_B·L - P·a = 0`
    - Animation: reaction arrows update in real-time as P moves

12. **Implement ch1-4-3 — Cantilever beam**
    - Physics: `ΣM_fixed = 0 → M_fixed = P·a`
    - Render: fixed support (hatched) + beam + load
    - Readout: P, a, M_fixed, R_fixed

13. **Implement ch1-5-1/2 — Spatial 3D forces**
    - Render: 3D projection box with Fx, Fy, Fz axes + force vector
    - Interaction: 3D rotation via mouse drag (rotate projection angles)
    - Readout: F, Fx, Fy, Fz, αx, αy, αz

14. **Implement ch1-6-1 — Dry friction**
    - Physics: `F_f = μN` (max), `F_f ≤ μN` (actual)
    - Render: block on inclined plane, friction force arrow, normal force arrow
    - Interaction: drag block position (changes θ), drag P (weight)
    - Readout: N, F_f, F_f_max, status (static/motion impending)
    - Animation: when θ exceeds limit, show block sliding

15. **Implement ch1-6-2 — Friction angle**
    - Render: friction cone (φ = arctan μ)
    - Interaction: drag μ slider
    - Readout: μ, φ

16. **Implement ch1-6-3 — Friction rollback**
    - Render: block on incline, show direction of impending motion
    - Physics: `θ_impending = arctan(μ_s)` vs `θ_k = arctan(μ_k)`

17. **Implement ch1-7-1 — Centroid composite shapes**
    - Physics: `x̄ = Σ(Aᵢ·xᵢ)/ΣAᵢ, ȳ = Σ(Aᵢ·yᵢ)/ΣAᵢ`
    - Render: composite shape with individual shapes colored differently + hole shapes (dashed)
    - Interaction: select shape type (rectangle, triangle, circle) + hole toggle + drag position
    - Readout: x̄, ȳ, A_total
    - Animation: centroid point animates to computed position

18. **Consistent interaction model** — kiểm tra tất cả 20 routes:
    - Handle radius: 22px visual, 44px hit area
    - Ghost preview: dashed ghost khi drag
    - Snap: snap-to-grid(10px) + snap-to-angle(15°) for rotation
    - Readout cards: 3-4 values per route, color-coded per chapter

19. **KaTeX equation integration** — kiểm tra tất cả 20 routes:
    - Dùng `domMath()` cho formula overlay
    - Positioned consistent: dưới canvas hoặc bên cạnh readout cards
    - White semi-transparent background `rgba(255,255,255,0.1)`

20. **Register all 20 routes into SIM_MAP** và smoke test từng route

## Success Criteria

- [x] 20/20 routes mount được từ index.html
- [x] Drag interaction smooth trên mỗi route
- [x] Ghost preview hiển thị khi drag (tất cả routes)
- [x] Readout values chính xác (spot-check 5 routes với hand calculation)
- [x] KaTeX equations render đúng (visual inspection)
- [x] 60fps khi drag interaction
- [x] Responsive: hoạt động trên viewport 320px+

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| 20 routes × unique physics logic | Tạo shared physics helpers cho từng category (moment, beam, friction, centroid) |
| KaTeX positioning drift across routes | Dùng absolute positioning từ canvas rect, không margin-based |
| Inconsistent interaction across routes | Enforcement: kiểm tra ghost preview + snap trên tất cả 20 routes |

## Context Links

- Phase 02: `phase-02-pilot-routes.md`
- Reference: `DeCuong_CoHocLyThuyet.html` lines 1200-2000
- Baseline renderers: `js/sims/ch1/` (all files)
