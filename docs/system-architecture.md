# System Architecture

## Runtime layers

```text
index.html
  -> app.js + pages.js + loader.js
  -> chapter fragment from offline bundle or fetch
  -> KaTeX/MathML + quiz/progress/glossary/notes hooks
  -> SIM_MAP route factory -> { dispose }
  -> PDF trigger -> native dialog -> lazy IIFE runtime + wrapped Uint8Array
     -> PDF.js fake-worker -> canvas + selectable text layer
```

Ứng dụng hoàn toàn client-side. `js/pages.js` bảo đảm đọc qua `file://`; fetch là đường bổ sung khi chạy HTTP.

## PDF viewer

`js/pdf-viewer.js` sở hữu dialog, lazy assets, history/focus và download; `js/pdf-viewer-renderer.js` sở hữu render task, text layer, zoom/fit và cancellation. `tools/pdf-viewer/build-assets.mjs` bundle `pdfjs-dist@6.2.108` thành classic IIFE, preload `WorkerMessageHandler`, tắt scripting/WASM và sinh `lib/pdfjs/pdf-data.js` từ `CoHocLyThuyet.pdf`.

Qua `file://`, PDF được truyền bằng một `Uint8Array` mới cho mỗi session; qua HTTP dùng cùng transport để bảo đảm parity. Viewer nằm ngoài `#content-area`, không gọi `loadPage()`, không đổi hash và không dispose/remount simulation. Nó không thêm persistence key.

## Content layer

`CoHocLyThuyet_Full_New.docx` là nguồn chuẩn. Pipeline tạo `chapters/`, `images/`, `tools/docx_site_manifest.json`, sau đó đồng bộ nav và bundle. Extractor chuẩn hóa filename ảnh và bỏ placeholder `(.)`; content test ngăn placeholder hoặc route cleanup quay lại. Chương 3 Section VII-4, VII-5 và VII-6 không còn trong runtime hiện tại.

## Sim2 canonical engine

| Tầng | Thành phần | Trách nhiệm |
|---|---|---|
| Physics | `js/sim2/physics/` | Công thức statics, kinematics, dynamics dạng UMD |
| Core | `js/sim2/core/` | Transform, SVG, HTML overlay, panel, controls, optional canvas, lifecycle |
| Routes | `js/sim2/sims/ch*/` | 10 route Ch1, 7 route Ch2, 8 route Ch3 |
| Registry | `js/sim2/registry.js` | Tạo `window.SIM_MAP` |
| Manifest | `js/sim2/sim2-route-manifest.js` | Metadata và count canonical 25 route |

### Route IDs

| Chương | Routes |
|---|---|
| Ch1 (10) | `ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-2-3`, `ch1-1-8`, `ch1-3-2`, `ch1-3-6`, `ch1-5-3`, `ch1-6-3` |
| Ch2 (7) | `ch2-1-1`, `ch2-1-3`, `ch2-2-2`, `ch2-3-2`, `ch2-4-4`, `ch2-5-2`, `ch2-5-3` |
| Ch3 (8) | `ch3-2-2`, `ch3-2-3`, `ch3-1-3`, `ch3-3-1`, `ch3-5-2`, `ch3-5-3`, `ch3-5-4`, `ch3-6-2` |

Mount contract: `SIM_MAP[pageId] -> factory(container) -> { dispose }`. Loader gọi `dispose()` trước khi đổi route. Bộ `.sim-lab` canvas 52 route đã gỡ khỏi master; tag `archive/52-sims-pre-removal` chỉ giữ lịch sử.

## Sim3 optional pilot

Three.js vendored offline tại `lib/three/three.umd.min.js`. `js/sim3/core/` cung cấp shell/toggle/disposal; `js/sim3/sims/` có 10 adapter cho `ch1-1-5`, `ch1-5-3`, `ch2-1-3`, `ch2-2-2`, `ch2-3-2`, `ch2-4-4`, `ch2-5-3`, `ch3-1-3`, `ch3-5-3`, `ch3-6-2`. Sim2 vẫn mặc định; WebGL fail thì fallback về 2D.

## Persistence

| Key | Module |
|---|---|
| `theme`, `fontZoom` | `js/app.js` |
| `quizScores` | `js/quiz.js` |
| `chlyt_progress`, `chlyt_bookmarks` | `js/progress.js` |
| `chlyt_notes` | `js/notes.js` |

## QA gates

```powershell
npm run test:content
npm run test:sim:physics
npm run test:sim:mount
npm run test:sim:release
npm run test:sim3:pilot
npm run test:pdf:release
```

Visual capture, probes và selective baselines là dev-only, tách khỏi release gate.
