# Phase 04 — Chapter 3: 18 Dynamics Routes × Excellent

## Context Links
- Plan: [plan.md](../plan.md)
- Phase 01: [phase-01-infrastructure-animation-engine.md](./phase-01-infrastructure-animation-engine.md)
- Phase 02: [phase-02-chapter-1-statics-22-routes.md](./phase-02-chapter-1-statics-22-routes.md)
- Phase 03: [phase-03-chapter-2-kinematics-17-routes.md](./phase-03-chapter-2-kinematics-17-routes.md)
- Physics: `js/sim-physics-dynamics.js` (Phase 01)

## Overview

**Priority: P1** | **Current status:** Complete — Ch3 runtime routes and dedicated scene/renderer/behavior modules are present | **Effort: ~6 ngày**

Implement 18 routes Chương 3 (Động lực học) × excellent. Động lực học là chương KHÓ NHẤT — cần ODE solvers, collision physics, energy conservation, va chạm 2D.

## Chapter 3 Route Breakdown

### Ch3-1: Nguyên lý D'Alembert (2 routes)

| Route | Tên | Priority | Animation | Physics |
|---|---|---|---|---|
| ch3-1-2 | Lực tổng → gia tốc | P0 | Cao | F = ma, vẽ F + a |
| ch3-1-3 | Hệ quy chiếu quán tính | P0 | Cao | F* = -ma (giả) |

### Ch3-2: Các định luật Newton (4 routes)

| Route | Tên | Priority | Animation | Physics |
|---|---|---|---|---|
| ch3-2-1 | Định luật quán tính | P0 | Cao | F=0 → v=const |
| ch3-2-2 | Định luật Newton II | P0 | **Cao** | F = ma, thay đổi m, F |
| ch3-2-3 | Định luật Newton III | P1 | Cao | F_AB = -F_BA |
| ch3-2-5 | Sơ đồ FBD động lực | P0 | Trung bình | F + F* = 0 |

### Ch3-3: Phương trình vi phân chuyển động (2 routes)

| Route | Tên | Priority | Animation | Physics |
|---|---|---|---|---|
| ch3-3-1 | Tích phân phương trình vi phân | P0 | **Rất cao** | RK4 solver, x'' = F/m |
| ch3-3-2 | Cơ hệ 2 khối nối lò xo | P0 | **Rất cao** | Coupled ODEs |

### Ch3-4: Nguyên lý D'Alembert (2 routes)

| Route | Tên | Priority | Animation | Physics |
|---|---|---|---|---|
| ch3-4-1 | Cân bằng động với D'Alembert | P0 | Cao | F + F* = 0 |
| ch3-4-2 | Ngược từ chuyển động suy lực | P0 | Cao | a → F needed |

### Ch3-5: Các định lý động lực (4 routes)

| Route | Tên | Priority | Animation | Physics |
|---|---|---|---|---|
| ch3-5-1 | Định lý chuyển động khối tâm | P0 | Trung bình | m*a_CM = ΣF_ext |
| ch3-5-2 | Xung lượng - động lượng | P0 | Cao | Impulse = Δp |
| ch3-5-3 | Mô men động lượng | P0 | Cao | L = Iω, dL/dt = M |
| ch3-5-4 | Định lý động năng | P0 | Cao | A = ΔT |

### Ch3-6: Va chạm (2 routes)

| Route | Tên | Priority | Animation | Physics |
|---|---|---|---|---|
| ch3-6-2 | Va chạm 2D + hệ số e | P0 | **Rất cao** | Elastic/inelastic, e = v₂'-v₁'/(v₁-v₂) |
| ch3-6-3 | Giải bài va chạm | P0 | Trung bình | Bảo toàn p + e |

### Ch3-7: Bài tập động lực (3 routes)

| Route | Tên | Priority | Animation | Physics |
|---|---|---|---|---|
| ch3-7-1 | Chọn định lý phù hợp | P0 | Không | Decision tree |
| ch3-7-2 | Kiểm tra số liệu động lực | P1 | Không | Verify theorems |

## Key Physics Implementations

### ODE Solver (ch3-3-1, ch3-3-2)

```js
// RK4 integration cho x'' = F/m
function integrateODE(state, dt, F_ext, m) {
  // state = { x, v }
  const deriv = (s) => ({ x: s.v, v: F_ext(s.x, s.v) / m });

  const k1 = deriv(state);
  const k2 = deriv({
    x: state.x + k1.x * dt / 2,
    v: state.v + k1.v * dt / 2
  });
  const k3 = deriv({
    x: state.x + k2.x * dt / 2,
    v: state.v + k2.v * dt / 2
  });
  const k4 = deriv({
    x: state.x + k3.x * dt,
    v: state.v + k3.v * dt
  });

  return {
    x: state.x + (k1.x + 2*k2.x + 2*k3.x + k4.x) * dt / 6,
    v: state.v + (k1.v + 2*k2.v + 2*k3.v + k4.v) * dt / 6
  };
}

// Hook vào animation loop
function renderODE(lab, scene, state) {
  let odeState = { x: 0, v: 0 };
  lab.anim.start();
  lab.anim.onFrame((t, dt) => {
    // spring force: F = -k*x
    const F = (s) => -scene.springK * s.x;
    odeState = integrateODE(odeState, dt, F, scene.mass || 1);
    // draw...
  });
}
```

### Collision 2D (ch3-6-2)

```js
// Va chạm 2D: tách thành phần normal + tangential
function resolveCollision2D(m1, m2, p1, v1, p2, v2, e) {
  // Normal direction
  const nx = p2.x - p1.x, ny = p2.y - p1.y;
  const dist = Math.hypot(nx, ny);
  const nnx = nx / dist, nny = ny / dist;

  // Relative velocity
  const vrx = v1.x - v2.x, vry = v1.y - v2.y;
  const vrn = vrx * nnx + vry * nny; // normal component

  if (vrn > 0) return { v1, v2 }; // separating, no collision

  // Tangential direction
  const tx = -nny, ty = nnx;

  // Normal impulse
  const j = -(1 + e) * vrn / (1/m1 + 1/m2);

  // Post-collision velocities
  const v1n_x = v1.x + (j / m1) * nnx;
  const v1n_y = v1.y + (j / m1) * nny;
  const v2n_x = v2.x - (j / m2) * nnx;
  const v2n_y = v2.y - (j / m2) * nny;

  return {
    v1: { x: v1n_x, y: v1n_y },
    v2: { x: v2n_x, y: v2n_y }
  };
}
```

### Energy Bar Visualization (ch3-5-4)

```js
// Vẽ thanh năng lượng: T + V = const
function renderEnergyBar(ctx, T, V, E, x, y, w, h) {
  const total = Math.abs(E) || 1;
  const tHeight = Math.max(0, Math.min(h, (T / total) * h));
  const vHeight = Math.max(0, Math.min(h, (V / total) * h));

  // Background
  ctx.fillStyle = '#e9ecef';
  ctx.fillRect(x, y, w, h);

  // Kinetic energy (blue)
  ctx.fillStyle = '#0d6efd';
  ctx.fillRect(x, y + h - tHeight, w, tHeight);

  // Potential energy (orange)
  ctx.fillStyle = '#fd7e14';
  ctx.fillRect(x, y, w, vHeight);

  // Labels
  ctx.fillStyle = '#212529';
  ctx.font = '10px Inter';
  ctx.fillText(`T=${T.toFixed(1)}`, x + 2, y + h - tHeight - 4);
  ctx.fillText(`V=${V.toFixed(1)}`, x + 2, y + vHeight + 14);
}
```

## Related Code Files

### Create (new files)
```
js/sims/ch3/ch3-fundamentals-scenes.js
js/sims/ch3/ch3-fundamentals-renderers.js
js/sims/ch3/ch3-fundamentals-behaviors.js
js/sims/ch3/ch3-newton-laws-scenes.js
js/sims/ch3/ch3-newton-laws-renderers.js
js/sims/ch3/ch3-newton-laws-behaviors.js
js/sims/ch3/ch3-differential-motion-scenes.js
js/sims/ch3/ch3-differential-motion-renderers.js
js/sims/ch3/ch3-differential-motion-behaviors.js
js/sims/ch3/ch3-theorems-scenes.js
js/sims/ch3/ch3-theorems-renderers.js
js/sims/ch3/ch3-theorems-behaviors.js
js/sims/ch3/ch3-collision-scenes.js
js/sims/ch3/ch3-collision-renderers.js
js/sims/ch3/ch3-collision-behaviors.js
js/sims/ch3/ch3-dynamics-exercises-scenes.js
js/sims/ch3/ch3-dynamics-exercises-renderers.js
js/sims/ch3/ch3-dynamics-exercises-behaviors.js
```

### Modify (existing files)
- `js/sim-scene-registry.js` — đăng ký 18 scene entries
- `js/sim-route-renderer-registry.js` — đăng ký 18 renderer functions
- `js/sim-route-behavior-registry.js` — đăng ký 18 behavior entries
- `index.html` — thêm script tags cho `js/sims/ch3/*.js`

## Implementation Steps

### Step 1: Ch3-1 + Ch3-2 Newton Laws (Day 1)

**1.1** Ch3-1-2: Lực → Gia tốc
- Vẽ: vật + F vector + a vector
- Animation: vật chuyển động theo a
- Slider: F, m → a = F/m

**1.2** Ch3-1-3: Hệ quy chiếu phi quán tính
- 2 frame: quán tính + gia tốc
- Animation: vật trong 2 frame khác nhau
- F* = -ma (màu đỏ, đánh dấu giả)

**1.3** Ch3-2-1: Quán tính
- Animation: F = 0 → v = const, F ≠ 0 → gia tốc
- Slider: F = 0 → đứng yên, F > 0 → chuyển động đều

**1.4** Ch3-2-2: **PRIORITY CAO NHẤT Ch3**
- Vẽ: vật + F + a
- Animation: thay đổi m hoặc F → a thay đổi
- Hệ thống 3 sliders: F, m, μ
- Real-time graph: v(t), a(t)

### Step 2: Ch3-2-3 + Ch3-2-5 (Day 2)

**2.1** Ch3-2-3: Newton III
- Vẽ: 2 vật, F_AB và F_BA
- Animation: kéo vật này → vật kia di chuyển theo
- Labels: "F_AB = -F_BA"

**2.2** Ch3-2-5: FBD động lực
- Tương tự ch1-2-6 nhưng thêm F* = -ma
- Vẽ: vật + F + F* (đỏ, gạch ngang)

### Step 3: Ch3-3 ODE Solvers (Day 2-3)

**3.1** Ch3-3-1: **QUAN TRỌNG NHẤT Ch3**
- Spring-mass system: x'' + (k/m)*x = 0
- RK4 solver trong animation loop
- **Animation rất cao**: vật dao động, đồ thị x(t) vẽ liên tục
- Sliders: k (spring constant), m (mass), F_ext (external)
- Đồ thị: x(t), v(t), a(t) real-time

**3.2** Ch3-3-2: Cơ hệ 2 khối
- 2 vật nối bằng lò xo
- Coupled ODEs: x1'' = k*(x2-x1)/m1 - F1/m1
- Animation: 2 vật dao động tương tác

### Step 4: Ch3-4 + Ch3-5 Theorems (Day 3-4)

**4.1** Ch3-4-1: D'Alembert
- Vẽ: F_ext + F* (inertial) = 0
- Chuyển bài toán động → tĩnh

**4.2** Ch3-4-2: Ngược động học
- Cho a(t) → tìm F cần thiết
- Đồ thị a(t), tích phân → v(t) → F(t)

**4.3** Ch3-5-1: Khối tâm
- 2-3 vật, tính C = (m1*r1 + m2*r2)/(m1+m2)
- Animation: C di chuyển khi thay đổi m

**4.4** Ch3-5-2: Xung lượng - động lượng
- Va chạm hoặc F(t) tác dụng
- Vẽ: p trước → p sau, Δp = ∫F dt
- Animation: F(t) bar chart, p(t) line

**4.5** Ch3-5-3: Mô men động lượng
- Thanh quay, L = I*ω
- Animation: thay đổi I → ω thay đổi (bảo toàn L)
- Controls: phân bố khối lượng

**4.6** Ch3-5-4: Định lý động năng
- Vẽ: T bar, V bar (xếp chồng)
- Animation: T + V = const
- Slider: vị trí, vận tốc

### Step 5: Ch3-6 Collision + Exercises (Day 5-6)

**5.1** Ch3-6-2: **QUAN TRỌNG**
- Va chạm 2D: 2 bi trên mặt phẳng
- Animation: kéo bi 1 → bắn → va chạm → bay ra
- Sliders: m1, m2, e (restitution)
- Hiển thị: p trước, p sau, Δp, e thực tế
- Physics: resolveCollision2D() đã implement ở trên

**5.2** Ch3-6-3: Giải bài va chạm
- Bảng nhập: m1, m2, v1, v2, e
- Tính: v1', v2', Δp
- Verify: bảo toàn p, tính e

**5.3** Ch3-7-1: Chọn định lý
- Decision tree: có va chạm? → Impulse-Momentum
- Có tính công? → Work-Energy
- Có mô men? → Angular Momentum

**5.4** Ch3-7-2: Kiểm tra số liệu
- Input: trạng thái hệ
- Verify: all theorems đồng thời

## TODO List

### Priority P0 — Day 1
- [x] ch3-2-2 renderer + behavior (Newton II) — animation cao
- [x] ch3-1-2 renderer + behavior (force → acceleration)
- [x] ch3-1-3 renderer + behavior (inertial frame)

### Priority P0 — Day 2
- [x] ch3-2-1 renderer + behavior (inertia law)
- [x] ch3-2-3 renderer + behavior (Newton III)
- [x] ch3-2-5 renderer + behavior (dynamic FBD)
- [x] ch3-3-1 renderer + behavior (ODE solver) — **quan trọng nhất Ch3**

### Priority P0 — Day 3
- [x] ch3-3-2 renderer + behavior (coupled spring-mass)
- [x] ch3-4-1 renderer + behavior (D'Alembert)
- [x] ch3-4-2 renderer + behavior (inverse dynamics)

### Priority P0 — Day 4
- [x] ch3-5-2 renderer + behavior (impulse-momentum)
- [x] ch3-5-3 renderer + behavior (angular momentum)
- [x] ch3-5-4 renderer + behavior (work-energy) — energy bars

### Priority P0 — Day 5
- [x] ch3-6-2 renderer + behavior (collision 2D) — **animation rất cao**
- [x] ch3-6-3 renderer + behavior (collision solver)
- [x] ch3-5-1 renderer + behavior (center of mass)

### Priority P1 — Day 5-6
- [x] ch3-7-1 renderer + behavior (theorem selector)
- [x] ch3-7-2 renderer + behavior (numeric checker)

### Integration — Day 6
- [x] Cập nhật index.html — route files loaded
- [x] node --check cho route files
- [x] smoke_simulation_routes.py — 18 routes
- [x] Browser smoke — covered by release browser suite

## Success Criteria

1. **18/18 routes hoạt động**: ODE solver hoạt động cho ch3-3-1
2. **Collision physics đúng**: ch3-6-2 va chạm đàn hồi/inelastic đúng
3. **Energy conservation**: ch3-5-4 T + V = const trong animation
4. **RK4 accuracy**: ODE solution trong ±1% so với analytical
5. **D'Alembert**: ch3-4-1 F + F* = 0 visualized đúng

## Validation Methods

```powershell
# Physics verification
# ch3-3-1: harmonic oscillator
# m=1, k=1, x0=1, v0=0 → T=0.5, analytical period = 2π ≈ 6.28s
# Verify: animation period ≈ 6.28s (±5%)

# ch3-6-2: elastic collision m1=m2=1, v1=10, v2=0, e=1
# Expected: v1'=0, v2'=10 (velocities exchange)
# Verify: after collision velocities

# Energy conservation ch3-5-4
# T + V at t=0 should equal T + V at t=5s
```

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| RK4 timestep sensitivity | Rất cao | dt = 0.016 (60fps), clamped |
| Collision detection (2D) | Cao | Check distance < r1+r2 per frame |
| ODE stiffness (spring-mass) | Cao | RK4 handles well, test extremes |
| Energy numerical drift | Trung bình | Normalize: T+V displayed as % of initial |
| Performance ODE loop | Cao | Benchmark, optimize if > 2ms |

## Next Steps

Phase 4 complete → Phase 5 (Integration + QA) bắt đầu.

---

## Sync-back 2026-05-08

- Implemented: 18 Ch3 dynamics routes through route modules, `ch3-dynamics-all-18-scenes.js`, split renderer files, and split behavior contracts.
- Integrated: old duplicate Ch3 partial renderer files are no longer loaded; current split files load before assessment manifest and `simulations.js`.
- Verified: 58-route route/manifest/runtime/quality gates pass; Ch3 is included in the 25/15/18 runtime split.

**Status: DONE**
