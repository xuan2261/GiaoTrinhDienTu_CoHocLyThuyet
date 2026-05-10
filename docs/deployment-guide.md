# Deployment Guide

File này mô tả cách chạy, regenerate, và chốt bản phát hành cho giáo trình điện tử tĩnh.

## Mô hình triển khai

| Mode | Khi dùng | Cách chạy |
|---|---|---|
| Offline file | Copy qua USB hoặc mở máy không có server | Mở `index.html` trực tiếp |
| Dev server | Cần fetch fallback hoặc test môi trường HTTP | `python -m http.server 8000` |
| Static hosting | Muốn publish nội dung tĩnh | Upload toàn bộ root build artifact |

## Prerequisites

| Thành phần | Vì sao cần |
|---|---|
| Browser hiện đại | Render HTML/CSS/JS, KaTeX, canvas |
| Python 3.x | Chạy script trong `tools/` |
| ImageMagick `magick` | Cần khi `extract_docx.py --write` phải convert media |
| `OMML2MML.XSL` | Cần khi `extract_docx.py --write` gặp OMML math |

Repo có `package.json` cho QA dev-only. Runtime phát hành vẫn là static files, không cần `node_modules/` hay server.

## Chạy local

### 1. Offline nhanh

```powershell
Start-Process .\index.html
```

### 2. Dev server

```powershell
python -m http.server 8000
```

Mở `http://localhost:8000/` để test chế độ fetch fallback.

## Update workflow

| Bước | Lệnh |
|---|---|
| Inspect DOCX | `python tools\analyze_docx.py --input CoHocLyThuyet_Full_New.docx --routes` |
| Extract | `python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --write` |
| Sync nav | `python tools\update_nav.py` |
| Bundle offline | `python tools\bundle_pages.py` |
| Audit | `python tools\audit.py` |
| Strict image audit | `python tools\audit.py --strict-images` |
| Strict equation audit | `python tools\audit.py --strict-equations` |

## Equation review flow

| Bước | Lệnh / file | Kết quả |
|---|---|---|
| Tạo queue | `python tools\export_equations_for_review.py --input tools\equation_report.json --output data\equation_mapping.template.json` | Template review |
| Prefill OCR | `python tools\ocr_equation_mapping.py --input data\equation_mapping.template.json --output data\equation_mapping.ocr.json --provider pix2tex` | Mapping nháp local-only |
| Auto-review OLE | `python tools\auto_review_equation_mapping.py --ruby C:\Ruby33-x64\bin\ruby.exe` | MathML từ Equation Native |
| Review offline | `python tools\build_equation_review_html.py --input data\equation_mapping.reviewed.json --output equation-review.html` | UI review local |
| Apply curated review | `python tools\apply_manual_equation_reviews.py` | Áp LaTeX manual/artifact triage |
| Merge publish | `python tools\merge_equation_mapping.py --base data\equation_mapping.json --reviewed data\equation_mapping.reviewed.json --output data\equation_mapping.json` | Mapping publish |

## Publish checklist

| Check | Expectation |
|---|---|
| `node --check` | Không có syntax error trong JS runtime files |
| `python -m compileall -q tools` | Tool scripts compile được |
| `python tools\audit.py` | Không có lỗi content thật; figure hợp lệ không bị tính warning |
| `python tools\audit.py --strict-images` | Pass khi image wrapper, file-size, caption, và alt metadata đã sẵn sàng publish |
| `python tools\audit.py --strict-equations` | Pass khi equation mapping đã đầy đủ |
| `python tools\smoke_simulation_routes.py` | Route wiring và coverage matrix khớp; representative route smoke pass |
| `python tools\smoke_simulation_runtime.py` | Simulation module order, registry, và lifecycle dispose contract pass |
| Browser smoke test | Home, chapter page, quiz, search, notes, simulations đều hoạt động |

## Troubleshooting

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Trang trắng khi mở file | `js/pages.js` chưa bundle hoặc script lỗi | Chạy lại bundle và kiểm `node --check` |
| Fragment không load qua HTTP | Sai route map hoặc file fragment thiếu | Chạy `tools/update_nav.py` rồi `tools/bundle_pages.py` |
| Ảnh missing | Asset export lỗi hoặc path sai | Chạy `tools/audit.py` và kiểm `chapters/`, `images/` |
| Strict image audit fail | Caption/alt/wrapper ảnh chưa đạt publish gate | Kiểm output `tools/audit.py --strict-images`, sửa pipeline hoặc regenerate từ DOCX |
| Công thức còn là ảnh fallback | Mapping chưa reviewed đủ | Hoàn tất review và strict audit |
| `extract_docx.py --write` fail | Thiếu `magick` hoặc `OMML2MML.XSL` | Cài dependency rồi chạy lại |

## Artifact cần copy khi phát hành

| Nhóm | File / thư mục |
|---|---|
| Shell | `index.html`, `css/`, `lib/`, `js/` |
| Content | `chapters/`, `images/`, `data/quiz-ch*.json`, `data/equation_mapping.json` |
| Docs tối thiểu | `README.md`, `docs/deployment-guide.md` |
| Maintainer-only | `tools/`, `docs/`, `plans/`, `tests/`, `package.json`, `package-lock.json`, `CoHocLyThuyet_Full_New.docx` |
| Không ship cho học viên | `.venv-ocr*/`, `node_modules/`, `backups/`, `Old/`, `test-results/`, `equation-review*.html`, `audit_gallery.html`, `repomix-output.xml`, OCR/review intermediate JSON |

## Ghi chú

- Không sửa tay `js/pages.js`.
- Không dùng `backups/` hay `Old/` làm nguồn phát hành.
- Nếu publish offline, hãy test đúng trên đường dẫn `file://` trước khi chốt.
