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

Motion/feedback v1 nằm ở core chung: `controls.js` flash output, `panel.js` flash readout + highlight formula theo key, `sim-shell.js` handle pulse/active, `canvas-underlay.js` trail fade opt-in. Các route chỉ gắn semantic classes/cues; `js/sim2/physics/*` vẫn là nguồn công thức duy nhất.

### Pilot 3D Engine (js/sim3/)

| File/Thư mục | Trách nhiệm |
|---|---|
| `lib/three/three.umd.min.js` | Three.js vendored offline cho pilot, không phụ thuộc CDN/bundler runtime |
| `js/sim3/core/` | WebGL shell, mode toggle, disposal helper, primitive helpers |
| `js/sim3/sims/ch1-1-5-3d.js` | 3D adapter cho route `ch1-1-5` |
| `js/sim3/sims/ch1-5-3-3d.js` | 3D adapter cho route `ch1-5-3` |
| `js/sim3/sims/ch2-1-3-3d.js` | 3D adapter cho route `ch2-1-3` |
| `js/sim3/sims/ch2-2-2-3d.js` | 3D adapter cho route `ch2-2-2` |
| `js/sim3/sims/ch2-3-2-3d.js` | 3D adapter cho route `ch2-3-2` |
| `js/sim3/sims/ch2-4-4-3d.js` | 3D adapter cho route `ch2-4-4` |
| `js/sim3/sims/ch2-5-3-3d.js` | 3D adapter cho route `ch2-5-3` |
| `js/sim3/sims/ch3-1-3-3d.js` | 3D adapter cho route `ch3-1-3` |
| `js/sim3/sims/ch3-5-3-3d.js` | 3D adapter cho route `ch3-5-3` |
| `js/sim3/sims/ch3-6-2-3d.js` | 3D adapter cho route `ch3-6-2` |

Pilot Sim3 chỉ bọc thêm nhánh 3D cho 10 route Sim2 đã chọn. Contract mount vẫn giữ nguyên `SIM_MAP[pageId] -> factory(container) -> { dispose }`, Sim2 SVG-first vẫn là default path, và khi WebGL không khả dụng thì route rơi về 2D với thông báo tiếng Việt. Đây là pilot nội bộ, chưa thay đổi phạm vi 25 route Sim2.

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
npm run test:sim:visual:baseline  # dev-only selective screenshot baseline; không nằm trong release
```

Selective visual baseline hiện khóa 5 route đại diện bằng Playwright snapshot convention dưới `tools/sim2-visual/selective-baseline.spec.js-snapshots/`: `ch1-6-3`, `ch2-3-2`, `ch2-4-4`, `ch3-3-1`, `ch3-6-2`. Baseline này dùng để bắt hồi quy visual sau polish đã duyệt, không thay thế contact-sheet 25 route và không chạy trong `test:sim:release`.

Sim3 pilot QA là tách riêng theo route. Sáu route `ch2-2-2`, `ch2-3-2`, `ch2-4-4`, `ch2-5-3`, `ch3-5-3`, `ch3-6-2` có visual artifacts nội bộ và regression coverage cho fallback/dispose/state sync; không có gate rollout toàn bộ 25 route.

## Persistence Layer

| Key | Module | Nội dung |
|---|---|---|
| `theme` | `js/app.js` | Sáng/tối |
| `fontZoom` | `js/app.js` | Mức zoom chữ |
| `quizScores` | `js/quiz.js` | Score quiz |
| `chlyt_progress` | `js/progress.js` | Nguồn duy nhất tiến trình đọc (topbar + home) |
| `chlyt_bookmarks` | `js/progress.js` | Bookmark |
| `chlyt_notes` | `js/notes.js` | Highlight và note |
| `chlyt_activity_progress_v1` | `js/sim-activities.js` | Micro-checker progress |
