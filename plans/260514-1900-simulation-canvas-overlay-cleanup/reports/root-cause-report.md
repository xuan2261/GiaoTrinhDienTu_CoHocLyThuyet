---
title: "Root Cause Report - Simulation Canvas Overlay"
type: report
created: 2026-05-14
status: done
---

# Root Cause Report - Simulation Canvas Overlay

## Summary

Vùng `sim-canvas` hiển thị công thức/giá trị vì renderer chủ động gọi `P.domMath(...)` để tạo DOM overlay nằm trên canvas. Đây không phải bug layout của right inspector.

## Evidence

| Evidence | Finding |
|---|---|
| `js/sim-lab-ui.js:211-220` | Tạo `.sim-lab-scene`, append canvas và `.sim-lab-overlay` vào cùng scene |
| `css/style.css:1219-1228` | `.sim-lab-overlay` absolute inset 0; `.sim-overlay-formula` hiển thị trong vùng scene |
| `js/sim-professional-lab.js:1391-1397` | Mỗi draw frame gọi `beginOverlay`, renderer, rồi `endOverlay` |
| `js/sim-route-renderer-primitives.js:89-104` | `domMath` tạo `.sim-overlay-formula`, render KaTeX/fallback text |
| `rg "P\\.domMath\\(" js/sims` | 135 call trong route renderers |
| Playwright probe | 58/58 routes có overlay trong canvas; right inspector không nằm trong scene |

## Data Flow

1. `SimProfessionalLab.mount(routeId)` tạo lab shell.
2. `SimLabUI.createLab(...)` đưa `canvas` và `overlay` vào `.sim-lab-scene`.
3. `draw()` gọi `primitives.beginOverlay(lab.overlay, lab.canvas, routeId)`.
4. Route renderer gọi `P.domMath(ctx, key, x, y, latex, options)`.
5. `domMath` tạo DOM node trong `.sim-lab-overlay`, đặt vị trí theo tọa độ canvas.
6. Khi state/derived values thay đổi, `draw()` chạy lại và text động thay đổi.

## Root Cause

Root cause là architecture/policy: `P.domMath` được dùng như một kênh learner-facing formula/value trên canvas sau plan `Canvas HTML Overlay Migration`. Khi right inspector đã tồn tại, policy này trở thành dư thừa và gây nhiễu vùng mô phỏng.

## Not Root Cause

- Không phải `.sim-readout-grid` bị đặt nhầm: CSS desktop đặt grid ở cột 2.
- Không phải `.sim-formula-panel` tràn vào scene: browser check không thấy panel/card nằm trong `.sim-lab-scene`.
- Không phải KaTeX fallback: kể cả KaTeX render đúng, node vẫn ở canvas overlay.

## Recommendation

Đổi contract: canvas overlay không render công thức/giá trị động learner-facing. Migrate công thức sang `.sim-formula-panel`, giá trị sang `.sim-readout-card`, giữ overlay chỉ cho short labels nếu thật cần.

## Unresolved Questions

- None.
