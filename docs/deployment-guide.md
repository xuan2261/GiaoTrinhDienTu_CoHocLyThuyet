# Deployment Guide

## Chạy ứng dụng

| Mode | Cách chạy |
|---|---|
| Offline | Mở `index.html` trực tiếp |
| Local HTTP | `python -m http.server 8000`, mở `http://localhost:8000/` |
| Static hosting | Upload toàn bộ runtime artifact, giữ nguyên cấu trúc thư mục |

Runtime không cần Node, Python hoặc backend. Python và npm chỉ cần cho regenerate/QA.

## Regenerate từ DOCX

```powershell
python tools\analyze_docx.py --input CoHocLyThuyet_Full_New.docx --routes
python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
python tools\update_nav.py
python tools\bundle_pages.py
python tools\audit.py

# Chỉ khi source PDF hoặc PDF.js thay đổi
npm run build:pdf-assets
```

`extract_docx.py --write` có thể cần ImageMagick cho media và `OMML2MML.XSL` cho OMML. Extractor chuẩn hóa tên ảnh và bỏ placeholder `(.)`; không sửa output bằng tay.

## Publish checks

```powershell
python -m compileall -q tools
npm run test:content
npm run test:quiz
npm run test:quiz:browser
npm run test:sim:physics
npm run test:sim:mount
npm run test:sim:release
npm run test:sim3:pilot
npm run test:pdf:release
python tools\audit.py --strict-images
python tools\audit.py --strict-equations
```

`test:content` khóa route cleanup, gồm Chương 3 VII-4/VII-5/VII-6, và placeholder `(.)`. `test:sim:release` là gate Sim2 offline; Sim3 pilot có gate riêng.

## Artifact phát hành

| Ship | Không cần ship cho học viên |
|---|---|
| `index.html`, `.nojekyll`, `CoHocLyThuyet.pdf`, `css/`, `js/`, `lib/` gồm `lib/pdfjs/`, `chapters/`, `images/`, quiz data cần thiết | `node_modules/`, `tests/`, `tools/`, `plans/`, screenshots, review HTML, OCR intermediates, backups |

Bản phát hành hiện tại ngày 2026-08-12:

- `release/GiaoTrinhDienTu_CoHocLyThuyet_release_20260812/`
- `release/GiaoTrinhDienTu_CoHocLyThuyet_release_20260812.rar`
- RAR SHA-256: `4c96ca48115ff711866ae63f77209bdbb79b83fec3f9a0c2623fd2f3af0f6e65`.

Bản `20260701` được giữ nguyên làm artifact lịch sử. Folder và archive là artifact cùng bản phát hành. Không chỉnh trực tiếp package cũ; regenerate và tạo package ngày mới cho lần phát hành sau.

## Smoke test bàn giao

1. Mở `index.html` bằng `file://`.
2. Kiểm home, một trang mỗi chương, search, quiz, progress/notes.
3. Nhấn **Xem bản PDF**: trang đầu render canvas + text, chuyển trang/zoom/vừa chiều rộng/tải xuống hoạt động; Escape và Browser Back quay lại đúng bài.
4. Mount route Sim2 đại diện mỗi chương và đổi route để kiểm dispose.
5. Kiểm một route Sim3, mode toggle và fallback 2D nếu WebGL không sẵn sàng.
6. Xác nhận Chương 3 VII-4/VII-5/VII-6 không xuất hiện và không có text `(.)` đứng riêng.
7. Xác nhận ảnh load đúng từ tên asset đã chuẩn hóa.

## Troubleshooting

| Triệu chứng | Xử lý |
|---|---|
| Trang trắng qua `file://` | Regenerate `js/pages.js`, kiểm syntax/runtime console |
| Route hoặc breadcrumb lệch | Chạy `tools/update_nav.py`, rồi bundle lại |
| Ảnh thiếu | Chạy extractor và `audit.py --strict-images` |
| Công thức fallback sai | Hoàn tất equation review và strict equation audit |
| Sim3 blank | Kiểm Three.js vendored; route phải fallback về Sim2 |
| PDF viewer báo không mở được | Kiểm `CoHocLyThuyet.pdf`, toàn bộ `lib/pdfjs/`, `provenance.json`; rebuild bằng `npm run build:pdf-assets`, không thay bằng CDN |
