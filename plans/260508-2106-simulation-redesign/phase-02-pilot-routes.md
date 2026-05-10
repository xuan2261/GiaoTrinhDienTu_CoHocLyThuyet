---
phase: 02
title: "3 Pilot Routes"
status: completed
priority: P1
effort: 2 tuần
dependencies: [01]
---

# Phase 02: 3 Pilot Routes

## Overview

Implement 3 routes đại diện: 1 statics (Ch1), 1 kinematics (Ch2), 1 dynamics (Ch3) theo kiến trúc mới. Validate architecture, interaction, animation, readout, equation display. Adjust architecture nếu cần.

## Requirements

- **Functional:** 3 routes chạy đầy đủ: drag interaction, physics computation, animation, readout cards, KaTeX equation. Không static diagram.
- **Non-functional:** Performance ≥ 60fps; Ghost preview khi drag; Snap guides hoạt động; Touch targets ≥ 44px

## Architecture

Routes được implement declarative qua `route-registry.js`:

```js
SimNewRoute.register('ch1-parallelogram', {
  chapter: 1,
  type: 'statics',
  canvas: { width: 760, height: 440 },
  scene: {
    bodies: [{ id: 'particle', type: 'particle', x: 280, y: 200 }],
    forces: [
      { body: 'particle', fx: 150, fy: -80, label: 'F₁', color: '#e74c3c' },
      { body: 'particle', fx: 60, fy: 120, label: 'F₂', color: '#2980b9' }
    ]
  },
  interaction: {
    handles: [
      { forceId: 'force1', property: 'fx', min: 0, max: 300, label: 'F₁' },
      { forceId: 'force1', property: 'fy', min: -200, max: 200, label: 'θ₁' },
      { forceId: 'force2', property: 'fx', min: 0, max: 300, label: 'F₂' },
      { forceId: 'force2', property: 'fy', min: -200, max: 200, label: 'θ₂' }
    ]
  },
  readouts: [
    { label: 'R', compute: s => Vec2.mag(s.resultant), unit: 'N', color: '#27ae60' },
    { label: 'α', compute: s => Vec2.angleDeg(s.resultant), unit: '°', color: '#c9963a' }
  ],
  equations: [
    { text: '\\vec{R} = \\vec{F}_1 + \\vec{F}_2' }
  ]
});
```

## Pilot Routes

| Route ID | Chapter | Type | Simulation |
|----------|---------|------|------------|
| `ch1-parallelogram` | Ch1 | Statics | Parallelogram Law: kéo F1/F2 → hình bình hành + hợp lực R |
| `ch2-particle-motion` | Ch2 | Kinematics | Quỹ đạo chuyển động: play → hạt chạy trên elip/tron/so-8, vận tốc + gia tốc vectors |
| `ch3-collision-solver` | Ch3 | Dynamics | Va chạm 2D: kéo vị trí 2 quả bóng → computed vận tốc sau va chạm + energy loss |

## Related Code Files

- **Create:** `js/routes/route-registry.js`, `js/routes/route-builder.js`, `js/routes/chapter-pilot.js`
- **Modify:** `js/simulations.js` (add pilot entries to SIM_MAP), `index.html`
- **Read:** `js/sims/ch1/ch1-force-law-renderers.js`, `js/sims/ch2/ch2-particle-renderers.js`, `js/sims/ch3/ch3-dynamics-collision-renderers.js` (baseline)

## Implementation Steps

1. **RouteRegistry class** — `register(id, config)`, `get(id)`, `list()`, `byChapter(n)`. Singleton registry map.
2. **RouteBuilder** — builder pattern: `scene.addBody()`, `scene.addForce()`, `scene.addHandle()`, `scene.addReadout()`. Tạo SceneGraph từ declarative config.
3. **Pilot Ch1 — Parallelogram Law**
   - Scene: 1 particle body, 2 force arrows
   - Physics: `resultant = Vec2.add(F1, F2)` — no motion, just computation
   - Render: parallelogram fill (semi-transparent), R arrow (dashed), angle arcs
   - Interaction: 4 handles (F1.x, F1.y, F2.x, F2.y) — each draggable
   - Ghost preview: show dashed ghost arrow from original endpoint to current drag position
   - Readout: R magnitude + angle, update real-time
   - Equation: `R = F₁ + F₂` KaTeX overlay
   - Animation: none (statics — instant update)
4. **Pilot Ch2 — Particle Motion**
   - Scene: 1 particle body
   - Physics: parametric position `getPos(t)` = circle/elip/figure8; velocity = derivative; acceleration = 2nd derivative
   - Path selector: circle / ellipse / figure-8
   - Render: trajectory trail (30 points, fading opacity), velocity arrow, acceleration (tangential + normal decompose)
   - Animation: play → particle moves along path, `t` increments. RAF loop drives `scene.update(dt)`
   - Readout: v (magnitude), a (magnitude), radius of curvature ρ
   - Timeline scrubber: `state.t` mapped to `<input type="range">` — scrub để seek position
   - Playback controls: ▶/⏸, speed 0.25x/0.5x/1x/2x
5. **Pilot Ch3 — Collision Solver**
   - Scene: 2 ball bodies, 1D collision axis
   - Physics: impulse-based collision: `v1' = v1 - (1+e)*m2/(m1+m2) * (v1-v2)`
   - Interaction: drag 2 ball positions + set initial velocities via handles
   - Render: 2 filled circles, velocity arrows before/after, collision point indicator
   - Animation: play → balls move, collision response at contact point, post-collision trajectories
   - Energy display: KE_before, KE_after, ΔKE percentage
   - Readout: v1', v2', restitution e, KE loss %
6. **Integrate all pilots into SIM_MAP** — `window.SIM_MAP['ch1-parallelogram']` = pilot renderer function. Loader.js mount works.
7. **Ghost preview implementation** — khi Handle.onDrag: render ghost dashed line/arrow từ original position đến current drag position, semi-transparent.
8. **Snap guides** — snapToAngle(15°) cho parallelogram angles; snapToGrid(10px) cho ball positions.
9. **Touch targets** — set Handle.radius = 22px (44px hit area), visual dot = 12px.
10. **Validate với browser** — mở từng route, test drag interaction, animation playback, readout accuracy.

## Success Criteria

- [ ] ch1-parallelogram: drag F1/F2 → parallelogram fill + R arrow update < 16ms
- [ ] ch2-particle-motion: play → smooth 60fps animation, scrubber seek chính xác
- [ ] ch3-collision-solver: collision response đúng vật lý (conservation of momentum)
- [ ] Ghost preview hiển thị dashed line khi drag
- [ ] Snap guides hoạt động (angle 15° snap)
- [ ] Readout values match physics computation (verify by hand calculation)
- [ ] KaTeX equations render đúng
- [ ] Touch interaction hoạt động trên mobile viewport

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Route config declarative format chưa optimal | Điều chỉnh format sau khi implement 3 pilots |
| KaTeX overlay positioning drift | Test trên nhiều viewport, dùng canvas bounding rect |
| Performance chưa đạt 60fps | Profile với Chrome DevTools, optimize dirty-flag render |

## Context Links

- Phase 01: `phase-01-foundation-architecture.md`
- Reference: `DeCuong_CoHocLyThuyet.html` lines 500-1200
- Baseline route renderers: `js/sims/ch1/force-law-renderers.js`, `js/sims/ch2/particle-renderers.js`, collision renderer from ch3
