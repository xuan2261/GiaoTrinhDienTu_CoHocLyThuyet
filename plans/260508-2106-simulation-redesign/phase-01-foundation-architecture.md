---
phase: 01
title: "Foundation Architecture"
status: completed
priority: P1
effort: 2 tuần
dependencies: []
---

# Phase 01: Foundation Architecture

## Overview
Xây dựng nền tảng kiến trúc mới: physics core, scene graph, rendering pipeline, interaction system, animation system. Tạo 5 sub-modules mới và integrate vào existing loader flow.

## Requirements

- **Functional:** Physics engine chạy được với bodies + constraints; Scene graph render bodies; Interaction manager handle drag; Animation system chạy RAF loop; Tất cả layer integrate được qua SIM_MAP tương thích ngược
- **Non-functional:** 60fps rendering; Zero external dependencies; Offline-ready

## Architecture

```
js/physics/
├── vec2.js           Vec2 class: add, sub, scale, dot, cross, normalize, rotate, mag, angle, lerp
├── body.js           RigidBody: x, y, angle, vx, vy, angularVel, mass, inertia, force[], torque
├── constraint.js      Spring (k, restLen), Pin (point, body), Distance (bodyA, bodyB, len), Joint
├── world.js          PhysicsWorld: bodies[], constraints[], gravity, step(dt), solve(iterations)
└── integrator.js     integrateEuler, integrateVerlet, integrateRK4

js/scene/
├── node.js           SceneNode: transform, children[], parent, render(ctx), dirty flag
├── body-node.js      Links RigidBody ↔ SceneNode, auto-sync position/angle to transform
├── joint-node.js     Visualizes constraints: spring coil, pin dot, distance link
├── arrow-node.js     Vector visualization: force, velocity, acceleration, configurable color/label
├── trail-node.js     Motion trail: maxPoints, addPoint(), draw(ctx), color, width
└── scene.js         SceneGraph: nodes[], background, grid, camera, render(), addBody(), addConstraint()

js/render/
├── renderer.js       Main canvas renderer: clear, draw background, draw grid, draw scene
├── primitives.js     Low-level: arrow, arc, rectangle, circle, polygon, dashedLine, grid
├── effects.js       Glow (shadowBlur), gradient fill, glassmorphism rect, particle burst
├── camera.js        Camera: x, y, zoom, pan(), zoom(), screenToWorld(), worldToScreen()
└── offscreen.js     OffscreenCanvas fallback for heavy layers

js/interaction/
├── interaction-manager.js  Unified pointer/touch/keyboard handler, dispatches to handlers
├── handle.js              Draggable handle: x, y, radius, color, label, onDrag, onRelease
├── handle-manager.js      Manages handles[], hitTest(x,y), focusedHandle, Tab navigation
├── gesture.js             Pan (1-finger), pinch-zoom (2-finger), passive: false for touch
├── nudge.js               Arrow key nudge: small step (1px), large step (10px with Shift)
└── guide.js               Snap-to-grid (gridSize), snap-to-angle (angleStep), snap-to-point (points[])

js/animation/
├── timeline.js         Playhead: time, duration, keyframes[], scrubTo(time), record()
├── animator.js         RAF loop: dt calculation, interpolation, call scene.update() + render()
├── interpolator.js     lerp, easeIn, easeOut, easeInOut, spring (damping, stiffness)
├── tween.js            Tween: from, to, duration, easing, onUpdate, start(), stop(), isDone
└── playback-ui.js      Play/pause button, speed selector (0.25x-2x), timeline scrubber bar
```

## Related Code Files

- **Create:** `js/physics/`, `js/scene/`, `js/render/`, `js/interaction/`, `js/animation/`
- **Modify:** `index.html` (thêm script tags mới), `js/simulations.js` (thêm SIM_MAP entries)
- **No delete** trong phase này

## Implementation Steps

1. **Vec2 class** — vector math foundation: add/sub/scale/dot/cross/normalize/rotate/mag/angle/lerp/static helpers. Viết unit tests inline.
2. **Body class** — position, velocity, angle, angularVel, mass, inertia, addForce(), addTorque(), applyImpulse(), integrateEuler(dt). Không có DOM dependency.
3. **Constraint classes** — Spring (k, restLen, connect), Pin (anchor point), Distance (bodyA↔bodyB, targetLen). Interface: `solve(world)` method.
4. **World class** — bodies[], constraints[], gravity. `step(dt)` chạy integrateEuler + constraint solver (3 iterations). `addBody()`, `addConstraint()`.
5. **SceneNode class** — transform (x,y,angle,scale), children[], dirty flag, `render(ctx)`, `updateFromBody(body)`.
6. **BodyNode** — wraps SceneNode + RigidBody link. Khi body thay đổi → set dirty → scene render tự động sync.
7. **JointNode / ArrowNode / TrailNode** — specialized SceneNode subclasses cho constraint/vector/trail visualization.
8. **SceneGraph** — nodes[], camera, background, grid. `render(ctx)` loop through all nodes. `addBodyNode()`, `addArrowNode()`.
9. **Renderer** — Canvas 2D context wrapper. `clear()`, `drawBackground()`, `drawGrid(step)`, `drawScene()`.
10. **Primitives** — arrow (with arrowhead), arc, rect, circle, polygon, dashedLine, grid. Dùng cho cả scene rendering và DOM overlay.
11. **Effects** — glow (shadowBlur), gradient fills, glassmorphism rect, particleBurst(x,y,count,color).
12. **Camera** — x,y,zoom. `screenToWorld(sx,sy)`, `worldToScreen(wx,wy)`, `pan(dx,dy)`, `zoom(factor, cx, cy)`. Optional zoom feature.
13. **InteractionManager** — unified mousedown/mousemove/mouseup + touchstart/touchmove/touchend + keydown/keyup. `onPointerDown/Move/Up`, `onKeyDown`. Delegates to HandleManager.
14. **Handle** — x,y,radius,color,label,onDrag,onRelease. Ghost preview: khi drag, vẽ ghost arrow từ original position đến current position.
15. **HandleManager** — handles[], hitTest(x,y) trả về handle gần nhất trong radius. `setFocused(idx)`. Tab/Shift+Tab navigation.
16. **Guide system** — snapToGrid(gridSize), snapToAngle(angleStep), snapToPoint(targets[], threshold). Gọi trong Handle.onDrag.
17. **Gesture** — pinch-zoom via touch distance delta, pan via 1-finger drag on empty space.
18. **Timeline** — time, duration, keyframes[]. `scrubTo(t)` clamp 0→duration. `record(key, state)` push frame.
19. **Animator** — RAF loop. Tính dt từ last timestamp. Gọi `scene.update(dt)` + `scene.render()`. Hỗ trợ pause/resume/speed.
20. **PlaybackUI** — DOM: play/pause `<button>`, speed `<select>`, timeline bar `<input type="range">`. Sync state với Animator.
21. **Integrate vào index.html** — thêm `<script>` tags cho 5 modules mới theo thứ tự dependency. Load SAU `sim-lab-ui.js`.
22. **Backward compat layer** — `window.SimNewEngine = { SceneGraph, PhysicsWorld, Animator, HandleManager }` export. Loader.js không cần đổi.

## Success Criteria

- [ ] Vec2 class đầy đủ với unit test coverage
- [ ] PhysicsWorld step() chạy ổn định với 10 bodies + 5 constraints
- [ ] SceneGraph render bodies ở 60fps
- [ ] HandleManager hit-test chính xác, Tab navigation hoạt động
- [ ] Ghost preview hiển thị khi drag
- [ ] Animator RAF loop pause/resume/speed hoạt động
- [ ] PlaybackUI controls sync với Animator
- [ ] Zero console errors khi load index.html

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Canvas coordinate mismatch với physics | Dùng pixel-based units, camera transform đồng nhất |
| Performance bottleneck ở scene render | Dirty-flag: chỉ render nodes có dirty=true |
| Touch event conflicts với HandleManager | Gesture detection: 1-finger empty space = pan, 1-finger on handle = drag |

## Context Links

- Brainstorm report: `plans/reports/brainstorm-260508-2106-simulation-redesign.md`
- Reference: `DeCuong_CoHocLyThuyet.html` lines 1-500
- Baseline: `js/sim-professional-lab.js`, `js/sim-lab-ui.js`, `js/sim-interactions.js`
