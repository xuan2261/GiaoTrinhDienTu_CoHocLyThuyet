# Codebase Summary

Snapshot release-readiness ngày 2026-08-22.

## Tổng quan

| Mục | Giá trị |
|---|---|
| Loại repo | Static electronic textbook |
| Nguồn nội dung | `CoHocLyThuyet_Full_New.docx` |
| Runtime | `index.html`, `css/`, `js/`, `chapters/`, `images/`, `data/`, `lib/` |
| Toolchain | Python scripts trong `tools/`; npm/Playwright chỉ cho QA |
| Sim canonical | Sim2 SVG-first, 25 route |
| Sim tùy chọn | Sim3 Three.js, 10 route |
| Release hiện có | Deterministic candidate ZIP `2026.08.21-candidate`; historical packages remain in `release/` |

## Thành phần chính

| Đường dẫn | Trách nhiệm |
|---|---|
| `index.html` | Shell và thứ tự load script |
| `js/app.js`, `js/search.js` | UI shell and full-text search controller/runtime |
| `js/loader.js` | Resolve route, load fragment/bundle, render math, mount/dispose sim and focus search anchors |
| `js/pages.js` | Bundle offline sinh bởi `tools/bundle_pages.py` |
| `js/quiz-state.js`, `js/quiz.js` | Normalize bank v1/v2, seeded attempt state, semantic quiz UI và lưu `chlyt_quiz_attempts` |
| `js/progress.js` | Reading progress và bookmark |
| `js/glossary.js`, `js/notes.js` | Tooltip thuật ngữ, highlight và ghi chú |
| `js/sim2/` | Physics UMD, fixed-step clock, logical viewport/resize/DPR/pointer core, 25 factories, registry và manifest |
| `js/sim3/` | Hệ tọa độ tay phải, demand-rendered Three.js shell/disposal/fallback và 10 adapters tùy chọn |
| `chapters/`, `images/` | Output từ extractor DOCX |
| `data/` | Quiz schema v2, search, traceability, evidence/review contracts, accessibility baseline, media pilot, LMS targets và release policy |
| `data/search-index.json`, `js/search-index.js` | Deterministic offline full-text index and browser wrapper |
| `data/accessibility-baseline.json` | Criterion/surface/test/manual matrix; explicit non-certification scope and pending independent review |
| `tools/build_search_index.py` | Builds and validates schema v1 from manifest, bundled routes and glossary digest |
| `tools/release/`, `tools/lms/` | Deterministic standalone packaging/validation and staged QTI 3/Common Cartridge adapters |
| `tools/run_qa_gates.py`, `tools/build_acceptance_bundle.py` | Canonical gate execution, hash-bound evidence and Phase 12 acceptance reporting |
| `tests/` | Node, Python và Playwright QA including `file://`, release, LMS, accessibility and acceptance contracts |
| `tools/sim2-visual/`, `tools/sim3-visual/`, `tools/sim-probe/` | Capture/contact/probe run-specific, strict validators và selective baseline workflow |
| `data/simulation-specifications.json`, `data/sim3-pedagogical-reviews.json` | 25 Sim2 + 10 Sim3 technical records hash-bound với independent executable evidence; không phải institutional approval |

## Luồng runtime

1. `index.html` nạp shell, bundle và module runtime.
2. `loader.js` resolve route, lấy fragment từ `js/pages.js` hoặc fetch.
3. KaTeX/MathML và các hook nội dung được khởi tạo sau khi fragment vào DOM.
4. Nếu route có simulation, `SIM_MAP[pageId]` mount factory; route change gọi `dispose()` trước khi thay nội dung.
5. Shell/PDF/simulation accessibility state dùng native semantics + focused JS; CSS token chung giữ focus, target, contrast và narrow reflow.

## Nội dung và dữ liệu

- `tools/docx_site_manifest.json` là snapshot outline sinh từ extractor.
- `data/equation_mapping.json` có 702 row đã review cho semantic math publish.
- Quiz banks schema v2 tại `data/quiz-ch1.json`, `quiz-ch2.json`, `quiz-ch3.json`; 300 stable item IDs join learning outcomes và bundle offline.
- Chương 3 Section VII-4, VII-5 và VII-6 không còn trong route/fragment hiện tại.
- Asset ảnh hiện tại đã được chuẩn hóa tên; asset không dùng đã được loại.
- Extractor bỏ placeholder `(.)`; `tests/no-placeholder-equation-numbers.test.js` ngăn hồi quy.
- `data/accessibility-baseline.json` records authored-not-run automation separately from pending independent manual review; không phải blanket WCAG conformance claim.

## Mô phỏng

`js/sim2/sim2-route-manifest.js` là nguồn count canonical 25 route. Sim2 dùng physics UMD, clock fixed-step `1/60 s`, transform/logical viewport chung, SVG + HTML overlay và canvas underlay tùy chọn; resize giữ state và pointer/keyboard dùng cùng domain. Sim3 mở rộng 10 route bằng hệ tay phải và demand rendering nhưng không thay default Sim2; shell cap DPR, quản lý observer/RAF/GPU lifecycle và fallback 2D cho mọi failure class. Correctness được khóa bằng independent numeric/geometric oracles, 35-route production/probe coverage, strict fresh capture/contact sheets và selective visual baseline đã review. Bộ canvas `.sim-lab` 52 route đã gỡ, chỉ còn trong tag lịch sử `archive/52-sims-pre-removal`.

## Generated và release artifacts

Không sửa tay `js/pages.js`, `chapters/`, `images/`, `tools/docx_site_manifest.json`, `tools/equation_report.json`. Candidate hiện tại:

- `release/2026.08.21-candidate/package/`
- `release/2026.08.21-candidate/co-hoc-ly-thuyet-2026.08.21-candidate.zip`
- QTI 3 pilot và Common Cartridge 1.4 trong `release/2026.08.21-candidate/derivatives/`

ZIP standalone có 374 files, SHA-256 `a0908a72624a44f8d37a525c97de3ee240fdbec1199c59097ab92a78cd718ef6`, byte-identical qua hai clean build. Candidate đạt 20/24 gate và vẫn blocked cho final acceptance bởi independent academic signoff, independent accessibility review, independent candidate smoke review và Word round-trip. Các release cũ giữ nguyên làm artifact lịch sử.
