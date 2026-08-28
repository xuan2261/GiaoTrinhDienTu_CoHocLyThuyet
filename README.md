# Giáo trình điện tử Cơ Học Lý Thuyết

Giáo trình điện tử tĩnh chạy bằng `HTML/CSS/JS`, dùng được qua `file://`, USB offline hoặc static server. Nguồn chuẩn nội dung là `CoHocLyThuyet_Full_New.docx`.

## Chạy nhanh

| Mục | Cách làm |
|---|---|
| Mở offline | Mở `index.html` bằng browser |
| Dev server | `python -m http.server 8000`, rồi mở `http://localhost:8000/` |
| Đọc bản PDF | Nhấn **Xem bản PDF** trên topbar; hỗ trợ `file://`, HTTP và USB offline |
| Cài QA browser | `npm install` và `npx playwright install chromium` |
| Cài QA/authoring GIF | `python -m pip install -r gif-conversion-workspace/requirements.txt` |

## Cấu trúc

| Đường dẫn | Vai trò |
|---|---|
| `index.html`, `css/` | Shell và giao diện |
| `js/app.js` | Theme, search, breadcrumb, sidebar, zoom, progress bar |
| `js/loader.js` | Route map, load fragment, render math, mount/dispose simulation |
| `js/pages.js` | Bundle offline sinh tự động, không sửa tay |
| `js/gif-figures.js` | Manifest 20 ảnh động, điều khiển motion và PNG fallback |
| `js/quiz-state.js`, `js/quiz.js`, `js/{progress,glossary,notes}.js` | Quiz v2/persistence và các tính năng học tập/state cục bộ |
| `js/sim2/` | Runtime mô phỏng canonical SVG-first, 25 route |
| `js/sim3/` | Pilot Three.js tùy chọn cho 10 route; demand-rendered, responsive/DPR-capped, fallback về Sim2 mặc định |
| `js/pdf-viewer*.js`, `lib/pdfjs/` | Trình đọc PDF.js nội tuyến và artifact runtime/data local |
| `chapters/`, `images/` | Nội dung và ảnh sinh từ DOCX |
| `assets/gifs/` | 20 GIF phát hành, tách khỏi ảnh PNG canonical trong `images/` |
| `data/multimedia-*.json`, `data/media-manifest.json`, `data/media-pilot-manifest.json`, `media/pilot/` | Rubric gap, mapping, accessibility, bốn gói authoring/review và index hash/budget của pilot Chương 1 |
| `prototypes/media/` | Bốn prototype độc lập chạy qua `file://` với loader/fallback dùng chung |
| `data/` | Quiz, search, traceability, review/evidence, release policy và LMS targets |
| `tools/release/`, `tools/lms/` | Deterministic standalone release và staged interoperability adapters |
| `tools/run_qa_gates.py`, `tools/build_acceptance_bundle.py` | Canonical QA capture và Phase 12 evidence/report bundle |
| `tests/` | QA dev-only |

PDF viewer chỉ nạp `lib/pdfjs/pdfjs-runtime.iife.min.js` và `pdf-data.js` sau lần nhấn đầu tiên. Bản PDF mở trong dialog toàn màn hình với chuyển/nhập trang, zoom, vừa chiều rộng, tải xuống, Escape và Browser Back; không đổi route hoặc trạng thái bài học. Không có tìm kiếm, thumbnail, annotation hay bookmark riêng cho PDF.

Hai mươi hình cơ học đã chọn có bản GIF trong `assets/gifs/`. Runtime chỉ thay đúng ảnh có trong manifest `js/gif-figures.js`; nút **Ảnh động** đổi đồng thời giữa GIF và PNG, lưu lựa chọn cục bộ và mặc định dùng PNG khi hệ điều hành bật `prefers-reduced-motion: reduce`. Nếu GIF lỗi, ảnh tự trở về PNG.

Pilot đa phương tiện Chương 1 giữ đúng bốn mục tiêu cục bộ dưới `lo-ch1-statics`: trượt lực bằng GIF hiện có và poster thật, biểu đồ hợp lực theo góc, Sim2 nón ma sát canonical và lập luận trọng tâm từng bước. Tất cả ở trạng thái `pilot-draft`/`technical-review`; validator khóa route/LO, modality, fallback, a11y, hash, budget và dependency local. Đây không phải bằng chứng hiệu quả học tập hoặc quyết định chấp nhận của cơ sở.

## Đồng bộ DOCX

```powershell
python tools\analyze_docx.py --input CoHocLyThuyet_Full_New.docx --routes
python tools\gen_quiz_pages.py
python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
python tools\update_nav.py
python tools\bundle_pages.py
python tools\build_content_manifest.py
python tools\validate_content_manifest.py
python tools\build_search_index.py
python tools\audit.py
```

Extractor chuẩn hóa tên asset ảnh khi xuất, bỏ placeholder số công thức `(.)` và render bảng tra cứu từ `data/chapter-reference.json`; JSON này là input curated bổ trợ, còn DOCX vẫn là nguồn narrative chuẩn. Sau khi đổi nội dung, `npm run test:content` bảo vệ cleanup route Section VII, placeholder và dữ liệu reference. Chi tiết semantic math và image publish gate xem [DOCX Sync Pipeline](docs/docx-sync-pipeline.md).

## QA

Các lệnh chỉ phục vụ phát triển, runtime phát hành không phụ thuộc npm.

```powershell
npm run test:content-manifest
npm run validate:traceability
npm run validate:academic-review
npm run test:academic-review
npm run test:academic-acceptance
npm run test:traceability
npm run validate:simulation-drift
node tools/sim-validation/validate-simulation-drift.js --require-verified
npm run test:simulation-evidence
npm run test:simulation-docs
npm run validate:media-pilot
npm run test:media-pilot
npm run test:accessibility
npm run test:accessibility-review
npm run test:content
npm run test:quiz
npm run test:quiz:browser
npm run test:reader-enhancements
npm run test:equations
npm run test:audit:strict
npm run test:gif
npm run test:sim:physics
npm run test:sim:mount
npm run test:sim:release
npm run test:sim:release:full
npm run test:sim:release:soak
npm run test:sim3:pilot
npm run test:sim3:core
npm run test:pdf:release
npm run test:search
npm run test:release
npm run test:lms
npm run test:acceptance
npm run test:acceptance-bundle
```

`test:sim:release` là gate objective deterministic cho 25 Sim2 + 10 Sim3: physics/oracle độc lập, mount, production navigation, lifecycle, responsive/DPR, fallback, visual-unit và probe-unit. `test:sim:release:full` tạo và kiểm capture/contact sheet/probe run-specific rồi chạy selective visual baseline; snapshot chỉ cập nhật thủ công bằng `test:sim:visual:baseline:update` sau khi review actual/expected/diff. `test:sim:release:soak` yêu cầu ba lần objective gate liên tiếp không retry.

Khi `CoHocLyThuyet.pdf` hoặc phiên bản PDF.js thay đổi, chạy `npm run build:pdf-assets`; không sửa tay file trong `lib/pdfjs/`. `test:pdf:release` kiểm provenance/vendor, transport `file://` + HTTP, viewer và các regression app/content.

`validate:traceability` verifies the curated requirement → provisional learning outcome → content/quiz/Sim2/evidence joins. A provisional baseline is technically usable but is not a formal academic or legal acceptance claim; only role-reviewed confirmed records may make that claim.

`test:academic-review` validates ledger/signoff shape and current hashes without claiming certification. `test:academic-acceptance` is the release gate: it remains blocked until every current subject has an independent acceptance signoff. See [Academic Certification Review](docs/academic-certification.md).

`test:accessibility` runs the four automated `file://` contracts for landmarks, keyboard flows, reflow, and deterministic contrast tokens. `test:accessibility-review` is separate and remains blocked until `data/accessibility-baseline.json` contains independent reviewer, environment, evidence references, and completed manual criterion decisions; automated success is not WCAG certification.

`validate:media-pilot` kiểm index của năm data contract, rubric chọn/no-go, bốn packet authoring, route/LO/Sim2 joins, hash/size budget và closure dependency local. `test:media-pilot` thêm năm mutation contract cùng Playwright cho `file://`, keyboard, reduced motion, lỗi GIF và fallback tĩnh.

`test:lms` validates deterministic QTI 3 assessment and Common Cartridge 1.4 packages. `data/lms-targets.json` intentionally records no executed LMS targets; xAPI/cmi5 and SCORM remain blocked out of scope. Adapter success never implies successful import into Moodle, Canvas, Blackboard, or another LMS.

`python tools/run_qa_gates.py --all` runs the canonical matrix in `data/qa-gates.json` and writes redacted/classified captures bound to the complete gate definition, repository-state digest and declared-input hashes under the Phase 12 plan `evidence/command-captures/`. `test:release-candidate` validates the frozen staging, ZIP, manifest and derivatives; `test:release-smoke-review` is the separate independent handoff gate. `test:acceptance` validates current evidence before building `data/acceptance-report.json`; `test:acceptance-bundle` verifies RTM/report/checksum generation. Approval is impossible while any gate is failed, blocked, or not run. The standalone Word gate updates only a copy of `CoHocLyThuyet_Full_New.docx`, then reopens, repaginates, and exports PDF.

## Mô phỏng

Sim2 là runtime canonical với 25 route, khai báo tại `js/sim2/sim2-route-manifest.js`. Engine dùng physics UMD, transform world-to-screen, SVG, HTML overlay và canvas underlay tùy chọn. Playback dùng clock fixed-step `1/60 s` từ timestamp RAF; pause/resume không cộng thời gian treo và manual step đi cùng update path. Viewport giữ logical coordinates ổn định, CSS scale responsive, canvas cap theo DPR, pointer được remap về logical screen; `ResizeObserver`, listener, RAF và DOM đều thuộc `dispose()`. Contract mount vẫn là `window.SIM_MAP[pageId] -> factory(container) -> { dispose }`.

Sim3 là pilot 3D tùy chọn cho 10 route: `ch1-1-5`, `ch1-5-3`, `ch2-1-3`, `ch2-2-2`, `ch2-3-2`, `ch2-4-4`, `ch2-5-3`, `ch3-1-3`, `ch3-5-3`, `ch3-6-2`. Hệ tọa độ tay phải dùng `+X` sang phải, `+Y` lên trên, `+Z` hướng về người xem; mặt phẳng ngang ánh xạ `(x,y) -> (x,elevation,-y)`, mặt phẳng đứng ánh xạ `(x,y) -> (x,y,depth)`. Three.js được vendored tại `lib/three/three.umd.min.js`; render mặc định theo nhu cầu, DPR cap, resize theo host, giải phóng GPU/observer/listener khi dispose, và fallback có thông báo tiếng Việt về Sim2 nếu WebGL/setup/update/render/resize lỗi.

Bộ canvas `.sim-lab` 52 route là lịch sử, đã gỡ khỏi master và chỉ được giữ ở tag `archive/52-sims-pre-removal`.

## Trạng thái nội dung và phát hành

- Các route bài tập Chương 3 Section VII-4, VII-5 và VII-6 đã được loại khỏi nội dung/runtime hiện tại.
- Tên file ảnh đã được chuẩn hóa và các asset không dùng đã được dọn khỏi nguồn hiện tại.
- Placeholder `(.)` được extractor bỏ qua và được khóa bằng `tests/no-placeholder-equation-numbers.test.js`.
- Candidate reproducible hiện tại: `release/2026.08.25-candidate/`, 374 files, standalone ZIP SHA-256 `6b48834ff3cfaddf29af6c0c83593e74ca4541c085da0bb8b1c36f128212cdbd`; QTI 3/Common Cartridge derivatives nằm trong `derivatives/`. Đây chưa phải final institutional acceptance: independent academic signoff, independent accessibility review, independent candidate smoke review và Word round-trip vẫn bị chặn. Candidate `2026.08.21` và các bản `20260816`, `20260812`, `20260701` được giữ nguyên làm lịch sử.

## Quy ước vận hành

- Không sửa tay `chapters/*.html`, `images/`, `js/pages.js` hoặc manifest sinh tự động.
- Khi fragment đổi, chạy `tools/gen_quiz_pages.py`, `tools/update_nav.py`, `tools/bundle_pages.py`, `tools/build_content_manifest.py`, `tools/validate_content_manifest.py`, `tools/build_search_index.py` và `tools/audit.py`.
- Dùng `tools/audit.py --strict-images` và `--strict-equations` khi chốt publish.
- State browser giữ trong `localStorage`: `theme`, `fontZoom`, `contentWidth` (`standard|wide`), `gifMotionEnabled`, `chlyt_quiz_attempts` (đọc/migrate aggregate `quizScores` cũ; lưu scope quiz cuối cùng theo chương), `chlyt_progress`, `chlyt_bookmarks`, `chlyt_notes`.
- Không sửa trực tiếp `assets/gifs/`; tái tạo trong `gif-conversion-workspace/`, kiểm tra nội dung vật lý, rồi chạy `python gif-conversion-workspace/publish-gifs.py`.

## Tài liệu

- [Project Overview & PDR](docs/project-overview-pdr.md)
- [Codebase Summary](docs/codebase-summary.md)
- [Code Standards](docs/code-standards.md)
- [System Architecture](docs/system-architecture.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Design Guidelines](docs/design-guidelines.md)
- [Project Roadmap](docs/project-roadmap.md)
- [Project Changelog](docs/project-changelog.md)
- [DOCX Sync Pipeline](docs/docx-sync-pipeline.md)
- [Simulation 4D Scope](docs/simulation-4d.md)
