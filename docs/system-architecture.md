# System Architecture

## Runtime layers

```text
index.html
  -> content-width.js (head bootstrap) + pages.js + search-index.js + search.js + app.js + loader.js
  -> contentWidth dataset applies before stylesheet; standard/wide is a local preference only
  -> search index validates PAGES runtime digests and glossary digest; stale/corrupt data falls back to navigation-only search
  -> chapter fragment from offline bundle or fetch
  -> KaTeX/MathML + quiz/progress/glossary/notes hooks
  -> PDF trigger -> native dialog -> lazy IIFE runtime + wrapped Uint8Array
     -> PDF.js fake-worker -> canvas + selectable text layer
```

Ứng dụng hoàn toàn client-side. `js/pages.js` bảo đảm đọc qua `file://`; fetch là đường bổ sung khi chạy HTTP.

Shell accessibility nằm trong `index.html`, `css/style.css` và `js/app.js`: một application `main`, skip link không đổi route hash, landmark có nhãn, disclosure state đồng bộ, mobile Escape và focus-visible token dùng chung. PDF dialog dùng `role="document"` cho viewport nên không tạo `main` thứ hai.

## PDF viewer

`js/pdf-viewer.js` sở hữu dialog, lazy assets, history/focus và download; `js/pdf-viewer-renderer.js` sở hữu render task, text layer, zoom/fit và cancellation. `tools/pdf-viewer/build-assets.mjs` bundle `pdfjs-dist@6.2.108` thành classic IIFE, preload `WorkerMessageHandler`, tắt scripting/WASM và sinh `lib/pdfjs/pdf-data.js` từ `CoHocLyThuyet.pdf`.

Qua `file://`, PDF được truyền bằng một `Uint8Array` mới cho mỗi session; qua HTTP dùng cùng transport để bảo đảm parity. Viewer nằm ngoài `#content-area`, không gọi `loadPage()`, không đổi hash và không dispose/remount simulation. Nó không thêm persistence key.

## Content layer

`CoHocLyThuyet_Full_New.docx` là nguồn narrative chuẩn. `data/chapter-reference.json` là curated supplemental input: `tools/chapter_reference.py` validate schema/same-chapter first-use routes và extractor render table semantic ngay sau `.ov-sec`; raw HTML không được chấp nhận. Content manifest schema v1 giữ additive `source.chapterReference` logical path/SHA-256, nên stale curated input bị validator/search freshness gate chặn.

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

### Clock, viewport và lifecycle

`js/sim2/core/animation-clock.js` tích lũy timestamp RAF vào fixed step `1/60 s`, cap frame `0.25 s` và tối đa 15 substep. Playback và `stepOnce()` gọi cùng update callback; `stop()`/resume reset timestamp để không nhảy trạng thái sau thời gian treo. `createSimShell()` giữ một logical viewport và transform ổn định, CSS scale SVG theo host, resize HTML overlay/canvas theo kích thước hiển thị, cap canvas bằng DPR, và remap pointer từ client coordinates về logical coordinates. `ResizeObserver` hoặc window resize fallback, listener, timer, RAF và DOM đều đăng ký vào cleanup của `dispose()`.

`Sim2Controls` nối label/range/output và đặt accessible names cho playback; `Sim2Shell.addHandle()` giữ pointer drag đồng thời thêm Arrow/Home/End, clamp domain và focus-visible semantics. Route bắt đầu paused, tôn trọng `prefers-reduced-motion`, và không dùng màu làm tín hiệu duy nhất.

## Sim3 optional pilot

Three.js vendored offline tại `lib/three/three.umd.min.js`. `js/sim3/core/coordinate-system.js` khóa hệ tay phải `+X` sang phải, `+Y` lên trên, `+Z` hướng về người xem; ánh xạ ngang `(x,y) -> (x,elevation,-y)` quay quanh `+Y`, ánh xạ đứng `(x,y) -> (x,y,depth)` quay quanh `+Z`. `js/sim3/core/three-shell.js` render theo nhu cầu trừ adapter opt-in `continuous`, cap DPR, resize camera/renderer theo host, và giải phóng geometry/material/texture/render target/WebGL context cùng observer/listener/RAF khi dispose.

`js/sim3/sims/` có 10 adapter cho `ch1-1-5`, `ch1-5-3`, `ch2-1-3`, `ch2-2-2`, `ch2-3-2`, `ch2-4-4`, `ch2-5-3`, `ch3-1-3`, `ch3-5-3`, `ch3-6-2`. Sim2 vẫn mặc định. Thiếu Three.js/WebGL hoặc lỗi renderer/setup/update/render/resize đều đóng tài nguyên, thông báo trạng thái tiếng Việt một lần và giữ Sim2 2D dùng được.

## Chapter 1 media pilot

`data/media-pilot-manifest.json` là index hash/size cho năm contract curated: `multimedia-gap-analysis.json`, `multimedia-content-contracts.json`, `multimedia-learning-map.json`, `media-manifest.json` và `multimedia-accessibility.json`. Các contract giữ đúng bốn mục tiêu cục bộ dưới `lo-ch1-statics`, route/Sim2 joins, fallback, a11y và budget. Bốn `media/pilot/<asset-id>/authoring-packet.json` giữ script, storyboard, misconception/evidence target, math/units/assumptions và technical-review roles.

`prototypes/media/shared/media-pilot-runtime.js` là bundle nhỏ dùng cho `file://`; `media-loader.js` giữ progressive enhancement: static fallback hiện trước, chỉ ẩn sau khi mount/load thành công. GIF trượt lực rơi về poster PNG thật khi reduced motion hoặc load lỗi. Biểu đồ và centroid dùng helper `js/sim2/physics/statics.js`; nón ma sát mount factory canonical `SIM_MAP['ch1-5-3']`, không sao chép công thức.

## Persistence

| Key | Module |
|---|---|
| `theme`, `fontZoom` | `js/app.js` |
| `chlyt_quiz_attempts` | `js/quiz-state.js`, `js/quiz.js` (schema v2; lazy-migrate aggregate `quizScores`) |
| `chlyt_progress`, `chlyt_bookmarks` | `js/progress.js` |
| `chlyt_notes` | `js/notes.js` |
| `contentWidth` | `js/content-width.js`; synchronous head bootstrap, `standard|wide` |
| selected mode/scope | trong `chlyt_quiz_attempts`; `js/quiz-state.js`, `js/quiz.js` |

## Release, interoperability and acceptance evidence

`data/release-policy.json` is the allowlist/exclusion/version/epoch contract. `tools/release/release.py` copies only ship-list inputs into clean staging, emits manifest/notices/checksums, validates, then writes a deterministic ZIP and `release-summary.json`. `tools/release/validate_release.py` rejects missing, extra, path-unsafe, stale-hash, oversized or tampered payloads.

`tools/lms/` derives QTI 3 choice-item pilots and IMS Common Cartridge 1.4 webcontent packages from canonical quiz/LO data or the verified standalone ZIP. `data/lms-targets.json` keeps target imports, xAPI/cmi5 and SCORM blocked until a real LMS/profile/privacy contract exists; local adapter validation is never generalized to LMS conformance.

`data/qa-gates.json` owns the executable gate matrix. `tools/run_qa_gates.py` captures stdout/stderr, exit status, command, input hashes, artifact hash and evidence-handling classification under the Phase 12 plan. `tools/build_acceptance_bundle.py` joins this registry to the RTM, release/derivative inventory, manual blockers and checksum manifest. Current candidate: 374 files, ZIP SHA-256 `6b48834ff3cfaddf29af6c0c83593e74ca4541c085da0bb8b1c36f128212cdbd`. External academic signoff, independent accessibility review, independent candidate smoke review and Word round-trip remain required before final institutional release.

## QA gates

```powershell
npm run test:content
npm run test:sim:physics
npm run test:sim:mount
npm run test:sim:release
npm run test:sim:release:full
npm run test:sim:release:soak
npm run test:sim3:pilot
node tools/sim-validation/validate-simulation-drift.js --require-verified
npm run test:pdf:release
npm run test:search
npm run test:quiz
npm run test:quiz:browser
npm run test:accessibility
npm run test:accessibility-review
npm run test:academic-acceptance
npm run test:media-pilot
npm run test:release
npm run test:lms
npm run test:acceptance
npm run test:acceptance-bundle
```

Visual capture, probes và selective baselines là dev-only, tách khỏi release gate.

`data/accessibility-baseline.json` maps criterion/surface/spec/manual status. Gate tự động chỉ là repository evidence; screen reader, browser zoom, text spacing, scientific visualization equivalence và independent disposition không được suy ra từ Playwright pass.
