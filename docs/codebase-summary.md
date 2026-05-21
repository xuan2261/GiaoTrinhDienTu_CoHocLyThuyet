# Codebase Summary

Snapshot này dựa trên scout trực tiếp runtime, toolchain, docs hiện có, và QA metadata ngày 2026-05-20.

## Snapshot

| Mục | Giá trị |
|---|---|
| Repo type | Static electronic textbook |
| Main subject | Cơ Học Lý Thuyết |
| Input chuẩn | `CoHocLyThuyet_Full_New.docx` |
| Runtime/source files chính | `index.html`, `js/`, `chapters/`, `data/`, `tools/` |
| QA harness | `package.json` dev-only scripts + current simulation QA gates: unit, quality, audit, disposal, semantic, visual-quality, browser, browser:evolution, release, scene-identity, renderer-contract, runtime smoke, correctness, correctness:browser, review aggregate, visual/evolution baseline update |
| Simulation route contracts | `js/sim-scene-registry.js`, `js/sim-route-renderer-registry.js`, `js/sim-route-behavior-registry.js`, 58 route renderers under `js/sims/ch*/` |
| Simulation files | 65 active JS files scanned by `audit_simulation_quality.py`; Ch1 route files stay under 220 lines |
| Shared-first simulation UX | `.sim-lab` shell with 760×440 canvas, chapter accents, 44px touch controls, semantic readout cards, wide right-inspector stack on desktop/tablet, stacked mobile fallback, DeCuong render helpers, and ARIA-backed hint/status/canvas wiring |
| Static vs animated simulations | Concept routes use `scene.static` to suppress Play; `tickWithoutButton` permits readout ticks without Play. Canvas labels are exact static/animated strings; engine time is exposed through scoped `.sim-lab[data-engine-time]`, not `window.__currentLab`. Animated routes must evolve under the engine-time canvas sweep and the no-dependency tier-2 visual baseline; renderer type rules live in `docs/code-standards.md` → `Sim renderer types`. |
| Promax pilot scope | 6 routes keep hidden invariant metadata for QA; extra diagnostics, formula readouts, mini graph summaries, and challenge controls are no longer shown to learners |
| DeCuong rebuild progress | Phase 00 through Phase 12 complete; 58/58 rebuilt routes pass final release gate, including final review fixes for `ch2-1-3`, `ch2-5-3`, `ch2-7-2`, localized CH2 checker labels, CH2 exercise/checkers `ch2-7-1`/`ch2-7-2`, and CH3 Newton/ODE, theorem/collision, and exercise/checker routes; current QA scripts include `test:sim:review-2026-05-19` and `test:sim:visual-quality:update` |
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
- route-specific scene catalogs, strict renderer/behavior contracts, semantic QA, and lazy professional lab mounts
- DOCX sync pipeline để regenerate fragment và asset

## Cấu trúc cấp cao

| Đường dẫn | Vai trò | Ghi chú |
|---|---|---|
| `index.html` | Shell ứng dụng | Nạp KaTeX local trước, CDN sau |
| `package.json` | Dev-only QA scripts | `test:sim:unit`, `test:sim:quality`, `test:sim:semantic`, `test:sim:renderer-contract`, `test:sim:browser`, `test:sim:release`, `test:sim:browser:install`, `test:sim:browser:baseline`, `test:sim:browser:route-mount`, `test:sim:correctness`, `test:sim:correctness:browser`, `test:sim:review-2026-05-19`, `test:sim:visual-quality:update` |
| `css/style.css` | Theme và layout | Dark navy + gold, có light mode |
| `js/app.js` | UI shell | Breadcrumb, search, theme, font zoom, progress bar |
| `js/loader.js` | Router và fragment loader | Có fallback bundle offline rồi mới fetch |
| `js/pages.js` | Offline bundle | Sinh từ `tools/bundle_pages.py` |
| `js/quiz.js` | Quiz engine | Lưu điểm vào `localStorage` |
| `js/progress.js` | Reading progress | Bookmark + progress per page/chapter |
| `js/glossary.js` | Term tooltip | Tự wrap từ khóa technical |
| `js/notes.js` | Personal notes | Highlight + notes per page |
| `js/sim-lab-ui.js` | Simulation shell | `.sim-lab` header, canvas, readout cards, hint, reset/play-pause |
| `js/sim-professional-lab.js` | Simulation orchestration | Resolve scene/renderer/behavior, bind controls/handles, render canvas/readouts |
| `js/sims/ch*/` | Route contracts | Scene catalogs, dedicated renderers, behavior contracts, route modules |
| `js/simulations.js` | Simulation registry | Build `window.SIM_MAP` từ active route registries |
| `chapters/` | HTML fragments | Sinh từ DOCX |
| `data/` | Quiz + equation mapping | Có `quiz-ch1.json`, `quiz-ch2.json`, `quiz-ch3.json` |
| `tools/` | Build/audit pipeline | Python scripts, manifest, reports |
| `tests/` | Playwright browser QA + Node unit suites | `tests/simulation-browser.spec.js`, `tests/sim-correctness-realism.test.js`, `tests/sim-handle-anchor-invariants.spec.js`, `tests/sim-correctness-realism-fixtures.js` |
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
| `sim-lab-ui.js` | Shared `.sim-lab` shell and UI slots |
| `sim-professional-lab.js` | Shared mount engine for route-specific scenes/renderers/behaviors |
| `sim-statics.js`, `sim-kinematics.js`, `sim-dynamics.js` | Thin chapter adapters into `SimProfessionalLab.mount(routeId)` |
| `simulations.js` | Registry-backed 58-route `window.SIM_MAP` |

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
| `tests/phase-08-tdd.test.js` | Phase 08 TDD coverage cho relative-motion và plane/instant-center routes |
| `tools/validate_equation_mapping.py` | Validate mapping JSON, trạng thái `reviewed`, và optional KaTeX parse |
| `tools/ocr_equation_mapping.py` | Prefill mapping bằng local OCR/Vision LLM và reject OCR LaTeX không render được |
| `tools/build_equation_review_html.py` | Tạo `equation-review.html` offline |
| `tools/auto_review_equation_mapping.py` | Auto-review MathType/Microsoft Equation OLE sang MathML bằng local Ruby |
| `tools/apply_manual_equation_reviews.py` | Áp manual review/triage vào mapping bằng file dữ liệu riêng |
| `tools/merge_equation_mapping.py` | Merge reviewed mapping vào publish file |
| `tools/test_docx_equation_pipeline.py` | Regression test cho mojibake MathML, generated output sạch, và inline spacing |
| `tools/test_simulation_qa_tools.py` | Regression test cho simulation QA tools và browser baseline wiring |
| `tests/sim-canvas-evolution.spec.js` | 58-route engine-time canvas hash sweep; static buckets stay bounded, animated buckets must show `[3,4]` unique frames |
| `tools/check-canvas-evolution-baseline.js` | Baseline drift gate for `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json`; rejects animated wall-time fallback |
| `tests/phase-09-12-tdd.test.js` | TDD coverage cho CH2 exercise checker và CH3 dynamics/exercise invariants |
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
- DeCuong Phase 00-12 foundation/CH1/CH2/CH3 routes yêu cầu canvas 760×440, transparent clear, PI/7 arrows, theme-aware grid, KaTeX equation panel fallback, route-owned handles, no motion trails, synchronized readouts/sliders, manifest-aligned 58 route contracts, CH1 release-ready QA evidence, CH2 exercise checker invariants, CH3 spring/collision/checker invariants, và final release gate pass.
- Browser QA suite hiện có pass; scene identity, route discovery guard, route shell, direct drag, animation tick, readout cards, responsive, `file://`, và server smoke phải giữ sạch.
