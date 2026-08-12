# Codebase Summary

Snapshot theo HEAD `455870b`, ngày 2026-07-01.

## Tổng quan

| Mục | Giá trị |
|---|---|
| Loại repo | Static electronic textbook |
| Nguồn nội dung | `CoHocLyThuyet_Full_New.docx` |
| Runtime | `index.html`, `css/`, `js/`, `chapters/`, `images/`, `data/`, `lib/` |
| Toolchain | Python scripts trong `tools/`; npm/Playwright chỉ cho QA |
| Sim canonical | Sim2 SVG-first, 25 route |
| Sim tùy chọn | Sim3 Three.js, 10 route |
| Release hiện có | Folder và `.rar` ngày 2026-07-01 trong `release/` |

## Thành phần chính

| Đường dẫn | Trách nhiệm |
|---|---|
| `index.html` | Shell và thứ tự load script |
| `js/app.js` | Search, breadcrumb, sidebar, theme, zoom, progress UI |
| `js/loader.js` | Resolve route, load fragment/bundle, render math, mount/dispose sim |
| `js/pages.js` | Bundle offline sinh bởi `tools/bundle_pages.py` |
| `js/quiz.js` | Render/chấm quiz và lưu `quizScores` |
| `js/progress.js` | Reading progress và bookmark |
| `js/glossary.js`, `js/notes.js` | Tooltip thuật ngữ, highlight và ghi chú |
| `js/sim2/` | Physics, core, 25 simulation factories, registry và manifest |
| `js/sim3/` | Core 3D và 10 adapters tùy chọn |
| `chapters/`, `images/` | Output từ extractor DOCX |
| `data/` | Ba quiz bank và equation/image mapping |
| `tools/` | Analyze, extract, nav, bundle, audit, equation review |
| `tests/` | Node và Playwright QA |

## Luồng runtime

1. `index.html` nạp shell, bundle và module runtime.
2. `loader.js` resolve route, lấy fragment từ `js/pages.js` hoặc fetch.
3. KaTeX/MathML và các hook nội dung được khởi tạo sau khi fragment vào DOM.
4. Nếu route có simulation, `SIM_MAP[pageId]` mount factory; route change gọi `dispose()` trước khi thay nội dung.

## Nội dung và dữ liệu

- `tools/docx_site_manifest.json` là snapshot outline sinh từ extractor.
- `data/equation_mapping.json` có 702 row đã review cho semantic math publish.
- Quiz banks nằm tại `data/quiz-ch1.json`, `quiz-ch2.json`, `quiz-ch3.json`.
- Chương 3 Section VII-4, VII-5 và VII-6 không còn trong route/fragment hiện tại.
- Asset ảnh hiện tại đã được chuẩn hóa tên; asset không dùng đã được loại.
- Extractor bỏ placeholder `(.)`; `tests/no-placeholder-equation-numbers.test.js` ngăn hồi quy.

## Mô phỏng

`js/sim2/sim2-route-manifest.js` là nguồn count canonical 25 route. Sim2 dùng physics UMD, transform chung, SVG + HTML overlay và canvas underlay tùy chọn. Sim3 mở rộng 10 route nhưng không thay đổi default Sim2. Bộ canvas `.sim-lab` 52 route đã gỡ, chỉ còn trong tag lịch sử `archive/52-sims-pre-removal`.

## Generated và release artifacts

Không sửa tay `js/pages.js`, `chapters/`, `images/`, `tools/docx_site_manifest.json`, `tools/equation_report.json`. Release hiện tại:

- `release/GiaoTrinhDienTu_CoHocLyThuyet_release_20260812/`
- `release/GiaoTrinhDienTu_CoHocLyThuyet_release_20260812.rar`

Release `20260701` được giữ nguyên làm artifact lịch sử.
