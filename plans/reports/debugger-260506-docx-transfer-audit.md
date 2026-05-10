# DOCX Transfer Audit - Investigation Report

## Executive Summary
- **Issue:** Kiểm tra `CoHocLyThuyet_Full_New.docx` đã chuyển đủ vào giáo trình điện tử chưa.
- **Scope:** Current files in `chapters/`, `images/`, `js/pages.js`, `data/equation_mapping.json`.
- **Status:** Main chapter pipeline synced; not exact release quality.
- **Root cause / gaps:** MathML encoding mojibake in published formulas; front matter before `LỜI NÓI ĐẦU` not transferred verbatim.
- **Fix recommended:** Repair MathML encoding at mapping/source script, regenerate chapters/bundle, decide front matter policy.

## Evidence

### DOCX baseline
- `python tools\analyze_docx.py --input CoHocLyThuyet_Full_New.docx --routes`
- Exit 0.
- DOCX: 2230 paragraphs, 844 media files, 17 OMML objects, 741 OLE equation objects.
- Outline: 3 chapters, 21 sections, 78 subsections.

### Pipeline/audit baseline
- `python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx`
- Exit 0 dry-run.
- Images expected/saved by pipeline: 835.
- Classes: math-inline 515, math-display 276, figure 134, unknown 0.
- Image conversion failures: 0.

- `python tools\audit.py --strict-equations`
- Exit 0.
- Summary: 99 audited content files, 49 OK, 50 warnings, 0 errors.
- Strict equations: no `math-img-inline` / `math-img-block`; mapping fully reviewed.

### Generated HTML parity
- In-memory rerender from DOCX via current extractor, no image conversion.
- Expected generated HTML files: 107.
- Missing current files: 0.
- HTML mismatch count: 0.
- Meaning: current generated fragments equal current DOCX pipeline output.

### Manifest/outline parity
- `tools/docx_site_manifest.json` matches DOCX structure.
- Mismatch count: 0.
- Counts: 3 chapters, 21 sections, 78 subsections.

### Images
- HTML scanned: 117 files.
- `<img>` tags: 136; unique src: 135.
- Missing image paths: 0.
- Math image fallback classes: 0.
- Equation report items: 925; output files missing: 0.
- Figure outputs: 134; figure outputs missing from HTML: 0.
- Artifact figures: 2 equation-classified media intentionally rendered as figures.
- `images/all/` has 634 extra old/raw images; not referenced by current generated pages.

### Equation mapping validation
- `python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict --katex`
- Exit 0.
- Rows: 702; unique hashes: 702; reviewed: 702; KaTeX checked: 53.

### Build/syntax checks
- `node --check` on `js/app.js`, `js/loader.js`, `js/pages.js`, `js/quiz.js`, `js/progress.js`, `js/glossary.js`, `js/notes.js`, `js/simulations.js`: exit 0.
- `python -m compileall -q tools`: exit 0.

## Findings

### F1 - Main chapter content is synced to current pipeline
- 107 generated fragments rerendered from DOCX match current files exactly.
- No missing generated route file in current `chapters/`.
- Manifest headings exact.

### F2 - Published formulas have mojibake encoding
- Found in published `chapters/` and `js/pages.js`.
- `chapters/`: 44 files affected, 1277 mojibake markers.
- `js/pages.js`: same 1277 markers because bundle copies fragments.
- `data/equation_mapping.json`: 1179 markers.
- Examples:
  - `â†’` should be `→`
  - `âˆ‘` should be `∑`
  - `â‡’` should be `⇒`
  - `âŠ¥` should be `⊥`
- Likely root cause: Ruby MathType converter output decoded by Python with Windows default encoding in `tools/auto_review_equation_mapping.py` (`subprocess.run(..., text=True)` without `encoding="utf-8"`).

### F3 - Front matter before `LỜI NÓI ĐẦU` not transferred verbatim
- DOCX has cover/admin/author/TOC text before paragraph 263.
- Checked 25 non-TOC front-matter units; 18 not found verbatim in `index.html` + `chapters/tac-gia.html`.
- Missing examples:
  - `QUÂN CHỦNG HẢI QUÂN`
  - `HỌC VIỆN HẢI QUÂN`
  - `KHÁNH HÒA - 2026`
  - `HỘI ĐỒNG THẨM ĐỊNH`
  - full author contribution lines from DOCX
- Current `chapters/tac-gia.html` is redesigned/summary, not source-verbatim.

### F4 - Inline math spacing needs QA
- Detected 69 cases `</span>` immediately followed by a letter.
- Detected 20 cases letter immediately followed by inline math span.
- Example: `\(\vec{F}\)</span>đối với tâm O`.
- This may render as stuck text around formulas.

## Conclusion

Không thể xác nhận "đã chuyển chính xác tuyệt đối từng từ, từng hình, từng công thức".

Confirmed:
- Chapter/section/subsection structure synced.
- Current generated HTML matches current DOCX extractor output.
- Referenced figures exist; no broken image paths.
- Equation fallback images removed; mapping fully reviewed by existing validator.

Not confirmed / failed:
- MathML symbols corrupted by mojibake in published output.
- Front matter before `LỜI NÓI ĐẦU` not verbatim.
- Inline math spacing has many suspicious cases.

## Recommendations

### P0
- Fix MathML encoding in `data/equation_mapping.json` / `data/equation_mapping.reviewed.json`.
- Patch `tools/auto_review_equation_mapping.py` to capture Ruby output as UTF-8.
- Add validator rule for mojibake sequences in MathML.
- Regenerate `chapters/` and `js/pages.js`; rerun strict audit.

### P1
- Decide front matter policy: verbatim DOCX cover/admin/author pages, or intentional web redesign.
- If verbatim required, add generated front matter pages instead of static `tac-gia.html`.

### P2
- Add spacing normalization around inline `mathml-inline` / `math-tex`.
- Clean unreferenced `images/all/` if release package should be minimal.

## Unresolved Questions
- Có cần chuyển nguyên văn toàn bộ front matter trước `LỜI NÓI ĐẦU`, gồm bìa, quyết định, hội đồng thẩm định, mục lục DOCX không?
- Có chấp nhận trang `Tác giả` dạng thiết kế lại, hay phải đúng từng dòng như DOCX?
