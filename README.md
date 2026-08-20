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
| `js/{quiz,progress,glossary,notes}.js` | Tính năng học tập và state cục bộ |
| `js/sim2/` | Runtime mô phỏng canonical SVG-first, 25 route |
| `js/sim3/` | Pilot Three.js tùy chọn cho 10 route, Sim2 vẫn mặc định |
| `js/pdf-viewer*.js`, `lib/pdfjs/` | Trình đọc PDF.js nội tuyến và artifact runtime/data local |
| `chapters/`, `images/` | Nội dung và ảnh sinh từ DOCX |
| `assets/gifs/` | 20 GIF phát hành, tách khỏi ảnh PNG canonical trong `images/` |
| `data/` | Quiz và equation mapping |
| `tools/` | Pipeline đồng bộ, bundle và audit |
| `tests/` | QA dev-only |

PDF viewer chỉ nạp `lib/pdfjs/pdfjs-runtime.iife.min.js` và `pdf-data.js` sau lần nhấn đầu tiên. Bản PDF mở trong dialog toàn màn hình với chuyển/nhập trang, zoom, vừa chiều rộng, tải xuống, Escape và Browser Back; không đổi route hoặc trạng thái bài học. Không có tìm kiếm, thumbnail, annotation hay bookmark riêng cho PDF.

Hai mươi hình cơ học đã chọn có bản GIF trong `assets/gifs/`. Runtime chỉ thay đúng ảnh có trong manifest `js/gif-figures.js`; nút **Ảnh động** đổi đồng thời giữa GIF và PNG, lưu lựa chọn cục bộ và mặc định dùng PNG khi hệ điều hành bật `prefers-reduced-motion: reduce`. Nếu GIF lỗi, ảnh tự trở về PNG.

## Đồng bộ DOCX

```powershell
python tools\analyze_docx.py --input CoHocLyThuyet_Full_New.docx --routes
python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
python tools\update_nav.py
python tools\bundle_pages.py
python tools\audit.py
```

Extractor chuẩn hóa tên asset ảnh khi xuất và bỏ placeholder số công thức `(.)`. Sau khi đổi nội dung, `npm run test:content` bảo vệ cả cleanup route Section VII và placeholder này. Chi tiết semantic math và image publish gate xem [DOCX Sync Pipeline](docs/docx-sync-pipeline.md).

## QA

Các lệnh chỉ phục vụ phát triển, runtime phát hành không phụ thuộc npm.

```powershell
npm run test:content
npm run test:quiz
npm run test:quiz:browser
npm run test:equations
npm run test:audit:strict
npm run test:gif
npm run test:sim:physics
npm run test:sim:mount
npm run test:sim:release
npm run test:sim3:pilot
npm run test:pdf:release
```

`test:sim:release` chạy physics, mount, app, content và quiz. Visual capture/baseline là luồng dev-only riêng.

Khi `CoHocLyThuyet.pdf` hoặc phiên bản PDF.js thay đổi, chạy `npm run build:pdf-assets`; không sửa tay file trong `lib/pdfjs/`. `test:pdf:release` kiểm provenance/vendor, transport `file://` + HTTP, viewer và các regression app/content.

## Mô phỏng

Sim2 là runtime canonical với 25 route, khai báo tại `js/sim2/sim2-route-manifest.js`. Engine dùng physics UMD, transform world-to-screen, SVG, HTML overlay và canvas underlay tùy chọn. Contract mount là `window.SIM_MAP[pageId] -> factory(container) -> { dispose }`.

Sim3 là pilot 3D tùy chọn cho 10 route: `ch1-1-5`, `ch1-5-3`, `ch2-1-3`, `ch2-2-2`, `ch2-3-2`, `ch2-4-4`, `ch2-5-3`, `ch3-1-3`, `ch3-5-3`, `ch3-6-2`. Three.js được vendored tại `lib/three/three.umd.min.js`; nếu WebGL lỗi, route quay về Sim2.

Bộ canvas `.sim-lab` 52 route là lịch sử, đã gỡ khỏi master và chỉ được giữ ở tag `archive/52-sims-pre-removal`.

## Trạng thái nội dung và phát hành

- Các route bài tập Chương 3 Section VII-4, VII-5 và VII-6 đã được loại khỏi nội dung/runtime hiện tại.
- Tên file ảnh đã được chuẩn hóa và các asset không dùng đã được dọn khỏi nguồn hiện tại.
- Placeholder `(.)` được extractor bỏ qua và được khóa bằng `tests/no-placeholder-equation-numbers.test.js`.
- Bản phát hành GIF ngày 2026-08-16 có tại `release/GiaoTrinhDienTu_CoHocLyThuyet_release_20260816/` và file `.zip` cùng tên. Các bản `20260812` và `20260701` được giữ nguyên làm lịch sử.

## Quy ước vận hành

- Không sửa tay `chapters/*.html`, `images/`, `js/pages.js` hoặc manifest sinh tự động.
- Khi fragment đổi, chạy `tools/update_nav.py`, `tools/bundle_pages.py` và `tools/audit.py`.
- Dùng `tools/audit.py --strict-images` và `--strict-equations` khi chốt publish.
- State browser giữ trong `localStorage`: `theme`, `fontZoom`, `gifMotionEnabled`, `quizScores`, `chlyt_progress`, `chlyt_bookmarks`, `chlyt_notes`.
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
