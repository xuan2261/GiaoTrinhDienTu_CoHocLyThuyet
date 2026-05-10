---
title: "Batch OCR Prefill Report"
description: "Phase 04 full local pix2tex OCR prefill results."
status: complete
created: 2026-05-06
---

# Batch OCR Prefill Report

## Summary

Full local rough prefill was run with `pix2tex`, then KaTeX-invalid OCR rows were rejected into failed row notes. This does not publish formulas. Every row remains `reviewed=false`.

```text
Input rows: 702
Provider successes: pix2tex=563
Processed: 563
Failed: 139
KaTeX rejected: 96
Reviewed: 0
```

## Commands

Backup:

```powershell
Copy-Item data\equation_mapping.ocr.json data\equation_mapping.ocr.before-local.json
Copy-Item data\equation_mapping.ocr.json data\equation_mapping.ocr.before-katex-filter.json
```

Batch OCR:

```powershell
.\.venv-ocr\Scripts\python.exe tools\ocr_equation_mapping.py --input data\equation_mapping.template.json --output data\equation_mapping.ocr.json --provider pix2tex --sleep 0
python tools\ocr_equation_mapping.py --input data\equation_mapping.ocr.json --output data\equation_mapping.ocr.json --katex-filter-only
```

Validation:

```powershell
python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.json
python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.json --katex
python tools\build_equation_review_html.py --input data\equation_mapping.ocr.json --output equation-review.html
Select-String -Path equation-review.html -Pattern "confidence"
```

## Validation Result

```text
Rows: 702
Unique hashes: 702
Reviewed: 0
KaTeX checked: 563
OK
confidence matches: 0
```

## Output Files

```text
data\equation_mapping.ocr.before-local.json
data\equation_mapping.ocr.before-katex-filter.json
data\equation_mapping.ocr.json
equation-review.html
```

## Implementation Note

`tools\ocr_equation_mapping.py` now catches provider-level exceptions per row. This was needed because `pix2tex` can throw OpenCV transform errors on individual images. Failed rows remain in the queue with `OCR failed: ...` notes.

`tools\validate_equation_mapping.py --katex` now verifies non-empty LaTeX through local KaTeX. `tools\ocr_equation_mapping.py` uses the same check by default and also supports `--katex-filter-only` for existing queues. The filter removed invalid OCR LaTeX from 96 rows and converted them to `OCR failed: KaTeX parse error ...` notes.

## Quality Note

Phase 03 sample showed `pix2tex` quality below the normal provider gate. The user re-ran `$ck:cook --tdd` on 2026-05-06, recorded as approval to continue with manual-heavy rough prefill only. It must not be merged into `data\equation_mapping.json` until all 702 rows are manually reviewed and strict validation passes.

## Unresolved Questions

- Who performs manual review for all 702 rows?
