---
name: Simulation Redesign Brainstorm Report
description: Tổng hợp phân tích + đề xuất hướng thiết kế lại simulation engine cho 58 routes
type: report
date: 2026-05-08
---

# Simulation Redesign Brainstorm Report

## Tổng quan

**Dự án:** Thiết kế lại toàn bộ simulation/interactive components trong Giáo trình Cơ Học Lý Thuyết
**Phạm vi:** 58 routes (Ch1: 20, Ch2: 16, Ch3: 22)
**Tech stack mục tiêu:** Vanilla JS + Canvas 2D + thư viện nhẹ hỗ trợ
**Animation:** Tất cả 58 routes đều cần animation thực sự
**Timeline:** Không gấp — chất lượng là ưu tiên số 1
**Ràng buộc cứng:** Giữ nguyên theme dark navy + gold (`--bg: #091a33`, `--gold: #c9963a`)

---

## Hiện trạng

### Kiến trúc hiện tại

```
index.html → js/app.js (UI shell)
           → js/sim-lab-ui.js (simple lab shell)
           → js/sim-professional-lab.js (lab engine)
           → js/sim-statics.js / sim-kinematics.js / sim-dynamics.js (adapters)
           → js/sims/ch*/ (58 route modules)
```

**Điểm mạnh:**
- 58 routes đã được đăng ký và mount được
- Registry pattern tốt (SimRouteRenderers, SimRouteBehaviors, SimSceneRegistry)
- Đã có primitive layer (SimRouteRendererPrimitives)
- KaTeX rendering cho công thức
- Readout cards grid cho hiển thị giá trị

**Điểm yếu nghiêm trọng:**

| Vấn đề | Chi tiết |
|---------|----------|
| `derived()` god function | 141+ dòng, 14+ nhánh routeId hardcoded trong `sim-professional-lab.js` |
| Shared mutable state keys | `primary`, `vector`, `t`, `mode` bị reuse cho 58 routes khác nhau |
| Renderer hardcoded pixel | Offset arithmetic như `state.primary.x + 92` baking vào draw calls |
| KaTeX overlay thrashing | DOM nodes recreate mỗi frame khi latex thay đổi |
| No responsive canvas | Canvas fixed `560x340`, CSS scale gây degradation |
| Touch targets nhỏ | 20px < standard 44px accessibility |
| No visual feedback khi drag | Không ghost preview, không trajectory hint, không constraint viz |
| Ch3 thiếu animation | `onTick` chỉ defined cho vài routes |
| Ch2 thiếu timeline/scrubber | `state.t` control nhưng không có UI riêng |
| No undo/redo/history | Không save/restore state |

### Reference: DeCuong_CoHocLyThuyet.html

Prototype độc lập có 3 simulation chạy thực sự, cho thấy UX pattern tốt:

- **Parallelogram Law**: Drag F1/F2 → hình bình hành + R update real-time
- **Beam Reaction**: Drag P trên dầm → phản lực RA/RB tính ngay
- **Particle Motion**: Quỹ đạo parametric + velocity/acceleration vectors + trail

UX pattern đáng học: drag handle → real-time math → info card grid → inline equation → hint → reset.

---

## Phương án đề xuất

### Đánh giá 3 phương án

#### Phương án A: Refactor tại chỗ (In-place Refactor)
Cải thiện 58 routes hiện tại mà không đổi kiến trúc lớn.

| Tiêu chí | Đánh giá |
|-----------|-----------|
| Thời gian | Trung bình (4-6 tuần) |
| Rủi ro | Thấp |
| Chất lượng cuối | Trung bình — vẫn giữ procedural ctx calls, god function |
| Maintainability | Thấp — god function và shared state vẫn tồn tại |

**Kết luận:** Không phù hợp với mục tiêu "design lại từ đầu."

#### Phương án B: Thiết kế lại toàn phần — Scene Graph + Constraint-based (RECOMMENDED)

Thiết kế lại simulation engine với kiến trúc declarative, physics-driven, animation-first.

| Tiêu chí | Đánh giá |
|-----------|-----------|
| Thời gian | Cao (8-12 tuần) |
| Rủi ro | Trung bình |
| Chất lượng cuối | Cao |
| Maintainability | Cao — clear separation of concerns |

**Kết luận:** Phù hợp với mục tiêu và timeline.

#### Phương án C: WebGL/Three.js
Dùng WebGL rendering thay vì Canvas 2D.

| Tiêu chí | Đánh giá |
|-----------|-----------|
| Thời gian | Rất cao (16+ tuần) |
| Rủi ro | Cao |
| Chất lượng cuối | Rất cao (3D có thể) |
| Offline | Có thể bundle |

**Kết luận:** Quá mức cho bài toán 2D + offline-first.

---

## Recommended Architecture

### Phương án B — Chi tiết thiết kế

#### Layer 1: Physics Core (mới)
```
js/physics/
├── vec2.js              # Vector2D class: add, sub, scale, dot, cross, normalize, rotate
├── body.js              # RigidBody: position, velocity, angle, angularVel, mass, inertia
├── constraint.js        # Spring, Pin, Revolute, Prismatic, Distance constraints
├── world.js             # PhysicsWorld: bodies[], constraints[], step(dt), solve(iterations)
└── integrator.js        # Euler, RK4, Verlet integrator options
```

**Nguyên tắc:**
- Tất cả state vật lý là first-class: `body.position`, `body.velocity`, `body.force`
- Constraints được giải đồng thời (position-based dynamics hoặc iterative)
- Không hardcoded pixel — dùng world units (SI: m, kg, N)

#### Layer 2: Scene Graph (mới)
```
js/scene/
├── node.js              # SceneNode: transform, children, render(ctx)
├── body-node.js         # Links RigidBody ↔ SceneNode, auto-sync position
├── joint-node.js        # Visualizes constraints: spring coil, pin dot, beam
├── arrow-node.js        # Vector visualization (force, velocity, acceleration)
├── trail-node.js        # Motion trail với configurable max points
└── scene.js             # SceneGraph: nodes[], camera, background, grid
```

**Nguyên tắc:**
- Declarative: khai báo scene như tree, không imperative draw calls
- Camera support: pan, zoom, rotate
- Auto-sync: khi physics step → body position thay đổi → body-node render tự động

#### Layer 3: Rendering Pipeline (cải tiến)
```
js/render/
├── renderer.js          # Main canvas renderer: clear, draw background, draw grid, draw scene
├── primitives.js        # Low-level: arrow, arc, rectangle, circle, polygon, path, text
├── effects.js           # Glow, gradient, glassmorphism, particle burst
├── camera.js            # Pan/zoom/rotate camera với transform matrix
└── offscreen.js        # OffscreenCanvas for heavy computation (optional)
```

**Cải tiến so với hiện tại:**
- Camera transform: pan/zoom mà không cần recalculate pixel coords
- Glow effects đồng nhất cho tất cả vectors
- Trail system built-in vào scene graph

#### Layer 4: Interaction System (mới hoàn toàn)
```
js/interaction/
├── interaction-manager.js  # Pointer, touch, keyboard unified handler
├── handle.js              # Draggable handle: position, radius, color, onDrag callback
├── handle-manager.js      # Manages multiple handles, hit-testing, focus management
├── gesture.js             # Pan, pinch-zoom, two-finger rotate
├── nudge.js               # Arrow key nudge với configurable step
└── guide.js               # Snap-to-grid, snap-to-angle, snap-to-point
```

**Cải tiến so với hiện tại:**
- Ghost preview khi drag
- Snap guides (grid, angle, point)
- Multi-touch gesture support
- Focus management với Tab navigation
- Configurable hit radius (default 44px cho accessibility)

#### Layer 5: Animation System (mới hoàn toàn)
```
js/animation/
├── timeline.js          # Playhead, keyframes, scrubber UI
├── animator.js          # requestAnimationFrame loop với delta time
├── interpolator.js      # Linear, ease-in-out, spring, bounce interpolation
├── tween.js             # Tween property từ value A → B trong duration
└── playback-ui.js       # Play/pause/scrub controls + timeline bar
```

**Cải tiến so với hiện tại:**
- Scrubber/timeline cho Ch2/Ch3 time parameter
- Keyframe recording (record simulation state at key moments)
- Smooth interpolation giữa animation states
- Playback speed control (0.25x → 2x)

#### Layer 6: Route Simulation Layer (mới)
```
js/routes/
├── route-registry.js    # 58 route definitions: { id, chapter, type, scene, physics, interaction }
├── route-builder.js     # Builder pattern: route.scene.addBody(), route.addConstraint()
├── chapter-statics.js   # Ch1: vector anatomy, moment, couple, beam, friction, centroid
├── chapter-kinematics.js # Ch2: trajectory, velocity graph, rotation, transmission, Coriolis
├── chapter-dynamics.js  # Ch3: Newton, D'Alembert, energy, impulse-momentum, collision
└── equation-display.js  # Auto-generate equation string từ physics state
```

**Key principle:** Mỗi route được khai báo declarative, KHÔNG imperative draw calls.

**Ví dụ route definition:**
```js
SimRouteRegistry.register('ch1-parallelogram', {
  chapter: 1,
  type: 'statics',
  physics: {
    bodies: [
      { id: 'particle', type: 'particle', x: 0, y: 0 }
    ],
    forces: [
      { body: 'particle', fx: 100, fy: 50, label: 'F1' },
      { body: 'particle', fx: 80, fy: -30, label: 'F2' }
    ],
    constraints: []
  },
  interaction: {
    handles: [
      { body: 'force1', property: 'fx', range: [0, 200], label: 'F₁' },
      { body: 'force1', property: 'fy', range: [-100, 100], label: 'θ₁' },
      { body: 'force2', property: 'fx', range: [0, 200], label: 'F₂' },
      { body: 'force2', property: 'fy', range: [-100, 100], label: 'θ₂' }
    ]
  },
  readouts: [
    { label: 'R', compute: s => vector.mag(s.resultantForce), unit: 'N' },
    { label: 'α', compute: s => vector.angle(s.resultantForce), unit: '°' }
  ],
  equations: [
    { text: '\\vec{R} = \\vec{F}_1 + \\vec{F}_2' }
  ]
});
```

#### Layer 7: UI Shell (cải tiến)
Giữ nguyên `js/sim-lab-ui.js` shell structure nhưng cải thiện:
- `.sim-readout-grid` → responsive auto-fit, min 140px
- Thêm `.sim-timeline` cho scrubber
- Thêm `.sim-equation-panel` cho inline equation display (lấy từ route.equations)
- Thêm `.sim-ghost-overlay` cho ghost preview khi drag
- Control buttons: reset, play/pause, speed selector

---

## Simulation Categories & Animation Requirements

| Chapter | Routes | Simulation Types | Animation Needs |
|---------|--------|-----------------|-----------------|
| **Ch1 (Tĩnh học)** | 20 | Vector anatomy, Moment arm, Force reducer, Couple, FBD builder, Support reactions, Friction, Centroid | Force vectors animate direction/magnitude, moment arm rotates around point, beam deflection, friction threshold snap |
| **Ch2 (Động học)** | 16 | Cartesian trajectory, Position/velocity graph, Natural coordinates, Rotation, Gear transmission, Relative motion, Coriolis, Instant center, Slider-crank | Full trajectory animation, graph cursor scrubbing, rotation with angular velocity, gear meshing, Coriolis path |
| **Ch3 (Động lực)** | 22 | Newton's laws, D'Alembert, Mass-spring, Impulse-momentum, Angular momentum, Work-energy, Collision | Full physics simulation: bodies move under forces, collision response, energy bar graphs, momentum vectors |

---

## Library Additions

| Library | Purpose | Why | Size |
|---------|---------|-----|------|
| Custom vec2.js | Vector math | Không cần library ngoài, viết tinh gọn | ~100 LOC |
| Custom tween.js | Easing/interpolation | Thay vì GSAP, tự viết nhẹ | ~80 LOC |
| Custom body-constraint physics | Position-based dynamics | Đủ cho 2D mechanics, không cần Box2D | ~300 LOC |

**Tổng cộng thêm:** ~500 LOC pure JS, zero external dependency, offline-ready.

---

## Migration Strategy

### Phase 0: Architecture Foundation (Tuần 1-2)
- [ ] Vec2 class + body + constraint + world (physics core)
- [ ] Scene graph: node, scene, camera
- [ ] Render primitives + effects
- [ ] Interaction manager + handle system
- [ ] Animation timeline + playback UI

### Phase 1: 3 Pilot Routes (Tuần 3-4)
- [ ] Chọn 3 routes từ 3 chapter làm pilot: 1 statics, 1 kinematics, 1 dynamics
- [ ] Implement đầy đủ theo new architecture
- [ ] Validate: interaction, animation, readout, equation display
- [ ] Review và điều chỉnh architecture nếu cần

### Phase 2: Chương 1 — Tĩnh học (Tuần 5-7)
- [ ] 20 routes statics: vector, moment, couple, beam, friction, centroid
- [ ] Consistent interaction model
- [ ] All readout cards working
- [ ] KaTeX equation display

### Phase 3: Chương 2 — Động học (Tuần 8-9)
- [ ] 16 routes kinematics: trajectory, graph, rotation, relative motion, Coriolis
- [ ] Full animation với timeline scrubber
- [ ] Playback controls (play/pause/speed)

### Phase 4: Chương 3 — Động lực học (Tuần 10-11)
- [ ] 22 routes dynamics: Newton, energy, impulse, collision
- [ ] Full physics simulation với physics world
- [ ] Energy/momentum visualization

### Phase 5: Polish & Integration (Tuần 12)
- [ ] Mobile responsiveness
- [ ] Touch targets ≥ 44px
- [ ] Ghost preview khi drag
- [ ] Snap guides
- [ ] Undo/redo stack
- [ ] Integration test: 58 routes mount + QA suite pass

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Routes functional | 58/58 mount và render đúng |
| Animation | 58/58 có animation (không còn static diagram) |
| Interaction | Drag handles responsive, ghost preview, snap guides |
| Readout accuracy | Giá trị readout match physics computation |
| Equation display | KaTeX hiển thị đúng tất cả routes |
| Responsive | Canvas tự scale đúng trên mobile (320px+) |
| Touch accessibility | Touch targets ≥ 44px |
| Performance | 60fps trên device thực (không có jank) |
| Offline | Chạy hoàn toàn offline via `file://` |
| QA suite | `npm run test:sim:browser` pass ≥ hiện tại (268 pass + 1 skip) |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| God function `derived()` refactor quá lớn | High | Medium | Phasing: extract từng phần vào route-scoped physics computation |
| Breaking existing route behaviors | High | High | Keep old registry parallel, new layer wraps old layer trong transition |
| Performance: scene graph overhead | Medium | Medium | Use dirty-flag rendering: only re-render changed nodes |
| KaTeX overlay thrashing | Medium | Low | Cache rendered DOM nodes, update position only |
| 58 routes migration taking too long | Medium | Medium | Strict phase gates: pilot must pass trước khi scale |
| Offline requirement vs. library | Low | High | Zero external dependency cho physics/render/animation |

---

## Unresolved Questions

1. **Camera support cần thiết không?** Có nên support pan/zoom/rotate cho simulation canvas không, hay chỉ fixed view?
2. **Constraint solver: position-based dynamics (PBD) hay impulse-based?** PBD ổn định hơn cho chain/spring nhưng cần more iterations.
3. **Unit system: SI (m, kg, N) hay pixel-based?** Pixel-based quen thuộc hơn nhưng SI physics-correct hơn.
4. **Backward compatibility: giữ hay bỏ `window.SIM_MAP` và `window.SimRegistry`?** Giữ để loader.js không cần thay đổi.
5. **Existing 30+ sim-*.js files: deprecate hay refactor?** Recommend: deprecate sau khi migration hoàn tất, không refactor từng file.

---

## Recommendation Summary

**Chọn Phương án B** — Scene Graph + Constraint-based redesign.

**Lý do:**
1. Phù hợp mục tiêu "design lại từ đầu"
2. Giữ được Vanilla JS + Canvas 2D (zero new dependency)
3. Chỉ thêm ~500 LOC physics/interaction/animation helpers
4. Declarative architecture giải quyết triệt để god function và shared state
5. Maintainability cao: thêm route mới chỉ cần khai báo declarative config
6. Timeline 12 tuần với chất lượng ưu tiên

**Điểm khác biệt quan trọng nhất so với hiện tại:**
- Physics state là first-class (velocity, acceleration, momentum)
- Constraints là first-class (spring, pin, joint) thay vì hardcoded drag handles
- Animation timeline scrubber cho Ch2/Ch3
- Ghost preview + snap guides cho interaction
- Scene graph declarative thay vì imperative draw calls

---

*Status: DONE — ready for `/ck:plan`*
