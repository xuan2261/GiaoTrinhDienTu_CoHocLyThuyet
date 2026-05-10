---
name: Simulation Engine Redesign
description: Thiết kế lại toàn bộ simulation engine: scene graph + constraint-based architecture cho 58 routes
type: plan
status: completed
date: 2026-05-08
effort: 12 tuần
priority: P1
blockedBy: []
blocks: []
---

# Simulation Engine Redesign — Scene Graph + Constraint-Based Architecture

## Tổng quan

Redesign toàn bộ simulation engine của Giáo trình Cơ Học Lý Thuyết từ kiến trúc procedural/imperative sang declarative scene graph với physics-driven animation. Dự án cover 58 P1 routes across 3 chapters theo `simulation-coverage-matrix.md`.

**Phương án được chọn:** Scene Graph + Constraint-based redesign
**Tech stack:** Vanilla JS + Canvas 2D + thư viện nhẹ tự viết (~500 LOC)
**Timeline:** 12 tuần, chất lượng ưu tiên số 1
**Ràng buộc:** Giữ nguyên theme dark navy + gold, backward compatible qua `window.SIM_MAP`

## Design Decisions

| Decision | Chọn | Lý do |
|----------|-------|-------|
| Camera | Fixed view + optional zoom | Đơn giản, đủ cho bài toán 2D |
| Constraint solver | Impulse-based | Ổn định, dễ debug cho 2D mechanics |
| Unit system | Pixel-based | Tương thích với hiện tại, familiar |
| Backward compat | Giữ SIM_MAP/SimRegistry | Loader.js không cần thay đổi |
| Old files | Deprecate sau migration | Migration sạch, không refactor waste |

## Architecture Overview

```
js/physics/       → vec2.js, body.js, constraint.js, world.js, integrator.js
js/scene/         → node.js, body-node.js, joint-node.js, arrow-node.js, trail-node.js, scene.js
js/render/        → renderer.js, primitives.js, effects.js, camera.js
js/interaction/   → interaction-manager.js, handle.js, handle-manager.js, gesture.js, nudge.js, guide.js
js/animation/     → timeline.js, animator.js, interpolator.js, tween.js, playback-ui.js
js/routes/        → route-registry.js, route-builder.js, chapter-statics.js, chapter-kinematics.js, chapter-dynamics.js, equation-display.js
js/sim-lab-ui.js  → (cải thiện) timeline + equation panel + ghost overlay
```

## Phases

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 01 | Foundation Architecture | completed | Tuần 1-2 |
| 02 | 3 Pilot Routes | completed | Tuần 3-4 |
| 03 | Ch1 Statics P1 Routes | completed | Tuần 5-7 |
| 04 | Ch2 Kinematics P1 Routes | completed | Tuần 8-9 |
| 05 | Ch3 Dynamics P1 Routes | completed | Tuần 10-11 |
| 06 | Polish Integration QA | completed | Tuần 12 |

## Success Criteria

- [x] 58/58 routes mount và render đúng
- [x] 58/58 có animation (không còn static diagram)
- [x] Drag handles với ghost preview + snap guides
- [x] Readout accuracy match physics computation
- [x] KaTeX equation display cho tất cả routes
- [x] Responsive canvas (320px+)
- [x] Touch targets ≥ 44px
- [x] 60fps trên device thực
- [x] Chạy offline via `file://`
- [x] Canonical release QA pass; P1 route coverage 58/58; browser baseline pass theo cấu hình hiện tại

Verification snapshot (2026-05-09):
- `npm run test:sim:release` PASS.
- `python tools\smoke_simulation_routes.py --require-p1` PASS: P1 covered 58/58.
- `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup` PASS.
- `npm run test:sim:visual-quality` PASS: 4 passed, 3 skipped.
- `npm run test:sim:browser` PASS inside release: 10 passed, 207 skipped.

## Blocking/Cancelled Plans

- `260507-1855-simulation-visual-ux-upgrade` → CANCELLED (in-place upgrade, không phù hợp Phương án B)
- `260508-simulation-visual-overhaul-v2` → CANCELLED (kiến trúc cũ, không phù hợp Phương án B)
- `260507-1846-rich-animated-full-physics-58-routes` → COMPLETED, dùng làm baseline so sánh
- `260508-simulation-visual-overhaul` → COMPLETED, dùng làm baseline

## Related Files

- Brainstorm report: `plans/reports/brainstorm-260508-2106-simulation-redesign.md`
- Reference: `DeCuong_CoHocLyThuyet.html` (UX pattern reference)

## Key Reference Files (để hiểu baseline)

- `js/sim-professional-lab.js` — current lab engine (sẽ thay thế)
- `js/sim-lab-ui.js` — current lab shell (sẽ cải thiện)
- `js/sim-route-renderer-primitives.js` — current primitives (sẽ refactor)
- `js/sims/ch*/` — 58 route modules (sẽ migrate)
- `js/sim-interactions.js` — current interaction (sẽ thay thế hoàn toàn)
