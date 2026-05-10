# Codebase Summary

Snapshot này dựa trên `repomix-output.xml` (refreshed 2026-05-09) và scout trực tiếp các file runtime, toolchain, và docs hiện có.

## Snapshot

| Mục | Giá trị |
|---|---|
| Repo type | Static electronic textbook |
| Main subject | Cơ Học Lý Thuyết |
| Input chuẩn | `CoHocLyThuyet_Full_New.docx` |
| Runtime/source files chính | `index.html`, `js/`, `chapters/`, `data/`, `tools/` |
| QA harness | `package.json` dev-only scripts + current simulation QA gates: unit, quality, semantic, visual-quality, browser, release, scene-identity, renderer-contract, runtime smoke |
| Simulation route contracts | `js/sim-scene-registry.js`, `js/sim-route-renderer-registry.js`, `js/sim-route-behavior-registry.js`, 58 route renderers under `js/sims/ch*/` |
| Simulation files | 63 JS files total; 22 Ch1, 17 Ch2, 18 Ch3, 6 infrastructure |
| Shared-first simulation UX | `.sim-lab` shell with chapter accents, 44px touch controls, semantic readout cards, and ARIA-backed hint/status/canvas wiring |
| Generated/runtime assets lớn | `images/`, `equation-review.html`, `js/pages.js` |
| Large generated artifacts | `equation-review.html`, `js/pages.js`, `tools/equation_report.json` |

## Những gì repo này làm

Repo cung cấp một textbook reader chạy hoàn toàn phía client:

- điều hướng theo chương / mục / tiểu mục
- search nội dung
- quiz trắc nghiệm
- progress và bookmark
- notes, highlight, glossary tooltip
- simulations canvas
- route-specific scene catalogs, strict renderer/behavior contracts, semantic QA, và lazy professional lab mounts
- DOCX sync pipeline để regenerate fragment và asset

## Cấu trúc cấp cao

| Đường dẫn | Vai trò | Ghi chú |
|---|---|---|
| `index.html` | Shell ứng dụng | Nạp KaTeX local trước, CDN sau |
| `package.json` | Dev-only QA scripts | `test:sim:unit`, `test:sim:quality`, `test:sim:semantic`, `test:sim:renderer-contract`, `test:sim:browser`, `test:sim:release`, `test:sim:browser:install`, `test:sim:browser:baseline`, `test:sim:browser:route-mount` |
| `css/style.css` | Theme và layout | Dark navy + gold, có light mode |
| `js/app.js` | UI shell | Breadcrumb, search, theme, font zoom, progress bar |
| `js/loader.js` | Router và fragment loader | Có fallback bundle offline rồi mới fetch |
| `js/pages.js` | Offline bundle | Sinh từ `tools/bundle_pages.py` |
| `js/quiz.js` | Quiz engine | Lưu điểm vào `localStorage` |
| `js/progress.js` | Reading progress | Bookmark + progress per page/chapter |
| `js/glossary.js` | Term tooltip | Tự wrap từ khóa technical |
| `js/notes.js` | Personal notes | Highlight + notes per page |
| `js/sim-engine-v2.js` | Simulation Engine V2 | Headless Matter.js sync to SVG/DOM |
| `js/sim-ui-v2.js` | Simulation UI V2 | Standardized controls + Chart.js integration |
| `js/simulations.js` | Simulation registry | Đăng ký và cấu hình các route simulation V2 |
| `js/deprecated/` | Legacy simulation files | Các file engine cũ được giữ lại để tham khảo |
| `chapters/` | HTML fragments | Sinh từ DOCX |
| `data/` | Quiz + equation mapping | Có `quiz-ch1.json`, `quiz-ch2.json`, `quiz-ch3.json` |
| `tools/` | Build/audit pipeline | Python scripts, manifest, reports |
| `tests/` | Playwright browser QA | `tests/simulation-browser.spec.js` |
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
| `sim-engine-v2.js` | Core V2 engine: Matter.js update loop + SVG/DOM sync |
| `sim-ui-v2.js` | V2 UI components: standardized sliders, buttons, and Chart.js integration |
| `simulations.js` | V2 Simulation registry and configuration |
| `js/deprecated/` | Legacy simulation architecture (5-layer custom engine) |

## Data model

| Data | Vị trí | Ý nghĩa |
|---|---|---|
| Route map | `js/loader.js` | Ánh xạ route -> fragment |
| Breadcrumb map | `js/app.js` | Ánh xạ route -> nhãn UI |
| Route order | `js/app.js` | Thứ tự trang cho page nav |
| Quiz banks | `data/quiz-ch*.json` | Câu hỏi theo chapter |
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
| `tools/smoke_simulation_manifest.py` | Gate Phase 01 cho manifest coverage / route matrix |
| `tools/audit_simulation_quality.py` | Gate Phase 01 cho simulation quality baseline |
| `tools/smoke_simulation_routes.py` | QA smoke cho route wiring và coverage matrix; in coverage counts và representative routes |
| `tools/smoke_simulation_scene_catalog.py` | Gate scene catalog identity và route coverage 58 route |
| `tools/smoke_simulation_renderer_contract.py` | Strict gate cho rendererId/function/body uniqueness, behavior registrations, no family dispatch |
| `tools/smoke_simulation_runtime.py` | QA smoke cho split runtime, script order, module globals, registry, lifecycle tokens, `--expect-runtime-routes 58`, `--check-mount-rollback` |
| `tools/validate_equation_mapping.py` | Validate mapping JSON, trạng thái `reviewed`, và optional KaTeX parse |
| `tools/ocr_equation_mapping.py` | Prefill mapping bằng local OCR/Vision LLM và reject OCR LaTeX không render được |
| `tools/build_equation_review_html.py` | Tạo `equation-review.html` offline |
| `tools/auto_review_equation_mapping.py` | Auto-review MathType/Microsoft Equation OLE sang MathML bằng local Ruby |
| `tools/apply_manual_equation_reviews.py` | Áp manual review/triage vào mapping bằng file dữ liệu riêng |
| `tools/merge_equation_mapping.py` | Merge reviewed mapping vào publish file |
| `tools/test_docx_equation_pipeline.py` | Regression test cho mojibake MathML, generated output sạch, và inline spacing |
| `tools/test_simulation_qa_tools.py` | Regression test cho simulation QA tools và browser baseline wiring |
| `npm run test:sim:scene-identity` | Browser scene identity gate: `tools/smoke_simulation_scene_catalog.py --strict --require-routes 58` + Playwright `@scene-identity` |
| `npm run test:sim:renderer-contract` | Static + browser gate cho 58 dedicated renderers, 58 behavior ids, và runtime structural identity |

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
- `tools/smoke_simulation_routes.py --require-p1` hiện cover 58/58 P1 routes; matrix thiếu hoặc rỗng vẫn fail trừ khi explicit opt-in.
- Simulation lifecycle đã có shared dispose path: `loader.js` dispose active simulation trước khi replace `#content-area`; `sim-core.js` cleanup RAF và resize listener.
- Professional simulation architecture hiện dùng `js/sim-professional-lab.js`, scene metadata registry, strict renderer/behavior registries, thin adapters, route modules, và registry-backed route map.
- Runtime smoke gate chuẩn là `python tools\smoke_simulation_runtime.py --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup`; semantic gate là `npm run test:sim:semantic`.
- Browser QA suite hiện có pass; scene identity, route discovery guard, route shell, direct drag, animation tick, readout cards, responsive, `file://`, và server smoke phải giữ sạch.
