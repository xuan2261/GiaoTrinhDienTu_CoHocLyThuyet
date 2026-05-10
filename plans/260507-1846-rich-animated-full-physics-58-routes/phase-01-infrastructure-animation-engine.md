# Phase 01 — Infrastructure & Animation Engine

## Context Links
- Plan: [plan.md](../plan.md)
- Code standards: `docs/code-standards.md`
- Design guidelines: `docs/design-guidelines.md`

## Overview

**Priority: P1** | **Current status:** Complete — infrastructure modules present and loaded by `index.html` | **Effort: ~3 ngày**

Xây dựng animation engine + physics helpers + enhanced primitives — nền tảng cho 58 route × excellent. Phase này KHÔNG implement route cụ thể, chỉ tạo toolkit để Phase 2/3/4 dùng.

## Key Insights

1. `sim-professional-lab.js` mount engine đã well-designed, cần mở rộng chứ không thay thế
2. Animation cần stateless animation loop gắn vào lab lifecycle (start/stop/pause)
3. Physics helpers phải tách domain: statics vs kinematics vs dynamics
4. DOM overlay system (domMath/domLabel/domPanel) đã có, cần mở rộng thêm glow effects
5. Interaction layer (SimInteractions) đã tốt — chỉ cần thêm snap guides và ghost states

## Requirements

### Functional
- Animation engine: start/stop/pause/resume, easing functions, trail rendering, particle system
- Physics helpers: statics (force resolution, moment, equilibrium), kinematics (trajectory, velocity, acceleration, rotation), dynamics (Newton's laws, ODE solvers, collision, energy)
- Enhanced primitives: glow effects, gradient fills, smooth arrows, grid with major/minor lines
- KaTeX integration: formula rendering on overlay, auto-update on state change
- Snap guides: visual guides when dragging near important positions
- Ghost states: semi-transparent preview of target state during drag

### Non-functional
- Animation 60fps target (requestAnimationFrame)
- Physics computation < 1ms per frame
- Memory-safe particle system (pool + max count limit)
- No layout thrashing from DOM overlay updates
- Backward compatible với existing SimProfessionalLab mount

## Architecture

```
sim-animation-engine.js          ← NEW: Animation loop, easing, particles, trails
sim-physics-statics.js          ← NEW: Force resolution, moment, beam reactions
sim-physics-kinematics.js       ← NEW: Trajectory, velocity, acceleration, rotation
sim-physics-dynamics.js        ← NEW: Newton, ODE solvers, collision, energy
sim-visual-helpers.js           ← ENHANCED: Glow, gradient, smooth arrow, grid
sim-interaction-enhancements.js  ← ENHANCED: Snap guides, ghost states
```

### Animation Engine API

```js
// sim-animation-engine.js
SimAnimationEngine = {
  // Lab lifecycle binding
  bindToLab(lab, scope)          // gắn animation loop vào lab lifecycle
  unbind()                       // cleanup khi unmount

  // Loop control
  start()                         // bắt đầu animation
  stop()                         // dừng hẳn
  pause()                        // tạm dừng
  resume()                       // tiếp tục

  // State
  isRunning()                     // boolean
  getFPS()                       // frames per second

  // Easing functions
  easeInOut(t)                   // smooth easing
  easeOut(t)                     // decelerate
  easeIn(t)                      // accelerate
  spring(t, tension, friction)   // spring physics

  // Trail renderer
  createTrail(maxPoints)         // trail buffer
  addTrailPoint(trail, x, y)    // thêm điểm
  drawTrail(ctx, trail, config)  // vẽ trail với fade

  // Particle system
  createParticleEmitter(x, y, config)  // emit particles
  updateParticles(dt)            // update all active particles
  drawParticles(ctx)             // vẽ all particles
  clearParticles()               // cleanup
}

// Usage in renderer:
function animate(lab, scene, state) {
  lab.anim.start();
  lab.anim.onFrame((t, dt) => {
    // t = animation time (0-1), dt = delta time
    // update state based on physics
    // draw
  });
}
```

### Physics Helpers API

```js
// sim-physics-statics.js
SimPhysicsStatics = {
  resolveForceComponents(F, alphaDeg)       // Fx, Fy từ F và góc
  computeMoment(F, r, alphaDeg)            // M = r × F
  beamReactions(load, distA, distB, x)     // RA, RB theo vị trí
  coupleMoment(F, d)                        // M = F × d
  spatialForceComponents(Fx, Fy, Fz, alpha, beta)  // 3D components
  spatialMoment(Mx, My, Mz)                 // M O = r × F
  reduceToResultant(F1, F2, r1, r2)        // R + M O
  frictionNormal(mu, N)                    // F_ms max
  tensionInCable(w, L, x)                  // lực căng dây
  centroidComposite(shapes)                 // C of composite area
  centroidWithHole(area, hole)             // C with cut-out
}

// sim-physics-kinematics.js
SimPhysicsKinematics = {
  // Trajectory
  ellipsePoint(a, b, t)                    // điểm trên elip
  parabolaPoint(v0, alpha, g, t)           // điểm trên parabol
  circlePoint(r, omega, t, cx, cy)         // điểm trên vòng tròn
  cycloidPoint(r, omega, t)                // điểm trên cycloid

  // Derivatives
  velocityFromTrajectory(posFn, t, dt)       // v = dp/dt
  accelerationFromVelocity(velFn, t, dt)    // a = dv/dt
  tangentialAcceleration(v, a)              // a_t = projection
  normalAcceleration(v, rho)                // a_n = v²/ρ

  // Rotation
  angularVelocity(omega0, alpha, t)         // ω = ω₀ + αt
  angularDisplacement(omega0, alpha, t)      // φ = ω₀t + ½αt²
  tangentialVelocity(omega, r)              // v_t = ωr
  centrifugalAcceleration(omega, r)          // a_c = ω²r

  // Transmission
  gearRatio(r1, r2)                         // i = ω1/ω2
  beltVelocity(omega, r)                   // v = ωr
  noSlipCondition(omega1, r1, omega2, r2) // check no-slip

  // Composition
  absoluteVelocity(ve, vr)                 // va = ve + vr
  coriolisAcceleration(omega, vr, dt)      // a_c = 2ω × vr
  transportAcceleration(omega, omega_dot, r)// a_t = α × r

  // Instant center
  instantCenterVelocity(v, omega, r)        // v_P = ω × r_PIC
  locateInstantCenter(bar, contact)         // tìm IC từ geometry

  // Slider-crank
  sliderCrankPos(r, L, theta)              // x slider
  sliderCrankVelocity(omega, r, theta, L)  // v slider
}

// sim-physics-dynamics.js
SimPhysicsDynamics = {
  // Newton
  accelerationFromForce(F, m)               // a = F/m
  inertialForce(m, a)                      // F_i = -ma

  // Friction
  frictionForce(mu, N)                     // F_ms = μN
  staticLimitAngle(mu)                     // tan φ = μ
  slipCondition(alpha, mu)                  // α > φ → slip

  // ODE solvers
  eulerStep(state, dt, derivativeFn)       // Euler integration
  rk4Step(state, dt, derivativeFn)         // RK4 integration
  integrateMotion(m, k, F_ext, v0, x0, dt) // spring-mass system

  // Collision
  elasticCollision(m1, m2, v1, v2)         // e = 1
  inelasticCollision(m1, m2, v1, v2)       // e = 0
  restitutionVelocity(m1, m2, v1, v2, e)   // e tùy ý
  momentumBefore(m1, m2, v1, v2)           // p trước
  momentumAfter(result)                    // p sau va chạm

  // Energy
  kineticEnergy(m, v)                      // T = ½mv²
  potentialEnergy(m, g, h)                 // V = mgh
  springEnergy(k, x)                       // V = ½kx²
  workDone(F, d, alpha)                   // A = F·d·cosα
  powerInstant(F, v)                       // N = F·v

  // Angular momentum
  angularMomentum(I, omega)                // L = Iω
  torqueFromForce(F, r, alpha)             // M = r × F
  momentOfInertia(m, r)                    // I = mr² (point mass)
  parallelAxis(I_cm, m, d)                 // I_O = I_cm + md²

  // D'Alembert
  dalembertForce(m, a)                     // F* = -ma
  equilibriumWithInertia(F_ext, m, a)       // ΣF + F* = 0
}
```

### Enhanced Visual Helpers API

```js
// sim-visual-helpers.js
SimVisualHelpers = {
  // Glow effects
  glow(ctx, fn, color, blur)               // vẽ với glow
  setGlow(color, blur)                     // set canvas shadow for glow
  clearGlow(ctx)                           // restore

  // Gradient fills
  linearGradient(ctx, x1, y1, x2, y2, stops)  // linear gradient
  radialGradient(ctx, cx, cy, r, stops)       // radial gradient

  // Enhanced arrows
  arrow(ctx, x1, y1, x2, y2, color, opts)    // opts: {headSize, headAngle, lineWidth, glow, dash}
  doubleArrow(ctx, x1, y1, x2, y2, color, opts)
  curvedArrow(ctx, x1, y1, cx, cy, x2, y2, color, opts)

  // Grid
  drawGrid(ctx, w, h, majorStep, minorStep)    // major + minor grid lines
  drawAxes(ctx, x, y, w, h, xLabel, yLabel)    // với major ticks

  // Body fills
  filledRect(ctx, x, y, w, h, fill, stroke, radius)  // rounded rect
  filledCircle(ctx, cx, cy, r, fill, stroke)          // filled circle
  filledPolygon(ctx, points, fill, stroke)              // polygon

  // Animation
  fadeIn(ctx, alpha, fn)                   // fade in effect
  pulse(ctx, fn, period)                   // pulsing effect

  // Trail
  createTrail(color, maxPoints, fade)       // trail buffer
  addTrailPoint(trail, x, y)               // add point
  drawTrail(ctx, trail)                     // draw with fade
}

// Snap guide system
SnapGuides = {
  create(snapPoints, tolerance)             // tạo guide với snap points
  getSnapTarget(x, y)                      // trả về snap point gần nhất hoặc null
  drawGuides(ctx, activeSnap)              // vẽ guide lines khi snapping
}

// Ghost state system
GhostState = {
  setOpacity(alpha)                         // set ghost opacity (0-0.4)
  drawGhost(ctx, fn)                       // vẽ preview state
  hide()                                   // ẩn ghost
}
```

## Related Code Files

### Create (new files)
- `js/sim-animation-engine.js` (~304 lines)
- `js/sim-physics-statics.js` (~244 lines)
- `js/sim-physics-kinematics.js` (~398 lines)
- `js/sim-physics-dynamics.js` (~355 lines)
- `js/sim-visual-helpers.js` (~368 lines)
- `js/sim-interaction-enhancements.js` (~256 lines)

> Note: Infrastructure modules (Phase 01) are exempt from the 220-line route-module limit. They are foundational libraries that serve all 58 routes and cannot be meaningfully split without degrading code quality. Route modules in Phase 02/03/04 still follow the 220-line cap.

### Modify (existing files)
- `js/sim-professional-lab.js` — integrate animation engine binding, add lab.anim API
- `js/sim-lab-ui.js` — expose animation controls in toolbar (play/pause/reset)
- `js/sim-route-renderer-primitives.js` — export enhanced primitives (glow, gradient, snap guides)
- `index.html` — add script load order cho 6 file mới

### Delete
- Không delete gì trong phase này

## Implementation Steps

### Step 1: Animation Engine (Day 1)

**1.1** Tạo `js/sim-animation-engine.js`:
- `SimAnimationEngine` object với `bindToLab(lab, scope)`, `start()`, `stop()`, `pause()`, `resume()`
- `requestAnimationFrame` loop với FPS tracking và delta time
- Easing functions: `easeIn`, `easeOut`, `easeInOut`, `spring`
- Trail renderer: circular buffer, fade-out effect
- Particle system: emitter factory, velocity/gravity/lifetime per particle, max 200 particles, object pooling

**1.2** Cập nhật `js/sim-professional-lab.js`:
- Import SimAnimationEngine
- Trong `mount()`, sau khi tạo lab, gọi `lab.anim = SimAnimationEngine.bindToLab(lab, scope)`
- Thêm `lab.anim.onFrame(callback)` — callback nhận (t, dt) với t = animation time, dt = delta
- Cleanup animation khi scope dispose

**1.3** Cập nhật `js/sim-lab-ui.js`:
- Thêm 3 button vào toolbar: Play, Pause, Reset
- Play → `lab.anim.start()`, Pause → `lab.anim.pause()`, Reset → `lab.anim.reset()`
- Button states: active/inactive coloring

### Step 2: Physics Helpers (Day 1-2)

**2.1** Tạo `js/sim-physics-statics.js`:
- Tất cả functions từ API spec trên
- Mỗi function có JSDoc với units (N, m, rad, kg)
- Derivative check cho moment: M = r × F = rx*Fy - ry*Fx (2D signed)
- Beam reactions: RA = P*(L-x)/L, RB = P*x/L

**2.2** Tạo `js/sim-physics-kinematics.js`:
- Trajectory functions: ellipse (parametric), parabola, circle, cycloid
- Numerical derivatives: central difference cho v và a từ position function
- Normal acceleration: a_n = v²/ρ, với ρ từ curvature radius
- Slider-crank: x = r*cos(θ) + sqrt(L² - r²*sin²(θ)), v = -r*ω*sin(θ)*(1 + r*cos(θ)/sqrt(...))
- Instant center: velocity perpendicular to line from IC

**2.3** Tạo `js/sim-physics-dynamics.js`:
- ODE solvers: Euler và RK4 (4th order Runge-Kutta)
- Spring-mass: x'' + (k/m)*x = F_ext/m, integrate với RK4
- Collision: v1' = ((m1-e*m2)*v1 + (1+e)*m2*v2)/(m1+m2), v2' = ((m2-e*m1)*v2 + (1+e)*m1*v1)/(m1+m2)
- Moment of inertia formulas: disk I = ½mr², rod about center I = 1/12*ml², about end I = 1/3*ml²
- D'Alembert: đặt inertial force = -m*a tại COM

### Step 3: Visual Helpers (Day 2-3)

**3.1** Tạo `js/sim-visual-helpers.js`:
- Glow: `ctx.shadowColor = color, ctx.shadowBlur = blur`, restore sau khi vẽ
- Linear gradient: `ctx.createLinearGradient`, multi-stop
- Enhanced arrows: variable head size theo length, rounded joins, optional glow
- Grid: major lines (1px) + minor lines (0.5px, lighter color), 40px major, 10px minor
- Rounded rectangles: `ctx.roundRect` hoặc manual arc corners

**3.2** Tạo `js/sim-interaction-enhancements.js`:
- SnapGuides: accept array of {x, y, label}, return nearest within tolerance, draw dashed guide lines
- GhostState: store current state snapshot, draw semi-transparent (alpha=0.35) version during drag
- Visual feedback: cursor change, handle highlight color on hover/active

### Step 4: Integration & Load Order (Day 3)

**4.1** Cập nhật `index.html` script load order:
```html
<!-- Animation & Physics (Phase 1) -->
<script src="js/sim-animation-engine.js"></script>
<script src="js/sim-physics-statics.js"></script>
<script src="js/sim-physics-kinematics.js"></script>
<script src="js/sim-physics-dynamics.js"></script>
<script src="js/sim-visual-helpers.js"></script>
<script src="js/sim-interaction-enhancements.js"></script>
<!-- Đặt SAU sim-core.js, sim-rendering.js, sim-interactions.js, sim-lab-ui.js -->
<!-- Đặt TRƯỚC sim-professional-lab.js -->
```

**4.2** Cập nhật `js/sim-professional-lab.js`:
- Import: `const anim = window.SimAnimationEngine || {}`
- Trong mount(), sau lab creation: `lab.anim = anim.bindToLab ? anim.bindToLab(lab, scope) : null`
- Thêm `lab.anim.onFrame` wrapper để đảm bảo backward compatibility khi animation engine chưa load

**4.3** Verify load order bằng cách mở index.html và kiểm tra console không có "SimAnimationEngine is not defined"

## TODO List

- [x] Tạo `js/sim-animation-engine.js` — animation loop, easing, trails, particles
- [x] Integrate animation engine vào `js/sim-professional-lab.js` — `lab.anim` API
- [x] Thêm play/pause/reset buttons vào `js/sim-lab-ui.js` toolbar
- [x] Tạo `js/sim-physics-statics.js` — statics helper functions
- [x] Tạo `js/sim-physics-kinematics.js` — kinematics helper functions
- [x] Tạo `js/sim-physics-dynamics.js` — dynamics helper functions (bao gồm RK4 solver)
- [x] Tạo `js/sim-visual-helpers.js` — glow, gradient, enhanced arrows, grid
- [x] Tạo `js/sim-interaction-enhancements.js` — snap guides, ghost states
- [x] Cập nhật `index.html` — script load order cho 6 file mới
- [x] Cập nhật `js/sim-professional-lab.js` — animation engine binding
- [x] Chạy `node --check` cho 7 file mới
- [x] Chạy smoke tests — `python tools/smoke_simulation_runtime.py`
- [x] Chạy browser smoke — covered by release browser suite

## Success Criteria

1. **Animation engine hoạt động**: play/pause/reset buttons xuất hiện và hoạt động đúng
2. **Physics helpers đúng**: Unit test kiểm tra 10+ physics formulas với known inputs → expected outputs (±0.1% tolerance)
3. **Visual helpers đúng**: Canvas có glow effect khi vẽ arrows, grid có major/minor lines
4. **No regression**: Tất cả existing smoke tests vẫn pass
5. **Performance**: Animation 60fps, physics computation < 1ms/frame
6. **Backward compatible**: Khi animation engine không load, lab vẫn hoạt động (graceful degradation)

## Validation Methods

```powershell
# 1. Syntax check
node --check js/sim-animation-engine.js
node --check js/sim-physics-statics.js
node --check js/sim-physics-kinematics.js
node --check js/sim-physics-dynamics.js
node --check js/sim-visual-helpers.js
node --check js/sim-interaction-enhancements.js

# 2. Runtime smoke
python tools/smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors,SimAnimationEngine,SimPhysicsStatics,SimPhysicsKinematics,SimPhysicsDynamics,SimVisualHelpers --expect-runtime-routes 58

# 3. Browser smoke (manual check 3 routes)
# Mở ch1-1-3, ch2-1-1, ch3-2-2 bằng file://
# Kiểm tra: play button hoạt động, FPS ~60, no console errors

# 4. Physics unit test (sẽ implement trong phase 5)
# Tạm thời test bằng console:
# > SimPhysicsStatics.resolveForceComponents(100, 45)
# { fx: 70.71, fy: 70.71 }
```

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Animation loop memory leak | Cao | Lifecycle binding với scope.dispose() |
| Particle system performance | Cao | Max 200 particles, object pooling |
| KaTeX CDN fail offline | Thấp | Local fallback đã có từ Phase 0 |
| Backward compatibility break | Thấp | Feature detection trước khi dùng |
| Physics precision errors | Cao | Unit tests với known values |

## Security Considerations

- Không có input validation cần thiết (physics helpers nhận numbers)
- DOM overlay updates cần debounce nếu state thay đổi liên tục
- localStorage usage cho assessment không đổi
- Không có network calls trong animation/physics code

## Next Steps

Phase 1 complete → Phase 2 (Ch1 - 25 routes) có thể bắt đầu song song với Phase 3 (Ch2 - 15 routes) nếu có 2 team.

---

## Sync-back 2026-05-08

- Implemented: animation engine, statics/kinematics/dynamics physics helpers, visual helpers, interaction enhancements.
- Integrated: `SimProfessionalLab` exposes helper namespaces and route labs bind animation lifecycle.
- Verified: `npm run test:sim:unit` includes Phase 01 helper assertions and passes.

**Status: DONE**
