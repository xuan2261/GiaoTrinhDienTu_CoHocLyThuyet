---
title: "Phase 03 - OCR Sampling And Model Selection"
status: complete
priority: P1
effort: 5h
---

# Phase 03 - OCR Sampling And Model Selection

## Context Links

- [Research](./research/local-math-ocr-research.md)
- [Red Team](./reports/red-team-review.md)
- `data/equation_mapping.template.json`
- `equation-review.html`

## Overview

Run local OCR on a representative sample before full 702-row batch. Select provider and settings based on practical review quality.

## Key Insights

- Need samples across chapter, inline/display, short/long formulas.
- OCR quality must be judged visually, not only by schema validation.
- A bad model can waste review time across 702 rows.

## Requirements

Functional:
- Build 20 to 30 row sample.
- Include rows from all chapters and both inline/display kinds.
- Run `pix2tex`; optionally compare `Pix2Text`.
- Generate sample review HTML.

Non-functional:
- Keep sample files clearly named.
- Do not overwrite canonical `data/equation_mapping.ocr.json` until model selected.

## Architecture

```text
template -> sample json -> provider OCR -> sample OCR json -> sample review HTML -> model decision
```

## Related Code Files

Modify:
- None expected.

Create:
- `data/equation_mapping.sample.json`
- `data/equation_mapping.ocr.sample-pix2tex.json`
- Optional `data/equation_mapping.ocr.sample-pix2text.json`
- `equation-review-sample.html`

Delete:
- Temporary sample outputs after decision or keep under `backups/`.

## Implementation Steps

1. Create sample selection script only if needed. Prefer PowerShell or small one-off Python if no existing helper.
2. Include:
   - 5 rows chapter 1
   - 7 rows chapter 2
   - 7 rows chapter 3
   - at least 8 display formulas
   - repeated common symbols and long formulas
3. Run `pix2tex` sample:
   ```powershell
   .\.venv-ocr\Scripts\python.exe tools\ocr_equation_mapping.py --input data\equation_mapping.sample.json --output data\equation_mapping.ocr.sample-pix2tex.json --provider pix2tex
   ```
4. Build sample review UI:
   ```powershell
   python tools\build_equation_review_html.py --input data\equation_mapping.ocr.sample-pix2tex.json --output equation-review-sample.html
   ```
5. Open sample review UI, inspect each formula.
6. Record classification:
   - exact
   - minor edit
   - major edit
   - unusable
7. If exact + minor edit below threshold, test `Pix2Text`.
8. Choose provider for full batch.

## Todo List

- [x] Create sample queue.
- [x] OCR sample with `pix2tex`.
- [x] Generate sample review UI.
- [x] Score sample quality.
- [x] Decide full-batch provider.
- [x] Record decision in plan report.

## Success Criteria

- Chosen provider has >= 80 percent usable rows after minor edits, or decision documents why manual-heavy review is still acceptable.
- Sample output validates.
- No reviewed rows are produced automatically.

## Test And Validation

```powershell
python tools\validate_equation_mapping.py --input data\equation_mapping.ocr.sample-pix2tex.json
Select-String -Path equation-review-sample.html -Pattern "confidence"
```

Manual validation:
- KaTeX preview renders sample formulas.
- No obvious hallucinated prose.
- Vector/subscript/superscript notation checked.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Sample not representative | Force chapter/kind distribution |
| OCR looks valid but semantically wrong | Compare with original image |
| Long display equations poor | Flag for manual transcription batches |

## Security Considerations

- No cloud fallback in sample unless approved.
- Sample files contain textbook formulas only; keep local.

## Next Steps

Proceed to full batch with `pix2tex` rough prefill only. Manual-heavy review remains mandatory.
