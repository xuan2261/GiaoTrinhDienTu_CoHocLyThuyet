# Phase 03 — Chapter 2: 15 Kinematics Routes × Excellent

## Context Links
- Plan: [plan.md](../plan.md)
- Phase 01: [phase-01-infrastructure-animation-engine.md](./phase-01-infrastructure-animation-engine.md)
- Phase 02: [phase-02-chapter-1-statics-22-routes.md](./phase-02-chapter-1-statics-22-routes.md)
- Physics: `js/sim-physics-kinematics.js` (Phase 01)

## Overview

**Priority: P1** | **Current status:** Complete — Ch2 runtime routes and dedicated scene/renderer/behavior modules are present | **Effort: ~5 ngày**

Implement 15 routes Chương 2 (Động học) × excellent. **Đặc biệt chú ý**: Động học CẦN animation nhiều nhất — hầu hết các route đều cần chuyển động thực, không chỉ static diagrams.

## Chapter 2 Route Breakdown

### Ch2-1: Chuyển động chất điểm (4 routes)

| Route | Tên | Priority | Animation | Physics |
|---|---|---|---|---|
| ch2-1-1 | Quỹ đạo, vận tốc, gia tốc | P0 | **Cao** | v = dr/dt, a = dv/dt |
| ch2-1-2 | Chuyển động Đề các từ đồ thị | P0 | Trung bình | Đọc x(t), v(t), a(t) |
| ch2-1-3 | Tọa độ tự nhiên | P0 | Cao | tiếp tuyến, pháp tuyến, độ cong |
| ch2-1-4 | Thiết lập chuyển động | P1 | Cao | presets: đều, biến đổi đều |

### Ch2-2: Chuyển động quay (1 route)

| Route | Tên | Priority | Animation | Physics |
|---|---|---|---|---|
| ch2-2-2 | Quay quanh trục cố định | P0 | **Cao** | ω, α, φ = ω₀t + ½αt² |

### Ch2-3: Truyền động cơ khí (1 route)

| Route | Tên | Priority | Animation | Physics |
|---|---|---|---|---|
| ch2-3-2 | Truyền động bánh/dây | P0 | **Cao** | v₁ = v₂, ω₁r₁ = ω₂r₂ |

### Ch2-4: Chuyển động tương đối (4 routes)

| Route | Tên | Priority | Animation | Physics |
|---|---|---|---|---|
| ch2-4-1 | Hợp chuyển động | P0 | Cao | vₐ = vₑ + vᵣ |
| ch2-4-2 | Tuyệt đối, tương đối, kéo theo | P1 | Trung bình | Phân biệt 3 loại |
| ch2-4-3 | Tam giác vận tốc | P0 | Cao | Dựng Δv = vₑ + vᵣ |
| ch2-4-4 | Gia tốc Coriolis | P0 | Cao | a = aₑ + aᵣ + a꜀ |

### Ch2-5: Chuyển động phẳng (3 routes)

| Route | Tên | Priority | Animation | Physics |
|---|---|---|---|---|
| ch2-5-1 | Tịnh tiến + quay | P0 | Cao | Chuyển động phẳng |
| ch2-5-2 | Tâm vận tốc tức thời | P0 | **Cao** | IC, v_P = ω × r_P/IC |
| ch2-5-3 | Phân bố vận tốc | P0 | Cao | v_A, v_B trên thanh |

### Ch2-7: Bài tập động học (4 routes)

| Route | Tên | Priority | Animation | Physics |
|---|---|---|---|---|
| ch2-7-1 | Giải theo đồ thị & véc tơ | P0 | Trung bình | Step-by-step |
| ch2-7-2 | Kiểm tra số liệu x(t), v(t), a(t) | P1 | Không | Verify consistency |

## Key Animation Patterns

### Pattern 1: Continuous Path Animation (ch2-1-1, ch2-1-3)

```js
// Animation loop cho quỹ đạo chất điểm
function renderPathAnimation(lab, scene, state) {
  lab.anim.start();
  lab.anim.onFrame((t, dt) => {
    // t = 0..1 normalized, loop
    const loopT = t % 1;
    const angle = loopT * 2 * Math.PI;

    // Parametric position (elip)
    const a = state.semiMajor || 150;
    const b = state.semiMinor || 100;
    const x = 280 + a * Math.cos(angle);
    const y = 170 + b * Math.sin(angle);

    // Velocity: derivative of position
    const vx = -a * Math.sin(angle);
    const vy = b * Math.cos(angle);
    const speed = Math.hypot(vx, vy);

    // Clear + draw
    clearCanvas();
    drawGrid();

    // Trail
    state.trail = state.trail || [];
    state.trail.push({ x, y });
    if (state.trail.length > 120) state.trail.shift();
    drawTrail(ctx, state.trail, { color: '#2980b9', fade: true });

    // Point
    drawPoint(ctx, x, y, '#2980b9', 'M');

    // Velocity vector
    drawArrow(ctx, x, y, x + vx * 0.5, y + vy * 0.5, '#27ae60', 'v');

    // State update
    state.currentPos = { x, y };
    state.currentT = loopT;

    lab.anim.render(); // trigger DOM update
  });
}
```

### Pattern 2: Rotation Animation (ch2-2-2, ch2-5-1)

```js
// Quay thanh quanh trục O
function renderRotation(lab, scene, state) {
  lab.anim.start();
  lab.anim.onFrame((t, dt) => {
    const omega = state.omega || 2; // rad/s
    const angle = t * omega; // t in seconds

    const r = 120;
    const cx = 280, cy = 170;
    const bx = cx + r * Math.cos(angle);
    const by = cy + r * Math.sin(angle);

    // Draw bar
    drawLine(ctx, cx, cy, bx, by, '#495057', 6);

    // Point A (fixed at O)
    drawCircle(ctx, cx, cy, 6, '#dc3545');
    label(ctx, 'O', cx + 10, cy - 10, 12);

    // Point B (moving)
    drawCircle(ctx, bx, by, 6, '#2980b9');
    label(ctx, 'B', bx + 10, by - 10, 12);

    // Velocity of B: v = ω × r
    const vx = -omega * r * Math.sin(angle);
    const vy = omega * r * Math.cos(angle);
    drawArrow(ctx, bx, by, bx + vx * 20, by + vy * 20, '#27ae60', 'v');

    // Tangential direction
    drawArrow(ctx, bx, by, bx - vy * 10, by + vx * 10, '#fd7e14', 't');

    // Update readouts
    state.angleDeg = (angle * 180 / Math.PI) % 360;
    state.angularSpeed = omega;
  });
}
```

### Pattern 3: Instant Center + Velocity (ch2-5-2)

```js
// IC finder — thanh AB quay quanh IC
function renderIC(lab, scene, state) {
  lab.anim.start();
  lab.anim.onFrame((t, dt) => {
    const omega = 1.2; // rad/s
    const L = 200;
    const theta = t * omega;

    // A fixed at (100, 280), B slides horizontally
    const ax = 100, ay = 280;
    const bx = ax + L * Math.cos(theta);
    const by = ay; // B only moves horizontally

    // IC: perpendicular bisector of AB, intersects with extension line
    // For slider-crank-like motion: IC is at intersection
    const midX = (ax + bx) / 2;
    const midY = (ay + by) / 2;
    const slope = (by - ay) / (bx - ax + 0.001);
    const perpSlope = -1 / slope;

    // IC: intersection of perp bisector with horizontal line through A
    const icX = midX;
    const icY = ay; // perp bisector intersects horizontal through A

    // Draw
    drawLine(ctx, ax, ay, bx, by, '#495057', 5); // thanh AB
    drawCircle(ctx, ax, ay, 5, '#dc3545');         // A
    drawCircle(ctx, bx, by, 5, '#2980b9');         // B
    drawCircle(ctx, icX, icY, 5, '#27ae60');       // IC

    // v_B = ω × r_B/IC
    const rBX = bx - icX, rBY = by - icY;
    const vBx = -omega * rBY;
    const vBy = omega * rBX;
    drawArrow(ctx, bx, by, bx + vBx * 50, by + vBy * 50, '#27ae60', 'v_B');

    // Direction of v_B: perpendicular to IB
    // Direction of v_A: perpendicular to IA

    state.ic = { x: icX, y: icY };
    state.omega = omega;
  });
}
```

### Pattern 4: Coriolis Acceleration (ch2-4-4)

```js
// Coriolis: a = a_e + a_r + 2*omega × v_r
function renderCoriolis(lab, scene, state) {
  lab.anim.start();
  lab.anim.onFrame((t, dt) => {
    const omega = state.omega || 1;
    const vr = state.relativeSpeed || 50;

    // Rotating frame: disk
    drawCircle(ctx, 280, 170, 120, '#dee2e6');

    // Point P on disk at angle theta = omega*t
    const theta = omega * t;
    const r = 80;
    const px = 280 + r * Math.cos(theta);
    const py = 170 + r * Math.sin(theta);

    // Relative velocity (radial outward)
    const vrx = vr * Math.cos(theta);
    const vry = vr * Math.sin(theta);

    // Coriolis: 2*omega × v_r
    // omega is perpendicular to plane (z direction), so:
    // a_c = 2 * omega * vr * (-sin(theta), cos(theta))
    const acx = -2 * omega * vr * Math.sin(theta);
    const acy = 2 * omega * vr * Math.cos(theta);

    // Draw vectors
    drawArrow(ctx, px, py, px + vrx * 2, py + vry * 2, '#2980b9', 'v_r');
    drawArrow(ctx, px, py, px + acx * 2, py + acy * 2, '#e74c3c', 'a_c');

    state.coriolis = { x: acx, y: acy };
  });
}
```

## Related Code Files

### Create (new files)
```
js/sims/ch2/ch2-particle-motion-scenes.js
js/sims/ch2/ch2-particle-motion-renderers.js
js/sims/ch2/ch2-particle-motion-behaviors.js
js/sims/ch2/ch2-rotation-transmission-scenes.js
js/sims/ch2/ch2-rotation-transmission-renderers.js
js/sims/ch2/ch2-rotation-transmission-behaviors.js
js/sims/ch2/ch2-relative-motion-scenes.js
js/sims/ch2/ch2-relative-motion-renderers.js
js/sims/ch2/ch2-relative-motion-behaviors.js
js/sims/ch2/ch2-plane-motion-scenes.js
js/sims/ch2/ch2-plane-motion-renderers.js
js/sims/ch2/ch2-plane-motion-behaviors.js
js/sims/ch2/ch2-kinematics-exercises-scenes.js
js/sims/ch2/ch2-kinematics-exercises-renderers.js
js/sims/ch2/ch2-kinematics-exercises-behaviors.js
```

### Modify (existing files)
- `js/sim-scene-registry.js` — đăng ký 15 scene entries
- `js/sim-route-renderer-registry.js` — đăng ký 15 renderer functions
- `js/sim-route-behavior-registry.js` — đăng ký 15 behavior entries
- `index.html` — thêm script tags cho `js/sims/ch2/*.js`

## Implementation Steps

### Step 1: Ch2-1 Particle Motion (Day 1)

**1.1** Tạo 3 files Ch2-1:
- ch2-1-1: Quỹ đạo — **trail animation** + điểm M chuyển động trên elip/circle/parabol
- ch2-1-2: Đồ thị — vẽ x(t), v(t), a(t) graphs + cursor kéo thời gian
- ch2-1-3: Tọa độ tự nhiên — tiếp tuyến (đỏ), pháp tuyến (xanh lá), độ cong ρ
- ch2-1-4: Presets — buttons: "Đều", "Biến đổi đều", "Bài tập"

**Key implementation details:**
- ch2-1-2: Dùng `addGraphCursor()` từ SimInteractions để kéo thời gian trên đồ thị
- ch2-1-3: Tính radius of curvature: ρ = |v|³/|(v × a)| hoặc ρ = (1 + (y')²)^(3/2)/|y''|

### Step 2: Ch2-2 + Ch2-3 Rotation & Transmission (Day 2)

**2.1** Ch2-2-2: Quay quanh trục
- Thanh AB quay quanh O
- Animation: theta(t) = ω₀*t + ½*α*t²
- Hiển thị: ω, α, φ theo thời gian
- Controls: ω₀ slider, α slider

**2.2** Ch2-3-2: Truyền động bánh/dây
- 2 bánh răng nối với dây curoa
- Animation: ω₂ = ω₁ * r₁/r₂
- No-slip condition: v₁ = v₂ = ω₁*r₁ = ω₂*r₂
- Controls: ω₁ slider, r₁/r₂ ratio

### Step 3: Ch2-4 Relative Motion (Day 2-3)

**3.1** Ch2-4-1: Hợp chuyển động
- 2 khung quy chiếu: cố định + chuyển động
- Điểm P chuyển động trong khung chuyển động
- Animation: vₐ = vₑ + vᵣ
- Vẽ tam giác vận tốc

**3.2** Ch2-4-3: Tam giác vận tốc
- Dựng Δv = vₑ + vᵣ từ 2 vectors
- Interactive: kéo để thay đổi vₑ và vᵣ

**3.3** Ch2-4-4: Coriolis
- **Animation quan trọng**: đĩa quay, điểm trượt ra ngoài
- Vẽ: aₑ (hướng tâm), aᵣ (relative), a꜀ (Coriolis, đỏ)
- Công thức: a꜀ = 2*ω × vᵣ

### Step 4: Ch2-5 Plane Motion (Day 3-4)

**4.1** Ch2-5-1: Chuyển động phẳng
- Thanh AB: tịnh tiến + quay
- Vẽ: thanh, 2 điểm, vận tốc cả 2 điểm

**4.2** Ch2-5-2: **PRIORITY CAO NHẤT CH2**
- Tìm IC bằng kéo (interaction)
- Slider-crank mechanism: OA quay, AB dài L, B trượt ngang
- IC của thanh AB: intersection của đường qua A ⊥ v_A và đường qua B ⊥ v_B
- Animation: thanh quay, IC thay đổi vị trí liên tục

**4.3** Ch2-5-3: Phân bố vận tốc
- Cơ cấu 4 thanh hoặc slider-crank
- Vẽ thanh + các điểm + vận tốc vectors

### Step 5: Ch2-7 Exercises + Integration (Day 4-5)

**5.1** Ch2-7-1: Giải bài động học
- 2-panel: đồ thị + phương trình
- Step-by-step checkpoint

**5.2** Ch2-7-2: Kiểm tra số liệu
- Input: x(t), v(t), a(t) functions
- Verify: dv/dt ≈ a, dx/dt ≈ v

**5.3** Integration + tests

## TODO List

### Priority P0 — Day 1
- [x] ch2-1-1 renderer + behavior (trajectory + animation)
- [x] ch2-1-2 renderer + behavior (graph + time cursor)
- [x] ch2-1-3 renderer + behavior (natural coords + curvature)
- [x] ch2-2-2 renderer + behavior (rotation animation)

### Priority P0 — Day 2
- [x] ch2-3-2 renderer + behavior (gear transmission animation)
- [x] ch2-4-1 renderer + behavior (velocity composition)
- [x] ch2-4-3 renderer + behavior (velocity triangle)
- [x] ch2-4-4 renderer + behavior (Coriolis animation) — quan trọng

### Priority P0 — Day 3
- [x] ch2-5-1 renderer + behavior (plane motion)
- [x] ch2-5-2 renderer + behavior (instant center) — **quan trọng nhất Ch2**

### Priority P1 — Day 4
- [x] ch2-1-4 renderer + behavior (motion presets)
- [x] ch2-4-2 renderer + behavior (absolute/relative/transport)
- [x] ch2-5-3 renderer + behavior (velocity distribution)
- [x] ch2-7-1 renderer + behavior (kinematics solver)
- [x] ch2-7-2 renderer + behavior (numeric checker)

### Integration — Day 5
- [x] Cập nhật index.html — route files loaded
- [x] node --check cho route files
- [x] smoke_simulation_routes.py — 15 routes
- [x] Browser smoke — covered by release browser suite

## Success Criteria

1. **15/15 routes hoạt động**: animation liên tục cho ≥12 routes
2. **Physics đúng**: v, a, ω, α tính đúng từ derivatives
3. **Trail effect hoạt động**: quỹ đạo để lại vết mờ dần
4. **IC animation**: ch2-5-2 IC thay đổi vị trí mượt khi thanh quay
5. **Coriolis**: ch2-4-4 vẽ đủ 3 thành phần gia tốc
6. **Performance**: 15 routes × 60fps, không drop frame

## Validation Methods

```powershell
# Ch2 specific
python tools/smoke_simulation_manifest.py --require-routes 15 --chapter ch2 --require-objectives --require-direct --require-checkpoints-min 2
npm run test:sim:browser -- --grep "ch2-1-1|ch2-4-4|ch2-5-2|ch2-5-3|ch2-1-3"

# Physics verification (console)
# ch2-1-1: ellipse point at t=PI/4
# > SimPhysicsKinematics.ellipsePoint(150, 100, Math.PI/4)
# { x: ~236, y: ~170 }
```

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Trail rendering performance (15 routes) | Cao | Max 120 points per trail, fade alpha |
| Coriolis direction signs | Rất cao | Verify cross product direction |
| IC calculation errors | Cao | Test với known geometry |
| Animation timing sync | Trung bình | Use t (seconds) not frame count |
| requestAnimationFrame drift | Trung bình | Use performance.now() for delta |

## Next Steps

Phase 3 complete → Phase 4 (Ch3) bắt đầu. Phase 4 và Phase 5 có thể chạy gần đúng thời gian nếu có 2 team.

---

## Sync-back 2026-05-08

- Implemented: 15 Ch2 kinematics routes through route modules, scene catalogs, dedicated renderers, and split behavior files.
- Integrated: Ch2 split files `ch2-kinematics-behaviors-a.js` and `ch2-kinematics-behaviors-b.js` load in `index.html`.
- Verified: 58-route route/manifest/runtime/quality gates pass; Ch2 is included in the 25/15/18 runtime split.

**Status: DONE**
