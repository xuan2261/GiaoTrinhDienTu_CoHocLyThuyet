# DOCX Sync Pipeline

Nguồn chuẩn hiện tại: `CoHocLyThuyet_Full_New.docx`.

## Commands

```powershell
python tools\analyze_docx.py --input CoHocLyThuyet_Full_New.docx --routes
python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --equation-report
python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
python tools\update_nav.py
python tools\bundle_pages.py
```

`tools\extract_all_images.py` có thể chạy khi cần đồng bộ lại ảnh, nhưng hiện nó dùng cùng pipeline với `extract_docx.py` để giữ figure và fragment khớp nhau.

## Equation handling

- Extractor render theo thứ tự `w:r` trong DOCX, không append toàn bộ image ở cuối paragraph.
- Legacy `Equation.DSMT4` và `Equation.3` được phân loại thành `math-img-inline` hoặc `math-img-block`, không render bằng `figure-container`.
- `figure-container` chỉ dành cho hình minh họa thật.
- `tools/equation_report.json` ghi từng media ref: `media`, `chapter`, `paragraph_index`, `prog_id`, `kind`, kích thước, output, hash.
- `data/equation_mapping.json` chứa mapping đã review từ hash sang `latex` hoặc `mathml`; mapping chưa `reviewed: true` không được dùng.
- `chapters/tac-gia.html` được regenerate từ front matter DOCX trước `MỤC LỤC`, không giữ trang tác giả redesigned khi DOCX còn là source of truth.
- Tạo file review template khi cần:

```powershell
python tools\export_equations_for_review.py --input tools\equation_report.json --output data\equation_mapping.template.json
```

## Phase 2 Semantic Math Flow

Pipeline Phase 2 ưu tiên local math OCR để prefill LaTeX, nhưng chỉ publish mapping đã review:

```powershell
python tools\validate_equation_mapping.py --input data\equation_mapping.template.json
python tools\ocr_equation_mapping.py --input data\equation_mapping.template.json --output data\equation_mapping.ocr.json --provider pix2tex
python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.json
python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.json --katex
python tools\auto_review_equation_mapping.py --ruby C:\Ruby33-x64\bin\ruby.exe
python tools\validate_equation_mapping.py --input data\equation_mapping.reviewed.json
python tools\build_equation_review_html.py --input data\equation_mapping.reviewed.json --output equation-review.html
```

`auto_review_equation_mapping.py` dùng local Ruby `mathtype_to_mathml_plus` để chuyển DOCX `Equation Native` OLE sang MathML. Chỉ row có MathML hợp lệ mới được đánh dấu `reviewed=true`; OCR-only row vẫn phải review thủ công. Fix publish hiện tại rebuild MathType MathML mapping qua Ruby subprocess UTF-8 để loại mojibake, sửa inline spacing quanh math, bỏ `display="block"` khỏi inline MathML, và validate MathML bằng allowlist trước publish. `tools/test_docx_equation_pipeline.py` khóa regression cho các điểm này. Nếu cần review tiếp, rebuild UI từ file reviewed một phần:

```powershell
python tools\build_equation_review_html.py --input data\equation_mapping.reviewed.json --output equation-review.html
```

Mở `equation-review.html` trực tiếp bằng browser, sửa LaTeX/MathML, tick `reviewed`, rồi export file `equation_mapping.reviewed.json` và đặt vào `data/equation_mapping.reviewed.json`.

Với các row đã được review/triage bằng dữ liệu cục bộ:

```powershell
python tools\apply_manual_equation_reviews.py --input data\equation_mapping.reviewed.json --reviews data\equation_manual_reviews.json --output data\equation_mapping.reviewed.json
python tools\validate_equation_mapping.py --input data\equation_mapping.reviewed.json --strict --katex
```

`artifact: "figure"` dùng cho media bị đưa vào equation queue nhưng thực chất là hình minh họa; extractor giữ nguyên hình. `artifact: "blank"` dùng cho placeholder trắng và extractor không render gì. Không dùng artifact để né review công thức thật.

```powershell
python tools\merge_equation_mapping.py --base data\equation_mapping.json --reviewed data\equation_mapping.reviewed.json --output data\equation_mapping.json
python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict --katex
python tools\test_docx_equation_pipeline.py
python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
python tools\update_nav.py
python tools\bundle_pages.py
python tools\audit.py --strict-equations
```

`ocr_equation_mapping.py --provider auto` ưu tiên local providers theo thứ tự `pix2tex`, `pix2text`, rồi mới fallback sang cloud API khi đã được approve rõ; chỉ dùng `auto` khi cloud fallback đã được approve rõ. Mặc định script reject OCR LaTeX không parse được bằng local KaTeX; dùng `--no-katex-check` chỉ khi cần debug raw OCR.
Nếu muốn ép không dùng API, chạy:

```powershell
python tools\ocr_equation_mapping.py --input data\equation_mapping.template.json --output data\equation_mapping.ocr.json --provider pix2tex
```

Cài local provider trong Python environment đang dùng, hoặc khuyến nghị tạo venv riêng cho OCR vì `pix2tex`/`pix2text` kéo thêm model/dependency nặng:

```powershell
python -m pip install pix2tex
# hoặc
python -m pip install pix2text
```

Venv riêng:

```powershell
python -m venv .venv-ocr
.\.venv-ocr\Scripts\python.exe -m pip install pix2tex
.\.venv-ocr\Scripts\python.exe tools\ocr_equation_mapping.py --input data\equation_mapping.template.json --output data\equation_mapping.ocr.json --provider pix2tex
```

Lần chạy local đầu có thể tải model weights về máy. Dùng `--dry-run` chỉ để tạo queue kiểm thử, không phải OCR thật.

Strict publish yêu cầu đủ 702 hash `reviewed=true` trong `data/equation_mapping.json`; row công thức có `latex` hoặc `mathml`, row không-phải-công-thức phải có artifact rõ. Khi strict pass, `chapters/` và `js/pages.js` không còn `math-img-inline` hoặc `math-img-block`; công thức legacy được render bằng `math-tex`, `math-tex-block`, `mathml-inline`, hoặc `mathml-block`.

`tools\audit.py` mặc định không còn warn figure `<img>` hợp lệ; section `IMAGE RENDERING` phải ghi figure count, unwrapped image count, và missing image count. Khi cần chốt publish image metadata, chạy thêm `python tools\audit.py --strict-images`. Gate này kiểm wrapper/file-size/caption/context/alt của ảnh local, chỉ tính caption gần trong boundary trước/sau của chính figure, caption nhóm cho các figure liền kề, hoặc nearby text context/evidence trong cùng cụm textbook figure; artifact-figure phải dùng reviewed alt.

## Validation

```powershell
node --check js\app.js
node --check js\loader.js
node --check js\pages.js
node --check js\quiz.js
node --check js\progress.js
node --check js\glossary.js
node --check js\notes.js
node --check js\simulations.js
python -m compileall -q tools
$env:PYTHONIOENCODING='utf-8'; python tools\test_docx_equation_pipeline.py
$env:PYTHONIOENCODING='utf-8'; python tools\audit.py
# Publish image-readiness gate.
$env:PYTHONIOENCODING='utf-8'; python tools\audit.py --strict-images
$env:PYTHONIOENCODING='utf-8'; python tools\audit.py --strict-equations
```

## Rules

- Không sửa tay `js/pages.js`; luôn regenerate bằng `tools\bundle_pages.py`.
- DOCX quyết định text, outline, hình, lời nói đầu, tài liệu tham khảo.
- Quiz và simulations là bổ trợ, không regenerate từ DOCX nếu DOCX không có dữ liệu A/B/C/D đầy đủ.
- Pipeline `--write` phải fail nếu thiếu ImageMagick cho media vector/WDP hoặc thiếu `OMML2MML.XSL` cho OMML math.
- Nếu ImageMagick không chuyển được media, kiểm `tools/image_mapping.json` để xem raw fallback và không publish output đó.
- `tools/audit.py` phải fail nếu `Equation.*` bị render như figure hoặc thiếu class math tương ứng.
- `tools/audit.py --strict-equations` phải fail cho tới khi tất cả equation image fallback được thay bằng mapping đã review.
- `tools/audit.py --strict-images` phải fail nếu ảnh local thiếu file, quá nhỏ, wrapper sai, figure thiếu caption hoặc nearby text context/evidence trong boundary ảnh/nhóm ảnh, hoặc artifact-figure còn alt generic.
