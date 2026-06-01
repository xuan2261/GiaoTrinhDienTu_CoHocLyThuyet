# Giáo trình điện tử Cơ Học Lý Thuyết

Giáo trình điện tử tĩnh cho môn Cơ Học Lý Thuyết, chạy trực tiếp bằng `HTML/CSS/JS`, phù hợp cho `file://`, USB offline, hoặc mở qua static server. Nguồn chuẩn nội dung hiện tại là `CoHocLyThuyet_Full_New.docx`.

## Chạy nhanh

| Mục | Cách làm |
|---|---|
| Mở offline | Mở `index.html` trực tiếp bằng browser |
| Chạy dev server | `python -m http.server 8000` rồi mở `http://localhost:8000/` |
| Làm mới nội dung | Chạy lại pipeline DOCX trong phần bên dưới |
| Cài QA browser dev-only | `npm install` rồi `npx playwright install chromium` |

## Cấu trúc chính

| Đường dẫn | Vai trò |
|---|---|
| `index.html` | Shell của ứng dụng, nạp CSS, KaTeX, `js/app.js`, `js/pages.js`, `js/loader.js`, các module phụ |
| `js/app.js` | Theme, search, breadcrumb, sidebar, font zoom, progress bar |
| `js/pages.js` | Bundle offline của fragment HTML và quiz JSON |
| `js/loader.js` | Route map, lazy load fragment, fallback bundle/fetch, render math, image tabs |
| `js/quiz.js` | Quiz engine, random mode, lưu điểm vào `localStorage` |
| `js/progress.js` | Theo dõi trang đã xem, bookmark, tiến trình đọc |
| `js/glossary.js` | Tooltip thuật ngữ |
| `js/notes.js` | Highlight và ghi chú cá nhân |
| `js/sim-physics-{statics,kinematics,dynamics}.js` | Nguồn công thức physics đã verify — đang được port sang `js/sim2/physics/` (engine SVG-first, đang rebuild) |
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

## QA (content + quiz)

Các lệnh này chỉ phục vụ phát triển/kiểm thử; runtime offline không phụ thuộc npm.

```powershell
npm run test:content
npm run test:quiz
npm run test:quiz:browser
npm run test:equations
npm run test:audit:strict
```

`test:content` khóa author-page content + Section VII cleanup. `test:quiz` validate quiz bank schema; `test:quiz:browser` render quiz qua Playwright. `test:equations` chạy phase equation checks; `test:audit:strict` kiểm caption/alt/wrapper ảnh + formula image.

## Mô phỏng (engine SVG-first)

Bộ 52 mô phỏng cũ đã được gỡ khỏi master (tag `archive/52-sims-pre-removal` giữ điểm quay đầu); thay bằng **25 mô phỏng "ít mà tinh"** dựng trên **engine SVG-first 3 tầng** tại `js/sim2/`: physics port UMD (chạy được Node + browser) · transform `world→screen` dùng chung · render SVG + nhãn HTML overlay tuyệt đối + canvas underlay tùy chọn (4 sim animation dày). Mount contract giữ nguyên `window.SIM_MAP[pageId] → factory(container) → { dispose }`; `loader.js` mount/dispose theo route. Manifest 25 route: `js/sim2/sim2-route-manifest.js`.

**Tầng UI dùng chung** (mọi sim cùng hưởng, DRY): `core/palette.js` (token màu `Sim2Palette` — đỏ=lực, lục=vận tốc, lam=gia tốc, tím=mô men…, mirror CSS `--sim-c-*`, tương phản ≥3:1 trên nền viewport); `core/panel.js` (panel lý thuyết: công thức KaTeX **tô màu khớp vector** + legend + readout sống tabular-nums + dòng quan sát); `core/controls.js` (control bar: slider có `<output>` + playback ▶/⏸/⏭/↺, **start paused** theo quy ước PhET). `sim-shell.js` thêm `setTheory()`/`addControls()`, panel luôn hiện cạnh viewport (xuống dưới khi hẹp). Slider ↔ drag-handle đồng bộ 2 chiều (`setValue` không bắn `input` → không vòng lặp). `dispose()` gỡ sạch cả listener slider.

**Tầng visual "Hybrid"** (chiều sâu DeCuong + tinh giản PhET): header thẻ qua `cfg.meta {name, section, chapter}` → tên sim + badge `§mục` gradient theo chương (ch1 lam / ch2 lục / ch3 tím) + nút ↺; vật thể khối (khối/bi/dầm/đĩa) dùng `gradient`+`depth` (fill gradient + drop-shadow, defs tạo 1 lần trong `createSvg`); nền play-area có lưới graph-paper mờ. Vector/đường/trục/nét đứt giữ phẳng (ít nhiễu). Tất cả opt-in: sim không khai báo `meta`/`depth` chạy y như cũ.

```powershell
npm run test:sim:physics    # node: physics port + transform + ch1/ch2/ch3 invariants + coverage + guards
npm run test:sim:mount      # playwright: ui-components + ui-coverage 25 route + mount + dispose hủy RAF
npm run test:sim:release    # physics + mount + content + quiz (gate offline)
```

`test:sim:physics` chạy 9 node test: port snapshot (verified-sticky), transform round-trip, physics dạng đóng 3 chương, visual-physics regression, coverage 25 route (đọc count từ manifest + guard 0 hex rải rác — phải dùng `Sim2Palette`), guard physics-cũ-đã-gỡ + sim-cũ-đã-gỡ. `test:sim:mount` mount 25 route qua `SIM_MAP`: `sim2-ui-components` (palette/controls/panel + dispose listener), `sim2-ui-coverage` (mọi route có panel + legend + readout + control), mount từng chương (nhãn DOM không chồng, canvas underlay khớp SVG ≤1px, sim động start-paused — test bấm ▶ trước khi assert chuyển động), dispose gỡ sạch listener+RAF+DOM. `test:sim:release` là gate tổng, chạy offline.

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
- Mô phỏng đang rebuild trên engine SVG-first (`js/sim2/`); Section VII `BÀI TẬP` là content-only. Xem `plans/260531-1249-rebuild-sims-25-svg-first-engine/`.
- Bản strict equation publish hiện dùng `data/equation_mapping.json` đã review đủ 702 rows.
