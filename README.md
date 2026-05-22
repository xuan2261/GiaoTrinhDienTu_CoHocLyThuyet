# Giáo trình điện tử Cơ Học Lý Thuyết

Giáo trình điện tử tĩnh cho môn Cơ Học Lý Thuyết, chạy trực tiếp bằng `HTML/CSS/JS`, phù hợp cho `file://`, USB offline, hoặc mở qua static server. Nguồn chuẩn nội dung hiện tại là `CoHocLyThuyet_Full_New.docx`.

## Chạy nhanh

| Mục | Cách làm |
|---|---|
| Mở offline | Mở `index.html` trực tiếp bằng browser |
| Chạy dev server | `python -m http.server 8000` rồi mở `http://localhost:8000/` |
| Làm mới nội dung | Chạy lại pipeline DOCX trong phần bên dưới |
| Cài QA browser dev-only | `npm install` rồi `npm run test:sim:browser:install` |

## Cấu trúc chính

| Đường dẫn | Vai trò |
|---|---|
| `index.html` | Shell của ứng dụng, nạp CSS, KaTeX, `js/app.js`, `js/pages.js`, `js/loader.js`, các module phụ và simulation engine |
| `js/app.js` | Theme, search, breadcrumb, sidebar, font zoom, progress bar |
| `js/pages.js` | Bundle offline của fragment HTML và quiz JSON |
| `js/loader.js` | Route map, lazy load fragment, fallback bundle/fetch, render math, image tabs, dispose active simulation trước khi đổi route |
| `js/quiz.js` | Quiz engine, random mode, lưu điểm vào `localStorage` |
| `js/progress.js` | Theo dõi trang đã xem, bookmark, tiến trình đọc |
| `js/glossary.js` | Tooltip thuật ngữ |
| `js/notes.js` | Highlight và ghi chú cá nhân |
| `js/sim-core.js` + `js/sim-vector-math.js` + `js/sim-rendering.js` + `js/sim-interactions.js` | Shared simulation kernels, canvas helpers, và interaction kernel |
| `js/sim-lab-ui.js` | Simple lab shell: `.sim-header`, `.sim-readout-grid`, `.sim-lab-hint`; no checkpoint/feedback panels |
| `js/sim-professional-lab.js` | Shared professional lab engine; centralize physics, topic selection, và mount helpers |
| `js/sim-route-renderer-registry.js` + `js/sim-route-behavior-registry.js` | Strict route renderer/behavior contracts; 52 canonical routes phải có renderer function riêng |
| `js/sim-route-renderer-primitives.js` | Low-level drawing primitives dùng chung, không phải final route renderer |
| `js/sim-statics.js` + `js/sim-kinematics.js` + `js/sim-dynamics.js` | Thin adapters gắn route id vào `SimProfessionalLab` |
| `js/sims/ch*/` | Route modules, scene catalogs, 52 canonical route renderers, và behavior contracts theo chương |
| `js/sim-activities.js` | Shared checker/progress helpers |
| `js/sim-route-manifest.js` | 52-route objective manifest |
| `js/simulations.js` | Compatibility layer build `window.SIM_MAP` từ registry |
| `chapters/` | HTML fragment sinh từ DOCX |
| `data/` | Quiz JSON và mapping công thức |
| `tools/` | Script đồng bộ DOCX, nav, bundle, audit, equation review |
| `docs/` | Tài liệu vận hành, kiến trúc, roadmap, standards |

## Pipeline đồng bộ DOCX

```powershell
python tools\analyze_docx.py --input CoHocLyThuyet_Full_New.docx --routes
python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
python tools\update_nav.py
python tools\bundle_pages.py
python tools\audit.py
```

Khi xử lý semantic math hoặc chốt publish image metadata, dùng thêm luồng review trong [DOCX Sync Pipeline](docs/docx-sync-pipeline.md).

## QA simulation

Các lệnh này chỉ phục vụ phát triển/kiểm thử; runtime offline không phụ thuộc npm.

```powershell
python tools\smoke_simulation_manifest.py --require-routes 52 --require-objectives --require-direct
python tools\audit_simulation_quality.py --all --max-js-lines 220
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 52 --check-mount-rollback --check-listener-cleanup
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:quality:baseline
npm run test:sim:audit
npm run test:sim:semantic
npm run test:sim:scene-identity
npm run test:sim:renderer-contract
npm run test:sim:visual-quality
npm run test:sim:review-2026-05-19
npm run test:sim:visual-quality:update -- --routes ch1-3-2,ch1-3-6
npm run test:sim:browser
npm run test:sim:browser:evolution
npm run test:sim:browser:update-evolution-baseline
npm run test:sim:visual-quality:full
npm run test:sim:visual-quality:update-evolution-baseline
npx playwright test tests/promax-pilot-shell.spec.js
npm run test:sim:disposal
npm run test:sim:release
npm run test:sim:browser:baseline
npm run test:sim:browser:route-mount
```

Nếu chưa cài Playwright dependency, chạy `npm install` trước. Python smoke vẫn là fallback nhanh khi không cần browser QA.
Browser QA dev-only hiện dùng focused suite không còn skipped rollout tests: `npm run test:sim:browser` chạy no-simulation Section VII guard, mass/conversion, simulation browser, interaction engine, Promax shell, canvas-evolution, và static-route no-play specs. Registry/contract hiện giữ 52 canonical routes; toàn bộ Section VII `BÀI TẬP` là content-only. `npm run test:sim:browser:evolution` chạy riêng 52-route engine-time canvas hash sweep + baseline drift check; update baseline bằng `npm run test:sim:browser:update-evolution-baseline` sau review có chủ ý. `npm run test:sim:visual-quality` chạy 4 tests: canonical discovery 52 routes, rồi nonblank/bounded canvas, route-owned handles, renderer/behavior/scene identity, dark/light readability và overflow. `npm run test:sim:visual-quality:full` chạy thêm tier-2 visual evolution JSON pixel-diff baseline; refresh baseline bằng `npm run test:sim:visual-quality:update-evolution-baseline` sau review có chủ ý. `npm run test:sim:review-2026-05-19` là RED aggregate cho plan simulation review priority fixes, chạy cả Node physics invariants và Playwright review specs. `npm run test:sim:visual-quality:update -- --routes ...` refresh capture/report side-by-side cho route bị ảnh hưởng. `npm run test:sim:renderer-contract` kiểm 52 renderer ids/function bodies, 52 behavior ids, và browser structural identity. `npm run test:sim:semantic` gom scene identity + renderer contract. `tests/vii-checker-routes-deleted.test.js` khóa 6 Section VII checker routes không còn trong registry/contract. `npm run test:sim:release` là canonical full release gate, gồm unit + quality + browser + visual-quality + disposal + audit/equation strict checks.

## Quy ước vận hành

| Mục | Quy ước |
|---|---|
| Bundle offline | `js/pages.js` là file sinh tự động, không sửa tay |
| DOCX source of truth | `CoHocLyThuyet_Full_New.docx` quyết định text, outline, figure, reference |
| State client-side | `theme`, `fontZoom`, `readPages`, `quizScores`, `chlyt_progress`, `chlyt_bookmarks`, `chlyt_notes` |
| Chạy lại nav | Sau khi đổi fragment, luôn chạy `tools/update_nav.py` |
| Chạy audit | Luôn chạy `tools/audit.py` trước khi chốt bản build |
| Strict image publish | Chạy `tools/audit.py --strict-images` khi cần kiểm caption/alt/wrapper ảnh trước publish |

## Tài liệu tham chiếu

- [Project Overview & PDR](docs/project-overview-pdr.md)
- [Codebase Summary](docs/codebase-summary.md)
- [Code Standards](docs/code-standards.md)
- [System Architecture](docs/system-architecture.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Design Guidelines](docs/design-guidelines.md)
- [Project Roadmap](docs/project-roadmap.md)
- [Project Changelog](docs/project-changelog.md)
- [DOCX Sync Pipeline](docs/docx-sync-pipeline.md)

## Ghi chú

- Repo này có `package.json` cho QA dev-only; không có runtime bundler/build step.
- Repo này không có `pyproject.toml`, hoặc `requirements.txt`.
- Các script Python hiện có dùng trực tiếp theo command trong `tools/`.
- `index.html` có fallback KaTeX local trước, CDN sau.
- Bộ simulation professional dùng chung `SimProfessionalLab` cho 52 canonical route contracts; Section VII `BÀI TẬP` là content-only.
- Bản strict equation publish hiện dùng `data/equation_mapping.json` đã review đủ 702 rows.
