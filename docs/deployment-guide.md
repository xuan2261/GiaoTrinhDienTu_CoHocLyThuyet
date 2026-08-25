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
python tools\build_content_manifest.py
python tools\validate_content_manifest.py
python tools\build_search_index.py
python tools\audit.py

# Chỉ khi source PDF hoặc PDF.js thay đổi
npm run build:pdf-assets
```

`extract_docx.py --write` có thể cần ImageMagick cho media và `OMML2MML.XSL` cho OMML. Extractor chuẩn hóa tên ảnh và bỏ placeholder `(.)`; không sửa output bằng tay.

## Publish checks

```powershell
npm run test:content-manifest
npm run validate:traceability
npm run validate:academic-review
npm run test:academic-review
npm run test:traceability
python -m compileall -q tools
npm run test:content
npm run test:quiz
npm run test:quiz:browser
npm run test:sim:physics
npm run test:sim:mount
npm run test:sim:release
npm run test:sim:release:full
npm run test:sim:release:soak
npm run test:sim3:pilot
node tools/sim-validation/validate-simulation-drift.js --require-verified
npm run test:pdf:release
npm run test:search
npm run test:accessibility
python tools\audit.py --strict-images
python tools\audit.py --strict-equations
```

`test:content` khóa route cleanup, gồm Chương 3 VII-4/VII-5/VII-6, và placeholder `(.)`. `test:sim:release` là objective gate deterministic cho 25 Sim2 + 10 Sim3; `test:sim:release:full` tạo/validate fresh Sim2 + Sim3 capture, contact sheet, strict interaction probe và selective visual baseline. `test:sim:release:soak` chạy objective gate ba lần liên tiếp không retry. Snapshot chỉ cập nhật bằng `test:sim:visual:baseline:update` sau review actual/expected/diff; không chạy update trong publish automation.

Traceability is a publish check: technical provisional joins may pass validation, but formal academic/legal acceptance remains unavailable until the responsible review roles confirm the underlying legal and learning-outcome records and persist accepted evidence.

Academic review validation is a read-only integrity gate. It requires role/unit, independent, append-only reviewer records and root-confined evidence; it does not create an academic acceptance claim. Source, mapping, alt/caption/context, or output changes stale signoffs. The current review registry is pending/provisional.

Accessibility publish evidence gồm bốn `file://` Playwright specs và `data/accessibility-baseline.json`. Pass tự động không thay thế kiểm tra keyboard/screen reader/browser zoom/text spacing thủ công và không tạo chứng nhận WCAG 2.2 AA.

## Artifact phát hành

| Ship | Không cần ship cho học viên |
|---|---|
| `index.html`, `.nojekyll`, `CoHocLyThuyet.pdf`, `css/`, `js/`, `lib/` gồm `lib/pdfjs/`, `chapters/`, `images/`, `data/` gồm quiz/search index cần thiết | `node_modules/`, `tests/`, `tools/`, `plans/`, screenshots, review HTML, OCR intermediates, backups |

Bản candidate hiện tại:

- Staging: `release/2026.08.25-candidate/package/` (374 files).
- ZIP: `release/2026.08.25-candidate/co-hoc-ly-thuyet-2026.08.25-candidate.zip`.
- ZIP SHA-256: `6b48834ff3cfaddf29af6c0c83593e74ca4541c085da0bb8b1c36f128212cdbd`.
- QTI 3 pilot: `release/2026.08.25-candidate/derivatives/qti3-ch1-pilot.zip` (10 items), SHA-256 `99f6f1f73fee9daec8c531457a636cb25ba10941e8e7be88a3915c8d1b10455c`.
- Common Cartridge 1.4: `release/2026.08.25-candidate/derivatives/common-cartridge-1.4.imscc`, SHA-256 `08b4582630ef802b0fdecd46babb5008cc49cfff2a8230625c0d2c4547b8f1cb`.

Rebuild bằng `python tools/release/release.py --output-dir release/2026.08.25-candidate --version 2026.08.25-candidate --epoch 1787616000`; kiểm candidate đóng băng bằng `npm run test:release-candidate`. Đây là candidate, không phải final institutional release: academic review, independent accessibility review, independent candidate smoke review và Word round-trip còn blocked. Các release cũ giữ nguyên làm artifact lịch sử.

## Smoke test bàn giao

1. Mở `index.html` bằng `file://`.
2. Kiểm home, một trang mỗi chương, search, quiz, progress/notes.
3. Nhấn **Xem bản PDF**: trang đầu render canvas + text, chuyển trang/zoom/vừa chiều rộng/tải xuống hoạt động; Escape và Browser Back quay lại đúng bài.
4. Mount route Sim2 đại diện mỗi chương và đổi route để kiểm dispose.
5. Kiểm một route Sim3, mode toggle và fallback 2D nếu WebGL không sẵn sàng.
6. Keyboard-only: chạy skip link, mở/đóng mục lục bằng Escape, search, quiz review/reset, PDF focus restore, Sim2 slider/handle và Sim3 mode toggle.
7. Xác nhận Chương 3 VII-4/VII-5/VII-6 không xuất hiện và không có text `(.)` đứng riêng.
8. Xác nhận ảnh load đúng từ tên asset đã chuẩn hóa.

Ghi kết quả smoke độc lập vào `data/release-smoke-review.json`, gắn đúng version/SHA-256 candidate và evidence refs, rồi chạy `npm run test:release-smoke-review`. Browser smoke kỹ thuật do đội triển khai tự chạy không thay thế gate độc lập này.

## Troubleshooting

| Triệu chứng | Xử lý |
|---|---|
| Trang trắng qua `file://` | Regenerate `js/pages.js`, kiểm syntax/runtime console |
| Route hoặc breadcrumb lệch | Chạy `tools/update_nav.py`, rồi bundle lại |
| Ảnh thiếu | Chạy extractor và `audit.py --strict-images` |
| Công thức fallback sai | Hoàn tất equation review và strict equation audit |
| Sim3 blank hoặc mất 2D | Kiểm Three.js vendored và console fallback reason; thiếu Three/WebGL hoặc lỗi create/setup/update/render/resize phải dispose shell/GPU rồi giữ Sim2 với status tiếng Việt. Chạy `npm run test:sim3:pilot` và `npm run test:sim:release:full`. |
| PDF viewer báo không mở được | Kiểm `CoHocLyThuyet.pdf`, toàn bộ `lib/pdfjs/`, `provenance.json`; rebuild bằng `npm run build:pdf-assets`, không thay bằng CDN |
| Word round-trip blocked ở `exporting-pdf` | Mở `tmp/word-acceptance/word-roundtrip-evidence.json` và command capture để kiểm Word version/build, run ID, PID và failing stage. Gate chạy COM trong worker riêng, giới hạn 900 giây và dọn mọi automation process do lần chạy tạo ra; không đổi status thành pass nếu chưa có DOCX/PDF hash đầy đủ. |
