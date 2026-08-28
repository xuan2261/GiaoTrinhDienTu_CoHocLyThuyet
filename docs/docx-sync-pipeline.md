# DOCX Sync Pipeline

Nguồn chuẩn: `CoHocLyThuyet_Full_New.docx`.

## Luồng chuẩn

```powershell
python tools\analyze_docx.py --input CoHocLyThuyet_Full_New.docx --routes
python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --equation-report
python tools\gen_quiz_pages.py
python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
python tools\update_nav.py
python tools\bundle_pages.py
python tools\build_content_manifest.py
python tools\validate_content_manifest.py
python tools\build_search_index.py
python tools\audit.py
```

Extractor tạo `chapters/**`, `images/**`, `tools/docx_site_manifest.json` và equation report; trước mỗi run nó validate `data/chapter-reference.json`, render bảng tra cứu sau `.ov-sec`, và không nhận raw HTML author content. Manifest DOCX chỉ dùng logical source path, SHA-256 và generator metadata. `update_nav.py` tạo route/nav curated runtime maps cùng `window.CHAPTER_SECTIONS`; `bundle_pages.py` tạo `js/pages.js` cho `file://`; `build_content_manifest.py` tạo `data/content-manifest.json` từ manifest DOCX, chapter-reference provenance, map, bundle và fragments; validator kiểm joins/hash/provenance độc lập, không cần JSON-schema package.

`tools/docx_site_manifest.json` schema v1 intentionally replaces the legacy absolute `input` field with portable `source.logicalPath` and `source.sha256`. Repository consumers must use the versioned `source` object; no compatibility alias is emitted because absolute machine paths are forbidden release data.

Generated: `chapters/**`, `images/**`, `tools/docx_site_manifest.json`, `js/pages.js`, `data/content-manifest.json`, `data/search-index.json`, `js/search-index.js`. Curated: DOCX, `data/chapter-reference.json`, `data/quiz-*.json`, `js/sim2/sim2-route-manifest.js`, `data/equation_mapping.json` và source runtime. Chỉ sửa generated output qua generator tương ứng. `data/schemas/release-manifest.schema.json` là contract; builder, file inventory và package release thuộc Phase 10, chưa có trong pipeline này.

## Quy tắc nội dung hiện tại

- Tên asset ảnh được chuẩn hóa khi extract; WMF/EMF conversion phải byte-deterministic qua các lần build cùng source. Executable owner: `ImageWriter.asset_for` trong `tools/extract_docx.py`; regression guard: `tests/test_extract_docx_image_determinism.py`. Không đổi tên hoặc sửa output bằng tay.
- Asset không dùng không được giữ chỉ để bảo toàn path cũ.
- Placeholder số công thức `(.)` bị bỏ bởi extractor. `tests/no-placeholder-equation-numbers.test.js` kiểm cả source fragment và bundle.
- Route bài tập đã loại, gồm Chương 3 VII-4/VII-5/VII-6, không được sinh lại vào fragment, nav hoặc bundle.
- `chapters/tac-gia.html` lấy từ front matter DOCX.
- Quiz và simulation là dữ liệu bổ trợ, không tự sinh từ DOCX nếu nguồn không có schema tương ứng.

## Equation handling

Extractor giữ thứ tự run trong paragraph, phân loại equation và figure riêng. `data/equation_mapping.json` chỉ publish row `reviewed: true`; mapping hiện tại có 702 row đã review. `artifact: "figure"` dành cho hình bị phân loại nhầm vào queue; `artifact: "blank"` dành cho media trắng, không dùng để né review công thức.

Luồng review khi mapping thay đổi:

```powershell
python tools\export_equations_for_review.py --input tools\equation_report.json --output data\equation_mapping.template.json
python tools\validate_equation_mapping.py --input data\equation_mapping.template.json
python tools\auto_review_equation_mapping.py --ruby C:\Ruby33-x64\bin\ruby.exe
python tools\build_equation_review_html.py --input data\equation_mapping.reviewed.json --output equation-review.html
python tools\apply_manual_equation_reviews.py --input data\equation_mapping.reviewed.json --reviews data\equation_manual_reviews.json --output data\equation_mapping.reviewed.json
python tools\validate_equation_mapping.py --input data\equation_mapping.reviewed.json --strict --katex
python tools\merge_equation_mapping.py --base data\equation_mapping.json --reviewed data\equation_mapping.reviewed.json --output data\equation_mapping.json
```

OCR chỉ là prefill. Không publish OCR-only row chưa review. Cloud fallback chỉ dùng khi được phê duyệt rõ.

## Image handling

Figure publish dùng `<figure><img alt><figcaption></figure>`. Post-processor loại caption paragraph trùng và có thể gộp figure liền kề dùng chung caption. `--strict-images` kiểm file, kích thước, wrapper, alt, caption/context và artifact metadata.

## Validation

```powershell
node --check js\app.js
node --check js\loader.js
node --check js\pages.js
python -m compileall -q tools
npm run test:content
npm run test:equations
python tools\test_docx_equation_pipeline.py
python tools\audit.py
python tools\audit.py --strict-images
python tools\audit.py --strict-equations
```

## Không sửa tay

- `chapters/*.html`
- `images/`
- `tools/docx_site_manifest.json`
- `tools/equation_report.json`
- `js/pages.js`
- `data/content-manifest.json`

Nếu output sai, sửa DOCX, mapping, curated route data hoặc generator rồi regenerate. Không vá generated output.
