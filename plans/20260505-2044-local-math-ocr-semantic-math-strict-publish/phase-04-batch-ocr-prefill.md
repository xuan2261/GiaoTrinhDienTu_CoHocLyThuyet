---
title: "Phase 04 - Batch OCR Prefill"
status: complete
priority: P1
effort: 4h
---

# Phase 04 - Batch OCR Prefill

## Context Links

- [Phase 03](./phase-03-ocr-sampling-and-model-selection.md)
- `tools/ocr_equation_mapping.py`
- `data/equation_mapping.template.json`

## Overview

Run selected local OCR provider across all 702 unique hashes and produce the review queue.

## Key Insights

- Output is prefill only.
- Every row remains `reviewed=false`.
- Failed rows should stay in queue with notes, not disappear.
- OCR LaTeX that cannot render with local KaTeX must be rejected before manual review.

## Requirements

Functional:
- Run full OCR on `data/equation_mapping.template.json`.
- Output `data/equation_mapping.ocr.json`.
- Validate output.
- Reject KaTeX-invalid OCR output.
- Count non-empty LaTeX rows and failed rows.

Non-functional:
- Deterministic schema.
- No automatic publish.
- No API use unless explicitly approved.

## Architecture

```text
template 702 rows -> local OCR batch -> KaTeX filter -> ocr queue reviewed=false -> validation
```

## Related Code Files

Modify:
- `data/equation_mapping.ocr.json` via `tools/ocr_equation_mapping.py`.
- `tools/ocr_equation_mapping.py` to keep provider exceptions as row-level OCR failures.

Create:
- Optional backup `data/equation_mapping.ocr.before-local.json`.

Delete:
- None.

## Implementation Steps

1. Backup current OCR queue:
   ```powershell
   Copy-Item data\equation_mapping.ocr.json data\equation_mapping.ocr.before-local.json
   ```
2. Run batch:
   ```powershell
   .\.venv-ocr\Scripts\python.exe tools\ocr_equation_mapping.py --input data\equation_mapping.template.json --output data\equation_mapping.ocr.json --provider pix2tex --sleep 0
   ```
3. Validate:
   ```powershell
   python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.json
   ```
4. Reject KaTeX-invalid OCR rows:
   ```powershell
   Copy-Item data\equation_mapping.ocr.json data\equation_mapping.ocr.before-katex-filter.json
   python tools\ocr_equation_mapping.py --input data\equation_mapping.ocr.json --output data\equation_mapping.ocr.json --katex-filter-only
   python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.json --katex
   ```
5. Count output quality:
   ```powershell
   $rows = Get-Content -Raw data\equation_mapping.ocr.json | ConvertFrom-Json
   ($rows | Where-Object { $_.latex -and $_.latex.Trim() }).Count
   ($rows | Where-Object { $_.notes -match "OCR failed" }).Count
   ```
6. Regenerate review UI:
   ```powershell
   python tools\build_equation_review_html.py --input data\equation_mapping.ocr.json --output equation-review.html
   ```

## Todo List

- [x] Backup current OCR queue.
- [x] Run full local OCR.
- [x] Reject KaTeX-invalid OCR rows.
- [x] Validate OCR queue.
- [x] Count non-empty/failed rows.
- [x] Regenerate review UI.
- [x] Confirm no `confidence` field in generated HTML/export schema.

## Success Criteria

- `data/equation_mapping.ocr.json` has 702 rows.
- Unique hashes = 702.
- Reviewed = 0.
- Non-empty LaTeX = 563.
- Failed rows = 139.
- `python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.json --katex` passes.
- Review UI opens and previews formulas.

## Test And Validation

```powershell
python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.json
python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.json --katex
python tools\build_equation_review_html.py --input data\equation_mapping.ocr.json --output equation-review.html
Select-String -Path equation-review.html -Pattern "confidence"
```

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Batch crashes mid-run | Output only written after run; backup preserved |
| Many empty outputs | Continue review, but mark manual-heavy |
| Provider model state corrupt | Recreate `.venv-ocr` |

## Security Considerations

- Keep local-only provider.
- Do not set `OPENAI_API_KEY`/`GEMINI_API_KEY` unless cloud fallback approved.

## Next Steps

Proceed to manual review after queue validates.
