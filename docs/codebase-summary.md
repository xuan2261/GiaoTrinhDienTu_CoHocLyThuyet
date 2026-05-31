# Codebase Summary

Snapshot này dựa trên scout trực tiếp runtime, toolchain, docs hiện có, và QA metadata ngày 2026-05-31.

## Snapshot

| Mục | Giá trị |
|---|---|
| Repo type | Static electronic textbook |
| Main subject | Cơ Học Lý Thuyết |
| Input chuẩn | `CoHocLyThuyet_Full_New.docx` |
| Runtime/source files chính | `index.html`, `js/`, `chapters/`, `data/`, `tools/` |
| QA harness | `package.json` dev-only scripts + content/quiz gates (`test:content`, `test:quiz`, `test:quiz:browser`) and simulation QA gates: `test:sim:physics`, `test:sim:mount`, `test:sim:release` |
| Simulation engine | `js/sim2/` — SVG-first 3-tầng engine; 25 route; tag `archive/52-sims-pre-removal` giữ bộ cũ 52 route |
| Simulation route manifest | `js/sim2/sim2-route-manifest.js` — metadata 25 route; nguồn duy nhất cho test count |
| Generated/runtime assets lớn | `images/`, `equation-review.html`, `js/pages.js` |
| Large generated artifacts | `equation-review.html`, `js/pages.js`, `tools/equation_report.json` |

## Những gì repo này làm

Repo cung cấp một textbook reader chạy hoàn toàn phía client:

- điều hướng theo chương / mục / tiểu mục
- search nội dung
- quiz trắc nghiệm
- progress và bookmark
- notes, highlight, glossary tooltip
- simulations SVG-first (25 route, engine `js/sim2/`)
- DOCX sync pipeline để regenerate fragment và asset

## Cấu trúc cấp cao

| Đường dẫn | Vai trò | Ghi chú |
|---|---|---|
| `index.html` | Shell ứng dụng | Nạp KaTeX local trước, CDN sau |
| `package.json` | Dev-only QA scripts | `test:content`, `test:quiz`, `test:quiz:browser`, `test:sim:physics`, `test:sim:mount`, `test:sim:release` |
| `css/style.css` | Theme và layout | Dark navy + gold, có light mode |
| `js/app.js` | UI shell | Breadcrumb, search, theme, font zoom, progress bar |
| `js/loader.js` | Router và fragment loader | Có fallback bundle offline rồi mới fetch |
| `js/pages.js` | Offline bundle | Sinh từ `tools/bundle_pages.py` |
| `js/quiz.js` | Quiz engine | Lưu điểm vào `localStorage` |
| `js/progress.js` | Reading progress | Bookmark + progress per page/chapter |
| `js/glossary.js` | Term tooltip | Tự wrap từ khóa technical |
| `js/notes.js` | Personal notes | Highlight + notes per page |
| `js/sim2/` | Simulation engine SVG-first | `physics/`, `core/`, `sims/ch*/`, `registry.js`, `sim2-route-manifest.js` — 25 route |
| `chapters/` | HTML fragments | Sinh từ DOCX |
| `data/` | Quiz + equation mapping | Có `quiz-ch1.json`, `quiz-ch2.json`, `quiz-ch3.json` |
| `tools/` | Build/audit pipeline | Python scripts, manifest, reports |
| `tests/` | Playwright browser QA + Node unit suites | `tests/sim2-physics.test.js`, `tests/sim2-mount.spec.js` (sim2 gates); quiz/content gates |
| `docs/` | Operational docs | Hiện là lớp tài liệu chuẩn hóa |

## Runtime surface

| Module | Trách nhiệm |
|---|---|
| `app.js` | Tạo base UX: search, breadcrumb, sidebar state, theme, zoom, read tracking |
| `loader.js` | Resolve route, load content, render math, call sim/image-tab hooks |
| `quiz.js` | Load JSON quiz data, render câu hỏi, chấm đáp án, lưu score |
| `progress.js` | Track visited pages, bookmarks, read status |
| `glossary.js` | Gắn tooltip cho thuật ngữ trong content fragment |
| `notes.js` | Highlight selection, note popup, notes panel |
| `js/sim2/registry.js` | Build `window.SIM_MAP` từ 25 route factories |
| `js/sim2/core/sim-shell.js` | Factory chung: SVG+overlay(+canvas), RAF loop, `setTheory()`/`addControls()`, dispose() |
| `js/sim2/core/palette.js` | `Sim2Palette` — token màu dùng chung (mirror CSS `--sim-c-*`); 1 nguồn ý nghĩa màu |
| `js/sim2/core/panel.js` | `Sim2Panel` — theory panel: công thức KaTeX tô màu + legend + readout sống + quan sát |
| `js/sim2/core/controls.js` | `Sim2Controls` — control bar: slider+`<output>` + playback ▶/⏸/⏭/↺ (start paused) |
| `js/sim2/physics/` | Công thức physics UMD (statics/kinematics/dynamics) |

## Data model

| Data | Vị trí | Ý nghĩa |
|---|---|---|
| Route map | `js/loader.js` | Ánh xạ route -> fragment |
| Breadcrumb map | `js/app.js` | Ánh xạ route -> nhãn UI |
| Route order | `js/app.js` | Thứ tự trang cho page nav |
| Quiz banks | `data/quiz-ch*.json` | 100 câu hỏi theo chapter; schema/count/distribution/bundle guard ở `tests/quiz-bank-schema.test.js` |
| Equation report | `tools/equation_report.json` | Media equation review queue |
| Equation mapping | `data/equation_mapping.json` | 702 reviewed rows; formula rows use LaTeX/MathML, artifact rows are explicit |
| Site manifest | `tools/docx_site_manifest.json` | Snapshot chapter/section/subsection từ extractor |

## Toolchain

| Script | Vai trò |
|---|---|
| `tools/analyze_docx.py` | Preview outline và route mapping từ DOCX |
| `tools/extract_docx.py` | Xuất `chapters/`, `images/`, `tools/docx_site_manifest.json`, equation report |
| `tools/update_nav.py` | Đồng bộ sidebar, route map, page order, breadcrumb, legacy redirects |
| `tools/bundle_pages.py` | Bundle fragment và quiz JSON vào `js/pages.js` |
| `tools/audit.py` | Audit content, image path, equation rendering; có `--strict-equations` và `--strict-images` publish gates |
| `tools/validate_equation_mapping.py` | Validate mapping JSON, trạng thái `reviewed`, và optional KaTeX parse |
| `tools/ocr_equation_mapping.py` | Prefill mapping bằng local OCR/Vision LLM và reject OCR LaTeX không render được |
| `tools/build_equation_review_html.py` | Tạo `equation-review.html` offline |
| `tools/auto_review_equation_mapping.py` | Auto-review MathType/Microsoft Equation OLE sang MathML bằng local Ruby |
| `tools/apply_manual_equation_reviews.py` | Áp manual review/triage vào mapping bằng file dữ liệu riêng |
| `tools/merge_equation_mapping.py` | Merge reviewed mapping vào publish file |
| `tools/test_docx_equation_pipeline.py` | Regression test cho mojibake MathML, generated output sạch, và inline spacing |
| `tools/test_simulation_qa_tools.py` | Regression test cho simulation QA tools và browser baseline wiring |

## Khu vực generated / nặng

| File hoặc thư mục | Ghi chú |
|---|---|
| `js/pages.js` | Generated bundle, không sửa tay |
| `equation-review.html` | Generated review UI, rất lớn |
| `tools/equation_report.json` | Output review data lớn |
| `backups/` | Snapshot lịch sử, chủ yếu để rollback |
| `Old/` | Legacy material, không phải source of truth hiện tại |

## Gợi ý đọc tiếp

1. `README.md`
2. `docs/system-architecture.md`
3. `docs/docx-sync-pipeline.md`
4. `js/loader.js`
5. `tools/extract_docx.py`

## Ghi chú

Không nên đọc toàn bộ repo cho mọi tác vụ. Với task nhỏ, chỉ cần đọc `index.html`, `js/app.js`, `js/loader.js`, và script liên quan là đủ.
Khi `audit.py --strict-equations` còn warning figure `<img>` tags, đó là figure thật chứ không phải equation fallback.
- Simulation engine mới là `js/sim2/` SVG-first 3 tầng; 25 route thay thế 52 route canvas-based cũ. Tag `archive/52-sims-pre-removal` giữ bộ cũ.
- Simulation lifecycle: `loader.js` → `initSimulations(container, pageId)` tra `SIM_MAP`, mount factory, lưu dispose; gọi dispose khi đổi route.
- `js/sim2/sim2-route-manifest.js` là nguồn duy nhất cho route count — không hardcode số 25 trong tests.
- QA gate chuẩn: `npm run test:sim:physics` (Node), `npm run test:sim:mount` (Playwright), `npm run test:sim:release` (full offline).
- `js/sim2/core/overlay.js` dùng HTML định vị tuyệt đối qua transform — nhãn không chồng, test bounding-box bắt được.
- `js/sim2/core/canvas-underlay.js` chỉ dùng cho 4 route cần trail/field: ch2-1-1, ch2-4-4, ch2-5-3, ch3-6-2.
