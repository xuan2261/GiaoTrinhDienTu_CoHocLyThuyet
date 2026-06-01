# System Architecture

## Simulation Engine (js/sim2/)

Engine SVG-first 3 tầng, thay thế toàn bộ engine canvas-based cũ (52 route). Tag git `archive/52-sims-pre-removal` giữ bộ cũ.

### Tầng 1 — Physics

| File | Trách nhiệm |
|---|---|
| `js/sim2/physics/statics.js` | Công thức tĩnh học |
| `js/sim2/physics/kinematics.js` | Công thức động học |
| `js/sim2/physics/dynamics.js` | Công thức động lực học |
| `js/sim2/physics/index.js` | Re-export; UMD (Node + browser) |

Nguồn tính toán duy nhất; công thức port từ bộ cũ, đã verify. Chạy được cả Node lẫn browser (UMD).

### Tầng 2 — Core

| File | Trách nhiệm |
|---|---|
| `js/sim2/core/transform.js` | World→screen: scale giữ tỉ lệ, flip-y, tự căn giữa; round-trip < 1e-9 |
| `js/sim2/core/svg-render.js` | SVG primitives (line/arrow/circle/poly/path) nhận transform |
| `js/sim2/core/overlay.js` | Nhãn + readout card HTML định vị tuyệt đối qua transform; không vẽ chữ trong canvas |
| `js/sim2/core/canvas-underlay.js` | Canvas tùy chọn cùng transform; vẽ trail/field (ch2-1-1, ch2-4-4, ch2-5-3, ch3-6-2) |
| `js/sim2/core/sim-shell.js` | Factory chung: dựng SVG+overlay(+canvas), drag handle→toWorld, RAF loop, dispose() |

`overlay.js` dùng HTML định vị tuyệt đối → nhãn không chồng, test bounding-box bắt được.
`sim-shell.js` dispose() gỡ sạch listener+RAF+DOM, chống rò khi đổi route.

### Tầng 3 — Simulations

| Thư mục | Nội dung |
|---|---|
| `js/sim2/sims/ch1/` | 10 sim tĩnh học |
| `js/sim2/sims/ch2/` | 7 sim động học |
| `js/sim2/sims/ch3/` | 8 sim động lực học |

### Registry & Manifest

| File | Trách nhiệm |
|---|---|
| `js/sim2/registry.js` | `register(routeId, factory)` → `window.SIM_MAP[id]` |
| `js/sim2/sim2-route-manifest.js` | Metadata 25 route (id+tên+chương); nguồn duy nhất cho test count — không hardcode 25 |

### 25 Route IDs

| Chương | Route IDs |
|---|---|
| Ch1 (tĩnh học, 10) | ch1-1-3, ch1-1-4, ch1-1-5, ch1-1-6, ch1-2-3, ch1-1-8, ch1-3-2, ch1-3-6, ch1-5-3, ch1-6-3 |
| Ch2 (động học, 7) | ch2-1-1, ch2-1-3, ch2-2-2, ch2-3-2, ch2-4-4, ch2-5-2, ch2-5-3 |
| Ch3 (động lực học, 8) | ch3-2-2, ch3-2-3, ch3-1-3, ch3-3-1, ch3-5-2, ch3-5-3, ch3-5-4, ch3-6-2 |

## Load Flow

1. `index.html` loads `js/sim2/` modules.
2. `js/sim2/registry.js` builds `window.SIM_MAP` từ 25 route factories.
3. `js/loader.js` → `initSimulations(container, pageId)` tra SIM_MAP, mount factory, lưu dispose.
4. Khi đổi route, `loader.js` gọi dispose() trước khi replace content.

## Mount Contract

`SIM_MAP[pageId]` → `factory(container)` → `{ dispose }`.

dispose() hủy sạch RAF + listener + DOM — không rò khi đổi route.

## QA Gates

```
npm run test:sim:physics   # 9 node tests: physics-port, transform, ch1/ch2/ch3 physics,
                           #   visual-physics regression, route-coverage,
                           #   no-legacy-physics, removal-guard
npm run test:sim:mount     # Playwright: ch1/ch2/ch3 mount + integration + content-only-smoke;
                           #   mount OK, nhãn không chồng, canvas↔SVG ≤1px, dispose hủy RAF
npm run test:sim:release   # physics + mount + content + quiz; chạy offline
```

## Persistence Layer

| Key | Module | Nội dung |
|---|---|---|
| `theme` | `js/app.js` | Sáng/tối |
| `fontZoom` | `js/app.js` | Mức zoom chữ |
| `readPages` | `js/app.js` | Trang đã đọc |
| `quizScores` | `js/quiz.js` | Score quiz |
| `chlyt_progress` | `js/progress.js` | Visit/read state |
| `chlyt_bookmarks` | `js/progress.js` | Bookmark |
| `chlyt_notes` | `js/notes.js` | Highlight và note |
| `chlyt_activity_progress_v1` | `js/sim-activities.js` | Micro-checker progress |
